// backend/routes/dashboardRoutes.js
import express from 'express';
import { getDailySummary } from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily-summary', protect, authorizeRoles('admin'), getDailySummary);

export default router;
