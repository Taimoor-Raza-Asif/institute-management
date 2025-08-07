// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { UserContext } from '../App';
// import api from '../api';
// import Message from '../components/Message';
// import Loader from '../components/Loader';
// import Modal from '../components/Modal';
// import AddEditBillModal from '../components/AddEditBillModal';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlus, faEdit, faTrash, faFileDownload, faSearch } from '@fortawesome/free-solid-svg-icons';
// import { getMonthDateRange } from '../utils/dateUtils'; // Assuming you have this utility
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const billCategories = ['Utilities', 'Salary', 'Vendor Payment', 'Repairs', 'Other'];
// const billStatuses = ['Paid', 'Unpaid', 'Partial'];

// const BillingManagement = () => {
//   const { currentUser: user } = useContext(UserContext);
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedBill, setSelectedBill] = useState(null);

//   // Filters
//   const [filterCategory, setFilterCategory] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');
// //   const [filterMonth, setFilterMonth] = useState('');
//     const [filterMonth, setFilterMonth] = useState(null); 

//   const fetchBills = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = {};
//       if (filterCategory) params.category = filterCategory;
//       if (filterStatus) params.status = filterStatus;
//     //   if (filterMonth) {
//     //     const { startDate, endDate } = getMonthDateRange(filterMonth);
//     //     params.startDate = startDate;
//     //     params.endDate = endDate;
//     //   }
//     if (filterMonth) {
//         // Format the Date object into the 'YYYY-MM' string format
//         const formattedMonth = `${filterMonth.getFullYear()}-${(filterMonth.getMonth() + 1).toString().padStart(2, '0')}`;
//         const { startDate, endDate } = getMonthDateRange(formattedMonth);
//         params.startDate = startDate;
//         params.endDate = endDate;
//       }
//       const { data } = await api.get('/billing', { params });
//       setBills(data);
//     } catch (err) {
//       console.error('Error fetching bills:', err);
//       setError(err.response?.data?.message || 'Failed to fetch bills.');
//     } finally {
//       setLoading(false);
//     }
//   }, [filterCategory, filterStatus, filterMonth]);

//   useEffect(() => {
//     if (user && (user.role === 'admin' || user.role === 'accountant')) {
//       fetchBills();
//     }
//   }, [user, fetchBills]);

//   const handleAddBill = (newBill) => {
//     setBills([newBill, ...bills]);
//     setIsModalOpen(false);
//   };

//   const handleEditBill = (updatedBill) => {
//     setBills(bills.map(b => b._id === updatedBill._id ? updatedBill : b));
//     setIsModalOpen(false);
//     setSelectedBill(null);
//   };

//   const handleDeleteBill = async (id) => {
//     if (window.confirm('Are you sure you want to delete this bill?')) {
//       try {
//         await api.delete(`/billing/${id}`);
//         setBills(bills.filter(b => b._id !== id));
//       } catch (err) {
//         console.error('Error deleting bill:', err);
//         setError(err.response?.data?.message || 'Failed to delete bill.');
//       }
//     }
//   };

