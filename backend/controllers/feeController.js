// // backend/controllers/feeController.js
// import FeeRecord from '../models/FeeRecord.js';
// import Student from '../models/Student.js'; // Import the Student model
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const billScreenshotsDir = path.join(__dirname, '../uploads/billScreenshots');

// const getRelativeUploadUrl = (filePath) => {
//   if (!filePath) return '';
//   return filePath.replace(path.join(__dirname, '../'), '/');
// };

// // --- CREATE FEE RECORD ---
// export const createFeeRecord = async (req, res) => {
//   try {
//     const {
//       studentId, paidBy, month, year, totalFee, receivedAmount,
//       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl // From frontend if keeping old
//     } = req.body;

//     let billScreenshotUrl = '';
//     if (req.file) { // If a new file was uploaded
//       billScreenshotUrl = getRelativeUploadUrl(req.file.path);
//     } else if (existingBillScreenshotUrl === '') {
//       // If no new file and frontend explicitly cleared the old one
//       billScreenshotUrl = '';
//     } else if (existingBillScreenshotUrl) {
//       // If no new file and frontend sent an existing URL
//       billScreenshotUrl = existingBillScreenshotUrl;
//     }

//     // Mongoose pre-save hook will calculate dueAmount automatically
//     const newFee = new FeeRecord({
//       studentId,
//       paidBy,
//       month,
//       year: parseInt(year), // Ensure year is a number
//       totalFee: parseFloat(totalFee), // Ensure totalFee is a number
//       receivedAmount: parseFloat(receivedAmount), // Ensure receivedAmount is a number
//       receivedDate: new Date(receivedDate), // Convert to Date object
//       receivedBy,
//       paymentMethod,
//       billScreenshotUrl,
//     });

//     const savedFee = await newFee.save(); // This will trigger the pre-save hook for dueAmount

//     // --- NEW LOGIC: UPDATE STUDENT'S FEE STATUS ---
//     const student = await Student.findById(studentId);
//     if (student) {
//       if (savedFee.dueAmount === 0 && savedFee.receivedAmount >= 0) {
//         student.feeStatus = 'Paid';
//       } else if (savedFee.dueAmount > 0) {
//         student.feeStatus = 'Partial Paid';
//       } else {
//         // This 'else' might be for cases where receivedAmount is negative or other edge cases
//         // For now, it defaults to 'Unpaid' if not 'Paid' or 'Partial Paid'
//         student.feeStatus = 'Unpaid';
//       }
//       await student.save({ validateBeforeSave: false }); // Save student without re-running full student validation
//     }
//     // --- END NEW LOGIC ---

//     res.status(201).json(savedFee);
//   } catch (err) {
//     console.error("Error creating fee record:", err);
//     // If there's a file, delete it if fee record creation fails
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
//       });
//     }
//     res.status(400).json({ message: 'Failed to save fee record: ' + err.message });
//   }
// };

// // --- UPDATE FEE RECORD ---
// export const updateFeeRecord = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       studentId, paidBy, month, year, totalFee, receivedAmount,
//       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl // From frontend if keeping old
//     } = req.body;

//     const fee = await FeeRecord.findById(id);
//     if (!fee) {
//       // If fee record not found, and a new file was uploaded, delete the new file
//       if (req.file) {
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent fee record:', unlinkErr);
//         });
//       }
//       return res.status(404).json({ message: 'Fee record not found' });
//     }

//     // Handle bill screenshot update logic
//     let newBillScreenshotUrl = fee.billScreenshotUrl; // Default to current DB URL

//     if (req.file) {
//       // A new file was uploaded: delete the old one if it exists
//       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old bill screenshot:', unlinkErr);
//         });
//       }
//       newBillScreenshotUrl = getRelativeUploadUrl(req.file.path); // Set to new file's URL
//     } else if (existingBillScreenshotUrl === '') {
//       // Frontend explicitly sent an empty string, meaning user cleared the image
//       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old bill screenshot (cleared):', unlinkErr);
//         });
//       }
//       newBillScreenshotUrl = ''; // Clear the URL in DB
//     }
//     // If req.file is null AND existingBillScreenshotUrl is NOT empty,
//     // it means no new file was uploaded and the existing one was kept.
//     // newBillScreenshotUrl correctly retains its value from fee.billScreenshotUrl.


