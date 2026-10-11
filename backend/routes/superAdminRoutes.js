// backend/routes/superAdminRoutes.js
import express from 'express';
import {
  promoteSelf,
  getAdminUsers,
  initiateAdminDeletion,
  undoAdminDeletion,
  toggleAdminActive,
} from '../controllers/superAdminController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Any authenticated admin can self-promote using the secret key in the request body
router.post('/promote-self', protect, promoteSelf);

// All routes below require authentication + super_admin role
router.get('/admins', protect, isSuperAdmin, getAdminUsers);
router.post('/admins/:id/initiate-delete', protect, isSuperAdmin, initiateAdminDeletion);
router.post('/admins/:id/undo-delete', protect, isSuperAdmin, undoAdminDeletion);
router.put('/admins/:id/toggle-active', protect, isSuperAdmin, toggleAdminActive);

export default router;
