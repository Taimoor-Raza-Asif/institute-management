// // backend/routes/attendanceRoutes.js
// import express from 'express';
// import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
// import {
//   markAttendance,
//   getAttendance,
//   getStudentAttendance,
//   getStaffAttendance,
//   getStudentsForAttendance,
//   getStaffForAttendance,
//   getAttendanceReports,
//   getAttendanceByDate
// } from '../controllers/attendanceController.js';

// const router = express.Router();

// // @desc    Mark attendance for students or staff (Admin & Teachers)
// // @route   POST /api/attendance/mark
// // @access  Private/Admin & Teacher
// router.post('/mark', protect, authorizeRoles('admin', 'teacher'), markAttendance);

// // @desc    Get attendance records with filters (Admin)
// // @route   GET /api/attendance
// // @access  Private/Admin
// router.get('/', protect, authorizeRoles('admin', 'teacher'), getAttendance);

// // @desc    Get list of students for attendance marking (Admin, Teacher)
// // @route   GET /api/attendance/students
// // @access  Private/Admin & Teacher
// // THIS ROUTE MUST BE DEFINED BEFORE THE /student/:id ROUTE
// router.get('/students', protect, authorizeRoles('admin', 'teacher'), getStudentsForAttendance);


// router
//   .route('/reports')
//   .get(protect, authorizeRoles('admin', 'teacher'), getAttendanceReports);



// // @desc    Get list of staff for attendance marking (Admin)
// // @route   GET /api/attendance/staff
// // @access  Private/Admin
// // THIS ROUTE MUST BE DEFINED BEFORE THE /staff/:id ROUTE
// router.get('/staff', protect, authorizeRoles('admin'), getStaffForAttendance);

// // @desc    Get a single student's attendance history
// // @route   GET /api/attendance/student/:id
// // @access  Private/Student, Admin, Teacher
// router.get('/student/:id', protect, authorizeRoles('admin', 'teacher', 'student'), getStudentAttendance);

// // @desc    Get a single staff member's attendance history
// // @route   GET /api/attendance/staff/:id
// // @access  Private/Staff, Admin
// router.get('/staff/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffAttendance);

// router
//   .route('/:date')
//   .get(protect, authorizeRoles('admin', 'teacher'), getAttendanceByDate);

// export default router;









// backend/routes/attendanceRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getStaffAttendance,
  getStudentsForAttendance,
  getStaffForAttendance,
  getAttendanceReports,
  getAttendanceByDate,
  getAssignedStudents // Import the new function
} from '../controllers/attendanceController.js';

const router = express.Router();

// @desc    Mark attendance for students or staff (Admin & Teachers)
// @route   POST /api/attendance/mark
// @access  Private/Admin & Teacher
router.post('/mark', protect, authorizeRoles('admin', 'teacher'), markAttendance);

// @desc    Get attendance records with filters (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin', 'teacher'), getAttendance);

// @desc    Get list of all students for attendance marking (Admin only)
// @route   GET /api/attendance/students
// @access  Private/Admin
router.get('/students', protect, authorizeRoles('admin'), getStudentsForAttendance);

// @desc    Get list of assigned students for attendance marking (Teacher only)
// @route   GET /api/attendance/students/assigned
// @access  Private/Teacher
router.get('/students/assigned', protect, authorizeRoles('teacher'), getAssignedStudents);

// @desc    Get list of staff for attendance marking (Admin only)
// @route   GET /api/attendance/staff
// @access  Private/Admin
router.get('/staff', protect, authorizeRoles('admin'), getStaffForAttendance);

// @desc    Get attendance for a specific student (Student, Admin, Teacher)
// @route   GET /api/attendance/student/:id
// @access  Private/Student, Admin, Teacher
router.get('/student/:id', protect, authorizeRoles('admin', 'teacher', 'student'), getStudentAttendance);

// @desc    Get attendance for a specific staff member (Staff, Admin)
// @route   GET /api/attendance/staff/:id
// @access  Private/Staff, Admin
router.get('/staff/:id', protect, authorizeRoles('admin', 'teacher'), getStaffAttendance);

// @desc    Get attendance reports (Admin & Accountant)
// @route   GET /api/attendance/reports
// @access  Private/Admin & Accountant
router.get('/reports', protect, authorizeRoles('admin', 'accountant'), getAttendanceReports);

// @desc    Get attendance records for a single day (Admin & Teacher)
// @route   GET /api/attendance/:date
// @access  Private/Admin & Teacher
router.get('/:date', protect, authorizeRoles('admin', 'teacher'), getAttendanceByDate);


export default router;