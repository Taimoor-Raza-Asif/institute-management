// backend/models/Salary.js
import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  staffName: {
    type: String,
    required: true,
  },
  staffCnic: {
    type: String,
    required: true,
  },
  staffRole: {
    type: String,
    enum: ['admin', 'student', 'teacher', 'accountant', 'cook', 'cleaner'],
    required: true,
  },
  salaryPerMonth: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial Paid'],
    default: 'Unpaid',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paidAs: {
    type: String,
    enum: ['Cash', 'Online Wallet', 'Bank Transfer', 'Other'],
    default: 'Cash',
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paidByName: {
    type: String,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  bonus: {
    type: Number,
    default: 0,
    min: 0,
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0,
  },
    deduction: {
    type: Number,
    default: 0,
    min: 0,
  },
  advancedSalary: {
    type: Number,
    default: 0,
    min: 0,
  },
  staffJoiningDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Correct way to add a unique compound index
salarySchema.index({ staff: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;