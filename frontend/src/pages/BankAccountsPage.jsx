// src/pages/BankAccountsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  PlusCircleIcon, PencilIcon, TrashIcon, CheckCircleIcon,
  XCircleIcon, BanknotesIcon, WalletIcon, CreditCardIcon,
  BuildingLibraryIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = ['Bank', 'Mobile Wallet'];

const emptyForm = {
  name: '',
  type: 'Bank',
  accountNumber: '',
  bankName: '',
  holderName: '',
  description: '',
  isActive: true,
};

const typeIcon = (type) => {
  if (type === 'Bank') return <BuildingLibraryIcon className="h-5 w-5" />;
  if (type === 'Mobile Wallet') return <WalletIcon className="h-5 w-5" />;
  return <CreditCardIcon className="h-5 w-5" />;
};

const typeBadgeColor = (type) => {
  if (type === 'Bank') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (type === 'Mobile Wallet') return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const BankAccountsPage = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/bank-accounts', {
        params: { includeInactive: 'true' },
      });
      setAccounts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
      holderName: account.holderName || '',
      description: account.description || '',
      isActive: account.isActive,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingAccount) {
        await api.put(`/bank-accounts/${editingAccount._id}`, formData);
        setSuccess('Account updated successfully.');
      } else {
        await api.post('/bank-accounts', formData);
        setSuccess('Account created successfully.');
      }
      setShowModal(false);
      fetchAccounts();
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
      await api.delete(`/bank-accounts/${deleteTarget._id}`);
      setSuccess(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (account) => {
    try {
      await api.put(`/bank-accounts/${account._id}`, { isActive: !account.isActive });
      fetchAccounts();
    } catch (err) {
      setError('Failed to update account status.');
    }
  };

  // Group accounts by type
  const grouped = ACCOUNT_TYPES.reduce((acc, type) => {
    acc[type] = accounts.filter(a => a.type === type);
    return acc;
  }, {});

  const inputBase = `w-full rounded-lg border ${currentTheme?.inputBorder || 'border-gray-200'} ${currentTheme?.inputBg || 'bg-white/80'} px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-800'} shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition`;
  const labelBase = `text-sm font-semibold ${currentTheme?.subtitle || 'text-gray-700'} mb-1 block`;

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${currentTheme?.mainBg || 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${currentTheme?.heroIcon || 'text-emerald-600'}`}>
            Configuration
          </p>
          <h1 className={`text-3xl sm:text-4xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
            Accounts &amp; Wallets
          </h1>
          <p className={`text-sm mt-2 ${currentTheme?.mutedText || 'text-gray-500'} max-w-xl`}>
            Manage all payment accounts — bank accounts, mobile wallets, and cash — used across billing and salary modules.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add Account
          </button>
        )}
      </div>

      {success && <Message type="success">{success}</Message>}
      {error && <Message type="error">{error}</Message>}
      {loading && <Loader />}

      {/* Accounts Grid by Type */}
      {!loading && (
        <div className="space-y-8">
          {ACCOUNT_TYPES.map(type => (
            <div key={type}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${currentTheme?.title || 'text-gray-800'}`}>
                <span className={`p-1.5 rounded-lg ${type === 'Bank' ? 'bg-blue-100 text-blue-700' : type === 'Mobile Wallet' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {typeIcon(type)}
                </span>
                {type === 'Bank' ? 'Bank Accounts' : type === 'Mobile Wallet' ? 'Mobile Wallets' : 'Cash'}
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${currentTheme?.panelBg || 'bg-gray-100'} ${currentTheme?.mutedText || 'text-gray-500'}`}>
                  {grouped[type].length}
                </span>
              </h2>

              {grouped[type].length === 0 ? (
                <div className={`p-6 rounded-xl border-2 border-dashed text-center ${currentTheme?.panelBorder || 'border-gray-200'}`}>
                  <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-400'}`}>
                    No {type === 'Bank' ? 'bank accounts' : type === 'Mobile Wallet' ? 'wallets' : 'cash entries'} added yet.
                    {isAdmin && ' Click "Add Account" to create one.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[type].map(account => (
                    <div
                      key={account._id}
                      className={`relative rounded-2xl p-5 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} border ${account.isActive ? (currentTheme?.cardBorder || 'border-gray-100') : 'border-dashed border-gray-200 opacity-60'} transition`}
                    >
                      {/* Active/Inactive Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {account.isActive ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                            <XCircleIcon className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </div>

                      {/* Account Info */}
                      <div className="flex items-start gap-3 mb-3 pr-20">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${type === 'Bank' ? 'bg-blue-50 text-blue-600' : type === 'Mobile Wallet' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                          {typeIcon(type)}
                        </div>
                        <div>
                          <h3 className={`font-bold text-base ${currentTheme?.title || 'text-gray-900'}`}>{account.name}</h3>
                          <span className={`inline-block text-xs font-semibold border rounded-full px-2 py-0.5 mt-0.5 ${typeBadgeColor(type)}`}>
                            {account.type}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <dl className="space-y-1.5 text-sm">
                        {account.accountNumber && (
                          <div className="flex justify-between">
                            <dt className={`${currentTheme?.mutedText || 'text-gray-500'} font-medium`}>Account No.</dt>
                            <dd className={`font-semibold ${currentTheme?.text || 'text-gray-800'} font-mono`}>{account.accountNumber}</dd>
                          </div>
                        )}
                        {account.bankName && (
                          <div className="flex justify-between">
                            <dt className={`${currentTheme?.mutedText || 'text-gray-500'} font-medium`}>Bank / Provider</dt>
                            <dd className={`font-semibold ${currentTheme?.text || 'text-gray-800'}`}>{account.bankName}</dd>
                          </div>
                        )}
                        {account.holderName && (
                          <div className="flex justify-between">
                            <dt className={`${currentTheme?.mutedText || 'text-gray-500'} font-medium`}>Holder</dt>
                            <dd className={`font-semibold ${currentTheme?.text || 'text-gray-800'}`}>{account.holderName}</dd>
                          </div>
                        )}
                        {account.description && (
                          <p className={`text-xs mt-2 ${currentTheme?.mutedText || 'text-gray-400'} italic`}>{account.description}</p>
                        )}
                      </dl>

                      {/* Actions (admin only) */}
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => openEditModal(account)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                          >
                            <PencilIcon className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(account)}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                              account.isActive
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {account.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(account)}
                            className="inline-flex items-center justify-center p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-lg rounded-2xl ${currentTheme?.cardBg || 'bg-white'} shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]`}>
            {/* Decorative gradient */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    {editingAccount ? 'Edit' : 'New'} Account
                  </p>
                  <h2 className={`text-2xl font-bold mt-1 ${currentTheme?.title || 'text-gray-900'}`}>
                    {editingAccount ? `Edit "${editingAccount.name}"` : 'Add Account or Wallet'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {formError && <Message type="error">{formError}</Message>}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelBase}>Account / Wallet Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. UBL Current Account, JazzCash"
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Account Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      required
                      className={inputBase}
                    >
                      {ACCOUNT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBase}>Account / Wallet Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleFormChange}
                      placeholder="Account or phone number"
                      className={inputBase}
                    />
                  </div>

                  {formData.type !== 'Cash' && (
                    <div>
                      <label className={labelBase}>{formData.type === 'Bank' ? 'Bank Name' : 'Provider'}</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleFormChange}
                        placeholder={formData.type === 'Bank' ? 'e.g. United Bank Limited' : 'e.g. Jazz, Telenor'}
                        className={inputBase}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelBase}>Account Holder Name</label>
                    <input
                      type="text"
                      name="holderName"
                      value={formData.holderName}
                      onChange={handleFormChange}
                      placeholder="Name on account"
                      className={inputBase}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelBase}>Description / Notes</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={2}
                      placeholder="Optional notes about this account..."
                      className={`${inputBase} resize-none`}
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 accent-emerald-600 rounded"
                    />
                    <label htmlFor="isActive" className={`text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'} cursor-pointer`}>
                      Active — will appear in billing &amp; salary dropdowns
                    </label>
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl ${currentTheme?.cardBg || 'bg-white'} shadow-2xl p-6 text-center`}>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-50">
                <TrashIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className={`text-xl font-bold ${currentTheme?.title || 'text-gray-900'} mb-2`}>Delete Account?</h3>
            <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'} mb-6`}>
              Are you sure you want to permanently delete <strong>"{deleteTarget.name}"</strong>?
              This cannot be undone. Existing records that used this account will not be affected.
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
    </div>
  );
};

export default BankAccountsPage;
