import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { DocumentArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const TARGET_FIELDS = {
  billing: [
    'title', 'category', 'amount', 'status', 'billDate', 'paidTo', 'remarks'
  ],
  donation: [
    'donorName', 'donationAmount', 'donationPurpose', 'donationDate', 'paymentMethod', 'cnic', 'contactNumber', 'emailAddress'
  ]
};

const humanFileSize = (size) => {
  if (!size) return '';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B','KB','MB','GB'][i];
};

const FileImportModal = ({ isOpen, onClose, entityType = 'billing', onComplete }) => {
  const { currentTheme } = useTheme();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState({});
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setMapping({});
      setResult(null);
    }
  }, [isOpen]);

  const handleFileSelect = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(ext)) {
      alert('Please upload a CSV or Excel file.');
      return;
    }
    setFile(f);
    const form = new FormData();
    form.append('file', f);
    try {
      setLoading(true);
      const res = await api.post(`/import/${entityType}/preview`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPreview(res.data);
      const headers = res.data.headers || [];
      const initial = {};
      headers.forEach(h => { initial[h] = 'ignore'; });
      headers.forEach(h => {
        const key = h.toLowerCase();
        const candidates = TARGET_FIELDS[entityType];
        const matched = candidates.find(c => key.includes(c.toLowerCase()) || (c === 'amount' && /amount|total|price/i.test(key)));
        if (matched) initial[h] = matched;
      });
      setMapping(initial);
    } catch (err) {
      console.error('Preview error', err, err.response?.data);
      const msg = err.response?.data?.message || 'Failed to parse file preview.';
      // show message in preview area
      setPreview({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleFileChange = (e) => handleFileSelect(e.target.files[0]);

  const handleMappingChange = (header, value) => setMapping(prev => ({ ...prev, [header]: value }));

  const handleCommit = async () => {
    if (!file || !preview) return alert('Please select a file and preview it first.');
    const form = new FormData();
    form.append('file', file);
    form.append('mapping', JSON.stringify(mapping));
    try {
      setLoading(true);
      const res = await api.post(`/import/${entityType}/commit`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const targetFields = TARGET_FIELDS[entityType] || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || 'border'} rounded-lg p-4`}> 
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-md ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || ''}`}>
            <DocumentArrowUpIcon className={`h-6 w-6 ${currentTheme?.heroIcon || 'text-emerald-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${currentTheme?.heroTitle || ''}`}>Import {entityType === 'billing' ? 'Bills' : 'Donations'}</h3>
            <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>Upload a CSV or Excel file, map columns to fields and import data into the system.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${currentTheme?.title || ''}`}>File</label>
            <div onDrop={onDrop} onDragOver={(e)=>e.preventDefault()} className={`mt-2 border-dashed rounded-md p-4 flex items-center justify-center cursor-pointer ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'}`} onClick={() => inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} className="hidden" />
              <div className="text-center">
                <DocumentTextIcon className={`h-8 w-8 mx-auto ${currentTheme?.iconText || 'text-gray-400'}`} />
                <p className={`text-sm mt-2 ${currentTheme?.mutedText || 'text-gray-600'}`}>Drop your file here or <span className={`underline ${currentTheme?.btnPrimaryText || 'text-emerald-700'}`}>browse</span></p>
                {file && (<div className={`mt-2 text-sm ${currentTheme?.text || 'text-gray-800'}`}>{file.name} • {humanFileSize(file.size)}</div>)}
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Accepted: .csv, .xls, .xlsx • Max recommended size: 10MB</div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${currentTheme?.title || ''}`}>Preview</label>
            <div className={`mt-2 rounded-md overflow-auto ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'} p-2 max-h-48`}>
              {loading && <div className="text-sm text-gray-500">Parsing preview...</div>}
              {!preview && !loading && <div className={`text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>No file selected.</div>}
              {preview && preview.error && (
                <div className="text-sm text-red-600">{preview.error}</div>
              )}
              {preview && !preview.error && ( (preview.headers || []).length === 0 || (preview.rows || []).length === 0) && (
                <div className="text-sm text-gray-600">No data found in the uploaded file. Try opening the file and ensuring the header row is present, or try selecting a different sheet (if the file has multiple sheets).</div>
              )}
              {preview && !preview.error && (preview.headers || []).length > 0 && (preview.rows || []).length > 0 && (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {(preview.headers || []).map(h => (
                        <th key={h} className={`px-2 py-1 text-left font-medium ${currentTheme?.theadText || ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(preview.rows || []).slice(0,5).map((r, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        {(preview.headers || []).map(h => <td key={h} className="px-2 py-1 align-top">{String(r[h] ?? '').slice(0,60)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <h4 className={`text-sm font-medium ${currentTheme?.title || ''}`}>Map Columns</h4>
            <div className="mt-2 grid gap-2">
              {(preview.headers || []).map(h => (
                <div key={h} className={`flex items-center justify-between gap-3 p-2 rounded ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || 'border border-gray-100'}`}>
                  <div className="text-sm text-gray-700 truncate w-1/2">{h}</div>
                  <select value={mapping[h] || 'ignore'} onChange={(e) => handleMappingChange(h, e.target.value)} className={`ml-2 p-2 rounded border ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputBorder || 'border-gray-300'}`}>
                    <option value="ignore">-- Ignore --</option>
                    {targetFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className={`px-4 py-2 rounded ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} border ${currentTheme?.btnSecondaryBorder || 'border-emerald-200'}`}>Cancel</button>
          <button disabled={!preview || loading} onClick={handleCommit} className={`px-4 py-2 rounded ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'}`}>Import</button>
        </div>

        {result && (
          <div className="mt-4 p-3 rounded-md bg-green-50 border border-green-100 text-sm">
            <div className="font-medium">Import result</div>
            <div>Inserted: {result.inserted || 0} • Skipped: {result.skipped || 0}</div>
            {result.errors && result.errors.length > 0 && <div className="mt-2 text-red-700">Errors: {result.errors.length} (see console)</div>}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FileImportModal;
