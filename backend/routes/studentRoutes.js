// // // backend/routes/studentRoutes.js
// // import express from 'express';
// // import {
// //   getAllStudents,
// //   getStudentById,
// //   createStudent,
// //   updateStudent,
// //   deleteStudent,
// //   updateStudentFeeStatus
// // } from '../controllers/studentController.js';
// // import multer from 'multer'; // Import multer
// // import path from 'path';
// // import { fileURLToPath } from 'url';
// // import fs from 'fs'; 

// // // Helper to get __dirname in ES modules
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Multer storage configuration
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     // Determine the subdirectory based on file field name
// //     let uploadPath = path.join(__dirname, '../uploads');
// //     if (file.fieldname === 'profilePicture') {
// //       uploadPath = path.join(uploadPath, 'profilePictures');
// //     } else {
// //       // For all other documents, put them in a 'documents' subfolder
// //       uploadPath = path.join(uploadPath, 'documents');
// //     }

// //     // Ensure the directory exists
// //     fs.mkdirSync(uploadPath, { recursive: true });
// //     cb(null, uploadPath);
// //   },
// //   filename: (req, file, cb) => {
// //     // Generate a unique filename
// //     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
// //   }
// // });

// // const upload = multer({ storage: storage });

// // const router = express.Router();

// // // Define the fields for multer.fields()
// // const studentUploadFields = upload.fields([
// //   { name: 'profilePicture', maxCount: 1 },
// //   { name: 'cnicFront', maxCount: 1 },
// //   { name: 'cnicBack', maxCount: 1 },
// //   { name: 'bForm', maxCount: 1 },
// //   { name: 'characterCertificate', maxCount: 1 },
// //   { name: 'previousClassResult', maxCount: 1 },
// //   { name: 'class10Result', maxCount: 1 },
// //   { name: 'class12Result', maxCount: 1 },
// // ]);

// // // GET all students
// // router.get('/', getAllStudents);

// // // GET a single student by ID
// // router.get('/:id', getStudentById);

// // // POST create a new student with multiple file uploads
// // router.post('/', studentUploadFields, createStudent);

// // // PUT update an existing student by ID with multiple file uploads
// // router.put('/:id', studentUploadFields, updateStudent);

// // // DELETE a student by ID
// // router.delete('/:id', deleteStudent);

// // // PATCH update student fee status (no file upload needed here)
// // router.patch('/:id/fee-status', updateStudentFeeStatus);

// // export default router;



// import express from 'express';
// import {
//   getAllStudents,
//   getStudentById,
//   createStudent,
//   updateStudent,
//   deleteStudent,
//   updateStudentFeeStatus,
//   promoteStudents, // Example of a new controller for admin
//   increaseFee       // Example of a new controller for admin
// } from '../controllers/studentController.js';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // NEW

// // ... (Multer configuration as you have it) ...
// // Helper to get __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Determine the subdirectory based on file field name
//     let uploadPath = path.join(__dirname, '../uploads');
//     if (file.fieldname === 'profilePicture') {
//       uploadPath = path.join(uploadPath, 'profilePictures');
//     } else {
//       // For all other documents, put them in a 'documents' subfolder
//       uploadPath = path.join(uploadPath, 'documents');
//     }

//     // Ensure the directory exists
//     fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique filename
//     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//   }
// });

// const upload = multer({ storage: storage });

// const router = express.Router();

// // Define the fields for multer.fields()
// const studentUploadFields = upload.fields([
//   { name: 'profilePicture', maxCount: 1 },
//   { name: 'cnicFront', maxCount: 1 },
//   { name: 'cnicBack', maxCount: 1 },
//   { name: 'bForm', maxCount: 1 },
//   { name: 'characterCertificate', maxCount: 1 },
//   { name: 'previousClassResult', maxCount: 1 },
//   { name: 'class10Result', maxCount: 1 },
//   { name: 'class12Result', maxCount: 1 },
// ]);

// // User specific routes should get their profile from the user model linked to the student
// router.get('/my-data', protect, authorizeRoles('student'), async (req, res) => {
//   // req.user contains the user object from the token
//   // req.user.profileId is the _id of the linked Student document
//   try {
//     const student = await Student.findById(req.user.profileId);
//     if (!student) {
//       return res.status(404).json({ message: 'Student profile not found.' });
//     }
//     res.json(student);
//   } catch (error) {
//     console.error("Error fetching student's own data:", error);
//     res.status(500).json({ message: 'Server Error fetching student data.' });
//   }
// });

