import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getSalaryStructure,
  updateSalaryStructure,
  previewSalaryStructure,
  applySalaryStructure,
} from '../controllers/salaryStructureController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'accountant'), getSalaryStructure)
  .put(protect, authorizeRoles('admin', 'accountant'), updateSalaryStructure);

router.get('/preview', protect, authorizeRoles('admin', 'accountant'), previewSalaryStructure);
router.post('/apply', protect, authorizeRoles('admin', 'accountant'), applySalaryStructure);

export default router;
