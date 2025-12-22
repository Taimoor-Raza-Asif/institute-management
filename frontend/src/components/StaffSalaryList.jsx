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
            <div className={`${currentTheme?.statCard || 'bg-white'} ${currentTheme?.border || 'border border-emerald-100'} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statLabel || 'text-emerald-700'} mb-1`}>Total Paid</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statValue || 'text-emerald-800'}`}>PKR {totalPaid.toFixed(2)}</p>
                </div>
                <BanknotesIcon className={`h-8 w-8 ${currentTheme?.statIcon || 'text-emerald-600 opacity-80'}`} />
              </div>
            </div>
            <div className={`${currentTheme?.statCard || 'bg-white'} ${currentTheme?.border || 'border border-emerald-100'} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statLabel || 'text-emerald-700'} mb-1`}>Total Records</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statValue || 'text-emerald-800'}`}>{totalRecords}</p>
                </div>
                <DocumentArrowDownIcon className={`h-8 w-8 ${currentTheme?.statIcon || 'text-emerald-600 opacity-80'}`} />
              </div>
            </div>
            <div className={`${currentTheme?.statCard || 'bg-white'} ${currentTheme?.border || 'border border-emerald-100'} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${currentTheme?.statLabel || 'text-emerald-700'} mb-1`}>Unpaid/Partial</p>
                  <p className={`text-xl sm:text-2xl font-bold ${currentTheme?.statValue || 'text-emerald-800'}`}>{unpaidCount}</p>
                </div>
                <ClockIcon className={`h-8 w-8 ${currentTheme?.statIcon || 'text-emerald-600 opacity-80'}`} />
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
              className={`w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-gray-400'}`} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {isAdmin && (
              <Link
                to="/salary/add"
                className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
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

            {/* Bulk Creation Section */}
            <div className="col-span-full mt-4 pt-4 border-t border-gray-300">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Bulk Create Salaries</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label htmlFor="bulkRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="bulkRole"
                    value={filterBulkRole}
                    onChange={(e) => setFilterBulkRole(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="">Select Role</option>
                    {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulkMonth" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    id="bulkMonth"
                    value={filterBulkMonth}
                    onChange={(e) => setFilterBulkMonth(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="">Select Month</option>
                    {months.map((m, index) => <option key={index + 1} value={index + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="bulkYear" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    id="bulkYear"
                    value={filterBulkYear}
                    onChange={(e) => setFilterBulkYear(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {isAdmin && filterBulkRole && filterBulkMonth && filterBulkYear && (
                  <button
                    onClick={handleBulkCreateSalaries}
                    disabled={loading}
                    className="col-span-full md:col-span-1 px-6 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 w-full"
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

      {loading ? (
        <Loader />
      ) : salaries.length > 0 ? (
        <div className="bg-white shadow overflow-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Month/Year</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {salaries.map((salary, index) => (
                <tr
                  key={salary._id}
                  className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {/* <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 text-left">{salary.staffName}</td> */}
                   <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {salary.profilePictureUrl ? (
                          <img
                            src={`http://localhost:5000${salary.profilePictureUrl}`}
                            alt={`${salary.staffName}'s Profile`}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100 mr-3"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/10b981/ffffff?text=' + (salary.staffName?.[0] || 'S'); }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3 ring-2 ring-green-200">
                            <span className="text-green-700 font-bold text-sm">{salary.staffName?.[0] || 'S'}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{salary.staffName}</div>
                          <div className="text-xs text-gray-500 font-mono">{salary.staffCnic || ''}</div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{salary.staffRole}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{months[salary.month - 1]} {salary.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">PKR {parseFloat(salary.paidAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' : salary.status === 'Partial Paid' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                      {salary.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handleViewReceipt(salary._id)} className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200" title="View Details">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    {canEditOrDelete && (
                      <>
                        <button onClick={() => handleEdit(salary._id)} className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors duration-200" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(salary._id)} className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                      <button onClick={() => handleDownloadReceiptPdf(salary._id)} className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Download Receipt">
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    </div>
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