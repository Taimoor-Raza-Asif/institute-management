// // src/screens/StaffSalaryListScreen.jsx
// import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import {
//   CurrencyDollarIcon, EyeIcon, PencilIcon, TrashIcon, PlusCircleIcon, DocumentArrowDownIcon, XMarkIcon
// } from '@heroicons/react/24/outline';
// import jsPDF from 'jspdf';

// const StaffSalaryList = () => {
//   const { currentUser: user } = useContext(UserContext);
//   const navigate = useNavigate();

//   const [salaries, setSalaries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [filterRole, setFilterRole] = useState('');
//   const [filterMonth, setFilterMonth] = useState('');
//   const [filterYear, setFilterYear] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   // Modal states
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSalary, setSelectedSalary] = useState(null);

//   const isAdmin = user?.role === 'admin' || user?.role === 'accountant';
//   const canEditOrDelete = isAdmin;

//   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);
//   const staffRoles = ['admin', 'teacher', 'accountant', 'cook', 'cleaner'];
//   const salaryStatuses = ['Paid', 'Unpaid', 'Partial Paid'];

//   const fetchSalaries = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       let endpoint = isAdmin ? '/salary/all' : '/salary/my-salaries';
//       const params = new URLSearchParams();

//       if (filterRole) params.append('role', filterRole);
//       if (filterMonth) params.append('month', filterMonth);
//       if (filterYear) params.append('year', filterYear);
//       if (filterStatus) params.append('status', filterStatus);

//       const { data } = await api.get(endpoint, { params });
//       setSalaries(data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch salary records.');
//     } finally {
//       setLoading(false);
//     }
//   }, [isAdmin, filterRole, filterMonth, filterYear, filterStatus]);

//   useEffect(() => {
//     if (user) {
//       fetchSalaries();
//     }
//   }, [user, fetchSalaries]);

//   const handleDownloadReceiptPdf = useCallback((salaryId) => {
//     const salary = salaries.find(s => s._id === salaryId);
//     if (!salary) {
//       console.error("Salary not found for receipt generation.");
//       return;
//     }

//     const doc = new jsPDF({ format: 'a4' });
//     const filename = `${salary.staffName.replace(/\s/g, '_')}_Salary_Receipt_${months[salary.month - 1]}_${salary.year}.pdf`;

//     const savePDF = () => {
//       doc.save(filename);
//     };

//     const drawMiniReceipt = (xStart, yStart) => {
//       let yPos = yStart;

//       const logo = new Image();
//       logo.src = '/default-avatar.jpg';

//       logo.onload = () => {
//         doc.addImage(logo, 'JPEG', xStart, yPos, 15, 15);

//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text('Bright Future Institute', xStart + 17, yPos + 5);
//         doc.setFontSize(8);
//         doc.setFont(undefined, 'normal');
//         doc.text('123 Education St, Knowledge City', xStart + 17, yPos + 10);
//         doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', xStart + 17, yPos + 14);

//         doc.line(xStart, yPos + 18, xStart + 80, yPos + 18);

//         doc.setFontSize(9);
//         doc.setFont(undefined, 'bold');
//         doc.setTextColor(40, 167, 69);
//         doc.text('Salary Slip', xStart + 40, yPos + 24, { align: 'center' });

//         doc.setFontSize(7);
//         doc.setTextColor(100);
//         doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 29);

//         yPos += 34;
//         doc.setFontSize(8);
//         doc.setTextColor(0);
//         doc.setFont(undefined, 'bold');
//         doc.text('Staff Information', xStart, yPos);
//         yPos += 4;
//         doc.line(xStart, yPos, xStart + 80, yPos);
//         yPos += 5;

//         doc.setFont(undefined, 'normal');
//         const addField = (label, value, xOffset = 5) => {
//           doc.text(`${label}:`, xStart + xOffset, yPos);
//           doc.text(`${value}`, xStart + 40, yPos);
//           yPos += 4;
//         };

//         addField('Name', salary.staffName);
//         addField('CNIC', salary.staffCnic);
//         addField('Role', salary.staffRole);
//         yPos += 6;

//         doc.setFont(undefined, 'bold');
//         doc.text('Salary Details', xStart, yPos);
//         yPos += 4;
//         doc.line(xStart, yPos, xStart + 80, yPos);
//         yPos += 5;

