import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Category kept as free-text string for backward compatibility with existing bills.
  // New bills also set coaAccount (below) pointing to the ChartOfAccount record.
  category: {
    type: String,
    trim: true,
    default: 'Other',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    default: 'Unpaid',
  },
  billDate: {
    type: Date,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: function() {
      // paymentDate is required if the status is 'Paid' or 'Partial'
      return this.status === 'Paid' || this.status === 'Partial';
    },
  },
  paymentMethod: {
    type: String,
    required: function() {
      return this.status === 'Paid' || this.status === 'Partial';
    },
    enum: ['Cash', 'Bank', 'Cheque'],
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    default: null,
    required: function() {
      return this.paymentMethod === 'Bank';
    },
  },
  // Reference to Chart of Accounts (Expense account this bill belongs to)
  coaAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    default: null,
  },
  paidTo: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  attachmentPath: {
    type: String,
    default: null,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Bill = mongoose.model('Bill', BillSchema);

export default Bill;