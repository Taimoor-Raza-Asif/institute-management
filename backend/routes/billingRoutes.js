import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  addBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  downloadReceipt,
  upload
} from '../controllers/billingController.js';

const router = express.Router();

const allowedRoles = ['admin', 'accountant'];

router.route('/')
  .post(protect, authorizeRoles(...allowedRoles), upload, addBill)
  .get(protect, authorizeRoles(...allowedRoles), getBills);

router.route('/:id')
  .get(protect, authorizeRoles(...allowedRoles), getBillById)
  .put(protect, authorizeRoles(...allowedRoles), upload, updateBill)
  .delete(protect, authorizeRoles(...allowedRoles), deleteBill);

router.get('/:id/receipt', protect, authorizeRoles(...allowedRoles), downloadReceipt);

export default router;