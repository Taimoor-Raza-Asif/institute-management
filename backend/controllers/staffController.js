// // backend/controllers/staffController.js
// import Staff from '../models/Staff.js';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import QRCode from 'qrcode'; // For QR code generation

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

// // Helper function to handle profile picture upload logic
// const handleProfilePictureUpload = (file, existingUrlFromReqBody, oldUrlFromDb) => {
//   let newUrl = oldUrlFromDb;

//   if (file) {
//     if (oldUrlFromDb) {
//       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
//       fs.unlink(oldPath, (err) => {
//         if (err) console.error('Error deleting old profile picture:', err);
//       });
//     }
//     newUrl = getRelativeUploadUrl(file.path);
//   } else if (existingUrlFromReqBody === '') {
//     if (oldUrlFromDb) {
//       const oldPath = path.join(__dirname, '..', oldUrlFromDb);
//       fs.unlink(oldPath, (err) => {
//         if (err) console.error('Error deleting old profile picture (cleared):', err);
//       });
//     }
//     newUrl = '';
//   }
//   return newUrl;
// };

// // --- CREATE STAFF ---
// export const createStaff = async (req, res) => {
//   try {
//     const {
//       name, staffType, contactNumber, email, address, dateOfJoining, salary,
//       highestEducationLevel, degrees, subjectsTaught, emergencyContact, bankAccountDetails
//     } = req.body;

//     let profilePictureUrl = '';
//     if (req.file) {
//       profilePictureUrl = getRelativeUploadUrl(req.file.path);
//     }

//     // Generate a unique QR code secret for attendance
//     const qrCodeSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

//     const newStaff = new Staff({
//       name,
//       staffType,
//       contactNumber,
//       email,
//       address,
//       dateOfJoining: new Date(dateOfJoining),
//       salary: parseFloat(salary),
//       profilePictureUrl,
//       highestEducationLevel,
//       degrees: degrees ? JSON.parse(degrees) : [], // Parse degrees array from string
//       subjectsTaught: subjectsTaught ? JSON.parse(subjectsTaught) : [], // Parse subjectsTaught from string
//       qrCodeSecret,
//       emergencyContact,
//       bankAccountDetails: bankAccountDetails ? JSON.parse(bankAccountDetails) : {},
//     });

//     const savedStaff = await newStaff.save();

//     // Optionally generate QR code image and send back its URL or data
//     const qrCodeDataUrl = await QRCode.toDataURL(qrCodeSecret); // This can be sent back or saved

//     res.status(201).json({ staff: savedStaff, qrCodeDataUrl });
//   } catch (err) {
//     console.error("Error creating staff:", err);
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting uploaded file after failed staff creation:', unlinkErr);
//       });
//     }
//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Staff validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
//       return res.status(400).json({ message: 'This email is already registered.' });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This Employee ID is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to save staff: ' + err.message });
//   }
// };

// // --- GET ALL STAFF ---
// export const getAllStaff = async (req, res) => {
//   try {
//     const { searchTerm, staffType, highestEducationLevel, subject } = req.query;

//     const filter = {};

//     if (searchTerm) {
//       filter.$or = [
//         { name: { $regex: searchTerm, $options: 'i' } },
//         { email: { $regex: searchTerm, $options: 'i' } },
//         { contactNumber: { $regex: searchTerm, $options: 'i' } },
//         { cnic: { $regex: searchTerm, $options: 'i' } },
//       ];
//     }
//     if (staffType) {
//       filter.staffType = staffType;
//     }
//     if (highestEducationLevel) {
//       filter.highestEducationLevel = highestEducationLevel;
//     }
//     if (subject) {
//       filter.subjectsTaught = { $in: [new RegExp(subject, 'i')] }; // Case-insensitive search in array
//     }

//     const staff = await Staff.find(filter);
//     res.json(staff);
//   } catch (err) {
//     console.error("Error fetching staff:", err);
//     res.status(500).json({ message: 'Failed to retrieve staff: ' + err.message });
//   }
// };

