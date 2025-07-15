// backend/middleware/upload.js (Example Multer configuration)
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Node.js file system module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the uploads directory
const uploadsDir = path.join(__dirname, '../uploads/profilePictures');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Files will be saved in backend/uploads/profilePictures
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

export default upload;