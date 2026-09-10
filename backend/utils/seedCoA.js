// backend/utils/seedCoA.js
// Seeds the default Chart of Accounts structure on first run.
// Called from server.js after MongoDB connects.

import ChartOfAccount from '../models/ChartOfAccount.js';

const DEFAULT_COA = [
  // ─── ASSETS ──────────────────────────────────────────────
  { code: '1000', name: 'Assets',            type: 'Asset',     parent: null, isSystem: true,  order: 1 },
  { code: '1100', name: 'Current Assets',    type: 'Asset',     parent: 'Assets', isSystem: true,  order: 1 },
  { code: '1101', name: 'Cash in Hand',      type: 'Asset',     parent: 'Current Assets', isSystem: true,  order: 1 },
  { code: '1102', name: 'Bank Balances',     type: 'Asset',     parent: 'Current Assets', isSystem: false, order: 2 },
  { code: '1200', name: 'Fixed Assets',      type: 'Asset',     parent: 'Assets', isSystem: true,  order: 2 },
  { code: '1201', name: 'Furniture & Equipment', type: 'Asset', parent: 'Fixed Assets', isSystem: false, order: 1 },
  { code: '1202', name: 'Buildings & Land',  type: 'Asset',     parent: 'Fixed Assets', isSystem: false, order: 2 },

  // ─── LIABILITIES ─────────────────────────────────────────
  { code: '2000', name: 'Liabilities',        type: 'Liability', parent: null, isSystem: true,  order: 2 },
  { code: '2100', name: 'Current Liabilities',type: 'Liability', parent: 'Liabilities', isSystem: true, order: 1 },
  { code: '2101', name: 'Accounts Payable',   type: 'Liability', parent: 'Current Liabilities', isSystem: false, order: 1 },

  // ─── INCOME ──────────────────────────────────────────────
  { code: '3000', name: 'Income',             type: 'Income',    parent: null, isSystem: true,  order: 3 },
  { code: '3001', name: 'Student Fees',       type: 'Income',    parent: 'Income', isSystem: true,  order: 1 },
  { code: '3002', name: 'Admission Fees',     type: 'Income',    parent: 'Income', isSystem: true,  order: 2 },
  { code: '3003', name: 'Donations',          type: 'Income',    parent: 'Income', isSystem: true,  order: 3 },
  { code: '3004', name: 'Other Income',       type: 'Income',    parent: 'Income', isSystem: false, order: 4 },

  // ─── EXPENSES ────────────────────────────────────────────
  { code: '4000', name: 'Expenses',           type: 'Expense',   parent: null, isSystem: true,  order: 4 },
  { code: '4001', name: 'Salaries',           type: 'Expense',   parent: 'Expenses', isSystem: true,  order: 1 },
  { code: '4002', name: 'Kitchen',            type: 'Expense',   parent: 'Expenses', isSystem: false, order: 2 },
  { code: '4003', name: 'Utilities',          type: 'Expense',   parent: 'Expenses', isSystem: false, order: 3 },
  { code: '4004', name: 'Repairs & Maintenance', type: 'Expense',parent: 'Expenses', isSystem: false, order: 4 },
  { code: '4005', name: 'Stationery',         type: 'Expense',   parent: 'Expenses', isSystem: false, order: 5 },
  { code: '4006', name: 'Vendor Payments',    type: 'Expense',   parent: 'Expenses', isSystem: false, order: 6 },
  { code: '4007', name: 'Other Expenses',     type: 'Expense',   parent: 'Expenses', isSystem: false, order: 7 },
];

export const seedDefaultCoA = async () => {
  try {
    const count = await ChartOfAccount.countDocuments();
    if (count > 0) {
      console.log('[CoA Seed] Chart of Accounts already seeded — skipping.');
      return;
    }

    console.log('[CoA Seed] Seeding default Chart of Accounts...');

    // First pass: create all top-level accounts (parent = null)
    const nameToId = {};
    const topLevel = DEFAULT_COA.filter(a => a.parent === null);
    for (const acc of topLevel) {
      const created = await ChartOfAccount.create({
        name: acc.name,
        code: acc.code,
        type: acc.type,
        parent: null,
        isSystem: acc.isSystem,
        order: acc.order,
      });
      nameToId[acc.name] = created._id;
    }

    // Second pass: one level deep (parent is a top-level account name)
    const secondLevel = DEFAULT_COA.filter(a => a.parent !== null && topLevel.some(t => t.name === a.parent));
    for (const acc of secondLevel) {
      const created = await ChartOfAccount.create({
        name: acc.name,
        code: acc.code,
        type: acc.type,
        parent: nameToId[acc.parent],
        isSystem: acc.isSystem,
        order: acc.order,
      });
      nameToId[acc.name] = created._id;
    }

    // Third pass: two levels deep
    const thirdLevel = DEFAULT_COA.filter(a => a.parent !== null && secondLevel.some(t => t.name === a.parent));
    for (const acc of thirdLevel) {
      const created = await ChartOfAccount.create({
        name: acc.name,
        code: acc.code,
        type: acc.type,
        parent: nameToId[acc.parent],
        isSystem: acc.isSystem,
        order: acc.order,
      });
      nameToId[acc.name] = created._id;
    }

    console.log(`[CoA Seed] ✅ Seeded ${DEFAULT_COA.length} accounts.`);
  } catch (err) {
    console.error('[CoA Seed] ❌ Error seeding Chart of Accounts:', err.message);
  }
};
