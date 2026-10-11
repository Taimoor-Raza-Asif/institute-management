// backend/controllers/superAdminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import jwt from 'jsonwebtoken';

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });

// ─── Elevate to Super Admin (Session Only) ────────────────────────────────────
// @route   POST /api/super-admin/promote-self
// @access  Authenticated admin — provides secret key in request body
// NOTE: This does NOT change the DB. The elevated role lives in the JWT only.
//       On logout the session token is cleared → next login returns normal admin role.
export const promoteSelf = asyncHandler(async (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey || secretKey !== process.env.SUPER_ADMIN_SECRET) {
    res.status(403);
    throw new Error('Invalid secret key. Elevation denied.');
  }

  // Only admin accounts can be elevated
  const user = await User.findById(req.user._id);
  if (!user || user.role !== 'admin') {
    res.status(403);
    throw new Error('Only an existing Admin account can be elevated to Super Admin.');
  }

  // Issue a session-elevated token (role: super_admin) — DB stays unchanged
  const elevatedToken = generateToken(user._id, 'super_admin');

  res.json({
    message: 'Session elevated to Super Admin. This expires on logout.',
    token: elevatedToken,
    role: 'super_admin',
    cnic: user.cnic,
  });
});

// ─── Get All Admin Users ──────────────────────────────────────────────────────
// @route   GET /api/super-admin/admins
// @access  Super Admin only
export const getAdminUsers = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' })
    .select('-password')
    .populate({ path: 'profileId', select: 'name cnic employeeId profilePictureUrl' });

  res.json(admins);
});

// ─── Initiate Admin Deletion (5-min cool-down) ───────────────────────────────
// @route   POST /api/super-admin/admins/:id/initiate-delete
// @access  Super Admin only
export const initiateAdminDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (user.role !== 'admin') {
    res.status(400);
    throw new Error('Can only initiate deletion for admin accounts.');
  }

  user.pendingDeletion = true;
  user.deletionScheduledAt = new Date();
  user.isActive = false; // Immediately deactivate
  await user.save();

  res.json({
    message: 'Deletion initiated. Admin has been deactivated. You have 5 minutes to undo.',
    deletionScheduledAt: user.deletionScheduledAt,
    cooldownMs: COOLDOWN_MS,
  });
});

// ─── Undo Admin Deletion ──────────────────────────────────────────────────────
// @route   POST /api/super-admin/admins/:id/undo-delete
// @access  Super Admin only
export const undoAdminDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (!user.pendingDeletion) {
    res.status(400);
    throw new Error('No pending deletion to undo for this user.');
  }

  // Check if cooldown has already expired
  const elapsed = Date.now() - new Date(user.deletionScheduledAt).getTime();
  if (elapsed >= COOLDOWN_MS) {
    res.status(410);
    throw new Error('Cooldown has expired. The admin account has already been permanently deleted.');
  }

  user.pendingDeletion = false;
  user.deletionScheduledAt = null;
  user.isActive = true;
  await user.save();

  res.json({ message: 'Deletion undone. Admin account has been fully restored.' });
});

// ─── Toggle Admin Active Status ───────────────────────────────────────────────
// @route   PUT /api/super-admin/admins/:id/toggle-active
// @access  Super Admin only
export const toggleAdminActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (user.role !== 'admin') {
    res.status(400);
    throw new Error('Can only toggle active status for admin accounts.');
  }
  if (user.pendingDeletion) {
    res.status(400);
    throw new Error('Cannot change status while deletion is pending. Undo the deletion first.');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `Admin account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    isActive: user.isActive,
  });
});

// ─── Process Pending Deletions (called by background job) ────────────────────
export const processPendingDeletions = async () => {
  try {
    const cutoff = new Date(Date.now() - COOLDOWN_MS);
    const expired = await User.find({
      pendingDeletion: true,
      deletionScheduledAt: { $lte: cutoff },
    });

    for (const user of expired) {
      console.log(`[SuperAdmin] Permanently deleting expired admin: ${user.cnic}`);
      await user.deleteOne();
    }
  } catch (err) {
    console.error('[SuperAdmin] Error processing pending deletions:', err.message);
  }
};