// // --- GET STAFF BY ID ---
// export const getStaffById = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id);
//     if (!staff) return res.status(404).json({ message: 'Staff not found' });
//     res.json(staff);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- UPDATE STAFF ---
// export const updateStaff = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name, staffType, contactNumber, email, address, dateOfJoining, salary,
//       highestEducationLevel, degrees, subjectsTaught, emergencyContact, bankAccountDetails,
//       profilePictureUrl: existingProfilePictureUrl // For handling profile picture updates
//     } = req.body;

//     const currentStaff = await Staff.findById(id);
//     if (!currentStaff) {
//       if (req.file) { // Clean up newly uploaded file if staff not found
//         fs.unlink(req.file.path, (unlinkErr) => {
//           if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent staff:', unlinkErr);
//         });
//       }
//       return res.status(404).json({ message: 'Staff not found' });
//     }

//     const updateFields = {};

//     if (name !== undefined) updateFields.name = name;
//     if (staffType !== undefined) updateFields.staffType = staffType;
//     if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;
//     if (email !== undefined) updateFields.email = email;
//     if (address !== undefined) updateFields.address = address;
//     if (dateOfJoining !== undefined) updateFields.dateOfJoining = new Date(dateOfJoining);
//     if (salary !== undefined) updateFields.salary = parseFloat(salary);
//     if (highestEducationLevel !== undefined) updateFields.highestEducationLevel = highestEducationLevel;
//     if (degrees !== undefined) updateFields.degrees = JSON.parse(degrees);
//     if (subjectsTaught !== undefined) updateFields.subjectsTaught = JSON.parse(subjectsTaught);
//     if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
//     if (bankAccountDetails !== undefined) updateFields.bankAccountDetails = JSON.parse(bankAccountDetails);

//     // Handle profile picture
//     updateFields.profilePictureUrl = handleProfilePictureUpload(req.file, existingProfilePictureUrl, currentStaff.profilePictureUrl);

//     const updatedStaff = await Staff.findByIdAndUpdate(
//       id,
//       { $set: updateFields },
//       { new: true, runValidators: true, context: 'query' }
//     );

//     if (!updatedStaff) {
//       return res.status(404).json({ message: 'Staff not found' });
//     }
//     res.json(updatedStaff);
//   } catch (err) {
//     console.error("Error updating staff:", err);
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting uploaded file on update error:', unlinkErr);
//       });
//     }
//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Staff validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
//       return res.status(400).json({ message: 'This email is already registered.' });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This Employee ID is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to update staff: ' + err.message });
//   }
// };

// // --- DELETE STAFF ---
// export const deleteStaff = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id);
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found' });
//     }

//     // Delete profile picture if it exists
//     if (staff.profilePictureUrl && staff.profilePictureUrl !== '') {
//       const filePath = path.join(__dirname, '..', staff.profilePictureUrl);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting staff profile picture file:', err);
//       });
//     }

//     await staff.deleteOne();
//     res.json({ message: 'Staff deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting staff:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --- RECORD ATTENDANCE (QR Code based or Manual) ---
// // This endpoint will be called by a client-side QR scanner or a manual attendance form.
// export const recordAttendance = async (req, res) => {
//   try {
//     const { qrCodeSecret, cnic, status, checkInTime, checkOutTime, date, note } = req.body;

//     let staff;
//     if (qrCodeSecret) {
//       staff = await Staff.findOne({ qrCodeSecret });
//     } else if (cnic) {
//       staff = await Staff.findOne({ cnic });
//     } else {
//       return res.status(400).json({ message: 'QR Code secret or Employee ID is required for attendance.' });
//     }

//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found.' });
//     }

//     const attendanceDate = date ? new Date(date) : new Date();
//     attendanceDate.setHours(0, 0, 0, 0); // Normalize date to start of day

//     // Check if attendance record for today already exists
//     const existingAttendanceIndex = staff.attendanceRecords.findIndex(record =>
//       new Date(record.date).toDateString() === attendanceDate.toDateString()
//     );

