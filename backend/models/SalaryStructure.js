// backend/models/SalaryStructure.js
import mongoose from 'mongoose';

// Service milestone: e.g. after 3 years of service → +PKR 2000
const milestonesSchema = new mongoose.Schema({
  yearsOfService: { type: Number, required: true, min: 0 },
  incrementAmount: { type: Number, required: true, min: 0 },
}, { _id: false });

// Per-staff-type salary rule
const staffTypeRuleSchema = new mongoose.Schema({
  staffType: {
    type: String,
    enum: ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'],
    required: true,
  },
  baseSalary: { type: Number, default: 0, min: 0 },

  // Increment settings
  incrementEnabled: { type: Boolean, default: false },
  incrementMode: {
    type: String,
    enum: ['percentage', 'fixed', 'service_time'],
    default: 'percentage',
  },

  // Used when mode = 'percentage'
  percentageIncrement: { type: Number, default: 0, min: 0 },

  // Used when mode = 'fixed'
  fixedIncrement: { type: Number, default: 0, min: 0 },

  // How frequently to apply (in years OR months) — for percentage & fixed modes
  incrementFrequencyYears: { type: Number, default: 1, min: 0 },
  incrementFrequencyUnit: { type: String, enum: ['years', 'months'], default: 'years' },

  // Used when mode = 'service_time'
  serviceMilestones: { type: [milestonesSchema], default: [] },
}, { _id: false });

// Singleton document — only one per institute
const salaryStructureSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'SALARY_CONFIG' },
  staffTypeRules: { type: [staffTypeRuleSchema], default: [] },
}, { timestamps: true });

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

export default SalaryStructure;
