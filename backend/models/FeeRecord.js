// // backend/models/FeeRecord.js
// import mongoose from 'mongoose';

// const feeSchema = new mongoose.Schema({
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
//   month: String, // e.g., "July 2025"
//   receivedDate: Date,
//   receivedBy: String,
//   paymentMethod: {
//     type: String,
//     enum: ['Cash', 'Online Wallet', 'Bank Transfer']
//   },
//   billScreenshotUrl: String // optional
// }, { timestamps: true });

// export default mongoose.model('FeeRecord', feeSchema);



// backend/models/FeeRecord.js
import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  paidBy: { type: String, required: true }, // Name of the person who paid the fee
  month: { type: String, required: true }, // e.g., "July"
  year: { type: Number, required: true }, // e.g., 2025
  totalFee: { type: Number, required: true }, // Student's per month total fee
  receivedAmount: { type: Number, required: true }, // Amount actually received
  dueAmount: { type: Number, default: 0 }, // Calculated: totalFee - receivedAmount
  receivedDate: { type: Date, required: true },
  receivedBy: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online Wallet', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Deposited Cash'], // Added Easypaisa, JazzCash
    required: true
  },
  billScreenshotUrl: String // optional
}, { timestamps: true });

// Pre-save hook to calculate dueAmount
feeSchema.pre('save', function(next) {
  if (this.receivedAmount < this.totalFee) {
    this.dueAmount = this.totalFee - this.receivedAmount;
  } else {
    this.dueAmount = 0; // If received amount is equal to or more than total, due is 0
  }
  next();
});

export default mongoose.model('FeeRecord', feeSchema);