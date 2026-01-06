// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js'; // Import Student model to link profiles
import Staff from '../models/Staff.js';     // Import Staff model to link profiles
import bcrypt from 'bcryptjs'; 

// Helper function to generate JWT token with role included
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public (or Admin only if registration is restricted)
export const registerUser = asyncHandler(async (req, res) => {
  const { cnic, password, role, profileId, editModeEnabled, canAccessStudents, canAccessStaff } = req.body;

  // Validate required fields
  if (!cnic || !password || !role) {
    res.status(400);
    throw new Error('Please enter all required fields: CNIC, password, role.');
  }

  // Check if user with CNIC already exists
  const userExists = await User.findOne({ cnic });
  if (userExists) {
    res.status(400);
    throw new Error('User with this CNIC already exists.');
  }

  let roleMapping = null;
  let linkedProfile = null;

  // Link profile based on role
  if (role === 'student') {
    if (!profileId) {
      res.status(400);
      throw new Error('Student role requires a linked student profile ID.');
    }
    linkedProfile = await Student.findById(profileId);
    if (!linkedProfile) {
      res.status(404);
      throw new Error('Student profile not found for the provided ID.');
    }
    roleMapping = 'Student';
  } else if (['teacher', 'accountant', 'cook', 'cleaner'].includes(role)) {
    if (!profileId) {
      res.status(400);
      throw new Error('Staff roles require a linked staff profile ID.');
    }
    linkedProfile = await Staff.findById(profileId);
    if (!linkedProfile) {
      res.status(404);
      throw new Error('Staff profile not found for the provided ID.');
    }
    roleMapping = 'Staff';
  } else if (role === 'admin') {
    // Admin role does not require a linked profile initially, but can have one.
    // If profileId is provided for admin, validate it against Staff model.
    if (profileId) {
      linkedProfile = await Staff.findById(profileId);
      if (!linkedProfile) {
        res.status(404);
        throw new Error('Staff profile not found for the provided admin profile ID.');
      }
      roleMapping = 'Staff';
    }
  } else {
    res.status(400);
    throw new Error('Invalid user role provided.');
  }

  // Create the user
  const user = await User.create({
    cnic,
    password,
    role,
    profileId: linkedProfile ? linkedProfile._id : null,
    roleMapping: roleMapping,
    editModeEnabled: role === 'admin' ? true : (editModeEnabled || false), // Admin is true by default, others based on input
    canAccessStudents: canAccessStudents || false,
    canAccessStaff: canAccessStaff || false
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      cnic: user.cnic,
      role: user.role,
      profileId: user.profileId,
      roleMapping: user.roleMapping,
      editModeEnabled: user.editModeEnabled,
      canAccessStudents: user.canAccessStudents,
      canAccessStaff: user.canAccessStaff,
      token: generateToken(user._id, user.role), // Generate JWT for the new user, including role
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received.');
  }
});




export const createInternalUser = async ({ cnic, password, role, profileId, roleMapping }) => {
  console.log(`[createInternalUser] Attempting to create user for CNIC: ${cnic}, Role: ${role}`);
  // IMPORTANT: For debugging ONLY. NEVER log plain passwords in production.
  // console.log(`[createInternalUser] Default Password provided: ${password}`);

  if (!cnic || !password || !role) {
    throw new Error('Internal user creation requires CNIC, password, and role.');
  }

  const userExists = await User.findOne({ cnic });
  if (userExists) {
    console.log(`[createInternalUser] User with CNIC ${cnic} already exists. Skipping creation.`);
    // You might want to update the existing user here, or just return it,
    // depending on your exact requirement for existing CNICs.
    // For now, it correctly throws an error.
    throw new Error(`User with CNIC ${cnic} already exists.`);
  }

  try {
    const newUser = await User.create({
      cnic,
      password, // User model's pre('save') hook will hash this
      role,
      profileId,
      roleMapping,
      editModeEnabled: false,
    });

    if (newUser) {
      console.log(`[createInternalUser] Successfully created user: ${newUser.cnic}, ID: ${newUser._id}`);
      // console.log(`[createInternalUser] Stored Hashed Password: ${newUser.password}`); // Verify hash is present
      return newUser;
    } else {
      console.error('[createInternalUser] Failed to create internal user (newUser is null/undefined).');
      throw new Error('Failed to create internal user.');
    }
  } catch (error) {
    console.error(`[createInternalUser] Error during User.create for CNIC ${cnic}:`, error.message);
    throw error; // Re-throw the error for upstream handling
  }
};


export const authUser = asyncHandler(async (req, res) => {
  const { cnic, password } = req.body;
  console.log(`[authUser] Login attempt for CNIC: ${cnic}`);
  // IMPORTANT: For debugging ONLY. NEVER log plain passwords in production.
  // console.log(`[authUser] Provided Password: ${password}`);

  if (!cnic || !password) {
    res.status(400);
    throw new Error('Please enter your CNIC and password.');
  }

  const user = await User.findOne({ cnic });

  if (!user) {
    console.log(`[authUser] User not found for CNIC: ${cnic}`);
    res.status(401);
    throw new Error('Invalid CNIC or password.');
  }

  console.log(`[authUser] User found: ${user.cnic}. Attempting password comparison...`);
  // console.log(`[authUser] Hashed password from DB: ${user.password}`); // For debugging

  const isMatch = await user.matchPassword(password);
  console.log(`[authUser] Password match result for ${user.cnic}: ${isMatch}`);

  if (isMatch) {
    let profileName = user.cnic;
    if (user.profileId) {
      if (user.roleMapping === 'Student') {
        const studentProfile = await Student.findById(user.profileId).select('name');
        if (studentProfile) profileName = studentProfile.name;
        console.log(`[authUser] Linked Student Profile Name: ${profileName}`);
      } else if (user.roleMapping === 'Staff') {
        const staffProfile = await Staff.findById(user.profileId).select('name');
        if (staffProfile) profileName = staffProfile.name;
        console.log(`[authUser] Linked Staff Profile Name: ${profileName}`);
      }
    }

    res.json({
      _id: user._id,
      cnic: user.cnic,
      name: profileName,
      role: user.role,
      profileId: user.profileId,
      editModeEnabled: user.editModeEnabled,
      canAccessStudents: user.canAccessStudents,
      canAccessStaff: user.canAccessStaff,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid CNIC or password.');
  }
});



// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').populate({
    path: 'profileId',
    select: 'name cnic employeeId profilePictureUrl', // Populate name, cnic (for students), employeeId (for staff)
    // We don't need to specify model here as refPath handles it
  });

  // Map to include a more descriptive roleMapping for display
  const usersWithMapping = users.map(user => {
    let roleMappingLabel = 'N/A';
    if (user.profileId) {
      if (user.roleMapping === 'Student') {
        roleMappingLabel = `Student: ${user.profileId.name || user.profileId.cnic}`;
      } else if (user.roleMapping === 'Staff') {
        roleMappingLabel = `Staff: ${user.profileId.name || user.profileId.employeeId}`;
      }
    } else if (user.role === 'admin') {
      roleMappingLabel = 'Admin (no linked profile)';
    }
    return { ...user.toObject(), roleMapping: roleMappingLabel };
  });

  res.json(usersWithMapping);
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const { cnic, password, role, profileId, editModeEnabled, canAccessStudents, canAccessStaff } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    // CNIC and Role cannot be changed after creation for simplicity in this system
    // user.cnic = cnic || user.cnic;
    // user.role = role || user.role;

    if (password) {
      user.password = password; // Pre-save hook will hash it
    }

    // Only allow profileId to be updated if the role mapping is consistent
    // Or if the user is an admin and the profileId is being set/cleared
    if (profileId !== undefined && profileId !== user.profileId?.toString()) {
        let newRoleMapping = user.roleMapping;
        let newProfile = null;

        if (profileId) { // If a new profileId is provided
            if (user.role === 'student') {
                newProfile = await Student.findById(profileId);
                if (!newProfile) {
                    res.status(404);
                    throw new Error('Student profile not found for the provided ID.');
                }
                newRoleMapping = 'Student';
            } else if (['teacher', 'accountant', 'cook', 'cleaner', 'admin'].includes(user.role)) {
                newProfile = await Staff.findById(profileId);
                if (!newProfile) {
                    res.status(404);
                    throw new Error('Staff profile not found for the provided ID.');
                }
                newRoleMapping = 'Staff';
            } else {
                res.status(400);
                throw new Error('Invalid role for profile linking.');
            }
        } else { // If profileId is being cleared
            newRoleMapping = null; // Clear role mapping if profileId is cleared
        }
        user.profileId = newProfile ? newProfile._id : null;
        user.roleMapping = newRoleMapping;
    }


    // Allow admin to toggle editModeEnabled for other users
    if (req.user.role === 'admin') {
      if (editModeEnabled !== undefined) {
        user.editModeEnabled = editModeEnabled;
      }
      if (canAccessStudents !== undefined) {
        user.canAccessStudents = canAccessStudents;
      }
      if (canAccessStaff !== undefined) {
        user.canAccessStaff = canAccessStaff;
      }
    }


    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      cnic: updatedUser.cnic,
      role: updatedUser.role,
      profileId: updatedUser.profileId,
      roleMapping: updatedUser.roleMapping,
      editModeEnabled: updatedUser.editModeEnabled,
      canAccessStudents: updatedUser.canAccessStudents,
      canAccessStaff: updatedUser.canAccessStaff,
    });
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent admin from deleting their own user account
    if (req.user._id.toString() === user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own user account.');
    }
    await user.deleteOne();
    res.json({ message: 'User removed.' });
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

