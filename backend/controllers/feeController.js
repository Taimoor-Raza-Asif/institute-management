// // // backend/controllers/feeController.js
// // import FeeRecord from '../models/FeeRecord.js';
// // import Student from '../models/Student.js'; // Import the Student model
// // import path from 'path';
// // import fs from 'fs';
// // import { fileURLToPath } from 'url';

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // const billScreenshotsDir = path.join(__dirname, '../uploads/billScreenshots');

// // const getRelativeUploadUrl = (filePath) => {
// //   if (!filePath) return '';
// //   return filePath.replace(path.join(__dirname, '../'), '/');
// // };

// // // --- CREATE FEE RECORD ---
// // export const createFeeRecord = async (req, res) => {
// //   try {
// //     const {
// //       studentId, paidBy, month, year, totalFee, receivedAmount,
// //       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl // From frontend if keeping old
// //     } = req.body;

// //     let billScreenshotUrl = '';
// //     if (req.file) { // If a new file was uploaded
// //       billScreenshotUrl = getRelativeUploadUrl(req.file.path);
// //     } else if (existingBillScreenshotUrl === '') {
// //       // If no new file and frontend explicitly cleared the old one
// //       billScreenshotUrl = '';
// //     } else if (existingBillScreenshotUrl) {
// //       // If no new file and frontend sent an existing URL
// //       billScreenshotUrl = existingBillScreenshotUrl;
// //     }

// //     // Mongoose pre-save hook will calculate dueAmount automatically
// //     const newFee = new FeeRecord({
// //       studentId,
// //       paidBy,
// //       month,
// //       year: parseInt(year), // Ensure year is a number
// //       totalFee: parseFloat(totalFee), // Ensure totalFee is a number
// //       receivedAmount: parseFloat(receivedAmount), // Ensure receivedAmount is a number
// //       receivedDate: new Date(receivedDate), // Convert to Date object
// //       receivedBy,
// //       paymentMethod,
// //       billScreenshotUrl,
// //     });

// //     const savedFee = await newFee.save(); // This will trigger the pre-save hook for dueAmount

// //     // --- NEW LOGIC: UPDATE STUDENT'S FEE STATUS ---
// //     const student = await Student.findById(studentId);
// //     if (student) {
// //       if (savedFee.dueAmount === 0 && savedFee.receivedAmount >= 0) {
// //         student.feeStatus = 'Paid';
// //       } else if (savedFee.dueAmount > 0) {
// //         student.feeStatus = 'Partial Paid';
// //       } else {
// //         // This 'else' might be for cases where receivedAmount is negative or other edge cases
// //         // For now, it defaults to 'Unpaid' if not 'Paid' or 'Partial Paid'
// //         student.feeStatus = 'Unpaid';
// //       }
// //       await student.save({ validateBeforeSave: false }); // Save student without re-running full student validation
// //     }
// //     // --- END NEW LOGIC ---

// //     res.status(201).json(savedFee);
// //   } catch (err) {
// //     console.error("Error creating fee record:", err);
// //     // If there's a file, delete it if fee record creation fails
// //     if (req.file) {
// //       fs.unlink(req.file.path, (unlinkErr) => {
// //         if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
// //       });
// //     }
// //     res.status(400).json({ message: 'Failed to save fee record: ' + err.message });
// //   }
// // };

// // // --- UPDATE FEE RECORD ---
// // export const updateFeeRecord = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const {
// //       studentId, paidBy, month, year, totalFee, receivedAmount,
// //       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl // From frontend if keeping old
// //     } = req.body;

// //     const fee = await FeeRecord.findById(id);
// //     if (!fee) {
// //       // If fee record not found, and a new file was uploaded, delete the new file
// //       if (req.file) {
// //         fs.unlink(req.file.path, (unlinkErr) => {
// //           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent fee record:', unlinkErr);
// //         });
// //       }
// //       return res.status(404).json({ message: 'Fee record not found' });
// //     }

// //     // Handle bill screenshot update logic
// //     let newBillScreenshotUrl = fee.billScreenshotUrl; // Default to current DB URL

