// backend/controllers/studentController.js
// import Student from '../models/Student.js';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const profilePicturesDir = path.join(__dirname, '../uploads/profilePictures');

// const getRelativeUploadUrl = (filePath) => {
//   if (!filePath) return '';
//   return filePath.replace(path.join(__dirname, '../'), '/');
// };

// backend/controllers/studentController.js

import Student from '../models/Student.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get relative URL for uploaded files
const getRelativeUploadUrl = (filePath) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  return '/uploads' + filePath.substring(uploadsDir.length).replace(/\\/g, '/');
};

// --- UPDATE STUDENT ---
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, fatherName, cnic, address, guardianContact, additionalContact,
      dob, gender, admissionDate, email, class: studentClass, classNumber,
      majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
      profilePictureUrl: existingProfilePictureUrl,
      reason
    } = req.body;

    // First, fetch the existing student to handle profile picture deletion logic
    // and to get current values for conditional logic (e.g., clearing reason)
    const currentStudent = await Student.findById(id);
    if (!currentStudent) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
        });
      }
      return res.status(404).json({ message: 'Student not found' });
    }

    // Construct an update object with only the fields that are actually provided in req.body.
    // This is crucial for partial updates.
    const updateFields = {};

    // Only add fields to updateFields if they are explicitly present in req.body
    // This allows `findByIdAndUpdate` to only touch these specific fields.
    if (name !== undefined) updateFields.name = name;
    if (fatherName !== undefined) updateFields.fatherName = fatherName;
    if (cnic !== undefined) updateFields.cnic = cnic;
    if (address !== undefined) updateFields.address = address;
    if (guardianContact !== undefined) updateFields.guardianContact = guardianContact;
    if (additionalContact !== undefined) updateFields.additionalContact = additionalContact;

    // Handle Date fields: only update if provided and valid
    if (dob !== undefined) {
      const parsedDob = new Date(dob);
      if (!isNaN(parsedDob.getTime())) {
        updateFields.dob = parsedDob;
      } else if (dob === null || dob === '') { // Allow clearing date fields if explicitly null/empty string
        updateFields.dob = null;
      } else {
        // If dob is invalid but provided, return an error
        return res.status(400).json({ message: 'Invalid Date of Birth format.' });
      }
    }
    if (gender !== undefined) updateFields.gender = gender;
    if (admissionDate !== undefined) {
      const parsedAdmissionDate = new Date(admissionDate);
      if (!isNaN(parsedAdmissionDate.getTime())) {
        updateFields.admissionDate = parsedAdmissionDate;
      } else if (admissionDate === null || admissionDate === '') { // Allow clearing date fields
        updateFields.admissionDate = null;
      } else {
        return res.status(400).json({ message: 'Invalid Admission Date format.' });
      }
    }
    if (email !== undefined) updateFields.email = email;

    // Handle profile picture logic
    if (req.file) {
      // New file uploaded, delete old one if exists
      if (currentStudent.profilePictureUrl && currentStudent.profilePictureUrl !== '') {
        const oldPath = path.join(__dirname, '../', currentStudent.profilePictureUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old profile picture:', unlinkErr);
        });
      }
      updateFields.profilePictureUrl = getRelativeUploadUrl(req.file.path);
    } else if (existingProfilePictureUrl === '') {
      // User explicitly cleared the picture
      if (currentStudent.profilePictureUrl && currentStudent.profilePictureUrl !== '') {
        const oldPath = path.join(__dirname, '../', currentStudent.profilePictureUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old profile picture (cleared):', unlinkErr);
        });
      }
      updateFields.profilePictureUrl = '';
    } else if (existingProfilePictureUrl !== undefined) {
      // If existingProfilePictureUrl is provided and not empty, and no new file, keep it
      updateFields.profilePictureUrl = existingProfilePictureUrl;
    }


    if (studentClass !== undefined) updateFields.class = studentClass;
    if (studentStatus !== undefined) {
      updateFields.studentStatus = studentStatus;
      // Conditional validation for 'reason' on update, only if studentStatus is provided
      if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
        if (req.file) { // Clean up file if validation fails
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting newly uploaded file on validation error:', unlinkErr);
          });
        }
        return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
      }
      // If status changes from Expelled/Withdrawn to something else, clear reason
      if (!(studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && currentStudent.reason) {
          updateFields.reason = ''; // Explicitly set to empty string to clear it
      } else if (reason !== undefined) { // If reason is provided, set it
          updateFields.reason = reason;
      }
    } else if (reason !== undefined) {
      // If reason is provided but studentStatus is not, just update reason
      updateFields.reason = reason;
    }

    if (feePerMonth !== undefined) updateFields.feePerMonth = parseFloat(feePerMonth);
    if (depositedAmount !== undefined) updateFields.depositedAmount = depositedAmount;
    if (otherDues !== undefined) updateFields.otherDues = otherDues;

    // Handle class-specific fields: only update if studentClass is provided
    if (studentClass !== undefined) {
      if (studentClass === 'Class') {
        if (classNumber !== undefined) updateFields.classNumber = classNumber;
        if (majorSubject !== undefined) updateFields.majorSubject = majorSubject;
        updateFields.degreeName = undefined; // Explicitly clear BS fields
        updateFields.semester = undefined;
      } else if (studentClass === 'BS') {
        if (degreeName !== undefined) updateFields.degreeName = degreeName;
        if (semester !== undefined) updateFields.semester = parseInt(semester);
        updateFields.classNumber = undefined; // Explicitly clear Class fields
        updateFields.majorSubject = undefined;
      } else { // If class is set to empty or invalid, clear all related fields
        updateFields.classNumber = undefined;
        updateFields.majorSubject = undefined;
        updateFields.degreeName = undefined;
        updateFields.semester = undefined;
      }
    }


    // Perform the update using findByIdAndUpdate with $set
    // This will only update the fields present in updateFields and run validators only on those fields.
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' } // 'context: 'query'' helps with 'required' validators on partial updates
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(updatedStudent);

  } catch (err) {
    console.error("Error updating student:", err);
    // Clean up uploaded file if an error occurred during update
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
      });
    }

    // More specific error handling for Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Student validation failed', errors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
      // Duplicate key error for CNIC
      return res.status(400).json({ message: 'This CNIC is already registered.' });
    }
    res.status(500).json({ message: 'Failed to update student: ' + err.message });
  }
};


