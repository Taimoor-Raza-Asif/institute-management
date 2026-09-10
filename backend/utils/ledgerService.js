// backend/utils/ledgerService.js
// Central service for posting and reversing double-entry ledger entries.
// Called from fee, billing, salary, and donation controllers.

import LedgerEntry from '../models/LedgerEntry.js';
import ChartOfAccount from '../models/ChartOfAccount.js';

// ─── System account cache (populated on first use) ───────────────────────────
let _systemAccounts = null;

const getSystemAccounts = async () => {
  if (_systemAccounts) return _systemAccounts;

  const accounts = await ChartOfAccount.find({
    code: { $in: ['1101', '1102', '3001', '3002', '3003', '4001'] },
  }).lean();

  const byCode = {};
  accounts.forEach(a => { byCode[a.code] = a._id; });

  _systemAccounts = {
    cashInHand:   byCode['1101'], // Asset  — Cash in Hand
    bankBalances: byCode['1102'], // Asset  — Bank Balances
    studentFees:  byCode['3001'], // Income — Student Fees
    admissionFees:byCode['3002'], // Income — Admission Fees
    donations:    byCode['3003'], // Income — Donations
    salaries:     byCode['4001'], // Expense— Salaries
  };

  return _systemAccounts;
};

// Call this if accounts are re-seeded to bust the cache
export const clearSystemAccountCache = () => { _systemAccounts = null; };

// ─── Helper: map payment method → asset CoA account ──────────────────────────
const paymentMethodToAccount = (method, sys) => {
  if (!method) return sys.cashInHand;
  const m = method.toLowerCase();
  if (m === 'cash' || m === 'deposited cash') return sys.cashInHand;
  // Bank transfer, online wallet, easypaisa, jazzcash, cheque, bank → bank balances
  return sys.bankBalances;
};

// ─── Core posting function ───────────────────────────────────────────────────
/**
 * Post a double-entry to the ledger.
 * Never throws — always logs and returns null on failure so the main save isn't blocked.
 */
export const postToLedger = async ({
  date,
  description,
  debitAccountId,
  creditAccountId,
  amount,
  sourceModule,
  sourceId = null,
  createdBy = null,
}) => {
  try {
    if (!debitAccountId || !creditAccountId) {
      console.warn('[Ledger] Missing debit or credit account — skipping entry.');
      return null;
    }
    if (!amount || amount <= 0) {
      console.warn('[Ledger] Zero or negative amount — skipping entry.');
      return null;
    }

    const entry = await LedgerEntry.create({
      date: date || new Date(),
      description,
      debitAccount: debitAccountId,
      creditAccount: creditAccountId,
      amount,
      sourceModule,
      sourceId,
      createdBy,
    });

    console.log(`[Ledger] ✅ Posted: ${sourceModule} | ${description} | PKR ${amount}`);
    return entry;
  } catch (err) {
    console.error('[Ledger] ❌ Failed to post entry:', err.message);
    return null;
  }
};

// ─── Reversal function ───────────────────────────────────────────────────────
/**
 * Reverse all non-reversed ledger entries for a given sourceModule + sourceId.
 * Creates mirror entries (debit ↔ credit swapped) and marks originals as reversed.
 */
export const reverseEntries = async ({ sourceModule, sourceId, createdBy = null, reason = 'Reversal' }) => {
  try {
    const originals = await LedgerEntry.find({ sourceModule, sourceId, isReversed: false });
    if (originals.length === 0) return;

    for (const orig of originals) {
      // Mark original as reversed
      await LedgerEntry.findByIdAndUpdate(orig._id, { isReversed: true });

      // Create mirror entry (swap debit/credit)
      await LedgerEntry.create({
        date: new Date(),
        description: `${reason} — ${orig.description}`,
        debitAccount: orig.creditAccount,   // swapped
        creditAccount: orig.debitAccount,   // swapped
        amount: orig.amount,
        sourceModule: orig.sourceModule,
        sourceId: orig.sourceId,
        createdBy,
        isReversed: false,
        reversalOf: orig._id,
      });
    }
    console.log(`[Ledger] ↩️  Reversed ${originals.length} entr${originals.length > 1 ? 'ies' : 'y'} for ${sourceModule}/${sourceId}`);
  } catch (err) {
    console.error('[Ledger] ❌ Reversal failed:', err.message);
  }
};

// ─── Module-specific posting helpers ─────────────────────────────────────────

/**
 * Post ledger entry for a fee payment.
 * Debit: Cash/Bank (asset) | Credit: Student Fees (income) or Admission Fees
 */