// //     if (req.file) {
// //       // A new file was uploaded: delete the old one if it exists
// //       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
// //         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
// //         fs.unlink(oldPath, (unlinkErr) => {
// //           if (unlinkErr) console.error('Error deleting old bill screenshot:', unlinkErr);
// //         });
// //       }
// //       newBillScreenshotUrl = getRelativeUploadUrl(req.file.path); // Set to new file's URL
// //     } else if (existingBillScreenshotUrl === '') {
// //       // Frontend explicitly sent an empty string, meaning user cleared the image
// //       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
// //         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
// //         fs.unlink(oldPath, (unlinkErr) => {
// //           if (unlinkErr) console.error('Error deleting old bill screenshot (cleared):', unlinkErr);
// //         });
// //       }
// //       newBillScreenshotUrl = ''; // Clear the URL in DB
// //     }
// //     // If req.file is null AND existingBillScreenshotUrl is NOT empty,
// //     // it means no new file was uploaded and the existing one was kept.
// //     // newBillScreenshotUrl correctly retains its value from fee.billScreenshotUrl.


// //     // Update fee record fields
// //     fee.studentId = studentId;
// //     fee.paidBy = paidBy;
// //     fee.month = month;
// //     fee.year = parseInt(year);
// //     fee.totalFee = parseFloat(totalFee);
// //     fee.receivedAmount = parseFloat(receivedAmount);
// //     fee.receivedDate = new Date(receivedDate);
// //     fee.receivedBy = receivedBy;
// //     fee.paymentMethod = paymentMethod;
// //     fee.billScreenshotUrl = newBillScreenshotUrl;

// //     const updatedFee = await fee.save(); // This will trigger the pre-save hook for dueAmount

// //     // --- NEW LOGIC: UPDATE STUDENT'S FEE STATUS ---
// //     const student = await Student.findById(studentId);
// //     if (student) {
// //       if (updatedFee.dueAmount === 0 && updatedFee.receivedAmount >= 0) {
// //         student.feeStatus = 'Paid';
// //       } else if (updatedFee.dueAmount > 0) {
// //         student.feeStatus = 'Partial Paid';
// //       } else {
// //         student.feeStatus = 'Unpaid';
// //       }
// //       await student.save({ validateBeforeSave: false }); // Save student without re-running full student validation
// //     }
// //     // --- END NEW LOGIC ---

// //     res.json(updatedFee);
// //   } catch (err) {
// //     console.error("Error updating fee record:", err);
// //     // If there's a new file, delete it if fee record update fails
// //     if (req.file) {
// //       fs.unlink(req.file.path, (unlinkErr) => {
// //         if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
// //       });
// //     }
// //     res.status(400).json({ message: 'Failed to update fee record: ' + err.message });
// //   }
// // };

// // // --- GET ALL FEES ---
// // export const getAllFees = async (req, res) => {
// //   try {
// //     const { month, year, receivedBy, paymentMethod, studentSearchTerm } = req.query;

// //     const pipeline = [];

// //     pipeline.push({
// //       $lookup: {
// //         from: Student.collection.name,
// //         localField: 'studentId',
// //         foreignField: '_id',
// //         as: 'studentInfo'
// //       }
// //     });
// //     pipeline.push({
// //       $unwind: {
// //         path: '$studentInfo',
// //         preserveNullAndEmptyArrays: true
// //       }
// //     });

// //     const matchConditions = {};

// //     if (studentSearchTerm) {
// //       matchConditions.$or = [
// //         { 'studentInfo.name': { $regex: studentSearchTerm, $options: 'i' } },
// //         { 'studentInfo.cnic': { $regex: studentSearchTerm, $options: 'i' } }
// //       ];
// //     }
// //     if (month) {
// //       matchConditions.month = month;
// //     }
// //     if (year) {
// //       matchConditions.year = parseInt(year);
// //     }
// //     if (receivedBy) {
// //       matchConditions.receivedBy = receivedBy;
// //     }
// //     if (paymentMethod) {
// //       matchConditions.paymentMethod = paymentMethod;
// //     }

// //     if (Object.keys(matchConditions).length > 0) {
// //       pipeline.push({ $match: matchConditions });
// //     }

// //     pipeline.push({
// //       $project: {
// //         _id: 1,
// //         studentId: '$studentInfo',
// //         paidBy: 1,
// //         month: 1,
// //         year: 1,
// //         totalFee: 1,
// //         receivedAmount: 1,
// //         dueAmount: 1,
// //         receivedDate: 1,
// //         receivedBy: 1,
// //         paymentMethod: 1,
// //         billScreenshotUrl: 1,
// //         createdAt: 1,
// //         updatedAt: 1,
// //       }
// //     });

