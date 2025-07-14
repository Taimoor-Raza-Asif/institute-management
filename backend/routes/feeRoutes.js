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
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', getAllFees);
router.get('/student/:studentId', getFeesByStudent);
router.post('/', upload.single('screenshot'), createFeeRecord);
router.put('/:id', upload.single('screenshot'), updateFeeRecord);
router.delete('/:id', deleteFeeRecord);

export default router;