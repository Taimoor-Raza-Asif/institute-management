// // backend/models/Marks.js

// import mongoose from 'mongoose';

// const marksSchema = new mongoose.Schema(
//     {
//         student: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Student',
//             required: true,
//         },
//         teacher: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Staff',
//             required: true,
//         },
//         subject: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         marksType: {
//             type: String,
//             enum: ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'],
//             required: true,
//         },
//         marksName: { // The new field you added
//             type: String,
//             required: true,
//             trim: true,
//         },
//         marksObtained: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         totalMarks: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// // Add or update the unique compound index to include marksName
// // This ensures that for a given student, subject, and marks type, the marks name must be unique.
// // marksSchema.index({ student: 1, subject: 1, marksType: 1, marksName: 1, isDeleted: 1 }, { unique: true });
// marksSchema.index(
//     { student: 1, subject: 1, marksType: 1, marksName: 1 },
//     { unique: true, partialFilterExpression: { isDeleted: false } }
// );

// const Marks = mongoose.model('Marks', marksSchema);

// export default Marks;


// backend/models/Marks.js

import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        marksType: {
            type: String,
            enum: ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'],
            required: true,
        },
        marksName: {
            type: String,
            required: true,
            trim: true,
        },
        marksObtained: {
            type: Number,
            required: true,
            min: 0,
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 1,
        },
        conductedDate: {
            type: Date,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

marksSchema.index(
    { student: 1, subject: 1, marksType: 1, marksName: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Marks = mongoose.model('Marks', marksSchema);
export default Marks;