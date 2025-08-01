// // backend/controllers/attendanceController.js
// import asyncHandler from 'express-async-handler';
// import Attendance from '../models/Attendance.js';
// import Student from '../models/Student.js';
// import Staff from '../models/Staff.js';
// import { getMonthDateRange } from '../utils/dateUtils.js';

// // @desc    Mark attendance for students or staff
// // @route   POST /api/attendance/mark
// // @access  Private/Admin & Teacher
// const markAttendance = asyncHandler(async (req, res) => {
//   const { date, attendanceRecords, type } = req.body;

//   if (!date || !attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0 || !type) {
//     res.status(400);
//     throw new Error('Invalid attendance data. Please provide date, type, and an array of records.');
//   }

//   // To prevent duplicate entries, we'll upsert or simply create a record per entry
//   const bulkOps = attendanceRecords.map(record => ({
//     updateOne: {
//       filter: { user: record.userId, date: new Date(date).setHours(0, 0, 0, 0) },
//       update: {
//         $set: {
//           user: record.userId,
//           onModel: type,
//           date: new Date(date).setHours(0, 0, 0, 0),
//           status: record.status,
//           markedBy: req.user._id || req.user.cnic,
//           reason: record.reason,
//           // If marking for student, include student-specific details
//           ...(type === 'Student' && {
//             studentDetails: {
//               class: record.studentClass,
//               classNumber: record.studentClassNumber,
//               semester: record.studentSemester,
//               degreeName: record.studentDegreeName,
//               majorSubject: record.studentMajorSubject,
//             }
//           }),
//         },
//       },
//       upsert: true, // This is key. It will create a new document if one doesn't exist.
//     },
//   }));

//   const result = await Attendance.bulkWrite(bulkOps);

//   res.status(201).json({
//     message: `${result.upsertedCount} new attendance records created, ${result.modifiedCount} records updated.`,
//     result,
//   });
// });

// // @desc    Get attendance records with filters (Admin only)
// // @route   GET /api/attendance
// // @access  Private/Admin
// const getAttendance = asyncHandler(async (req, res) => {
//   const { type, startDate, endDate, status } = req.query;

//   const query = {};
//   if (type) query.onModel = type;
//   if (status) query.status = status;
//   if (startDate && endDate) {
//     query.date = {
//       $gte: new Date(startDate).setHours(0, 0, 0, 0),
//       $lte: new Date(endDate).setHours(23, 59, 59, 999),
//     };
//   }

//   const attendance = await Attendance.find(query)
//     .populate('user', 'name cnic')
//     .populate('markedBy', 'name cnic');

//   res.json(attendance);
// });

// // @desc    Get a single student's attendance history
// // @route   GET /api/attendance/student/:id
// // @access  Private/Student, Admin, Teacher
// const getStudentAttendance = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { year, month } = req.query;

//   let startDate, endDate;
//   if (year && month) {
//     const { start, end } = getMonthDateRange(year, month);
//     startDate = start;
//     endDate = end;
//   } else {
//     // Default to a 30-day window if no year/month is specified
//     endDate = new Date();
//     startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30);
//   }

//   const attendance = await Attendance.find({
//     user: id,
//     onModel: 'Student',
//     date: { $gte: startDate, $lte: endDate },
//   }).sort({ date: -1 });

//   const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
//   const presentDays = attendance.filter(record => record.status === 'Present').length;
//   const absentDays = attendance.filter(record => record.status === 'Absent').length;
//   const leaveDays = attendance.filter(record => record.status === 'Leave').length;

//   res.json({
//     summary: { totalDays, presentDays, absentDays, leaveDays },
//     records: attendance,
//   });
// });

// // @desc    Get a single staff member's attendance history
// // @route   GET /api/attendance/staff/:id
// // @access  Private/Staff, Admin
// const getStaffAttendance = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { year, month } = req.query;

//   let startDate, endDate;
//   if (year && month) {
//     const { start, end } = getMonthDateRange(year, month);
//     startDate = start;
//     endDate = end;
//   } else {
//     endDate = new Date();
//     startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30);
//   }

//   const attendance = await Attendance.find({
//     user: id,
//     onModel: 'Staff',
//     date: { $gte: startDate, $lte: endDate },
//   }).sort({ date: -1 });

//   const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
//   const presentDays = attendance.filter(record => record.status === 'Present').length;
//   const absentDays = attendance.filter(record => record.status === 'Absent').length;
//   const leaveDays = attendance.filter(record => record.status === 'Leave').length;

//   res.json({
//     summary: { totalDays, presentDays, absentDays, leaveDays },
//     records: attendance,
//   });
// });

// // @desc    Get a list of students for attendance marking
// // @route   GET /api/attendance/students
// // @access  Private/Admin & Teacher
// const getStudentsForAttendance = asyncHandler(async (req, res) => {
//   const { classType, classNumber, degreeName, semester, majorSubject } = req.query;

//   const filters = {};
//   if (classType) filters.class = classType;
//   if (classNumber) filters.classNumber = classNumber;
//   if (degreeName) filters.degreeName = degreeName;
//   if (semester) filters.semester = semester;
//   if (majorSubject) filters.majorSubject = majorSubject;

//   // Teachers can only see students in classes they teach (you'd need to add a check here)
//   // For now, this will return all students based on filters
//   const students = await Student.find(filters).select('_id name cnic class classNumber semester degreeName majorSubject');
//   res.json(students);
// });

