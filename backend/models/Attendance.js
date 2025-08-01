// backend/models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // Reference to either a student or a staff member
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel', // This tells Mongoose to use the 'onModel' field to determine which collection to reference
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Student', 'Staff'], // The model can be either 'Student' or 'Staff'
  },
  
  date: {
    type: Date,
    required: true,
  },
  
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Leave', 'Holiday'], // You can define various statuses
    default: 'Absent',
  },
  
  // Optional: details for students
  studentDetails: {
    class: { type: String }, // e.g., 'BS', 'Class'
    classNumber: { type: String }, // e.g., '10th', '9th'
    semester: { type: Number },
    degreeName: { type: String },
    majorSubject: { type: String },
  },

  // Optional: Who marked the attendance
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming only staff (teachers, admins) can mark attendance
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  
  reason: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
  // Add a compound unique index to prevent duplicate attendance entries for the same user on the same day
  // This is crucial for data integrity.
  indexes: [{ unique: true, fields: ['user', 'date'] }],
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;