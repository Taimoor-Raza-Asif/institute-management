// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { UserContext } from '../App';
// import api from '../api';
// import Message from '../components/Message';
// import Loader from '../components/Loader';
// import { jsPDF } from 'jspdf';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlus, faEdit, faTrash, faFileDownload, faSearch } from '@fortawesome/free-solid-svg-icons';
// import Modal from '../components/Modal';
// import AddDonationModal from '../components/AddDonationModal';

// const DonationManagement = () => {
//   const { currentUser: user } = useContext(UserContext);
//   const [donations, setDonations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedDonation, setSelectedDonation] = useState(null);

//   // Filters
//   const [filterDonorName, setFilterDonorName] = useState('');
//   const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
//   const [filterStartDate, setFilterStartDate] = useState('');
//   const [filterEndDate, setFilterEndDate] = useState('');

//   const fetchDonations = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data } = await api.get('/donations', {
//         params: {
//           donorName: filterDonorName,
//           paymentMethod: filterPaymentMethod,
//           startDate: filterStartDate,
//           endDate: filterEndDate,
//         }
//       });
//       setDonations(data);
//     } catch (err) {
//       console.error('Error fetching donations:', err);
//       setError(err.response?.data?.message || 'Failed to fetch donations.');
//     } finally {
//       setLoading(false);
//     }
//   }, [filterDonorName, filterPaymentMethod, filterStartDate, filterEndDate]);

//   useEffect(() => {
//     if (user && (user.role === 'admin' || user.role === 'accountant')) {
//       fetchDonations();
//     }
//   }, [user, fetchDonations]);

//   const handleAddDonation = (newDonation) => {
//     setDonations([newDonation, ...donations]);
//     setIsAddModalOpen(false);
//   };

//   const handleEditDonation = (updatedDonation) => {
//     setDonations(donations.map(d => d._id === updatedDonation._id ? updatedDonation : d));
//     setIsEditModalOpen(false);
//     setSelectedDonation(null);
//   };

//   const handleDeleteDonation = async (id) => {
//     if (window.confirm('Are you sure you want to delete this donation?')) {
//       try {
//         await api.delete(`/donations/${id}`);
//         setDonations(donations.filter(d => d._id !== id));
//       } catch (err) {
//         console.error('Error deleting donation:', err);
//         setError(err.response?.data?.message || 'Failed to delete donation.');
//       }
//     }
//   };

//   const handleDownloadReceipt = useCallback(async (donationId) => {
//     const donation = donations.find(d => d._id === donationId);
//     if (!donation) {
//       console.error("Donation not found for receipt generation.");
//       return;
//     }

//     const doc = new jsPDF({ format: 'a4' });
//     const filename = `${donation.donorName.replace(/\s/g, '_')}_Donation_Receipt_${new Date(donation.donationDate).toLocaleDateString()}.pdf`;

//     const Image = window.Image;
//     const logo = new Image();
//     logo.src = '/default-avatar.jpg';

//     const savePDF = () => {
//       doc.save(filename);
//     };

//     const drawMiniReceipt = (xStart, yStart) => {
//       let yPos = yStart;

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
//         doc.text('Donation Receipt', xStart + 40, yPos + 24, { align: 'center' });

//         doc.setFontSize(7);
//         doc.setTextColor(100);
//         doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 29);

//         yPos += 34;
//         doc.setFontSize(8);
//         doc.setTextColor(0);
//         doc.setFont(undefined, 'bold');
//         doc.text('Donor Information', xStart, yPos);
//         yPos += 4;
//         doc.line(xStart, yPos, xStart + 80, yPos);
//         yPos += 5;

//         doc.setFont(undefined, 'normal');
//         const addField = (label, value, xOffset = 5) => {
//           doc.text(`${label}:`, xStart + xOffset, yPos);
//           doc.text(`${value}`, xStart + 40, yPos);
//           yPos += 4;
//         };

