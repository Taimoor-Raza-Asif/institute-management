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

//   const bulkOps = attendanceRecords.map(record => ({
//     updateOne: {
//       filter: { user: record.userId, date: new Date(date).setHours(0, 0, 0, 0) },
//       update: {
//         $set: {
//           user: record.userId,
//           onModel: type,
//           date: new Date(date).setHours(0, 0, 0, 0),
//           status: record.status,
//           markedBy: req.user.id,
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
//       upsert: true,
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
//     .populate('markedBy', 'role');

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

// // @desc    Get a list of students for attendance marking (Admin, Teacher)
// // @route   GET /api/attendance/students
// // @access  Private/Admin & Teacher
// const getStudentsForAttendance = asyncHandler(async (req, res) => {
//   const { classType, classNumber, degreeName, semester, majorSubject } = req.query;

//   console.log('Received student filter query:', req.query);

//   const filters = {};
//   if (classType) filters.class = classType;
//   if (classNumber) filters.classNumber = classNumber;
//   if (degreeName) filters.degreeName = degreeName;
//   if (semester) filters.semester = parseInt(semester, 10); // Ensure semester is an integer
//   if (majorSubject) filters.majorSubject = majorSubject;

//   console.log('Constructed student filter object:', filters);

//   const students = await Student.find(filters).select('_id name cnic class classNumber semester degreeName majorSubject');
//   res.json(students);
// });

// // @desc    Get a list of staff for attendance marking (Admin)
// // @route   GET /api/attendance/staff
// // @access  Private/Admin
// const getStaffForAttendance = asyncHandler(async (req, res) => {
//   const { role } = req.query;

//   console.log('Received staff filter query:', req.query);

//   const filters = {};
//   if (role) filters.role = role;

//   console.log('Constructed staff filter object:', filters);

//   const staff = await Staff.find(filters).select('_id name cnic designation role');
//   res.json(staff);
// });

// // @desc    Get attendance records for a single day
// // @route   GET /api/attendance/:date
// // @access  Private/Admin & Teacher
// const getAttendanceByDate = asyncHandler(async (req, res) => {
//   const { date } = req.params;
//   const startOfDay = new Date(date);
//   startOfDay.setHours(0, 0, 0, 0);

//   const endOfDay = new Date(date);
//   endOfDay.setHours(23, 59, 59, 999);

//   const attendanceRecords = await Attendance.find({
//     date: { $gte: startOfDay, $lte: endOfDay }
//   })
//     .populate('user');

//   res.json(attendanceRecords);
// });

// // @desc    Get aggregated attendance reports
// // @route   GET /api/attendance/reports
// // @access  Private/Admin & Accountant
// export const getAttendanceReports = asyncHandler(async (req, res) => {
//   const { type, startDate, endDate } = req.query;
//   const matchFilter = {};

//   if (type) {
//     matchFilter.onModel = type;
//   }
  
//   if (startDate || endDate) {
//     matchFilter.date = {};
//     if (startDate) {
//       matchFilter.date.$gte = new Date(startDate);
//     }
//     if (endDate) {
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);
//       matchFilter.date.$lte = end;
//     }
//   }

//   try {
//     const monthlySummary = await Attendance.aggregate([
//       {
//         $match: matchFilter
//       },
//       {
//         $group: {
//           _id: { year: { $year: "$date" }, month: { $month: "$date" }, onModel: "$onModel" },
//           statuses: { $push: "$status" }
//         }
//       },
//       {
//         $unwind: "$statuses"
//       },
//       {
//         $group: {
//           _id: { year: "$_id.year", month: "$_id.month", onModel: "$_id.onModel", status: "$statuses" },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $group: {
//           _id: { year: "$_id.year", month: "$_id.month", onModel: "$_id.onModel" },
//           statuses: {
//             $push: {
//               status: "$_id.status",
//               count: "$count"
//             }
//           }
//         }
//       },
//       {
//         $sort: { "_id.year": 1, "_id.month": 1 }
//       }
//     ]);

//     const dailySummary = await Attendance.aggregate([
//       {
//         $match: matchFilter
//       },
//       {
//         $group: {
//           _id: { date: "$date", onModel: "$onModel" },
//           statuses: { $push: "$status" }
//         }
//       },
//       {
//         $unwind: "$statuses"
//       },
//       {
//         $group: {
//           _id: { date: "$_id.date", onModel: "$_id.onModel", status: "$statuses" },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $group: {
//           _id: { date: "$_id.date", onModel: "$_id.onModel" },
//           statuses: {
//             $push: {
//               status: "$_id.status",
//               count: "$count"
//             }
//           }
//         }
//       },
//       {
//         $sort: { "_id.date": -1 }
//       },
//       {
//         $limit: 30
//       }
//     ]);

//     res.status(200).json({ monthlySummary, dailySummary });
//   } catch (error) {
//     console.error("Error fetching attendance reports:", error);
//     res.status(500).json({ message: 'Failed to fetch attendance reports', error: error.message });
//   }
// });


// // @desc    Get students for a teacher's assigned classes
// // @route   GET /api/attendance/students/assigned
// // @access  Private/Teacher
// export const getAssignedStudents = async (req, res) => {
//     try {
//         // req.staff is populated from your authentication middleware
//         const teacher = await Staff.findById(req.staff._id);

//         if (!teacher || teacher.staffType !== 'Teacher') {
//             return res.status(403).json({ message: 'Access denied. Only teachers can view this data.' });
//         }

//         const assignedClassNames = teacher.assignedClasses.map(assignment => assignment.className);

