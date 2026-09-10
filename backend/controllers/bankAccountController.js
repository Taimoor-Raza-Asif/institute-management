// backend/controllers/bankAccountController.js
import asyncHandler from 'express-async-handler';
import BankAccount from '../models/BankAccount.js';

// @desc    Get all active bank accounts / wallets
// @route   GET /api/bank-accounts
// @access  Private (admin, accountant)
export const getBankAccounts = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const query = req.user.role === 'admin' && includeInactive === 'true'
    ? {}
    : { isActive: true };

  const accounts = await BankAccount.find(query).sort({ type: 1, name: 1 });
  res.json(accounts);
});

// @desc    Get a single bank account by ID
// @route   GET /api/bank-accounts/:id
// @access  Private/Admin
export const getBankAccountById = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error('Account not found.');
  }
  res.json(account);
});

// @desc    Create a new bank account / wallet
// @route   POST /api/bank-accounts
// @access  Private/Admin
export const createBankAccount = asyncHandler(async (req, res) => {
  const { name, type, accountNumber, bankName, holderName, description, isActive } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Name and type are required.');
  }

  const account = await BankAccount.create({
    name,
    type,
    accountNumber,
    bankName,
    holderName,
    description,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });

  res.status(201).json(account);
});

// @desc    Update a bank account / wallet
// @route   PUT /api/bank-accounts/:id
// @access  Private/Admin
export const updateBankAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error('Account not found.');
  }

  const { name, type, accountNumber, bankName, holderName, description, isActive } = req.body;

  account.name = name ?? account.name;
  account.type = type ?? account.type;
  account.accountNumber = accountNumber ?? account.accountNumber;
  account.bankName = bankName ?? account.bankName;
  account.holderName = holderName ?? account.holderName;
  account.description = description ?? account.description;
  if (isActive !== undefined) account.isActive = isActive;

  const updated = await account.save();
  res.json(updated);
});

// @desc    Delete (hard) a bank account
// @route   DELETE /api/bank-accounts/:id
// @access  Private/Admin
export const deleteBankAccount = asyncHandler(async (req, res) => {
  const account = await BankAccount.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error('Account not found.');
  }

  await account.deleteOne();
  res.json({ message: 'Account deleted successfully.' });
});
