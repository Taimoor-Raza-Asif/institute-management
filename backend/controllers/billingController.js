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

// // @desc    Get all bills with filters
// // @route   GET /api/billing
// // @access  Private/Admin & Accountant
// const getBills = asyncHandler(async (req, res) => {
//   const { category, status, startDate, endDate } = req.query;
//   const query = {};

//   if (category) query.category = category;
//   if (status) query.status = status;
//   if (startDate || endDate) {
//     query.billDate = {};
//     if (startDate) query.billDate.$gte = new Date(startDate);
//     if (endDate) query.billDate.$lte = new Date(endDate);
//   }

//   const bills = await Bill.find(query).populate('markedBy', 'cnic name role');
//   res.json(bills);
// });




// @desc    Get all bills with search and filtering
// @route   GET /api/billing
// @access  Private (Admin, Accountant)
const getBills = asyncHandler(async (req, res) => {
  const { search, category, status, month, year } = req.query;
  const query = {};

  // Search by title or paidTo
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { paidTo: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by month and year
  if (month && year) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    query.billDate = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  const bills = await Bill.find(query)
    .populate({
      path: 'markedBy',
      select: 'cnic role profileId',
      populate: {
        path: 'profileId',
        select: 'name',
        model: 'Staff'
      }
    })
    .sort({ createdAt: -1 });
  res.status(200).json(bills);
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


import Staff from '../models/Staff.js'; // <-- import Staff model if not already

const downloadReceipt = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('markedBy', 'cnic role profileId');

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  // Default to CNIC or fallback if no user is found
  let enteredBy = bill.markedBy?.cnic || 'N/A';

  // Try to get the staff name from markedBy.profileId
  if (bill.markedBy?.profileId) {
    const staffProfile = await Staff.findById(bill.markedBy.profileId);
    if (staffProfile?.name) {
      enteredBy = staffProfile.name;
    }
  }

  // Generate the PDF
  const doc = new jsPDF({ format: 'a4' });
  const filename = `${bill.title.replace(/\s/g, '_')}_Bill_Summary_${new Date(bill.billDate).toLocaleDateString()}.pdf`;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const headerHeight = 50;

  const savePDF = () => {
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBuffer));
  };

  const generatePDF = async () => {
    // Teal header background
    doc.setFillColor(26, 188, 156);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Decorative overlay circles
    doc.setFillColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.circle(pageWidth * 0.18, 12, 35, 'F');
    doc.circle(pageWidth * 0.82, headerHeight * 0.6, 25, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // White circle background for logo
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 12, 22, 14, 'F');

    // Institute logo
    const logo = new Image();
    logo.src = '/Jamia Logo.png';
    await new Promise((resolve) => {
      logo.onload = () => {
        doc.addImage(logo, 'JPEG', margin + 3, 13, 18, 18);
        resolve();
      };
      logo.onerror = () => resolve();
    });

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Jamia Tul Mastwaar', margin + 30, 18);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(240, 253, 250);
    doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 30, 25);
    doc.text('(0334) 8724125 | jamiatulmastwaar@gmail.com', margin + 30, 31);

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('BILL SUMMARY', pageWidth - margin, 42, { align: 'right' });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.setGState(new doc.GState({ opacity: 0.3 }));
    doc.line(margin, headerHeight - 5, pageWidth - margin, headerHeight - 5);
    doc.setGState(new doc.GState({ opacity: 1 }));

    let yPos = headerHeight + 10;
    doc.setTextColor(0, 0, 0);

    // Timestamp badge
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Helper functions
    const addSectionHeader = (title) => {
      doc.setFillColor(240, 248, 242);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 167, 69);
      doc.text(title, margin + 3, yPos + 5.5);
      doc.setTextColor(0, 0, 0);
      yPos += 13;
    };

    const columnGap = 18;
    const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

    const addTwoFields = (label1, value1, label2 = null, value2 = null) => {
      const addSingle = (x, label, value) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(`${label}:`, x, yPos);
        const labelWidth = doc.getTextWidth(`${label}:`);
        doc.setFontSize(9.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const text = value ? String(value) : 'N/A';
        const lines = doc.splitTextToSize(text, columnWidth - labelWidth - 5);
        doc.text(lines, x + labelWidth + 3, yPos);
      };

      addSingle(margin, label1, value1);
      if (label2) addSingle(margin + columnWidth + columnGap, label2, value2);
      yPos += 7;
    };

    // Bill Details Section
    addSectionHeader('BILL DETAILS');
    addTwoFields('Bill Title', bill.title, 'Category', bill.category);
    addTwoFields('Amount', `PKR ${parseFloat(bill.amount).toLocaleString()}`, 'Status', bill.status);
    addTwoFields('Bill Date', new Date(bill.billDate).toLocaleDateString(), 'Paid To', bill.paidTo || 'N/A');
    if (bill.status !== 'Unpaid') {
      addTwoFields('Payment Date', new Date(bill.paymentDate).toLocaleDateString(), 'Payment Method', bill.paymentMethod);
    }
    addTwoFields('Remarks', bill.remarks || 'N/A', '', '');
    yPos += 5;

    // Transaction Information Section
    addSectionHeader('TRANSACTION INFORMATION');
    addTwoFields('Entered By', enteredBy, 'Created At', new Date(bill.createdAt).toLocaleString());
    yPos += 10;

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('This is a computer-generated bill summary. No signature is required.', pageWidth / 2, yPos, { align: 'center' });

    // Page footer
    const footerY = pageHeight - 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('Jamia Tul Mastwaar - Bill Summary', margin, footerY);
    doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

    savePDF();
  };

  generatePDF();
});



// @desc    Get aggregated billing reports
// @route   GET /api/billing/reports
// @access  Private/Admin & Accountant
export const getBillReports = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const matchFilter = { paymentDate: { $ne: null } };

  if (year || month) {
    const expressions = [];
    if (year) expressions.push({ $eq: [{ $year: "$paymentDate" }, parseInt(year, 10)] });
    if (month) expressions.push({ $eq: [{ $month: "$paymentDate" }, parseInt(month, 10)] });
    matchFilter.$expr = expressions.length === 1 ? expressions[0] : { $and: expressions };
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