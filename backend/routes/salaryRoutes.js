// backend/routes/salaryRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createOrUpdateSalary,
  getAllSalaries,
  getMySalaries,
  getSalaryById,
  getStaffForSalary,
} from '../controllers/salaryController.js';

const router = express.Router();

// Get a list of all staff members (for Admin to manage salaries)
router.get('/staff', protect, authorizeRoles('admin', 'accountant'), getStaffForSalary);

// Get all salary records (Admin only)
router.get('/all', protect, authorizeRoles('admin', 'accountant'), getAllSalaries);

// Get a single staff member's salary records
router.get('/my-salaries', protect, authorizeRoles('admin', 'accountant', 'teacher', 'cook', 'cleaner'), getMySalaries);

// Create or update a salary record (Admin only)
router.post('/', protect, authorizeRoles('admin', 'accountant'), createOrUpdateSalary);

// Get a single salary record by ID (Admin or the specific staff member)
router.get('/:id', protect, authorizeRoles('admin', 'accountant', 'teacher', 'cook', 'cleaner'), getSalaryById);

export default router;