//         doc.setFont(undefined, 'normal');
//         addField('Salary per Month', `PKR ${parseFloat(salary.salaryPerMonth).toFixed(2)}`);
//         addField('Bonus', `PKR ${parseFloat(salary.bonus).toFixed(2)}`);
//         addField('Overtime', `PKR ${parseFloat(salary.overtime).toFixed(2)}`);
//         addField('Paid Amount', `PKR ${parseFloat(salary.paidAmount).toFixed(2)}`);
//         addField('Status', salary.status);
//         addField('Paid Month', months[salary.month - 1]);
//         addField('Paid Year', salary.year);
//         addField('Paid By', salary.paidByName || '-');
//         addField('Paid As', salary.paidAs);
//         addField('Paid At', new Date(salary.paidAt).toLocaleDateString());

//         yPos += 5;

//         doc.setFontSize(7);
//         doc.setTextColor(150);
//         doc.text('This is a computer-generated salary slip. No signature is required.', xStart, yPos + 5);

//         savePDF();
//       };

//       logo.onerror = () => {
//         console.warn('Failed to load logo.');
//         savePDF();
//       };
//     };
//     drawMiniReceipt(10, 10);
//   }, [salaries, months]);

//   const handleViewReceipt = (salaryId) => {
//     const salary = salaries.find(s => s._id === salaryId);
//     if (salary) {
//       setSelectedSalary(salary);
//       setIsModalOpen(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedSalary(null);
//   };

//   const handleEdit = (salaryId) => {
//     navigate(`/salary/edit/${salaryId}`);
//   };

//   const handleDelete = (salaryId) => {
//     console.log("Deleting salary:", salaryId);
//     // TODO: Implement delete logic
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
//       <div className="flex justify-between items-center mb-6 border-b pb-4">
//         <h2 className="text-3xl font-bold text-gray-800 flex items-center">
//           <CurrencyDollarIcon className="h-8 w-8 mr-3 text-indigo-600" />
//           {isAdmin ? 'All Staff Salaries' : 'My Salary History'}
//         </h2>
//         {isAdmin && (
//           <Link to="/salary/add" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center">
//             <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Salary
//           </Link>
//         )}
//       </div>

