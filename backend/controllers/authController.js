import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT with 24 hour expiration
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h', // Token expires in 24 hours
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { cnic, password } = req.body;

  try {
    // Check if user exists by CNIC
    const user = await User.findOne({ cnic });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        cnic: user.cnic,
        role: user.role,
        profileId: user.profileId,
        editModeEnabled: user.editModeEnabled,
        canAccessStudents: user.canAccessStudents,
        canAccessStaff: user.canAccessStaff,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid CNIC or Password' });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};