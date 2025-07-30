// backend/models/LeaveRequest.js
import mongoose from 'mongoose';

const leaveRequestSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  studentName: { // Storing for easier display, can be populated
    type: String,
    required: true,
    trim: true
  },
  fatherName: { // Storing for easier display, can be populated
    type: String,
    required: true,
    trim: true
  },
  studentClass: { // Storing for easier display, can be populated
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  addressGoingTo: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  pickerName: {
    type: String,
  },
  pickerRelation: {
    type: String,
  },
  pickerPhoneNumber: {
    type: String,
  },
  pickerCnicNumber: {
    type: String,
  },
  leaveTime: { // Time student leaves on startDate
    type: String, // HH:MM format
  },
  expectedReturnTime: { // Time student returns on endDate
    type: String, // HH:MM format
  },
  actualReturnTime: { // Actual time student returned
    type: Date,
  },
  isReturned: { // Derived from actualReturnTime
    type: Boolean,
    default: false,
  },
  classInchargeName: { // Optional field for staff to fill
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },

  // },
  // approvedBy: { // Staff/Admin who approved/rejected the leave
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming User model has roles like admin/teacher
  //   default: null,
  // },

   approvedBy: { // Changed to an embedded object
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        role: { type: String, enum: ['admin', 'teacher'] }
    },
    
  requestedBy: { // Who initiated the request (student themselves, or staff/admin on their behalf)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Or 'Student' if students have their own User entry
    required: true,
  },
  // Adding type for requestedBy to differentiate if it's a student or a staff user
  requestedByType: {
    type: String,
    enum: ['student', 'teacher', 'admin'], // 'User' for staff/admin
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },

  approvedRejectedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