//     // Update fee record fields
//     fee.studentId = studentId;
//     fee.paidBy = paidBy;
//     fee.month = month;
//     fee.year = parseInt(year);
//     fee.totalFee = parseFloat(totalFee);
//     fee.receivedAmount = parseFloat(receivedAmount);
//     fee.receivedDate = new Date(receivedDate);
//     fee.receivedBy = receivedBy;
//     fee.paymentMethod = paymentMethod;
//     fee.billScreenshotUrl = newBillScreenshotUrl;

//     const updatedFee = await fee.save(); // This will trigger the pre-save hook for dueAmount

//     // --- NEW LOGIC: UPDATE STUDENT'S FEE STATUS ---
//     const student = await Student.findById(studentId);
//     if (student) {
//       if (updatedFee.dueAmount === 0 && updatedFee.receivedAmount >= 0) {
//         student.feeStatus = 'Paid';
//       } else if (updatedFee.dueAmount > 0) {
//         student.feeStatus = 'Partial Paid';
//       } else {
//         student.feeStatus = 'Unpaid';
//       }
//       await student.save({ validateBeforeSave: false }); // Save student without re-running full student validation
//     }
//     // --- END NEW LOGIC ---

//     res.json(updatedFee);
//   } catch (err) {
//     console.error("Error updating fee record:", err);
//     // If there's a new file, delete it if fee record update fails
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
//       });
//     }
//     res.status(400).json({ message: 'Failed to update fee record: ' + err.message });
//   }
// };

// // --- GET ALL FEES ---
// export const getAllFees = async (req, res) => {
//   try {
//     const { month, year, receivedBy, paymentMethod, studentSearchTerm } = req.query;

//     const pipeline = [];

//     pipeline.push({
//       $lookup: {
//         from: Student.collection.name,
//         localField: 'studentId',
//         foreignField: '_id',
//         as: 'studentInfo'
//       }
//     });
//     pipeline.push({
//       $unwind: {
//         path: '$studentInfo',
//         preserveNullAndEmptyArrays: true
//       }
//     });

//     const matchConditions = {};

//     if (studentSearchTerm) {
//       matchConditions.$or = [
//         { 'studentInfo.name': { $regex: studentSearchTerm, $options: 'i' } },
//         { 'studentInfo.cnic': { $regex: studentSearchTerm, $options: 'i' } }
//       ];
//     }
//     if (month) {
//       matchConditions.month = month;
//     }
//     if (year) {
//       matchConditions.year = parseInt(year);
//     }
//     if (receivedBy) {
//       matchConditions.receivedBy = receivedBy;
//     }
//     if (paymentMethod) {
//       matchConditions.paymentMethod = paymentMethod;
//     }

//     if (Object.keys(matchConditions).length > 0) {
//       pipeline.push({ $match: matchConditions });
//     }

//     pipeline.push({
//       $project: {
//         _id: 1,
//         studentId: '$studentInfo',
//         paidBy: 1,
//         month: 1,
//         year: 1,
//         totalFee: 1,
//         receivedAmount: 1,
//         dueAmount: 1,
//         receivedDate: 1,
//         receivedBy: 1,
//         paymentMethod: 1,
//         billScreenshotUrl: 1,
//         createdAt: 1,
//         updatedAt: 1,
//       }
//     });

//     const fees = await FeeRecord.aggregate(pipeline);
//     res.json(fees);
//   } catch (err) {
//     console.error("Error fetching fees:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- GET FEE BY ID ---
// export const getFeeById = async (req, res) => {
//   try {
//     const fee = await FeeRecord.findById(req.params.id).populate('studentId');
//     if (!fee) return res.status(404).json({ message: 'Fee record not found' });
//     res.json(fee);
//   } catch (err) {
//     console.error("Error fetching fee by ID:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- DELETE FEE RECORD ---
// export const deleteFeeRecord = async (req, res) => {
//   try {
//     const fee = await FeeRecord.findById(req.params.id);
//     if (!fee) {
//       return res.status(404).json({ message: 'Fee record not found' });
//     }

