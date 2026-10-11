import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT with 24 hour expiration
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { cnic, password } = req.body;

  try {
    const user = await User.findOne({ cnic });

    if (!user) {
      return res.status(401).json({ message: 'Invalid CNIC or Password' });
    }

    // Block deactivated accounts
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact the Super Admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      res.json({
        _id: user._id,
        cnic: user.cnic,
        role: user.role,
        profileId: user.profileId,
        editModeEnabled: user.editModeEnabled,
        canAccessStudents: user.canAccessStudents,
        canAccessStaff: user.canAccessStaff,
        canViewFinancialSummary: user.canViewFinancialSummary,
        canViewReports: user.canViewReports,
        canManageSalaries: user.canManageSalaries,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid CNIC or Password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};