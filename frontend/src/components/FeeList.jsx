// src/components/FeeList.jsx
import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchFees = useCallback(async () => {
    setLoading(true); // Set loading true at the start of fetch
    setError(null);
    try {
      const queryParams = buildFeeFilterQueryParams();
      const res = await api.get(`/fees?${queryParams}`);
      if (Array.isArray(res.data)) {
        setFees(res.data);
        console.log("Fetched Fees Data:", res.data);
      } else {
        console.error("API response for fees is not an array:", res.data);
        setFees([]);
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error('Failed to fetch fees:', err);
      setFees([]);
      setError('Failed to load fee records. Please try again.');
    } finally {
      setLoading(false); // Set loading false after fetch completes (success or error)
    }
  }, [buildFeeFilterQueryParams]);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  useEffect(() => {
    fetchStudentsForDropdown();
  }, [fetchStudentsForDropdown]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFee(null);
    setIsFeeFormViewMode(false);
    fetchFees();
  };

  const handleAddFee = () => {
    setEditingFee(null);
    setIsFeeFormViewMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this fee record?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/fees/${id}`);
      fetchFees();
    } catch (err) {
      console.error('Failed to delete fee record:', err);
      alert('Failed to delete fee record. Please try again.');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setIsFeeFormViewMode(false);
    setModalOpen(true);
  };

  const handleViewFeeDetails = (fee) => {
    setEditingFee(fee);
    setIsFeeFormViewMode(true);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterMonth('');
    setFilterReceivedBy('');
    setFilterPaymentMethod('');
    setFilterYear(new Date().getFullYear().toString());
    setFilterDueStatus('');
  };

  const uniqueReceiverNames = Array.from(new Set(fees.map(fee => fee.receivedBy))).filter(Boolean);

  // Skeleton Row Component for loading state
  const SkeletonRow = ({ columns }) => (
    <tr className="text-center bg-gray-100 animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-2 border border-white">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Fee Records</h1>
        <button onClick={handleAddFee} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md transition-all duration-300 ease-in-out group hover:px-4" title="Add New Fee Record">
          <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
          <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Fee</span>
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative flex-grow">
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Search by Student Name or CNIC..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
          >
            {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Due Status Filter */}
              <div>
                <label htmlFor="filterDueStatus" className="block text-sm font-medium text-gray-700">Due Status</label>
                <select
                  id="filterDueStatus"
                  value={filterDueStatus}
                  onChange={(e) => setFilterDueStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All</option>
                  <option value="dueRemaining">Due Remaining</option>
                </select>
              </div>

              <div>
                <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  id="filterYear"
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  id="filterMonth"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All Months</option>
                  {months.map((monthName) => (
                    <option key={monthName} value={monthName}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterReceivedBy" className="block text-sm font-medium text-gray-700">Received By</label>
                <select
                  id="filterReceivedBy"
                  value={filterReceivedBy}
                  onChange={(e) => setFilterReceivedBy(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All</option>
                  {uniqueReceiverNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterPaymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  id="filterPaymentMethod"
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Online Wallet">Online Wallet</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container with minimum height */}
      <div className="overflow-x-auto min-h-[400px] relative"> {/* Added min-h-[400px] */}
        {loading && ( // Loading overlay
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center text-lg text-gray-700">Loading fee records...</div>
          </div>
        )}
        {error && !loading && ( // Error message
          <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-10 border border-red-400 text-red-700">
            <div className="text-center text-lg">{error}</div>
          </div>
        )}

        <table className="min-w-full table-fixed border-separate border-spacing-y-2 shadow-lg rounded-lg overflow-hidden"> {/* Changed to table-fixed */}
          <thead className="bg-green-600 text-white rounded-lg" >
            <tr>
              {/* Fixed widths for all columns */}
              <th className="p-2 border border-white rounded w-48">Student Name</th>
              <th className="p-2 border border-white rounded w-32">Month/Year</th>
              <th className="p-2 border border-white rounded w-32">Received Date</th>
              <th className="p-2 border border-white rounded w-32">Received By</th>
              <th className="p-2 border border-white rounded w-32">Payment Method</th>
              <th className="p-2 border border-white rounded w-28">Received Amt</th>
              <th className="p-2 border border-white rounded w-28">Due Amt</th>
              <th className="p-2 border border-white rounded w-32">Bill Screenshot</th>
              <th className="p-2 border border-white rounded w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? ( // Show skeleton rows when loading
              [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={9} />)
            ) : Array.isArray(fees) && fees.length > 0 ? (
              fees.map((fee, index) => (
                <tr
                  key={fee._id}
                  className={`text-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}>
                  <td className="border border-white p-2 w-48 overflow-hidden whitespace-nowrap text-ellipsis" title={fee.studentId?.name}>{fee.studentId?.name || '-'}</td>
                  <td className="border border-white p-2 w-32">{fee.month || '-'} {fee.year || ''}</td>
                  <td className="border border-white p-2 w-32">{fee.receivedDate ? new Date(fee.receivedDate).toLocaleDateString() : '-'}</td>
                  <td className="border border-white p-2 w-32 overflow-hidden whitespace-nowrap text-ellipsis" title={fee.receivedBy}>{fee.receivedBy || '-'}</td>
                  <td className="border border-white p-2 w-32 overflow-hidden whitespace-nowrap text-ellipsis" title={fee.paymentMethod}>{fee.paymentMethod || '-'}</td>
                  <td className="border border-white p-2 w-28">{fee.receivedAmount || '0'}</td>
                  <td className={`border border-white p-2 w-28 ${fee.dueAmount > 0 ? 'bg-red-500 text-white' : ''}`}>{fee.dueAmount || '0'}</td>
                  <td className="border border-white p-2 w-32">
                    {fee.billScreenshotUrl ? (
                      <a
                        href={`http://localhost:5000${fee.billScreenshotUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Bill
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-white p-2 w-40 space-x-2 flex justify-center items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleViewFeeDetails(fee); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Fee Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(fee); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Fee Record">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(fee._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Fee Record">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">No fee records found. Add a new fee record!</td>
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
        />
      </FeeModal>
    </div>
  );
};

export default FeeList;
