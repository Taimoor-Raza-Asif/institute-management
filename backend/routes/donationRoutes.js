import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  addDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  downloadReceipt,
  getDonationReports
} from '../controllers/donationController.js';

import upload from '../middleware/upload.js';

const router = express.Router();

// Define allowed roles for donation management
const allowedRoles = ['admin', 'accountant'];

// Apply the 'upload' middleware directly to the POST route
router.route('/')
  .post(protect, authorizeRoles(...allowedRoles), upload.single('receipt'), addDonation)
  .get(protect, authorizeRoles(...allowedRoles), getDonations);


router.route('/reports')
  .get(protect, authorizeRoles('admin', 'accountant'), getDonationReports);

  
router.route('/:id')
  .get(protect, authorizeRoles(...allowedRoles), getDonationById)
  .put(protect, authorizeRoles(...allowedRoles), updateDonation)
  .delete(protect, authorizeRoles(...allowedRoles), deleteDonation);

router.get('/:id/receipt', protect, authorizeRoles(...allowedRoles), downloadReceipt);

export default router;