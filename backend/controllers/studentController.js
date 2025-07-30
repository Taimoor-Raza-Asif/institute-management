// // // backend/controllers/studentController.js

// // import Student from '../models/Student.js';
// // import fs from 'fs';
// // import path from 'path';
// // import { fileURLToPath } from 'url';

// // // Helper to get __dirname in ES modules
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Helper to get relative URL for uploaded files
// // // This function assumes files are stored directly within 'uploads' or its subdirectories.
// // const getRelativeUploadUrl = (filePath) => {
// //   if (!filePath) return '';
// //   const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
// //   // Calculate the relative path from the uploads directory
// //   const relativePath = path.relative(uploadsBaseDir, filePath);
// //   // Return the URL path, ensuring forward slashes and starting with /uploads/
// //   return '/uploads/' + relativePath.replace(/\\/g, '/');
// // };

// // // Helper function to handle file upload logic (for both create and update)
// // const handleFileUploadLogic = (files, existingUrlFromReqBody, oldUrlFromDb, fieldName) => {
// //   let newUrl = oldUrlFromDb; // Default to existing DB URL

// //   if (files && files.length > 0) {
// //     // A new file was uploaded for this field
// //     if (oldUrlFromDb) {
// //       // Delete the old file from the server if it exists
// //       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
// //       fs.unlink(oldPath, (err) => {
// //         if (err) console.error(`Error deleting old ${fieldName} file (${oldPath}):`, err);
// //       });
// //     }
// //     newUrl = getRelativeUploadUrl(files[0].path);
// //   } else if (existingUrlFromReqBody === '') {
// //     // The frontend explicitly sent an empty string, meaning the user cleared the file
// //     if (oldUrlFromDb) {
// //       // Delete the old file from the server
// //       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
// //       fs.unlink(oldPath, (err) => {
// //         if (err) console.error(`Error deleting old ${fieldName} file (cleared) (${oldPath}):`, err);
// //       });
// //     }
// //     newUrl = ''; // Set URL to empty string in DB
// //   }
// //   // If files is empty and existingUrlFromReqBody is undefined (not sent),
// //   // then newUrl remains oldUrlFromDb, which is the desired behavior (keep existing file).

// //   return newUrl;
// // };


// // // --- UPDATE STUDENT ---
// // export const updateStudent = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const {
// //       name, fatherName, cnic, address, guardianContact, additionalContact,
// //       dob, gender, email, admissionDate, class: studentClass, classNumber,
// //       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
// //       reason, // Reason field for status
// //       // Existing URLs from req.body (sent by frontend if not uploading new file)
// //       profilePictureUrl: existingProfilePictureUrl,
// //       cnicFrontUrl: existingCnicFrontUrl,
// //       cnicBackUrl: existingCnicBackUrl,
// //       bFormUrl: existingBFormUrl,
// //       characterCertificateUrl: existingCharacterCertificateUrl,
// //       previousClassResultUrl: existingPreviousClassResultUrl,
// //       class10ResultUrl: existingClass10ResultUrl,
// //       class12ResultUrl: existingClass12ResultUrl,
// //     } = req.body;

// //     // Fetch the existing student document to get current file URLs for deletion logic
// //     const currentStudent = await Student.findById(id);
// //     if (!currentStudent) {
// //       // If student not found, delete any newly uploaded files to prevent orphans
// //       if (req.files) {
// //         Object.values(req.files).flat().forEach(file => {
// //           fs.unlink(file.path, (unlinkErr) => {
// //             if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
// //           });
// //         });
// //       }
// //       return res.status(404).json({ message: 'Student not found' });
// //     }

// //     const updateFields = {};

// //     // --- Basic Info Fields ---
// //     if (name !== undefined) updateFields.name = name;
// //     if (fatherName !== undefined) updateFields.fatherName = fatherName;
// //     if (cnic !== undefined) updateFields.cnic = cnic;
// //     if (address !== undefined) updateFields.address = address;
// //     if (guardianContact !== undefined) updateFields.guardianContact = guardianContact;
// //     if (additionalContact !== undefined) updateFields.additionalContact = additionalContact;
// //     if (email !== undefined) updateFields.email = email;
// //     if (gender !== undefined) updateFields.gender = gender;

// //     // Handle Date fields: only update if provided and valid
// //     if (dob !== undefined) {
// //       const parsedDob = new Date(dob);
// //       if (!isNaN(parsedDob.getTime())) { updateFields.dob = parsedDob; }
// //       else if (dob === null || dob === '') { updateFields.dob = null; }
// //       else { return res.status(400).json({ message: 'Invalid Date of Birth format.' }); }
// //     }
// //     if (admissionDate !== undefined) {
// //       const parsedAdmissionDate = new Date(admissionDate);
// //       if (!isNaN(parsedAdmissionDate.getTime())) { updateFields.admissionDate = parsedAdmissionDate; }
// //       else if (admissionDate === null || admissionDate === '') { updateFields.admissionDate = null; }
// //       else { return res.status(400).json({ message: 'Invalid Admission Date format.' }); }
// //     }

// //     // --- Academic & Financial Fields ---
// //     if (studentClass !== undefined) updateFields.class = studentClass;
// //     if (feePerMonth !== undefined) updateFields.feePerMonth = parseFloat(feePerMonth);
// //     if (depositedAmount !== undefined) updateFields.depositedAmount = depositedAmount;
// //     if (otherDues !== undefined) updateFields.otherDues = otherDues;

// //     // Handle studentStatus and reason
// //     if (studentStatus !== undefined) {
// //       updateFields.studentStatus = studentStatus;
// //       // Conditional validation for 'reason' on update
// //       if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
// //         return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
// //       }
// //       // If status changes from Expelled/Withdrawn to something else, clear reason
// //       if (!(studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && currentStudent.reason) {
// //           updateFields.reason = '';
// //       } else if (reason !== undefined) { // If reason is provided, set it
// //           updateFields.reason = reason;
// //       }
// //     } else if (reason !== undefined) { // If reason is provided but studentStatus is not, just update reason
// //       updateFields.reason = reason;
// //     }

// //     // Handle class-specific fields
// //     if (studentClass !== undefined) {
// //       if (studentClass === 'Class') {
// //         if (classNumber !== undefined) updateFields.classNumber = classNumber;
// //         if (majorSubject !== undefined) updateFields.majorSubject = majorSubject;
// //         updateFields.degreeName = undefined; // Explicitly clear BS fields
// //         updateFields.semester = undefined;
// //       } else if (studentClass === 'BS') {
// //         if (degreeName !== undefined) updateFields.degreeName = degreeName;
// //         if (semester !== undefined) updateFields.semester = parseInt(semester);
// //         updateFields.classNumber = undefined; // Explicitly clear Class fields
// //         updateFields.majorSubject = undefined;
// //       } else { // If class is set to empty or invalid, clear all related fields
// //         updateFields.classNumber = undefined;
// //         updateFields.majorSubject = undefined;
// //         updateFields.degreeName = undefined;
// //         updateFields.semester = undefined;
// //       }
// //     }

