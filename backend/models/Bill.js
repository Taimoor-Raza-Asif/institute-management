import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Utilities', 'Kitchen', 'Vendor Payment', 'Repairs', 'Other'],
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
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment'],
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