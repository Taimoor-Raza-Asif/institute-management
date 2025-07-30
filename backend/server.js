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

// Helper to get __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the 'uploads' directory
// This makes files in 'uploads/' accessible via '/uploads/' URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/students', studentRoutes); // Student management routes
app.use('/api/fees', feeRoutes);       // Fee management routes
app.use('/api/staff', staffRoutes);     // Staff management routes
app.use('/api/users', userRoutes);      // <--- NEW: User management routes
app.use('/api/leave', leaveRoutes);
app.use('/api/staff-leave', staffLeaveRoutes); 

// Define the port for the server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('MongoDB connection error:', err)); // More descriptive error message
