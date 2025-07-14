// backend/models/FeeRecord.js
import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  month: String, // e.g., "July 2025"
  receivedDate: Date,
  receivedBy: String,
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online Wallet', 'Bank Transfer']
  },
  billScreenshotUrl: String // optional
}, { timestamps: true });

export default mongoose.model('FeeRecord', feeSchema);