// //     // --- Document Upload Fields ---
// //     // req.files will be an object where keys are field names and values are arrays of files
// //     updateFields.profilePictureUrl = handleFileUploadLogic(req.files.profilePicture, existingProfilePictureUrl, currentStudent.profilePictureUrl, 'profilePicture');
// //     updateFields.cnicFrontUrl = handleFileUploadLogic(req.files.cnicFront, existingCnicFrontUrl, currentStudent.cnicFrontUrl, 'cnicFront');
// //     updateFields.cnicBackUrl = handleFileUploadLogic(req.files.cnicBack, existingCnicBackUrl, currentStudent.cnicBackUrl, 'cnicBack');
// //     updateFields.bFormUrl = handleFileUploadLogic(req.files.bForm, existingBFormUrl, currentStudent.bFormUrl, 'bForm');
// //     updateFields.characterCertificateUrl = handleFileUploadLogic(req.files.characterCertificate, existingCharacterCertificateUrl, currentStudent.characterCertificateUrl, 'characterCertificate');
// //     updateFields.previousClassResultUrl = handleFileUploadLogic(req.files.previousClassResult, existingPreviousClassResultUrl, currentStudent.previousClassResultUrl, 'previousClassResult');
// //     updateFields.class10ResultUrl = handleFileUploadLogic(req.files.class10Result, existingClass10ResultUrl, currentStudent.class10ResultUrl, 'class10Result');
// //     updateFields.class12ResultUrl = handleFileUploadLogic(req.files.class12Result, existingClass12ResultUrl, currentStudent.class12ResultUrl, 'class12Result');


// //     // Perform the update using findByIdAndUpdate with $set
// //     const updatedStudent = await Student.findByIdAndUpdate(
// //       id,
// //       { $set: updateFields },
// //       { new: true, runValidators: true, context: 'query' } // 'context: 'query'' helps with 'required' validators on partial updates
// //     );

// //     if (!updatedStudent) {
// //       return res.status(404).json({ message: 'Student not found' });
// //     }
// //     res.json(updatedStudent);

// //   } catch (err) {
// //     console.error("Error updating student:", err);
// //     // Clean up any newly uploaded files if an error occurred during update
// //     if (req.files) {
// //       Object.values(req.files).flat().forEach(file => {
// //         fs.unlink(file.path, (unlinkErr) => {
// //           if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
// //         });
// //       });
// //     }

// //     if (err.name === 'ValidationError') {
// //       const errors = {};
// //       for (let field in err.errors) {
// //         errors[field] = err.errors[field].message;
// //       }
// //       return res.status(400).json({ message: 'Student validation failed', errors });
// //     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
// //       return res.status(400).json({ message: 'This CNIC is already registered.' });
// //     }
// //     res.status(500).json({ message: 'Failed to update student: ' + err.message });
// //   }
// // };


// // // --- GET ALL STUDENTS ---
// // export const getAllStudents = async (req, res) => {
// //   try {
// //     const {
// //       class: studentClass,
// //       majorSubject,
// //       degreeName,
// //       semester,
// //       searchTerm,
// //       studentStatus,
// //       classNumber
// //     } = req.query;

// //     const filter = {};

// //     if (searchTerm) {
// //       filter.$or = [
// //         { name: { $regex: searchTerm, $options: 'i' } },
// //         { fatherName: { $regex: searchTerm, $options: 'i' } },
// //         { cnic: { $regex: searchTerm, $options: 'i' } },
// //         { address: { $regex: searchTerm, $options: 'i' } },
// //         { guardianContact: { $regex: searchTerm, $options: 'i' } },
// //         { additionalContact: { $regex: searchTerm, $options: 'i' } },
// //         { email: { $regex: searchTerm, $options: 'i' } },
// //       ];
// //     }

// //     if (studentClass) {
// //       filter.class = studentClass;
// //       if (studentClass === 'Class') {
// //         if (classNumber) {
// //           filter.classNumber = classNumber;
// //         }
// //         if (majorSubject && majorSubject !== 'N/A') {
// //           filter.majorSubject = majorSubject;
// //         }
// //       } else if (studentClass === 'BS') {
// //         if (degreeName && degreeName !== 'N/A') {
// //           filter.degreeName = degreeName;
// //         }
// //         if (semester) {
// //           filter.semester = parseInt(semester);
// //         }
// //       }
// //     }

// //     if (studentStatus && studentStatus !== 'All Students') {
// //       filter.studentStatus = studentStatus;
// //     }

// //     const students = await Student.find(filter);
// //     res.json(students);
// //   } catch (err) {
// //     console.error("Error fetching students:", err);
// //     res.status(500).json({ message: 'Failed to retrieve students: ' + err.message });
// //   }
// // };

// // // --- GET STUDENT BY ID ---
// // export const getStudentById = async (req, res) => {
// //   try {
// //     const student = await Student.findById(req.params.id);
// //     if (!student) return res.status(404).json({ message: 'Student not found' });
// //     res.json(student);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // --- CREATE STUDENT ---
// // export const createStudent = async (req, res) => {
// //   try {
// //     const {
// //       name, fatherName, cnic, address, guardianContact, additionalContact,
// //       dob, gender, email, admissionDate, class: studentClass, classNumber,
// //       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
// //       reason
// //     } = req.body;

// //     // Initialize URLs from uploaded files (req.files will be an object)
// //     const profilePictureUrl = req.files && req.files.profilePicture ? getRelativeUploadUrl(req.files.profilePicture[0].path) : '';
// //     const cnicFrontUrl = req.files && req.files.cnicFront ? getRelativeUploadUrl(req.files.cnicFront[0].path) : '';
// //     const cnicBackUrl = req.files && req.files.cnicBack ? getRelativeUploadUrl(req.files.cnicBack[0].path) : '';
// //     const bFormUrl = req.files && req.files.bForm ? getRelativeUploadUrl(req.files.bForm[0].path) : '';
// //     const characterCertificateUrl = req.files && req.files.characterCertificate ? getRelativeUploadUrl(req.files.characterCertificate[0].path) : '';
// //     const previousClassResultUrl = req.files && req.files.previousClassResult ? getRelativeUploadUrl(req.files.previousClassResult[0].path) : '';
// //     const class10ResultUrl = req.files && req.files.class10Result ? getRelativeUploadUrl(req.files.class10Result[0].path) : '';
// //     const class12ResultUrl = req.files && req.files.class12Result ? getRelativeUploadUrl(req.files.class12Result[0].path) : '';