//     // Delete associated bill screenshot file if it exists
//     if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//       const filePath = path.join(__dirname, '../', fee.billScreenshotUrl);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting bill screenshot file:', err);
//       });
//     }

//     await fee.deleteOne();
//     res.json({ message: 'Fee record deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting fee record:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// export const getFeesByStudent = async (req, res) => {
//   try {
//     const fees = await FeeRecord.find({ studentId: req.params.studentId });
//     res.json(fees);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// backend/controllers/feeController.js
import FeeRecord from '../models/FeeRecord.js';
import Student from '../models/Student.js'; // Import the Student model
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const billScreenshotsDir = path.join(__dirname, '../uploads/billScreenshots');

const getRelativeUploadUrl = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(path.join(__dirname, '../'), '/');
};

// --- Helper function to update student fee status based on payment ---
const updateStudentFeeStatusBasedOnPayment = async (studentId, dueAmount, receivedAmount) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      console.warn(`Student with ID ${studentId} not found for fee status update.`);
      return;
    }

    let newStatus;
    if (dueAmount === 0 && receivedAmount >= 0) {
      newStatus = 'Paid';
    } else if (dueAmount > 0) {
      newStatus = 'Partial Paid';
    } else {
      newStatus = 'Unpaid'; // Fallback for unexpected cases
    }

    if (student.feeStatus !== newStatus) {
      student.feeStatus = newStatus;
      await student.save({ validateBeforeSave: false });
      console.log(`Student ${studentId} fee status updated to: ${newStatus}`);
    }
  } catch (err) {
    console.error(`Error updating student fee status for student ${studentId}:`, err);
  }
};

// --- CREATE FEE RECORD ---
export const createFeeRecord = async (req, res) => {
  try {
    const {
      studentId, paidBy, month, year, totalFee, receivedAmount,
      receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl
    } = req.body;

    let billScreenshotUrl = '';
    if (req.file) {
      billScreenshotUrl = getRelativeUploadUrl(req.file.path);
    } else if (existingBillScreenshotUrl === '') {
      billScreenshotUrl = '';
    } else if (existingBillScreenshotUrl) {
      billScreenshotUrl = existingBillScreenshotUrl;
    }

    const newFee = new FeeRecord({
      studentId,
      paidBy,
      month,
      year: parseInt(year),
      totalFee: parseFloat(totalFee),
      receivedAmount: parseFloat(receivedAmount),
      receivedDate: new Date(receivedDate),
      receivedBy,
      paymentMethod,
      billScreenshotUrl,
    });

    const savedFee = await newFee.save();

    await updateStudentFeeStatusBasedOnPayment(savedFee.studentId, savedFee.dueAmount, savedFee.receivedAmount);

    res.status(201).json(savedFee);
  } catch (err) {
    console.error("Error creating fee record:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
      });
    }
    res.status(400).json({ message: 'Failed to save fee record: ' + err.message });
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

    const fee = await FeeRecord.findById(id);
    if (!fee) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent fee record:', unlinkErr);
        });
      }
      return res.status(404).json({ message: 'Fee record not found' });
    }

    let newBillScreenshotUrl = fee.billScreenshotUrl;

    if (req.file) {
      if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
        const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old bill screenshot:', unlinkErr);
        });
      }
      newBillScreenshotUrl = getRelativeUploadUrl(req.file.path);
    } else if (existingBillScreenshotUrl === '') {
      if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
        const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old bill screenshot (cleared):', unlinkErr);
        });
      }
      newBillScreenshotUrl = '';
    }

    fee.studentId = studentId;
    fee.paidBy = paidBy;
    fee.month = month;
    fee.year = parseInt(year);
    fee.totalFee = parseFloat(totalFee);
    fee.receivedAmount = parseFloat(receivedAmount);
    fee.receivedDate = new Date(receivedDate);
    fee.receivedBy = receivedBy;
    fee.paymentMethod = paymentMethod;
    fee.billScreenshotUrl = newBillScreenshotUrl;

    const updatedFee = await fee.save();

    await updateStudentFeeStatusBasedOnPayment(updatedFee.studentId, updatedFee.dueAmount, updatedFee.receivedAmount);

    res.json(updatedFee);
  } catch (err) {
    console.error("Error updating fee record:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
      });
    }
    res.status(400).json({ message: 'Failed to update fee record: ' + err.message });
  }
};

