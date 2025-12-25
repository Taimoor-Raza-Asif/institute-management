import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../App';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import AddEditBillModal from '../components/AddEditBillModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useTheme } from '../context/ThemeContext';
import {
  PlusIcon, FunnelIcon, MagnifyingGlassIcon, PencilIcon,
  TrashIcon, ArrowDownTrayIcon, EyeIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const billCategories = ['Utilities', 'Kitchen', 'Vendor Payment', 'Repairs', 'Other'];
const billStatuses = ['Paid', 'Unpaid', 'Partial'];

const BillingManagement = () => {
    const { currentUser: user } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMonth, setFilterMonth] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const fetchBills = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/billing', {
                params: {
                    search: searchTerm,
                    category: filterCategory,
                    status: filterStatus,
                    month: filterMonth ? filterMonth.getMonth() + 1 : null,
                    year: filterMonth ? filterMonth.getFullYear() : null,
                }
            });
            setBills(response.data);
        } catch (err) {
            setError('Failed to fetch bills.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterCategory, filterStatus, filterMonth]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);
        const totalAmount = useMemo(() => (
            Array.isArray(bills) ? bills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0) : 0
        ), [bills]);
        const paidCount = useMemo(() => (
            Array.isArray(bills) ? bills.filter(b => b.status === 'Paid').length : 0
        ), [bills]);
        const unpaidCount = useMemo(() => (
            Array.isArray(bills) ? bills.filter(b => b.status !== 'Paid').length : 0
        ), [bills]);


    const handleAddBill = () => {
        setSelectedBill(null);
        setIsViewMode(false);
        setIsModalOpen(true);
    };

    const handleEditBill = (bill) => {
        setSelectedBill(bill);
        setIsViewMode(false);
        setIsModalOpen(true);
    };

    const handleViewBill = (bill) => {
        setSelectedBill(bill);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

        const [confirmOpen, setConfirmOpen] = useState(false);
        const [billIdToDelete, setBillIdToDelete] = useState(null);

        const requestDeleteBill = (id) => {
            setBillIdToDelete(id);
            setConfirmOpen(true);
        };

        const confirmDeleteBill = async () => {
            if (!billIdToDelete) return;
            setLoading(true);
            try {
                await api.delete(`/billing/${billIdToDelete}`);
                fetchBills();
            } catch (err) {
                setError('Failed to delete bill.');
            } finally {
                setLoading(false);
                setConfirmOpen(false);
                setBillIdToDelete(null);
            }
        };

    const handleDownloadReceipt = async (id) => {
        try {
            const response = await api.get(`/billing/${id}/receipt`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setError('Failed to download receipt.');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setFilterStatus('');
        setFilterMonth(null);
    };

    const isAllowed = user?.role === 'admin'  || user?.role === 'accountant';

        return (
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {/* Hero Header */}
                        <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Billing Management</h1>
                                        <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm sm:text-base`}>Track institute bills and payments</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Total Amount</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>PKR {Number(totalAmount).toFixed(2)}</p>
                                    </div>
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Paid Bills</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>{paidCount}</p>
                                    </div>
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Pending/Unpaid</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>{unpaidCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
            {error && <Message type="error">{error}</Message>}

            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-6 mb-6`}>
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-4 gap-4">
                    <div className="relative flex-1 min-w-0">
                        <input
                            type="text"
                            placeholder="Search by title or paid to..."
                            className={`w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-gray-400'}`} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                        </button>
                        {isAllowed && (
                            <button
                                onClick={handleAddBill}
                                className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add New Bill
                            </button>
                        )}
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'} rounded-md ${currentTheme?.shadow || 'shadow-inner'}`}>
                        <div>
                            <label htmlFor="filterCategory" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Category</label>
                            <select
                                id="filterCategory"
                                name="filterCategory"
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterStatus" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Status</label>
                            <select
                                id="filterStatus"
                                name="filterStatus"
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {billStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterMonth" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                            <DatePicker
                                selected={filterMonth}
                                onChange={(date) => setFilterMonth(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                placeholderText="Select Month"
                            />
                        </div>
                        <div className="col-span-full flex justify-end">
                            <button onClick={handleResetFilters} className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} ${currentTheme?.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'}`}>
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
                    <div className="overflow-x-auto rounded-xl overflow-hidden">
                        <table className={`min-w-full divide-y ${currentTheme?.border || 'divide-gray-200'}`}>
                            <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                                <tr>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tl-xl`}>Title</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Category</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Amount</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Status</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Bill Date</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Paid To</th>
                                    <th scope="col" className={`px-6 py-4 text-center text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tr-xl`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${currentTheme?.border || 'divide-gray-100'}`}>
                                {bills.length > 0 ? bills.map((bill) => (
                                    <tr
                                        key={bill._id}
                                        className={`transition-all duration-150 ${currentTheme?.tbodyBg || 'bg-white'} ${currentTheme?.tableStripedBg || 'odd:bg-white even:bg-gray-50'} ${currentTheme?.tableHover || 'hover:bg-emerald-50'} hover:shadow-md`}
                                    >
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{bill.title}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{bill.category}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {Number(bill.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${bill.status === 'Paid' ? `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}` : bill.status === 'Unpaid' ? `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}` : `${currentTheme.badgeWarningBg || 'bg-amber-100'} ${currentTheme.badgeWarningText || 'text-amber-800'}`}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{bill.paidTo || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleViewBill(bill)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="View Bill Details">
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                {isAllowed && (
                                                    <>
                                                        <button onClick={() => handleEditBill(bill)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Edit">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => requestDeleteBill(bill._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Delete">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDownloadReceipt(bill._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Download Receipt">
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className={`text-center p-4 ${currentTheme?.mutedText || 'text-gray-500'} text-sm`}>No bills found. {isAllowed && 'Add a new bill!'}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBill(null); setIsViewMode(false); }} title={selectedBill ? (isViewMode ? "Bill Details" : "Edit Bill") : "Add New Bill"}>
                <AddEditBillModal
                    billToEdit={selectedBill}
                    onAdd={fetchBills}
                    onEdit={fetchBills}
                    onClose={() => { setIsModalOpen(false); setSelectedBill(null); setIsViewMode(false); }}
                    isViewMode={isViewMode}
                />
            </Modal>

            <ConfirmationModal
              isOpen={confirmOpen}
              onClose={() => { setConfirmOpen(false); setBillIdToDelete(null); }}
              onConfirm={confirmDeleteBill}
              message="Are you sure you want to delete this bill?"
            />
        </div>
    );
};

export default BillingManagement;