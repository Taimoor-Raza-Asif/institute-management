import asyncHandler from 'express-async-handler';
import xlsx from 'xlsx';
import Bill from '../models/Bill.js';
import Donation from '../models/Donation.js';

// Utility: parse buffer with xlsx and return array of row objects
function parseBufferToJson(buffer, filename) {
  // Try to detect extension from filename if available
  const ext = (filename || '').split('.').pop().toLowerCase();
  // Read workbook with cellDates so Excel date cells are parsed
  let workbook;
  try {
    workbook = xlsx.read(buffer, { type: 'buffer', raw: false, cellDates: true });
  } catch (e) {
    console.error('xlsx.read failed for file', filename, 'error:', e && e.message);
    throw e;
  }

  // prefer first sheet with data
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Read raw rows (arrays) so we can detect header row even if it's not the very first row
    const raw = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    // Debug logging: show sheet name and first few raw rows
    try {
      const sampleRows = raw.slice(0, 6);
      console.debug(`Import parse: file=${filename} sheet=${sheetName} rows=${raw.length} sample=${JSON.stringify(sampleRows)}`);
    } catch (e) {
      console.debug('Import parse: could not stringify sample rows', e && e.message);
    }
    if (!Array.isArray(raw) || raw.length === 0) continue;

    // Find the best header row within the first 10 rows: prefer the row with the most non-empty string cells
    let headerRowIndex = 0;
    let bestScore = -1;
    const maxCheck = Math.min(raw.length, 10);
    for (let i = 0; i < maxCheck; i++) {
      const row = raw[i] || [];
      let score = 0;
      for (const cell of row) {
        if (cell !== null && cell !== undefined && String(cell).trim() !== '') score++;
      }
      if (score > bestScore) {
        bestScore = score;
        headerRowIndex = i;
      }
    }

    const headersRaw = raw[headerRowIndex] || [];
    const headers = headersRaw.map((h, idx) => {
      const txt = (h === null || h === undefined) ? '' : String(h).trim();
      if (!txt) return `Column${idx+1}`;
      return txt;
    });

    const dataRows = [];
    for (let r = headerRowIndex + 1; r < raw.length; r++) {
      const rowArr = raw[r] || [];
      // skip totally empty rows
      const allEmpty = rowArr.every(c => c === null || c === undefined || String(c).trim() === '');
      if (allEmpty) continue;
      const obj = {};
      for (let c = 0; c < headers.length; c++) {
        const key = headers[c] || `Column${c+1}`;
        obj[key] = rowArr[c] === undefined ? '' : rowArr[c];
      }
      dataRows.push(obj);
    }

    if (dataRows.length > 0) return dataRows;
    // if no dataRows, fallback to sheet_to_json with header mapping
    const fallback = xlsx.utils.sheet_to_json(worksheet, { defval: '', raw: false, cellDates: true });
    if (Array.isArray(fallback) && fallback.length > 0) return fallback.map(row => {
      const out = {};
      let colIndex = 0;
      for (const h of Object.keys(row)) {
        const key = (h && String(h).trim()) || `Column${++colIndex}`;
        out[key] = row[h];
      }
      return out;
    });
  }

  // If no data found, return empty array
  return [];
}

// Basic type detection (very simple heuristics)
function detectType(value) {
  if (value === null || value === undefined || value === '') return 'empty';
  const s = String(value).trim();
  // number (with commas or currency symbols)
  if (/^[\$£€]?\s?[\d,]+(\.\d+)?$/.test(s)) return 'number';
  // date-ish
  if (/^\d{1,4}[\-/.]\d{1,2}[\-/.]\d{1,4}$/.test(s) || /[A-Za-z]{3,}/.test(s)) return 'date';
  return 'string';
}

// POST /api/import/:entity/preview
const previewImport = asyncHandler(async (req, res) => {
  const { entity } = req.params;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const buffer = req.file.buffer;
  let rows;
  try {
    rows = parseBufferToJson(buffer, req.file.originalname);
  } catch (err) {
    console.error('Error parsing import file:', err);
    return res.status(400).json({ message: 'Failed to parse file: ' + (err.message || String(err)) });
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'No data found in uploaded file' });
  }

  const headers = Object.keys(rows[0]);
  // sample first 5 rows
  const sample = rows.slice(0, 5);
  // detect types per header based on sample
  const types = {};
  headers.forEach(h => {
    const vals = sample.map(r => r[h]);
    const detected = vals.map(detectType);
    // pick most common
    const mode = detected.sort((a,b) => detected.filter(v=>v===a).length - detected.filter(v=>v===b).length).pop();
    types[h] = mode || 'string';
  });

  return res.json({ headers, rows: sample, types, entity });
});

