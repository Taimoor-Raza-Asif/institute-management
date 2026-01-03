// backend/controllers/leaveController.js
import asyncHandler from 'express-async-handler';
import LeaveRequest from '../models/LeaveRequest.js';
import Student from '../models/Student.js'; // Assuming you have a Student model
import User from '../models/User.js'; // Assuming User model for staff/admin

import Staff from '../models/Staff.js';   // **NEW: Import your Staff model** (assuming staff is teacher/admin profile)

// Helper function to get the profile name based on user's role and profileId
const getProfileName = async (userId, userRole, profileId, roleMapping) => {
    try {
        if (!userId) return null; // No user ID means no profile to find

        // For roles like 'admin' that might not have a linked profileId
        if (userRole === 'admin' && !profileId) {
            // Admins might not have a dedicated Staff profile, or their name might be stored differently.
            // If admin names are just stored in User.cnic or a default, handle it here.
            // For now, if no profileId, return a placeholder or null.
            // If your admins have a Staff profile, the below logic will handle it.
            return `Admin User (${userId})`; // Or specific logic for admin name if not in Staff profile
        }

        let profile;
        if (roleMapping === 'student' && profileId) {
            profile = await Student.findById(profileId).select('name');
        } else if (roleMapping === 'staff' && profileId) {
            profile = await Staff.findById(profileId).select('name');
        } else {
            // If roleMapping is not 'student' or 'staff', or profileId is missing when expected
            console.warn(`Could not determine profile type for user ID: ${userId} with role: ${userRole} and roleMapping: ${roleMapping}`);
            return null;
        }

        return profile ? profile.name : null;
    } catch (error) {
        console.error(`Error fetching profile name for user ${userId}:`, error.message);
        return null;
    }
};


// Helper function to get user details (optional, but good for reusability)
const getUserDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select('name role'); // Only fetch name and role
    if (user) {
      return { _id: user._id, name: user.name, role: user.role };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

// @desc    Create a new leave request
// @route   POST /api/leave
// @access  Private (Student, Teacher, Admin)
export const createLeaveRequest = asyncHandler(async (req, res) => {
  const {
    studentId,
    startDate,
    endDate,
    addressGoingTo,
    reason,
    pickerName,
    pickerRelation,
    pickerPhoneNumber,
    pickerCnicNumber,
    leaveTime,
    expectedReturnTime,
    classInchargeName // Optional, if staff enters 
  } = req.body;

  const requestedByUserId = req.user.id; // From authMiddleware
  const requestedByUserRole = req.user.role; // From authMiddleware
  const requestedByUserName = req.user.name || req.user.cnic; // Fallback from previous fix
 const requestedByUserProfileId = req.user.profileId; // Get profileId
  const requestedByUserRoleMapping = req.user.roleMapping; // Get roleMapping
  const requestedByUserCnic = req.user.cnic; // User CNIC

  // Determine actual name for the requesting user (Student or Staff)
  const requestedByProfileName = await getProfileName(
      requestedByUserId,
      requestedByUserRole,
      requestedByUserProfileId,
      requestedByUserRoleMapping
  );
  // Determine requestedByType correctly
  let requestedByType;
  if (requestedByUserRole === 'student') {
    requestedByType = 'student'; // Changed to lowercase to match LeaveRequest.js enum
    console.log(`Request by type1 : ${requestedByType}`);
    // If student is applying, ensure studentId matches their profileId
    if (studentId !== req.user.profileId.toString()) {
      res.status(403);
      throw new Error('Student can only create leave requests for themselves.');
    }
  } else {
    requestedByType = requestedByUserRole; // Use actual role for Admin/Teacher to match enum
    console.log(`Request by type2 : ${requestedByType}`);
  }

  // Fetch student details to populate studentName, fatherName, studentClass
  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found.');
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    res.status(400);
    throw new Error('Start date cannot be after end date.');
  }

  let initialStatus = 'Pending';
  let approvedByDetails = null;
  let approvedRejectedAt = null;

  // If an Admin or Teacher creates the request, it's auto-approved by them
  if (requestedByType === 'admin' || requestedByType === 'teacher') {
    initialStatus = 'Approved';
    // approvedBy = requestedByUserId; // Set approvedBy to the ID of the creator
    approvedRejectedAt = new Date(); // Set approval timestamp
  approvedByDetails = {
      _id: requestedByUserId,
      name: requestedByUserName,
      role: requestedByUserRole,
    };
  }

  // Determine studentClass: prefer explicit value from client, otherwise compute a sensible fallback
  let studentClassValue = req.body.studentClass || '';
  if (!studentClassValue) {
    if (student.class === 'Class') {
      studentClassValue = student.classNumber || student.majorSubject || 'Class';
    } else if (student.class === 'BS') {
      studentClassValue = student.semester ? `BS Sem ${student.semester}` : (student.degreeName || 'BS');
    } else if (student.class === 'Almiya') {
      studentClassValue = student.semester ? `Almiya Sem ${student.semester}` : 'Almiya';
    } else if (student.class === 'Hifaz') {
      studentClassValue = student.currentJuz ? `Juz ${student.currentJuz}` : 'Hifaz';
    } else {
      studentClassValue = student.class || 'Unknown';
    }
  }

  const leaveRequest = new LeaveRequest({
    student: student._id,
    studentName: student.name,
    fatherName: student.fatherName,
    studentClass: studentClassValue,
    startDate,
    endDate,
    addressGoingTo,
    reason,
    pickerName,
    pickerRelation,
    pickerPhoneNumber,
    pickerCnicNumber,
    leaveTime,
    expectedReturnTime,
    classInchargeName,
    requestedBy: requestedByUserId, // Directly assign ObjectId if schema is ref: 'User'
    requestedByType,
    status: initialStatus, // New requests are always pending
    approvedBy: approvedByDetails,             // Assign the determined approvedBy
    approvedRejectedAt: approvedRejectedAt,
  });

  const createdLeaveRequest = await leaveRequest.save();

  await createdLeaveRequest.populate('student', 'name cnic class classNumber semester degree');

  res.status(201).json(createdLeaveRequest);
});