// //     // Conditional validation for 'reason'
// //     if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
// //       // If status is Expelled/Withdrawn, and reason is missing, delete uploaded files
// //       if (req.files) {
// //         Object.values(req.files).flat().forEach(file => {
// //           fs.unlink(file.path, (unlinkErr) => {
// //             if (unlinkErr) console.error('Error deleting uploaded file on validation error:', unlinkErr);
// //           });
// //         });
// //       }
// //       return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
// //     }

// //     const newStudent = new Student({
// //       name,
// //       fatherName,
// //       cnic,
// //       address,
// //       guardianContact,
// //       additionalContact,
// //       dob: new Date(dob),
// //       gender,
// //       admissionDate: new Date(admissionDate),
// //       email,
// //       profilePictureUrl,
// //       class: studentClass,
// //       studentStatus,
// //       feePerMonth: parseFloat(feePerMonth),
// //       reason: (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined,
// //       depositedAmount: depositedAmount || 0,
// //       otherDues: otherDues || 0,
// //       classNumber: studentClass === 'Class' ? classNumber : undefined,
// //       majorSubject: studentClass === 'Class' ? majorSubject : undefined,
// //       degreeName: studentClass === 'BS' ? degreeName : undefined,
// //       semester: studentClass === 'BS' ? parseInt(semester) : undefined,
// //       // New document URLs
// //       cnicFrontUrl,
// //       cnicBackUrl,
// //       bFormUrl,
// //       characterCertificateUrl,
// //       previousClassResultUrl,
// //       class10ResultUrl,
// //       class12ResultUrl,
// //     });

// //     const savedStudent = await newStudent.save();
// //     res.status(201).json(savedStudent);
// //   } catch (err) {
// //     console.error("Error creating student:", err);
// //     // Clean up any newly uploaded files if an error occurred during creation
// //     if (req.files) {
// //       Object.values(req.files).flat().forEach(file => {
// //         fs.unlink(file.path, (unlinkErr) => {
// //           if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
// //         });
// //       });
// //     }
// //     if (err.name === 'ValidationError') {
// //       const errors = {};
// //       for (let field in err.errors) {
// //         errors[field] = err.errors[field].message;
// //       }
// //       return res.status(400).json({ message: 'Student validation failed', errors });
// //     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
// //       return res.status(400).json({ message: 'This CNIC is already registered.' });
// //     }
// //     res.status(500).json({ message: 'Failed to save student: ' + err.message });
// //   }
// // };


// // // --- DELETE STUDENT ---
// // export const deleteStudent = async (req, res) => {
// //   try {
// //     const student = await Student.findById(req.params.id);
// //     if (!student) {
// //       return res.status(404).json({ message: 'Student not found' });
// //     }

// //     // List of all document URLs to potentially delete
// //     const documentUrls = [
// //       student.profilePictureUrl,
// //       student.cnicFrontUrl,
// //       student.cnicBackUrl,
// //       student.bFormUrl,
// //       student.characterCertificateUrl,
// //       student.previousClassResultUrl,
// //       student.class10ResultUrl,
// //       student.class12ResultUrl,
// //     ];

// //     // Delete associated files from the server
// //     documentUrls.forEach(url => {
// //       if (url && url !== '') {
// //         const filePath = path.join(__dirname, '..', url);
// //         fs.unlink(filePath, (err) => {
// //           if (err) console.error(`Error deleting file (${filePath}):`, err);
// //         });
// //       }
// //     });

// //     await student.deleteOne();
// //     res.json({ message: 'Student deleted successfully' });
// //   } catch (err) {
// //     console.error("Error deleting student:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // --- UPDATE STUDENT FEE STATUS ---
// // export const updateStudentFeeStatus = async (req, res) => {
// //   try {
// //     const { feeStatus } = req.body;
// //     if (!feeStatus) {
// //       return res.status(400).json({ message: 'feeStatus is required' });
// //     }
// //     const updatedStudent = await Student.findByIdAndUpdate(
// //       req.params.id,
// //       { feeStatus },
// //       { new: true, runValidators: true }
// //     );
// //     if (!updatedStudent) {
// //       return res.status(404).json({ message: 'Student not found' });
// //     }
// //     res.json(updatedStudent);
// //   } catch (err) {
// //     console.error("Error updating student fee status:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };




// // backend/controllers/studentController.js

// import Student from '../models/Student.js';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Helper to get __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Helper to get relative URL for uploaded files
// const getRelativeUploadUrl = (filePath) => {
//   if (!filePath) return '';
//   const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
//   const relativePath = path.relative(uploadsBaseDir, filePath);
//   return '/uploads/' + relativePath.replace(/\\/g, '/');
// };

// // Helper function to handle file upload logic (for both create and update)
// const handleFileUploadLogic = (files, existingUrlFromReqBody, oldUrlFromDb, fieldName) => {
//   let newUrl = oldUrlFromDb; // Default to existing DB URL

//   if (files && files.length > 0) {
//     // A new file was uploaded for this field
//     if (oldUrlFromDb) {
//       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
//       fs.unlink(oldPath, (err) => {
//         if (err) console.error(`Error deleting old ${fieldName} file (${oldPath}):`, err);
//       });
//     }
//     newUrl = getRelativeUploadUrl(files[0].path);
//   } else if (existingUrlFromReqBody === '') {
//     // The frontend explicitly sent an empty string, meaning the user cleared the file
//     if (oldUrlFromDb) {
//       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
//       fs.unlink(oldPath, (err) => {
//         if (err) console.error(`Error deleting old ${fieldName} file (cleared) (${oldPath}):`, err);
//       });
//     }
//     newUrl = ''; // Set URL to empty string in DB
//   }
//   // If files is empty and existingUrlFromReqBody is undefined (not sent),
//   // then newUrl remains oldUrlFromDb, which is the desired behavior (keep existing file).

//   return newUrl;
// };


// // --- UPDATE STUDENT ---
// export const updateStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, email, admissionDate, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
//       reason,
//       profilePictureUrl: existingProfilePictureUrl,
//       cnicFrontUrl: existingCnicFrontUrl,
//       cnicBackUrl: existingCnicBackUrl,
//       bFormUrl: existingBFormUrl,
//       characterCertificateUrl: existingCharacterCertificateUrl,
//       previousClassResultUrl: existingPreviousClassResultUrl,
//       class10ResultUrl: existingClass10ResultUrl,
//       class12ResultUrl: existingClass12ResultUrl,
//     } = req.body;

//     const currentStudent = await Student.findById(id);
//     if (!currentStudent) {
//       if (req.files) { // Check if req.files exists before iterating
//         Object.values(req.files).flat().forEach(file => {
//           fs.unlink(file.path, (unlinkErr) => {
//             if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
//           });
//         });
//       }
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     const updateFields = {};

