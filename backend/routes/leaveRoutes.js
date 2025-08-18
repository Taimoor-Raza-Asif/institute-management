// backend/routes/leaveRoutes.js
import express from 'express';
import {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  updateLeaveStatus
} from '../controllers/leaveController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Assuming you have these

const router = express.Router();

// Create a leave request (Student can create for themselves, Admin/Teacher can create for others)
router.post('/', protect, authorizeRoles('student', 'admin', 'teacher', 'accountant', 'cook', 'cleaner'), createLeaveRequest);

// Get all leave requests (Admin can see all, Teacher might see relevant, Student sees own)
router.get('/', protect, authorizeRoles('admin', 'teacher', 'student'), getAllLeaveRequests);

// Get a single leave request
router.get('/:id', protect, authorizeRoles('admin', 'teacher', 'student'), getLeaveRequestById);

// Update leave request (approve/reject status, actual return time) - Admin/Teacher only
router.put('/:id', protect, authorizeRoles('admin', 'teacher'), updateLeaveRequest);

// New route for approving/rejecting leave requests (Admin/Teacher only)
router.patch('/:id/status', protect, authorizeRoles('admin', 'teacher'), updateLeaveStatus);

// Delete leave request - Admin only, or student can delete own pending request
router.delete('/:id', protect, authorizeRoles('admin', 'student'), deleteLeaveRequest);

export default router;