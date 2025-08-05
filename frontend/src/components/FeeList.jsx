// src/components/FeeList.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import FeeModal from './FeeModal';
import FeeForm from './FeeForm';
import api from '../api';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

// Array of month names
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const FeeList = () => {
    const [fees, setFees] = useState([]);
    const [studentsForForm, setStudentsForForm] = useState([]);
    const [editingFee, setEditingFee] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFeeFormViewMode, setIsFeeFormViewMode] = useState(false);

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const [filterMonth, setFilterMonth] = useState('');
    const [filterReceivedBy, setFilterReceivedBy] = useState('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterDueStatus, setFilterDueStatus] = useState('');

    const [currentUser, setCurrentUser] = useState(null);
    const [canAddFee, setCanAddFee] = useState(false);
    const [canEditFee, setCanEditFee] = useState(false);
    const [canDeleteFee, setCanDeleteFee] = useState(false);

    const generateYearOptions = useCallback(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i.toString());
        }
        return years;
    }, []);

    const buildFeeFilterQueryParams = useCallback(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
            params.append('studentSearchTerm', debouncedSearchTerm);
        }
        if (filterMonth) {
            params.append('month', filterMonth);
        }
        if (filterYear) {
            params.append('year', filterYear);
        }
        if (filterReceivedBy) {
            params.append('receivedBy', filterReceivedBy);
        }
        if (filterPaymentMethod) {
            params.append('paymentMethod', filterPaymentMethod);
        }
        if (filterDueStatus === 'dueRemaining') {
            params.append('dueStatus', 'dueRemaining');
        }
        return params.toString();
    }, [debouncedSearchTerm, filterMonth, filterYear, filterReceivedBy, filterPaymentMethod, filterDueStatus]);

    // const fetchFees = useCallback(async () => {
    //     setLoading(true); // Set loading true at the start of fetch
    //     setError(null);
    //     try {
    //         const queryParams = buildFeeFilterQueryParams();
    //         const res = await api.get(`/fees?${queryParams}`);
    //         if (Array.isArray(res.data)) {
    //             setFees(res.data);
    //             console.log("Fetched Fees Data:", res.data);
    //         } else {
    //             console.error("API response for fees is not an array:", res.data);
    //             setFees([]);
    //             setError("Received unexpected data format from server.");
    //         }
    //     } catch (err) {
    //         console.error('Failed to fetch fees:', err);
    //         setFees([]);
    //         setError('Failed to load fee records. Please try again.');
    //     } finally {
    //         setLoading(false); // Set loading false after fetch completes (success or error)
    //     }
    // }, [buildFeeFilterQueryParams]);

    const fetchFees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/fees';
            const params = new URLSearchParams();

            // If a student is logged in, they can only see their own fees
            if (currentUser?.role === 'student' && currentUser?.profileId) {
                url = `/fees/student/${currentUser.profileId}`;
            } else {
                // For Admin/Accountant, apply filters
                if (debouncedSearchTerm) params.append('searchTerm', debouncedSearchTerm);
                if (filterMonth) params.append('month', filterMonth);
                if (filterYear) params.append('year', filterYear);
                if (filterReceivedBy) params.append('receivedBy', filterReceivedBy);
                if (filterPaymentMethod) params.append('paymentMethod', filterPaymentMethod);
                url = `${url}?${params.toString()}`;
            }

            const response = await api.get(url);
            if (Array.isArray(response.data)) {
                setFees(response.data);
            } else if (response.data && currentUser?.role === 'student') {
                // If student route returns a single object, wrap it in an array
                setFees([response.data]);
            } else {
                console.error("API response for fees is not an array:", response.data);
                setFees([]);
                setError("Received unexpected data format from server for fees.");
            }
        } catch (err) {
            console.error('Failed to fetch fees:', err);
            setFees([]);
            setError('Failed to load fee records. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [buildFeeFilterQueryParams, currentUser]);

    const fetchStudentsForDropdown = useCallback(async () => {
        try {
            const res = await api.get('/students');
            if (Array.isArray(res.data)) {
                setStudentsForForm(res.data);
            } else {
                console.error("API response for students is not an array:", res.data);
                setStudentsForForm([]);
            }
        } catch (err) {
            console.error('Failed to fetch students for form:', err);
            setStudentsForForm([]);
        }
    }, []);

    // useEffect(() => {
    //     fetchFees();
    //     fetchStudentsForDropdown(); // Fetch students initially
    // }, [fetchFees, fetchStudentsForDropdown]);

    useEffect(() => {
        if (currentUser) { // Only fetch data if user is logged in
            fetchFees();
            // Only fetch students for the form if the user has permission to add/edit fees
            if (canAddFee || canEditFee) {
                fetchStudentsForDropdown();
            }
        }
    }, [fetchFees, fetchStudentsForDropdown, currentUser, canAddFee, canEditFee]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Refetch fees when debouncedSearchTerm or filters change
    // useEffect(() => {
    //     fetchFees();
    // }, [debouncedSearchTerm, filterMonth, filterYear, filterReceivedBy, filterPaymentMethod, filterDueStatus, fetchFees]);

    // Effect to load current user and set permissions
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            setCurrentUser(user);

            // Admin and Accountant can add, edit, delete fees
            setCanAddFee(user.role === 'admin' || user.role === 'accountant');
            setCanEditFee(user.role === 'admin' || user.role === 'accountant');
            setCanDeleteFee(user.role === 'admin' || user.role === 'accountant');
        }
    }, []);

    const handleAddFee = () => {
        setEditingFee(null);
        setIsFeeFormViewMode(false);
        setModalOpen(true);
    };

    const handleEdit = (fee) => {
        setEditingFee(fee);
        setIsFeeFormViewMode(false);
        setModalOpen(true);
    };

    const handleView = (fee) => {
        setEditingFee(fee);
        setIsFeeFormViewMode(true);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!canDeleteFee) {
            alert("You are not authorized to delete fee records.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this fee record?')) {
            try {
                // Find the fee record to get its details before deletion
                const feeToDelete = fees.find(f => f._id === id);
                if (!feeToDelete) {
                    console.error("Fee record not found for deletion.");
                    return;
                }

                await api.delete(`/fees/${id}`);
                fetchFees(); // Refresh the list of fees

                // Re-evaluate student's fee status and financial balances after deletion
                if (feeToDelete.studentId) {
                    // Fetch the latest student data
                    const studentResponse = await api.get(`/students/${feeToDelete.studentId._id}`);
                    let currentStudent = studentResponse.data;

                    // Undo the financial impact of the deleted fee record
                    const deletedTotalFee = parseFloat(feeToDelete.totalFee);
                    const deletedReceivedAmount = parseFloat(feeToDelete.receivedAmount);
                    const deletedPaymentMethod = feeToDelete.paymentMethod;

                    let newDepositedAmount = parseFloat(currentStudent.depositedAmount || 0);
                    let newOtherDues = parseFloat(currentStudent.otherDues || 0);

                    if (deletedPaymentMethod === 'Deposited Cash') {
                        newDepositedAmount += deletedReceivedAmount; // Put back what was used from deposit
                        if (deletedReceivedAmount < deletedTotalFee) {
                            newOtherDues -= (deletedTotalFee - deletedReceivedAmount); // Undo deficit added to otherDues
                        }
                    } else {
                        if (deletedReceivedAmount > deletedTotalFee) {
                            newDepositedAmount -= (deletedReceivedAmount - deletedTotalFee); // Remove old excess from deposit
                        }
                        if (deletedReceivedAmount < deletedTotalFee) {
                            newOtherDues -= (deletedTotalFee - deletedReceivedAmount); // Remove old deficit from otherDues
                        }
                    }

                    // Ensure non-negative balances
                    newDepositedAmount = Math.max(0, newDepositedAmount);
                    newOtherDues = Math.max(0, newOtherDues);

                    // Update student's financial details on backend
                    await api.put(`/students/${feeToDelete.studentId._id}`, {
                        depositedAmount: newDepositedAmount,
                        otherDues: newOtherDues
                    });

                    // Also re-evaluate feeStatus for the student
                    // This would ideally be handled by a backend endpoint that re-calculates feeStatus
                    // based on remaining fees, but for simplicity, we'll just re-fetch students here.
                    fetchStudentsForDropdown(); // Refresh student data in dropdowns and displays
                }

            } catch (err) {
                console.error('Failed to delete fee record:', err);
                setError('Failed to delete fee record. Please try again.');
            }
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingFee(null);
        setIsFeeFormViewMode(false);
        fetchFees(); // Refresh fees when modal closes
        fetchStudentsForDropdown(); // Refresh students when modal closes (important for updated balances)
    };

    const getDueStatusText = (fee) => {
        if (fee.dueAmount > 0) {
            return `Due: PKR ${fee.dueAmount.toFixed(2)}`;
        } else if (fee.receivedAmount >= fee.totalFee) {
            return 'Paid';
        }
        return '-'; // Should not happen if logic is correct
    };

    const filteredFees = fees.filter(fee => {
        const studentNameMatch = fee.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const cnicMatch = fee.studentId?.cnic.toLowerCase().includes(searchTerm.toLowerCase());
        const monthMatch = filterMonth ? fee.month === filterMonth : true;
        const yearMatch = filterYear ? fee.year.toString() === filterYear : true;
        const receivedByMatch = filterReceivedBy ? fee.receivedBy.toLowerCase().includes(filterReceivedBy.toLowerCase()) : true;
        const paymentMethodMatch = filterPaymentMethod ? fee.paymentMethod === filterPaymentMethod : true;
        const dueStatusMatch = filterDueStatus === 'dueRemaining' ? fee.dueAmount > 0 : true;

        return (studentNameMatch || cnicMatch) && monthMatch && yearMatch && receivedByMatch && paymentMethodMatch && dueStatusMatch;
    });

    if (loading) {
        return <div className="text-center py-4">Loading fee records...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-600">Error: {error}</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-4 text-gray-600">Please log in to view fee records.</div>;
    }
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8">Fee Management</h1>

            {/* Action Buttons and Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">

                    {/* Search Bar */}
                    {/* <div className="relative w-full sm:w-1/2 lg:w-2/3">
                        <input
                            type="text"
                            placeholder="Search by student name or CNIC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div> */}

                    {(currentUser.role === 'admin' || currentUser.role === 'accountant') && (
                        <div className="relative w-full sm:w-1/2 lg:w-1/3">
                            <input
                                type="text"
                                placeholder="Search by student name or CNIC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    {/* <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      
                        <button
                            onClick={handleAddFee}
                            className="flex items-center justify-center bg-green-600 font-semibold text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> Add New Fee
                        </button>

                       
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div> */}

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {canAddFee && (
                            <button
                                onClick={handleAddFee}
                                className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" /> Add New Fee
                            </button>
                        )}
                        {(currentUser.role === 'admin' || currentUser.role === 'accountant') && (
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        )}
                    </div>

                </div>

                {/* Advanced Filters */}
                {/* {showAdvancedFilters && ( */}
                {showAdvancedFilters && (currentUser.role === 'admin' || currentUser.role === 'accountant') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {/* Month Filter */}
                        <div>
                            <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                id="filterMonth"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                        {/* Year Filter */}
                        <div>
                            <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                id="filterYear"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {generateYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        {/* Received By Filter */}
                        <div>
                            <label htmlFor="filterReceivedBy" className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                            <input
                                type="text"
                                id="filterReceivedBy"
                                value={filterReceivedBy}
                                onChange={(e) => setFilterReceivedBy(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., John Doe"
                            />
                        </div>
                        {/* Payment Method Filter */}
                        <div>
                            <label htmlFor="filterPaymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                id="filterPaymentMethod"
                                value={filterPaymentMethod}
                                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Methods</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Easypaisa">Easypaisa</option>
                                <option value="JazzCash">JazzCash</option>
                                <option value="Online Wallet">Online Wallet</option>
                                <option value="Deposited Cash">Deposited Cash</option>
                            </select>
                        </div>
                        {/* Due Status Filter */}
                        <div>
                            <label htmlFor="filterDueStatus" className="block text-sm font-medium text-gray-700 mb-1">Due Status</label>
                            <select
                                id="filterDueStatus"
                                value={filterDueStatus}
                                onChange={(e) => setFilterDueStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All</option>
                                <option value="dueRemaining">Due Remaining</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Fee Records Table */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
                    <thead className="bg-green-600 text-white rounded-md">
                        <tr> {/* Ensure no whitespace immediately after <tr> */}
                            <th className="p-2 border border-white">Student Name</th>{/* Ensure no whitespace between </th> and <th> */}
                            <th className="p-2 border border-white">Month/Year</th>
                            <th className="p-2 border border-white">Total Fee</th>
                            <th className="p-2 border border-white">Received Amt</th>
                            <th className="p-2 border border-white">Received Date</th>
                            <th className="p-2 border border-white">Received From</th>
                            <th className="p-2 border border-white">Received By</th>
                            <th className="p-2 border border-white">Payment Method</th>
                            <th className="p-2 border border-white">Due Amt</th>
                            <th className="p-2 border border-white">Bill Screenshot</th>
                            <th className="p-2 border border-white">Actions</th>
                        </tr> {/* Ensure no whitespace immediately before </tr> */}
                    </thead>
                    <tbody>
                        {Array.isArray(fees) && fees.length > 0 ? (
                            fees.map((fee, index) => (
                                <tr
                                    key={fee._id}
                                    className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}>
                                    {/* Ensure no whitespace immediately after <td> or between </td> and <td> */}
                                    <td className="border border-white p-2">{fee.studentId?.name || '-'}</td>
                                    <td className="border border-white p-2">{fee.month || '-'} {fee.year || ''}</td> {/* Added || '-' for safety */}
                                    <td className="border border-white p-2">{fee.totalFee || '0'}</td> {/* Added || '0' for safety */}
                                    <td className="border border-white p-2">{fee.receivedAmount || '0'}</td> {/* Added || '0' for safety */}
                                    <td className="border border-white p-2">{fee.receivedDate ? new Date(fee.receivedDate).toLocaleDateString() : '-'}</td>
                                    <td className="border border-white p-2">{fee.paidBy || '-'}</td> {/* Added || '-' for safety */}
                                    <td className="border border-white p-2">{fee.receivedBy || '-'}</td>
                                    <td className="border border-white p-2">{fee.paymentMethod || '-'}</td>
                                    <td className={`border border-white p-2 ${fee.dueAmount > 0 ? 'bg-red-600 text-white' : ''}`}>{fee.dueAmount || '0'}</td> {/* Added || '0' for safety */}
                                    <td className="border border-white p-2">
                                        {fee.billScreenshotUrl ? (
                                            <a
                                                href={`http://localhost:5000${fee.billScreenshotUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Bill
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="border border-white p-2 space-x-2 flex justify-center items-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleView(fee); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Fee Details">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                           {canEditFee && (
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(fee); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Fee Record">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                         )}
                                         {canDeleteFee && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(fee._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Fee Record">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                         )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center p-4 text-gray-500">No fee records found. Add a new fee record!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <FeeModal isOpen={modalOpen} onClose={handleCloseModal}>
                <FeeForm
                    editingFee={editingFee}
                    fetchFees={fetchFees}
                    studentsForForm={studentsForForm}
                    onClose={handleCloseModal}
                    isViewMode={isFeeFormViewMode}
                    fetchStudents={fetchStudentsForDropdown}
                />
            </FeeModal>
        </div>
    );
};

export default FeeList;
