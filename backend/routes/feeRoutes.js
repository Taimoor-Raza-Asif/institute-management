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
  getFeeReports
} from '../controllers/feeController.js';
import multer from 'multer';
import path from 'path';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // <--- NEW: Import auth middleware
import { fileURLToPath } from 'url'; // Import fileURLToPath

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/billScreenshots'); // Specific folder for bill screenshots
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// --- PROTECTED ROUTES ---

// Get all fees (Admin, Accountant)
router.get('/', protect, authorizeRoles('admin', 'accountant'), getAllFees);

// Get fees for a specific student (Admin, Accountant, or the Student themselves)
router.get('/student/:studentId', protect, authorizeRoles('admin', 'accountant', 'student'), getFeesByStudent);

router
  .route('/reports') // <-- New route
  .get(protect, authorizeRoles('admin', 'accountant'), getFeeReports);

// Create a new fee record (Admin, Accountant)
router.post('/', protect, authorizeRoles('admin', 'accountant'), upload.single('billScreenshot'), createFeeRecord);

// Update an existing fee record (Admin, Accountant)
router.put('/:id', protect, authorizeRoles('admin', 'accountant'), upload.single('billScreenshot'), updateFeeRecord);


// Delete a fee record (Admin, Accountant)
router.delete('/:id', protect, authorizeRoles('admin', 'accountant'), deleteFeeRecord);

export default router;

