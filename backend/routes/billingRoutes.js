import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  addBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  downloadReceipt,
  getBillReports
} from '../controllers/billingController.js';

import upload from '../middleware/upload.js';

const router = express.Router();

const allowedRoles = ['admin', 'accountant'];

router.route('/')
  .post(protect, authorizeRoles(...allowedRoles), upload.single('attachment'), addBill)
  .get(protect, authorizeRoles(...allowedRoles), getBills);

router
  .route('/reports')
  .get(protect, authorizeRoles('admin', 'accountant'), getBillReports);

router.route('/:id')
  .get(protect, authorizeRoles(...allowedRoles), getBillById)
  .put(protect, authorizeRoles(...allowedRoles), upload.single('attachment'), updateBill)
  .delete(protect, authorizeRoles(...allowedRoles), deleteBill);

router.get('/:id/receipt', protect, authorizeRoles(...allowedRoles), downloadReceipt);

export default router;