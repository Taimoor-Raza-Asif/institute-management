// backend/routes/ledgerRoutes.js
import express from 'express';
import {
  getLedgerEntries,
  getAccountLedger,
  getTrialBalance,
  getIncomeStatement,
  runMigration,
  getMigrationStatus,
} from '../controllers/ledgerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('admin', 'accountant')];
const adminOnly = [protect, authorizeRoles('admin')];

router.get('/',                      ...auth, getLedgerEntries);
router.get('/trial-balance',         ...auth, getTrialBalance);
router.get('/income-statement',      ...auth, getIncomeStatement);
router.get('/account/:coaId',        ...auth, getAccountLedger);
router.get('/migration-status',      ...adminOnly, getMigrationStatus);
router.post('/migrate',              ...adminOnly, runMigration);

export default router;