//     // --- Basic Info Fields ---
//     if (name !== undefined) updateFields.name = name;
//     if (fatherName !== undefined) updateFields.fatherName = fatherName;
//     if (cnic !== undefined) updateFields.cnic = cnic;
//     if (address !== undefined) updateFields.address = address;
//     if (guardianContact !== undefined) updateFields.guardianContact = guardianContact;
//     if (additionalContact !== undefined) updateFields.additionalContact = additionalContact;
//     if (email !== undefined) updateFields.email = email;
//     if (gender !== undefined) updateFields.gender = gender;

//     // Handle Date fields
//     if (dob !== undefined) {
//       const parsedDob = new Date(dob);
//       if (!isNaN(parsedDob.getTime())) { updateFields.dob = parsedDob; }
//       else if (dob === null || dob === '') { updateFields.dob = null; }
//       else { return res.status(400).json({ message: 'Invalid Date of Birth format.' }); }
//     }
//     if (admissionDate !== undefined) {
//       const parsedAdmissionDate = new Date(admissionDate);
//       if (!isNaN(parsedAdmissionDate.getTime())) { updateFields.admissionDate = parsedAdmissionDate; }
//       else if (admissionDate === null || admissionDate === '') { updateFields.admissionDate = null; }
//       else { return res.status(400).json({ message: 'Invalid Admission Date format.' }); }
//     }

//     // --- Academic & Financial Fields ---
//     if (studentClass !== undefined) updateFields.class = studentClass;
//     if (feePerMonth !== undefined) updateFields.feePerMonth = parseFloat(feePerMonth);
//     if (depositedAmount !== undefined) updateFields.depositedAmount = depositedAmount;
//     if (otherDues !== undefined) updateFields.otherDues = otherDues;

//     // Handle studentStatus and reason
//     if (studentStatus !== undefined) {
//       updateFields.studentStatus = studentStatus;
//       if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
//         return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
//       }
//       if (!(studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && currentStudent.reason) {
//           updateFields.reason = '';
//       } else if (reason !== undefined) {
//           updateFields.reason = reason;
//       }
//     } else if (reason !== undefined) {
//       updateFields.reason = reason;
//     }

//     // Handle class-specific fields
//     if (studentClass !== undefined) {
//       if (studentClass === 'Class') {
//         if (classNumber !== undefined) updateFields.classNumber = classNumber;
//         if (majorSubject !== undefined) updateFields.majorSubject = majorSubject;
//         updateFields.degreeName = undefined;
//         updateFields.semester = undefined;
//       } else if (studentClass === 'BS') {
//         if (degreeName !== undefined) updateFields.degreeName = degreeName;
//         if (semester !== undefined) updateFields.semester = parseInt(semester);
//         updateFields.classNumber = undefined;
//         updateFields.majorSubject = undefined;
//       } else {
//         updateFields.classNumber = undefined;
//         updateFields.majorSubject = undefined;
//         updateFields.degreeName = undefined;
//         updateFields.semester = undefined;
//       }
//     }

//     // --- Document Upload Fields ---
//     // Use optional chaining (?. ) to safely access req.files properties
//     updateFields.profilePictureUrl = handleFileUploadLogic(req.files?.profilePicture, existingProfilePictureUrl, currentStudent.profilePictureUrl, 'profilePicture');
//     updateFields.cnicFrontUrl = handleFileUploadLogic(req.files?.cnicFront, existingCnicFrontUrl, currentStudent.cnicFrontUrl, 'cnicFront');
//     updateFields.cnicBackUrl = handleFileUploadLogic(req.files?.cnicBack, existingCnicBackUrl, currentStudent.cnicBackUrl, 'cnicBack');
//     updateFields.bFormUrl = handleFileUploadLogic(req.files?.bForm, existingBFormUrl, currentStudent.bFormUrl, 'bForm');
//     updateFields.characterCertificateUrl = handleFileUploadLogic(req.files?.characterCertificate, existingCharacterCertificateUrl, currentStudent.characterCertificateUrl, 'characterCertificate');
//     updateFields.previousClassResultUrl = handleFileUploadLogic(req.files?.previousClassResult, existingPreviousClassResultUrl, currentStudent.previousClassResultUrl, 'previousClassResult');
//     updateFields.class10ResultUrl = handleFileUploadLogic(req.files?.class10Result, existingClass10ResultUrl, currentStudent.class10ResultUrl, 'class10Result');
//     updateFields.class12ResultUrl = handleFileUploadLogic(req.files?.class12Result, existingClass12ResultUrl, currentStudent.class12ResultUrl, 'class12Result');


//     const updatedStudent = await Student.findByIdAndUpdate(
//       id,
//       { $set: updateFields },
//       { new: true, runValidators: true, context: 'query' }
//     );

//     if (!updatedStudent) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
//     res.json(updatedStudent);

//   } catch (err) {
//     console.error("Error updating student:", err);
//     if (req.files) {
//       Object.values(req.files).flat().forEach(file => {
//         fs.unlink(file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
//         });
//       });
//     }

//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Student validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This CNIC is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to update student: ' + err.message });
//   }
// };


// // // --- GET ALL STUDENTS ---
// // export const getAllStudents = async (req, res) => {
// //   try {
// //     const {
// //       class: studentClass,
// //       majorSubject,
// //       degreeName,
// //       semester,
// //       searchTerm,
// //       studentStatus,
// //       classNumber
// //     } = req.query;

// //     const filter = {};

// //     if (searchTerm) {
// //       filter.$or = [
// //         { name: { $regex: searchTerm, $options: 'i' } },
// //         { fatherName: { $regex: searchTerm, $options: 'i' } },
// //         { cnic: { $regex: searchTerm, $options: 'i' } },
// //         { address: { $regex: searchTerm, $options: 'i' } },
// //         { guardianContact: { $regex: searchTerm, $options: 'i' } },
// //         { additionalContact: { $regex: searchTerm, $options: 'i' } },
// //         { email: { $regex: searchTerm, $options: 'i' } },
// //       ];
// //     }

// //     if (studentClass) {
// //       filter.class = studentClass;
// //       if (studentClass === 'Class') {
// //         if (classNumber) {
// //           filter.classNumber = classNumber;
// //         }
// //         if (majorSubject && majorSubject !== 'N/A') {
// //           filter.majorSubject = majorSubject;
// //         }
// //       } else if (studentClass === 'BS') {
// //         if (degreeName && degreeName !== 'N/A') {
// //           filter.degreeName = degreeName;
// //         }
// //         if (semester) {
// //           filter.semester = parseInt(semester);
// //         }
// //       }
// //     }

