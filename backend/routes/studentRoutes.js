// backend/routes/studentRoutes.js
import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentFeeStatus
} from '../controllers/studentController.js';
import multer from 'multer'; // Import multer
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the subdirectory based on file field name
    let uploadPath = path.join(__dirname, '../uploads');
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(uploadPath, 'profilePictures');
    } else {
      // For all other documents, put them in a 'documents' subfolder
      uploadPath = path.join(uploadPath, 'documents');
    }

    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Define the fields for multer.fields()
const studentUploadFields = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'bForm', maxCount: 1 },
  { name: 'characterCertificate', maxCount: 1 },
  { name: 'previousClassResult', maxCount: 1 },
  { name: 'class10Result', maxCount: 1 },
  { name: 'class12Result', maxCount: 1 },
]);

// GET all students
router.get('/', getAllStudents);

// GET a single student by ID
router.get('/:id', getStudentById);

// POST create a new student with multiple file uploads
router.post('/', studentUploadFields, createStudent);

// PUT update an existing student by ID with multiple file uploads
router.put('/:id', studentUploadFields, updateStudent);

// DELETE a student by ID
router.delete('/:id', deleteStudent);

// PATCH update student fee status (no file upload needed here)
router.patch('/:id/fee-status', updateStudentFeeStatus);

export default router;
