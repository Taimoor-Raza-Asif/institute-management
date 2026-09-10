// backend/controllers/coaController.js
import asyncHandler from 'express-async-handler';
import ChartOfAccount from '../models/ChartOfAccount.js';

// ─── Helper: build a tree from a flat list ─────────────────────────────────
const buildTree = (accounts, parentId = null) => {
  return accounts
    .filter(acc => String(acc.parent?._id || acc.parent) === String(parentId) ||
      (parentId === null && !acc.parent))
    .sort((a, b) => a.order - b.order)
    .map(acc => ({
      ...acc.toObject(),
      children: buildTree(accounts, acc._id),
    }));
};

// @desc    Get all accounts (flat list, parents populated)
// @route   GET /api/coa
// @access  Private (admin, accountant)
export const getAccounts = asyncHandler(async (req, res) => {
  const { type, activeOnly } = req.query;
  const query = {};
  if (type) query.type = type;
  if (activeOnly === 'true') query.isActive = true;

  const accounts = await ChartOfAccount.find(query)
    .populate('parent', 'name code type')
    .sort({ type: 1, order: 1, name: 1 });

  res.json(accounts);
});

// @desc    Get accounts as a full hierarchy tree grouped by type
// @route   GET /api/coa/tree
// @access  Private (admin, accountant)
export const getAccountTree = asyncHandler(async (req, res) => {
  const accounts = await ChartOfAccount.find({ isActive: true })
    .populate('parent', 'name')
    .sort({ order: 1, name: 1 });

  const types = ['Asset', 'Liability', 'Income', 'Expense'];
  const tree = {};
  for (const type of types) {
    const typeAccounts = accounts.filter(a => a.type === type);
    tree[type] = buildTree(typeAccounts);
  }

  res.json(tree);
});

// @desc    Get leaf accounts of a given type (for dropdowns — excludes top-level heads)
// @route   GET /api/coa/type/:type
// @access  Private (admin, accountant)
export const getAccountsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!['Asset', 'Liability', 'Income', 'Expense'].includes(type)) {
    res.status(400);
    throw new Error('Invalid account type. Must be Asset, Liability, Income, or Expense.');
  }

  const accounts = await ChartOfAccount.find({ type, isActive: true })
    .populate('parent', 'name code')
    .sort({ order: 1, name: 1 });

  res.json(accounts);
});

// @desc    Create a new account
// @route   POST /api/coa
// @access  Private/Admin
export const createAccount = asyncHandler(async (req, res) => {
  const { name, code, type, parent, description, order } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Name and type are required.');
  }

  // Verify parent exists and is the same type
  if (parent) {
    const parentAccount = await ChartOfAccount.findById(parent);
    if (!parentAccount) {
      res.status(400);
      throw new Error('Parent account not found.');
    }
    if (parentAccount.type !== type) {
      res.status(400);
      throw new Error(`Parent account must be the same type. Parent is "${parentAccount.type}" but you selected "${type}".`);
    }
  }

  const account = await ChartOfAccount.create({
    name,
    code: code || '',
    type,
    parent: parent || null,
    description: description || '',
    order: order || 0,
    isSystem: false, // user-created accounts are never system
  });

  const populated = await account.populate('parent', 'name code type');
  res.status(201).json(populated);
});

// @desc    Update an account
// @route   PUT /api/coa/:id
// @access  Private/Admin
export const updateAccount = asyncHandler(async (req, res) => {
  const account = await ChartOfAccount.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error('Account not found.');
  }

  const { name, code, type, parent, description, isActive, order } = req.body;

  // Prevent changing type of system accounts
  if (account.isSystem && type && type !== account.type) {
    res.status(400);
    throw new Error('Cannot change the type of a system account.');
  }

  // Prevent making an account its own parent
  if (parent && String(parent) === String(account._id)) {
    res.status(400);
    throw new Error('An account cannot be its own parent.');
  }

  if (name !== undefined) account.name = name;
  if (code !== undefined) account.code = code;
  if (type !== undefined) account.type = type;
  if (parent !== undefined) account.parent = parent || null;
  if (description !== undefined) account.description = description;
  if (isActive !== undefined) account.isActive = isActive;
  if (order !== undefined) account.order = order;

  const updated = await account.save();
  const populated = await updated.populate('parent', 'name code type');
  res.json(populated);
});

// @desc    Delete an account
// @route   DELETE /api/coa/:id
// @access  Private/Admin
export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await ChartOfAccount.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error('Account not found.');
  }

  if (account.isSystem) {
    res.status(400);
    throw new Error('System accounts cannot be deleted.');
  }

  // Check for child accounts
  const childCount = await ChartOfAccount.countDocuments({ parent: account._id });
  if (childCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete — this account has ${childCount} sub-account(s). Delete or reassign them first.`);
  }

  await account.deleteOne();
  res.json({ message: 'Account deleted successfully.' });
});

// @desc    Trigger re-seed (admin utility — only works if DB is empty)
// @route   POST /api/coa/seed
// @access  Private/Admin
export const triggerSeed = asyncHandler(async (req, res) => {
  const count = await ChartOfAccount.countDocuments();
  if (count > 0) {
    res.status(400);
    throw new Error('Chart of Accounts already has data. Clear it first to re-seed.');
  }
  const { seedDefaultCoA } = await import('../utils/seedCoA.js');
  await seedDefaultCoA();
  const accounts = await ChartOfAccount.find();
  res.json({ message: `Seeded ${accounts.length} accounts.`, accounts });
});
