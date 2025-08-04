import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../App';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import AddEditBillModal from '../components/AddEditBillModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faFileDownload, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getMonthDateRange } from '../utils/dateUtils'; // Assuming you have this utility
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const billCategories = ['Utilities', 'Salary', 'Vendor Payment', 'Repairs', 'Other'];
const billStatuses = ['Paid', 'Unpaid', 'Partial'];

const BillingManagement = () => {
  const { currentUser: user } = useContext(UserContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
//   const [filterMonth, setFilterMonth] = useState('');
    const [filterMonth, setFilterMonth] = useState(null); 

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
    //   if (filterMonth) {
    //     const { startDate, endDate } = getMonthDateRange(filterMonth);
    //     params.startDate = startDate;
    //     params.endDate = endDate;
    //   }
    if (filterMonth) {
        // Format the Date object into the 'YYYY-MM' string format
        const formattedMonth = `${filterMonth.getFullYear()}-${(filterMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        const { startDate, endDate } = getMonthDateRange(formattedMonth);
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const { data } = await api.get('/billing', { params });
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.response?.data?.message || 'Failed to fetch bills.');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, filterMonth]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'accountant')) {
      fetchBills();
    }
  }, [user, fetchBills]);

  const handleAddBill = (newBill) => {
    setBills([newBill, ...bills]);
    setIsModalOpen(false);
  };

  const handleEditBill = (updatedBill) => {
    setBills(bills.map(b => b._id === updatedBill._id ? updatedBill : b));
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.delete(`/billing/${id}`);
        setBills(bills.filter(b => b._id !== id));
      } catch (err) {
        console.error('Error deleting bill:', err);
        setError(err.response?.data?.message || 'Failed to delete bill.');
      }
    }
  };

  const handleDownloadReceipt = async (billId) => {
    try {
      const response = await api.get(`/billing/${billId}/receipt`, {
        responseType: 'blob', // Important for downloading binary files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_summary_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError(err.response?.data?.message || 'Failed to download receipt.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'accountant')) {
    return <Message type="error">You are not authorized to view this page.</Message>;
  }

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Billing Management</h2>

        {/* Filter Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter Bills</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {billStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
              {/* <input
                type="month"
                id="month"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              /> */}
              <DatePicker
                selected={filterMonth}
                onChange={(date) => setFilterMonth(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                placeholderText="Select a month"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={fetchBills}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setSelectedBill(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Bill
          </button>
        </div>

        {error && <Message type="error">{error}</Message>}

        {loading ? (
          <Loader />
        ) : bills.length === 0 ? (
          <Message type="info">No bills found with the selected filters.</Message>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PKR {parseFloat(bill.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        bill.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill._id)}
                          className="text-red-600 hover:text-red-900 transition duration-150"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(bill._id)}
                          className="text-purple-600 hover:text-purple-900 transition duration-150"
                          title="Download Receipt"
                        >
                          <FontAwesomeIcon icon={faFileDownload} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Bill Modal */}
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBill(null); }} title={selectedBill ? "Edit Bill" : "Add New Bill"}>
          <AddEditBillModal
            billToEdit={selectedBill}
            onAdd={handleAddBill}
            onEdit={handleEditBill}
            onClose={() => { setIsModalOpen(false); setSelectedBill(null); }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default BillingManagement;