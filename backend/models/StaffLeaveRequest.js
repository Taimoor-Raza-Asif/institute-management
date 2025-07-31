// backend/models/StaffLeaveRequest.js
import mongoose from 'mongoose';

const staffLeaveRequestSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff', // Reference to the Staff model
      required: [true, 'Staff ID is required'],
    },
    staffName: { // Storing for easier display, can be populated
      type: String,
      required: true,
      trim: true
    },
    employeeId: { // Storing for easier display, can be populated
      type: String,
      // required: true,
      trim: true
    },
    staffType: { // Storing for easier display, can be populated
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    addressGoingTo: { // Where staff is going
      type: String,
      trim: true,
      default: '' // Optional for staff leave
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
    },
    pickerName: { // Person picking up staff (if applicable, e.g., sick leave)
      type: String,
      trim: true,
      default: ''
    },
    pickerRelation: {
      type: String,
      trim: true,
      default: ''
    },
    pickerPhoneNumber: {
      type: String,
      trim: true,
      match: [/^(\d{11})?$/, 'Please enter a valid 11-digit phone number or leave empty'] // Optional, but validate if present
    },
    pickerCnicNumber: {
      type: String,
      trim: true,
      match: [/^(\d{13})?$/, 'Please enter a valid 13-digit CNIC number or leave empty'] // Optional, but validate if present
    },
    // leaveTime: { // Specific time on the start date when staff leaves
    //   type: Date,
    //   default: null // Optional
    // },
    // expectedReturnTime: { // Specific time on the end date when staff is expected to return
    //   type: Date,
    //   required: [true, 'Expected return time is required'],
    // },
    leaveTime: { // Time student leaves on startDate
      type: String, // HH:MM format
    },
    expectedReturnTime: { // Time student returns on endDate
      type: String, // HH:MM format
    },
    actualReturnTime: { // Actual time staff returned, updated by admin
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    isReturned: { // Boolean to track if staff has physically returned
      type: Boolean,
      default: false,
    },
    approvedBy: { // Admin who approved/rejected the leave
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (admin role)
      default: null,
    },
    requestedBy: { // Who initiated the request (staff themselves, or admin on their behalf)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Always a User for staff leaves
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save hook to ensure expectedReturnTime is after startDate
staffLeaveRequestSchema.pre('save', function (next) {
  if (this.startDate && this.expectedReturnTime && new Date(this.startDate) > new Date(this.expectedReturnTime)) {
    next(new Error('Expected return time must be after the start date.'));
  }
  next();
});

// A virtual property for 'isPastDue' for display purposes (red status)
staffLeaveRequestSchema.virtual('isPastDue').get(function () {
  if (this.isReturned) return false; // Already returned, not past due
  return this.status === 'Approved' && this.expectedReturnTime && this.expectedReturnTime < new Date();
});

const StaffLeaveRequest = mongoose.model('StaffLeaveRequest', staffLeaveRequestSchema);

export default StaffLeaveRequest;
