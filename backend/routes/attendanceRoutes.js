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
  getAttendanceByDate
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

// @desc    Get list of students for attendance marking (Admin, Teacher)
// @route   GET /api/attendance/students
// @access  Private/Admin & Teacher
// THIS ROUTE MUST BE DEFINED BEFORE THE /student/:id ROUTE
router.get('/students', protect, authorizeRoles('admin', 'teacher'), getStudentsForAttendance);


router
  .route('/reports')
  .get(protect, authorizeRoles('admin', 'teacher'), getAttendanceReports);



// @desc    Get list of staff for attendance marking (Admin)
// @route   GET /api/attendance/staff
// @access  Private/Admin
// THIS ROUTE MUST BE DEFINED BEFORE THE /staff/:id ROUTE
router.get('/staff', protect, authorizeRoles('admin'), getStaffForAttendance);

// @desc    Get a single student's attendance history
// @route   GET /api/attendance/student/:id
// @access  Private/Student, Admin, Teacher
router.get('/student/:id', protect, authorizeRoles('admin', 'teacher', 'student'), getStudentAttendance);

// @desc    Get a single staff member's attendance history
// @route   GET /api/attendance/staff/:id
// @access  Private/Staff, Admin
router.get('/staff/:id', protect, authorizeRoles('admin', 'teacher', 'accountant', 'cook', 'cleaner'), getStaffAttendance);

router
  .route('/:date')
  .get(protect, authorizeRoles('admin', 'teacher'), getAttendanceByDate);

export default router;