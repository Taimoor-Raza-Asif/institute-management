// src/pages/ChartOfAccounts.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import {
  PlusCircleIcon, PencilIcon, TrashIcon, ChevronRightIcon,
  ChevronDownIcon, LockClosedIcon, BuildingLibraryIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon,
  BanknotesIcon, XMarkIcon, MagnifyingGlassIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import SyncHistoricalDataModal from '../components/SyncHistoricalDataModal';

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Income', 'Expense'];

const TYPE_CONFIG = {
  Asset:     { label: 'Assets',      color: 'blue',   icon: BuildingLibraryIcon },
  Liability: { label: 'Liabilities', color: 'red',    icon: ScaleIcon },
  Income:    { label: 'Income',      color: 'emerald', icon: ArrowTrendingUpIcon },
  Expense:   { label: 'Expenses',    color: 'orange', icon: ArrowTrendingDownIcon },
};

const COLOR_CLASSES = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-800',    icon: 'text-blue-600',    head: 'bg-blue-600' },
  red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     badge: 'bg-red-100 text-red-800',     icon: 'text-red-600',     head: 'bg-red-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', icon: 'text-emerald-600', head: 'bg-emerald-600' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-800',  icon: 'text-orange-600',  head: 'bg-orange-600' },
};

const emptyForm = { name: '', code: '', type: 'Expense', parent: '', description: '' };

