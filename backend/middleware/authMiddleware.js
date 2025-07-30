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
      console.log('[/protect middleware] Received token (partial):', token.substring(0, 10) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[/protect middleware] Decoded token:', decoded);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('[/protect middleware] User not found for ID from token:', decoded.id);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      console.log('[/protect middleware] User authenticated:', req.user.cnic, 'Role:', req.user.role);
      next();
    } catch (error) {
      console.error('[/protect middleware] Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.log('[/protect middleware] No token provided in header.');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


// Authorize roles - restricts access based on user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if req.user exists and its role is included in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(req.user);
      res.status(403); // Forbidden
      throw new Error(`Not authorized as ${req.user ? req.user.role : 'guest'}. Required roles: ${roles.join(', ')}`);
    }
    next(); // User has the required role, proceed
  };
};

export { protect, authorizeRoles };