//       {isAdmin && (
//         <div className="flex flex-wrap items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-lg font-medium text-gray-700">Filters:</h3>
//           <select
//             value={filterRole}
//             onChange={(e) => setFilterRole(e.target.value)}
//             className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             <option value="">All Roles</option>
//             {staffRoles.map(role => (
//               <option key={role} value={role}>{role}</option>
//             ))}
//           </select>
//           <select
//             value={filterMonth}
//             onChange={(e) => setFilterMonth(e.target.value)}
//             className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             <option value="">All Months</option>
//             {months.map((month, index) => (
//               <option key={index + 1} value={index + 1}>{month}</option>
//             ))}
//           </select>
//           <select
//             value={filterYear}
//             onChange={(e) => setFilterYear(e.target.value)}
//             className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             <option value="">All Years</option>
//             {years.map(year => (
//               <option key={year} value={year}>{year}</option>
//             ))}
//           </select>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             <option value="">All Statuses</option>
//             {salaryStatuses.map(status => (
//               <option key={status} value={status}>{status}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {loading ? (
//         <Loader />
//       ) : error ? (
//         <Message type="error">{error}</Message>
//       ) : salaries.length === 0 ? (
//         <Message type="info">No salary records found.</Message>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Staff
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   CNIC
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Month/Year
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Salary
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Paid By
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {salaries.map(salary => (
//                 <tr key={salary._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {salary.staffName} ({salary.staffRole})
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {salary.staffCnic}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {months[salary.month - 1]}, {salary.year}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     Rs. {salary.salaryPerMonth}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                       ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
//                       ${salary.status === 'Unpaid' ? 'bg-red-100 text-red-800' : ''}
//                       ${salary.status === 'Partial Paid' ? 'bg-yellow-100 text-yellow-800' : ''}`
//                     }>
//                       {salary.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {salary.paidByName || 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
//                     <button onClick={(e) => { e.stopPropagation(); handleViewReceipt(salary._id); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Receipt">
//                       <EyeIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); handleDownloadReceiptPdf(salary._id); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="Download Receipt">
//                       <DocumentArrowDownIcon className="h-5 w-5" />
//                     </button>
//                     {canEditOrDelete && (
//                       <>
//                         <button onClick={(e) => { e.stopPropagation(); handleEdit(salary._id); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Salary Record">
//                           <PencilIcon className="h-5 w-5" />
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); handleDelete(salary._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Salary Record">
//                           <TrashIcon className="h-5 w-5" />
//                         </button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Modal for viewing salary receipt */}
//       {isModalOpen && selectedSalary && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
//           <div className="relative p-8 border w-full max-w-lg shadow-lg rounded-md bg-white">
//             <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//             <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Salary Details</h3>
//             <div className="space-y-2 text-sm text-gray-700">
//               <p><strong>Staff Name:</strong> {selectedSalary.staffName}</p>
//               <p><strong>CNIC:</strong> {selectedSalary.staffCnic}</p>
//               <p><strong>Role:</strong> {selectedSalary.staffRole}</p>
//               <p><strong>Month:</strong> {months[selectedSalary.month - 1]}, {selectedSalary.year}</p>
//               <p><strong>Salary per Month:</strong> Rs. {parseFloat(selectedSalary.salaryPerMonth).toFixed(2)}</p>
//               <p><strong>Paid Amount:</strong> Rs. {parseFloat(selectedSalary.paidAmount).toFixed(2)}</p>
//               <p><strong>Status:</strong> {selectedSalary.status}</p>
//               <p><strong>Bonus:</strong> Rs. {parseFloat(selectedSalary.bonus).toFixed(2)}</p>
//               <p><strong>Overtime:</strong> Rs. {parseFloat(selectedSalary.overtime).toFixed(2)}</p>
//               <p><strong>Paid By:</strong> {selectedSalary.paidByName || 'N/A'}</p>
//               <p><strong>Paid As:</strong> {selectedSalary.paidAs}</p>
//               <p><strong>Paid At:</strong> {new Date(selectedSalary.paidAt).toLocaleString()}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffSalaryList;





// src/components/StaffSalaryList.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import Loader from './Loader';
import Message from './Message';
import Modal from './Modal';
import SalaryForm from './SalaryForm';
import {
  CurrencyDollarIcon, EyeIcon, PencilIcon, TrashIcon, PlusCircleIcon, DocumentArrowDownIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'react-datepicker/dist/react-datepicker.css';

const StaffSalaryList = () => {
  const { currentUser: user } = useContext(UserContext);
  const navigate = useNavigate();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'accountant';
  const canEditOrDelete = isAdmin;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);
  const staffRoles = ['admin', 'teacher', 'accountant', 'cook', 'cleaner'];
  const salaryStatuses = ['Paid', 'Unpaid', 'Partial Paid'];

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = isAdmin ? '/salary/all' : '/salary/my-salaries';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      if (filterStatus) params.append('status', filterStatus);

      const { data } = await api.get(endpoint, { params });
      setSalaries(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salary records.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, searchTerm, filterRole, filterMonth, filterYear, filterStatus]);

  useEffect(() => {
    if (user) {
      fetchSalaries();
    }
  }, [user, fetchSalaries]);

  const handleDownloadReceiptPdf = useCallback((salaryId) => {
    const salary = salaries.find(s => s._id === salaryId);
    if (!salary) {
      console.error("Salary not found for receipt generation.");
      return;
    }

    const doc = new jsPDF({ format: 'a4' });
    const filename = `${salary.staffName.replace(/\s/g, '_')}_Salary_Receipt_${months[salary.month - 1]}_${salary.year}.pdf`;

    const savePDF = () => {
      doc.save(filename);
    };

    const drawMiniReceipt = (xStart, yStart) => {
      let yPos = yStart;

      const logo = new Image();
      logo.src = '/default-avatar.jpg';

      logo.onload = () => {
        doc.addImage(logo, 'JPEG', xStart, yPos, 15, 15);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Bright Future Institute', xStart + 17, yPos + 5);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('123 Education St, Knowledge City', xStart + 17, yPos + 10);
        doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', xStart + 17, yPos + 14);

        doc.line(xStart, yPos + 18, xStart + 80, yPos + 18);

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Salary Slip', xStart + 40, yPos + 24, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 29);

        yPos += 34;
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('Staff Information', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        const addField = (label, value, xOffset = 5) => {
          doc.text(`${label}:`, xStart + xOffset, yPos);
          doc.text(`${value}`, xStart + 40, yPos);
          yPos += 4;
        };

        addField('Name', salary.staffName);
        addField('CNIC', salary.staffCnic);
        addField('Role', salary.staffRole);
        yPos += 6;

        doc.setFont(undefined, 'bold');
        doc.text('Salary Details', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        addField('Salary per Month', `PKR ${parseFloat(salary.salaryPerMonth).toFixed(2)}`);
        addField('Bonus', `PKR ${parseFloat(salary.bonus).toFixed(2)}`);
        addField('Overtime', `PKR ${parseFloat(salary.overtime).toFixed(2)}`);
        addField('Paid Amount', `PKR ${parseFloat(salary.paidAmount).toFixed(2)}`);
        addField('Status', salary.status);
        addField('Paid Month', months[salary.month - 1]);
        addField('Paid Year', salary.year);
        addField('Paid By', salary.paidByName || '-');
        addField('Paid As', salary.paidAs);
        addField('Paid At', new Date(salary.paidAt).toLocaleDateString());

        yPos += 5;

        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('This is a computer-generated salary slip. No signature is required.', xStart, yPos + 5);

        savePDF();
      };

      logo.onerror = () => {
        console.warn('Failed to load logo.');
        savePDF();
      };
    };
    drawMiniReceipt(10, 10);
  }, [salaries, months]);

  const handleViewReceipt = (salaryId) => {
    const salary = salaries.find(s => s._id === salaryId);
    if (salary) {
      setSelectedSalary(salary);
      setIsViewMode(true);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSalary(null);
    setIsViewMode(false);
  };

  const handleEdit = (salaryId) => {
    navigate(`/salary/edit/${salaryId}`);
  };

  const handleDelete = async (salaryId) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) return;

    try {
      await api.delete(`/salary/${salaryId}`);
      alert('Salary record deleted successfully.');

      // Refresh the list after deletion (assumes you have a fetchSalaries method)
      fetchSalaries?.(); // call your fetch function again if available

    } catch (error) {
      console.error('Failed to delete salary record:', error);
      alert(error.response?.data?.message || 'Failed to delete salary record.');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Staff Salary Management</h1>
      {error && <Message type="error">{error}</Message>}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              placeholder="Search by staff name or CNIC..."
              className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {isAdmin && (
              <Link
                to="/salary/add"
                className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add New Record
              </Link>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md shadow-inner">
            <div>
              <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Roles</option>
                {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterMonth" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                id="filterMonth"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Months</option>
                {months.map((m, index) => <option key={index + 1} value={index + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterYear" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                id="filterYear"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                {salaryStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : salaries.length > 0 ? (
        <div className="bg-white shadow overflow-auto rounded-lg">
          <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-auto">
            <thead className="bg-green-600 text-white rounded-md">
              <tr>
                <th className="p-2 border border-white text-left">Staff Member</th>
                <th className="p-2 border border-white text-left">Role</th>
                <th className="p-2 border border-white text-left">Month/Year</th>
                <th className="p-2 border border-white text-left">Paid Amount</th>
                <th className="p-2 border border-white text-left">Status</th>
                <th className="p-2 border border-white text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.map((salary, index) => (
                <tr key={salary._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 text-left">{salary.staffName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">{salary.staffRole}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">{months[salary.month - 1]} {salary.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500 text-left">PKR {parseFloat(salary.paidAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-left">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {salary.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-base font-medium flex items-center space-x-2">
                    <button onClick={() => handleViewReceipt(salary._id)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {canEditOrDelete && (
                      <>
                        <button onClick={() => handleEdit(salary._id)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(salary._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDownloadReceiptPdf(salary._id)} className="text-purple-600 hover:text-purple-800 transition-colors duration-200 p-1 rounded-md hover:bg-purple-100" title="Download Receipt">
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-base">No salary records found.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isViewMode ? "Salary Details" : "Edit Salary"}>
        <SalaryForm salaryToEdit={selectedSalary} isViewMode={isViewMode} onAdd={fetchSalaries} onEdit={fetchSalaries} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default StaffSalaryList;