import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donationAmount: {
    type: Number,
    required: [true, 'Donation amount is required.'],
    min: [0, 'Donation amount cannot be negative.']
  },
  donationPurpose: {
    type: String,
    required: [true, 'Donation purpose is required.'],
    trim: true,
  },
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required.'],
    default: Date.now,
  },
  donorName: {
    type: String,
    trim: true,
    default: 'Anonymous',
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^(\+?\d{1,4})?\d{10,14}$/, 'Please enter a valid contact number.'],
  },
  emailAddress: {
    type: String,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address.'],
  },
  cnic: {
    type: String,
    trim: true,
    match: [/^\d{13}$/, 'Please enter a valid 13-digit CNIC.'],
  },
  organizationName: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required.'],
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online Gateway'],
  },
  receiptPath: {
    type: String, // Storing the path to the uploaded file
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;