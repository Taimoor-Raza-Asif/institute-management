// backend/routes/staffLeaveRoutes.js
import express from 'express';
import {
  createStaffLeaveRequest,
  getAllStaffLeaveRequests,
  getStaffLeaveRequestById,
  updateStaffLeaveRequest,
  deleteStaffLeaveRequest
} from '../controllers/staffLeaveController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Assuming you have these

const router = express.Router();

// Create a staff leave request (Staff can create for themselves, Admin can create for any staff)
router.post('/', protect, authorizeRoles('staff', 'admin', 'teacher', 'accountant', 'cook', 'cleaner'), createStaffLeaveRequest); // All staff types can apply for leave

// Get all staff leave requests (Admin can see all, Staff sees own)
router.get('/', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getAllStaffLeaveRequests);

// Get a single staff leave request
router.get('/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffLeaveRequestById);

// Update staff leave request (approve/reject status, actual return time) - Admin only
router.put('/:id', protect, authorizeRoles('admin'), updateStaffLeaveRequest);

// Delete staff leave request - Admin only, or Staff can delete their own pending request
router.delete('/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), deleteStaffLeaveRequest);

export default router;