//     if (existingAttendanceIndex > -1) {
//       // Update existing record
//       const existingRecord = staff.attendanceRecords[existingAttendanceIndex];
//       existingRecord.status = status || existingRecord.status;
//       existingRecord.checkInTime = checkInTime || existingRecord.checkInTime;
//       existingRecord.checkOutTime = checkOutTime || existingRecord.checkOutTime;
//       existingRecord.note = note || existingRecord.note;
//     } else {
//       // Create new record
//       staff.attendanceRecords.push({
//         date: attendanceDate,
//         status: status || 'Present', // Default to Present if not specified
//         checkInTime: checkInTime || (status === 'Present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''),
//         checkOutTime: checkOutTime || '',
//         note: note || '',
//       });
//     }

//     await staff.save();
//     res.json({ message: 'Attendance recorded successfully.', attendance: staff.attendanceRecords[existingAttendanceIndex > -1 ? existingAttendanceIndex : staff.attendanceRecords.length - 1] });
//   } catch (err) {
//     console.error("Error recording attendance:", err);
//     res.status(500).json({ message: 'Failed to record attendance: ' + err.message });
//   }
// };

// // --- GET STAFF ATTENDANCE ---
// export const getStaffAttendance = async (req, res) => {
//   try {
//     const { id } = req.params; // staff ID
//     const { month, year } = req.query; // Optional filters

//     const staff = await Staff.findById(id);
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found.' });
//     }

//     let filteredAttendance = staff.attendanceRecords;

//     if (month && year) {
//       const targetMonth = parseInt(month); // 0-indexed month
//       const targetYear = parseInt(year);
//       filteredAttendance = filteredAttendance.filter(record => {
//         const recordDate = new Date(record.date);
//         return recordDate.getMonth() === targetMonth && recordDate.getFullYear() === targetYear;
//       });
//     }

//     res.json(filteredAttendance);
//   } catch (err) {
//     console.error("Error fetching staff attendance:", err);
//     res.status(500).json({ message: 'Failed to retrieve attendance: ' + err.message });
//   }
// };

// // --- REQUEST LEAVE ---
// export const requestLeave = async (req, res) => {
//   try {
//     const { id } = req.params; // Staff ID requesting leave
//     const { type, startDate, endDate, reason } = req.body;

//     const staff = await Staff.findById(id);
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found.' });
//     }

//     if (!type || !startDate || !endDate || !reason) {
//       return res.status(400).json({ message: 'Leave type, start date, end date, and reason are required.' });
//     }

//     staff.leaveRequests.push({
//       type,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       reason,
//       status: 'Pending', // Default status
//       requestedAt: new Date(),
//     });

//     await staff.save();
//     res.status(201).json({ message: 'Leave request submitted successfully.', request: staff.leaveRequests[staff.leaveRequests.length - 1] });
//   } catch (err) {
//     console.error("Error submitting leave request:", err);
//     res.status(500).json({ message: 'Failed to submit leave request: ' + err.message });
//   }
// };

// // --- UPDATE LEAVE STATUS (Admin action) ---
// export const updateLeaveStatus = async (req, res) => {
//   try {
//     const { staffId, requestId } = req.params;
//     const { status, approvedRejectedBy } = req.body; // status: Approved/Rejected

//     if (!status || !['Approved', 'Rejected'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status provided. Must be Approved or Rejected.' });
//     }

//     const staff = await Staff.findById(staffId);
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found.' });
//     }

//     const leaveRequest = staff.leaveRequests.id(requestId); // Mongoose subdocument .id() method
//     if (!leaveRequest) {
//       return res.status(404).json({ message: 'Leave request not found.' });
//     }

//     leaveRequest.status = status;
//     leaveRequest.approvedRejectedAt = new Date();
//     leaveRequest.approvedRejectedBy = approvedRejectedBy || 'Admin'; // Track who approved/rejected

