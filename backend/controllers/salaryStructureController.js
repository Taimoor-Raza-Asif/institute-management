// backend/controllers/salaryStructureController.js
import asyncHandler from 'express-async-handler';
import SalaryStructure from '../models/SalaryStructure.js';
import Staff from '../models/Staff.js';

const STAFF_TYPES = ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'];

// Build default rules for all staff types
const buildDefaultRules = () =>
  STAFF_TYPES.map((staffType) => ({
    staffType,
    baseSalary: 0,
    incrementEnabled: false,
    incrementMode: 'percentage',
    percentageIncrement: 0,
    fixedIncrement: 0,
    incrementFrequencyYears: 1,
    serviceMilestones: [],
  }));

// Helper: compute effective salary for a staff member given a rule and joining date
export const computeEffectiveSalary = (rule, joiningDate) => {
  const base = rule.baseSalary || 0;
  if (!rule.incrementEnabled) return { effectiveSalary: base, totalIncrement: 0, yearsOfService: 0 };

  const now = new Date();
  const joined = joiningDate ? new Date(joiningDate) : null;
  const yearsOfService = joined
    ? Math.floor((now - joined) / (1000 * 60 * 60 * 24 * 365.25))
    : 0;

  let totalIncrement = 0;

  if (rule.incrementMode === 'percentage') {
    const freq = rule.incrementFrequencyYears || 1;
    const periods = Math.floor(yearsOfService / freq);
    // Compound: apply pct increment `periods` times
    let salary = base;
    for (let i = 0; i < periods; i++) {
      salary += salary * ((rule.percentageIncrement || 0) / 100);
    }
    totalIncrement = Math.round(salary - base);
  } else if (rule.incrementMode === 'fixed') {
    const freq = rule.incrementFrequencyYears || 1;
    const periods = Math.floor(yearsOfService / freq);
    totalIncrement = periods * (rule.fixedIncrement || 0);
  } else if (rule.incrementMode === 'service_time') {
    // Sum all milestones where yearsOfService >= milestone.yearsOfService
    const milestones = (rule.serviceMilestones || []).filter(
      (m) => yearsOfService >= m.yearsOfService
    );
    totalIncrement = milestones.reduce((sum, m) => sum + (m.incrementAmount || 0), 0);
  }

  return {
    effectiveSalary: Math.round(base + totalIncrement),
    totalIncrement: Math.round(totalIncrement),
    yearsOfService,
  };
};

// @desc    Get salary structure (singleton)
// @route   GET /api/salary-structure
// @access  Private (admin, accountant)
export const getSalaryStructure = asyncHandler(async (req, res) => {
  let doc = await SalaryStructure.findOne({ key: 'SALARY_CONFIG' }).lean();

  if (!doc) {
    // Auto-create with defaults
    doc = await SalaryStructure.create({ key: 'SALARY_CONFIG', staffTypeRules: buildDefaultRules() });
    doc = doc.toObject();
  }

  // Ensure all staff types have a rule
  const existingTypes = doc.staffTypeRules.map((r) => r.staffType);
  const missing = STAFF_TYPES.filter((t) => !existingTypes.includes(t));
  if (missing.length > 0) {
    missing.forEach((t) => {
      doc.staffTypeRules.push({
        staffType: t,
        baseSalary: 0,
        incrementEnabled: false,
        incrementMode: 'percentage',
        percentageIncrement: 0,
        fixedIncrement: 0,
        incrementFrequencyYears: 1,
        serviceMilestones: [],
      });
    });
  }

  res.json(doc);
});

// @desc    Save salary structure
// @route   PUT /api/salary-structure
// @access  Private/Admin
export const updateSalaryStructure = asyncHandler(async (req, res) => {
  const { staffTypeRules } = req.body;
  if (!Array.isArray(staffTypeRules)) {
    res.status(400);
    throw new Error('staffTypeRules must be an array.');
  }

  const doc = await SalaryStructure.findOneAndUpdate(
    { key: 'SALARY_CONFIG' },
    { $set: { staffTypeRules } },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(doc);
});

// @desc    Preview effective salaries for all staff (no DB write)
// @route   GET /api/salary-structure/preview
// @access  Private (admin, accountant)
export const previewSalaryStructure = asyncHandler(async (req, res) => {
  const [doc, staffList] = await Promise.all([
    SalaryStructure.findOne({ key: 'SALARY_CONFIG' }).lean(),
    Staff.find({ isDeleted: { $ne: true } }).select('name cnic staffType salary dateOfJoining profilePictureUrl').lean(),
  ]);

  if (!doc) {
    return res.json({ staffTypeRules: [], staffPreview: [] });
  }

  const ruleMap = {};
  (doc.staffTypeRules || []).forEach((r) => { ruleMap[r.staffType] = r; });

  const staffPreview = staffList.map((staff) => {
    const rule = ruleMap[staff.staffType];
    if (!rule) {
      return { ...staff, effectiveSalary: staff.salary || 0, totalIncrement: 0, yearsOfService: 0, fromStructure: false };
    }
    const { effectiveSalary, totalIncrement, yearsOfService } = computeEffectiveSalary(rule, staff.dateOfJoining);
    return {
      ...staff,
      baseSalary: rule.baseSalary,
      effectiveSalary,
      totalIncrement,
      yearsOfService,
      currentSalary: staff.salary || 0,
      willChange: (staff.salary || 0) !== effectiveSalary,
      fromStructure: true,
    };
  });

  res.json({ staffTypeRules: doc.staffTypeRules, staffPreview });
});

// @desc    Apply salary structure → update staff.salary field
// @route   POST /api/salary-structure/apply
// @access  Private/Admin
export const applySalaryStructure = asyncHandler(async (req, res) => {
  const doc = await SalaryStructure.findOne({ key: 'SALARY_CONFIG' }).lean();
  if (!doc) {
    res.status(404);
    throw new Error('Salary structure not configured yet.');
  }

  const ruleMap = {};
  (doc.staffTypeRules || []).forEach((r) => { ruleMap[r.staffType] = r; });

  const staffList = await Staff.find({ isDeleted: { $ne: true } }).select('name staffType salary dateOfJoining').lean();

  let updatedCount = 0;
  const bulkOps = [];

  staffList.forEach((staff) => {
    const rule = ruleMap[staff.staffType];
    if (!rule) return;
    const { effectiveSalary } = computeEffectiveSalary(rule, staff.dateOfJoining);
    if ((staff.salary || 0) !== effectiveSalary) {
      bulkOps.push({
        updateOne: {
          filter: { _id: staff._id },
          update: { $set: { salary: effectiveSalary } },
        },
      });
      updatedCount++;
    }
  });

  if (bulkOps.length > 0) {
    await Staff.bulkWrite(bulkOps);
  }

  res.json({
    message: `Salary structure applied. ${updatedCount} staff record(s) updated.`,
    updatedCount,
    totalStaff: staffList.length,
  });
});