//         const students = await Student.find({ class: { $in: assignedClassNames } }).select('-password');
        
//         res.status(200).json(students);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };


// export {
//   markAttendance,
//   getAttendance,
//   getStudentAttendance,
//   getStaffAttendance,
//   getStudentsForAttendance,
//   getStaffForAttendance,
//   getAttendanceByDate,
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

  // Role-based validation
  const user = req.user;
  if (user.role === 'teacher' && type === 'Student') {
    const teacher = await Staff.findById(user.profileId).select('assignClasses').lean();
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found.');
    }
    
    // Check if the teacher is authorized to mark for these classes/semesters
    const assignedClasses = teacher.assignClasses || [];
    const isAuthorized = attendanceRecords.every(record => {
      if (record.studentClassNumber) {
        // Class-based assignment
        return assignedClasses.some(ac => ac.type === 'Class' && ac.classNumber === record.studentClassNumber);
      } else if (record.studentDegreeName && record.studentSemester) {
        // BS degree-based assignment
        return assignedClasses.some(ac => ac.type === 'BS' && ac.degreeName === record.studentDegreeName && ac.semester === record.studentSemester);
      }
      return false;
    });

    if (!isAuthorized) {
      res.status(403);
      throw new Error('You are not authorized to mark attendance for one or more of these classes.');
    }
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
          ...(type === 'Student' && {
            studentDetails: {
              class: record.studentClass,
              classNumber: record.studentClassNumber,
              semester: record.studentSemester,
              degreeName: record.studentDegreeName,
              majorSubject: record.majorSubject,
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

  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
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

// @desc    Get a list of students for attendance marking (Admin only)
// @route   GET /api/attendance/students
// @access  Private/Admin
const getStudentsForAttendance = asyncHandler(async (req, res) => {
  const { classType, classNumber, degreeName, semester, majorSubject } = req.query;

  const filters = {};
  if (classType) filters.class = classType;
  if (classNumber) filters.classNumber = classNumber;
  if (degreeName) filters.degreeName = degreeName;
  if (semester) filters.semester = parseInt(semester, 10);
  if (majorSubject) filters.majorSubject = majorSubject;

  const students = await Student.find(filters).select('_id name cnic class classNumber semester degreeName majorSubject');
  res.json(students);
});

// @desc    Get a list of staff for attendance marking (Admin)
// @route   GET /api/attendance/staff
// @access  Private/Admin
const getStaffForAttendance = asyncHandler(async (req, res) => {
  const { role } = req.query;

  const filters = {};
  if (role) filters.role = role;

  const staff = await Staff.find(filters).select('_id name cnic designation role');
  res.json(staff);
});

// @desc    Get attendance records for a single day
// @route   GET /api/attendance/:date
// @access  Private/Admin & Teacher
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('user');

  res.json(attendanceRecords);
});

// @desc    Get aggregated attendance reports
// @route   GET /api/attendance/reports
// @access  Private/Admin & Accountant
export const getAttendanceReports = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  const matchFilter = {};

  if (type) {
    matchFilter.onModel = type;
  }
  
  if (startDate || endDate) {
    matchFilter.date = {};
    if (startDate) {
      matchFilter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchFilter.date.$lte = end;
    }
  }

  try {
    const monthlySummary = await Attendance.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, onModel: "$onModel" },
          statuses: { $push: "$status" }
        }
      },
      {
        $unwind: "$statuses"
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month", onModel: "$_id.onModel", status: "$statuses" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month", onModel: "$_id.onModel" },
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const dailySummary = await Attendance.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: { date: "$date", onModel: "$onModel" },
          statuses: { $push: "$status" }
        }
      },
      {
        $unwind: "$statuses"
      },
      {
        $group: {
          _id: { date: "$_id.date", onModel: "$_id.onModel", status: "$statuses" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { date: "$_id.date", onModel: "$_id.onModel" },
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $sort: { "_id.date": -1 }
      },
      {
        $limit: 30
      }
    ]);

    res.status(200).json({ monthlySummary, dailySummary });
  } catch (error) {
    console.error("Error fetching attendance reports:", error);
    res.status(500).json({ message: 'Failed to fetch attendance reports', error: error.message });
  }
});


// @desc    Get students for a teacher's assigned classes
// @route   GET /api/attendance/students/assigned
// @access  Private/Teacher
export const getAssignedStudents = asyncHandler(async (req, res) => {
    try {
        const teacher = await Staff.findById(req.user.profileId).select('assignClasses').lean();
        console.log('Requesting teacher ID:', req.user.profileId);
        console.log('Teacher is :', teacher);
        if (!teacher) {
            return res.status(403).json({ message: 'Access denied. Only teachers can view this data.' });
        }

        const assignedClasses = teacher.assignClasses || [];
        const orConditions = assignedClasses.map(assignment => {
          if (assignment.type === 'Class' && assignment.classNumber) {
            return { classNumber: assignment.classNumber };
          } else if (assignment.type === 'BS' && assignment.degreeName && assignment.semester) {
            return { degreeName: assignment.degreeName, semester: assignment.semester };
          }
          return null; // Should not happen with validation
        }).filter(Boolean);

        if (orConditions.length === 0) {
            return res.status(200).json([]);
        }
        
        const students = await Student.find({ $or: orConditions }).select('_id name cnic class classNumber semester degreeName majorSubject');
        
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


export {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getStaffAttendance,
  getStudentsForAttendance,
  getStaffForAttendance,
  getAttendanceByDate,
};