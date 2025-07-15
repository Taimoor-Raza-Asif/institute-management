// // backend/models/Student.js
// import mongoose from 'mongoose';

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   fatherName: { type: String, required: true, trim: true },
//   cnic: { type: String, required: true, unique: true, trim: true, match: /^\d{13}$/ },
//   address: { type: String, required: true, trim: true },
//   guardianContact: { type: String, required: true, trim: true, match: /^\d{11}$/ },
//   additionalContact: { type: String, trim: true, match: /^\d{11}$/, default: '' },

//   dob: { type: Date, required: true },
//   gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
//   admissionDate: { type: Date, required: true },
//   email: {
//     type: String,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   },
//   profilePictureUrl: { type: String, default: '' },

//   class: { type: String, required: true, trim: true },
//   // --- RE-ADDED FIELD ---
//   classNumber: { type: String, default: '-', trim: true }, // Re-added classNumber
//   // --- END RE-ADDED FIELD ---
//   majorSubject: { type: String, default: '-', trim: true },
//   degreeName: { type: String, default: '-', trim: true },
//   semester: { type: Number, default: null },
//   feePerMonth: { type: Number, required: true },
//   siblings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
//   feeStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial Paid'], default: 'Unpaid' },
//   studentStatus: {
//     type: String,
//     enum: ['Regular', 'Withdrawn', 'Expelled', 'Graduated'],
//     default: 'Regular'
//   },
// }, { timestamps: true });

// export default mongoose.model('Student', studentSchema);

// backend/models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  cnic: { type: String, required: true, unique: true, trim: true, match: /^\d{13}$/ },
  address: { type: String, required: true, trim: true },
  guardianContact: { type: String, required: true, trim: true, match: /^\d{11}$/ },
  additionalContact: { type: String, trim: true, match: /^\d{11}$/, default: '' },

  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  admissionDate: { type: Date, required: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  profilePictureUrl: { type: String, default: '' },

  class: { type: String, required: true, trim: true },
  classNumber: { type: String, default: '-', trim: true },
  majorSubject: { type: String, default: '-', trim: true },
  degreeName: { type: String, default: '-', trim: true },
  semester: { type: Number, default: null },
  feePerMonth: { type: Number, required: true },
  siblings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  feeStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial Paid'], default: 'Unpaid' },
  studentStatus: {
    type: String,
    enum: ['Regular', 'Withdrawn', 'Expelled', 'Graduated'],
    default: 'Regular'
  },
  // --- NEW FIELD ---
  reason: { type: String, trim: true, default: '' }, // Reason for withdrawal/expulsion
  // --- END NEW FIELD ---
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);