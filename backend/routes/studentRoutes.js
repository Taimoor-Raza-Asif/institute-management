// // backend/routes/studentRoutes.js
// import express from 'express';
// import {
//   getAllStudents,
//   getStudentById,
//   createStudent,
//   updateStudent,
//   deleteStudent,
//   updateStudentFeeStatus
// } from '../controllers/studentController.js';

// const router = express.Router();

// router.get('/', getAllStudents);
// router.get('/:id', getStudentById);
// router.post('/', createStudent);
// router.put('/:id', updateStudent);
// router.delete('/:id', deleteStudent);
// router.patch('/:id/fee-status', updateStudentFeeStatus);

// export default router;


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
import upload from '../middleware/upload.js'; // Import your Multer upload middleware

const router = express.Router();

// GET all students
router.get('/', getAllStudents);

// GET a single student by ID
router.get('/:id', getStudentById);

// POST create a new student
// Uses 'upload.single('profilePicture')' middleware to handle the file upload.
// 'profilePicture' must match the 'name' attribute of your file input in StudentForm.jsx.
router.post('/', upload.single('profilePicture'), createStudent);

// PUT update an existing student by ID
// Also uses 'upload.single('profilePicture')' as a student update might include a new profile picture.
router.put('/:id', upload.single('profilePicture'), updateStudent);

// DELETE a student by ID
router.delete('/:id', deleteStudent);

// PATCH update student fee status (no file upload needed here)
router.patch('/:id/fee-status', updateStudentFeeStatus);

export default router;