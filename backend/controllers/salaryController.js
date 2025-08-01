// backend/controllers/salaryController.js
import asyncHandler from 'express-async-handler';
import Salary from '../models/Salary.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

// @desc    Get a list of staff members for salary management
// @route   GET /api/salary/staff
// @access  Private/Admin
const getStaffForSalary = asyncHandler(async (req, res) => {
  // We now select the 'salary' field as well
  const staff = await Staff.find({}).select('_id name cnic staffType salary').lean();
  if (!staff) {
    res.status(404);
    throw new Error('No staff members found');
  }
  res.json(staff);
});

// @desc    Create or update a staff salary record
// @route   POST /api/salary
// @access  Private/Admin
const createOrUpdateSalary = asyncHandler(async (req, res) => {
  const {
    staffId,
    month,
    year,
    status,
    paidAmount,
    paidAs,
    bonus,
    overtime
  } = req.body;

  if (!staffId || !month || !year) {
    res.status(400);
    throw new Error('Please provide staffId, month, and year.');
  }

  // Find the staff member to get their details, including salary and role
  const staffMember = await Staff.findById(staffId).select('name cnic staffType salary').lean();
  if (!staffMember) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  // Find the user who is making the request (the admin)
  const paidBy = await User.findById(req.user._id).select('name').lean();

  // Use the salary from the staffMember record
  const salaryDetails = {
    staff: staffId,
    staffName: staffMember.name,
    staffCnic: staffMember.cnic,
    staffRole: staffMember.staffType.toLocaleLowerCase(),
    salaryPerMonth: staffMember.salary, // Use the salary from the staff record
    month,
    year,
    status: status || 'Unpaid',
    paidAmount: paidAmount || 0,
    paidAs: paidAs || 'Cash',
    paidBy: req.user._id,
    paidByName: paidBy.name,
    bonus: bonus || 0,
    overtime: overtime || 0,
    paidAt: Date.now(),
  };

  const existingSalary = await Salary.findOne({ staff: staffId, month, year });

  if (existingSalary) {
    // Update existing record
    const updatedSalary = await Salary.findByIdAndUpdate(existingSalary._id, salaryDetails, { new: true });
    res.status(200).json(updatedSalary);
  } else {
    // Create new record
    const newSalary = await Salary.create(salaryDetails);
    res.status(201).json(newSalary);
  }
});
// // @desc    Get all salary records (Admin only)
// // @route   GET /api/salary/all
// // @access  Private/Admin
// const getAllSalaries = asyncHandler(async (req, res) => {
//   const salaries = await Salary.find({}).sort({ paidAt: -1 }).populate('staff', 'name cnic staffType');
//   res.json(salaries);
// });

// @desc    Get all salary records with filters
// @route   GET /api/salary/all
// @access  Private/Admin
const getAllSalaries = asyncHandler(async (req, res) => {
  const { role, month, year, status } = req.query;

  let filter = {};
  if (role) filter.staffRole = role;
  if (month) filter.month = month;
  if (year) filter.year = year;
  if (status) filter.status = status;

  const salaries = await Salary.find(filter).sort({ createdAt: -1 }).lean();
  res.json(salaries);
});

// // @desc    Get a single staff member's salary records
// // @route   GET /api/salary/my-salaries
// // @access  Private/Staff
// const getMySalaries = asyncHandler(async (req, res) => {
//   // Assuming req.user._id is the ID of the logged-in user
//   const staffId = req.user._id;
//   console.log(`staffid ${staffId}`);
//   const staff = await Staff.findOne({ _id: staffId }).lean();
//   if (!staff) {
//     res.status(404);
//     throw new Error('Staff profile not found');
//   }
//   const mySalaries = await Salary.find({ staff: staff._id }).sort({ year: -1, month: -1 });
//   res.json(mySalaries);
// });


// @desc    Get a single staff member's salary records
// @route   GET /api/salary/my-salaries
// @access  Private/Staff
const getMySalaries = asyncHandler(async (req, res) => {
// const currentUserAttached = req.user.profileId;
// console.log(`currentUserAttached ${currentUserAttached}`);
// console.log(`currentUser ${req.user._id}`);
  const staff = req.user.profileId;
  if (!staff) {
    res.status(404);
    throw new Error('Staff profile not found');
  }
  const mySalaries = await Salary.find({ staff: staff._id }).sort({ year: -1, month: -1 }).lean();
  res.json(mySalaries);
});



// @desc    Get a single salary record by ID
// @route   GET /api/salary/:id
// @access  Private/Admin, Staff
const getSalaryById = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);

  if (salary) {
    // Check if user is an admin OR the staff member to whom the salary belongs
    const staff = await Staff.findOne({ user: req.user._id });
    if (req.user.role === 'admin' || (staff && salary.staff.equals(staff._id))) {
      res.json(salary);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this salary record');
    }
  } else {
    res.status(404);
    throw new Error('Salary record not found');
  }
});

export {
  getStaffForSalary,
  createOrUpdateSalary,
  getAllSalaries,
  getMySalaries,
  getSalaryById,
};