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
  const staff = await Staff.find({}).select('_id name cnic staffType salary profilePictureUrl').lean();
  if (!staff) {
    res.status(404);
    throw new Error('No staff members found');
  }
  res.json(staff);
});


// @desc    Get all salary records with search and filtering
// @route   GET /api/salary/all
// @access  Private (Admin, Accountant)
const getSalaries = asyncHandler(async (req, res) => {
  const { searchTerm, role, month, year, status } = req.query;
  const query = {};

  if (role) query.staffRole = role;
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;

  let salaries = await Salary.find(query).sort({ year: -1, month: -1 });

  if (searchTerm) {
    const searchTermRegex = new RegExp(search, 'i');
    salaries = salaries.filter(salary =>
      searchTermRegex.test(salary.staffName) ||
      searchTermRegex.test(salary.staffCnic)
    );
  }

  res.status(200).json(salaries);
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
    overtime,
    advancedSalary
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


  // status: status || 'Unpaid',

  // Use the salary from the staffMember record
  const salaryDetails = {
    staff: staffId,
    staffName: staffMember.name,
    staffCnic: staffMember.cnic,
    staffRole: staffMember.staffType.toLocaleLowerCase(),
    salaryPerMonth: staffMember.salary, // Use the salary from the staff record
    month,
    year,
    paidAmount: paidAmount || 0,
    paidAs: paidAs || 'Cash',
    paidBy: req.user._id,
    paidByName: paidBy.name,
    bonus: bonus || 0,
    overtime: overtime || 0,
    paidAt: Date.now(),
     advancedSalary: advancedSalary || 0,
    status: (paidAmount || 0) === staffMember.salary ? 'Paid' : (paidAmount || 0) > 0 ? 'Partial Paid' : 'Unpaid',
    deduction: (staffMember.salary - (paidAmount || 0)) + (advancedSalary || 0)
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
  const { role, month, year, status, search } = req.query;

  let filter = {};
  if (role) filter.staffRole = role;
  if (month) filter.month = month;
  if (year) filter.year = year;
  if (status) filter.status = status;

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { staffName: { $regex: searchRegex } },
      { staffCnic: { $regex: searchRegex } }
    ];
  }

//   const salaries = await Salary.find(filter).sort({ createdAt: -1 }).lean();
//   res.json(salaries);
// });

  const salaries = await Salary.find(filter)
    .sort({ createdAt: -1 })
    .populate('staff', 'profilePictureUrl') // This is the key change
    .lean();

  // Map the populated staff field to the main salary object
  const salariesWithProfile = salaries.map(salary => ({
    ...salary,
    profilePictureUrl: salary.staff?.profilePictureUrl || ''
  }));

  res.json(salariesWithProfile);
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
    if ((req.user.role === 'admin') || (req.user.role === 'accountant') || (staff && salary.staff.equals(staff._id))) {
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



// @desc    Get aggregated salary reports
// @route   GET /api/salary/reports
// @access  Private/Admin & Accountant
const getSalaryReports = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const matchFilter = { paidAt: { $ne: null } };

  if (year || month) {
    const expressions = [];
    if (year) expressions.push({ $eq: [{ $year: "$paidAt" }, parseInt(year, 10)] });
    if (month) expressions.push({ $eq: [{ $month: "$paidAt" }, parseInt(month, 10)] });
    matchFilter.$expr = expressions.length === 1 ? expressions[0] : { $and: expressions };
  }

  try {
    const monthlyReport = await Salary.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          totalPaid: { $sum: "$paidAmount" },
          totalBonus: { $sum: "$bonus" },
          totalOvertime: { $sum: "$overtime" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const roleReport = await Salary.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: "$staffRole",
          totalPaid: { $sum: "$paidAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          totalPaid: 1
        }
      }
    ]);

    res.status(200).json({ monthlyReport, roleReport });
  } catch (error) {
    console.error("Error fetching salary reports:", error);
    res.status(500).json({ message: 'Failed to fetch salary reports', error: error.message });
  }
});

// @desc    Delete a salary record
// @route   DELETE /api/salary/:id
// @access  Private/Admin
const deleteSalary = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);

  if (!salary) {
    res.status(404);
    throw new Error('Salary record not found');
  }

  await salary.deleteOne();
  res.status(200).json({ message: 'Salary record deleted successfully' });
});


export {
  getStaffForSalary,
  createOrUpdateSalary,
  getAllSalaries,
  getMySalaries,
  getSalaryById,
  getSalaries,
  getSalaryReports,
  deleteSalary,
};