import asyncHandler from 'express-async-handler';
import Marks from '../models/Marks.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Private (Teacher only)
export const addMarks = asyncHandler(async (req, res) => {
    const { studentId, subject, marksType, marksName, marksObtained, totalMarks, conductedDate } = req.body;
    const teacherId = req.user.profileId;

    // 1. Validate teacher's assignment
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
        res.status(404);
        throw new Error('Teacher profile not found.');
    }
    const assignedSubjects = teacher.assignClasses.flatMap(ac => ac.subjects);
    if (!assignedSubjects.includes(subject)) {
        res.status(403);
        throw new Error('You are not assigned to teach this subject.');
    }

    // 2. Validate student exists and is in one of the teacher's classes
    const student = await Student.findById(studentId);
    if (!student) {
        res.status(404);
        throw new Error('Student not found.');
    }
    const assignedClasses = teacher.assignClasses.map(ac => ({
        type: ac.type,
        classNumber: ac.classNumber,
        degreeName: ac.degreeName,
        semester: ac.semester
    }));
    const isStudentInAssignedClass = assignedClasses.some(ac =>
        (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
        (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
    );
    if (!isStudentInAssignedClass) {
        res.status(403);
        throw new Error('This student is not in a class you are assigned to.');
    }

    // 3. Enforce midterm limit
    if (marksType === 'Midterm 2') {
        const existingMidterm1 = await Marks.findOne({ student: studentId, subject, marksType: 'Midterm 1' });
        if (!existingMidterm1) {
            res.status(400);
            throw new Error('Midterm 1 marks must be entered before Midterm 2.');
        }
    }

    // 4. Create new marks entry
    const newMarks = new Marks({
        student: student._id,
        studentName: student.name,
        teacher: teacher._id,
        teacherName: teacher.name,
        assignedClass: assignedClasses.find(ac =>
            (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
            (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
        ),
        subject,
        marksType,
        marksName,
        marksObtained,
        totalMarks,
        conductedDate,
    });

    await newMarks.save();
    res.status(201).json(newMarks);
});

// @desc    Update marks
// @route   PUT /api/marks/:id
// @access  Private (Teacher only)
export const updateMarks = asyncHandler(async (req, res) => {
    const { marksObtained, totalMarks } = req.body;
    const marksId = req.params.id;
    const teacherId = req.user.profileId;

    const marks = await Marks.findById(marksId);
    if (!marks || marks.isDeleted) {
        res.status(404);
        throw new Error('Marks entry not found.');
    }

    if (marks.teacher.toString() !== teacherId.toString()) {
        res.status(403);
        throw new Error('Not authorized to update these marks.');
    }

    marks.marksObtained = marksObtained || marks.marksObtained;
    marks.totalMarks = totalMarks || marks.totalMarks;

    const updatedMarks = await marks.save();
    res.json(updatedMarks);
});

// @desc    Delete marks
// @route   DELETE /api/marks/:id
// @access  Private (Teacher only)
export const deleteMarks = asyncHandler(async (req, res) => {
    const marksId = req.params.id;
    const teacherId = req.user.profileId;

    const marks = await Marks.findById(marksId);
    if (!marks || marks.isDeleted) {
        res.status(404);
        throw new Error('Marks entry not found.');
    }

    if (marks.teacher.toString() !== teacherId.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete these marks.');
    }
    marks.isDeleted = true; // Soft delete
    await marks.save();
    res.json({ message: 'Marks deleted successfully.' });
});





// // @desc    Add marks for a student
// // @route   POST /api/marks
// // @access  Private (Teacher only)
// export const addMarks = asyncHandler(async (req, res) => {
//     const { studentId, subject, marksType, marksName, marksObtained, totalMarks, conductedDate } = req.body;
//     const teacherId = req.user.profileId;

//     const teacher = await Staff.findById(teacherId);
//     if (!teacher) {
//         res.status(404);
//         throw new Error('Teacher profile not found.');
//     }
//     const assignedSubjects = teacher.assignClasses.flatMap(ac => ac.subjects);
//     if (!assignedSubjects.includes(subject)) {
//         res.status(403);
//         throw new Error('You are not assigned to teach this subject.');
//     }

//     const student = await Student.findById(studentId);
//     if (!student) {
//         res.status(404);
//         throw new Error('Student not found.');
//     }

//     const marks = new Marks({
//         student: studentId,
//         teacher: teacherId,
//         subject,
//         marksType,
//         marksName,
//         marksObtained,
//         totalMarks,
//         conductedDate,
//     });

//     const createdMark = await marks.save();
//     res.status(201).json(createdMark);
// });



// @desc    Get all marks with filters
// @route   GET /api/marks
// @access  Private (Admin only)
export const getAllMarks = asyncHandler(async (req, res) => {
    const { subject, class: studentClass, degree, semester, month, year, marksType, searchQuery } = req.query;
    let query = { isDeleted: false };
    let studentQuery = {};

    if (subject) {
        query.subject = { $regex: subject, $options: 'i' };
    }

    if (marksType) {
        query.marksType = marksType;
    }

    if (studentClass) {
        studentQuery.class = studentClass;
    }
    if (degree) {
        studentQuery.degreeName = degree;
    }
    if (semester) {
        studentQuery.semester = semester;
    }
    if (searchQuery) {
        // Fetch students matching the search query
        const students = await Student.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { cnic: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('_id');

        const studentIds = students.map(s => s._id);

        // Add student ID filter to the marks query
        query.student = { $in: studentIds };
    }

    if (Object.keys(studentQuery).length > 0) {
        const students = await Student.find(studentQuery).select('_id');
        const studentIds = students.map(s => s._id);
        query.student = { $in: studentIds };
    }

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        query.conductedDate = { $gte: startDate, $lte: endDate };
    }

    if (year) {
        const startDate = new Date(year, month ? month - 1 : 0, 1);
        const endDate = new Date(year, month ? month : 12, 0, 23, 59, 59);
        query.conductedDate = { $gte: startDate, $lte: endDate };
    }

    const marks = await Marks.find(query)
        .populate('student', 'name class classNumber degreeName semester')
        .populate('teacher', 'name');

    res.json(marks);
});

// @desc    Get all marks by a specific teacher with filters
// @route   GET /api/marks/teacher/:id
// @access  Private (Teacher only)
export const getMarksByTeacher = asyncHandler(async (req, res) => {
    const { subject, class: studentClass, degree, semester, month, year, marksType, searchQuery } = req.query;
    const teacherId = req.params.id;
    if (req.user.profileId.toString() !== teacherId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these marks.');
    }

    let query = { teacher: teacherId, isDeleted: false };
    let studentQuery = {};

    if (subject) {
        query.subject = { $regex: subject, $options: 'i' };
    }

    if (marksType) {
        query.marksType = marksType;
    }

    if (studentClass) {
        studentQuery.class = studentClass;
    }
    if (degree) {
        studentQuery.degreeName = degree;
    }
    if (semester) {
        studentQuery.semester = semester;
    }

      if (searchQuery) {
        // Fetch students matching the search query
        const students = await Student.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { cnic: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('_id');

        const studentIds = students.map(s => s._id);

        // Add student ID filter to the marks query
        query.student = { $in: studentIds };
    }

    if (Object.keys(studentQuery).length > 0) {
        const students = await Student.find(studentQuery).select('_id');
        const studentIds = students.map(s => s._id);
        query.student = { $in: studentIds };
    }

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        query.conductedDate = { $gte: startDate, $lte: endDate };
    }

    if (year) {
        const startDate = new Date(year, month ? month - 1 : 0, 1);
        const endDate = new Date(year, month ? month : 12, 0, 23, 59, 59);
        query.conductedDate = { $gte: startDate, $lte: endDate };
    }

    const marks = await Marks.find(query)
        .populate('student', 'name class classNumber degreeName semester')
        .populate('teacher', 'name');

    res.json(marks);
});


// // @desc    Get all marks entered by a specific teacher
// // @route   GET /api/marks/teacher/:id
// // @access  Private (Teacher only)
// export const getMarksByTeacher = asyncHandler(async (req, res) => {
//     const teacherId = req.params.id;
//     if (req.user.profileId.toString() !== teacherId.toString()) {
//         res.status(403);
//         throw new Error('Not authorized to view these marks.');
//     }
//     const marks = await Marks.find({ teacher: teacherId, isDeleted: false}).populate('student', 'name class classNumber degreeName semester');
//     res.json(marks);
// });

// @desc    Get all marks for a specific student
// @route   GET /api/marks/student/:id
// @access  Private (Student, Admin, Teacher)
export const getMarksByStudent = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.profileId;

    if (userRole === 'student' && userId.toString() !== studentId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these marks.');
    }

    const marks = await Marks.find({ student: studentId }).populate('teacher', 'name');
    res.json(marks);
});

// // @desc    Get all marks (Admin only)
// // @route   GET /api/marks
// // @access  Private (Admin only)
// export const getAllMarks = asyncHandler(async (req, res) => {
//     // Add the filter to only get non-deleted marks
//     const marks = await Marks.find({ isDeleted: false })
//         .populate('student', 'name')
//         .populate('teacher', 'name');
//     res.json(marks);
// });



// // @desc    Add or update marks in bulk for a class
// // @route   POST /api/marks/bulk
// // @access  Private (Teacher only)
// export const addBulkMarks = asyncHandler(async (req, res) => {
//     const { marks } = req.body;
//     const teacherId = req.user.profileId;

//     const teacher = await Staff.findById(teacherId);
//     if (!teacher) {
//         res.status(404);
//         throw new Error('Teacher profile not found.');
//     }

//     const assignedClasses = teacher.assignClasses.map(ac => ({
//         type: ac.type,
//         classNumber: ac.classNumber,
//         degreeName: ac.degreeName,
//         semester: ac.semester
//     }));

//     const results = [];

//     for (const markData of marks) {
//         const { studentId, subject, marksType, marksName, marksObtained, totalMarks } = markData;

//         // 1. Validate teacher's assignment to the subject
//         const assignedSubjects = teacher.assignClasses.flatMap(ac => ac.subjects);
//         if (!assignedSubjects.includes(subject)) {
//             res.status(403);
//             throw new Error(`You are not assigned to teach the subject: ${subject}.`);
//         }

//         // 2. Validate student exists
//         const student = await Student.findById(studentId);
//         if (!student) {
//             res.status(404);
//             throw new Error(`Student with ID ${studentId} not found.`);
//         }

//         // 3. Validate student is in one of the teacher's classes
//         const isStudentInAssignedClass = assignedClasses.some(ac =>
//             (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
//             (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
//         );

//         if (!isStudentInAssignedClass) {
//             res.status(403);
//             throw new Error(`Student ${student.name} is not in a class you are assigned to.`);
//         }

//         // 4. Enforce Midterm 2 limit
//         if (marksType === 'Midterm 2') {
//             const existingMidterm1 = await Marks.findOne({ student: studentId, subject, marksType: 'Midterm 1', isDeleted: false });
//             if (!existingMidterm1) {
//                 res.status(400);
//                 throw new Error(`Midterm 1 marks must be entered for ${student.name} before Midterm 2.`);
//             }
//         }

//         // 5. Find and update or create a new marks entry
//         const assignedClass = assignedClasses.find(ac =>
//             (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
//             (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
//         );

//         const filter = {
//             student: student._id,
//             subject,
//             marksType,
//             marksName,
//         };

//         const update = {
//             teacher: teacher._id,
//             teacherName: teacher.name,
//             studentName: student.name,
//             assignedClass,
//             marksObtained,
//             totalMarks,
//             isDeleted: false,
//         };

//         const options = {
//             new: true,
//             upsert: true, // Create a new document if one doesn't exist
//             setDefaultsOnInsert: true,
//         };

//         const updatedMark = await Marks.findOneAndUpdate(filter, update, options);
//         results.push(updatedMark);
//     }
//     res.status(200).json(results);
// });





// @desc    Add or update marks in bulk for a class
// @route   POST /api/marks/bulk
// @access  Private (Teacher only)
export const addBulkMarks = asyncHandler(async (req, res) => {
    const { marks } = req.body;
    const teacherId = req.user.profileId;

    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
        res.status(404);
        throw new Error('Teacher profile not found.');
    }

    const assignedClasses = teacher.assignClasses.map(ac => ({
        type: ac.type,
        classNumber: ac.classNumber,
        degreeName: ac.degreeName,
        semester: ac.semester
    }));

    const results = [];

    for (const markData of marks) {
        // Destructure the new 'conductedDate' field
        const { studentId, subject, marksType, marksName, marksObtained, totalMarks, conductedDate } = markData;

        // 1. Validate teacher's assignment to the subject
        const assignedSubjects = teacher.assignClasses.flatMap(ac => ac.subjects);
        if (!assignedSubjects.includes(subject)) {
            res.status(403);
            throw new Error(`You are not assigned to teach the subject: ${subject}.`);
        }

        // 2. Validate student exists
        const student = await Student.findById(studentId);
        if (!student) {
            res.status(404);
            throw new Error(`Student with ID ${studentId} not found.`);
        }

        // 3. Validate student is in one of the teacher's classes
        const isStudentInAssignedClass = assignedClasses.some(ac =>
            (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
            (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
        );

        if (!isStudentInAssignedClass) {
            res.status(403);
            throw new Error(`Student ${student.name} is not in a class you are assigned to.`);
        }

        // 4. Enforce Midterm 2 limit
        if (marksType === 'Midterm 2') {
            const existingMidterm1 = await Marks.findOne({ student: studentId, subject, marksType: 'Midterm 1', isDeleted: false });
            if (!existingMidterm1) {
                res.status(400);
                throw new Error(`Midterm 1 marks must be entered for ${student.name} before Midterm 2.`);
            }
        }

        // 5. Find and update or create a new marks entry
        const assignedClass = assignedClasses.find(ac =>
            (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
            (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
        );

        const filter = {
            student: student._id,
            subject,
            marksType,
            marksName,
        };

        const update = {
            teacher: teacher._id,
            teacherName: teacher.name,
            studentName: student.name,
            assignedClass,
            marksObtained,
            totalMarks,
            conductedDate, // Add the conductedDate field
            isDeleted: false,
        };

        const options = {
            new: true,
            upsert: true, // Create a new document if one doesn't exist
            setDefaultsOnInsert: true,
        };

        const updatedMark = await Marks.findOneAndUpdate(filter, update, options);
        results.push(updatedMark);
    }
    res.status(200).json(results);
});


// @desc    Get marks entry by ID
// @route   GET /api/marks/:id
// @access  Private (Teacher, Student, Admin)
export const getMarksById = asyncHandler(async (req, res) => {
    const marksId = req.params.id;
    const marks = await Marks.findById(marksId);

    if (!marks || marks.isDeleted) {
        res.status(404);
        throw new Error('Marks entry not found.');
    }

    // Security check: Only allow authorized users to view the marks entry
    if (req.user.role === 'teacher' && marks.teacher.toString() !== req.user.profileId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these marks.');
    }
    if (req.user.role === 'student' && marks.student.toString() !== req.user.profileId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these marks.');
    }

    res.json(marks);
});