//         addField('Name', donation.donorName || 'Anonymous');
//         addField('CNIC', donation.cnic || 'N/A');
//         addField('Contact', donation.contactNumber || 'N/A');
//         addField('Email', donation.emailAddress || 'N/A');
//         addField('Organization', donation.organizationName || 'N/A');
//         yPos += 6;

//         doc.setFont(undefined, 'bold');
//         doc.text('Donation Details', xStart, yPos);
//         yPos += 4;
//         doc.line(xStart, yPos, xStart + 80, yPos);
//         yPos += 5;

//         doc.setFont(undefined, 'normal');
//         addField('Donation Amount', `PKR ${parseFloat(donation.donationAmount).toFixed(2)}`);
//         addField('Purpose', donation.donationPurpose);
//         addField('Payment Method', donation.paymentMethod);
//         addField('Donation Date', new Date(donation.donationDate).toLocaleDateString());
//         addField('Marked By', donation.markedBy?.cnic || 'N/A');
//         addField('Created At', new Date(donation.createdAt).toLocaleDateString());

//         yPos += 5;

//         doc.setFontSize(7);
//         doc.setTextColor(150);
//         doc.text('This is a computer-generated receipt. No signature is required.', xStart, yPos + 5);

//         savePDF();
//       };

//       logo.onerror = () => {
//         console.warn('Failed to load logo, proceeding without it.');
//         savePDF();
//       };
//     };
//     drawMiniReceipt(10, 10);
//   }, [donations]);

//   if (!user || (user.role !== 'admin' && user.role !== 'accountant')) {
//     return <Message type="error">You are not authorized to view this page.</Message>;
//   }

//   return (
//     <div className="container mx-auto p-6 lg:p-8">
//       <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8">
//         <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Donation Management</h2>

//         {/* Filter Section */}
//         <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter Donations</h3>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div>
//               <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">Donor Name</label>
//               <input
//                 type="text"
//                 id="donorName"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterDonorName}
//                 onChange={(e) => setFilterDonorName(e.target.value)}
//                 placeholder="e.g., John Doe"
//               />
//             </div>
//             <div>
//               <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
//               <select
//                 id="paymentMethod"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterPaymentMethod}
//                 onChange={(e) => setFilterPaymentMethod(e.target.value)}
//               >
//                 <option value="">All</option>
//                 <option value="Cash">Cash</option>
//                 <option value="Bank Transfer">Bank Transfer</option>
//                 <option value="Cheque">Cheque</option>
//                 <option value="Online Gateway">Online Gateway</option>
//               </select>
//             </div>
//             <div>
//               <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
//               <input
//                 type="date"
//                 id="startDate"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterStartDate}
//                 onChange={(e) => setFilterStartDate(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
//               <input
//                 type="date"
//                 id="endDate"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
//                 value={filterEndDate}
//                 onChange={(e) => setFilterEndDate(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={fetchDonations}
//               className="flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
//             >
//               <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end mb-6">
//           <button
//             onClick={() => setIsAddModalOpen(true)}
//             className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
//           >
//             <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Donation
//           </button>
//         </div>

//         {error && <Message type="error">{error}</Message>}