// --- GET ALL FEES ---
export const getAllFees = async (req, res) => {
  try {
    // NEW: Destructure dueStatus from req.query
    const { month, year, receivedBy, paymentMethod, studentSearchTerm, dueStatus } = req.query;

    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: Student.collection.name,
        localField: 'studentId',
        foreignField: '_id',
        as: 'studentInfo'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$studentInfo',
        preserveNullAndEmptyArrays: true
      }
    });

    const matchConditions = {};

    if (studentSearchTerm) {
      matchConditions.$or = [
        { 'studentInfo.name': { $regex: studentSearchTerm, $options: 'i' } },
        { 'studentInfo.cnic': { $regex: studentSearchTerm, $options: 'i' } }
      ];
    }
    if (month) {
      matchConditions.month = month;
    }
    if (year) {
      matchConditions.year = parseInt(year);
    }
    if (receivedBy) {
      matchConditions.receivedBy = receivedBy;
    }
    if (paymentMethod) {
      matchConditions.paymentMethod = paymentMethod;
    }
    // NEW: Apply dueStatus filter
    if (dueStatus === 'dueRemaining') {
      matchConditions.dueAmount = { $gt: 0 }; // Filter for fees where dueAmount is greater than 0
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push({
      $project: {
        _id: 1,
        studentId: '$studentInfo',
        paidBy: 1,
        month: 1,
        year: 1,
        totalFee: 1,
        receivedAmount: 1,
        dueAmount: 1,
        receivedDate: 1,
        receivedBy: 1,
        paymentMethod: 1,
        billScreenshotUrl: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    });

    const fees = await FeeRecord.aggregate(pipeline);
    res.json(fees);
  } catch (err) {
    console.error("Error fetching fees:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- GET FEE BY ID ---
export const getFeeById = async (req, res) => {
  try {
    const fee = await FeeRecord.findById(req.params.id).populate('studentId');
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) {
    console.error("Error fetching fee by ID:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- DELETE FEE RECORD ---
export const deleteFeeRecord = async (req, res) => {
  try {
    const fee = await FeeRecord.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const studentId = fee.studentId;

    if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
      const filePath = path.join(__dirname, '../', fee.billScreenshotUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting bill screenshot file:', err);
      });
    }

    await fee.deleteOne();

    const remainingFees = await FeeRecord.find({ studentId: studentId });

    let studentNewStatus = 'Unpaid';
    if (remainingFees.length > 0) {
        const hasPartialPaid = remainingFees.some(f => f.dueAmount > 0);
        const hasFullyPaid = remainingFees.some(f => f.dueAmount === 0);

        if (hasFullyPaid) {
            studentNewStatus = 'Paid';
        } else if (hasPartialPaid) {
            studentNewStatus = 'Partial Paid';
        }
    }

    const student = await Student.findById(studentId);
    if (student && student.feeStatus !== studentNewStatus) {
        student.feeStatus = studentNewStatus;
        await student.save({ validateBeforeSave: false });
        console.log(`Student ${studentId} fee status re-evaluated to: ${studentNewStatus} after fee record deletion.`);
    }

    res.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    console.error("Error deleting fee record:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getFeesByStudent = async (req, res) => {
  try {
    const fees = await FeeRecord.find({ studentId: req.params.studentId });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
