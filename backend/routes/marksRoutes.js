import express from 'express';
import {
    addMarks,
    updateMarks,
    deleteMarks,
    getMarksByTeacher,
    getMarksByStudent,
    getAllMarks
} from '../controllers/marksController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher can add marks for an assigned subject
router.post('/', protect, authorizeRoles('teacher'), addMarks);

// Teacher can update their own marks
router.put('/:id', protect, authorizeRoles('teacher'), updateMarks);

// Teacher can delete their own marks
router.delete('/:id', protect, authorizeRoles('teacher'), deleteMarks);

// Teacher can view all marks they have entered
router.get('/teacher/:id', protect, authorizeRoles('teacher'), getMarksByTeacher);

// Student can view their own marks
router.get('/student/:id', protect, authorizeRoles('student', 'admin', 'teacher'), getMarksByStudent);

// Admin can view all marks
router.get('/', protect, authorizeRoles('admin'), getAllMarks);

export default router;