//     await staff.save();
//     res.json({ message: `Leave request ${status.toLowerCase()} successfully.`, request: leaveRequest });
//   } catch (err) {
//     console.error("Error updating leave status:", err);
//     res.status(500).json({ message: 'Failed to update leave status: ' + err.message });
//   }
// };

// // --- GET ALL LEAVE REQUESTS (for Admin view) ---
// export const getAllLeaveRequests = async (req, res) => {
//   try {
//     // This will fetch all staff and then aggregate their leave requests
//     const allStaff = await Staff.find({}, 'name cnic staffType leaveRequests'); // Only fetch relevant fields

//     let allRequests = [];
//     allStaff.forEach(staff => {
//       staff.leaveRequests.forEach(request => {
//         allRequests.push({
//           staffId: staff._id,
//           staffName: staff.name,
//           cnic: staff.cnic,
//           staffType: staff.staffType,
//           requestId: request._id,
//           type: request.type,
//           startDate: request.startDate,
//           endDate: request.endDate,
//           reason: request.reason,
//           status: request.status,
//           requestedAt: request.requestedAt,
//           approvedRejectedAt: request.approvedRejectedAt,
//           approvedRejectedBy: request.approvedRejectedBy,
//         });
//       });
//     });

//     // Optional: add filtering/sorting here if needed for admin view
//     // Example: filter by status
//     if (req.query.status) {
//       allRequests = allRequests.filter(req => req.status === req.query.status);
//     }

//     res.json(allRequests);
//   } catch (err) {
//     console.error("Error fetching all leave requests:", err);
//     res.status(500).json({ message: 'Failed to retrieve leave requests: ' + err.message });
//   }
// };



// backend/controllers/staffController.js
import Staff from '../models/Staff.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { createInternalUser } from './userController.js';
import asyncHandler from 'express-async-handler';

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

// Helper function to handle profile picture upload logic
const handleProfilePictureUpload = (file, existingUrlFromReqBody, oldUrlFromDb) => {
  let newUrl = oldUrlFromDb;

  if (file) {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Error deleting old profile picture:', err);
      });
    }
    newUrl = getRelativeUploadUrl(file.path);
  } else if (existingUrlFromReqBody === '') {
    if (oldUrlFromDb) {
      const oldPath = path.join(__dirname, '..', oldUrlFromDb);
      fs.unlink(oldPath, (err) => {
        if (err) console.error('Error deleting old profile picture (cleared):', err);
      });
    }
    newUrl = '';
  }
  return newUrl;
};

// // --- CREATE STAFF ---
// export const createStaff = async (req, res) => {
//   try {
//     const {
//       name, staffType, contactNumber, email, address, dateOfJoining, salary,
//       highestEducationLevel, degrees, subjectsTaught, emergencyContact, bankAccountDetails, cnic
//     } = req.body;

//     let profilePictureUrl = '';
//     if (req.file) {
//       profilePictureUrl = getRelativeUploadUrl(req.file.path);
//     }

//     const qrCodeSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

//     const newStaff = new Staff({
//       name,
//       staffType,
//       cnic, // Include cnic
//       contactNumber,
//       email,
//       address,
//       dateOfJoining: new Date(dateOfJoining),
//       salary: parseFloat(salary),
//       profilePictureUrl,
//       highestEducationLevel,
//       degrees: degrees ? JSON.parse(degrees) : [],
//       subjectsTaught: subjectsTaught ? JSON.parse(subjectsTaught) : [],
//       qrCodeSecret,
//       emergencyContact,
//       bankAccountDetails: bankAccountDetails ? JSON.parse(bankAccountDetails) : {},
//     });

//     const savedStaff = await newStaff.save();

//     const qrCodeDataUrl = await QRCode.toDataURL(qrCodeSecret);

