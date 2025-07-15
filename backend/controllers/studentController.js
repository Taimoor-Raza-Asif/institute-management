// // backend/controllers/studentController.js
// import Student from '../models/Student.js';
// import path from 'path'; // Node.js path module for file paths
// import fs from 'fs';   // Node.js file system module for file operations
// import { fileURLToPath } from 'url'; // For ES Modules to get __dirname

// // Helper to get __dirname equivalent in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Path to the uploads directory for profile pictures
// const profilePicturesDir = path.join(__dirname, '../uploads/profilePictures');

// // Helper to get relative URL for saving in DB
// // This converts the absolute file path to a URL path relative to your server's root
// const getRelativeUploadUrl = (filePath) => {
//   if (!filePath) return '';
//   // Example: C:\...\backend\uploads\profilePictures\image.jpg -> /uploads/profilePictures/image.jpg
//   return filePath.replace(path.join(__dirname, '../'), '/');
// };

// // --- GET ALL STUDENTS ---
// export const getAllStudents = async (req, res) => {
//   try {
//     const {
//       class: studentClass,
//       majorSubject,
//       degreeName,
//       semester,
//       searchTerm,
//       studentStatus,
//       classNumber // NEW: Extract classNumber from query parameters
//     } = req.query;

//     const filter = {};

//     // Build the $or array for searchTerm if it exists
//     if (searchTerm) {
//       filter.$or = [
//         { name: { $regex: searchTerm, $options: 'i' } },
//         { fatherName: { $regex: searchTerm, $options: 'i' } },
//         { cnic: { $regex: searchTerm, $options: 'i' } },
//         { address: { $regex: searchTerm, $options: 'i' } },
//         { guardianContact: { $regex: searchTerm, $options: 'i' } },
//         { additionalContact: { $regex: searchTerm, $options: 'i' } },
//         { email: { $regex: searchTerm, $options: 'i' } },
//       ];
//     }

//     // Filter by studentClass and its sub-categories
//     if (studentClass) {
//       filter.class = studentClass;
//       if (studentClass === 'Class') {
//         // NEW: Apply classNumber filter if provided
//         if (classNumber) { // Check if classNumber is present in query
//           filter.classNumber = classNumber;
//         }
//         if (majorSubject && majorSubject !== 'N/A') {
//           filter.majorSubject = majorSubject;
//         }
//       } else if (studentClass === 'BS') {
//         if (degreeName && degreeName !== 'N/A') {
//           filter.degreeName = degreeName;
//         }
//         if (semester) {
//           filter.semester = parseInt(semester);
//         }
//       }
//     }

//     // Apply studentStatus filter if provided in query and not 'All Students'
//     if (studentStatus && studentStatus !== 'All Students') { // Changed from 'All' to 'All Students'
//       filter.studentStatus = studentStatus;
//     }

//     const students = await Student.find(filter);
//     res.json(students);
//   } catch (err) {
//     console.error("Error fetching students:", err);
//     res.status(500).json({ message: 'Failed to retrieve students: ' + err.message });
//   }
// };

// // --- GET STUDENT BY ID ---
// export const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ message: 'Student not found' });
//     res.json(student);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- CREATE STUDENT ---
// export const createStudent = async (req, res) => {
//   try {
//     // All text fields are in req.body. The file is in req.file.
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, admissionDate, email, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus
//     } = req.body;

//     let profilePictureUrl = '';
//     if (req.file) { // Check if a file was uploaded by Multer
//       profilePictureUrl = getRelativeUploadUrl(req.file.path);
//     }

//     // Create new Student instance with proper type conversions
//     const newStudent = new Student({
//       name,
//       fatherName,
//       cnic,
//       address,
//       guardianContact,
//       additionalContact,
//       dob: new Date(dob), // Convert DOB string to Date object
//       gender,
//       admissionDate: new Date(admissionDate), // Convert Admission Date string to Date object
//       email,
//       profilePictureUrl, // Assign the URL (empty string if no file)
//       class: studentClass,
//       studentStatus,
//       feePerMonth: parseFloat(feePerMonth), // Convert feePerMonth string to Number