// //     if (studentStatus && studentStatus !== 'All Students') {
// //       filter.studentStatus = studentStatus;
// //     }

// //     const students = await Student.find(filter);
// //     res.json(students);
// //   } catch (err) {
// //     console.error("Error fetching students:", err);
// //     res.status(500).json({ message: 'Failed to retrieve students: ' + err.message });
// //   }
// // };


// // Modified getAllStudents
// export const getAllStudents = async (req, res) => {
//   try {
//     let query = {};
//     if (req.user.role === 'teacher') {
//       // Find the teacher's profile to get their subjects
//       const teacherProfile = await Staff.findById(req.user.profileId);
//       if (!teacherProfile || !teacherProfile.subjectsTaught || teacherProfile.subjectsTaught.length === 0) {
//         return res.status(403).json({ message: 'Teacher has no subjects assigned or profile not found.' });
//       }
//       query.majorSubject = { $in: teacherProfile.subjectsTaught };
//     }

//     const students = await Student.find(query).sort({ admissionDate: -1 });
//     res.json(students);
//   } catch (err) {
//     console.error("Error getting students:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Modified getStudentById
// export const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);

//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Role-based access for viewing individual student details
//     if (req.user.role === 'student' && req.user.profileId.toString() !== student._id.toString()) {
//       return res.status(403).json({ message: 'Not authorized to view this student profile.' });
//     }
//     // Teacher can view any student, but editing is limited by 'editModeEnabled' on frontend
//     // Admin can view any student

//     res.json(student);
//   } catch (err) {
//     console.error("Error getting student by ID:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // // --- GET STUDENT BY ID ---
// // export const getStudentById = async (req, res) => {
// //   try {
// //     const student = await Student.findById(req.params.id);
// //     if (!student) return res.status(404).json({ message: 'Student not found' });
// //     res.json(student);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // --- CREATE STUDENT ---
// export const createStudent = async (req, res) => {
//   try {
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, email, admissionDate, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
//       reason
//     } = req.body;

//     // Initialize URLs from uploaded files (req.files will be an object)
//     // Use optional chaining (?. ) to safely access req.files properties
//     const profilePictureUrl = req.files?.profilePicture ? getRelativeUploadUrl(req.files.profilePicture[0].path) : '';
//     const cnicFrontUrl = req.files?.cnicFront ? getRelativeUploadUrl(req.files.cnicFront[0].path) : '';
//     const cnicBackUrl = req.files?.cnicBack ? getRelativeUploadUrl(req.files.cnicBack[0].path) : '';
//     const bFormUrl = req.files?.bForm ? getRelativeUploadUrl(req.files.bForm[0].path) : '';
//     const characterCertificateUrl = req.files?.characterCertificate ? getRelativeUploadUrl(req.files.characterCertificate[0].path) : '';
//     const previousClassResultUrl = req.files?.previousClassResult ? getRelativeUploadUrl(req.files.previousClassResult[0].path) : '';
//     const class10ResultUrl = req.files?.class10Result ? getRelativeUploadUrl(req.files.class10Result[0].path) : '';
//     const class12ResultUrl = req.files?.class12Result ? getRelativeUploadUrl(req.files.class12Result[0].path) : '';


//     // Conditional validation for 'reason'
//     if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
//       if (req.files) {
//         Object.values(req.files).flat().forEach(file => {
//           fs.unlink(file.path, (unlinkErr) => {
//             if (unlinkErr) console.error('Error deleting uploaded file on validation error:', unlinkErr);
//           });
//         });
//       }
//       return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
//     }

//     const newStudent = new Student({
//       name,
//       fatherName,
//       cnic,
//       address,
//       guardianContact,
//       additionalContact,
//       dob: new Date(dob),
//       gender,
//       admissionDate: new Date(admissionDate),
//       email,
//       profilePictureUrl,
//       class: studentClass,
//       studentStatus,
//       feePerMonth: parseFloat(feePerMonth),
//       reason: (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined,
//       depositedAmount: depositedAmount || 0,
//       otherDues: otherDues || 0,
//       classNumber: studentClass === 'Class' ? classNumber : undefined,
//       majorSubject: studentClass === 'Class' ? majorSubject : undefined,
//       degreeName: studentClass === 'BS' ? degreeName : undefined,
//       semester: studentClass === 'BS' ? parseInt(semester) : undefined,
//       cnicFrontUrl,
//       cnicBackUrl,
//       bFormUrl,
//       characterCertificateUrl,
//       previousClassResultUrl,
//       class10ResultUrl,
//       class12ResultUrl,
//     });

//     const savedStudent = await newStudent.save();
//     res.status(201).json(savedStudent);
//   } catch (err) {
//     console.error("Error creating student:", err);
//     if (req.files) {
//       Object.values(req.files).flat().forEach(file => {
//         fs.unlink(file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
//         });
//       });
//     }
//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Student validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This CNIC is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to save student: ' + err.message });
//   }
// };


// // --- DELETE STUDENT ---
// export const deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     const documentUrls = [
//       student.profilePictureUrl,
//       student.cnicFrontUrl,
//       student.cnicBackUrl,
//       student.bFormUrl,
//       student.characterCertificateUrl,
//       student.previousClassResultUrl,
//       student.class10ResultUrl,
//       student.class12ResultUrl,
//     ];

//     documentUrls.forEach(url => {
//       if (url && url !== '') {
//         const filePath = path.join(__dirname, '..', url);
//         fs.unlink(filePath, (err) => {
//           if (err) console.error(`Error deleting file (${filePath}):`, err);
//         });
//       }
//     });

//     await student.deleteOne();
//     res.json({ message: 'Student deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting student:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- UPDATE STUDENT FEE STATUS ---
// export const updateStudentFeeStatus = async (req, res) => {
//   try {
//     const { feeStatus } = req.body;
//     if (!feeStatus) {
//       return res.status(400).json({ message: 'feeStatus is required' });
//     }
//     const updatedStudent = await Student.findByIdAndUpdate(
//       req.params.id,
//       { feeStatus },
//       { new: true, runValidators: true }
//     );
//     if (!updatedStudent) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
//     res.json(updatedStudent);
//   } catch (err) {
//     console.error("Error updating student fee status:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- PROMOTE STUDENTS ---
// export const promoteStudents = async (req, res) => {
//   try {
//     const { classType, classNumber, semester } = req.body;

//     if (!classType) {
//       return res.status(400).json({ message: 'Class type is required for promotion.' });
//     }

//     let filter = { class: classType };
//     let updateOperation = {};
//     let message = 'Students promoted successfully.';

//     if (classType === 'Class') {
//       if (!classNumber) {
//         return res.status(400).json({ message: 'Class number is required for Class type promotion.' });
//       }
//       filter.classNumber = classNumber;