// //     const fees = await FeeRecord.aggregate(pipeline);
// //     res.json(fees);
// //   } catch (err) {
// //     console.error("Error fetching fees:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // --- GET FEE BY ID ---
// // export const getFeeById = async (req, res) => {
// //   try {
// //     const fee = await FeeRecord.findById(req.params.id).populate('studentId');
// //     if (!fee) return res.status(404).json({ message: 'Fee record not found' });
// //     res.json(fee);
// //   } catch (err) {
// //     console.error("Error fetching fee by ID:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // --- DELETE FEE RECORD ---
// // export const deleteFeeRecord = async (req, res) => {
// //   try {
// //     const fee = await FeeRecord.findById(req.params.id);
// //     if (!fee) {
// //       return res.status(404).json({ message: 'Fee record not found' });
// //     }

// //     // Delete associated bill screenshot file if it exists
// //     if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
// //       const filePath = path.join(__dirname, '../', fee.billScreenshotUrl);
// //       fs.unlink(filePath, (err) => {
// //         if (err) console.error('Error deleting bill screenshot file:', err);
// //       });
// //     }

// //     await fee.deleteOne();
// //     res.json({ message: 'Fee record deleted successfully' });
// //   } catch (err) {
// //     console.error("Error deleting fee record:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// // export const getFeesByStudent = async (req, res) => {
// //   try {
// //     const fees = await FeeRecord.find({ studentId: req.params.studentId });
// //     res.json(fees);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };


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

// // --- Helper function to update student fee status based on payment ---
// const updateStudentFeeStatusBasedOnPayment = async (studentId, dueAmount, receivedAmount) => {
//   try {
//     const student = await Student.findById(studentId);
//     if (!student) {
//       console.warn(`Student with ID ${studentId} not found for fee status update.`);
//       return;
//     }

//     let newStatus;
//     if (dueAmount === 0 && receivedAmount >= 0) {
//       newStatus = 'Paid';
//     } else if (dueAmount > 0) {
//       newStatus = 'Partial Paid';
//     } else {
//       newStatus = 'Unpaid'; // Fallback for unexpected cases
//     }

//     if (student.feeStatus !== newStatus) {
//       student.feeStatus = newStatus;
//       await student.save({ validateBeforeSave: false });
//       console.log(`Student ${studentId} fee status updated to: ${newStatus}`);
//     }
//   } catch (err) {
//     console.error(`Error updating student fee status for student ${studentId}:`, err);
//   }
// };

// // --- CREATE FEE RECORD ---
// export const createFeeRecord = async (req, res) => {
//   try {
//     const {
//       studentId, paidBy, month, year, totalFee, receivedAmount,
//       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl
//     } = req.body;

//     let billScreenshotUrl = '';
//     if (req.file) {
//       billScreenshotUrl = getRelativeUploadUrl(req.file.path);
//     } else if (existingBillScreenshotUrl === '') {
//       billScreenshotUrl = '';
//     } else if (existingBillScreenshotUrl) {
//       billScreenshotUrl = existingBillScreenshotUrl;
//     }

//     const newFee = new FeeRecord({
//       studentId,
//       paidBy,
//       month,
//       year: parseInt(year),
//       totalFee: parseFloat(totalFee),
//       receivedAmount: parseFloat(receivedAmount),
//       receivedDate: new Date(receivedDate),
//       receivedBy,
//       paymentMethod,
//       billScreenshotUrl,
//     });

//     const savedFee = await newFee.save();

//     await updateStudentFeeStatusBasedOnPayment(savedFee.studentId, savedFee.dueAmount, savedFee.receivedAmount);

//     res.status(201).json(savedFee);
//   } catch (err) {
//     console.error("Error creating fee record:", err);
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
//       receivedDate, receivedBy, paymentMethod, billScreenshotUrl: existingBillScreenshotUrl
//     } = req.body;

//     const fee = await FeeRecord.findById(id);
//     if (!fee) {
//       if (req.file) {
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent fee record:', unlinkErr);
//         });
//       }
//       return res.status(404).json({ message: 'Fee record not found' });
//     }

//     let newBillScreenshotUrl = fee.billScreenshotUrl;

//     if (req.file) {
//       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old bill screenshot:', unlinkErr);
//         });
//       }
//       newBillScreenshotUrl = getRelativeUploadUrl(req.file.path);
//     } else if (existingBillScreenshotUrl === '') {
//       if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//         const oldPath = path.join(__dirname, '../', fee.billScreenshotUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old bill screenshot (cleared):', unlinkErr);
//         });
//       }
//       newBillScreenshotUrl = '';
//     }

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

//     const updatedFee = await fee.save();

//     await updateStudentFeeStatusBasedOnPayment(updatedFee.studentId, updatedFee.dueAmount, updatedFee.receivedAmount);