//       // Conditionally assign class-specific fields
//       classNumber: studentClass === 'Class' ? classNumber : undefined,
//       majorSubject: studentClass === 'Class' ? majorSubject : undefined,
//       degreeName: studentClass === 'BS' ? degreeName : undefined,
//       semester: studentClass === 'BS' ? parseInt(semester) : undefined, // Convert semester to Number
//     });

//     const savedStudent = await newStudent.save();
//     res.status(201).json(savedStudent);
//   } catch (err) {
//     console.error("Error creating student:", err);
//     // If a file was uploaded but student creation failed, delete the file
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
//       });
//     }
//     // Return 400 for validation errors, 500 for other server errors
//     res.status(400).json({ message: 'Failed to save student: ' + err.message });
//   }
// };


// // --- UPDATE STUDENT ---
// export const updateStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // All text fields are in req.body. The new file (if any) is in req.file.
//     // The existingProfilePictureUrl comes from req.body if the frontend sends it.
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, admissionDate, email, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus,
//       profilePictureUrl: existingProfilePictureUrl // This is the old URL string from frontend
//     } = req.body;

//     const student = await Student.findById(id);
//     if (!student) {
//       // If student not found, and a new file was uploaded, delete the new file
//       if (req.file) {
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
//         });
//       }
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Handle profile picture update logic
//     let newProfilePictureUrl = student.profilePictureUrl; // Start with current DB URL

//     if (req.file) {
//       // A new file was uploaded: delete the old one if it exists
//       if (student.profilePictureUrl && student.profilePictureUrl !== '') {
//         const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old profile picture:', unlinkErr);
//         });
//       }
//       newProfilePictureUrl = getRelativeUploadUrl(req.file.path); // Set to new file's URL
//     } else if (existingProfilePictureUrl === '') {
//       // Frontend explicitly sent an empty string for profilePictureUrl,
//       // meaning the user cleared the image or it was never set.
//       if (student.profilePictureUrl && student.profilePictureUrl !== '') {
//         const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
//         fs.unlink(oldPath, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting old profile picture (cleared):', unlinkErr);
//         });
//       }
//       newProfilePictureUrl = ''; // Clear the URL in DB
//     }
//     // If req.file is null AND existingProfilePictureUrl is NOT empty,
//     // it means no new file was uploaded and the existing one was kept.
//     // In this case, newProfilePictureUrl correctly retains its value from student.profilePictureUrl.


//     // Update student fields with proper type conversions
//     student.name = name;
//     student.fatherName = fatherName;
//     student.cnic = cnic;
//     student.address = address;
//     student.guardianContact = guardianContact;
//     student.additionalContact = additionalContact;
//     student.dob = new Date(dob); // Convert string to Date object
//     student.gender = gender;
//     student.admissionDate = new Date(admissionDate); // Convert string to Date object
//     student.email = email;
//     student.profilePictureUrl = newProfilePictureUrl; // Update with new/cleared URL
//     student.class = studentClass;
//     student.studentStatus = studentStatus;
//     student.feePerMonth = parseFloat(feePerMonth); // Convert to number

//     // Conditionally update class-specific fields based on selected class type
//     if (studentClass === 'Class') {
//       student.classNumber = classNumber;
//       student.majorSubject = majorSubject;
//       student.degreeName = undefined; // Clear BS-specific fields
//       student.semester = undefined;   // Clear BS-specific fields
//     } else if (studentClass === 'BS') {
//       student.degreeName = degreeName;
//       student.semester = parseInt(semester); // Convert semester to Number
//       student.classNumber = undefined; // Clear Class-specific fields
//       student.majorSubject = undefined; // Clear Class-specific fields
//     } else {
//       // If class type is neither 'Class' nor 'BS', clear all specific class/degree fields
//       student.classNumber = undefined;
//       student.majorSubject = undefined;
//       student.degreeName = undefined;
//       student.semester = undefined;
//     }

