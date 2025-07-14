// src/components/FeeList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Modal from './Modal';
import FeeForm from './FeeForm';
import api from '../api';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Added FunnelIcon, XMarkIcon

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

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState(''); // Search by student name/CNIC
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle for advanced filters

  const [filterMonth, setFilterMonth] = useState('');
  const [filterReceivedBy, setFilterReceivedBy] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString()); // Default to current year

  // Helper to generate available years for fee filter
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) { // Last 5 years, current, next 1
      years.push(i.toString());
    }
    return years;
  };

  // Function to construct query parameters for backend API call
  const buildFeeFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('studentSearchTerm', searchTerm);
    }
    if (filterMonth && filterYear) { // Combine month and year for backend
      params.append('month', `${filterMonth} ${filterYear}`);
    } else if (filterYear && !filterMonth) {
        // If only year is selected, this is complex for backend with current `month` field.
        // Backend `getAllFees` currently filters by exact `month` string ("July 2025").
        // To filter by year alone, backend would need to query `receivedDate` range.
        // For now, if only year is selected, it won't filter by month.
        // Consider adding a note or disabling month filter if year is not selected.
    }
    if (filterReceivedBy) {
      params.append('receivedBy', filterReceivedBy);
    }
    if (filterPaymentMethod) {
      params.append('paymentMethod', filterPaymentMethod);
    }
    return params.toString();
  }, [searchTerm, filterMonth, filterYear, filterReceivedBy, filterPaymentMethod]);


  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = buildFeeFilterQueryParams();
      const res = await api.get(`/fees?${queryParams}`); // This fetches fees with populated studentId
      if (Array.isArray(res.data)) {
        setFees(res.data);
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
      setLoading(false);
    }
  }, [buildFeeFilterQueryParams]);


  const fetchStudentsForDropdown = useCallback(async () => {
    try {
      const res = await api.get('/students'); // Fetch all students (no filters needed here)
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
    fetchFees();
    fetchStudentsForDropdown();
  }, [fetchFees, fetchStudentsForDropdown]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFee(null);
    fetchFees(); // Re-fetch fees after modal close (add/edit)
  };

  const handleAddFee = () => {
    setEditingFee(null);
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
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterMonth('');
    setFilterReceivedBy('');
    setFilterPaymentMethod('');
    setFilterYear(new Date().getFullYear().toString());
    // fetchFees will be triggered by dependency array
  };

  // Generate unique receiver names from current fees for the filter dropdown
  // Note: This will only show names from the *currently displayed* fees.
  // If you need all possible receiver names, you'd need a separate backend endpoint for them.
  const uniqueReceiverNames = Array.from(new Set(fees.map(fee => fee.receivedBy))).filter(Boolean);


  if (loading) {
    return <div className="p-6 text-center text-lg">Loading fee records...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Fee Records</h1>
        <button onClick={handleAddFee} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md transition-all duration-300 ease-in-out group hover:px-4" title="Add New Fee Record">
          <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
          <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Fee</span>
        </button>
      </div>

      {/* --- Search and Filter Toggle --- */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={fetchFees} // Trigger fetch on blur
            onKeyPress={(e) => { if (e.key === 'Enter') fetchFees(); }}
            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            placeholder="Search by Student Name or CNIC..."
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
          >
            {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* --- Advanced Filters Section (Conditional Display) --- */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Filter by Year */}
                <div>
                    <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700">Year</label>
                    <select
                        id="filterYear"
                        value={filterYear}
                        onChange={(e) => {
                            setFilterYear(e.target.value);
                            setFilterMonth(''); // Reset month if year changes
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                        {generateYearOptions().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                {/* Filter by Month */}
                <div>
                    <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700">Month</label>
                    <select
                        id="filterMonth"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                        // Only enable month selection if a year is chosen
                        // disabled={!filterYear}
                    >
                        <option value="">All Months</option>
                        {/* Always show all months, combine with selected year in buildFeeFilterQueryParams */}
                        {months.map((monthName) => (
                            <option key={monthName} value={monthName}>
                                {monthName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter by Receiver Name */}
                <div>
                    <label htmlFor="filterReceivedBy" className="block text-sm font-medium text-gray-700">Received By</label>
                    <select
                        id="filterReceivedBy"
                        value={filterReceivedBy}
                        onChange={(e) => setFilterReceivedBy(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                        <option value="">All Receivers</option>
                        {uniqueReceiverNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Filter by Payment Method */}
                <div>
                    <label htmlFor="filterPaymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                        id="filterPaymentMethod"
                        value={filterPaymentMethod}
                        onChange={(e) => setFilterPaymentMethod(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                        <option value="">All Methods</option>
                        <option value="Cash">Cash</option>
                        <option value="Online Wallet">Online Wallet</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button onClick={fetchFees} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Apply Filters</button>
                <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
            </div>
          </div>
        )}
      </div>
      {/* --- End Fee Filters Section --- */}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-white">Student</th>
              <th className="p-2 border border-white">Month</th>
              <th className="p-2 border border-white">Received By</th>
              <th className="p-2 border border-white">Date</th>
              <th className="p-2 border border-white">Method</th>
              <th className="p-2 border border-white">Screenshot</th>
              <th className="p-2 border border-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(fees) && fees.length > 0 ? (
              fees.map((fee, index) => (
                <tr key={fee._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border border-white p-2">{fee.studentId?.name || 'Unknown Student'}</td>
                  <td className="border border-white p-2">{fee.month}</td>
                  <td className="border border-white p-2">{fee.receivedBy}</td>
                  <td className="border border-white p-2">
                    {fee.receivedDate ? new Date(fee.receivedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="border border-white p-2">{fee.paymentMethod}</td>
                  <td className="border border-white p-2">
                    {fee.billScreenshotUrl ? (
                      <a href={fee.billScreenshotUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View</a>
                    ) : 'N/A'}
                  </td>
                  <td className="border border-white p-2 space-x-2 flex justify-center items-center">
                    <button onClick={() => handleEdit(fee)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Fee Record">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(fee._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Fee Record">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">No fee records found. Add a new record!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <FeeForm
          editingFee={editingFee}
          fetchFees={fetchFees}
          onClose={handleCloseModal}
          students={studentsForForm}
        />
      </Modal>
    </div>
  );
};

export default FeeList;