//     res.json(updatedFee);
//   } catch (err) {
//     console.error("Error updating fee record:", err);
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
//     // NEW: Destructure dueStatus from req.query
//     const { month, year, receivedBy, paymentMethod, studentSearchTerm, dueStatus } = req.query;

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
//     // NEW: Apply dueStatus filter
//     if (dueStatus === 'dueRemaining') {
//       matchConditions.dueAmount = { $gt: 0 }; // Filter for fees where dueAmount is greater than 0
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

//     const studentId = fee.studentId;

//     if (fee.billScreenshotUrl && fee.billScreenshotUrl !== '') {
//       const filePath = path.join(__dirname, '../', fee.billScreenshotUrl);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting bill screenshot file:', err);
//       });
//     }

//     await fee.deleteOne();

//     const remainingFees = await FeeRecord.find({ studentId: studentId });

//     let studentNewStatus = 'Unpaid';
//     if (remainingFees.length > 0) {
//         const hasPartialPaid = remainingFees.some(f => f.dueAmount > 0);
//         const hasFullyPaid = remainingFees.some(f => f.dueAmount === 0);

//         if (hasFullyPaid) {
//             studentNewStatus = 'Paid';
//         } else if (hasPartialPaid) {
//             studentNewStatus = 'Partial Paid';
//         }
//     }

//     const student = await Student.findById(studentId);
//     if (student && student.feeStatus !== studentNewStatus) {
//         student.feeStatus = studentNewStatus;
//         await student.save({ validateBeforeSave: false });
//         console.log(`Student ${studentId} fee status re-evaluated to: ${studentNewStatus} after fee record deletion.`);
//     }

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
    const fees = await FeeRecord.find(filter).populate('studentId', 'name cnic feePerMonth depositedAmount otherDues');
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

    const fees = await FeeRecord.find({ studentId }).populate('studentId', 'name cnic feePerMonth depositedAmount otherDues');
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



// // @desc    Get aggregated fee reports
// // @route   GET /api/fees/reports
// // @access  Private/Admin & Accountant
// export const getFeeReports = async (req, res) => {
//   try {
//     const monthlyReport = await FeeRecord.aggregate([
//       {
//         $group: {
//           _id: { year: { $year: "$receivedDate" }, month: { $month: "$receivedDate" } },
//           totalCollected: { $sum: "$receivedAmount" },
//           totalDue: { $sum: "$dueAmount" }
//         }
//       },
//       {
//         $sort: { "_id.year": 1, "_id.month": 1 }
//       }
//     ]);

//     const paymentMethodReport = await FeeRecord.aggregate([
//       {
//         $group: {
//           _id: "$paymentMethod",
//           totalAmount: { $sum: "$receivedAmount" }
//         }
//       }
//     ]);

//     res.status(200).json({ monthlyReport, paymentMethodReport });
//   } catch (error) {
//     console.error("Error fetching fee reports:", error);
//     res.status(500).json({ message: 'Failed to fetch fee reports', error: error.message });
//   }
// };





// // @desc    Get aggregated fee reports
// // @route   GET /api/fees/reports
// // @access  Private/Admin & Accountant
// export const getFeeReports = asyncHandler(async (req, res) => {
//   const { year } = req.query;
//   const matchFilter = {};

//   if (year) {
//     matchFilter.year = parseInt(year);
//   }

//   try {
//     const monthlyReport = await FeeRecord.aggregate([
//       {
//         $match: matchFilter // Use the filter here
//       },
//       {
//         $group: {
//           _id: { year: "$year", month: "$month" },
//           totalCollected: { $sum: "$receivedAmount" },
//           totalDue: { $sum: "$dueAmount" }
//         }
//       },
//       {
//         $sort: { "_id.year": 1, "_id.month": 1 }
//       }
//     ]);

//     const paymentMethodReport = await FeeRecord.aggregate([
//       {
//         $match: { ...matchFilter, paymentMethod: { $ne: null } }
//       },
//       {
//         $group: {
//           _id: "$paymentMethod",
//           totalAmount: { $sum: "$receivedAmount" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           paymentMethod: "$_id",
//           totalAmount: 1
//         }
//       }
//     ]);

//     res.status(200).json({ monthlyReport, paymentMethodReport });
//   } catch (error) {
//     console.error("Error fetching fee reports:", error);
//     res.status(500).json({ message: 'Failed to fetch fee reports', error: error.message });
//   }
// });





// @desc    Get aggregated fee reports
// @route   GET /api/fees/reports
// @access  Private/Admin & Accountant
export const getFeeReports = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const matchFilter = {};

  if (year) {
    matchFilter.year = parseInt(year);
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