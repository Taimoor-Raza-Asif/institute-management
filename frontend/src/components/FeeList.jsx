// src/components/FeeList.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import FeeModal from './FeeModal';
import FeeForm from './FeeForm';
import ConfirmationModal from './ConfirmationModal';
import Loader from './Loader';
import Message from './Message';
import {
  BanknotesIcon,
  WalletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const yearOptions = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => (current - 5 + i).toString());
};

const currency = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n || 0);

const paymentMethods = ['Cash', 'Bank Transfer', 'Deposited Cash'];

const FeeList = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    searchTerm: '',
    month: '',
    year: '',
    paymentMethod: '',
    receivedBy: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);

  const canManage = currentUser && (currentUser.role === 'admin' || currentUser.role === 'accountant');

  const backendBaseUrl = 'http://localhost:5000';

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }, []);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (currentUser?.role === 'student' && currentUser?.profileId) {
        res = await api.get(`/fees/student/${currentUser.profileId}`);
      } else {
        res = await api.get('/fees', { params: {
          searchTerm: filters.searchTerm || undefined,
          month: filters.month || undefined,
          year: filters.year || undefined,
          paymentMethod: filters.paymentMethod || undefined,
          receivedBy: filters.receivedBy || undefined,
        }});
      }
      setFees(res.data || []);
    } catch (err) {
      console.error('Failed to load fees:', err);
      setError(err.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  useEffect(() => {
    if (canManage) fetchStudents();
  }, [canManage, fetchStudents]);

  const stats = useMemo(() => {
    const totalCollected = fees.reduce((sum, f) => sum + (parseFloat(f.receivedAmount) || 0), 0);
    const totalDue = fees.reduce((sum, f) => sum + (parseFloat(f.dueAmount) || 0), 0);
    return { totalCollected, totalDue, count: fees.length };
  }, [fees]);

  const openAdd = () => {
    setEditingFee(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (fee) => {
    setEditingFee(fee);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openView = (fee) => {
    setEditingFee(fee);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const requestDelete = (fee) => {
    setFeeToDelete(fee);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    try {
      await api.delete(`/fees/${feeToDelete._id}`);
      setConfirmOpen(false);
      setFeeToDelete(null);
      fetchFees();
    } catch (err) {
      console.error('Delete failed:', err);
      setConfirmOpen(false);
      setFeeToDelete(null);
    }
  };

  const resetFilters = () => setFilters({ searchTerm: '', month: '', year: '', paymentMethod: '', receivedBy: '' });

  return (
    <div className="p-6 sm:p-8">
      {/* Hero header */}
      <div className={`mb-6 rounded-2xl p-6 sm:p-8 ${currentTheme.panelBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme.shadow || 'shadow'} ${currentTheme.border || 'border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold ${currentTheme.title || 'text-emerald-800'}`}>Fee Management</h1>
            <p className={`${currentTheme.mutedText || 'text-gray-600'} mt-2`}>Track collections, dues, and receipts with ease.</p>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            {canManage && (
              <button onClick={openAdd} className="inline-flex items-center px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add Fee
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Collected" value={currency(stats.totalCollected)} icon={<BanknotesIcon className="h-8 w-8 text-emerald-600" />} theme={currentTheme} />
        <StatCard title="Outstanding Dues" value={currency(stats.totalDue)} icon={<WalletIcon className="h-8 w-8 text-rose-600" />} theme={currentTheme} />
        <StatCard title="Records" value={stats.count} icon={<DocumentArrowDownIcon className="h-8 w-8 text-teal-600" />} theme={currentTheme} />
      </div>

      {/* Filters */}
      <div className={`mb-6 rounded-xl p-4 ${currentTheme.panelBg || 'bg-white'} ${currentTheme.shadow || 'shadow'} ${currentTheme.border || 'border border-gray-200'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              className="ml-2 w-full outline-none"
              placeholder="Search by name or CNIC"
              value={filters.searchTerm}
              onChange={(e) => setFilters((p) => ({ ...p, searchTerm: e.target.value }))}
            />
          </div>
          <select className="border rounded-lg px-3 py-2" value={filters.month} onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))}>
            <option value="">Month</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2" value={filters.year} onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}>
            <option value="">Year</option>
            {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2" value={filters.paymentMethod} onChange={(e) => setFilters((p) => ({ ...p, paymentMethod: e.target.value }))}>
            <option value="">Payment Method</option>
            {paymentMethods.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="Received By" value={filters.receivedBy} onChange={(e) => setFilters((p) => ({ ...p, receivedBy: e.target.value }))} />
          <button onClick={resetFilters} className="inline-flex items-center justify-center px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />Reset
          </button>
        </div>
      </div>

      {error && <Message type="error">{error}</Message>}

      {/* List */}
      <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow'} ${currentTheme.border || 'border border-gray-200'} rounded-xl overflow-hidden`}>
        {loading ? (
          <div className="p-10"><Loader /></div>
        ) : fees.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No fees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                <tr>
                  <Th>Student</Th>
                  <Th>Month</Th>
                  <Th>Year</Th>
                  <Th>Total</Th>
                  <Th>Received</Th>
                  <Th>Due</Th>
                  <Th>Method</Th>
                  <Th>Received Date</Th>
                  <Th>Attachment</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fees.map((f, index) => (
                  <tr
                    key={f._id}
                    className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <Td>
                      <div className="flex items-center">
                        {f.studentId?.profilePictureUrl ? (
                          <img
                            src={`${backendBaseUrl}${f.studentId.profilePictureUrl}`}
                            alt="avatar"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/10b981/ffffff?text=' + (f.studentId?.name?.[0] || 'S'); }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-200">
                            <span className="text-green-700 font-bold text-sm">{(f.studentId?.name?.[0] || 'S')}</span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{f.studentId?.name || '—'}</div>
                          <div className="text-xs text-gray-500 font-mono">{f.studentId?.cnic || ''}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{f.month}</Td>
                    <Td>{f.year}</Td>
                    <Td className="text-gray-900 font-semibold">{currency(f.totalFee)}</Td>
                    <Td>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                        {currency(f.receivedAmount)}
                      </span>
                    </Td>
                    <Td>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                        {currency(f.dueAmount)}
                      </span>
                    </Td>
                    <Td>
                      {f.paymentMethod ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {f.paymentMethod}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td>{f.receivedDate ? new Date(f.receivedDate).toLocaleDateString() : '—'}</Td>
                    <Td>
                      {f.billScreenshotUrl ? (
                        <a className="text-teal-700 hover:underline" href={`${backendBaseUrl}${f.billScreenshotUrl}`} target="_blank" rel="noreferrer">View</a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200" onClick={() => openView(f)} title="View">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {canManage && (
                          <>
                            <button className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors duration-200" onClick={() => openEdit(f)} title="Edit">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200" onClick={() => requestDelete(f)} title="Delete">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Primary CTA for mobile */}
      {canManage && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button onClick={openAdd} className="inline-flex items-center px-4 py-3 rounded-full shadow-lg bg-emerald-600 text-white">
            <PlusCircleIcon className="h-6 w-6 mr-2" /> New Fee
          </button>
        </div>
      )}

      {/* Modal */}
      <FeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-xl font-semibold ${currentTheme.title || 'text-gray-900'}`}>{isViewMode ? 'Fee Details (Receipt)' : editingFee ? 'Edit Fee Record' : 'Add New Fee Record'}</h3>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <FeeForm
          editingFee={editingFee}
          fetchFees={fetchFees}
          studentsForForm={students}
          onClose={() => setIsModalOpen(false)}
          isViewMode={isViewMode}
          fetchStudents={fetchStudents}
        />
      </FeeModal>

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        message={feeToDelete ? `Delete fee record for ${feeToDelete.studentId?.name || 'this student'} (${feeToDelete.month} ${feeToDelete.year})?` : 'Delete this fee record?'}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, theme }) => (
  <div className={`p-5 rounded-lg flex items-center justify-between ${theme.panelBg || 'bg-gray-50'} ${theme.shadow || 'shadow'} ${theme.border || 'border border-gray-200'} transform hover:-translate-y-0.5 transition`}>
    <div>
      <p className={`${theme.mutedText || 'text-gray-500'} text-sm`}>{title}</p>
      <p className={`text-2xl font-bold ${theme.title || 'text-emerald-800'}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full ${theme.badgeBg || 'bg-white'} ${theme.shadow || 'shadow'}`}>{icon}</div>
  </div>
);

const Th = ({ children }) => (
  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">{children}</th>
);
const Td = ({ children }) => (
  <td className="px-6 py-4 text-sm text-gray-700 align-middle">{children}</td>
);

export default FeeList;
