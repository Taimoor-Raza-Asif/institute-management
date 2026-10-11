// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // For handling async errors without try/catch blocks
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
// Protect routes - ensures user is authenticated

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // console.log('[/protect middleware] Received token (partial):', token.substring(0, 10) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('[/protect middleware] Decoded token:', decoded);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Block deactivated accounts
      if (!req.user.isActive) {
        res.status(403);
        throw new Error('Account is deactivated. Contact the Super Admin.');
      }

      // Session-based super_admin elevation:
      // If the JWT carries role 'super_admin' but the DB stores 'admin',
      // apply the elevated role in-memory for this request only.
      // The DB is never modified — elevation expires when the token is replaced (logout).
      if (decoded.role === 'super_admin' && req.user.role === 'admin') {
        req.user = { ...req.user.toObject(), role: 'super_admin' };
      }

      next();
    } catch (error) {
      // console.error('[/protect middleware] Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    // console.log('[/protect middleware] No token provided in header.');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


// Authorize roles - restricts access based on user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // super_admin can always access any admin-protected route
    if (req.user && req.user.role === 'super_admin') return next();
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(`Not authorized as ${req.user ? req.user.role : 'guest'}. Required roles: ${roles.join(', ')}`);
    }
    next(); // User has the required role, proceed
  };
};

// Super-admin-only gate
const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Not authorized. Super Admin access required.');
  }
  next();
};

// Module-level access gate for student management
// Teachers/accountants keep their previous read access; grant flag required for write actions.
const ensureStudentModuleAccess = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user missing');
  }
  if (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'student') {
    return next();
  }
  // Allow teacher/accountant to read even without explicit flag
  if (['teacher', 'accountant'].includes(req.user.role) && req.method === 'GET') {
    return next();
  }
  // Require explicit flag for mutating requests
  if (['teacher', 'accountant'].includes(req.user.role) && req.user.canAccessStudents) {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized for student management');
};

// Module-level access gate for staff management
// Teachers/accountants can access their own profile without the flag; flag is needed for broader CRUD.
const ensureStaffModuleAccess = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user missing');
  }
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }
  // Allow other staff roles (cook/cleaner) to access their own limited routes handled elsewhere
  if (['cook', 'cleaner'].includes(req.user.role)) {
    return next();
  }
  // Allow teacher/accountant to access their own staff profile
  if (['teacher', 'accountant'].includes(req.user.role) && req.user.profileId && req.params.id === String(req.user.profileId)) {
    return next();
  }
  if (['teacher', 'accountant'].includes(req.user.role) && req.user.canAccessStaff) {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized for staff management');
};

export { protect, authorizeRoles, isSuperAdmin, ensureStudentModuleAccess, ensureStaffModuleAccess };