// // Admin and Teacher can view all students (Teacher can only view their subjects students)
// router.get('/', protect, authorizeRoles('admin', 'teacher'), getAllStudents); // You'll need to modify getAllStudents to filter by teacher's subject
// router.get('/:id', protect, authorizeRoles('admin', 'teacher', 'student'), getStudentById); // Student can view own details only, needs logic in getStudentById

// // Admin can create, update, delete students
// router.post('/', protect, authorizeRoles('admin'), studentUploadFields, createStudent);
// router.put('/:id', protect, authorizeRoles('admin', 'teacher'), studentUploadFields, updateStudent); // Teacher can edit (but not delete)
// router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);

// // Admin specific actions
// router.put('/promote', protect, authorizeRoles('admin'), promoteStudents);
// router.put('/increase-fee', protect, authorizeRoles('admin'), increaseFee);

// // Student fee status update (Admin only for full control, or limited by accountant later)
// router.put('/:id/fee-status', protect, authorizeRoles('admin'), updateStudentFeeStatus);

// export default router;

// backend/routes/studentRoutes.js
import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentFeeStatus,
  promoteStudents, // Import promoteStudents
  increaseFee, // Import increaseFee
  promoteStudent, // ADD THIS LINE
  demoteStudent, // ADD THIS LINE
  promoteClass,  // ADD THIS LINE
  demoteClass,
  promoteStudentSemester, // ADD THIS LINE
  demoteStudentSemester, // ADD THIS LINE
  promoteSemester,       // ADD THIS LINE
  demoteSemester
} from '../controllers/studentController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // <--- NEW: Import auth middleware

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../uploads');
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(uploadPath, 'profilePictures');
    } else {
      uploadPath = path.join(uploadPath, 'documents');
    }
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
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

// --- PROTECTED ROUTES ---


router.put('/promote-semester',protect, authorizeRoles('admin', 'teacher'), promoteSemester);           // ADD THIS LINE
router.put('/demote-semester',protect, authorizeRoles('admin', 'teacher'), demoteSemester);  // ADD THIS LINE
router.put('/promote-class', protect, authorizeRoles('admin', 'teacher'), promoteClass); // ADD THIS LINE
router.put('/demote-class', protect, authorizeRoles('admin', 'teacher'), demoteClass);


// Get student's own data (for student role)
router.get('/my-data/:id', protect, authorizeRoles('student', 'admin', 'teacher', 'accountant'), getStudentById); // Ensure getStudentById handles req.user.profileId

router.get('/profile/:id', protect, authorizeRoles('student', 'admin', 'teacher', 'accountant'), getStudentById);


// Admin and Teacher can view all students (Teacher can only view their subjects students - logic in controller)
router.get('/', protect, authorizeRoles('admin', 'teacher', 'accountant'), getAllStudents);

// Get a single student by ID (Admin, Teacher, or Student viewing their own)
router.get('/:id', protect, authorizeRoles('admin', 'teacher', 'student', 'accountant'), getStudentById);

// Admin can create students
router.post('/', protect, authorizeRoles('admin', 'accountant'), studentUploadFields, createStudent);

// Admin and Teacher can update students (Teacher with restrictions)
router.put('/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'student'), studentUploadFields, updateStudent);

// Admin can delete students
router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);





// New routes for student promotion/demotion
router.put('/:id/promote', protect, authorizeRoles('admin', 'teacher'), promoteStudent); // ADD THIS LINE
router.put('/:id/demote', protect, authorizeRoles('admin', 'teacher'), demoteStudent);   // ADD THIS LINE


// Routes for promotion/demotion for semesters (NEW)
router.put('/:id/promote-semester',protect, authorizeRoles('admin', 'teacher'), promoteStudentSemester); // ADD THIS LINE
router.put('/:id/demote-semester',protect, authorizeRoles('admin', 'teacher'), demoteStudentSemester);   // ADD THIS LINE




// Admin specific actions
router.patch('/promote', protect, authorizeRoles('admin'), promoteStudents); // Changed to patch for partial update
router.patch('/increase-fee', protect, authorizeRoles('admin'), increaseFee); // Changed to patch

// Student fee status update (Admin only for full control)
router.patch('/:id/fee-status', protect, authorizeRoles('admin'), updateStudentFeeStatus); // Changed to patch

export default router;