export const postFeeToLedger = async (feeRecord) => {
  try {
    const sys = await getSystemAccounts();
    const assetAccount = paymentMethodToAccount(feeRecord.paymentMethod, sys);

    const studentName = feeRecord.studentId?.name || feeRecord.studentId?.toString?.() || 'Student';

    const promises = [];

    // Regular fee amount
    const regularAmount = feeRecord.receivedAmount - (feeRecord.admissionFee || 0);
    if (regularAmount > 0) {
      promises.push(postToLedger({
        date: feeRecord.receivedDate || feeRecord.createdAt,
        description: `Fee received — ${studentName} — ${feeRecord.month} ${feeRecord.year}`,
        debitAccountId: assetAccount,
        creditAccountId: sys.studentFees,
        amount: regularAmount,
        sourceModule: 'Fee',
        sourceId: feeRecord._id,
        createdBy: feeRecord.createdBy || null,
      }));
    }

    // Admission fee (separate entry)
    if (feeRecord.admissionFee > 0) {
      promises.push(postToLedger({
        date: feeRecord.receivedDate || feeRecord.createdAt,
        description: `Admission fee — ${studentName}`,
        debitAccountId: assetAccount,
        creditAccountId: sys.admissionFees,
        amount: feeRecord.admissionFee,
        sourceModule: 'Fee',
        sourceId: feeRecord._id,
        createdBy: feeRecord.createdBy || null,
      }));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error('[Ledger] Fee posting error:', err.message);
  }
};

/**
 * Post ledger entry for a bill payment.
 * Debit: Expense account (from CoA) | Credit: Cash/Bank (asset)
 */
export const postBillToLedger = async (bill) => {
  try {
    if (!['Paid', 'Partial'].includes(bill.status)) return;

    const sys = await getSystemAccounts();
    const assetAccount = paymentMethodToAccount(bill.paymentMethod, sys);

    // Use the linked CoA expense account, or fall back to looking up by category name
    let expenseAccountId = bill.coaAccount || null;
    if (!expenseAccountId && bill.category) {
      let found = await ChartOfAccount.findOne({
        name: { $regex: new RegExp(`^${bill.category.trim()}$`, 'i') },
        type: 'Expense',
      }).lean();
      if (!found) {
        found = await ChartOfAccount.findOne({
          name: { $regex: new RegExp(bill.category.trim(), 'i') },
          type: 'Expense',
        }).lean();
      }
      expenseAccountId = found?._id || null;
    }

    if (!expenseAccountId) {
      // Fallback to 'Other Expenses' (4007) or any Expense account
      const fallback = await ChartOfAccount.findOne({ code: '4007' }).lean()
                    || await ChartOfAccount.findOne({ type: 'Expense' }).lean();
      expenseAccountId = fallback?._id || null;
    }

    if (!expenseAccountId) {
      console.warn(`[Ledger] Bill "${bill.title}" has no CoA account — skipping ledger entry.`);
      return;
    }

    await postToLedger({
      date: bill.paymentDate || bill.billDate || bill.createdAt,
      description: `Bill paid — ${bill.title}`,
      debitAccountId: expenseAccountId,   // Expense increases (debit)
      creditAccountId: assetAccount,       // Cash/Bank decreases (credit)
      amount: bill.amount,
      sourceModule: 'Bill',
      sourceId: bill._id,
      createdBy: bill.markedBy || null,
    });
  } catch (err) {
    console.error('[Ledger] Bill posting error:', err.message);
  }
};

/**
 * Post ledger entry for a salary payment.
 * Debit: Salaries (expense) | Credit: Cash/Bank (asset)
 */
export const postSalaryToLedger = async (salary) => {
  try {
    if (!['Paid', 'Partial Paid'].includes(salary.status)) return;
    if (!salary.paidAmount || salary.paidAmount <= 0) return;

    const sys = await getSystemAccounts();
    const assetAccount = paymentMethodToAccount(salary.paidAs, sys);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthLabel = monthNames[(salary.month || 1) - 1] || salary.month;

    await postToLedger({
      date: salary.paidAt || salary.createdAt,
      description: `Salary — ${salary.staffName} — ${monthLabel} ${salary.year}`,
      debitAccountId: sys.salaries,       // Salary expense increases (debit)
      creditAccountId: assetAccount,       // Cash/Bank decreases (credit)
      amount: salary.paidAmount,
      sourceModule: 'Salary',
      sourceId: salary._id,
      createdBy: salary.paidBy || null,
    });
  } catch (err) {
    console.error('[Ledger] Salary posting error:', err.message);
  }
};

/**
 * Post ledger entry for a donation.
 * Debit: Cash/Bank (asset) | Credit: Donations (income)
 */
export const postDonationToLedger = async (donation) => {
  try {
    const sys = await getSystemAccounts();
    const assetAccount = paymentMethodToAccount(donation.paymentMethod, sys);

    await postToLedger({
      date: donation.donationDate || donation.createdAt,
      description: `Donation — ${donation.donorName || 'Anonymous'} — ${donation.donationPurpose || ''}`.trim(),
      debitAccountId: assetAccount,        // Cash/Bank increases (debit)
      creditAccountId: sys.donations,      // Donation income increases (credit)
      amount: donation.donationAmount,
      sourceModule: 'Donation',
      sourceId: donation._id,
      createdBy: donation.markedBy || null,
    });
  } catch (err) {
    console.error('[Ledger] Donation posting error:', err.message);
  }
};
