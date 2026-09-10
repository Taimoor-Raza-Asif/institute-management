// backend/routes/bankAccountRoutes.js
import express from 'express';
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '../controllers/bankAccountController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all accounts — admin & accountant can read (for dropdowns)
router.get('/', protect, authorizeRoles('admin', 'accountant'), getBankAccounts);

// GET by ID
router.get('/:id', protect, authorizeRoles('admin'), getBankAccountById);

// POST create — admin only
router.post('/', protect, authorizeRoles('admin'), createBankAccount);

// PUT update — admin only
router.put('/:id', protect, authorizeRoles('admin'), updateBankAccount);

// DELETE — admin only
router.delete('/:id', protect, authorizeRoles('admin'), deleteBankAccount);

export default router;