// // @desc    Get a list of staff for attendance marking
// // @route   GET /api/attendance/staff
// // @access  Private/Admin
// const getStaffForAttendance = asyncHandler(async (req, res) => {
//   const staff = await Staff.find({}).select('_id name cnic designation');
//   res.json(staff);
// });

// export {
//   markAttendance,
//   getAttendance,
//   getStudentAttendance,
//   getStaffAttendance,
//   getStudentsForAttendance,
//   getStaffForAttendance,
// };



// backend/controllers/attendanceController.js
import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import { getMonthDateRange } from '../utils/dateUtils.js';

// @desc    Mark attendance for students or staff
// @route   POST /api/attendance/mark
// @access  Private/Admin & Teacher
const markAttendance = asyncHandler(async (req, res) => {
  const { date, attendanceRecords, type } = req.body;

  if (!date || !attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0 || !type) {
    res.status(400);
    throw new Error('Invalid attendance data. Please provide date, type, and an array of records.');
  }

  const bulkOps = attendanceRecords.map(record => ({
    updateOne: {
      filter: { user: record.userId, date: new Date(date).setHours(0, 0, 0, 0) },
      update: {
        $set: {
          user: record.userId,
          onModel: type,
          date: new Date(date).setHours(0, 0, 0, 0),
          status: record.status,
          markedBy: req.user.id,
          reason: record.reason,
          // If marking for student, include student-specific details
          ...(type === 'Student' && {
            studentDetails: {
              class: record.studentClass,
              classNumber: record.studentClassNumber,
              semester: record.studentSemester,
              degreeName: record.studentDegreeName,
              majorSubject: record.studentMajorSubject,
            }
          }),
        },
      },
      upsert: true,
    },
  }));

  const result = await Attendance.bulkWrite(bulkOps);

  res.status(201).json({
    message: `${result.upsertedCount} new attendance records created, ${result.modifiedCount} records updated.`,
    result,
  });
});

// @desc    Get attendance records with filters (Admin only)
// @route   GET /api/attendance
// @access  Private/Admin
const getAttendance = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, status } = req.query;

  const query = {};
  if (type) query.onModel = type;
  if (status) query.status = status;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate).setHours(0, 0, 0, 0),
      $lte: new Date(endDate).setHours(23, 59, 59, 999),
    };
  }

  const attendance = await Attendance.find(query)
    .populate('user', 'name cnic')
    .populate('markedBy', 'role');

  res.json(attendance);
});

// @desc    Get a single student's attendance history
// @route   GET /api/attendance/student/:id
// @access  Private/Student, Admin, Teacher
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { year, month } = req.query;

  let startDate, endDate;
  if (year && month) {
    const { start, end } = getMonthDateRange(year, month);
    startDate = start;
    endDate = end;
  } else {
    // Default to a 30-day window if no year/month is specified
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
  }

  const attendance = await Attendance.find({
    user: id,
    onModel: 'Student',
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const presentDays = attendance.filter(record => record.status === 'Present').length;
  const absentDays = attendance.filter(record => record.status === 'Absent').length;
  const leaveDays = attendance.filter(record => record.status === 'Leave').length;

  res.json({
    summary: { totalDays, presentDays, absentDays, leaveDays },
    records: attendance,
  });
});

// @desc    Get a single staff member's attendance history
// @route   GET /api/attendance/staff/:id
// @access  Private/Staff, Admin
const getStaffAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { year, month } = req.query;

  let startDate, endDate;
  if (year && month) {
    const { start, end } = getMonthDateRange(year, month);
    startDate = start;
    endDate = end;
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
  }

  const attendance = await Attendance.find({
    user: id,
    onModel: 'Staff',
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const presentDays = attendance.filter(record => record.status === 'Present').length;
  const absentDays = attendance.filter(record => record.status === 'Absent').length;
  const leaveDays = attendance.filter(record => record.status === 'Leave').length;

  res.json({
    summary: { totalDays, presentDays, absentDays, leaveDays },
    records: attendance,
  });
});

// @desc    Get a list of students for attendance marking (Admin, Teacher)
// @route   GET /api/attendance/students
// @access  Private/Admin & Teacher
const getStudentsForAttendance = asyncHandler(async (req, res) => {
  const { classType, classNumber, degreeName, semester, majorSubject } = req.query;

  console.log('Received student filter query:', req.query);

  const filters = {};
  if (classType) filters.class = classType;
  if (classNumber) filters.classNumber = classNumber;
  if (degreeName) filters.degreeName = degreeName;
  if (semester) filters.semester = parseInt(semester, 10); // Ensure semester is an integer
  if (majorSubject) filters.majorSubject = majorSubject;

  console.log('Constructed student filter object:', filters);

  const students = await Student.find(filters).select('_id name cnic class classNumber semester degreeName majorSubject');
  res.json(students);
});

// @desc    Get a list of staff for attendance marking (Admin)
// @route   GET /api/attendance/staff
// @access  Private/Admin
const getStaffForAttendance = asyncHandler(async (req, res) => {
  const { role } = req.query;

  console.log('Received staff filter query:', req.query);

  const filters = {};
  if (role) filters.role = role;

  console.log('Constructed staff filter object:', filters);

  const staff = await Staff.find(filters).select('_id name cnic designation role');
  res.json(staff);
});

export {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getStaffAttendance,
  getStudentsForAttendance,
  getStaffForAttendance,
};