// @desc    Toggle editModeEnabled for a user (Admin only)
// @route   PUT /api/users/:id/editmode
// @access  Private/Admin
export const toggleEditMode = asyncHandler(async (req, res) => {
  const { enable } = req.body; // 'enable' will be true or false

  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent admin from disabling their own edit mode via this panel
    if (req.user._id.toString() === user._id.toString()) {
      res.status(400);
      throw new Error('You cannot disable your own edit mode from this panel. Manage it via your profile settings if available.');
    }

    user.editModeEnabled = enable;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      cnic: updatedUser.cnic,
      role: updatedUser.role,
      profileId: updatedUser.profileId,
      editModeEnabled: updatedUser.editModeEnabled,
      message: `Edit mode for ${user.cnic} ${updatedUser.editModeEnabled ? 'enabled' : 'disabled'}.`
    });
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});


// controllers/userController.js
const getUsers = asyncHandler(async (req, res) => {
  // const users = await User.find().populate('profileId', 'name'); // Only populate the `name` from staff
  // res.json(users);
const users = await User.find()
  .populate({
    path: 'profileId',
    model: function(doc) {
      return doc.roleMapping === 'Staff' ? 'Staff' : 'Student';
    }
  });

res.json(users);
});



// @desc    Register the first admin user
// @route   POST /api/users/register-admin
// @access  Public (unrestricted for first time setup)
export const registerAdminUser = asyncHandler(async (req, res) => {
  const { name, cnic, password, contactNumber, email } = req.body;

  if (!name || !cnic || !password || !contactNumber || !email) {
    res.status(400);
    throw new Error('Please enter all required fields: name, cnic, password, contactNumber, and email.');
  }

  // Check if any admin user already exists to prevent misuse
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    res.status(400);
    throw new Error('An admin user already exists. Cannot register a new one via this endpoint.');
  }

  // Create a staff member for the admin user
  const newStaff = await Staff.create({
    name,
    cnic,
    staffType: 'admin',
    contactNumber,
    email,
    salary: 0,
    dateOfJoining: new Date(),
  });

  // Create the admin user linked to the new staff member
  const user = await User.create({
    cnic,
    password,
    role: 'admin',
    profileId: newStaff._id,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      cnic: user.cnic,
      role: user.role,
      profileId: user.profileId,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// ... other imports and functions

// --- TOGGLE EDIT MODE FOR ALL USERS OF A SPECIFIC ROLE ---
export const toggleAllEditMode = asyncHandler(async (req, res) => {
  // read role from URL param and enable from request body
  const role = req.params.role;
  const { enable } = req.body;

  if (!role || typeof enable !== 'boolean') {
    return res.status(400).json({ message: 'Role param and a valid boolean "enable" value are required.' });
  }

  if (role === 'admin') {
    return res.status(403).json({ message: 'Cannot bulk-toggle edit mode for admin accounts.' });
  }

  // Update users with the specified role
  const result = await User.updateMany({ role }, { $set: { editModeEnabled: enable } });

  // Support older/newer mongoose result shapes
  const matched = result.matchedCount !== undefined ? result.matchedCount : result.n || 0;
  const modified = result.modifiedCount !== undefined ? result.modifiedCount : result.nModified || 0;

  if (matched === 0) {
    return res.status(404).json({ message: `No users with the role "${role}" found.` });
  }

  res.json({
    message: `Edit mode has been ${enable ? 'enabled' : 'disabled'} for ${modified} users with the role "${role}".`,
    modifiedCount: modified
  });
});

// @desc    Update per-module access flags for a user (Admin only)
// @route   PUT /api/users/:id/module-access
// @access  Private/Admin
export const updateUserModuleAccess = asyncHandler(async (req, res) => {
  const { canAccessStudents, canAccessStaff } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (req.user._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error('You cannot change your own module access from this panel.');
  }

  if (canAccessStudents !== undefined) {
    user.canAccessStudents = Boolean(canAccessStudents);
  }
  if (canAccessStaff !== undefined) {
    user.canAccessStaff = Boolean(canAccessStaff);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    canAccessStudents: updatedUser.canAccessStudents,
    canAccessStaff: updatedUser.canAccessStaff,
    message: 'Module access updated successfully.',
  });
});