//     res.status(201).json({ staff: savedStaff, qrCodeDataUrl });
//   } catch (err) {
//     console.error("Error creating staff:", err);
//     if (req.file) {
//       fs.unlink(req.file.path, (unlinkErr) => {
//         if (unlinkErr) console.error('Error deleting uploaded file after failed staff creation:', unlinkErr);
//       });
//     }
//     if (err.name === 'ValidationError') {
//       const errors = {};
//       for (let field in err.errors) {
//         errors[field] = err.errors[field].message;
//       }
//       return res.status(400).json({ message: 'Staff validation failed', errors });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
//       return res.status(400).json({ message: 'This email is already registered.' });
//     } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
//       return res.status(400).json({ message: 'This Employee ID is already registered.' });
//     }
//     res.status(500).json({ message: 'Failed to save staff: ' + err.message });
//   }
// };





// --- CREATE STAFF ---
export const createStaff = async (req, res) => {
  try {
    const {
      name, fatherName, staffType, contactNumber, email, address, dateOfJoining, salary,
      highestEducationLevel, degrees, subjectsTaught, emergencyContact, bankAccountDetails, cnic, assignClasses
    } = req.body;

    let profilePictureUrl = '';
    if (req.file) {
      profilePictureUrl = getRelativeUploadUrl(req.file.path);
    }

    const qrCodeSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 1. Create the Staff record first
    const newStaff = new Staff({
      name,
      fatherName,
      staffType,
      cnic, // Include cnic
      contactNumber,
      email,
      address,
      dateOfJoining: new Date(dateOfJoining),
      salary: parseFloat(salary),
      profilePictureUrl,
      highestEducationLevel,
      degrees: degrees ? JSON.parse(degrees) : [],
      subjectsTaught: subjectsTaught ? JSON.parse(subjectsTaught) : [],
      qrCodeSecret,
      emergencyContact,
      bankAccountDetails: bankAccountDetails ? JSON.parse(bankAccountDetails) : {},
      assignClasses: assignClasses ? JSON.parse(assignClasses) : [],
    });

    const savedStaff = await newStaff.save();

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeSecret);

    // 2. Automatically create a User account for the staff member
    // Ensure staffType is valid for role (e.g., 'Teacher' -> 'teacher')
    const userRole = savedStaff.staffType.toLowerCase(); // Convert to lowercase for role enum
    const defaultPassword = `1234567`;

    try {
      await createInternalUser({
        cnic: savedStaff.cnic, // Use the CNIC from the saved staff
        password: defaultPassword,
        role: userRole, // Use the staffType as the role (lowercase)
        profileId: savedStaff._id, // Link to the created staff document
        roleMapping: 'Staff' // To differentiate from student users
      });
      console.log(`User account created automatically for staff member: ${savedStaff.name} (${savedStaff.staffType})`);
    } catch (userError) {
      console.error("Error creating user for staff (but staff saved):", userError.message);
      // IMPORTANT: Decide on rollback strategy here.
      // If user creation is critical, you might want to delete the staff record:
      // await savedStaff.deleteOne();
      // return res.status(500).json({ message: 'Staff created but failed to create user account: ' + userError.message });
      // Otherwise, just log and proceed.
    }

    res.status(201).json({ staff: savedStaff, qrCodeDataUrl });
  } catch (err) {
    console.error("Error creating staff:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file after failed staff creation:', unlinkErr);
      });
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Staff validation failed', errors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'This email is already registered.' });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
      return res.status(400).json({ message: 'This CNIC is already registered.' }); // Assuming cnic is unique for staff
    }
    res.status(500).json({ message: 'Failed to save staff: ' + err.message });
  }
};



// --- GET ALL STAFF ---
export const getAllStaff = async (req, res) => {
  try {
    const { searchTerm, staffType, highestEducationLevel, subject } = req.query;

    const filter = {};

    // Role-based filtering for non-admin users
    if (req.user.role !== 'admin') {
      // Non-admin staff (teacher, cook, cleaner, accountant) can only see their own profile
      // This route is primarily for admin to see all staff.
      // For individual staff to see their own data, use getStaffById or a dedicated /my-data route.
      // If a teacher needs to see all staff (e.g., for collaboration), this logic might need adjustment.
      // For now, only admin sees all staff through this route.
      // Teachers can see all staff as per previous discussion, so we'll allow that.
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: 'Not authorized to view all staff records.' });
      }
    }


    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { contactNumber: { $regex: searchTerm, $options: 'i' } },
        { cnic: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    if (staffType) {
      filter.staffType = staffType;
    }
    if (highestEducationLevel) {
      filter.highestEducationLevel = highestEducationLevel;
    }
    if (subject) {
      filter.subjectsTaught = { $in: [new RegExp(subject, 'i')] };
    }

    const staff = await Staff.find(filter);
    res.json(staff);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: 'Failed to retrieve staff: ' + err.message });
  }
};

// // --- GET STAFF BY ID ---
// export const getStaffById = async (req, res) => {
//   try {
//     const staff = await Staff.findById(req.params.id);
//     if (!staff) return res.status(404).json({ message: 'Staff not found' });

//     // Restrict access: Non-admin staff can only view their own profile
//     if (req.user.role !== 'admin' && req.user.profileId.toString() !== staff._id.toString()) {
//       return res.status(403).json({ message: 'Not authorized to view this staff profile.' });
//     }

//     res.json(staff);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// @desc    Get a single staff by ID
// @route   GET /api/staff/:id
// @access  Private (Admin can view any; Staff can view their own)
export const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID of the staff profile being requested
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;
  const loggedInUserProfileId = req.user.profileId?.toString();

  let staff;

  if (loggedInUserRole !== 'admin') { // For non-admins (teacher, accountant, cook, cleaner)
    if (!loggedInUserProfileId || loggedInUserProfileId !== id) {
      res.status(403);
      throw new Error('You can only view your own profile.');
    }
    staff = await Staff.findById(id);
  } else {
    // Admin can view any staff profile
    staff = await Staff.findById(id);
  }

  if (staff) {
    res.json(staff);
  } else {
    res.status(404);
    throw new Error('Staff not found');
  }
});

// --- UPDATE STAFF ---
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, fatherName, staffType, contactNumber, email, address, dateOfJoining, salary,
      highestEducationLevel, degrees, subjectsTaught, emergencyContact, bankAccountDetails, cnic, assignClasses,
      profilePictureUrl: existingProfilePictureUrl
    } = req.body;

    const currentStaff = await Staff.findById(id);
    if (!currentStaff) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting newly uploaded file for non-existent staff:', unlinkErr);
        });
      }
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Authorization check: Only admin can update any staff.
    // Teachers can update their own profile if editModeEnabled is true.
    // Other staff (cook, cleaner, accountant) can update their own profile if editModeEnabled is true.
    if (req.user.role !== 'admin' && req.user.profileId.toString() !== id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this staff profile.' });
    }

    // If not admin, and editModeEnabled is false for the current user, disallow update
    if (req.user.role !== 'admin' && !req.user.editModeEnabled) {
      return res.status(403).json({ message: 'Edit mode is not enabled for your role. Cannot update profile.' });
    }


    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (fatherName !== undefined) updateFields.fatherName = fatherName;
    if (staffType !== undefined) updateFields.staffType = staffType;
    if (cnic !== undefined) updateFields.cnic = cnic; // Allow updating cnic
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (dateOfJoining !== undefined) updateFields.dateOfJoining = new Date(dateOfJoining);
    if (salary !== undefined) updateFields.salary = parseFloat(salary);
    if (highestEducationLevel !== undefined) updateFields.highestEducationLevel = highestEducationLevel;
    if (degrees !== undefined) updateFields.degrees = degrees ? JSON.parse(degrees) : [];
    if (subjectsTaught !== undefined) updateFields.subjectsTaught = subjectsTaught ? JSON.parse(subjectsTaught) : [];
    if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
    if (bankAccountDetails !== undefined) updateFields.bankAccountDetails = JSON.parse(bankAccountDetails);
    // if (assignClasses !== undefined) updateFields.assignClasses = assignClasses ? JSON.parse(assignClasses) : [];
    if (assignClasses !== undefined) {
  try {
    updateFields.assignClasses = assignClasses ? JSON.parse(assignClasses) : [];
  } catch (e) {
    console.error("Invalid JSON for assignClasses:", assignClasses);
    updateFields.assignClasses = [];
  }
}


    updateFields.profilePictureUrl = handleProfilePictureUpload(req.file, existingProfilePictureUrl, currentStaff.profilePictureUrl);

    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(updatedStaff);
  } catch (err) {
    console.error("Error updating staff:", err);
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file on update error:', unlinkErr);
      });
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ message: 'Staff validation failed', errors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'This email is already registered.' });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
      return res.status(400).json({ message: 'This Employee ID is already registered.' });
    }
    res.status(500).json({ message: 'Failed to update staff: ' + err.message });
  }
};

// --- DELETE STAFF ---
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.profilePictureUrl && staff.profilePictureUrl !== '') {
      const filePath = path.join(__dirname, '..', staff.profilePictureUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting staff profile picture file:', err);
      });
    }

    await staff.deleteOne();
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: err.message });
  }
};


// // --- NEW FUNCTION TO ASSIGN CLASSES ---
// export const assignClasses = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { assignClasses } = req.body;

//     const staff = await Staff.findById(id);
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found' });
//     }

//     if (staff.staffType !== 'Teacher' && staff.staffType !== 'Admin') {
//       return res.status(403).json({ message: 'Cannot assign classes to this staff type.' });
//     }

//     if (!Array.isArray(assignClasses)) {
//       return res.status(400).json({ message: 'assignClasses must be an array.' });
//     }

//     staff.assignClasses = assignClasses;
//     await staff.save();
//     res.json({ message: 'Classes assigned successfully', staff: staff });
//   } catch (err) {
//     console.error("Error assigning classes:", err);y
//     res.status(500).json({ message: 'Failed to assign classes: ' + err.message });
//   }
// };



export const updateAssignedClasses = async (req, res) => {
  try {
    const { assignClasses } = req.body;

    if (!Array.isArray(assignClasses)) {
      return res.status(400).json({ error: 'assignClasses must be an array' });
    }

    // Validate each entry
    for (const cls of assignClasses) {
      if (!cls.type || !['Class', 'BS'].includes(cls.type)) {
        return res.status(400).json({ error: 'Each class must have a valid type (Class or BS)' });
      }
      if (cls.type === 'Class' && !cls.classNumber) {
        return res.status(400).json({ error: 'Class type must have classNumber' });
      }
      if (cls.type === 'BS' && (!cls.degreeName || !cls.semester)) {
        return res.status(400).json({ error: 'BS type must have degreeName and semester' });
      }
      if (!Array.isArray(cls.subjects) || cls.subjects.length === 0) {
        return res.status(400).json({ error: 'Each class must have at least one subject' });
      }
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { assignClasses },
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(updatedStaff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- RECORD ATTENDANCE (QR Code based or Manual) ---
export const recordAttendance = async (req, res) => {
  try {
    const { qrCodeSecret, cnic, status, checkInTime, checkOutTime, date, note } = req.body;

    let staff;
    if (qrCodeSecret) {
      staff = await Staff.findOne({ qrCodeSecret });
    } else if (cnic) {
      staff = await Staff.findOne({ cnic });
    } else {
      return res.status(400).json({ message: 'QR Code secret or Employee ID is required for attendance.' });
    }

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found.' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendanceIndex = staff.attendanceRecords.findIndex(record =>
      new Date(record.date).toDateString() === attendanceDate.toDateString()
    );

    if (existingAttendanceIndex > -1) {
      const existingRecord = staff.attendanceRecords[existingAttendanceIndex];
      existingRecord.status = status || existingRecord.status;
      existingRecord.checkInTime = checkInTime || existingRecord.checkInTime;
      existingRecord.checkOutTime = checkOutTime || existingRecord.checkOutTime;
      existingRecord.note = note || existingRecord.note;
    } else {
      staff.attendanceRecords.push({
        date: attendanceDate,
        status: status || 'Present',
        checkInTime: checkInTime || (status === 'Present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''),
        checkOutTime: checkOutTime || '',
        note: note || '',
      });
    }

    await staff.save();
    res.json({ message: 'Attendance recorded successfully.', attendance: staff.attendanceRecords[existingAttendanceIndex > -1 ? existingAttendanceIndex : staff.attendanceRecords.length - 1] });
  } catch (err) {
    console.error("Error recording attendance:", err);
    res.status(500).json({ message: 'Failed to record attendance: ' + err.message });
  }
};

// --- GET STAFF ATTENDANCE ---
export const getStaffAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found.' });
    }

    // Ensure staff can only view their own attendance unless admin
    if (req.user.role !== 'admin' && req.user.profileId.toString() !== id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this staff member\'s attendance.' });
    }

    let filteredAttendance = staff.attendanceRecords;

    if (month && year) {
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);
      filteredAttendance = filteredAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === targetMonth && recordDate.getFullYear() === targetYear;
      });
    }

    res.json(filteredAttendance);
  } catch (err) {
    console.error("Error fetching staff attendance:", err);
    res.status(500).json({ message: 'Failed to retrieve attendance: ' + err.message });
  }
};

