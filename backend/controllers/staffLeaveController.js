// backend/controllers/staffLeaveController.js
import asyncHandler from 'express-async-handler';
import StaffLeaveRequest from '../models/StaffLeaveRequest.js';
import Staff from '../models/Staff.js'; // Assuming you have a Staff model
import User from '../models/User.js'; // Assuming User model for authentication

// @desc    Create a new staff leave request
// @route   POST /api/staff-leave
// @access  Private (Staff, Admin)
export const createStaffLeaveRequest = asyncHandler(async (req, res) => {
  const {
    staffId,
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
  } = req.body;

  const requestedByUserId = req.user.id; // From authMiddleware
  const requestedByUserRole = req.user.role; // From authMiddleware

  // Determine the staff member for whom the leave is being created
  let targetStaffId = staffId;
  let requestedByType = 'admin';
  if (requestedByUserRole !== 'admin') {
    requestedByType = 'teacher';
    // If not admin, the staffId must match the logged-in user's profileId
    if (!req.user.profileId || req.user.profileId.toString() !== staffId) {
      res.status(403);
      throw new Error('Not authorized to create leave for this staff member.');
    }
    targetStaffId = req.user.profileId; // Ensure consistency
  }

  // Fetch staff details to populate staffName, employeeId, staffType
  const staffMember = await Staff.findById(targetStaffId);
  if (!staffMember) {
    res.status(404);
    throw new Error('Staff member not found.');
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const expectedReturn = new Date(expectedReturnTime);

  if (start > end) {
    res.status(400);
    throw new Error('End date cannot be before start date.');
  }
  // if (leaveTime && expectedReturn && new Date(`2000-01-01T${leaveTime}`) > new Date(`2000-01-01T${expectedReturn}`)) {
  //   res.status(400);
  //   throw new Error('Expected return time cannot be before leave time on the same day.');
  // }

  let initialStatus = 'Pending';
    // If an Admin or Teacher creates the request, it's auto-approved by them
  if (requestedByType === 'admin') {
    initialStatus = 'Approved';}

  const staffLeaveRequest = await StaffLeaveRequest.create({
    staff: staffMember._id,
    staffName: staffMember.name,
    cnic: staffMember.cnic,
    staffType: staffMember.staffType,
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
    status: initialStatus, // Default status
    requestedBy: requestedByUserId, // Link to the User _id who made the request
    requestedByType: requestedByUserRole, // Store the role of the requester
  });

  res.status(201).json(staffLeaveRequest);
});

// @desc    Get all staff leave requests (filtered by user role)
// @route   GET /api/staff-leave
// @access  Private (Staff, Admin)
export const getAllStaffLeaveRequests = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userProfileId = req.user.profileId; // This is the _id from Staff document

  let query = {};

  // Admin sees all leaves
  if (userRole === 'admin') {
    // No additional filter needed for admin
  }
  // Staff (teacher, accountant, cook, cleaner) sees only their own leaves
  else if (userRole === 'teacher' || userRole === 'accountant' || userRole === 'cook' || userRole === 'cleaner') {
    if (!userProfileId) {
      res.status(400);
      throw new Error('Staff profile ID not found for the logged-in user.');
    }
    query.staff = userProfileId; // Filter by the logged-in staff's profileId
  } else {
    // Other roles might not have access or see nothing.
    res.status(403);
    throw new Error('Not authorized to view staff leave requests.');
  }

  // --- Filtering based on query parameters ---
  const { status, staffName, staffType, isReturned, startDate, endDate } = req.query;

  if (status) {
    query.status = status;
  }
  if (staffName) {
    query.staffName = { $regex: staffName, $options: 'i' }; // Case-insensitive search
  }
  if (staffType) {
    query.staffType = { $regex: staffType, $options: 'i' };
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


  const staffLeaveRequests = await StaffLeaveRequest.find(query)
    .populate('requestedBy', 'cnic role') // Populate the User who made the request
    .populate('staff', 'cnic employeeId') // Populate the Staff associated with the leave
    .sort({ requestedAt: -1 });

  res.json(staffLeaveRequests);
});

// @desc    Get a single staff leave request by ID
// @route   GET /api/staff-leave/:id
// @access  Private (Staff, Admin)
export const getStaffLeaveRequestById = asyncHandler(async (req, res) => {
  const staffLeaveRequest = await StaffLeaveRequest.findById(req.params.id)
    .populate('requestedBy', 'cnic role')
    .populate('staff', 'cnic employeeId');

  if (!staffLeaveRequest) {
    res.status(404);
    throw new Error('Staff leave request not found');
  }

  // Authorization check
  const userRole = req.user.role;
  const userProfileId = req.user.profileId; // This is the _id from Staff document

  if (userRole === 'admin') {
    // Admin can view any staff leave request
    res.json(staffLeaveRequest);
  } else if (userRole === 'teacher' || userRole === 'accountant' || userRole === 'cook' || userRole === 'cleaner') {
    // Staff can only view their own leave requests
    if (staffLeaveRequest.staff.toString() !== userProfileId.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this staff leave request.');
    }
    res.json(staffLeaveRequest);
  } else {
    res.status(403);
    throw new Error('Not authorized to view this staff leave request');
  }
});


