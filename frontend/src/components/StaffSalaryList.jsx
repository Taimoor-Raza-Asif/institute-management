// // src/screens/StaffSalaryListScreen.jsx
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import {
//   CurrencyDollarIcon, PencilSquareIcon, PlusCircleIcon, DocumentArrowDownIcon
// } from '@heroicons/react/24/outline';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const StaffSalaryList = () => {
//   const { currentUser: user } = useContext(UserContext);

//   const [salaries, setSalaries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const isAdmin = user?.role === 'admin';

//   const fetchSalaries = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       let endpoint = isAdmin ? '/salary/all' : '/salary/my-salaries';
//       const { data } = await api.get(endpoint);
//       setSalaries(data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch salary records.');
//     } finally {
//       setLoading(false);
//     }
//   }, [isAdmin]);

//   useEffect(() => {
//     if (user) {
//       fetchSalaries();
//     }
//   }, [user, fetchSalaries]);

//   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//   const generateReceipt = useCallback((salaryId) => {
//     const salary = salaries.find(s => s._id === salaryId);
//     if (!salary) return;

//     const input = document.getElementById(`receipt-${salaryId}`);
//     if (!input) return;

//     html2canvas(input).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const imgWidth = 210;
//       const pageHeight = 295;
//       const imgHeight = canvas.height * imgWidth / canvas.width;
//       let heightLeft = imgHeight;

//       let position = 0;

//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }
//       pdf.save(`salary-receipt-${salary.staffName}-${monthNames[salary.month - 1]}-${salary.year}.pdf`);
//     });
//   }, [salaries, monthNames]);

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
//       <div className="flex justify-between items-center mb-6 border-b pb-4">
//         <h2 className="text-3xl font-bold text-gray-800 flex items-center">
//           <CurrencyDollarIcon className="h-8 w-8 mr-3 text-indigo-600" />
//           {isAdmin ? 'All Staff Salaries' : 'My Salary History'}
//         </h2>
//         {isAdmin && (
//           <Link to="/admin/salary/add" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center">
//             <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Salary
//           </Link>
//         )}
//       </div>

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
//                 <React.Fragment key={salary._id}>
//                   <tr className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {salary.staffName} ({salary.staffRole})
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {salary.staffCnic}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {monthNames[salary.month - 1]}, {salary.year}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       Rs. {salary.salaryPerMonth}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                         ${salary.status === 'Paid' && 'bg-green-100 text-green-800'}
//                         ${salary.status === 'Unpaid' && 'bg-red-100 text-red-800'}
//                         ${salary.status === 'Partial Paid' && 'bg-yellow-100 text-yellow-800'}`
//                       }>
//                         {salary.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {salary.paidByName || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       {isAdmin && (
//                         <Link to={`/admin/salary/edit/${salary._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
//                           <PencilSquareIcon className="h-5 w-5 inline" />
//                         </Link>
//                       )}
//                       <button
//                         onClick={() => generateReceipt(salary._id)}
//                         className="text-gray-600 hover:text-gray-900"
//                         title="Download Receipt"
//                       >
//                         <DocumentArrowDownIcon className="h-5 w-5 inline" />
//                       </button>
//                     </td>
//                   </tr>
//                   <tr id={`receipt-${salary._id}`} className="hidden print:table-row">
//                     <td colSpan="7">
//                       <div className="p-6">
//                         <h3 className="text-2xl font-bold">Salary Slip</h3>
//                         <p><strong>Staff Name:</strong> {salary.staffName}</p>
//                         <p><strong>Month:</strong> {monthNames[salary.month - 1]}, {salary.year}</p>
//                         <p><strong>Paid Amount:</strong> Rs. {salary.paidAmount}</p>
//                         <p><strong>Bonus:</strong> Rs. {salary.bonus}</p>
//                         <p><strong>Overtime:</strong> Rs. {salary.overtime}</p>
//                         <p><strong>Total Payable:</strong> Rs. {parseFloat(salary.paidAmount) + parseFloat(salary.bonus) + parseFloat(salary.overtime)}</p>
//                         <p><strong>Paid By:</strong> {salary.paidByName}</p>
//                         <p><strong>Paid At:</strong> {new Date(salary.paidAt).toLocaleString()}</p>
//                       </div>
//                     </td>
//                   </tr>
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffSalaryList;






// // src/screens/StaffSalaryListScreen.jsx
// import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import {
//   CurrencyDollarIcon, PencilSquareIcon, PlusCircleIcon, DocumentArrowDownIcon, EyeIcon, PencilIcon, TrashIcon
// } from '@heroicons/react/24/outline';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const StaffSalaryListScreen = () => {
//   const { currentUser: user } = useContext(UserContext);

//   const [salaries, setSalaries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [filterRole, setFilterRole] = useState('');
//   const [filterMonth, setFilterMonth] = useState('');
//   const [filterYear, setFilterYear] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');

//   const isAdmin = user?.role === 'admin';
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

//   const generateReceipt = useCallback((salaryId) => {
//     const salary = salaries.find(s => s._id === salaryId);
//     if (!salary) {
//       console.error("Salary not found for receipt generation.");
//       return;
//     }

//     const input = document.getElementById(`receipt-${salaryId}`);
//     if (!input) {
//       console.error(`Receipt element with id 'receipt-${salaryId}' not found.`);
//       return;
//     }
    
//     input.style.display = 'block';
    
//     html2canvas(input, {
//       scale: 2,
//       useCORS: true
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const imgWidth = 210;
//       const pageHeight = 295;
//       const imgHeight = canvas.height * imgWidth / canvas.width;
//       let heightLeft = imgHeight;

//       let position = 0;

//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }
//       pdf.save(`salary-receipt-${salary.staffName}-${months[salary.month - 1]}-${salary.year}.pdf`);
      
//       input.style.display = 'none';
//     }).catch(err => {
//       console.error("Error generating receipt:", err);
//       input.style.display = 'none';
//     });
//   }, [salaries, months]);

//   const handleViewReceipt = useCallback((salaryId) => {
//     generateReceipt(salaryId);
//   }, [generateReceipt]);

//   const handleEdit = (salaryId) => {
//     // Implement navigation to edit page
//     console.log("Editing salary:", salaryId);
//   };

//   const handleDelete = (salaryId) => {
//     // Implement delete logic
//     console.log("Deleting salary:", salaryId);
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
//       <div className="flex justify-between items-center mb-6 border-b pb-4">
//         <h2 className="text-3xl font-bold text-gray-800 flex items-center">
//           <CurrencyDollarIcon className="h-8 w-8 mr-3 text-indigo-600" />
//           {isAdmin ? 'All Staff Salaries' : 'My Salary History'}
//         </h2>
//         {isAdmin && (
//           <Link to="/admin/salary/add" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center">
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
//                 <React.Fragment key={salary._id}>
//                   <tr className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {salary.staffName} ({salary.staffRole})
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {salary.staffCnic}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {months[salary.month - 1]}, {salary.year}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       Rs. {salary.salaryPerMonth}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                         ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
//                         ${salary.status === 'Unpaid' ? 'bg-red-100 text-red-800' : ''}
//                         ${salary.status === 'Partial Paid' ? 'bg-yellow-100 text-yellow-800' : ''}`
//                       }>
//                         {salary.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {salary.paidByName || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
//                       <button onClick={(e) => { e.stopPropagation(); handleViewReceipt(salary._id); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="Download Receipt">
//                         <DocumentArrowDownIcon className="h-5 w-5" />
//                       </button>
//                       {canEditOrDelete && (
//                         <>
//                           <button onClick={(e) => { e.stopPropagation(); handleEdit(salary._id); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Salary Record">
//                             <PencilIcon className="h-5 w-5" />
//                           </button>
//                           <button onClick={(e) => { e.stopPropagation(); handleDelete(salary._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Salary Record">
//                             <TrashIcon className="h-5 w-5" />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                   <tr id={`receipt-${salary._id}`} className="absolute w-[210mm] p-6 bg-white border border-gray-300 hidden">
//                     <td colSpan="7">
//                       <div className="p-6">
//                         <h3 className="text-2xl font-bold">Salary Slip</h3>
//                         <p><strong>Staff Name:</strong> {salary.staffName}</p>
//                         <p><strong>Month:</strong> {months[salary.month - 1]}, {salary.year}</p>
//                         <p><strong>Paid Amount:</strong> Rs. {salary.paidAmount}</p>
//                         <p><strong>Bonus:</strong> Rs. {salary.bonus}</p>
//                         <p><strong>Overtime:</strong> Rs. {salary.overtime}</p>
//                         <p><strong>Total Payable:</strong> Rs. {parseFloat(salary.paidAmount) + parseFloat(salary.bonus) + parseFloat(salary.overtime)}</p>
//                         <p><strong>Paid By:</strong> {salary.paidByName}</p>
//                         <p><strong>Paid At:</strong> {new Date(salary.paidAt).toLocaleString()}</p>
//                       </div>
//                     </td>
//                   </tr>
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffSalaryListScreen;




// src/screens/StaffSalaryListScreen.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  CurrencyDollarIcon, EyeIcon, PencilIcon, TrashIcon, PlusCircleIcon, DocumentArrowDownIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

const StaffSalaryList = () => {
  const { currentUser: user } = useContext(UserContext);
  const navigate = useNavigate();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [filterRole, setFilterRole] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const isAdmin = user?.role === 'admin';
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
  }, [isAdmin, filterRole, filterMonth, filterYear, filterStatus]);

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
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSalary(null);
  };

  const handleEdit = (salaryId) => {
    navigate(`/admin/salary/edit/${salaryId}`);
  };

  const handleDelete = (salaryId) => {
    console.log("Deleting salary:", salaryId);
    // TODO: Implement delete logic
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <CurrencyDollarIcon className="h-8 w-8 mr-3 text-indigo-600" />
          {isAdmin ? 'All Staff Salaries' : 'My Salary History'}
        </h2>
        {isAdmin && (
          <Link to="/admin/salary/add" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Salary
          </Link>
        )}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Filters:</h3>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Roles</option>
            {staffRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Months</option>
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            {salaryStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message type="error">{error}</Message>
      ) : salaries.length === 0 ? (
        <Message type="info">No salary records found.</Message>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month/Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.map(salary => (
                <tr key={salary._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {salary.staffName} ({salary.staffRole})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salary.staffCnic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {months[salary.month - 1]}, {salary.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs. {salary.salaryPerMonth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}
                      ${salary.status === 'Unpaid' ? 'bg-red-100 text-red-800' : ''}
                      ${salary.status === 'Partial Paid' ? 'bg-yellow-100 text-yellow-800' : ''}`
                    }>
                      {salary.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salary.paidByName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleViewReceipt(salary._id); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Receipt">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadReceiptPdf(salary._id); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="Download Receipt">
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                    {canEditOrDelete && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(salary._id); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Salary Record">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(salary._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Salary Record">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing salary receipt */}
      {isModalOpen && selectedSalary && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Salary Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Staff Name:</strong> {selectedSalary.staffName}</p>
              <p><strong>CNIC:</strong> {selectedSalary.staffCnic}</p>
              <p><strong>Role:</strong> {selectedSalary.staffRole}</p>
              <p><strong>Month:</strong> {months[selectedSalary.month - 1]}, {selectedSalary.year}</p>
              <p><strong>Salary per Month:</strong> Rs. {parseFloat(selectedSalary.salaryPerMonth).toFixed(2)}</p>
              <p><strong>Paid Amount:</strong> Rs. {parseFloat(selectedSalary.paidAmount).toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedSalary.status}</p>
              <p><strong>Bonus:</strong> Rs. {parseFloat(selectedSalary.bonus).toFixed(2)}</p>
              <p><strong>Overtime:</strong> Rs. {parseFloat(selectedSalary.overtime).toFixed(2)}</p>
              <p><strong>Paid By:</strong> {selectedSalary.paidByName || 'N/A'}</p>
              <p><strong>Paid As:</strong> {selectedSalary.paidAs}</p>
              <p><strong>Paid At:</strong> {new Date(selectedSalary.paidAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSalaryList;