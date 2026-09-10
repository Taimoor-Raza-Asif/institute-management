// backend/models/ChartOfAccount.js
import mongoose from 'mongoose';

const chartOfAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  code: {
    // Optional account code e.g. "1001", "4002"
    type: String,
    trim: true,
    default: '',
  },
  type: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Asset', 'Liability', 'Income', 'Expense'],
  },
  // null = top-level head; otherwise points to parent account
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    default: null,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // System accounts are created by the seed and cannot be deleted
  isSystem: {
    type: Boolean,
    default: false,
  },
  // Controls sort order within siblings
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Compound index: name + parent must be unique to prevent duplicates
chartOfAccountSchema.index({ name: 1, parent: 1 }, { unique: true });

export default mongoose.model('ChartOfAccount', chartOfAccountSchema);
