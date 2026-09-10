// backend/routes/coaRoutes.js
import express from 'express';
import {
  getAccounts,
  getAccountTree,
  getAccountsByType,
  createAccount,
  updateAccount,
  deleteAccount,
  triggerSeed,
} from '../controllers/coaController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Read — admin and accountant
router.get('/', protect, authorizeRoles('admin', 'accountant'), getAccounts);
router.get('/tree', protect, authorizeRoles('admin', 'accountant'), getAccountTree);
router.get('/type/:type', protect, authorizeRoles('admin', 'accountant'), getAccountsByType);

// Write — admin only
router.post('/seed', protect, authorizeRoles('admin'), triggerSeed);
router.post('/', protect, authorizeRoles('admin'), createAccount);
router.put('/:id', protect, authorizeRoles('admin'), updateAccount);
router.delete('/:id', protect, authorizeRoles('admin'), deleteAccount);

export default router;
