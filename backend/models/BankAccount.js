// backend/models/BankAccount.js
import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Bank', 'Mobile Wallet'],
  },
  accountNumber: {
    type: String,
    trim: true,
    default: '',
  },
  bankName: {
    type: String,
    trim: true,
    default: '',
  },
  holderName: {
    type: String,
    trim: true,
    default: '',
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('BankAccount', bankAccountSchema);
