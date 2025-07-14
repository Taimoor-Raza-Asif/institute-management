// // backend/models/Student.js
// import mongoose from 'mongoose';

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   fatherName: { type: String, required: true },
//   cnic: { type: String, required: true, unique: true, minlength: 13, maxlength: 13 },
//   address: { type: String, required: true },
//   guardianContact: { type: String, required: true, minlength: 11, maxlength: 11 },
//   class: { type: String, required: true },
//   feePerMonth: { type: Number, required: true, min: 0 },
//   siblings: [{
//     name: String,
//     cnic: { type: String, minlength: 13, maxlength: 13 }
//   }],
//   feeStatus: { 
//     type: String,
//     enum: ['Paid', 'Unpaid'],
//     default: 'Unpaid' 
//   }
// }, { timestamps: true });

// export default mongoose.model('Student', studentSchema);



// backend/models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  cnic: { type: String, required: true, unique: true, minlength: 13, maxlength: 13 },
  address: { type: String, required: true },
  guardianContact: { type: String, required: true, minlength: 11, maxlength: 11 },
  class: { // Can be "1st", "2nd", ..., "12th", "BS"
    type: String,
    required: true
  },
  // New fields for class/BS level differentiation
  majorSubject: { // Only applicable for classes 1-12
    type: String,
    enum: ['Arts', 'Science', 'N/A'], // 'N/A' for BS students
    default: 'N/A'
  },
  degreeName: { // Only applicable for BS students
    type: String,
    enum: ['Islamiyat', 'Software Engineering', 'Honors', 'N/A'], // 'N/A' for non-BS students
    default: 'N/A'
  },
  semester: { // Only applicable for BS students
    type: Number,
    min: 1,
    max: 8, // Assuming 8 semesters max for a 4-year degree
    default: null // Null for non-BS students
  },
  feePerMonth: { type: Number, required: true, min: 0 },
  siblings: [{
    name: String,
    cnic: { type: String, minlength: 13, maxlength: 13 }
  }],
  feeStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);