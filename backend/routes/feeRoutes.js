// // backend/routes/feeRoutes.js

// import express from 'express';
// import {
//   getAllFees,
//   getFeesByStudent,
//   createFeeRecord,
//   updateFeeRecord,
//   deleteFeeRecord
// } from '../controllers/feeController.js';
// import multer from 'multer';
// import path from 'path'; // path is not used directly here, but often needed for diskStorage

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Ensure 'uploads/' directory exists in your backend root
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

// router.get('/', getAllFees);
// router.get('/student/:studentId', getFeesByStudent);

// // --- KEY CHANGE HERE ---
// // Change 'screenshot' to 'billScreenshot' to match your FeeForm.jsx
// router.post('/', upload.single('billScreenshot'), createFeeRecord);
// router.put('/:id', upload.single('billScreenshot'), updateFeeRecord);
// // --- END KEY CHANGE ---

// router.delete('/:id', deleteFeeRecord); // No file upload, so no Multer needed here

// export default router;

// backend/routes/feeRoutes.js
import express from 'express';
import {
  getAllFees,
  getFeesByStudent,
  createFeeRecord,
  updateFeeRecord,
  deleteFeeRecord,
  getFeeReports,
  bulkCreateFees
} from '../controllers/feeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';


const router = express.Router();

// --- PROTECTED ROUTES ---

// Get all fees (Admin, Accountant)
router.get('/', protect, authorizeRoles('admin', 'accountant'), getAllFees);

// Get fees for a specific student (Admin, Accountant, or the Student themselves)
router.get('/student/:studentId', protect, authorizeRoles('admin', 'accountant', 'student'), getFeesByStudent);

router
  .route('/reports') // <-- New route
  .get(protect, authorizeRoles('admin', 'accountant'), getFeeReports);

// Bulk create fee records (Admin, Accountant)
router.post('/bulk-create', protect, authorizeRoles('admin', 'accountant'), bulkCreateFees);

// Create a new fee record (Admin, Accountant)
router.post('/', protect, authorizeRoles('admin', 'accountant'), upload.single('billScreenshot'), createFeeRecord);

// Update an existing fee record (Admin, Accountant)
router.put('/:id', protect, authorizeRoles('admin', 'accountant'), upload.single('billScreenshot'), updateFeeRecord);


// Delete a fee record (Admin, Accountant)
router.delete('/:id', protect, authorizeRoles('admin', 'accountant'), deleteFeeRecord);

export default router;

