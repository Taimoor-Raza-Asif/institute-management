import asyncHandler from 'express-async-handler';
import Bill from '../models/Bill.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';

// Helper function to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/bill_attachments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// The `upload` middleware is now exported directly
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Optional: Validate file types
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  }
}).single('attachment'); // 'attachment' is the field name in the form

// @desc    Add a new bill
// @route   POST /api/billing
// @access  Private/Admin & Accountant
const addBill = asyncHandler(async (req, res) => {
  const { title, category, amount, status, billDate, paymentDate, paymentMethod, paidTo, remarks, meta } = req.body;

  const newBill = new Bill({
    title,
    category,
    amount,
    status,
    billDate,
    paymentDate,
    paymentMethod,
    paidTo,
    remarks,
    meta: meta ? JSON.parse(meta) : {},
    attachmentPath: req.file ? `/uploads/bill_attachments/${req.file.filename}` : null,
    markedBy: req.user._id,
  });

  const createdBill = await newBill.save();
  res.status(201).json(createdBill);
});

// @desc    Get all bills with filters
// @route   GET /api/billing
// @access  Private/Admin & Accountant
const getBills = asyncHandler(async (req, res) => {
  const { category, status, startDate, endDate } = req.query;
  const query = {};

  if (category) query.category = category;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.billDate = {};
    if (startDate) query.billDate.$gte = new Date(startDate);
    if (endDate) query.billDate.$lte = new Date(endDate);
  }

  const bills = await Bill.find(query).populate('markedBy', 'cnic name role');
  res.json(bills);
});

// @desc    Get a single bill by ID
// @route   GET /api/billing/:id
// @access  Private/Admin & Accountant
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('markedBy', 'cnic name role');
  if (bill) {
    res.json(bill);
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Update a bill
// @route   PUT /api/billing/:id
// @access  Private/Admin & Accountant
const updateBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (bill) {
    bill.title = req.body.title || bill.title;
    bill.category = req.body.category || bill.category;
    bill.amount = req.body.amount || bill.amount;
    bill.status = req.body.status || bill.status;
    bill.billDate = req.body.billDate || bill.billDate;
    bill.paymentDate = req.body.paymentDate || bill.paymentDate;
    bill.paymentMethod = req.body.paymentMethod || bill.paymentMethod;
    bill.paidTo = req.body.paidTo || bill.paidTo;
    bill.remarks = req.body.remarks || bill.remarks;
    bill.meta = req.body.meta ? JSON.parse(req.body.meta) : bill.meta;

    // If there's a new file, update the attachment
    if (req.file) {
      if (bill.attachmentPath) {
        fs.unlink(path.join(__dirname, '..', bill.attachmentPath), (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      bill.attachmentPath = `/uploads/bill_attachments/${req.file.filename}`;
    }

    const updatedBill = await bill.save();
    res.json(updatedBill);
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Delete a bill
// @route   DELETE /api/billing/:id
// @access  Private/Admin & Accountant
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);

  if (bill) {
    if (bill.attachmentPath) {
      fs.unlink(path.join(__dirname, '..', bill.attachmentPath), (err) => {
        if (err) console.error('Error deleting old file:', err);
      });
    }
    await bill.deleteOne();
    res.json({ message: 'Bill removed' });
  } else {
    res.status(404);
    throw new Error('Bill not found');
  }
});

// @desc    Download a bill receipt/summary
// @route   GET /api/billing/:id/receipt
// @access  Private/Admin & Accountant
const downloadReceipt = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('markedBy', 'cnic name role');
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  const doc = new jsPDF({ format: 'a4' });
  const filename = `${bill.title.replace(/\s/g, '_')}_Bill_Summary_${new Date(bill.billDate).toLocaleDateString()}.pdf`;

  const drawBillSummary = (xStart, yStart) => {
    let yPos = yStart;
    const padding = 10;
    const pageMargin = 20;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Bright Future Institute', pageMargin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('123 Education St, Knowledge City', pageMargin, yPos);
    yPos += 5;
    doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', pageMargin, yPos);
    yPos += 15;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 167, 69);
    doc.text('Bill Summary', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.line(pageMargin, yPos, doc.internal.pageSize.getWidth() - pageMargin, yPos);
    yPos += padding;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text('Bill Details', pageMargin, yPos);
    yPos += padding;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const addField = (label, value) => {
      doc.text(`${label}:`, pageMargin, yPos);
      doc.text(`${value}`, pageMargin + 50, yPos);
      yPos += 6;
    };

    addField('Bill Title', bill.title);
    addField('Category', bill.category);
    addField('Amount', `PKR ${parseFloat(bill.amount).toFixed(2)}`);
    addField('Status', bill.status);
    addField('Bill Date', new Date(bill.billDate).toLocaleDateString());
    if (bill.status !== 'Unpaid') {
      addField('Payment Date', new Date(bill.paymentDate).toLocaleDateString());
      addField('Payment Method', bill.paymentMethod);
    }
    addField('Paid To', bill.paidTo || 'N/A');
    addField('Remarks', bill.remarks || 'N/A');
    yPos += padding;

    doc.line(pageMargin, yPos, doc.internal.pageSize.getWidth() - pageMargin, yPos);
    yPos += padding;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Transaction Information', pageMargin, yPos);
    yPos += padding;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    addField('Entered By', bill.markedBy?.name || bill.markedBy?.cnic || 'N/A');
    addField('Created At', new Date(bill.createdAt).toLocaleString());
    yPos += padding;

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer-generated summary. No signature is required.', pageMargin, doc.internal.pageSize.getHeight() - 15);
  };
  
  drawBillSummary(0, 20);

  const pdfBuffer = doc.output('arraybuffer');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(pdfBuffer));
});




// @desc    Get aggregated billing reports
// @route   GET /api/billing/reports
// @access  Private/Admin & Accountant
export const getBillReports = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const matchFilter = { paymentDate: { $ne: null } };

  if (year) {
    matchFilter.$expr = { $eq: [{ $year: "$paymentDate" }, parseInt(year)] };
  }

  try {
    const monthlyReport = await Bill.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
          totalPaid: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const categoryReport = await Bill.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1
        }
      }
    ]);

    res.status(200).json({ monthlyReport, categoryReport });
  } catch (error) {
    console.error("Error fetching bill reports:", error);
    res.status(500).json({ message: 'Failed to fetch bill reports', error: error.message });
  }
});

export { addBill, getBills, getBillById, updateBill, deleteBill, downloadReceipt, upload};