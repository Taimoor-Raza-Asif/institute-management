// frontend/src/components/SyncHistoricalDataModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  HeartIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const SyncHistoricalDataModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentTheme } = useTheme();

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const { data } = await api.get('/ledger/migration-status');
      setCurrentStatus(data);
    } catch (err) {
      console.error('Failed to fetch migration status:', err);
      setError(err.response?.data?.message || 'Could not fetch ledger status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMigrationResult(null);
      setError(null);
      fetchStatus();
    }
  }, [isOpen]);

  const handleRunMigration = async () => {
    setMigrating(true);
    setError(null);
    try {
      const { data } = await api.post('/ledger/migrate');
      setMigrationResult(data);
      if (onSuccess) {
        onSuccess();
      }
      // Refresh status counts
      await fetchStatus();
    } catch (err) {
      console.error('Migration failed:', err);
      setError(err.response?.data?.message || 'Failed to sync historical data into ledger.');
    } finally {
      setMigrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all transform animate-fadeIn ${
          currentTheme?.cardBg || 'bg-white'
        } ${currentTheme?.cardBorder || 'border-gray-200'}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <ArrowPathIcon className={`h-6 w-6 ${migrating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${currentTheme?.title || 'text-gray-900'}`}>
                Sync Historical Data to Ledger
              </h3>
              <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'} mt-0.5`}>
                Backfill past fees, bills, salaries, and donations safely
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={migrating}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Explanation Alert */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheckIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <p className="font-semibold text-emerald-800 dark:text-emerald-100">
                Idempotent & Safe — Zero Data Loss Guaranteed
              </p>
              <p className="mt-1 text-xs opacity-90">
                This utility scans all existing transactions in the database and creates corresponding double-entry ledger records with their original transaction dates. Any transaction that has already been posted to the ledger will be automatically skipped, preventing any duplicate records.
              </p>
            </div>
          </div>

          {/* Current Ledger Status */}
          <div className={`p-4 rounded-xl border ${currentTheme?.cardBorder || 'border-gray-200'} bg-gray-50/50 dark:bg-gray-800/40`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${currentTheme?.mutedText || 'text-gray-500'}`}>
                Current Ledger Status
              </span>
              {loadingStatus && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> Checking...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <DocumentDuplicateIcon className="h-3.5 w-3.5 text-blue-500" /> Total Posted
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {currentStatus?.totalEntries ?? '—'}
                </p>
              </div>

              {['Fee', 'Bill', 'Salary', 'Donation'].map((mod) => {
                const count = currentStatus?.byModule?.find((m) => m._id === mod)?.count || 0;
                const iconMap = {
                  Fee: <ReceiptPercentIcon className="h-3.5 w-3.5 text-emerald-500" />,
                  Bill: <BanknotesIcon className="h-3.5 w-3.5 text-orange-500" />,
                  Salary: <BriefcaseIcon className="h-3.5 w-3.5 text-purple-500" />,
                  Donation: <HeartIcon className="h-3.5 w-3.5 text-pink-500" />,
                };
                return (
                  <div key={mod} className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      {iconMap[mod]} {mod}s
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Migration Results Banner */}
          {migrationResult && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-sm">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <span>{migrationResult.message}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {Object.entries(migrationResult.results || {}).map(([key, res]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                    <p className="font-semibold capitalize text-gray-700 dark:text-gray-300">{key}</p>
                    <p className="text-emerald-600 font-bold mt-0.5">+{res.migrated} added</p>
                    <p className="text-gray-400 mt-0.5">{res.skipped} skipped</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={migrating}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${
              currentTheme?.cardBorder || 'border-gray-300'
            } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50`}
          >
            {migrationResult ? 'Close' : 'Cancel'}
          </button>

          <button
            onClick={handleRunMigration}
            disabled={migrating}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:shadow-lg transition transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {migrating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                <span>Run Historical Data Sync</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncHistoricalDataModal;