//         {loading ? (
//           <Loader />
//         ) : donations.length === 0 ? (
//           <Message type="info">No donations found with the selected filters.</Message>
//         ) : (
//           <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50 sticky top-0">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Donor Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {donations.map((donation) => (
//                   <tr key={donation._id} className="hover:bg-gray-50 transition duration-150">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donation.donorName || 'Anonymous'}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PKR {parseFloat(donation.donationAmount).toFixed(2)}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.donationPurpose}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(donation.donationDate).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                         {donation.paymentMethod}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex items-center space-x-3">
//                         <button
//                           onClick={() => {
//                             setSelectedDonation(donation);
//                             setIsEditModalOpen(true);
//                           }}
//                           className="text-indigo-600 hover:text-indigo-900 transition duration-150"
//                           title="Edit"
//                         >
//                           <FontAwesomeIcon icon={faEdit} />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteDonation(donation._id)}
//                           className="text-red-600 hover:text-red-900 transition duration-150"
//                           title="Delete"
//                         >
//                           <FontAwesomeIcon icon={faTrash} />
//                         </button>
//                         <button
//                           onClick={() => handleDownloadReceipt(donation._id)}
//                           className="text-purple-600 hover:text-purple-900 transition duration-150"
//                           title="Download Receipt"
//                         >
//                           <FontAwesomeIcon icon={faFileDownload} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Add Donation Modal */}
//         <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Donation">
//           <AddDonationModal onAdd={handleAddDonation} onClose={() => setIsAddModalOpen(false)} />
//         </Modal>

//         {/* Edit Donation Modal */}
//         <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Donation">
//           <AddDonationModal donationToEdit={selectedDonation} onEdit={handleEditDonation} onClose={() => setIsEditModalOpen(false)} />
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default DonationManagement;






// src/components/DonationManagement.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../App';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { jsPDF } from 'jspdf';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline'; // Added EyeIcon

import Modal from '../components/Modal';
import AddDonationModal from '../components/AddDonationModal';

