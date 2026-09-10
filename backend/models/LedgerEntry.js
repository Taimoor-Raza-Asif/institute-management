// backend/models/LedgerEntry.js
// Each document represents one double-entry transaction (debit + credit pair).

import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  // Debit account — the account that increases
  debitAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    required: true,
  },
  // Credit account — the account that decreases
  creditAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  // Which module generated this entry
  sourceModule: {
    type: String,
    enum: ['Fee', 'Salary', 'Bill', 'Donation', 'Manual'],
    required: true,
  },
  // Reference to the original document (FeeRecord, Bill, Salary, Donation)
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  // Who triggered the entry
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Soft-reverse flag: set to true when the original transaction is deleted/reversed
  isReversed: {
    type: Boolean,
    default: false,
  },
  // Points to the original entry being reversed (for reversal entries)
  reversalOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LedgerEntry',
    default: null,
  },
}, { timestamps: true });

// Index for fast account-based queries
ledgerEntrySchema.index({ debitAccount: 1, date: -1 });
ledgerEntrySchema.index({ creditAccount: 1, date: -1 });
ledgerEntrySchema.index({ sourceModule: 1, sourceId: 1 });

export default mongoose.model('LedgerEntry', ledgerEntrySchema);
