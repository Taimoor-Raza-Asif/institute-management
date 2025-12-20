// backend/controllers/feeController.js
import FeeRecord from '../models/FeeRecord.js'; // Assuming you have this model
import Student from '../models/Student.js'; // Import the Student model
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import asyncHandler from 'express-async-handler';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getRelativeUploadUrl = (filePath) => {
  if (!filePath) return '';
  const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
  const relativePath = path.relative(uploadsBaseDir, filePath);
  return '/uploads/' + relativePath.replace(/\\/g, '/');
};

const handleBillScreenshotUpload = (file, existingUrlFromReqBody, oldUrlFromDb) => {
  let newUrl = oldUrlFromDb;

  if (file) {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Error deleting old bill screenshot:', err);
      });
    }
    newUrl = getRelativeUploadUrl(file.path);
  } else if (existingUrlFromReqBody === '') {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Error deleting old bill screenshot (cleared):', err);
      });
    }
    newUrl = '';
  }
  return newUrl;
};


// --- CREATE FEE RECORD ---
export const createFeeRecord = async (req, res) => {
  try {
    const {
      studentId, paidBy, month, year, totalFee, receivedAmount,
      receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl,admissionFee
    } = req.body;

    let billScreenshotUrl = '';
    if (req.file) {
      billScreenshotUrl = getRelativeUploadUrl(req.file.path);
    } else if (existingBillScreenshotUrl) {
      billScreenshotUrl = existingBillScreenshotUrl;
    }

    // const total = parseFloat(totalFee);
    const total = parseFloat(totalFee) + (parseFloat(admissionFee) || 0);
    const received = parseFloat(receivedAmount);
    const dueAmount = Math.max(0, total - received);

    const newFeeRecord = new FeeRecord({
      studentId,
      paidBy,
      month,
      year: parseInt(year),
      totalFee: total,
      receivedAmount: received,
      dueAmount,
      receivedDate: new Date(receivedDate),
      receivedBy,
      paymentMethod,
      billScreenshotUrl,
      admissionFee: parseFloat(admissionFee) || 0,
    });

    const savedFeeRecord = await newFeeRecord.save();

        // --- NEW LOGIC: UPDATE STUDENT'S ADMISSION FEE STATUS ---
    const student = await Student.findById(studentId);
    if (student && admissionFee && parseFloat(admissionFee) > 0) { // Check if admission fee was paid
      student.admissionFeeStatus = true; // Set status to paid
      await student.save({ validateBeforeSave: false }); // Save without re-running full student validation
    }

    // --- Update Student's Fee Status and Financials ---
    // const student = await Student.findById(studentId);
    if (student) {
      // Re-evaluate student's overall fee status based on all their fees
      const allStudentFees = await FeeRecord.find({ studentId: student._id });

      let studentNewStatus = 'Unpaid';
      const hasPartialPaid = allStudentFees.some(f => f.dueAmount > 0 && f.receivedAmount > 0);
      const hasFullyPaid = allStudentFees.some(f => f.dueAmount === 0 && f.receivedAmount > 0); // At least one paid record

      if (hasFullyPaid) {
        studentNewStatus = 'Paid';
      } else if (hasPartialPaid) {
        studentNewStatus = 'Partial Paid';
      }

      // Update depositedAmount and otherDues on the student
      let newDepositedAmount = parseFloat(student.depositedAmount || 0);
      let newOtherDues = parseFloat(student.otherDues || 0);

      if (paymentMethod === 'Deposited Cash') {
        newDepositedAmount -= received;
      } 

      // Ensure amounts don't go negative
      newDepositedAmount = Math.max(0, newDepositedAmount);
      newOtherDues = Math.max(0, newOtherDues);


      // Update student's feeStatus and financial fields
      student.feeStatus = studentNewStatus;
      student.depositedAmount = newDepositedAmount;
      student.otherDues = newOtherDues;
      await student.save({ validateBeforeSave: false }); // Skip validation for simplicity on status update
    }

    res.status(201).json(savedFeeRecord);
  } catch (err) {
    console.error("Error creating fee record:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting bill screenshot file after failed fee record creation:', unlinkErr);
      });
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Fee record validation failed', errors });
    }
    res.status(500).json({ message: 'Failed to save fee record: ' + err.message });
  }
};