//     const updatedStudent = await student.save(); // Save the updated document
//     res.json(updatedStudent);
//   } catch (err) {
//     console.error("Error updating student:", err);
//     // If a new file was uploaded but student update failed, delete the new file
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
//       });
//     }
//     res.status(400).json({ message: 'Failed to update student: ' + err.message });
//   }
// };


// // --- DELETE STUDENT ---
// export const deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Delete associated profile picture file if it exists
//     if (student.profilePictureUrl && student.profilePictureUrl !== '') {
//       const filePath = path.join(__dirname, '../', student.profilePictureUrl);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting profile picture file:', err);
//       });
//     }

//     await student.deleteOne(); // Use deleteOne() for Mongoose 6+
//     res.json({ message: 'Student deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting student:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- UPDATE STUDENT FEE STATUS ---
// export const updateStudentFeeStatus = async (req, res) => {
//     try {
//         const { feeStatus } = req.body;
//         if (!feeStatus) {
//             return res.status(400).json({ message: 'feeStatus is required' });
//         }
//         const updatedStudent = await Student.findByIdAndUpdate(
//             req.params.id,
//             { feeStatus },
//             { new: true, runValidators: true }
//         );
//         if (!updatedStudent) {
//             return res.status(404).json({ message: 'Student not found' });
//         }
//         res.json(updatedStudent);
//     } catch (err) {
//         console.error("Error updating student fee status:", err);
//         res.status(500).json({ message: err.message });
//     }
// };


// backend/controllers/studentController.js
import Student from '../models/Student.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profilePicturesDir = path.join(__dirname, '../uploads/profilePictures');

const getRelativeUploadUrl = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(path.join(__dirname, '../'), '/');
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
      majorSubject, degreeName, semester, feePerMonth, studentStatus,
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


// --- UPDATE STUDENT ---
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, fatherName, cnic, address, guardianContact, additionalContact,
      dob, gender, admissionDate, email, class: studentClass, classNumber,
      majorSubject, degreeName, semester, feePerMonth, studentStatus,
      profilePictureUrl: existingProfilePictureUrl,
      reason // NEW: Extract reason
    } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
        });
      }
      return res.status(404).json({ message: 'Student not found' });
    }

    // Conditional validation for 'reason' on update
    if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
      if (req.file) { // Clean up file if validation fails
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file on validation error:', unlinkErr);
        });
      }
      return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
    }


    let newProfilePictureUrl = student.profilePictureUrl;

    if (req.file) {
      if (student.profilePictureUrl && student.profilePictureUrl !== '') {
        const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old profile picture:', unlinkErr);
        });
      }
      newProfilePictureUrl = getRelativeUploadUrl(req.file.path);
    } else if (existingProfilePictureUrl === '') {
      if (student.profilePictureUrl && student.profilePictureUrl !== '') {
        const oldPath = path.join(__dirname, '../', student.profilePictureUrl);
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old profile picture (cleared):', unlinkErr);
        });
      }
      newProfilePictureUrl = '';
    }

    student.name = name;
    student.fatherName = fatherName;
    student.cnic = cnic;
    student.address = address;
    student.guardianContact = guardianContact;
    student.additionalContact = additionalContact;
    student.dob = new Date(dob);
    student.gender = gender;
    student.admissionDate = new Date(admissionDate);
    student.email = email;
    student.profilePictureUrl = newProfilePictureUrl;
    student.class = studentClass;
    student.studentStatus = studentStatus;
    student.feePerMonth = parseFloat(feePerMonth);
    // NEW: Conditionally set reason
    student.reason = (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined;


    if (studentClass === 'Class') {
      student.classNumber = classNumber;
      student.majorSubject = majorSubject;
      student.degreeName = undefined;
      student.semester = undefined;
    } else if (studentClass === 'BS') {
      student.degreeName = degreeName;
      student.semester = parseInt(semester);
      student.classNumber = undefined;
      student.majorSubject = undefined;
    } else {
      student.classNumber = undefined;
      student.majorSubject = undefined;
      student.degreeName = undefined;
      student.semester = undefined;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    console.error("Error updating student:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
      });
    }
    res.status(400).json({ message: 'Failed to update student: ' + err.message });
  }
};


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