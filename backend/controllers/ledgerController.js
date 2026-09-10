// backend/controllers/ledgerController.js
import asyncHandler from 'express-async-handler';
import LedgerEntry from '../models/LedgerEntry.js';
import ChartOfAccount from '../models/ChartOfAccount.js';
import { migrateAllToLedger } from '../utils/migrateToLedger.js';

// ─── Account Ledger (transactions for one account) ───────────────────────────
// @route  GET /api/ledger/account/:coaId
// @access Private (admin, accountant)
export const getAccountLedger = asyncHandler(async (req, res) => {
  const { coaId } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;

  const account = await ChartOfAccount.findById(coaId);
  if (!account) {
    res.status(404); throw new Error('Account not found.');
  }

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate)   dateFilter.$lte = new Date(endDate);

  const baseQuery = {
    $or: [{ debitAccount: coaId }, { creditAccount: coaId }],
    isReversed: false,
    ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
  };

  const total = await LedgerEntry.countDocuments(baseQuery);
  const entries = await LedgerEntry.find(baseQuery)
    .populate('debitAccount', 'name code type')
    .populate('creditAccount', 'name code type')
    .sort({ date: 1, createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Compute running balance for this account
  // Convention: debit increases assets/expenses; credit increases income/liabilities
  let runningBalance = 0;
  const entriesWithBalance = entries.map(e => {
    const isDebit  = String(e.debitAccount?._id  || e.debitAccount)  === String(coaId);
    const isCredit = String(e.creditAccount?._id || e.creditAccount) === String(coaId);

    let debit  = 0;
    let credit = 0;

    if (isDebit)  { debit  = e.amount; runningBalance += e.amount; }
    if (isCredit) { credit = e.amount; runningBalance -= e.amount; }

    return {
      ...e.toObject(),
      debit,
      credit,
      balance: runningBalance,
    };
  });

  res.json({
    account,
    entries: entriesWithBalance,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ─── Trial Balance ────────────────────────────────────────────────────────────
// @route  GET /api/ledger/trial-balance
// @access Private (admin, accountant)
export const getTrialBalance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate)   dateFilter.$lte = new Date(endDate);
  const dateMatch = Object.keys(dateFilter).length ? { date: dateFilter } : {};

  // Aggregate total debits and credits per account
  const [debitTotals, creditTotals] = await Promise.all([
    LedgerEntry.aggregate([
      { $match: { isReversed: false, ...dateMatch } },
      { $group: { _id: '$debitAccount', totalDebit: { $sum: '$amount' } } },
    ]),
    LedgerEntry.aggregate([
      { $match: { isReversed: false, ...dateMatch } },
      { $group: { _id: '$creditAccount', totalCredit: { $sum: '$amount' } } },
    ]),
  ]);

  // Build a map of account totals
  const totals = {};
  debitTotals.forEach(({ _id, totalDebit }) => {
    const id = String(_id);
    totals[id] = totals[id] || { debit: 0, credit: 0 };
    totals[id].debit += totalDebit;
  });
  creditTotals.forEach(({ _id, totalCredit }) => {
    const id = String(_id);
    totals[id] = totals[id] || { debit: 0, credit: 0 };
    totals[id].credit += totalCredit;
  });

  // Fetch all accounts that have activity
  const accountIds = Object.keys(totals);
  const accounts   = await ChartOfAccount.find({ _id: { $in: accountIds } })
    .populate('parent', 'name')
    .sort({ type: 1, code: 1 });

  const rows = accounts.map(acc => {
    const t      = totals[String(acc._id)] || { debit: 0, credit: 0 };
    const net    = t.debit - t.credit;
    return {
      _id:    acc._id,
      code:   acc.code,
      name:   acc.name,
      type:   acc.type,
      parent: acc.parent?.name || null,
      debit:  t.debit,
      credit: t.credit,
      net,    // positive = net debit balance; negative = net credit balance
    };
  });

  const grandDebit  = rows.reduce((s, r) => s + r.debit, 0);
  const grandCredit = rows.reduce((s, r) => s + r.credit, 0);

  res.json({ rows, grandDebit, grandCredit, balanced: Math.abs(grandDebit - grandCredit) < 0.01 });
});

// ─── Income Statement ─────────────────────────────────────────────────────────
// @route  GET /api/ledger/income-statement
// @access Private (admin, accountant)
export const getIncomeStatement = asyncHandler(async (req, res) => {
  const { year, startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  else if (year) dateFilter.$gte = new Date(`${year}-01-01`);
  if (endDate)   dateFilter.$lte = new Date(endDate);
  else if (year) dateFilter.$lte = new Date(`${year}-12-31T23:59:59`);
  const dateMatch = Object.keys(dateFilter).length ? { date: dateFilter } : {};

  // Fetch all Income accounts and all Expense accounts from CoA
  const [incomeAccounts, expenseAccounts] = await Promise.all([
    ChartOfAccount.find({ type: 'Income', isActive: true }).lean(),
    ChartOfAccount.find({ type: 'Expense', isActive: true }).lean(),
  ]);

  const incomeIds  = incomeAccounts.map(a => a._id);
  const expenseIds = expenseAccounts.map(a => a._id);

  // For income: credit side increases income
  const [incomeCredits, expenseDebits] = await Promise.all([
    LedgerEntry.aggregate([
      { $match: { isReversed: false, creditAccount: { $in: incomeIds }, ...dateMatch } },
      { $group: { _id: '$creditAccount', total: { $sum: '$amount' } } },
    ]),
    LedgerEntry.aggregate([
      { $match: { isReversed: false, debitAccount: { $in: expenseIds }, ...dateMatch } },
      { $group: { _id: '$debitAccount', total: { $sum: '$amount' } } },
    ]),
  ]);

  const incomeMap  = Object.fromEntries(incomeCredits.map(r  => [String(r._id), r.total]));
  const expenseMap = Object.fromEntries(expenseDebits.map(r => [String(r._id), r.total]));

  const incomeRows  = incomeAccounts.map(a  => ({ ...a, total: incomeMap[String(a._id)]  || 0 }));
  const expenseRows = expenseAccounts.map(a => ({ ...a, total: expenseMap[String(a._id)] || 0 }));

  const totalIncome  = incomeRows.reduce((s, r)  => s + r.total, 0);
  const totalExpense = expenseRows.reduce((s, r) => s + r.total, 0);
  const netSurplus   = totalIncome - totalExpense;

  res.json({
    income:  incomeRows.filter(r => r.total > 0),
    expense: expenseRows.filter(r => r.total > 0),
    totalIncome,
    totalExpense,
    netSurplus,
  });
});

// ─── List all ledger entries (paginated) ─────────────────────────────────────
// @route  GET /api/ledger
// @access Private (admin, accountant)
export const getLedgerEntries = asyncHandler(async (req, res) => {
  const { module: sourceModule, startDate, endDate, page = 1, limit = 30 } = req.query;
  const query = { isReversed: false };

  if (sourceModule) query.sourceModule = sourceModule;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate)   query.date.$lte = new Date(endDate);
  }

  const total = await LedgerEntry.countDocuments(query);
  const entries = await LedgerEntry.find(query)
    .populate('debitAccount', 'name code type')
    .populate('creditAccount', 'name code type')
    .populate('createdBy', 'cnic')
    .sort({ date: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ entries, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// ── Migration: backfill existing data into ledger ─────────────────────────────
// @route  POST /api/ledger/migrate
// @access Private/Admin
export const runMigration = asyncHandler(async (req, res) => {
  console.log(`[Migration] Triggered by user: ${req.user?.cnic}`);
  const summary = await migrateAllToLedger();
  res.json({
    message: `Migration complete. ${summary.totalMigrated} records posted to ledger.`,
    ...summary,
  });
});

// @route  GET /api/ledger/migration-status
// @access Private/Admin
export const getMigrationStatus = asyncHandler(async (req, res) => {
  const [totalEntries, byModule] = await Promise.all([
    LedgerEntry.countDocuments(),
    LedgerEntry.aggregate([
      { $group: { _id: '$sourceModule', count: { $sum: 1 } } }
    ]),
  ]);
  res.json({ totalEntries, byModule });
});
