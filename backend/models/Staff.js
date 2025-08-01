// backend/models/Staff.js
import mongoose from 'mongoose';

const degreeSchema = new mongoose.Schema({
    degreeName: { type: String, required: true, trim: true },
    major: { type: String, trim: true, default: '-' },
    institution: { type: String, required: true, trim: true },
    yearCompleted: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 5 }, // Allow future for in-progress
});

const attendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Absent' },
    checkInTime: { type: String, default: '' }, // HH:MM format
    checkOutTime: { type: String, default: '' }, // HH:MM format
    // Optional: add a note for absence/leave
    note: { type: String, trim: true, default: '' },
});


const staffSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, unique: true },
    staffType: {
        type: String,
        enum: ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'],
        required: true,
    },
    contactNumber: { type: String, required: true, trim: true, match: /^\d{11}$/ }, // 11 digits for Pakistani numbers
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true, // Allows null values to not violate unique constraint
        match: [/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
    },
    address: { type: String, required: true, trim: true },
    dateOfJoining: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    profilePictureUrl: { type: String, default: '' }, // Similar to student profile picture

    // Education Details
    highestEducationLevel: {
        type: String,
        enum: ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Other', 'None'],
        default: 'None',
    },
    degrees: [degreeSchema], // Array of degrees

    // Teacher Specific Fields
    subjectsTaught: [{ type: String, trim: true }], // List of subjects for teachers

    // Attendance & Leave
    attendanceRecords: [attendanceSchema],
    // leaveRequests: [leaveRequestSchema],

    // QR Code for attendance (secret key for each staff member)
    qrCodeSecret: { type: String, unique: true, sparse: true }, // Will be generated on creation

    // Additional Suggestions
    emergencyContact: { type: String, trim: true, match: /^\d{11}$/, default: '' },
    bankAccountDetails: {
        bankName: { type: String, trim: true, default: '' },
        accountNumber: { type: String, trim: true, default: '' },
        iban: { type: String, trim: true, default: '' },
    },
    assignClasses: { type: [String], default: [] },

}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