//       if (classNumber >= 1 && classNumber < 11) {
//         updateOperation = { $inc: { classNumber: 1 } };
//       } else if (classNumber === 11) {
//         message = 'Students in Class 11 cannot be promoted further in this category.';
//       } else {
//         return res.status(400).json({ message: 'Invalid class number for promotion (must be between 1 and 11).' });
//       }
//     } else if (classType === 'BS') {
//       if (!semester) {
//         return res.status(400).json({ message: 'Semester is required for BS type promotion.' });
//       }
//       filter.semester = semester;

//       if (semester >= 1 && semester < 7) {
//         updateOperation = { $inc: { semester: 1 } };
//       } else if (semester === 7) {
//         message = 'Students in Semester 7 cannot be promoted further in this category.';
//       } else {
//         return res.status(400).json({ message: 'Invalid semester for promotion (must be between 1 and 7).' });
//       }
//     } else {
//       return res.status(400).json({ message: 'Invalid class type for promotion.' });
//     }

//     if (Object.keys(updateOperation).length > 0) {
//       const result = await Student.updateMany(filter, updateOperation);
//       if (result.matchedCount === 0) {
//         return res.status(404).json({ message: 'No students found matching the criteria for promotion.' });
//       }
//       res.json({ message: `${result.modifiedCount} students promoted successfully.` });
//     } else {
//       res.status(200).json({ message: message });
//     }

//   } catch (err) {
//     console.error("Error promoting students:", err);
//     res.status(500).json({ message: 'Failed to promote students: ' + err.message });
//   }
// };

// // --- INCREASE FEE ---
// export const increaseFee = async (req, res) => {
//   try {
//     const { classType, classNumber, semester, amount } = req.body;

//     if (!classType || isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ message: 'Class type and a valid positive amount are required.' });
//     }

//     let filter = { class: classType };

//     if (classType === 'Class') {
//       if (!classNumber) {
//         return res.status(400).json({ message: 'Class number is required for Class type fee increase.' });
//       }
//       filter.classNumber = classNumber;
//     } else if (classType === 'BS') {
//       if (!semester) {
//         return res.status(400).json({ message: 'Semester is required for BS type fee increase.' });
//       }
//       filter.semester = semester;
//     } else {
//       return res.status(400).json({ message: 'Invalid class type for fee increase.' });
//     }

//     const result = await Student.updateMany(
//       filter,
//       { $inc: { feePerMonth: amount } }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: 'No students found matching the criteria for fee increase.' });
//     }

//     res.json({ message: `Fee increased for ${result.modifiedCount} students successfully.` });

//   } catch (err) {
//     console.error("Error increasing fee:", err);
//     res.status(500).json({ message: 'Failed to increase fee: ' + err.message });
//   }
// };



// backend/controllers/studentController.js

import Student from '../models/Student.js';
import Staff from '../models/Staff.js'; // Import Staff model to get teacher's subjects
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInternalUser } from './userController.js';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get relative URL for uploaded files
const getRelativeUploadUrl = (filePath) => {
  if (!filePath) return '';
  const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
  const relativePath = path.relative(uploadsBaseDir, filePath);
  return '/uploads/' + relativePath.replace(/\\/g, '/');
};

// Helper function to handle file upload logic (for both create and update)
const handleFileUploadLogic = (files, existingUrlFromReqBody, oldUrlFromDb, fieldName) => {
  let newUrl = oldUrlFromDb;

  if (files && files.length > 0) {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error(`Error deleting old ${fieldName} file (${oldPath}):`, err);
      });
    }
    newUrl = getRelativeUploadUrl(files[0].path);
  } else if (existingUrlFromReqBody === '') {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error(`Error deleting old ${fieldName} file (cleared) (${oldPath}):`, err);
      });
    }
    newUrl = '';
  }
  return newUrl;
};