// --- GET ALL STUDENTS ---
export const getAllStudents = async (req, res) => {
  try {
    const {
      class: studentClass,
      majorSubject,
      degreeName,
      semester,
      searchTerm,
      studentStatus,
      classNumber
    } = req.query;

    const filter = {};

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { fatherName: { $regex: searchTerm, $options: 'i' } },
        { cnic: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } },
        { guardianContact: { $regex: searchTerm, $options: 'i' } },
        { additionalContact: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (studentClass) {
      filter.class = studentClass;
      if (studentClass === 'Class') {
        if (classNumber) {
          filter.classNumber = classNumber;
        }
        if (majorSubject && majorSubject !== 'N/A') {
          filter.majorSubject = majorSubject;
        }
      } else if (studentClass === 'BS') {
        if (degreeName && degreeName !== 'N/A') {
          filter.degreeName = degreeName;
        }
        if (semester) {
          filter.semester = parseInt(semester);
        }
      }
    }

    if (studentStatus && studentStatus !== 'All Students') {
      filter.studentStatus = studentStatus;
    }

    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: 'Failed to retrieve students: ' + err.message });
  }
};

// --- GET STUDENT BY ID ---
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- CREATE STUDENT ---
export const createStudent = async (req, res) => {
  try {
    const {
      name, fatherName, cnic, address, guardianContact, additionalContact,
      dob, gender, admissionDate, email, class: studentClass, classNumber,
      majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
      reason // NEW: Extract reason
    } = req.body;

    let profilePictureUrl = '';
    if (req.file) {
      profilePictureUrl = getRelativeUploadUrl(req.file.path);
    }

    // Conditional validation for 'reason'
    if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
      // If status is Expelled/Withdrawn, and reason is missing, return an error
      if (req.file) { // Clean up file if validation fails
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting uploaded file on validation error:', unlinkErr);
        });
      }
      return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
    }

    const newStudent = new Student({
      name,
      fatherName,
      cnic,
      address,
      guardianContact,
      additionalContact,
      dob: new Date(dob),
      gender,
      admissionDate: new Date(admissionDate),
      email,
      profilePictureUrl,
      class: studentClass,
      studentStatus,
      feePerMonth: parseFloat(feePerMonth),
      reason: (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined, // NEW: Conditionally set reason
      depositedAmount: depositedAmount || 0, // Default to 0 if not provided
      otherDues: otherDues || 0,
      classNumber: studentClass === 'Class' ? classNumber : undefined,
      majorSubject: studentClass === 'Class' ? majorSubject : undefined,
      degreeName: studentClass === 'BS' ? degreeName : undefined,
      semester: studentClass === 'BS' ? parseInt(semester) : undefined,
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Error creating student:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
      });
    }
    res.status(400).json({ message: 'Failed to save student: ' + err.message });
  }
};


