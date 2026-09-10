// src/pages/FinancialStatements.jsx
// Combined Trial Balance + Income Statement page
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import {
  ScaleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  CheckCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import SyncHistoricalDataModal from '../components/SyncHistoricalDataModal';

const FinancialStatements = () => {
  const { currentTheme } = useTheme();
  const { currentUser } = useContext(UserContext);
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'trial'
  const [year, setYear] = useState(String(currentYear));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [incomeData, setIncomeData] = useState(null);
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(false);

  const currency = n => `PKR ${(n || 0).toLocaleString()}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = startDate && endDate
        ? { startDate, endDate }
        : { year };

      const [incomeRes, trialRes] = await Promise.all([
        api.get('/ledger/income-statement', { params }),
        api.get('/ledger/trial-balance', { params }),
      ]);
      setIncomeData(incomeRes.data);
      setTrialData(trialRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [year, startDate, endDate]);

  useEffect(() => { fetchData(); }, []);

  const inputBase = `rounded-xl border ${currentTheme?.inputBorder || 'border-gray-200'} ${currentTheme?.inputBg || 'bg-white/80'} px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-800'} shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition`;

  const tabs = [
    { key: 'income', label: 'Income Statement',  icon: ArrowTrendingUpIcon },
    { key: 'trial',  label: 'Trial Balance',      icon: ScaleIcon },
  ];

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${currentTheme?.mainBg || 'bg-gray-50'}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${currentTheme?.heroIcon || 'text-emerald-600'}`}>
            Accounting
          </p>
          <h1 className={`text-3xl sm:text-4xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
            Financial Statements
          </h1>
          <p className={`text-sm mt-2 ${currentTheme?.mutedText || 'text-gray-500'}`}>
            Income Statement and Trial Balance generated from the live ledger.
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

      {/* Period selector */}
      <div className={`rounded-2xl p-5 mb-6 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>Year</label>
            <select value={year} onChange={e => { setYear(e.target.value); setStartDate(''); setEndDate(''); }} className={inputBase}>
              {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-400 font-medium self-center">— or custom range —</div>
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputBase} />
          </div>
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${currentTheme?.mutedText || 'text-gray-500'}`}>To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputBase} />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition shadow disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : `${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.text || 'text-gray-700'} border ${currentTheme?.cardBorder || 'border-gray-200'} hover:bg-gray-50`
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={`rounded-2xl p-16 text-center ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'}`}>
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={currentTheme?.mutedText || 'text-gray-500'}>Generating statement...</p>
        </div>
      ) : activeTab === 'income' ? (
        <IncomeStatementView data={incomeData} currency={currency} theme={currentTheme} />
      ) : (
        <TrialBalanceView data={trialData} currency={currency} theme={currentTheme} />
      )}

      {/* Sync Historical Data Modal */}
      <SyncHistoricalDataModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

