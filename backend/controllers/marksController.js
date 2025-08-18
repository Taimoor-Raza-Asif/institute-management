import asyncHandler from 'express-async-handler';
import Marks from '../models/Marks.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

// @desc    Add marks for a student
// @route   POST /api/marks
// @access  Private (Teacher only)
export const addMarks = asyncHandler(async (req, res) => {
    const { studentId, subject, marksType, marksName, marksObtained, totalMarks } = req.body;
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
        const existingMidterm1 = await Marks.findOne({ student: studentId, subject, marksType: 'Midterm 1', isDeleted: false });
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
    
    marks.isDeleted = true;
    await marks.save();
    res.json({ message: 'Marks deleted successfully.' });
});

// @desc    Get all marks entered by a specific teacher
// @route   GET /api/marks/teacher/:id
// @access  Private (Teacher only)
export const getMarksByTeacher = asyncHandler(async (req, res) => {
    const teacherId = req.params.id;
    if (req.user.profileId.toString() !== teacherId.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these marks.');
    }
    const marks = await Marks.find({ teacher: teacherId, isDeleted: false }).populate('student', 'name class classNumber degreeName semester');
    res.json(marks);
});

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

    const marks = await Marks.find({ student: studentId, isDeleted: false }).populate('teacher', 'name');
    res.json(marks);
});

// @desc    Get all marks (Admin only)
// @route   GET /api/marks
// @access  Private (Admin only)
export const getAllMarks = asyncHandler(async (req, res) => {
    const marks = await Marks.find({ isDeleted: false })
        .populate('student', 'name')
        .populate('teacher', 'name');
    res.json(marks);
});