// @desc    Get all leave requests (filtered by user role)
// @route   GET /api/leave
// @access  Private (Student, Teacher, Admin)
export const getAllLeaveRequests = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userProfileId = req.user.profileId; // This is the _id from Staff or Student document

  let query = {};

  // Admin sees all leaves
  if (userRole === 'admin') {
    // No additional filter needed for admin
  }
  // Teacher sees leaves for students they are authorized to see (e.g., their class students)
  // For simplicity, let's assume teachers can see all student leaves for now,
  // or you'd need to implement a more complex authorization logic here
  // (e.g., if a teacher is assigned to specific classes/students).
  // If you want to restrict teachers to only their students, you'd need to fetch
  // students associated with the teacher and build a query for their leaves.
  // For now, if a teacher, they might see all students they "manage" or all active students.
  // We'll keep it broad for 'teacher' to see all student leaves for now, unless specific class-teacher mapping is in User/Student model.
  else if (userRole === 'teacher') {
    // If a teacher needs to see only *their* students' leaves, you'd add:
    // const teacherLinkedStudents = await Student.find({ classIncharge: userProfileId }).select('_id');
    // const studentIds = teacherLinkedStudents.map(student => student._id);
    // query.student = { $in: studentIds };
    // For now, assuming teacher can view all active student leaves (or specific filter if needed)
  }
  // Student only sees their own leaves
  else if (userRole === 'student') {
    if (!userProfileId) {
      res.status(400);
      throw new Error('Student profile ID not found for the logged-in user.');
    }
    query.student = userProfileId; // Filter by the logged-in student's profileId
  } else {
    // Other roles might not have access or see nothing.
    res.status(403);
    throw new Error('Not authorized to view leave requests.');
  }

  // --- Filtering based on query parameters ---
  const { status, studentName, studentClass, isReturned, startDate, endDate } = req.query;

  if (status) {
    query.status = status;
  }
  if (studentName) {
    query.studentName = { $regex: studentName, $options: 'i' }; // Case-insensitive search
  }
  if (studentClass) {
    query.studentClass = { $regex: studentClass, $options: 'i' };
  }
  if (isReturned) {
    query.isReturned = isReturned === 'true'; // Convert string to boolean
  }
  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate) };
    query.endDate = { $lte: new Date(endDate) };
  } else if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.endDate = { $lte: new Date(endDate) };
  }

  const leaveRequests = await LeaveRequest.find(query)
    .populate('requestedBy', 'cnic role') // Populate the User who made the request
    .populate('student', 'cnic regNumber') // Populate the Student associated with the leave
    .sort({ requestedAt: -1 });

  res.json(leaveRequests);
});