// Helper to normalize number string to Number
function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val).replace(/[^0-9.\-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Helper to parse dates
function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (!isNaN(d)) return d;
  // try mm/dd/yyyy or dd-mm-yyyy using regex
  const s = String(val).trim();
  const parts1 = s.split(/[\/-]/);
  if (parts1.length === 3) {
    // try common orders
    let dtry = new Date(parts1.join('-'));
    if (!isNaN(dtry)) return dtry;
    // fallback try swapping
    dtry = new Date(`${parts1[2]}-${parts1[1]}-${parts1[0]}`);
    if (!isNaN(dtry)) return dtry;
  }
  return null;
}

// Map and validate row into model-specific object
function buildRecordFromRow(entity, row, mapping, userId) {
  const out = {};
  for (const [col, target] of Object.entries(mapping)) {
    if (!target || target === 'ignore') continue;
    const raw = row[col];
    if (target.toLowerCase().includes('date')) {
      const dt = parseDate(raw);
      out[target] = dt;
    } else if (/amount|price|total/i.test(target) || target.toLowerCase().includes('amount')) {
      out[target] = parseNumber(raw);
    } else {
      out[target] = raw === undefined || raw === null ? '' : String(raw).trim();
    }
  }
  // set markedBy where applicable
  if (entity === 'billing') {
    out.markedBy = userId;
    // default category
    if (!out.category) out.category = 'Other';
    // default required minimal fields handled later
  }
  if (entity === 'donation') {
    out.markedBy = userId;
    if (!out.donorName) out.donorName = 'Anonymous';
  }
  return out;
}

// POST /api/import/:entity/commit
const commitImport = asyncHandler(async (req, res) => {
  const { entity } = req.params;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const mappingRaw = req.body.mapping || '{}';
  let mapping;
  try { mapping = JSON.parse(mappingRaw); } catch (e) { mapping = {}; }

  const buffer = req.file.buffer;
  const rows = parseBufferToJson(buffer, req.file.originalname);
  if (!Array.isArray(rows)) return res.status(400).json({ message: 'Could not parse file rows' });

  const validDocs = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const doc = buildRecordFromRow(entity, row, mapping, req.user._id);
      // model-specific validation
      if (entity === 'billing') {
        // ensure required fields: title, amount, billDate
        if (!doc.title) throw new Error(`Row ${i+1}: title is required`);
        if (doc.amount == null) throw new Error(`Row ${i+1}: amount is required or invalid`);
        if (!doc.billDate) throw new Error(`Row ${i+1}: billDate is required or invalid`);
        // coerce category/status defaults
        if (!['Utilities','Kitchen','Vendor Payment','Repairs','Other'].includes(doc.category)) doc.category = 'Other';
        if (!['Paid','Unpaid','Partial'].includes(doc.status)) doc.status = 'Unpaid';
        validDocs.push(doc);
      } else if (entity === 'donation') {
        if (doc.donationAmount == null) throw new Error(`Row ${i+1}: donationAmount is required or invalid`);
        if (!doc.donationPurpose) throw new Error(`Row ${i+1}: donationPurpose is required`);
        if (!doc.donationDate) throw new Error(`Row ${i+1}: donationDate is required or invalid`);
        // payment method normalization
        const pm = String(doc.paymentMethod || '').toLowerCase();
        if (!['cash','bank transfer','cheque','online gateway'].some(v => pm.includes(v) || v.includes(pm))) {
          // leave as provided; model will validate on insert
        }
        validDocs.push(doc);
      } else {
        throw new Error('Unsupported entity');
      }
    } catch (err) {
      errors.push(err.message || String(err));
    }
  }

  // Insert validDocs into DB
  let inserted = 0;
  try {
    if (validDocs.length > 0) {
      if (entity === 'billing') {
        const resDocs = await Bill.insertMany(validDocs.map(d => ({ ...d })), { ordered: false });
        inserted = resDocs.length;
      } else if (entity === 'donation') {
        const resDocs = await Donation.insertMany(validDocs.map(d => ({ ...d })), { ordered: false });
        inserted = resDocs.length;
      }
    }
  } catch (insertErr) {
    // insertMany may throw bulk write errors; attempt to extract inserted count
    if (insertErr && insertErr.insertedDocs) inserted = insertErr.insertedDocs.length;
    errors.push(insertErr.message || String(insertErr));
  }

  return res.json({ inserted, skipped: rows.length - validDocs.length, errors });
});

export { previewImport, commitImport };