// --- UPDATE STUDENT ---
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, fatherName, cnic, address, guardianContact, additionalContact,
      dob, gender, email, admissionDate, class: studentClass, classNumber,
      majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
      reason,
      profilePictureUrl: existingProfilePictureUrl,
      cnicFrontUrl: existingCnicFrontUrl,
      cnicBackUrl: existingCnicBackUrl,
      bFormUrl: existingBFormUrl,
      characterCertificateUrl: existingCharacterCertificateUrl,
      previousClassResultUrl: existingPreviousClassResultUrl,
      class10ResultUrl: existingClass10ResultUrl,
      class12ResultUrl: existingClass12ResultUrl,
    } = req.body;

    const currentStudent = await Student.findById(id);
    if (!currentStudent) {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent student:', unlinkErr);
          });
        });
      }
      return res.status(404).json({ message: 'Student not found' });
    }

    const updateFields = {};

    // --- Basic Info Fields ---
    if (name !== undefined) updateFields.name = name;
    if (fatherName !== undefined) updateFields.fatherName = fatherName;
    if (cnic !== undefined) updateFields.cnic = cnic;
    if (address !== undefined) updateFields.address = address;
    if (guardianContact !== undefined) updateFields.guardianContact = guardianContact;
    if (additionalContact !== undefined) updateFields.additionalContact = additionalContact;
    if (email !== undefined) updateFields.email = email;
    if (gender !== undefined) updateFields.gender = gender;

    // Handle Date fields
    if (dob !== undefined) {
      const parsedDob = new Date(dob);
      if (!isNaN(parsedDob.getTime())) { updateFields.dob = parsedDob; }
      else if (dob === null || dob === '') { updateFields.dob = null; }
      else { return res.status(400).json({ message: 'Invalid Date of Birth format.' }); }
    }
    if (admissionDate !== undefined) {
      const parsedAdmissionDate = new Date(admissionDate);
      if (!isNaN(parsedAdmissionDate.getTime())) { updateFields.admissionDate = parsedAdmissionDate; }
      else if (admissionDate === null || admissionDate === '') { updateFields.admissionDate = null; }
      else { return res.status(400).json({ message: 'Invalid Admission Date format.' }); }
    }

    // --- Academic & Financial Fields ---
    if (studentClass !== undefined) updateFields.class = studentClass;
    if (feePerMonth !== undefined) updateFields.feePerMonth = parseFloat(feePerMonth);
    if (depositedAmount !== undefined) updateFields.depositedAmount = depositedAmount;
    if (otherDues !== undefined) updateFields.otherDues = otherDues;

    // Handle studentStatus and reason
    if (studentStatus !== undefined) {
      updateFields.studentStatus = studentStatus;
      if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
        return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
      }
      if (!(studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && currentStudent.reason) {
          updateFields.reason = '';
      } else if (reason !== undefined) {
          updateFields.reason = reason;
      }
    } else if (reason !== undefined) {
      updateFields.reason = reason;
    }

    // Handle class-specific fields
    if (studentClass !== undefined) {
      if (studentClass === 'Class') {
        if (classNumber !== undefined) updateFields.classNumber = classNumber;
        if (majorSubject !== undefined) updateFields.majorSubject = majorSubject;
        updateFields.degreeName = undefined;
        updateFields.semester = undefined;
      } else if (studentClass === 'BS') {
        if (degreeName !== undefined) updateFields.degreeName = degreeName;
        if (semester !== undefined) updateFields.semester = parseInt(semester);
        updateFields.classNumber = undefined;
        updateFields.majorSubject = undefined;
      } else {
        updateFields.classNumber = undefined;
        updateFields.majorSubject = undefined;
        updateFields.degreeName = undefined;
        updateFields.semester = undefined;
      }
    }

    // --- Document Upload Fields ---
    updateFields.profilePictureUrl = handleFileUploadLogic(req.files?.profilePicture, existingProfilePictureUrl, currentStudent.profilePictureUrl, 'profilePicture');
    updateFields.cnicFrontUrl = handleFileUploadLogic(req.files?.cnicFront, existingCnicFrontUrl, currentStudent.cnicFrontUrl, 'cnicFront');
    updateFields.cnicBackUrl = handleFileUploadLogic(req.files?.cnicBack, existingCnicBackUrl, currentStudent.cnicBackUrl, 'cnicBack');
    updateFields.bFormUrl = handleFileUploadLogic(req.files?.bForm, existingBFormUrl, currentStudent.bFormUrl, 'bForm');
    updateFields.characterCertificateUrl = handleFileUploadLogic(req.files?.characterCertificate, existingCharacterCertificateUrl, currentStudent.characterCertificateUrl, 'characterCertificate');
    updateFields.previousClassResultUrl = handleFileUploadLogic(req.files?.previousClassResult, existingPreviousClassResultUrl, currentStudent.previousClassResultUrl, 'previousClassResult');
    updateFields.class10ResultUrl = handleFileUploadLogic(req.files?.class10Result, existingClass10ResultUrl, currentStudent.class10ResultUrl, 'class10Result');
    updateFields.class12ResultUrl = handleFileUploadLogic(req.files?.class12Result, existingClass12ResultUrl, currentStudent.class12ResultUrl, 'class12Result');


    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(updatedStudent);

  } catch (err) {
    console.error("Error updating student:", err);
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file on update error:', unlinkErr);
        });
      });
    }

    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Student validation failed', errors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
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

    // Apply teacher-specific filtering if the user is a teacher
    // if (req.user.role === 'teacher') {
    //   const teacherProfile = await Staff.findById(req.user.profileId);
    //   if (!teacherProfile || !teacherProfile.subjectsTaught || teacherProfile.subjectsTaught.length === 0) {
    //     // If teacher has no subjects, they see no students
    //     return res.json([]);
    //   }
    //   // Filter students by subjects the teacher teaches
    //   filter.majorSubject = { $in: teacherProfile.subjectsTaught };
    // }


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

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // A student can only view their own profile
    if (req.user.role === 'student' && req.user.profileId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this student profile.' });
    }
    // Teachers can view any student (filtered by subject in getAllStudents)
    // Admin can view any student

    res.json(student);
  } catch (err) {
    console.error("Error getting student by ID:", err);
    res.status(500).json({ message: err.message });
  }
};

// // --- CREATE STUDENT ---
// export const createStudent = async (req, res) => {
//   try {
//     const {
//       name, fatherName, cnic, address, guardianContact, additionalContact,
//       dob, gender, email, admissionDate, class: studentClass, classNumber,
//       majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
//       reason
//     } = req.body;

//     const profilePictureUrl = req.files?.profilePicture ? getRelativeUploadUrl(req.files.profilePicture[0].path) : '';
//     const cnicFrontUrl = req.files?.cnicFront ? getRelativeUploadUrl(req.files.cnicFront[0].path) : '';
//     const cnicBackUrl = req.files?.cnicBack ? getRelativeUploadUrl(req.files.cnicBack[0].path) : '';
//     const bFormUrl = req.files?.bForm ? getRelativeUploadUrl(req.files.bForm[0].path) : '';
//     const characterCertificateUrl = req.files?.characterCertificate ? getRelativeUploadUrl(req.files.characterCertificate[0].path) : '';
//     const previousClassResultUrl = req.files?.previousClassResult ? getRelativeUploadUrl(req.files.previousClassResult[0].path) : '';
//     const class10ResultUrl = req.files?.class10Result ? getRelativeUploadUrl(req.files.class10Result[0].path) : '';
//     const class12ResultUrl = req.files?.class12Result ? getRelativeUploadUrl(req.files.class12Result[0].path) : '';


//     if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
//       if (req.files) {
//         Object.values(req.files).flat().forEach(file => {
//           fs.unlink(file.path, (unlinkErr) => {
//             if (unlinkErr) console.error('Error deleting uploaded file on validation error:', unlinkErr);
//           });
//         });
//       }
//       return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
//     }

//     const newStudent = new Student({
//       name,
//       fatherName,
//       cnic,
//       address,
//       guardianContact,
//       additionalContact,
//       dob: new Date(dob),
//       gender,
//       admissionDate: new Date(admissionDate),
//       email,
//       profilePictureUrl,
//       class: studentClass,
//       studentStatus,
//       feePerMonth: parseFloat(feePerMonth),
//       reason: (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined,
//       depositedAmount: depositedAmount || 0,
//       otherDues: otherDues || 0,
//       classNumber: studentClass === 'Class' ? classNumber : undefined,
//       majorSubject: studentClass === 'Class' ? majorSubject : undefined,
//       degreeName: studentClass === 'BS' ? degreeName : undefined,
//       semester: studentClass === 'BS' ? parseInt(semester) : undefined,
//       cnicFrontUrl,
//       cnicBackUrl,
//       bFormUrl,
//       characterCertificateUrl,
//       previousClassResultUrl,
//       class10ResultUrl,
//       class12ResultUrl,
//     });

//     const savedStudent = await newStudent.save();
//     res.status(201).json(savedStudent);
//   } catch (err) {
//     console.error("Error creating student:", err);
//     if (req.files) {
//       Object.values(req.files).flat().forEach(file => {
//         fs.unlink(file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
//         });
//       });
//     }
//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Student validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This CNIC is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to save student: ' + err.message });
//   }
// };





