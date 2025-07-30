// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  cnic: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{13}$/, 'Please enter a valid 13-digit CNIC.']
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum password length
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'teacher', 'accountant', 'cook', 'cleaner'],
    required: true
  },
  profileId: { // This will store the _id of the associated Student or Staff document
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'roleMapping', // Dynamically reference 'Student' or 'Staff' collection
    default: null // Can be null for admin or if not yet linked
  },
  roleMapping: { // Stores the model name ('Student' or 'Staff') for refPath
    type: String,
    required: function() {
      // profileId is required if role is not 'admin'
      return this.role !== 'admin';
    },
    enum: {
      values: ['student', 'staff'],
      message: 'Role mapping must be either Student or Staff for non-admin roles.'
    }
  },
  editModeEnabled: { // To control if this specific user can edit their data or data they are authorized for
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// --- Mongoose Middleware (Pre-save hook) ---

// Hash password before saving the user document
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { // Only hash if the password field is modified
    return next();
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// --- Instance Method ---

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
