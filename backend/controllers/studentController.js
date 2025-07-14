// backend/controllers/studentController.js
import Student from '../models/Student.js';


export const getAllStudents = async (req, res) => {
  try {
    const { class: studentClass, majorSubject, degreeName, semester, searchTerm } = req.query;
    const filter = {};

    if (searchTerm) {
      // Case-insensitive search across name, fatherName, cnic, address, guardianContact
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { fatherName: { $regex: searchTerm, $options: 'i' } },
        { cnic: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
        { guardianContact: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (studentClass) {
      filter.class = studentClass;
      if (studentClass !== 'BS') { // If it's a regular class (e.g., "1st", "12th")
        if (majorSubject && majorSubject !== 'N/A') { // Only apply if a specific subject is chosen
          filter.majorSubject = majorSubject;
        }
      } else { // If it's a BS level student
        if (degreeName && degreeName !== 'N/A') { // Only apply if a specific degree is chosen
          filter.degreeName = degreeName;
        }
        if (semester) { // Semester is a number
          filter.semester = parseInt(semester);
        }
      }
    }

    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStudentFeeStatus = async (req, res) => {
    try {
        const { feeStatus } = req.body;
        if (!feeStatus) {
            return res.status(400).json({ message: 'feeStatus is required' });
        }
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { feeStatus },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};