// backend/routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  authUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleEditMode
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authUser); // Login endpoint
// router.post('/register', registerUser); // Typically, registration might be public or admin-only



// Admin-only routes for user management
// For simplicity, we'll make registerUser admin-only here to control user creation
router.post('/register', registerUser);
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.get('/:id', protect, authorizeRoles('admin'), getUserById);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);
router.put('/:id/editmode', protect, authorizeRoles('admin'), toggleEditMode); // Toggle edit mode for a user

export default router;


// // backend/routes/userRoutes.js
// import express from 'express';
// import {
//   registerUser, // Make sure you have this controller
//   loginUser,
//   // getMe,
//   getAllUsers, // If you have an endpoint to get all users
// } from '../controllers/userController.js';
// import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Public routes (no authentication needed)
// router.post('/register', registerUser); // Route to register a new user
// router.post('/login', loginUser);       // Route for user login

// // Protected routes (require a valid token)
// // router.get('/me', protect, getMe);

// // Admin-only routes (require 'admin' role)
// router.get('/', protect, authorizeRoles('admin'), getAllUsers); // Example: Get all users, only for admin

// export default router;