// ─── Recursive account row ────────────────────────────────────────────────────
const AccountRow = ({ account, depth, color, isAdmin, onEdit, onDelete, searchTerm }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = account.children?.length > 0;
  const cc = COLOR_CLASSES[color];

  // Highlight search match
  const highlight = (text) => {
    if (!searchTerm) return text;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 rounded px-0.5">{text.slice(idx, idx + searchTerm.length)}</mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  return (
    <>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg group transition-all ${depth > 0 ? 'hover:bg-gray-50' : ''}`}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded ${hasChildren ? 'hover:bg-gray-200' : 'invisible'}`}
        >
          {hasChildren ? (
            open
              ? <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
              : <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
          ) : null}
        </button>

        {/* Code badge */}
        {account.code && (
          <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${cc.badge} flex-shrink-0`}>
            {account.code}
          </span>
        )}

        {/* Name */}
        <span className={`flex-1 text-sm ${depth === 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>
          {highlight(account.name)}
        </span>

        {/* System lock */}
        {account.isSystem && (
          <LockClosedIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" title="System account — cannot delete" />
        )}

        {/* Inactive badge */}
        {!account.isActive && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200 flex-shrink-0">
            Inactive
          </span>
        )}

        {/* Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(account)}
              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition"
              title="Edit account"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
            {!account.isSystem && (
              <button
                onClick={() => onDelete(account)}
                className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                title="Delete account"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className={`border-l-2 ml-7 ${cc.border}`}>
          {account.children.map(child => (
            <AccountRow
              key={child._id}
              account={child}
              depth={depth + 1}
              color={color}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ChartOfAccounts = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [tree, setTree] = useState({});
  const [flatAccounts, setFlatAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get('/coa/tree'),
        api.get('/coa'),
      ]);
      setTree(treeRes.data);
      setFlatAccounts(flatRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Chart of Accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  // Filter flat accounts for parent dropdown — same type, active only
  const parentOptions = flatAccounts.filter(
    a => a.type === formData.type && a.isActive && (!editingAccount || String(a._id) !== String(editingAccount._id))
  );

  const openAddModal = (presetType = 'Expense') => {
    setEditingAccount(null);
    setFormData({ ...emptyForm, type: presetType });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      code: account.code || '',
      type: account.type,
      parent: account.parent?._id || account.parent || '',
      description: account.description || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset parent when type changes — parent must match type
      ...(name === 'type' ? { parent: '' } : {}),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        parent: formData.parent || null,
        description: formData.description,
      };
      if (editingAccount) {
        await api.put(`/coa/${editingAccount._id}`, payload);
        setSuccess('Account updated successfully.');
      } else {
        await api.post('/coa', payload);
        setSuccess('Account created successfully.');
      }
      setShowModal(false);
      fetchTree();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/coa/${deleteTarget._id}`);
      setSuccess(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchTree();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter the tree by search term
  const filterTree = (accounts) => {
    if (!searchTerm) return accounts;
    return accounts.reduce((acc, node) => {
      const filteredChildren = filterTree(node.children || []);
      if (
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.code && node.code.includes(searchTerm)) ||
        filteredChildren.length > 0
      ) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const inputBase = `w-full rounded-xl border ${currentTheme?.inputBorder || 'border-gray-200'} ${currentTheme?.inputBg || 'bg-white/80'} px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-800'} shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition`;
  const labelBase = `text-sm font-semibold ${currentTheme?.subtitle || 'text-gray-700'} mb-1 block`;

  const totalAccounts = flatAccounts.length;

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${currentTheme?.mainBg || 'bg-gray-50'}`}>

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${currentTheme?.heroIcon || 'text-emerald-600'}`}>
            Accounting
          </p>
          <h1 className={`text-3xl sm:text-4xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
            Chart of Accounts
          </h1>
          <p className={`text-sm mt-2 ${currentTheme?.mutedText || 'text-gray-500'} max-w-xl`}>
            The full hierarchical structure of all financial accounts — Assets, Liabilities, Income, and Expenses. Every transaction in the system traces back to an account here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow'} border ${currentTheme?.cardBorder || 'border-gray-100'} ${currentTheme?.mutedText || 'text-gray-600'}`}>
            <BanknotesIcon className="h-4 w-4 inline mr-1.5 text-emerald-500" />
            {totalAccounts} accounts
          </div>
          {isAdmin && (
            <>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition shadow-sm hover:shadow"
              >
                <SparklesIcon className="h-4 w-4 text-emerald-600" />
                <span>Sync Historical Data</span>
              </button>
              <button
                onClick={() => openAddModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Add Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────── */}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <span>✓</span> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Search ───────────────────────────────────────────── */}
      <div className={`relative mb-6 max-w-sm`}>
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputBase} pl-9`}
        />
      </div>

      {/* ── Account Tree ─────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={currentTheme?.mutedText || 'text-gray-500'}>Loading Chart of Accounts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {ACCOUNT_TYPES.map(type => {
            const cfg = TYPE_CONFIG[type];
            const cc = COLOR_CLASSES[cfg.color];
            const Icon = cfg.icon;
            const typeTree = filterTree(tree[type] || []);
            const typeCount = flatAccounts.filter(a => a.type === type).length;

            return (
              <div
                key={type}
                className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} border ${currentTheme?.cardBorder || 'border-gray-100'} overflow-hidden`}
              >
                {/* Section header */}
                <div className={`flex items-center justify-between px-5 py-4 ${cc.bg} border-b ${cc.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${cc.bg} border ${cc.border}`}>
                      <Icon className={`h-5 w-5 ${cc.icon}`} />
                    </div>
                    <div>
                      <h2 className={`font-bold text-base ${cc.text}`}>{cfg.label}</h2>
                      <p className={`text-xs ${cc.text} opacity-70`}>{typeCount} accounts</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => openAddModal(type)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${cc.text} ${cc.bg} ${cc.border} hover:opacity-80`}
                    >
                      <PlusCircleIcon className="h-3.5 w-3.5" />
                      Add
                    </button>
                  )}
                </div>

                {/* Account rows */}
                <div className="p-3">
                  {typeTree.length === 0 ? (
                    <p className={`text-sm text-center py-6 ${currentTheme?.mutedText || 'text-gray-400'}`}>
                      {searchTerm ? 'No accounts match your search.' : 'No accounts yet.'}
                    </p>
                  ) : (
                    typeTree.map(account => (
                      <AccountRow
                        key={account._id}
                        account={account}
                        depth={0}
                        color={cfg.color}
                        isAdmin={isAdmin}
                        onEdit={openEditModal}
                        onDelete={setDeleteTarget}
                        searchTerm={searchTerm}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-lg rounded-2xl ${currentTheme?.cardBg || 'bg-white'} shadow-2xl overflow-hidden`}>

            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    {editingAccount ? 'Edit Account' : 'New Account'}
                  </p>
                  <h2 className={`text-2xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
                    {editingAccount ? editingAccount.name : 'Add Account'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className={labelBase}>Account Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Motor / Borewell, Chairs"
                    className={inputBase}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className={labelBase}>Account Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      required
                      disabled={editingAccount?.isSystem}
                      className={inputBase}
                    >
                      {ACCOUNT_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t === 'Asset' ? '🏦 Asset' : t === 'Liability' ? '⚖️ Liability' : t === 'Income' ? '📈 Income' : '📉 Expense'}
                        </option>
                      ))}
                    </select>
                    {editingAccount?.isSystem && (
                      <p className="text-xs text-amber-600 mt-1">System accounts cannot change type.</p>
                    )}
                  </div>

                  {/* Account Code */}
                  <div>
                    <label className={labelBase}>Account Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleFormChange}
                      placeholder="e.g. 4008 (optional)"
                      className={inputBase}
                    />
                  </div>
                </div>

                {/* Parent Account */}
                <div>
                  <label className={labelBase}>Sub-account of</label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleFormChange}
                    className={inputBase}
                  >
                    <option value="">— Top-level account (no parent) —</option>
                    {parentOptions.map(acc => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code ? `[${acc.code}] ` : ''}{acc.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.parent
                      ? 'This account will appear nested under the selected parent.'
                      : 'Leave blank to create a top-level account head.'}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className={labelBase}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={2}
                    placeholder="Optional notes about this account..."
                    className={`${inputBase} resize-none`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-60"
                  >
                    {formLoading ? 'Saving...' : editingAccount ? 'Save Changes' : 'Add Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ───────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl ${currentTheme?.cardBg || 'bg-white'} shadow-2xl p-6 text-center`}>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-50 border border-red-100">
                <TrashIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className={`text-xl font-bold ${currentTheme?.title || 'text-gray-900'} mb-2`}>Delete Account?</h3>
            <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'} mb-6`}>
              Permanently delete <strong>"{deleteTarget.name}"</strong>?
              This cannot be undone. Accounts with sub-accounts cannot be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Historical Data Modal */}
      <SyncHistoricalDataModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={fetchTree}
      />
    </div>
  );
};

export default ChartOfAccounts;