//   const handleDownloadReceipt = async (billId) => {
//     try {
//       const response = await api.get(`/billing/${billId}/receipt`, {
//         responseType: 'blob', // Important for downloading binary files
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `bill_summary_${billId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } catch (err) {
//       console.error('Error downloading receipt:', err);
//       setError(err.response?.data?.message || 'Failed to download receipt.');
//     }
//   };

//   if (!user || (user.role !== 'admin' && user.role !== 'accountant')) {
//     return <Message type="error">You are not authorized to view this page.</Message>;
//   }

//   return (
//     <div className="container mx-auto p-6 lg:p-8">
//       <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8">
//         <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Billing Management</h2>

//         {/* Filter Section */}
//         <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter Bills</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
//               <select
//                 id="category"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterCategory}
//                 onChange={(e) => setFilterCategory(e.target.value)}
//               >
//                 <option value="">All Categories</option>
//                 {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
//               <select
//                 id="status"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="">All Statuses</option>
//                 {billStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
//               {/* <input
//                 type="month"
//                 id="month"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterMonth}
//                 onChange={(e) => setFilterMonth(e.target.value)}
//               /> */}
//               <DatePicker
//                 selected={filterMonth}
//                 onChange={(date) => setFilterMonth(date)}
//                 dateFormat="MM/yyyy"
//                 showMonthYearPicker
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 placeholderText="Select a month"
//               />
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={fetchBills}
//               className="flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
//             >
//               <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end mb-6">
//           <button
//             onClick={() => {
//               setSelectedBill(null);
//               setIsModalOpen(true);
//             }}
//             className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
//           >
//             <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Bill
//           </button>
//         </div>

//         {error && <Message type="error">{error}</Message>}

//         {loading ? (
//           <Loader />
//         ) : bills.length === 0 ? (
//           <Message type="info">No bills found with the selected filters.</Message>
//         ) : (
//           <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50 sticky top-0">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {bills.map((bill) => (
//                   <tr key={bill._id} className="hover:bg-gray-50 transition duration-150">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.title}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.category}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PKR {parseFloat(bill.amount).toFixed(2)}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
//                         bill.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>
//                         {bill.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bill.billDate).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center space-x-3">
//                         <button
//                           onClick={() => {
//                             setSelectedBill(bill);
//                             setIsModalOpen(true);
//                           }}
//                           className="text-indigo-600 hover:text-indigo-900 transition duration-150"
//                           title="Edit"
//                         >
//                           <FontAwesomeIcon icon={faEdit} />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteBill(bill._id)}
//                           className="text-red-600 hover:text-red-900 transition duration-150"
//                           title="Delete"
//                         >
//                           <FontAwesomeIcon icon={faTrash} />
//                         </button>
// <button
//   onClick={() => handleDownloadReceipt(bill._id)}
//   className="text-purple-600 hover:text-purple-900 transition duration-150"
//   title="Download Receipt"
// >
//   <FontAwesomeIcon icon={faFileDownload} />
// </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Add/Edit Bill Modal */}
//         <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBill(null); }} title={selectedBill ? "Edit Bill" : "Add New Bill"}>
//           <AddEditBillModal
//             billToEdit={selectedBill}
//             onAdd={handleAddBill}
//             onEdit={handleEditBill}
//             onClose={() => { setIsModalOpen(false); setSelectedBill(null); }}
//           />
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default BillingManagement;



import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../App';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import AddEditBillModal from '../components/AddEditBillModal';
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

    const handleDeleteBill = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            setLoading(true);
            try {
                await api.delete(`/billing/${id}`);
                fetchBills();
            } catch (err) {
                setError('Failed to delete bill.');
            } finally {
                setLoading(false);
            }
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
        <div className="container mx-auto p-4 sm:p-6 lg:p-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Billing Management</h1>
            {error && <Message type="error">{error}</Message>}

            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <div className="relative w-full sm:w-1/2 lg:w-2/3">
                        <input
                            type="text"
                            placeholder="Search by title or paid to..."
                            className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-green-500 focus:border-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                        </button>
                        {isAllowed && (
                            <button
                                onClick={handleAddBill}
                                className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add New Bill
                            </button>
                        )}
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md shadow-inner">
                        <div>
                            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="filterCategory"
                                name="filterCategory"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                id="filterStatus"
                                name="filterStatus"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {billStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <DatePicker
                                selected={filterMonth}
                                onChange={(date) => setFilterMonth(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholderText="Select Month"
                            />
                        </div>
                        <div className="col-span-full flex justify-end">
                            <button onClick={handleResetFilters} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md">
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white shadow overflow-auto rounded-lg">
                    <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-auto">
                        <thead className="bg-green-600 text-white rounded-md">
                            <tr>
                                <th className="p-2 border border-white text-left">Title</th>
                                <th className="p-2 border border-white text-left">Category</th>
                                <th className="p-2 border border-white text-left">Amount</th>
                                <th className="p-2 border border-white text-left">Status</th>
                                <th className="p-2 border border-white text-left">Bill Date</th>
                                <th className="p-2 border border-white text-left">Paid To</th>
                                <th className="p-2 border border-white text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bills.length > 0 ? bills.map((bill, index) => (
                                <tr key={bill._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}>
                                    {/* Updated font size to 'text-base' for better readability */}
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 text-left">{bill.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">{bill.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">PKR {bill.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-left">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.status === 'Paid' ? 'bg-green-100 text-green-800' : bill.status === 'Unpaid' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">{new Date(bill.billDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">{bill.paidTo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-base font-medium flex items-center space-x-2">
                                        {/* Added the new View button */}
                                        <button onClick={() => handleViewBill(bill)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Bill Details">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        {isAllowed && (
                                            <>
                                                <button onClick={() => handleEditBill(bill)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDeleteBill(bill._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                            <button onClick={() => handleDownloadReceipt(bill._id)} className="text-purple-600 hover:text-purple-800 transition-colors duration-200 p-1 rounded-md hover:bg-purple-100" title="Download Receipt">
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                            </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-gray-500 text-base">No bills found. {isAllowed && 'Add a new bill!'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
        </div>
    );
};

export default BillingManagement;