const DonationManagement = () => {
  const { currentUser: user } = useContext(UserContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // New state for view modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  // --- Filter States ---
  const [filterDonorName, setFilterDonorName] = useState('');
  const [debouncedFilterDonorName, setDebouncedFilterDonorName] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Helper to build query parameters for donation filters
  const buildDonationFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedFilterDonorName) {
      params.append('donorName', debouncedFilterDonorName);
    }
    if (filterPaymentMethod) {
      params.append('paymentMethod', filterPaymentMethod);
    }
    if (filterStartDate) {
      params.append('startDate', filterStartDate);
    }
    if (filterEndDate) {
      params.append('endDate', filterEndDate);
    }
    return params.toString();
  }, [debouncedFilterDonorName, filterPaymentMethod, filterStartDate, filterEndDate]);


  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = buildDonationFilterQueryParams();
      const { data } = await api.get(`/donations?${queryParams}`);
      setDonations(data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(err.response?.data?.message || 'Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  }, [buildDonationFilterQueryParams]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'accountant')) {
      fetchDonations();
    }
  }, [user, fetchDonations]);

  // Effect to debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterDonorName(filterDonorName);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [filterDonorName]);

  const handleAddDonation = (newDonation) => {
    setDonations([newDonation, ...donations]);
    setIsAddModalOpen(false);
  };

  const handleEditDonation = (updatedDonation) => {
    setDonations(donations.map(d => d._id === updatedDonation._id ? updatedDonation : d));
    setIsEditModalOpen(false);
    setSelectedDonation(null);
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`/donations/${id}`);
        setDonations(donations.filter(d => d._id !== id));
      } catch (err) {
        console.error('Error deleting donation:', err);
        setError(err.response?.data?.message || 'Failed to delete donation.');
      }
    }
  };

  const handleDownloadReceipt = useCallback(async (donationId) => {
    const donation = donations.find(d => d._id === donationId);
    if (!donation) {
      console.error("Donation not found for receipt generation.");
      return;
    }

    const doc = new jsPDF({ format: 'a4' });
    const filename = `${donation.donorName.replace(/\s/g, '_')}_Donation_Receipt_${new Date(donation.donationDate).toLocaleDateString()}.pdf`;

    const Image = window.Image;
    const logo = new Image();
    logo.src = '/default-avatar.jpg';

    const savePDF = () => {
      doc.save(filename);
    };

    const drawMiniReceipt = (xStart, yStart) => {
      let yPos = yStart;

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
        doc.text('Donation Receipt', xStart + 40, yPos + 24, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 29);

        yPos += 34;
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('Donor Information', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        const addField = (label, value, xOffset = 5) => {
          doc.text(`${label}:`, xStart + xOffset, yPos);
          doc.text(`${value}`, xStart + 40, yPos);
          yPos += 4;
        };

        addField('Name', donation.donorName || 'Anonymous');
        addField('CNIC', donation.cnic || 'N/A');
        addField('Contact', donation.contactNumber || 'N/A');
        addField('Email', donation.emailAddress || 'N/A');
        addField('Organization', donation.organizationName || 'N/A');
        yPos += 6;

        doc.setFont(undefined, 'bold');
        doc.text('Donation Details', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        addField('Donation Amount', `PKR ${parseFloat(donation.donationAmount).toFixed(2)}`);
        addField('Purpose', donation.donationPurpose);
        addField('Payment Method', donation.paymentMethod);
        addField('Donation Date', new Date(donation.donationDate).toLocaleDateString());
        addField('Marked By', `${donation.markedBy?.profileId?.name} (${donation.markedBy?.role})` || 'N/A');
        addField('Created At', new Date(donation.createdAt).toLocaleDateString());

        yPos += 5;

        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('This is a computer-generated receipt. No signature is required.', xStart, yPos + 5);

        savePDF();
      };

      logo.onerror = () => {
        console.warn('Failed to load logo, proceeding without it.');
        savePDF();
      };
    };

    drawMiniReceipt(10, 10);
  }, [donations]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilterDonorName('');
    setFilterPaymentMethod('');
    setFilterStartDate('');
    setFilterEndDate('');
  };


  const handleAddDonationClick = () => {
    setSelectedDonation(null);
    setIsAddModalOpen(true);
  };

  const handleEditDonationClick = (donation) => {
    setSelectedDonation(donation);
    setIsEditModalOpen(true);
  };

  const handleViewDonationClick = (donation) => { // New function to handle view
    setSelectedDonation(donation);
    setIsViewModalOpen(true);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'accountant')) {
    return <Message type="error">You are not authorized to view this page.</Message>;
  }

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Gateway'];


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Donation Management</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              id="filterDonorName"
              value={filterDonorName}
              onChange={(e) => setFilterDonorName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search by Donor Name..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button onClick={handleAddDonationClick} className="flex items-center justify-center bg-green-600 font-semibold text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto">
              <PlusIcon className="h-5 w-5 mr-2" /> Add New Donation
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="filterPaymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  id="filterPaymentMethod"
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="filterStartDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                />
              </div>
              <div>
                <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="filterEndDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <Message type="error">{error}</Message>}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {loading ? (
          <Loader />
        ) : donations.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No donations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y border-spacing-y-2 border-white divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Donor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Amount (PKR)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider">Marked By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white border border-white uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map(donation => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donation.donorName || 'Anonymous'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(donation.donationAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.donationPurpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(donation.donationDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.markedBy?.profileId?.name} ({donation.markedBy?.role}) {console.log(`marked by name ${donation.markedBy?.profileId?.name}`)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleViewDonationClick(donation)} className="text-blue-600 hover:text-blue-900">
                           <EyeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleEditDonationClick(donation)} className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteDonation(donation._id)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDownloadReceipt(donation._id)} className="text-green-600 hover:text-green-900">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Donation">
        <AddDonationModal onAdd={handleAddDonation} onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Donation">
        <AddDonationModal onEdit={handleEditDonation} onClose={() => setIsEditModalOpen(false)} donationToEdit={selectedDonation} />
      </Modal>

      {/* New View Donation Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Donation">
        {/* You need to modify AddDonationModal to support a view-only mode */}
        {/* For now, this placeholder shows how the data would be passed */}
        {selectedDonation && (
            <AddDonationModal donationToEdit={selectedDonation} onClose={() => setIsViewModalOpen(false)} isViewMode={true} />
        )}
      </Modal>

    </div>
  );
};

export default DonationManagement;