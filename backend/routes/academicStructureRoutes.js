import express from 'express';
import { getAcademicStructure, updateAcademicStructure } from '../controllers/academicStructureController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin can fetch and update the single academic configuration document
// @route GET /api/academic-structure
// @access Private/All (Readonly access for all authenticated users is recommended for dynamic dropdowns)
router.get('/', protect, getAcademicStructure);

// @route PUT /api/academic-structure
// @access Private/Admin
router.put('/', protect, authorizeRoles('admin'), updateAcademicStructure);

export default router;