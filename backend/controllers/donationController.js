import asyncHandler from 'express-async-handler';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helper function to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/donation_receipts');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// The `upload` middleware is now exported directly to be used in routes
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Optional: Validate file types
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  }
}).single('receipt'); // 'receipt' is the field name in the form

// @desc    Add a new donation
// @route   POST /api/donations
// @access  Private/Admin & Accountant
const addDonation = asyncHandler(async (req, res) => {
  // `multer` has already processed the request at this point.
  // The file is available at `req.file` and the other fields at `req.body`.
  const { donationAmount, donationPurpose, donationDate, donorName, contactNumber, emailAddress, cnic, organizationName, paymentMethod } = req.body;

  const newDonation = new Donation({
    donationAmount,
    donationPurpose,
    donationDate,
    donorName,
    contactNumber,
    emailAddress,
    cnic,
    organizationName,
    paymentMethod,
    receiptPath: req.file ? `/uploads/donation_receipts/${req.file.filename}` : null,
    markedBy: req.user._id
  });

  const createdDonation = await newDonation.save();
  res.status(201).json(createdDonation);
});

// @desc    Get all donations with filters
// @route   GET /api/donations
// @access  Private/Admin & Accountant
const getDonations = asyncHandler(async (req, res) => {
  const { donorName, paymentMethod, startDate, endDate } = req.query;
  const query = {};

  if (donorName) query.donorName = { $regex: donorName, $options: 'i' };
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.donationDate = {};
    if (startDate) query.donationDate.$gte = new Date(startDate);
    if (endDate) query.donationDate.$lte = new Date(endDate);
  }

  const donations = await Donation.find(query).populate('markedBy', 'cnic role');
  res.json(donations);
});

// @desc    Get a single donation by ID
// @route   GET /api/donations/:id
// @access  Private/Admin & Accountant
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate('markedBy', 'cnic role');

  if (donation) {
    res.json(donation);
  } else {
    res.status(404);
    throw new Error('Donation not found');
  }
});

// @desc    Update a donation
// @route   PUT /api/donations/:id
// @access  Private/Admin & Accountant
const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (donation) {
    donation.donationAmount = req.body.donationAmount || donation.donationAmount;
    donation.donationPurpose = req.body.donationPurpose || donation.donationPurpose;
    donation.donationDate = req.body.donationDate || donation.donationDate;
    donation.donorName = req.body.donorName || donation.donorName;
    donation.contactNumber = req.body.contactNumber || donation.contactNumber;
    donation.emailAddress = req.body.emailAddress || donation.emailAddress;
    donation.cnic = req.body.cnic || donation.cnic;
    donation.organizationName = req.body.organizationName || donation.organizationName;
    donation.paymentMethod = req.body.paymentMethod || donation.paymentMethod;

    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } else {
    res.status(404);
    throw new Error('Donation not found');
  }
});

// @desc    Delete a donation
// @route   DELETE /api/donations/:id
// @access  Private/Admin & Accountant
const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (donation) {
    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } else {
    res.status(404);
    throw new Error('Donation not found');
  }
});

// @desc    Download donation receipt
// @route   GET /api/donations/:id/receipt
// @access  Private/Admin & Accountant
const downloadReceipt = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (donation && donation.receiptPath) {
    const filePath = path.join(__dirname, '..', donation.receiptPath);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404);
      throw new Error('Receipt file not found');
    }
  } else {
    res.status(404);
    throw new Error('Donation or receipt not found');
  }
});

export { addDonation, getDonations, getDonationById, updateDonation, deleteDonation, downloadReceipt, upload };