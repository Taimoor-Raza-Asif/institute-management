// src/components/DonationManagement.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { jsPDF } from 'jspdf';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon, CurrencyDollarIcon, BanknotesIcon } from '@heroicons/react/24/outline'; // Added EyeIcon
import ConfirmationModal from './ConfirmationModal';

import Modal from '../components/Modal';
import AddDonationModal from '../components/AddDonationModal';

const DonationManagement = () => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const handleDeleteDonation = async (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await api.delete(`/donations/${toDeleteId}`);
      setDonations(donations.filter(d => d._id !== toDeleteId));
    } catch (err) {
      console.error('Error deleting donation:', err);
      setError(err.response?.data?.message || 'Failed to delete donation.');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
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
        doc.text('Jamia Tul Mastwaar', xStart + 17, yPos + 5);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Makhdoom Pur Sharif, Chakwal', xStart + 17, yPos + 10);
        doc.text('(0334) 8724125 | jamiatulmastwaar@gmail.com', xStart + 17, yPos + 14);

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Donation Management</h1>
              <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm sm:text-base`}>Track donations and generate receipts</p>
            </div>
            <CurrencyDollarIcon className={`h-16 w-16 ${currentTheme?.heroIcon || 'text-emerald-600 opacity-80'}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} mb-1`}>Total Donations</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statCardValue || currentTheme?.text || 'text-white'}`}>PKR {donations.reduce((sum, d) => sum + parseFloat(d.donationAmount || 0), 0).toFixed(2)}</p>
                </div>
                <BanknotesIcon className={`h-8 w-8 ${currentTheme?.kpiGood || 'text-emerald-600'} opacity-80`} />
              </div>
            </div>
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} mb-1`}>Donations Count</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statCardValue || currentTheme?.text || 'text-white'}`}>{donations.length}</p>
                </div>
                <ArrowDownTrayIcon className={`h-8 w-8 ${currentTheme?.kpiGood || 'text-emerald-600'} opacity-80`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-4 gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              id="filterDonorName"
              value={filterDonorName}
              onChange={(e) => setFilterDonorName(e.target.value)}
              className={`w-full pl-10 pr-4 h-12 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
              placeholder="Search by Donor Name..."
            />
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${currentTheme?.iconText || 'text-gray-400'}`} />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button onClick={handleAddDonationClick} className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}>
              <PlusIcon className="h-5 w-5 mr-2" /> Add New Donation
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className={`mt-4 pt-4 border-t ${currentTheme?.border || 'border-gray-300'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="filterPaymentMethod" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Payment Method</label>
                <select
                  id="filterPaymentMethod"
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className={`mt-1 block w-full rounded-md p-2 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterStartDate" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Start Date</label>
                <input
                  type="date"
                  id="filterStartDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className={`mt-1 block w-full rounded-md p-2 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                />
              </div>
              <div>
                <label htmlFor="filterEndDate" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>End Date</label>
                <input
                  type="date"
                  id="filterEndDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className={`mt-1 block w-full rounded-md p-2 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className={`w-full py-2 px-4 rounded-lg ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} ${currentTheme?.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} transition duration-200`}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <Message type="error">{error}</Message>}

      <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
        {loading ? (
          <Loader />
        ) : donations.length === 0 ? (
          <p className={`p-4 text-center ${currentTheme?.mutedText || 'text-gray-500'}`}>No donations found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl overflow-hidden">
            <table className={`min-w-full divide-y ${currentTheme?.border || 'divide-gray-200'}`}>
              <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tl-xl`}>Donor Name</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Amount (PKR)</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Purpose</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Date</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Method</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Marked By</th>
                  <th scope="col" className={`px-6 py-4 text-center text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tr-xl`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${currentTheme?.border || 'divide-gray-100'}`}>
                {donations.map((donation) => (
                  <tr
                    key={donation._id}
                    className={`transition-all duration-150 ${currentTheme?.tbodyBg || 'bg-white'} ${currentTheme?.tableStripedBg || 'odd:bg-white even:bg-gray-50'} ${currentTheme?.tableHover || 'hover:bg-emerald-50'} hover:shadow-md`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{donation.donorName || 'Anonymous'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {parseFloat(donation.donationAmount).toFixed(2)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{donation.donationPurpose}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{new Date(donation.donationDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${currentTheme.pillBg || 'bg-gray-100'} ${currentTheme.pillText || 'text-gray-800'} ${currentTheme.pillBorder || 'border border-gray-200'}`}>{donation.paymentMethod}</span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{donation.markedBy?.profileId?.name} ({donation.markedBy?.role})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleViewDonationClick(donation)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="View Donation">
                           <EyeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleEditDonationClick(donation)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Edit Donation">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteDonation(donation._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Delete Donation">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDownloadReceipt(donation._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Download Receipt">
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

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setToDeleteId(null); }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this donation?"
      />

    </div>
  );
};

export default DonationManagement;