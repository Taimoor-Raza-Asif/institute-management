// backend/routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  authUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleEditMode,
  registerAdminUser,
  toggleAllEditMode,
  updateUserModuleAccess,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authUser); // Login endpoint
// router.post('/register', registerUser); // Typically, registration might be public or admin-only

router.post('/register-admin', registerAdminUser);

// Admin-only routes for user management
// For simplicity, we'll make registerUser admin-only here to control user creation
router.post('/register', registerUser);
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.get('/:id', protect, authorizeRoles('admin'), getUserById);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);
router.put('/:id/editmode', protect, authorizeRoles('admin'), toggleEditMode); // Toggle edit mode for a user
router.put('/:id/module-access', protect, authorizeRoles('admin'), updateUserModuleAccess);

router.put('/editmode/:role', protect, authorizeRoles('admin'), toggleAllEditMode);
export default router;
