// backend/routes/feeRoutes.js

import express from 'express';
import {
  getAllFees,
  getFeesByStudent,
  createFeeRecord,
  updateFeeRecord,
  deleteFeeRecord
} from '../controllers/feeController.js';
import multer from 'multer';
import path from 'path'; // path is not used directly here, but often needed for diskStorage

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure 'uploads/' directory exists in your backend root
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', getAllFees);
router.get('/student/:studentId', getFeesByStudent);

// --- KEY CHANGE HERE ---
// Change 'screenshot' to 'billScreenshot' to match your FeeForm.jsx
router.post('/', upload.single('billScreenshot'), createFeeRecord);
router.put('/:id', upload.single('billScreenshot'), updateFeeRecord);
// --- END KEY CHANGE ---

router.delete('/:id', deleteFeeRecord); // No file upload, so no Multer needed here

export default router;