// ── Income Statement ───────────────────────────────────────────────────────────
const IncomeStatementView = ({ data, currency, theme }) => {
  if (!data) return <p className={theme?.mutedText || 'text-gray-400'}>No data yet. Click Generate.</p>;

  const surplus = data.netSurplus >= 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* Summary cards */}
      <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: currency(data.totalIncome), color: 'emerald', icon: ArrowTrendingUpIcon },
          { label: 'Total Expenses', value: currency(data.totalExpense), color: 'red', icon: ArrowTrendingDownIcon },
          { label: surplus ? 'Net Surplus' : 'Net Deficit', value: currency(Math.abs(data.netSurplus)), color: surplus ? 'emerald' : 'red', icon: ScaleIcon },
        ].map(card => {
          const Icon = card.icon;
          const cc = card.color === 'emerald'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-red-50 border-red-100 text-red-700';
          return (
            <div key={card.label} className={`rounded-2xl p-5 border ${cc} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${cc}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{card.label}</p>
                <p className="text-2xl font-extrabold">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Income table */}
      <div className={`xl:col-span-1 rounded-2xl overflow-hidden ${theme?.cardBg || 'bg-white'} ${theme?.shadow || 'shadow-xl'} border ${theme?.cardBorder || 'border-gray-100'}`}>
        <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="font-bold text-emerald-800 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-4 w-4" /> Income
          </h3>
        </div>
        <table className="w-full text-sm">
          <tbody className={`divide-y ${theme?.cardBorder || 'divide-gray-50'}`}>
            {data.income.length === 0 ? (
              <tr><td colSpan={2} className={`px-5 py-4 text-center ${theme?.mutedText || 'text-gray-400'}`}>No income recorded.</td></tr>
            ) : data.income.map(row => (
              <tr key={row._id} className="hover:bg-gray-50 transition">
                <td className={`px-5 py-3 ${theme?.text || 'text-gray-700'}`}>
                  <p className="font-medium">{row.name}</p>
                  {row.code && <p className="text-xs text-gray-400 font-mono">#{row.code}</p>}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-emerald-700">{currency(row.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-emerald-50 border-t border-emerald-100">
            <tr>
              <td className="px-5 py-3 font-bold text-emerald-800">Total Income</td>
              <td className="px-5 py-3 text-right font-bold text-emerald-800">{currency(data.totalIncome)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Expense table */}
      <div className={`xl:col-span-1 rounded-2xl overflow-hidden ${theme?.cardBg || 'bg-white'} ${theme?.shadow || 'shadow-xl'} border ${theme?.cardBorder || 'border-gray-100'}`}>
        <div className="px-5 py-4 bg-red-50 border-b border-red-100">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <ArrowTrendingDownIcon className="h-4 w-4" /> Expenses
          </h3>
        </div>
        <table className="w-full text-sm">
          <tbody className={`divide-y ${theme?.cardBorder || 'divide-gray-50'}`}>
            {data.expense.length === 0 ? (
              <tr><td colSpan={2} className={`px-5 py-4 text-center ${theme?.mutedText || 'text-gray-400'}`}>No expenses recorded.</td></tr>
            ) : data.expense.map(row => (
              <tr key={row._id} className="hover:bg-gray-50 transition">
                <td className={`px-5 py-3 ${theme?.text || 'text-gray-700'}`}>
                  <p className="font-medium">{row.name}</p>
                  {row.code && <p className="text-xs text-gray-400 font-mono">#{row.code}</p>}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-red-600">{currency(row.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-red-50 border-t border-red-100">
            <tr>
              <td className="px-5 py-3 font-bold text-red-800">Total Expenses</td>
              <td className="px-5 py-3 text-right font-bold text-red-800">{currency(data.totalExpense)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net result */}
      <div className={`xl:col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 ${surplus ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`p-4 rounded-full mb-4 ${surplus ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {surplus
            ? <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
            : <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />}
        </div>
        <p className={`text-sm font-semibold uppercase tracking-wider ${surplus ? 'text-emerald-700' : 'text-red-700'}`}>
          {surplus ? 'Net Surplus' : 'Net Deficit'}
        </p>
        <p className={`text-4xl font-extrabold mt-2 ${surplus ? 'text-emerald-800' : 'text-red-700'}`}>
          {currency(Math.abs(data.netSurplus))}
        </p>
        <p className={`text-xs mt-3 ${surplus ? 'text-emerald-600' : 'text-red-500'}`}>
          {surplus
            ? 'Income exceeds expenses — institute is profitable.'
            : 'Expenses exceed income — review spending.'}
        </p>
      </div>
    </div>
  );
};

// ── Trial Balance ──────────────────────────────────────────────────────────────
const TrialBalanceView = ({ data, currency, theme }) => {
  if (!data) return <p className={theme?.mutedText || 'text-gray-400'}>No data yet. Click Generate.</p>;

  const typeOrder = { Asset: 0, Liability: 1, Income: 2, Expense: 3 };
  const rows = [...(data.rows || [])].sort((a, b) => (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9));
  const grouped = rows.reduce((g, r) => { (g[r.type] = g[r.type] || []).push(r); return g; }, {});

  const typeCfg = {
    Asset:     { color: 'blue',   label: 'Assets' },
    Liability: { color: 'red',    label: 'Liabilities' },
    Income:    { color: 'emerald',label: 'Income' },
    Expense:   { color: 'orange', label: 'Expenses' },
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${theme?.cardBg || 'bg-white'} ${theme?.shadow || 'shadow-xl'} border ${theme?.cardBorder || 'border-gray-100'}`}>
      {/* Balance check banner */}
      <div className={`px-6 py-4 flex items-center gap-3 ${data.balanced ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-amber-50 border-b border-amber-100'}`}>
        {data.balanced
          ? <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          : <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />}
        <p className={`text-sm font-semibold ${data.balanced ? 'text-emerald-800' : 'text-amber-800'}`}>
          {data.balanced ? 'Trial balance is balanced — Total Debits = Total Credits.' : 'Warning: Trial balance is NOT balanced. Check for missing entries.'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${theme?.tableHeader || 'bg-gray-50'} border-b ${theme?.cardBorder || 'border-gray-100'}`}>
              <th className={`text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider ${theme?.mutedText || 'text-gray-500'}`}>Account</th>
              <th className={`text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider ${theme?.mutedText || 'text-gray-500'}`}>Type</th>
              <th className="text-right px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-600">Total Debit</th>
              <th className="text-right px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-red-500">Total Credit</th>
              <th className={`text-right px-6 py-3.5 text-xs font-bold uppercase tracking-wider ${theme?.mutedText || 'text-gray-500'}`}>Net</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme?.cardBorder || 'divide-gray-50'}`}>
            {Object.entries(grouped).map(([type, typeRows]) => {
              const cfg = typeCfg[type] || { color: 'gray', label: type };
              return [
                <tr key={`h-${type}`} className={`bg-${cfg.color}-50`}>
                  <td colSpan={5} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest text-${cfg.color}-700`}>
                    {cfg.label}
                  </td>
                </tr>,
                ...typeRows.map(row => (
                  <tr key={row._id} className="hover:bg-gray-50 transition">
                    <td className={`px-6 py-3 ${theme?.text || 'text-gray-800'}`}>
                      <p className="font-medium">{row.name}</p>
                      {row.code && <p className="text-xs text-gray-400 font-mono">#{row.code}</p>}
                      {row.parent && <p className={`text-xs ${theme?.mutedText || 'text-gray-400'}`}>↳ {row.parent}</p>}
                    </td>
                    <td className={`px-6 py-3 text-${cfg.color}-600 font-semibold text-xs`}>{type}</td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-700">{currency(row.debit)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-red-500">{currency(row.credit)}</td>
                    <td className={`px-6 py-3 text-right font-bold ${row.net >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                      {currency(Math.abs(row.net))}
                      {row.net < 0 && <span className="text-xs ml-1 text-red-400">(Cr)</span>}
                    </td>
                  </tr>
                )),
              ];
            })}
          </tbody>
          <tfoot className={`border-t-2 ${theme?.cardBorder || 'border-gray-200'} ${theme?.tableHeader || 'bg-gray-50'}`}>
            <tr>
              <td colSpan={2} className={`px-6 py-4 font-bold text-sm ${theme?.title || 'text-gray-900'}`}>Grand Total</td>
              <td className="px-6 py-4 text-right font-bold text-emerald-700">{currency(data.grandDebit)}</td>
              <td className="px-6 py-4 text-right font-bold text-red-600">{currency(data.grandCredit)}</td>
              <td className={`px-6 py-4 text-right font-bold ${theme?.title || 'text-gray-900'}`}>
                {currency(Math.abs(data.grandDebit - data.grandCredit))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FinancialStatements;