// --- GET ALL FEES ---
export const getAllFees = async (req, res) => {
  try {
    const { searchTerm, month, year, receivedBy, paymentMethod } = req.query;

    const filter = {};

    // For Accountant, they can see all fees. Admin too.
    // Students can only see their own fees (handled by getFeesByStudent or a dedicated route)

    if (searchTerm) {
      // Search by student name or CNIC (requires population)
      const students = await Student.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { cnic: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id');
      const studentIds = students.map(s => s._id);
      filter.studentId = { $in: studentIds };
    }

    if (month) {
      filter.month = month;
    }
    if (year) {
      filter.year = parseInt(year);
    }
    if (receivedBy) {
      filter.receivedBy = { $regex: receivedBy, $options: 'i' };
    }
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Populate student details for display
    const fees = await FeeRecord.find(filter).populate('studentId', 'name cnic feePerMonth depositedAmount otherDues profilePictureUrl');
    res.json(fees);
  } catch (err) {
    console.error("Error fetching fees:", err);
    res.status(500).json({ message: 'Failed to retrieve fees: ' + err.message });
  }
};

// --- GET FEES BY STUDENT ---
export const getFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // A student can only view their own fees
    if (req.user.role === 'student' && req.user.profileId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these fee records.' });
    }

    const fees = await FeeRecord.find({ studentId }).populate('studentId', 'name cnic feePerMonth depositedAmount otherDues profilePictureUrl');
    if (!fees) {
      return res.status(404).json({ message: 'No fee records found for this student' });
    }
    res.json(fees);
  } catch (err) {
    console.error("Error fetching fees by student:", err);
    res.status(500).json({ message: err.message });
  }
};


// --- UPDATE FEE RECORD ---
export const updateFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId, paidBy, month, year, totalFee, receivedAmount,
      receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl
    } = req.body;

    const currentFeeRecord = await FeeRecord.findById(id);
    if (!currentFeeRecord) {
      if (req.file) { // Clean up newly uploaded file if fee record not found
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded bill screenshot for non-existent fee record:', unlinkErr);
        });
      }
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const total = parseFloat(totalFee);
    const received = parseFloat(receivedAmount);
    const dueAmount = Math.max(0, total - received);

    let billScreenshotUrl = handleBillScreenshotUpload(req.file, existingBillScreenshotUrl, currentFeeRecord.billScreenshotUrl);

    const updatedFeeRecord = await FeeRecord.findByIdAndUpdate(
      id,
      {
        studentId,
        paidBy,
        month,
        year: parseInt(year),
        totalFee: total,
        receivedAmount: received,
        dueAmount,
        receivedDate: new Date(receivedDate),
        receivedBy,
        paymentMethod,
        billScreenshotUrl,
      },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedFeeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    // --- Re-evaluate Student's Fee Status and Financials after update ---
    const student = await Student.findById(studentId);
    if (student) {
      // Re-evaluate student's overall fee status based on all their fees
      const allStudentFees = await FeeRecord.find({ studentId: student._id });

      let studentNewStatus = 'Unpaid';
      const hasPartialPaid = allStudentFees.some(f => f.dueAmount > 0 && f.receivedAmount > 0);
      const hasFullyPaid = allStudentFees.some(f => f.dueAmount === 0 && f.receivedAmount > 0);

      if (hasFullyPaid) {
        studentNewStatus = 'Paid';
      } else if (hasPartialPaid) {
        studentNewStatus = 'Partial Paid';
      }

      // Calculate the net change in depositedAmount and otherDues
      // First, undo the impact of the old record
      let netDepositedChange = 0;
      let netOtherDuesChange = 0;

      if (currentFeeRecord.paymentMethod === 'Deposited Cash') {
        netDepositedChange += currentFeeRecord.receivedAmount; // Refund old received amount to deposit
      } else if (currentFeeRecord.dueAmount > 0) {
        netOtherDuesChange -= currentFeeRecord.dueAmount; // Remove old due from otherDues
      }

      // Then, apply the impact of the new record
      if (paymentMethod === 'Deposited Cash') {
        netDepositedChange -= received; // Deduct new received amount from deposit
        }
      // } else if (dueAmount > 0) {
      //   netOtherDuesChange += dueAmount; // Add new due to otherDues
      // }

      let newDepositedAmount = parseFloat(student.depositedAmount || 0) + netDepositedChange;
      let newOtherDues = parseFloat(student.otherDues || 0) + netOtherDuesChange;

      // Ensure amounts don't go negative
      newDepositedAmount = Math.max(0, newDepositedAmount);
      newOtherDues = Math.max(0, newOtherDues);

      // Update student's feeStatus and financial fields
      student.feeStatus = studentNewStatus;
      student.depositedAmount = newDepositedAmount;
      student.otherDues = newOtherDues;
      await student.save({ validateBeforeSave: false });
    }

    res.json(updatedFeeRecord);
  } catch (err) {
    console.error("Error updating fee record:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting bill screenshot file after failed fee record update:', unlinkErr);
      });
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Fee record validation failed', errors });
    }
    res.status(500).json({ message: 'Failed to update fee record: ' + err.message });
  }
};

