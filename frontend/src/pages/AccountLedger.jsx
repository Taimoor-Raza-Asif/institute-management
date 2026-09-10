// src/pages/AccountLedger.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpenIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon,
  FunnelIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import SyncHistoricalDataModal from '../components/SyncHistoricalDataModal';

const AccountLedger = () => {
  const { currentTheme } = useTheme();
  const { currentUser } = useContext(UserContext);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  // Load all accounts for the dropdown
  useEffect(() => {
    api.get('/coa', { params: { activeOnly: 'true' } })
      .then(r => setAccounts(r.data))
      .catch(console.error)
      .finally(() => setAccountsLoading(false));
  }, []);

  const fetchLedger = useCallback(async (accId, pg = 1) => {
    if (!accId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/ledger/account/${accId}`, {
        params: { page: pg, limit: 30, ...filters },
      });
      setLedgerData(data);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
    setLedgerData(null);
    setPage(1);
    fetchLedger(e.target.value, 1);
  };

  const currency = n => `PKR ${(n || 0).toLocaleString()}`;

  const inputBase = `w-full rounded-xl border ${currentTheme?.inputBorder || 'border-gray-200'} ${currentTheme?.inputBg || 'bg-white/80'} px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-800'} shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition`;

  const typeColor = {
    Asset:     'text-blue-600',
    Liability: 'text-red-600',
    Income:    'text-emerald-600',
    Expense:   'text-orange-600',
  };

  // Group accounts by type for the select dropdown
  const grouped = accounts.reduce((g, acc) => {
    (g[acc.type] = g[acc.type] || []).push(acc);
    return g;
  }, {});

  const account = ledgerData?.account;
  const entries = ledgerData?.entries || [];
  const pagination = ledgerData?.pagination;

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${currentTheme?.mainBg || 'bg-gray-50'}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${currentTheme?.heroIcon || 'text-emerald-600'}`}>
            Accounting
          </p>
          <h1 className={`text-3xl sm:text-4xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
            Account Ledger
          </h1>
          <p className={`text-sm mt-2 ${currentTheme?.mutedText || 'text-gray-500'}`}>
            View all transactions for any account with a running balance.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition shadow-sm hover:shadow"
          >
            <SparklesIcon className="h-4 w-4 text-emerald-600" />
            <span>Sync Historical Data</span>
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className={`rounded-2xl p-5 mb-6 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Account selector */}
          <div className="md:col-span-2">
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>
              Select Account
            </label>
            <select value={selectedAccountId} onChange={handleAccountChange} disabled={accountsLoading} className={inputBase}>
              <option value="">{accountsLoading ? 'Loading accounts...' : '— Choose an account —'}</option>
              {Object.entries(grouped).map(([type, accs]) => (
                <optgroup key={type} label={`── ${type}s ──`}>
                  {accs.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.code ? `[${acc.code}] ` : ''}{acc.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>From</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className={inputBase} />
          </div>
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>To</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className={inputBase} />
          </div>
        </div>
        {selectedAccountId && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => fetchLedger(selectedAccountId, 1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition shadow"
            >
              <FunnelIcon className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {/* Account summary card */}
      {account && !loading && (
        <div className={`rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-6 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <div>
            <p className={`text-xs font-semibold ${currentTheme?.mutedText || 'text-gray-500'} uppercase tracking-wider`}>Account</p>
            <p className={`text-xl font-bold ${currentTheme?.title || 'text-gray-900'}`}>{account.name}</p>
            {account.code && <p className={`text-xs font-mono ${currentTheme?.mutedText || 'text-gray-400'}`}>#{account.code}</p>}
          </div>
          <div>
            <p className={`text-xs font-semibold ${currentTheme?.mutedText || 'text-gray-500'} uppercase tracking-wider`}>Type</p>
            <p className={`text-base font-bold ${typeColor[account.type] || 'text-gray-700'}`}>{account.type}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-xs font-semibold ${currentTheme?.mutedText || 'text-gray-500'} uppercase tracking-wider`}>Total Entries</p>
            <p className={`text-xl font-bold ${currentTheme?.title || 'text-gray-900'}`}>{pagination?.total || 0}</p>
          </div>
          {entries.length > 0 && (
            <div className="text-right">
              <p className={`text-xs font-semibold ${currentTheme?.mutedText || 'text-gray-500'} uppercase tracking-wider`}>Closing Balance</p>
              <p className={`text-xl font-bold ${entries[entries.length - 1]?.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {currency(Math.abs(entries[entries.length - 1]?.balance || 0))}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ledger table */}
      {!selectedAccountId ? (
        <div className={`rounded-2xl p-12 text-center ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <BookOpenIcon className={`h-12 w-12 mx-auto mb-3 ${currentTheme?.mutedText || 'text-gray-300'}`} />
          <p className={`text-lg font-semibold ${currentTheme?.title || 'text-gray-700'}`}>Select an account to view its ledger</p>
          <p className={`text-sm mt-1 ${currentTheme?.mutedText || 'text-gray-400'}`}>Choose any account from the dropdown above.</p>
        </div>
      ) : loading ? (
        <div className={`rounded-2xl p-12 text-center ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={currentTheme?.mutedText || 'text-gray-500'}>Loading ledger...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <BookOpenIcon className={`h-12 w-12 mx-auto mb-3 ${currentTheme?.mutedText || 'text-gray-300'}`} />
          <p className={`text-lg font-semibold ${currentTheme?.title || 'text-gray-700'}`}>No transactions found</p>
          <p className={`text-sm mt-1 ${currentTheme?.mutedText || 'text-gray-400'}`}>No ledger entries for this account in the selected period.</p>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${currentTheme?.tableHeader || 'bg-gray-50'} border-b ${currentTheme?.cardBorder || 'border-gray-100'}`}>
                  <th className={`text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${currentTheme?.mutedText || 'text-gray-500'}`}>Date</th>
                  <th className={`text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${currentTheme?.mutedText || 'text-gray-500'}`}>Description</th>
                  <th className={`text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${currentTheme?.mutedText || 'text-gray-500'}`}>Module</th>
                  <th className={`text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-600`}>Debit</th>
                  <th className={`text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-red-500`}>Credit</th>
                  <th className={`text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider ${currentTheme?.mutedText || 'text-gray-500'}`}>Balance</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${currentTheme?.cardBorder || 'divide-gray-50'}`}>
                {entries.map((entry, i) => (
                  <tr key={entry._id} className={`hover:${currentTheme?.tableRowHover || 'bg-gray-50/50'} transition`}>
                    <td className={`px-5 py-3.5 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>
                      {new Date(entry.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`px-5 py-3.5 ${currentTheme?.text || 'text-gray-800'} font-medium max-w-xs`}>
                      <p className="truncate">{entry.description}</p>
                      <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-400'}`}>
                        vs. {entry.debit > 0 ? entry.creditAccount?.name : entry.debitAccount?.name}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        entry.sourceModule === 'Fee' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        entry.sourceModule === 'Bill' ? 'bg-red-50 text-red-700 border border-red-100' :
                        entry.sourceModule === 'Salary' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        entry.sourceModule === 'Donation' ? 'bg-pink-50 text-pink-700 border border-pink-100' :
                        'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}>
                        {entry.sourceModule}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                      {entry.debit > 0 ? currency(entry.debit) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-500">
                      {entry.credit > 0 ? currency(entry.credit) : '—'}
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold ${entry.balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {currency(Math.abs(entry.balance))}
                      {entry.balance < 0 && <span className="text-xs ml-1">(Cr)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={`flex items-center justify-between px-5 py-3 border-t ${currentTheme?.cardBorder || 'border-gray-100'}`}>
              <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'}`}>
                Page {pagination.page} of {pagination.pages} · {pagination.total} total entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchLedger(selectedAccountId, page - 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => fetchLedger(selectedAccountId, page + 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Sync Historical Data Modal */}
      <SyncHistoricalDataModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => {
          if (selectedAccountId) {
            fetchLedger(selectedAccountId, page);
          }
        }}
      />
    </div>
  );
};

export default AccountLedger;
