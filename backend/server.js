// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import multer from 'multer';
// import studentRoutes from './routes/studentRoutes.js';
// import feeRoutes from './routes/feeRoutes.js';
// import staffRoutes from './routes/staffRoutes.js'
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve uploaded images
// app.use('/uploads', express.static(path.join('uploads')));

// // Routes
// app.use('/api/students', studentRoutes);
// app.use('/api/fees', feeRoutes);
// app.use('/api/staff', staffRoutes)

// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }).catch(err => console.error(err));


import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// import multer from 'multer'; // Multer is configured within routes, no need to import here globally

// Import routes
import studentRoutes from './routes/studentRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import userRoutes from './routes/userRoutes.js'; // <--- NEW: Import user routes
import leaveRoutes from './routes/leaveRoutes.js'; // Import the new routes
import staffLeaveRoutes from './routes/staffLeaveRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import donationRoutes from './routes/donationRoutes.js'; // Import the new routes
import billingRoutes from './routes/billingRoutes.js'; 
import marksRoutes from './routes/marksRoutes.js'; // Import the new routes
import academicStructureRoutes from './routes/academicStructureRoutes.js';
import importRoutes from './routes/importRoutes.js';
// Helper to get __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
// Configure CORS for production
const allowedOrigins = [
  'https://institute-management-ten.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, true); // Allow all for now - can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from the 'uploads' directory
// This makes files in 'uploads/' accessible via '/uploads/' URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/donation_receipts', express.static(path.join(__dirname, 'uploads/donation_receipts')));

// API Routes
app.use('/api/students', studentRoutes); // Student management routes
app.use('/api/fees', feeRoutes);       // Fee management routes
app.use('/api/staff', staffRoutes);     // Staff management routes
app.use('/api/users', userRoutes);      // <--- NEW: User management routes
app.use('/api/leave', leaveRoutes);
app.use('/api/staff-leave', staffLeaveRoutes); 
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/billing', billingRoutes); 
app.use('/api/marks', marksRoutes);
app.use('/api/academic-structure', academicStructureRoutes);
app.use('/api/import', importRoutes);
// Define the port for the server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('MongoDB connection error:', err)); // More descriptive error message

// Export app for testing (supertest). Tests should handle DB setup/teardown.
export default app;