// --- DELETE FEE RECORD ---
export const deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await FeeRecord.findById(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const studentId = fee.studentId; // Get studentId before deleting fee record

    // Delete bill screenshot file if it exists
    if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
      const filePath = path.join(__dirname, '..', fee.billScreenshotUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting bill screenshot file:', err);
      });
    }

    await fee.deleteOne();

    // --- Re-evaluate Student's Fee Status and Financials after deletion ---
    const student = await Student.findById(studentId);
    if (student) {
      const remainingFees = await FeeRecord.find({ studentId: studentId });

      let studentNewStatus = 'Unpaid';
      const hasPartialPaid = remainingFees.some(f => f.dueAmount > 0 && f.receivedAmount > 0);
      const hasFullyPaid = remainingFees.some(f => f.dueAmount === 0 && f.receivedAmount > 0);

      if (hasFullyPaid) {
        studentNewStatus = 'Paid';
      } else if (hasPartialPaid) {
        studentNewStatus = 'Partial Paid';
      }

      // Adjust student's depositedAmount and otherDues based on the deleted fee record
      let newDepositedAmount = parseFloat(student.depositedAmount || 0);
      let newOtherDues = parseFloat(student.otherDues || 0);

      if (fee.paymentMethod === 'Deposited Cash') {
        newDepositedAmount += fee.receivedAmount; // Return received amount to deposit
      } else if (fee.dueAmount > 0) {
        newOtherDues -= fee.dueAmount; // Remove due amount from otherDues
      }

      newDepositedAmount = Math.max(0, newDepositedAmount);
      newOtherDues = Math.max(0, newOtherDues);

      if (student.feeStatus !== studentNewStatus || student.depositedAmount !== newDepositedAmount || student.otherDues !== newOtherDues) {
        student.feeStatus = studentNewStatus;
        student.depositedAmount = newDepositedAmount;
        student.otherDues = newOtherDues;
        await student.save({ validateBeforeSave: false });
        console.log(`Student ${studentId} fee status and financials re-evaluated to: ${studentNewStatus} after fee record deletion.`);
      }
    }

    res.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    console.error("Error deleting fee record:", err);
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get aggregated fee reports
// @route   GET /api/fees/reports
// @access  Private/Admin & Accountant
export const getFeeReports = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const matchFilter = {};

  if (year) {
    const parsedYear = parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
      matchFilter.year = parsedYear;
    }
  }

  if (month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const parsedMonth = parseInt(month, 10);
    let monthName = month;

    if (!Number.isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      monthName = monthNames[parsedMonth - 1];
    }

    if (typeof monthName === 'string' && monthName.trim().length > 0) {
      matchFilter.month = new RegExp(`^${monthName}$`, 'i'); // case-insensitive exact match
    }
  }

  try {
    const monthlyReport = await FeeRecord.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalCollected: { $sum: "$receivedAmount" },
          totalDue: { $sum: "$dueAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const paymentMethodReport = await FeeRecord.aggregate([
      {
        $match: { ...matchFilter, paymentMethod: { $ne: null } }
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$receivedAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          paymentMethod: "$_id",
          totalAmount: 1
        }
      }
    ]);

    // NEW/OPTIMIZED ADMISSION FEE REPORT
    const admissionFeeReport = await FeeRecord.aggregate([
      {
        $match: {
          ...matchFilter,
          admissionFee: { $gt: 0 } // Only include records where admissionFee is greater than 0
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalAdmissionFee: { $sum: "$admissionFee" } // Sum the 'admissionFee' field directly
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    res.status(200).json({ monthlyReport, paymentMethodReport, admissionFeeReport });
  } catch (error) {
    console.error("Error fetching fee reports:", error);
    res.status(500).json({ message: 'Failed to fetch fee reports', error: error.message });
  }
});