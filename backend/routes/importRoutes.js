import express from 'express';
import multer from 'multer';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { previewImport, commitImport } from '../controllers/importController.js';

const router = express.Router();

// Use memory storage; keep small files in memory for preview/commit
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Preview parsed headers and sample rows
router.post('/:entity/preview', protect, authorizeRoles('admin', 'accountant'), upload.single('file'), previewImport);

// Commit import with mapping
router.post('/:entity/commit', protect, authorizeRoles('admin', 'accountant'), upload.single('file'), commitImport);

export default router;