// // --- UPDATE STUDENT ---
// export const updateStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, admissionDate, email, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
//       profilePictureUrl: existingProfilePictureUrl,
//       reason // NEW: Extract reason
//     } = req.body;

//     const student = await Student.findById(id);
//     if (!student) {
//       if (req.file) {
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
//         });
//       }
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Conditional validation for 'reason' on update
//     if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
//       if (req.file) { // Clean up file if validation fails
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file on validation error:', unlinkErr);
//         });
//       }
//       return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
//     }


//     let newProfilePictureUrl = student.profilePictureUrl;

//     if (req.file) {
//       if (student.profilePictureUrl && student.profilePictureUrl !== '') {
//         const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old profile picture:', unlinkErr);
//         });
//       }
//       newProfilePictureUrl = getRelativeUploadUrl(req.file.path);
//     } else if (existingProfilePictureUrl === '') {
//       if (student.profilePictureUrl && student.profilePictureUrl !== '') {
//         const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old profile picture (cleared):', unlinkErr);
//         });
//       }
//       newProfilePictureUrl = '';
//     }

//     student.name = name;
//     student.fatherName = fatherName;
//     student.cnic = cnic;
//     student.address = address;
//     student.guardianContact = guardianContact;
//     student.additionalContact = additionalContact;
//     student.dob = new Date(dob);
//     student.gender = gender;
//     student.admissionDate = new Date(admissionDate);
//     student.email = email;
//     student.profilePictureUrl = newProfilePictureUrl;
//     student.class = studentClass;
//     student.studentStatus = studentStatus;
//     student.feePerMonth = parseFloat(feePerMonth);
//     // NEW: Conditionally set reason
//     student.reason = (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined;
//     student.depositedAmount = depositedAmount;
//     student.otherDues = otherDues;

//     if (studentClass === 'Class') {
//       student.classNumber = classNumber;
//       student.majorSubject = majorSubject;
//       student.degreeName = undefined;
//       student.semester = undefined;
//     } else if (studentClass === 'BS') {
//       student.degreeName = degreeName;
//       student.semester = parseInt(semester);
//       student.classNumber = undefined;
//       student.majorSubject = undefined;
//     } else {
//       student.classNumber = undefined;
//       student.majorSubject = undefined;
//       student.degreeName = undefined;
//       student.semester = undefined;
//     }

//     const updatedStudent = await student.save();
//     res.json(updatedStudent);
//   } catch (err) {
//     console.error("Error updating student:", err);
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
//       });
//     }
//     res.status(400).json({ message: 'Failed to update student: ' + err.message });
//   }
// };


// --- DELETE STUDENT ---
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.profilePictureUrl && student.profilePictureUrl !== '') {
      const filePath = path.join(__dirname, '../', student.profilePictureUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting profile picture file:', err);
      });
    }

    await student.deleteOne();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- UPDATE STUDENT FEE STATUS ---
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
    console.error("Error updating student fee status:", err);
    res.status(500).json({ message: err.message });
  }
};