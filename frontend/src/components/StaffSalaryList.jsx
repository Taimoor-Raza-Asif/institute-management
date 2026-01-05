// src/components/StaffSalaryList.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import Loader from './Loader';
import Message from './Message';
import Modal from './Modal';
import SalaryForm from './SalaryForm';
import AlertDialog from './AlertDialog';
import ConfirmationModal from './ConfirmationModal';
import jsPDF from 'jspdf';
import 'react-datepicker/dist/react-datepicker.css';
import {
  CurrencyDollarIcon, EyeIcon, PencilIcon, TrashIcon, PlusCircleIcon, DocumentArrowDownIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon, UserCircleIcon, BanknotesIcon, ClockIcon
} from '@heroicons/react/24/outline';

const StaffSalaryList = () => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();
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

  // Helper function to handle badge styles (Fixes the nested ternary error)
  const getStatusBadgeClass = (status) => {
    if (status === 'Paid') {
      return `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}`;
    } else if (status === 'Partial Paid') {
      return `${currentTheme.badgeWarningBg || 'bg-amber-100'} ${currentTheme.badgeWarningText || 'text-amber-800'}`;
    } else {
      return `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}`;
    }
  };

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

  const fetchStaffList = useCallback(async () => {
    try {
      const { data } = await api.get('/salary/staff');
      setStaffList(data || []);
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    }
  }, []);

  const handleBulkCreateSalaries = async () => {
    if (!filterBulkMonth || !filterBulkYear || !filterBulkRole) {
      showAlert('Please select Month, Year, and Role to create bulk salaries', 'warning', 'Missing Selection');
      return;
    }

    try {
      setLoading(true);

      // Filter staff by role
      const filteredStaff = staffList.filter(s => s.staffType.toLowerCase() === filterBulkRole.toLowerCase());

      if (filteredStaff.length === 0) {
        showAlert('No staff members found for the selected role', 'warning', 'No Results');
        setLoading(false);
        return;
      }

      // Check which staff already have salaries for this month/year
      const salaryKeys = new Set(
        salaries
          .filter(s => s.month === parseInt(filterBulkMonth) && s.year === parseInt(filterBulkYear))
          .map(s => s.staff)
      );

      // Filter staff who don't have salaries
      const staffToCreate = filteredStaff.filter(s => !salaryKeys.has(s._id));
      const duplicateCount = filteredStaff.length - staffToCreate.length;

      if (staffToCreate.length === 0) {
        showAlert(`All ${filteredStaff.length} staff members already have salaries for this month/year. No new records were created.`, 'info', 'No New Records');
        setLoading(false);
        return;
      }

      const bulkSalaryData = staffToCreate.map(staff => ({
        staffId: staff._id,
        month: parseInt(filterBulkMonth),
        year: parseInt(filterBulkYear),
        paidAmount: 0,
        paidAs: 'Cash',
        bonus: 0,
        overtime: 0,
        advancedSalary: 0
      }));

      const res = await api.post('/salary/bulk-create', { salaries: bulkSalaryData });
      const createdCount = res.data?.createdCount ?? bulkSalaryData.length;
      const serverDuplicates = res.data?.duplicateCount ?? duplicateCount;

      let successMessage = `Successfully created ${createdCount} salary records for ${months[parseInt(filterBulkMonth) - 1]} ${filterBulkYear}`;
      if (serverDuplicates > 0) {
        successMessage += `\nSkipped ${serverDuplicates} staff member(s) who already have salaries for this period`;
      }
      showAlert(successMessage, 'success', 'Bulk Salaries Created');

      // Reset filters
      setFilterBulkRole('');
      setFilterBulkMonth('');
      setFilterBulkYear('');

      fetchSalaries();
    } catch (err) {
      console.error('Bulk creation failed:', err);
      showAlert(err.response?.data?.message || 'Failed to create bulk salaries', 'error', 'Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSalaries();
      if (isAdmin) {
        fetchStaffList();
      }
    }
  }, [user, fetchSalaries, fetchStaffList, isAdmin]);

  const handleDownloadReceiptPdf = useCallback((salaryId) => {
    const salary = salaries.find(s => s._id === salaryId);
    if (!salary) {
      console.error("Salary not found for receipt generation.");
      return;
    }

    const doc = new jsPDF({ format: 'a4' });
    const filename = `${salary.staffName.replace(/\s/g, '_')}_Salary_Slip_${months[salary.month - 1]}_${salary.year}.pdf`;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 10;

    const savePDF = () => {
      doc.save(filename);
    };

    const generatePDF = async () => {
      // --- Gradient Hero Header ---
      const headerHeight = 55;
      const steps = 50;
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.round(16 + (20 - 16) * ratio);
        const g = Math.round(185 + (184 - 185) * ratio);
        const b = Math.round(129 + (166 - 129) * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, (i * headerHeight) / steps, pageWidth, headerHeight / steps + 1, 'F');
      }

      // Decorative overlay circles
      doc.setFillColor(255, 255, 255);
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.circle(pageWidth * 0.18, 12, 35, 'F');
      doc.circle(pageWidth * 0.82, headerHeight * 0.6, 25, 'F');
      doc.setGState(new doc.GState({ opacity: 1 }));

      // White circle background for logo
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 12, 22, 14, 'F');

      // Institute logo
      const logo = new Image();
      logo.src = '/Jamia Logo.png';
      await new Promise((resolve) => {
        logo.onload = () => {
          doc.addImage(logo, 'JPEG', margin + 3, 13, 18, 18);
          resolve();
        };
        logo.onerror = () => resolve();
      });

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Jamia Tul Mastwaar', margin + 30, 18);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(240, 253, 250);
      doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 30, 25);
      doc.text('(0334) 8724125 | jamiatulmastwaar@gmail.com', margin + 30, 31);

      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('SALARY SLIP', pageWidth - margin, 42, { align: 'right' });

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.setGState(new doc.GState({ opacity: 0.3 }));
      doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8);
      doc.setGState(new doc.GState({ opacity: 1 }));

      yPos = headerHeight + 6;
      doc.setTextColor(0, 0, 0);

      // Timestamp badge
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
      doc.setFontSize(8);
      doc.setTextColor(4, 120, 87);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
      doc.setTextColor(0, 0, 0);
      yPos += 15;

      // Helper functions
      const addSectionHeader = (title) => {
        doc.setFillColor(240, 248, 242);
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text(title, margin + 3, yPos + 5.5);
        doc.setTextColor(0, 0, 0);
        yPos += 13;
      };

      const columnGap = 18;
      const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

      const addTwoFields = (label1, value1, label2, value2) => {
        const addSingle = (x, label, value) => {
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(80, 80, 80);
          doc.text(`${label}:`, x, yPos);
          const labelWidth = doc.getTextWidth(`${label}:`);
          doc.setFontSize(9.5);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          const text = value ? String(value) : 'N/A';
          const lines = doc.splitTextToSize(text, columnWidth - labelWidth - 5);
          doc.text(lines, x + labelWidth + 3, yPos);
        };

        addSingle(margin, label1, value1);
        if (label2) addSingle(margin + columnWidth + columnGap, label2, value2);
        yPos += 7;
      };

      // Staff Information Section
      addSectionHeader('STAFF INFORMATION');
      addTwoFields('Name', salary.staffName, 'CNIC', salary.staffCnic);
      addTwoFields('Role', salary.staffRole, '', '');
      yPos += 5;

      // Salary Details Section
      addSectionHeader('SALARY DETAILS');
      addTwoFields('Salary per Month', `PKR ${parseFloat(salary.salaryPerMonth).toLocaleString()}`, 'Bonus', `PKR ${parseFloat(salary.bonus).toLocaleString()}`);
      addTwoFields('Overtime', `PKR ${parseFloat(salary.overtime).toLocaleString()}`, 'Advanced Salary', `PKR ${parseFloat(salary.advancedSalary || 0).toLocaleString()}`);
      addTwoFields('Deduction', `PKR ${parseFloat(salary.deduction || 0).toLocaleString()}`, 'Paid Amount', `PKR ${parseFloat(salary.paidAmount).toLocaleString()}`);
      yPos += 5;

      // Payment Information Section
      addSectionHeader('PAYMENT INFORMATION');
      addTwoFields('Status', salary.status, 'Paid Month', months[salary.month - 1]);
      addTwoFields('Paid Year', salary.year, 'Paid By', salary.paidByName || '-');
      addTwoFields('Paid As', salary.paidAs, 'Paid At', new Date(salary.paidAt).toLocaleDateString());
      yPos += 10;

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text('This is a computer-generated salary slip. No signature is required.', pageWidth / 2, yPos, { align: 'center' });

      // Page footer
      const footerY = pageHeight - 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text('Jamia Tul Mastwaar - Salary Slip', margin, footerY);
      doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

      savePDF();
    };

    generatePDF();
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // Bulk create states
  const [filterBulkRole, setFilterBulkRole] = useState('');
  const [filterBulkMonth, setFilterBulkMonth] = useState('');
  const [filterBulkYear, setFilterBulkYear] = useState('');
  const [staffList, setStaffList] = useState([]);

  // Alert Dialog State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info' });

  const showAlert = (message, type = 'info', title = '') => {
    setAlertData({
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'),
      message,
      type
    });
    setAlertOpen(true);
  };

  const handleDelete = async (salaryId) => {
    setToDeleteId(salaryId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      await api.delete(`/salary/${toDeleteId}`);
      fetchSalaries?.();
    } catch (error) {
      console.error('Failed to delete salary record:', error);
      setError(error.response?.data?.message || 'Failed to delete salary record.');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  // Stats for hero header
  const totalPaid = useMemo(() => (
    Array.isArray(salaries) ? salaries.reduce((sum, s) => sum + parseFloat(s.paidAmount || 0), 0) : 0
  ), [salaries]);
  const totalRecords = salaries.length;
  const unpaidCount = useMemo(() => (
    Array.isArray(salaries) ? salaries.filter(s => s.status !== 'Paid').length : 0
  ), [salaries]);

  // Main Render Helper to clean up JSX
  const renderContent = () => {
    if (loading) return <Loader />;

    if (salaries.length > 0) {
      return (
        <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
          <div className="overflow-x-auto rounded-xl overflow-hidden">
            <table className="min-w-full divide-y ${currentTheme?.border || 'divide-gray-200'}">
              <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tl-xl`}>Staff Member</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Role</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Month/Year</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Paid Amount</th>
                  <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Status</th>
                  <th scope="col" className={`px-6 py-4 text-center text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tr-xl`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${currentTheme?.border || 'divide-gray-100'}`}>
                {salaries.map((salary) => (
                  <tr
                    key={salary._id}
                    className={`transition-all duration-150 ${currentTheme?.tbodyBg || 'bg-white'} ${currentTheme?.tableStripedBg || 'odd:bg-white even:bg-gray-50'} ${currentTheme?.tableHover || 'hover:bg-emerald-50'} hover:shadow-md`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {salary.profilePictureUrl ? (
                          <img
                            src={`http://localhost:5000${salary.profilePictureUrl}`}
                            alt={`${salary.staffName}'s Profile`}
                            className={`h-10 w-10 rounded-full object-cover ring-2 ${currentTheme?.heroPillBorder || 'ring-green-200'} mr-3`}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/10b981/ffffff?text=' + (salary.staffName?.[0] || 'S'); }}
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-full ${currentTheme.heroPillBg || 'bg-green-100'} flex items-center justify-center mr-3 ring-2 ${currentTheme.heroPillBorder || 'ring-green-200'}`}>
                            <span className={`${currentTheme.iconText || 'text-green-700'} font-bold text-sm`}>{salary.staffName?.[0] || 'S'}</span>
                          </div>
                        )}
                        <div>
                          <div className={`text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{salary.staffName}</div>
                          <div className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'} font-mono`}>{salary.staffCnic || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{salary.staffRole}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{months[salary.month - 1]} {salary.year}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {parseFloat(salary.paidAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadgeClass(salary.status)}`}>
                        {salary.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleViewReceipt(salary._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {canEditOrDelete && (
                          <>
                            <button onClick={() => handleEdit(salary._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Edit">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDelete(salary._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Delete">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDownloadReceiptPdf(salary._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Download Receipt">
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return <p className={`text-center ${currentTheme?.mutedText || 'text-gray-500'} text-base`}>No salary records found.</p>;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Staff Salary Management</h1>
              <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm sm:text-base`}>Track, review, and manage staff salaries</p>
            </div>
            <CurrencyDollarIcon className={`h-16 w-16 ${currentTheme?.heroIcon || 'text-emerald-600 opacity-80'}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} mb-1`}>Total Paid</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statCardValue || currentTheme?.text || 'text-white'}`}>PKR {totalPaid.toFixed(2)}</p>
                </div>
                <BanknotesIcon className={`h-8 w-8 ${currentTheme?.kpiGood || 'text-emerald-600'} opacity-80`} />
              </div>
            </div>
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} mb-1`}>Total Records</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statCardValue || currentTheme?.text || 'text-white'}`}>{totalRecords}</p>
                </div>
                <DocumentArrowDownIcon className={`h-8 w-8 ${currentTheme?.kpiGood || 'text-emerald-600'} opacity-80`} />
              </div>
            </div>
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} mb-1`}>Unpaid/Partial</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statCardValue || currentTheme?.text || 'text-white'}`}>{unpaidCount}</p>
                </div>
                <ClockIcon className={`h-8 w-8 ${currentTheme?.kpiWarn || 'text-amber-600'} opacity-80`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && <Message type="error">{error}</Message>}

      <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search by staff name or CNIC..."
              className={`w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-gray-400'}`} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {isAdmin && (
              <Link
                to="/salary/add"
                className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add New Record
              </Link>
            )}
          </div>
        </div>

        {showFilters && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'} rounded-md ${currentTheme?.shadow || 'shadow-inner'}`}>
            <div>
              <label htmlFor="filterRole" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Role</label>
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
              >
                <option value="">All Roles</option>
                {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterMonth" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
              <select
                id="filterMonth"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
              >
                <option value="">All Months</option>
                {months.map((m, index) => <option key={index + 1} value={index + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterYear" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Year</label>
              <select
                id="filterYear"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
              >
                <option value="">All Statuses</option>
                {salaryStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            {/* Bulk Creation Section */}
            <div className={`col-span-full mt-4 pt-4 border-t ${currentTheme?.border || 'border-gray-300'}`}>
              <h4 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} mb-3`}>Bulk Create Salaries</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label htmlFor="bulkRole" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Role</label>
                  <select
                    id="bulkRole"
                    value={filterBulkRole}
                    onChange={(e) => setFilterBulkRole(e.target.value)}
                    className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                  >
                    <option value="">Select Role</option>
                    {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulkMonth" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    id="bulkMonth"
                    value={filterBulkMonth}
                    onChange={(e) => setFilterBulkMonth(e.target.value)}
                    className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                  >
                    <option value="">Select Month</option>
                    {months.map((m, index) => <option key={index + 1} value={index + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulkYear" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Year</label>
                  <select
                    id="bulkYear"
                    value={filterBulkYear}
                    onChange={(e) => setFilterBulkYear(e.target.value)}
                    className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                  >
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {isAdmin && filterBulkRole && filterBulkMonth && filterBulkYear && (
                  <button
                    onClick={handleBulkCreateSalaries}
                    disabled={loading}
                    className={`col-span-full md:col-span-1 px-6 py-2 rounded-lg text-sm font-bold ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme?.shadow || 'shadow-lg'} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 w-full`}
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-2 inline-block" />
                    Bulk Create ({filterBulkRole} - {months[parseInt(filterBulkMonth) - 1]})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render the table content using the helper function */}
      {renderContent()}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isViewMode ? "Salary Details" : "Edit Salary"}>
        <SalaryForm salaryToEdit={selectedSalary} isViewMode={isViewMode} onAdd={fetchSalaries} onEdit={fetchSalaries} onClose={handleCloseModal} />
      </Modal>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setToDeleteId(null); }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this salary record?"
      />

      {/* Custom Alert Dialog */}
      <AlertDialog
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
    </div>
  );
};

export default StaffSalaryList;