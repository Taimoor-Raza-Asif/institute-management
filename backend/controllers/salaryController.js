// backend/controllers/salaryController.js
import asyncHandler from 'express-async-handler';
import Salary from '../models/Salary.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { sendSalarySlipEmail } from '../utils/salaryMailer.js';

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
    advancedSalary,
    sendEmail,        // opt-in email flag from the frontend
  } = req.body;

  if (!staffId || !month || !year) {
    res.status(400);
    throw new Error('Please provide staffId, month, and year.');
  }

  // Find the staff member to get their details, including salary and role
  const staffMember = await Staff.findById(staffId).select('name cnic staffType salary dateOfJoining').lean();
  if (!staffMember) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  // Find the name of the logged-in user via their linked Staff profile
  // (User model has no 'name' field — name is stored on the Staff document)
  let paidByName = req.user.cnic; // fallback to CNIC if no staff profile linked
  if (req.user.profileId) {
    const paidByStaff = await Staff.findById(req.user.profileId).select('name').lean();
    if (paidByStaff?.name) paidByName = paidByStaff.name;
  }

  // status: status || 'Unpaid',

  // Use the salary from the staffMember record
  const salaryDetails = {
    staff: staffId,
    staffName: staffMember.name,
    staffCnic: staffMember.cnic,
    staffRole: staffMember.staffType.toLocaleLowerCase(),
    salaryPerMonth: staffMember.salary, // Use the salary from the staff record
    staffJoiningDate: staffMember.dateOfJoining || null,
    month,
    year,
    paidAmount: paidAmount || 0,
    paidAs: paidAs || 'Cash',
    paidBy: req.user._id,
    paidByName,
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

    // Send update email only when the user opted in
    if (sendEmail) {
      const staffWithEmail = await Staff.findById(staffId).select('email').lean();
      if (staffWithEmail?.email) {
        sendSalarySlipEmail(updatedSalary, staffWithEmail.email, 'update').catch(err =>
          console.error('Salary update email failed:', err.message)
        );
      }
    }

    res.status(200).json(updatedSalary);
  } else {
    // Create new record
    const newSalary = await Salary.create(salaryDetails);

    // Always send email on create (if staff has email)
    if (sendEmail !== false) {
      const staffWithEmail = await Staff.findById(staffId).select('email').lean();
      if (staffWithEmail?.email) {
        sendSalarySlipEmail(newSalary, staffWithEmail.email, 'new').catch(err =>
          console.error('Salary slip email failed:', err.message)
        );
      }
    }

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
    .populate('staff', 'profilePictureUrl dateOfJoining')
    .lean();

  // Map the populated staff field to the main salary object
  const salariesWithProfile = salaries.map(salary => ({
    ...salary,
    profilePictureUrl: salary.staff?.profilePictureUrl || '',
    // Use saved value first; fall back to live staff record for older salary entries
    staffJoiningDate: salary.staffJoiningDate || salary.staff?.dateOfJoining || null
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

// @desc    Bulk create salary records
// @route   POST /api/salary/bulk-create
// @access  Private/Admin
const bulkCreateSalaries = asyncHandler(async (req, res) => {
  const { salaries } = req.body;
  if (!Array.isArray(salaries) || salaries.length === 0) {
    res.status(400);
    throw new Error('No salaries provided for bulk creation.');
  }

  // Get the name of the admin who triggered bulk creation
  let paidByName = req.user.cnic;
  if (req.user.profileId) {
    const paidByStaff = await Staff.findById(req.user.profileId).select('name').lean();
    if (paidByStaff?.name) paidByName = paidByStaff.name;
  }

  // Prepare salary records
  const preparedSalaries = await Promise.all(
    salaries.map(async (salary) => {
      const staff = await Staff.findById(salary.staffId).select('name cnic staffType salary').lean();
      if (!staff) throw new Error(`Staff member with ID ${salary.staffId} not found`);

      return {
        staff: salary.staffId,
        staffName: staff.name,
        staffCnic: staff.cnic,
        staffRole: staff.staffType.toLowerCase(),
        salaryPerMonth: staff.salary,
        month: salary.month,
        year: salary.year,
        paidAmount: salary.paidAmount || 0,
        paidAs: salary.paidAs || 'Cash',
        paidBy: req.user._id,
        paidByName: paidBy.name,
        bonus: salary.bonus || 0,
        overtime: salary.overtime || 0,
        paidAt: new Date(),
        advancedSalary: salary.advancedSalary || 0,
        status: (salary.paidAmount || 0) === staff.salary ? 'Paid' : (salary.paidAmount || 0) > 0 ? 'Partial Paid' : 'Unpaid',
        deduction: (staff.salary - (salary.paidAmount || 0)) + (salary.advancedSalary || 0)
      };
    })
  );

  // Check for duplicates and skip existing records
  const existingRecords = await Salary.find({
    $or: preparedSalaries.map(s => ({ staff: s.staff, month: s.month, year: s.year }))
  }).select('staff month year');

  const existingKeySet = new Set(existingRecords.map(r => `${r.staff.toString()}-${r.month}-${r.year}`));

  const toInsert = preparedSalaries.filter(s => !existingKeySet.has(`${s.staff}-${s.month}-${s.year}`));
  const duplicateCount = preparedSalaries.length - toInsert.length;

  let created = [];
  if (toInsert.length > 0) {
    created = await Salary.insertMany(toInsert, { ordered: false });
  }

  res.status(201).json({ createdCount: created.length, duplicateCount });
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
  bulkCreateSalaries,
  deleteSalary,
};