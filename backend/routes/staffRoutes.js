// // backend/routes/staffRoutes.js
// import express from 'express';
// import {
//   createStaff,
//   getAllStaff,
//   getStaffById,
//   updateStaff,
//   deleteStaff,
//   recordAttendance,
//   getStaffAttendance,
//   requestLeave,
//   updateLeaveStatus,
//   getAllLeaveRequests,
// } from '../controllers/staffController.js';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // Helper to get __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Multer storage configuration for staff profile pictures
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '../uploads/staffProfilePictures');
//     fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//   }
// });

// const upload = multer({ storage: storage });

// const router = express.Router();

// // CRUD operations for Staff
// router.post('/', upload.single('profilePicture'), createStaff);
// router.get('/', getAllStaff);
// router.get('/:id', getStaffById);
// router.put('/:id', upload.single('profilePicture'), updateStaff);
// router.delete('/:id', deleteStaff);

// // Attendance routes
// router.post('/attendance', recordAttendance); // For QR scan or manual check-in/out
// router.get('/:id/attendance', getStaffAttendance); // Get attendance for a specific staff member

// // Leave request routes
// router.post('/:id/leave-requests', requestLeave); // Staff submits leave request
// router.patch('/:staffId/leave-requests/:requestId', updateLeaveStatus); // Admin updates leave status
// router.get('/leave-requests', getAllLeaveRequests); // Admin views all leave requests

// export default router;







// backend/routes/staffRoutes.js
import express from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  recordAttendance,
  getStaffAttendance,
  requestLeave,
  updateLeaveStatus,
  getAllLeaveRequests,
  updateAssignedClasses
  // assignClasses
} from '../controllers/staffController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // <--- NEW: Import auth middleware

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration for staff profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/staffProfilePictures');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// --- PROTECTED ROUTES ---

// Get staff member's own data (for staff roles)
router.get('/my-data/:id', protect, authorizeRoles('teacher', 'accountant', 'cook', 'cleaner'), getStaffById); // Ensure getStaffById handles req.user.profileId
router.get('/profile/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffById);


// CRUD operations for Staff (Admin only for full CRUD)
router.post('/', upload.single('profilePicture'), createStaff);
router.get('/', protect, authorizeRoles('admin'), getAllStaff); // Admin can view all staff
router.get('/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffById); //////// Change made here 'teacher', 'accountant', 'cook', 'cleaner'
router.put('/:id', protect, authorizeRoles('admin'), upload.single('profilePicture'), updateStaff); // Staff can update their own profile, Admin can update any

router.delete('/:id', protect, authorizeRoles('admin'), deleteStaff);

// Attendance routes
router.post('/attendance', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), recordAttendance); // All staff can record attendance
router.get('/:id/attendance', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffAttendance); // Staff can view their own attendance, Admin can view any

router.put('/:id/assign-classes', protect, authorizeRoles('admin'), updateAssignedClasses);

// // Leave request routes
// router.post('/:id/leave-requests', protect, authorizeRoles('teacher', 'accountant', 'cook', 'cleaner'), requestLeave); // Staff submit leave request
// router.patch('/:staffId/leave-requests/:requestId', protect, authorizeRoles('admin'), updateLeaveStatus); // Admin updates leave status
// router.get('/leave-requests', protect, authorizeRoles('admin'), getAllLeaveRequests); // Admin views all leave requests

export default router;

