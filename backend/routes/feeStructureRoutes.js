// backend/routes/feeStructureRoutes.js
import express from 'express';
import {
    getFeeStructure,
    updateFeeStructure,
    syncFeeStructureFromAcademic,
} from '../controllers/feeStructureController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/fee-structure
// @access  Private (All authenticated users — needed for student form auto-fill)
router.get('/', protect, getFeeStructure);

// @route   PUT /api/fee-structure
// @access  Private/Admin
router.put('/', protect, authorizeRoles('admin'), updateFeeStructure);

// @route   POST /api/fee-structure/sync
// @desc    Sync fee types from current academic structure (preserves existing fee values)
// @access  Private/Admin
router.post('/sync', protect, authorizeRoles('admin'), syncFeeStructureFromAcademic);

export default router;