// @desc    Update a staff leave request (Admin only for status/return, Staff for some fields if pending)
// @route   PUT /api/staff-leave/:id
// @access  Private (Admin, Staff)
export const updateStaffLeaveRequest = asyncHandler(async (req, res) => {
  const {
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
    status, // Only admin can update status
    isReturned, // Only admin can update this
    actualReturnTime, // New field for actual return time
  } = req.body;

  const staffLeaveRequest = await StaffLeaveRequest.findById(req.params.id);
  const userRole = req.user.role;
  const userId = req.user.id; // User ID from token
  const userProfileId = req.user.profileId; // Profile ID from token (Staff _id)


  if (!staffLeaveRequest) {
    res.status(404);
    throw new Error('Staff leave request not found');
  }

  // Authorization for updating
  if (userRole === 'admin') {
    // Admin can update all fields including status and isReturned
    if (startDate) staffLeaveRequest.startDate = startDate;
    if (endDate) staffLeaveRequest.endDate = endDate;
    if (addressGoingTo) staffLeaveRequest.addressGoingTo = addressGoingTo;
    if (reason) staffLeaveRequest.reason = reason;
    if (pickerName) staffLeaveRequest.pickerName = pickerName;
    if (pickerRelation) staffLeaveRequest.pickerRelation = pickerRelation;
    if (pickerPhoneNumber) staffLeaveRequest.pickerPhoneNumber = pickerPhoneNumber;
    if (pickerCnicNumber) staffLeaveRequest.pickerCnicNumber = pickerCnicNumber;
    if (leaveTime) staffLeaveRequest.leaveTime = leaveTime;
    if (expectedReturnTime) staffLeaveRequest.expectedReturnTime = expectedReturnTime;

    // Only update status if provided and if admin
    if (status) {
      staffLeaveRequest.status = status;
      // If status changes to Approved or Rejected, record who approved/rejected and when
      if (status === 'Approved' || status === 'Rejected') {
        staffLeaveRequest.approvedRejectedAt = new Date();
        const approvingUser = await User.findById(userId); // Get user's name/cnic for tracking
        staffLeaveRequest.approvedRejectedBy = approvingUser ? (approvingUser.name || approvingUser.cnic) : 'Unknown User';
      }
    }

    // Handle isReturned
    if (isReturned !== undefined) {
      staffLeaveRequest.isReturned = isReturned;
    }

    // Handle actualReturnTime for Admin
    if (actualReturnTime !== undefined) {
      if (actualReturnTime) {
        staffLeaveRequest.actualReturnTime = new Date(actualReturnTime);
        staffLeaveRequest.isReturned = true; // Mark as returned if actual return time is set
      } else {
        staffLeaveRequest.actualReturnTime = null;
        staffLeaveRequest.isReturned = false;
      }
    }
  } else if (userRole === 'teacher' || userRole === 'accountant' || userRole === 'cook' || userRole === 'cleaner') {
    // Staff can only update their own pending request
    if (staffLeaveRequest.staff.toString() !== userProfileId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this staff leave request.');
    }
    if (staffLeaveRequest.status !== 'Pending') {
      res.status(400);
      throw new Error('Only pending leave requests can be updated by the staff.');
    }

    // Staff can update their own request details if it's pending
    if (startDate) staffLeaveRequest.startDate = startDate;
    if (endDate) staffLeaveRequest.endDate = endDate;
    if (addressGoingTo) staffLeaveRequest.addressGoingTo = addressGoingTo;
    if (reason) staffLeaveRequest.reason = reason;
    if (pickerName) staffLeaveRequest.pickerName = pickerName;
    if (pickerRelation) staffLeaveRequest.pickerRelation = pickerRelation;
    if (pickerPhoneNumber) staffLeaveRequest.pickerPhoneNumber = pickerPhoneNumber;
    if (pickerCnicNumber) staffLeaveRequest.pickerCnicNumber = pickerCnicNumber;
    if (leaveTime) staffLeaveRequest.leaveTime = leaveTime;
    if (expectedReturnTime) staffLeaveRequest.expectedReturnTime = expectedReturnTime;

    // Staff cannot change status or isReturned
  } else {
    res.status(403);
    throw new Error('Not authorized to update this staff leave request');
  }

  const updatedStaffLeaveRequest = await staffLeaveRequest.save();
  res.json(updatedStaffLeaveRequest);
});


// @desc    Delete a staff leave request
// @route   DELETE /api/staff-leave/:id
// @access  Private (Admin only, or Staff for pending requests)
export const deleteStaffLeaveRequest = asyncHandler(async (req, res) => {
  const staffLeaveRequest = await StaffLeaveRequest.findById(req.params.id);
  const userRole = req.user.role;
  const userId = req.user.id; // User ID from token

  if (!staffLeaveRequest) {
    res.status(404);
    throw new Error('Staff leave request not found');
  }

  // Authorization: Only Admin can delete any request.
  // Staff can delete their own PENDING requests.
  if (userRole === 'admin') {
    await staffLeaveRequest.deleteOne();
    res.json({ message: 'Staff leave request removed.' });
  } else if ((userRole === 'teacher' || userRole === 'accountant' || userRole === 'cook' || userRole === 'cleaner') && staffLeaveRequest.staff.toString() === req.user.profileId.toString() && staffLeaveRequest.status === 'Pending') {
    await staffLeaveRequest.deleteOne();
    res.json({ message: 'Your pending staff leave request has been removed.' });
  } else {
    res.status(403);
    throw new Error('Not authorized to delete this staff leave request');
  }
});