// @desc    Get a single leave request by ID
// @route   GET /api/leave/:id
// @access  Private (Student, Teacher, Admin)
export const getLeaveRequestById = asyncHandler(async (req, res) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id)
    .populate('requestedBy', 'cnic role')
    .populate('student', 'cnic regNumber');

  if (!leaveRequest) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  // Authorization check
  const userRole = req.user.role;
  const userProfileId = req.user.profileId; // This is the _id from Student or Staff document

  if (userRole === 'admin') {
    // Admin can view any leave request
    res.json(leaveRequest);
  } else if (userRole === 'student') {
    // Student can only view their own leave requests
    if (leaveRequest.student.toString() !== userProfileId.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this leave request.');
    }
    res.json(leaveRequest);
  } else if (userRole === 'teacher') {
    // Teacher can view student leaves. You might add specific checks here
    // if a teacher should only see leaves of students they teach or manage.
    res.json(leaveRequest);
  } else {
    res.status(403);
    throw new Error('Not authorized to view this leave request');
  }
});


// @desc    Update a leave request status
// @route   PATCH /api/leave/:id/status
// @access  Private (Admin, Teacher)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    const userProfileId = req.user.profileId;

    if (!['Approved', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided.');
    }

    // Only admin and teacher can change a student's leave status
    if (userRole !== 'admin' && userRole !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to update leave status.');
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
        res.status(404);
        throw new Error('Leave request not found.');
    }

    if (leaveRequest.status !== 'Pending') {
        res.status(400);
        throw new Error('Cannot change the status of a non-pending leave request.');
    }

    leaveRequest.status = status;
    leaveRequest.approvedBy = {
        _id: userId,
        name: await getProfileName(userId, userRole, userProfileId, 'staff'),
        role: userRole,
    };
    leaveRequest.approvedRejectedAt = new Date();

    const updatedLeaveRequest = await leaveRequest.save();

    res.json(updatedLeaveRequest);
});




