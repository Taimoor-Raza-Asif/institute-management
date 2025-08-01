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
router.get('/staff', protect, authorizeRoles('admin'), getStaffForSalary);

// Get all salary records (Admin only)
router.get('/all', protect, authorizeRoles('admin'), getAllSalaries);

// Get a single staff member's salary records
router.get('/my-salaries', protect, authorizeRoles('admin', 'staff', 'teacher'), getMySalaries);

// Create or update a salary record (Admin only)
router.post('/', protect, authorizeRoles('admin'), createOrUpdateSalary);

// Get a single salary record by ID (Admin or the specific staff member)
router.get('/:id', protect, authorizeRoles('admin', 'staff', 'teacher'), getSalaryById);

export default router;