// --- CREATE STUDENT ---
export const createStudent = async (req, res) => {
  try {
    const {
      name, fatherName, cnic, address, guardianContact, additionalContact,
      dob, gender, email, admissionDate, class: studentClass, classNumber,
      majorSubject, degreeName, semester, feePerMonth, studentStatus, depositedAmount, otherDues,
      reason
    } = req.body;

    const profilePictureUrl = req.files?.profilePicture ? getRelativeUploadUrl(req.files.profilePicture[0].path) : '';
    const cnicFrontUrl = req.files?.cnicFront ? getRelativeUploadUrl(req.files.cnicFront[0].path) : '';
    const cnicBackUrl = req.files?.cnicBack ? getRelativeUploadUrl(req.files.cnicBack[0].path) : '';
    const bFormUrl = req.files?.bForm ? getRelativeUploadUrl(req.files.bForm[0].path) : '';
    const characterCertificateUrl = req.files?.characterCertificate ? getRelativeUploadUrl(req.files.characterCertificate[0].path) : '';
    const previousClassResultUrl = req.files?.previousClassResult ? getRelativeUploadUrl(req.files.previousClassResult[0].path) : '';
    const class10ResultUrl = req.files?.class10Result ? getRelativeUploadUrl(req.files.class10Result[0].path) : '';
    const class12ResultUrl = req.files?.class12Result ? getRelativeUploadUrl(req.files.class12Result[0].path) : '';


    if ((studentStatus === 'Expelled' || studentStatus === 'Withdrawn') && !reason) {
      // If files were uploaded, delete them before sending error response
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting uploaded file on validation error:', unlinkErr);
          });
        });
      }
      return res.status(400).json({ message: 'Reason is required for Expelled or Withdrawn status.' });
    }

    // 1. Create the Student record first
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
      reason: (studentStatus === 'Expelled' || studentStatus === 'Withdrawn') ? reason : undefined,
      depositedAmount: depositedAmount || 0,
      otherDues: otherDues || 0,
      classNumber: studentClass === 'Class' ? classNumber : undefined,
      majorSubject: studentClass === 'Class' ? majorSubject : undefined,
      degreeName: studentClass === 'BS' ? degreeName : undefined,
      semester: studentClass === 'BS' ? parseInt(semester) : undefined,
      cnicFrontUrl,
      cnicBackUrl,
      bFormUrl,
      characterCertificateUrl,
      previousClassResultUrl,
      class10ResultUrl,
      class12ResultUrl,
    });

    const savedStudent = await newStudent.save();

    // 2. Automatically create a User account for the student
    const defaultPassword = `1234567`; // Define default password
    try {
      await createInternalUser({
        cnic: savedStudent.cnic, // Use the CNIC from the saved student
        password: defaultPassword,
        role: 'student', // Set the role
        profileId: savedStudent._id, // Link to the created student document
        roleMapping: 'Student' // To differentiate from staff users
      });
      console.log(`User account created automatically for student: ${savedStudent.name}`);
    } catch (userError) {
      console.error("Error creating user for student (but student saved):", userError.message);
      // IMPORTANT: Decide on rollback strategy here.
      // If user creation is critical, you might want to delete the student record:
      // await savedStudent.deleteOne();
      // return res.status(500).json({ message: 'Student created but failed to create user account: ' + userError.message });
      // Otherwise, just log and proceed.
    }

    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Error creating student:", err);
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting uploaded file after failed student creation:', unlinkErr);
        });
      });
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Student validation failed', errors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
      return res.status(400).json({ message: 'This CNIC is already registered.' });
    }
    res.status(500).json({ message: 'Failed to save student: ' + err.message });
  }
};



// --- DELETE STUDENT ---
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const documentUrls = [
      student.profilePictureUrl,
      student.cnicFrontUrl,
      student.cnicBackUrl,
      student.bFormUrl,
      student.characterCertificateUrl,
      student.previousClassResultUrl,
      student.class10ResultUrl,
      student.class12ResultUrl,
    ];

    documentUrls.forEach(url => {
      if (url && url !== '') {
        const filePath = path.join(__dirname, '..', url);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file (${filePath}):`, err);
        });
      }
    });

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

// --- PROMOTE STUDENTS ---
export const promoteStudents = async (req, res) => {
  try {
    const { classType, classNumber, semester } = req.body;

    if (!classType) {
      return res.status(400).json({ message: 'Class type is required for promotion.' });
    }

    let filter = { class: classType };
    let updateOperation = {};
    let message = 'Students promoted successfully.';

    if (classType === 'Class') {
      if (!classNumber) {
        return res.status(400).json({ message: 'Class number is required for Class type promotion.' });
      }
      filter.classNumber = classNumber;

      if (classNumber >= 1 && classNumber < 11) {
        updateOperation = { $inc: { classNumber: 1 } };
      } else if (classNumber === 11) {
        message = 'Students in Class 11 cannot be promoted further in this category.';
      } else {
        return res.status(400).json({ message: 'Invalid class number for promotion (must be between 1 and 11).' });
      }
    } else if (classType === 'BS') {
      if (!semester) {
        return res.status(400).json({ message: 'Semester is required for BS type promotion.' });
      }
      filter.semester = semester;

      if (semester >= 1 && semester < 7) {
        updateOperation = { $inc: { semester: 1 } };
      } else if (semester === 7) {
        message = 'Students in Semester 7 cannot be promoted further in this category.';
      } else {
        return res.status(400).json({ message: 'Invalid semester for promotion (must be between 1 and 7).' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid class type for promotion.' });
    }

    if (Object.keys(updateOperation).length > 0) {
      const result = await Student.updateMany(filter, updateOperation);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'No students found matching the criteria for promotion.' });
      }
      res.json({ message: `${result.modifiedCount} students promoted successfully.` });
    } else {
      res.status(200).json({ message: message });
    }

  } catch (err) {
    console.error("Error promoting students:", err);
    res.status(500).json({ message: 'Failed to promote students: ' + err.message });
  }
};

// --- INCREASE FEE ---
export const increaseFee = async (req, res) => {
  try {
    const { classType, classNumber, semester, amount } = req.body;

    if (!classType || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Class type and a valid positive amount are required.' });
    }

    let filter = { class: classType };

    if (classType === 'Class') {
      if (!classNumber) {
        return res.status(400).json({ message: 'Class number is required for Class type fee increase.' });
      }
      filter.classNumber = classNumber;
    } else if (classType === 'BS') {
      if (!semester) {
        return res.status(400).json({ message: 'Semester is required for BS type fee increase.' });
      }
      filter.semester = semester;
    } else {
      return res.status(400).json({ message: 'Invalid class type for fee increase.' });
    }

    const result = await Student.updateMany(
      filter,
      { $inc: { feePerMonth: amount } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No students found matching the criteria for fee increase.' });
    }

    res.json({ message: `Fee increased for ${result.modifiedCount} students successfully.` });

  } catch (err) {
    console.error("Error increasing fee:", err);
    res.status(500).json({ message: 'Failed to increase fee: ' + err.message });
  }
};