// @desc    Update a leave request (Admin/Teacher only for status/return, Student for some fields if pending)
// @route   PUT /api/leave/:id
// @access  Private (Admin, Teacher, Student)
export const updateLeaveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    studentId, startDate, endDate, addressGoingTo, reason, pickerName,
    pickerRelation, pickerPhoneNumber, pickerCnicNumber, leaveTime,
    expectedReturnTime, classInchargeName, status, actualReturnTime
  } = req.body;

  const leaveRequest = await LeaveRequest.findById(id);

  if (!leaveRequest) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  const isAdminOrTeacher = req.user.role === 'admin' || req.user.role === 'teacher';

  if (req.user.role === 'student') {
    if (leaveRequest.student.toString() !== req.user.profileId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this leave request.');
    }
    if (leaveRequest.status !== 'Pending') {
      res.status(403);
      throw new Error('Not authorized to modify this leave request once its status is not pending.');
    }
    if (status !== undefined && status !== leaveRequest.status) {
      res.status(403);
      throw new Error('Students are not authorized to change the leave request status.');
    }
    if (actualReturnTime !== undefined) {
      res.status(403);
      throw new Error('Students are not authorized to set actual return time.');
    }
  } else if (!isAdminOrTeacher && leaveRequest.requestedBy.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this leave request.');
  }

  // Fetch student again if studentId is being updated (unlikely for leave requests)
  // or if student details (name, fatherName, class) need to be re-fetched.
  // For simplicity, assuming these fields are static after initial creation.
  // If you allow changing student on an existing leave, you'd need to fetch and update here.

  if (startDate !== undefined) leaveRequest.startDate = startDate;
  if (endDate !== undefined) leaveRequest.endDate = endDate;
  if (addressGoingTo !== undefined) leaveRequest.addressGoingTo = addressGoingTo;
  if (reason !== undefined) leaveRequest.reason = reason;
  leaveRequest.pickerName = pickerName;
  leaveRequest.pickerRelation = pickerRelation;
  leaveRequest.pickerPhoneNumber = pickerPhoneNumber;
  leaveRequest.pickerCnicNumber = pickerCnicNumber;
  leaveRequest.leaveTime = leaveTime;
  leaveRequest.expectedReturnTime = expectedReturnTime;
  leaveRequest.classInchargeName = classInchargeName;


  // if (isAdminOrTeacher) {
  //   if (status && status !== leaveRequest.status) {
  //     leaveRequest.status = status;
  //     leaveRequest.approvedRejectedAt = new Date();
  //     // Ensure approvedBy is an ObjectId if schema is ref: 'User'
  //     leaveRequest.approvedBy = req.user._id;
  //     console.log(`leaveRequest.approvedBy : ${leaveRequest.approvedBy}`);
  //     // You might want to store approvedBy.name and approvedBy.role as well if needed for display
  //     // For this, you would need to adjust the LeaveRequest schema to embed approvedBy object
  //     // Similar to how you previously had requestedBy as an embedded object.
  //   }
  //   if (actualReturnTime !== undefined) {
  //     leaveRequest.actualReturnTime = actualReturnTime;
  //     leaveRequest.isReturned = !!actualReturnTime;
  //   }
  // }

  // Your existing block, now modified for approvedBy embedding
  if (isAdminOrTeacher) {
    if (status && status !== leaveRequest.status) {
      leaveRequest.status = status;
      leaveRequest.approvedRejectedAt = new Date();

      // Set approvedBy as an embedded object with _id, name, and role
      leaveRequest.approvedBy = {
        _id: req.user._id, // The ID of the user who approved/rejected
        name: req.user.name || req.user.cnic, // The name of the user who approved/rejected
        role: req.user.role, // The role of the user who approved/rejected
      };

      console.log(`leaveRequest.approvedBy : ${JSON.stringify(leaveRequest.approvedBy)}`); // Log the full object
    }
    // If status is changed back to Pending, clear approvedBy and approvedRejectedAt
    else if (status === 'Pending' && leaveRequest.status !== 'Pending') {
      leaveRequest.status = 'Pending';
      leaveRequest.approvedBy = null; // Clear the embedded object
      leaveRequest.approvedRejectedAt = null;
    }

    if (actualReturnTime !== undefined) {
      leaveRequest.actualReturnTime = actualReturnTime;
      leaveRequest.isReturned = !!actualReturnTime;
    }
  }

  const updatedLeaveRequest = await leaveRequest.save();

  await updatedLeaveRequest.populate('student', 'name cnic class classNumber semester degree');

  res.json(updatedLeaveRequest);
});



// @desc    Delete a leave request
// @route   DELETE /api/leave/:id
// @access  Private (Admin only, or Student for pending requests)
export const deleteLeaveRequest = asyncHandler(async (req, res) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id);
  const userRole = req.user.role;
  const userId = req.user.id; // User ID from token

  if (!leaveRequest) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  // Authorization: Only Admin can delete any request.
  // Student can delete their own PENDING requests.
  if (userRole === 'admin') {
    await leaveRequest.deleteOne();
    res.json({ message: 'Leave request removed' });
  } else if (userRole === 'student' && leaveRequest.student.toString() === req.user.profileId.toString() && leaveRequest.status === 'Pending') { // Use req.user.profileId for student
    await leaveRequest.deleteOne();
    res.json({ message: 'Your pending leave request has been removed' });
  } else {
    res.status(403);
    throw new Error('Not authorized to delete this leave request');
  }
});