// --- REQUEST LEAVE ---
export const requestLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, startDate, endDate, reason } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found.' });
    }

    // Ensure staff can only request leave for themselves
    if (req.user.role !== 'admin' && req.user.profileId.toString() !== id.toString()) {
      return res.status(403).json({ message: 'Not authorized to request leave for this staff profile.' });
    }

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Leave type, start date, end date, and reason are required.' });
    }

    staff.leaveRequests.push({
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending',
      requestedAt: new Date(),
    });

    await staff.save();
    res.status(201).json({ message: 'Leave request submitted successfully.', request: staff.leaveRequests[staff.leaveRequests.length - 1] });
  } catch (err) {
    console.error("Error submitting leave request:", err);
    res.status(500).json({ message: 'Failed to submit leave request: ' + err.message });
  }
};

// --- UPDATE LEAVE STATUS (Admin action) ---
export const updateLeaveStatus = async (req, res) => {
  try {
    const { staffId, requestId } = req.params;
    const { status, approvedRejectedBy } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Must be Approved or Rejected.' });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found.' });
    }

    const leaveRequest = staff.leaveRequests.id(requestId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    leaveRequest.status = status;
    leaveRequest.approvedRejectedAt = new Date();
    leaveRequest.approvedRejectedBy = approvedRejectedBy || req.user.name || req.user.cnic; // Use logged-in admin's name/CNIC

    await staff.save();
    res.json({ message: `Leave request ${status.toLowerCase()} successfully.`, request: leaveRequest });
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ message: 'Failed to update leave status: ' + err.message });
  }
};

// --- GET ALL LEAVE REQUESTS (for Admin view) ---
export const getAllLeaveRequests = async (req, res) => {
  try {
    const allStaff = await Staff.find({}, 'name cnic staffType leaveRequests');

    let allRequests = [];
    allStaff.forEach(staff => {
      staff.leaveRequests.forEach(request => {
        allRequests.push({
          staffId: staff._id,
          staffName: staff.name,
          cnic: staff.cnic,
          staffType: staff.staffType,
          requestId: request._id,
          type: request.type,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason,
          status: request.status,
          requestedAt: request.requestedAt,
          approvedRejectedAt: request.approvedRejectedAt,
          approvedRejectedBy: request.approvedRejectedBy,
        });
      });
    });

    if (req.query.status) {
      allRequests = allRequests.filter(req => req.status === req.query.status);
    }

    res.json(allRequests);
  } catch (err) {
    console.error("Error fetching all leave requests:", err);
    res.status(500).json({ message: 'Failed to retrieve leave requests: ' + err.message });
  }
};
