// backend/utils/migrateToLedger.js
// One-time backfill: reads all existing financial records and posts them
// to the ledger as if they happened today.
// Idempotent: checks for existing entries first to prevent duplicates.

import FeeRecord from '../models/FeeRecord.js';
import Bill from '../models/Bill.js';
import Salary from '../models/Salary.js';
import Donation from '../models/Donation.js';
import LedgerEntry from '../models/LedgerEntry.js';
import ChartOfAccount from '../models/ChartOfAccount.js';
import { postFeeToLedger, postBillToLedger, postSalaryToLedger, postDonationToLedger } from './ledgerService.js';

const alreadyPosted = async (sourceModule, sourceId) => {
  const count = await LedgerEntry.countDocuments({ sourceModule, sourceId });
  return count > 0;
};

export const migrateAllToLedger = async () => {
  const results = {
    fees:      { migrated: 0, skipped: 0, errors: 0 },
    bills:     { migrated: 0, skipped: 0, errors: 0 },
    salaries:  { migrated: 0, skipped: 0, errors: 0 },
    donations: { migrated: 0, skipped: 0, errors: 0 },
  };

  console.log('[Migration] 🚀 Starting ledger backfill...');

  // ── FEES ──────────────────────────────────────────────────────────────────
  console.log('[Migration] Processing fee records...');
  const fees = await FeeRecord.find({ paymentMethod: { $ne: 'Auto' } })
    .populate('studentId', 'name');

  for (const fee of fees) {
    try {
      if (!fee.receivedAmount || fee.receivedAmount <= 0) {
        results.fees.skipped++;
        continue;
      }
      if (await alreadyPosted('Fee', fee._id)) {
        results.fees.skipped++;
        continue;
      }
      await postFeeToLedger(fee);
      results.fees.migrated++;
    } catch (err) {
      console.error(`[Migration] Fee ${fee._id} error:`, err.message);
      results.fees.errors++;
    }
  }

  // ── BILLS ─────────────────────────────────────────────────────────────────
  console.log('[Migration] Processing bills...');
  const bills = await Bill.find({ status: { $in: ['Paid', 'Partial'] } });

  for (const bill of bills) {
    try {
      if (await alreadyPosted('Bill', bill._id)) {
        results.bills.skipped++;
        continue;
      }
      // Try to resolve coaAccount if missing
      if (!bill.coaAccount) {
        let found = null;
        if (bill.category) {
          found = await ChartOfAccount.findOne({
            name: { $regex: new RegExp(`^${bill.category.trim()}$`, 'i') },
            type: 'Expense',
          }).lean();
          if (!found) {
            found = await ChartOfAccount.findOne({
              name: { $regex: new RegExp(bill.category.trim(), 'i') },
              type: 'Expense',
            }).lean();
          }
        }
        if (!found) {
          // Fallback to 'Other Expenses' (code 4007) or any Expense account
          found = await ChartOfAccount.findOne({ code: '4007' }).lean()
               || await ChartOfAccount.findOne({ type: 'Expense' }).lean();
        }
        if (found) {
          bill.coaAccount = found._id;
          await Bill.findByIdAndUpdate(bill._id, { coaAccount: found._id });
        }
      }
      if (!bill.coaAccount) {
        console.warn(`[Migration] Bill "${bill.title}" has no CoA account — skipping.`);
        results.bills.skipped++;
        continue;
      }
      await postBillToLedger(bill);
      results.bills.migrated++;
    } catch (err) {
      console.error(`[Migration] Bill ${bill._id} error:`, err.message);
      results.bills.errors++;
    }
  }

  // ── SALARIES ──────────────────────────────────────────────────────────────
  console.log('[Migration] Processing salaries...');
  const salaries = await Salary.find({ status: { $in: ['Paid', 'Partial Paid'] }, paidAmount: { $gt: 0 } });

  for (const salary of salaries) {
    try {
      if (await alreadyPosted('Salary', salary._id)) {
        results.salaries.skipped++;
        continue;
      }
      await postSalaryToLedger(salary);
      results.salaries.migrated++;
    } catch (err) {
      console.error(`[Migration] Salary ${salary._id} error:`, err.message);
      results.salaries.errors++;
    }
  }

  // ── DONATIONS ─────────────────────────────────────────────────────────────
  console.log('[Migration] Processing donations...');
  const donations = await Donation.find({});

  for (const donation of donations) {
    try {
      if (!donation.donationAmount || donation.donationAmount <= 0) {
        results.donations.skipped++;
        continue;
      }
      if (await alreadyPosted('Donation', donation._id)) {
        results.donations.skipped++;
        continue;
      }
      await postDonationToLedger(donation);
      results.donations.migrated++;
    } catch (err) {
      console.error(`[Migration] Donation ${donation._id} error:`, err.message);
      results.donations.errors++;
    }
  }

  const totalMigrated = Object.values(results).reduce((s, r) => s + r.migrated, 0);
  const totalSkipped  = Object.values(results).reduce((s, r) => s + r.skipped,  0);
  const totalErrors   = Object.values(results).reduce((s, r) => s + r.errors,   0);

  console.log(`[Migration] ✅ Done. Migrated: ${totalMigrated} | Skipped: ${totalSkipped} | Errors: ${totalErrors}`);
  console.log('[Migration] Breakdown:', JSON.stringify(results, null, 2));

  return { results, totalMigrated, totalSkipped, totalErrors };
};
