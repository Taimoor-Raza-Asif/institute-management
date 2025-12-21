// src/components/FeeList.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import FeeModal from './FeeModal';
import FeeForm from './FeeForm';
import ConfirmationModal from './ConfirmationModal';
import AlertDialog from './AlertDialog';
import Loader from './Loader';
import Message from './Message';
import {
  BanknotesIcon,
  WalletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currency = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n || 0);

const paymentMethods = ['Cash', 'Bank Transfer', 'Deposited Cash'];

const FeeList = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicStructure, setAcademicStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Academic/Class Filters (mirrors StudentList patterns)
  const [filterClassType, setFilterClassType] = useState('');
  const [filterClassDetail, setFilterClassDetail] = useState(''); // classNumber for Class/Almiya, semester number for BS, none for Hifaz
  const [filterDegreeName, setFilterDegreeName] = useState(''); // BS specific
  
  // Fee Period Filters - Default to current month and year
  const currentMonthName = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
  const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

  // Payment Filters
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterReceivedBy, setFilterReceivedBy] = useState('');

  // Fee Status Filter
  const [filterFeeStatus, setFilterFeeStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);

  // Alert Dialog State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info' });

  const showAlert = (message, type = 'info', title = '') => {
    setAlertData({ title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'), message, type });
    setAlertOpen(true);
  };

  const canManage = currentUser && (currentUser.role === 'admin' || currentUser.role === 'accountant');
  const isStudent = currentUser && currentUser.role === 'student';

  const backendBaseUrl = 'http://localhost:5000';

  const fetchAcademicStructure = useCallback(async () => {
    try {
      const res = await api.get('/academic-structure');
      // Accept both raw array and classTypes payload shapes
      setAcademicStructure(res.data?.classTypes || res.data || []);
    } catch (err) {
      console.error('Failed to load academic structure:', err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Build filter query parameters for fees
  const buildFeeFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) {
      params.append('searchTerm', debouncedSearchTerm);
    }
    if (filterFeeMonth) {
      params.append('month', filterFeeMonth);
    }
    if (filterFeeYear) {
      params.append('year', filterFeeYear);
    }
    if (filterClassType) {
      params.append('classType', filterClassType);
      if (filterDegreeName) {
        params.append('degreeName', filterDegreeName);
      }
      if (filterClassDetail) {
        params.append('classDetail', filterClassDetail);
      }
    }
    if (filterPaymentMethod) {
      params.append('paymentMethod', filterPaymentMethod);
    }
    if (filterReceivedBy) {
      params.append('receivedBy', filterReceivedBy);
    }
    if (filterFeeStatus && filterFeeStatus !== 'All') {
      params.append('feeStatus', filterFeeStatus);
    }
    
    return params.toString();
  }, [debouncedSearchTerm, filterFeeMonth, filterFeeYear, filterClassType, filterClassDetail, filterDegreeName, filterPaymentMethod, filterReceivedBy, filterFeeStatus]);

  // Update fetchFees to use new filter states
  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (currentUser?.role === 'student' && currentUser?.profileId) {
        res = await api.get(`/fees/student/${currentUser.profileId}`);
      } else {
        const queryParams = buildFeeFilterQueryParams();
        res = await api.get(`/fees?${queryParams}`);
      }
      setFees(res.data || []);
    } catch (err) {
      console.error('Failed to load fees:', err);
      setError(err.response?.data?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, [currentUser, buildFeeFilterQueryParams]);

  useEffect(() => {
    // Always fetch once the user is known; student/profileId is handled inside fetchFees
    if (currentUser) {
      fetchFees();
    }
  }, [fetchFees, currentUser]);

  useEffect(() => {
    if (canManage) {
      fetchStudents();
      fetchAcademicStructure();
    }
  }, [canManage, fetchStudents, fetchAcademicStructure]);

  const stats = useMemo(() => {
    const totalCollected = fees.reduce((sum, f) => sum + (parseFloat(f.receivedAmount) || 0), 0);
    const totalDue = fees.reduce((sum, f) => sum + (parseFloat(f.dueAmount) || 0), 0);
    return { totalCollected, totalDue, count: fees.length };
  }, [fees]);

  // Secondary options based on class type
  const getSecondaryFilterOptions = () => {
    if (filterClassType === 'Class') {
      return Array.from({ length: 8 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Class ${i + 1}`
      }));
    }

    if (filterClassType === 'BS') {
      // Semesters depend on selected degree when present; fallback to 1-8
      if (!Array.isArray(academicStructure) || academicStructure.length === 0) {
        return Array.from({ length: 8 }, (_, i) => ({ value: (i + 1).toString(), label: `Semester ${i + 1}` }));
      }
      const bsConfig = academicStructure.find(a => a.type === 'BS' || a.slug === 'BS');
      const degreeConfig = bsConfig?.degreeConfig || [];
      const selectedDegree = degreeConfig.find(d => d.degreeName === filterDegreeName);
      const maxSem = selectedDegree?.maxSemester || 8;
      return Array.from({ length: maxSem }, (_, i) => ({ value: (i + 1).toString(), label: `Semester ${i + 1}` }));
    }

    if (filterClassType === 'Almiya') {
      // Use classConfig identifiers (like Ama Awal, etc.) similar to StudentList
      const almiyaConfig = academicStructure?.find(a => a.type === 'Almiya' || a.slug === 'Almiya');
      const options = almiyaConfig?.classConfig?.map(cls => ({
        value: cls.classNumber?.toString() || '',
        label: `${cls.classIdentifier} (${cls.classNumber})`
      })) || [];
      return options.length > 0 ? options : Array.from({ length: 8 }, (_, i) => ({ value: (9 + i).toString(), label: `Almiya ${9 + i}` }));
    }

    // Hifaz: no secondary filter; handled by type only
    return [];
  };

  const canBulkCreateFees = useMemo(() => {
    if (!canManage || !filterFeeMonth || !filterFeeYear || !filterClassType) return false;
    if (filterClassType === 'BS') return Boolean(filterDegreeName && filterClassDetail);
    if (filterClassType === 'Hifaz') return true;
    return Boolean(filterClassDetail);
  }, [canManage, filterFeeMonth, filterFeeYear, filterClassType, filterClassDetail, filterDegreeName]);

  // Generate year options
  const generateYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i.toString());
    }
    return years;
  }, []);

  const openAdd = () => {
    setEditingFee(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (fee) => {
    setEditingFee(fee);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openView = (fee) => {
    setEditingFee(fee);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const requestDelete = (fee) => {
    setFeeToDelete(fee);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    try {
      await api.delete(`/fees/${feeToDelete._id}`);
      setConfirmOpen(false);
      setFeeToDelete(null);
      fetchFees();
    } catch (err) {
      console.error('Delete failed:', err);
      setConfirmOpen(false);
      setFeeToDelete(null);
    }
  };

  const handleBulkCreateFees = async () => {
    if (!filterFeeMonth || !filterFeeYear || !filterClassType) {
      showAlert('Please select Month, Year, and Class Type to create bulk fees', 'warning', 'Missing Selection');
      return;
    }
    if (filterClassType === 'BS' && (!filterDegreeName || !filterClassDetail)) {
      showAlert('Please select Degree and Semester for BS to create bulk fees', 'warning', 'Missing Selection');
      return;
    }
    if (['Class', 'Almiya'].includes(filterClassType) && !filterClassDetail) {
      showAlert('Please select the Class/Year detail to create bulk fees', 'warning', 'Missing Selection');
      return;
    }

    try {
      setLoading(true);
      
      // Filter students based on class type and detail (aligns with StudentList field usage)
      let filteredStudents = students.filter(s => s.class === filterClassType);

      if (filterClassType === 'Class') {
        filteredStudents = filteredStudents.filter(s => (s.classNumber || '').toString() === filterClassDetail);
      } else if (filterClassType === 'BS') {
        filteredStudents = filteredStudents
          .filter(s => !filterDegreeName || s.degreeName === filterDegreeName)
          .filter(s => `${s.semester || ''}` === filterClassDetail);
      } else if (filterClassType === 'Almiya') {
        // Almiya uses classNumber in Student model as well
        filteredStudents = filteredStudents.filter(s => (s.classNumber || '').toString() === filterClassDetail);
      } else if (filterClassType === 'Hifaz') {
        // No Juz selection; all Hifaz students included
      }
      
      if (filteredStudents.length === 0) {
        showAlert('No students found for the selected criteria', 'warning', 'No Results');
        setLoading(false);
        return;
      }

      // Check which students already have fees for this month/year
      const studentIdsWithFees = new Set(
        fees
          .filter(f => f.month === filterFeeMonth && f.year === parseInt(filterFeeYear))
          .map(f => f.studentId?._id || f.studentId)
      );

      // Filter out students who already have fees
      const studentsToCreate = filteredStudents.filter(s => !studentIdsWithFees.has(s._id));
      const duplicateCount = filteredStudents.length - studentsToCreate.length;

      if (studentsToCreate.length === 0) {
        showAlert(`All ${filteredStudents.length} students already have fees for ${filterFeeMonth} ${filterFeeYear}. No new records were created.`, 'info', 'No New Records');
        setLoading(false);
        return;
      }

      const bulkFeeData = studentsToCreate.map(student => ({
        studentId: student._id,
        month: filterFeeMonth,
        year: parseInt(filterFeeYear),
        totalFee: student.feePerMonth || 0,
        receivedAmount: 0,
        dueAmount: student.feePerMonth || 0,
        receivedDate: new Date(),
        receivedBy: 'Pending',
        paymentMethod: 'Cash',
        admissionFee: 0,
        paidBy: student.name,
      }));

      const res = await api.post('/fees/bulk-create', { fees: bulkFeeData });
      const createdCount = res.data?.createdCount ?? bulkFeeData.length;
      const serverDuplicates = res.data?.duplicateCount ?? duplicateCount;

      let successMessage = `Successfully created ${createdCount} fee records for ${filterFeeMonth} ${filterFeeYear}`;
      if (serverDuplicates > 0) {
        successMessage += `\nSkipped ${serverDuplicates} student(s) who already have fees for this period`;
      }
      showAlert(successMessage, 'success', 'Bulk Fees Created');
      fetchFees();
    } catch (err) {
      console.error('Bulk creation failed:', err);
      showAlert(err.response?.data?.message || 'Failed to create bulk fees', 'error', 'Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterClassType('');
    setFilterClassDetail('');
    setFilterDegreeName('');
    setFilterFeeMonth(currentMonthName);
    setFilterFeeYear(currentYear);
    setFilterPaymentMethod('');
    setFilterReceivedBy('');
    setFilterFeeStatus('');
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Hero header */}
      <div className={`mb-6 rounded-2xl p-6 sm:p-8 ${currentTheme.panelBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme.shadow || 'shadow'} ${currentTheme.border || 'border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold ${currentTheme.title || 'text-emerald-800'}`}>Fee Management</h1>
            <p className={`${currentTheme.mutedText || 'text-gray-600'} mt-2`}>Track collections, dues, and receipts with ease.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {canManage && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Collected" value={currency(stats.totalCollected)} icon={<BanknotesIcon className="h-8 w-8 text-emerald-600" />} theme={currentTheme} />
        <StatCard title="Outstanding Dues" value={currency(stats.totalDue)} icon={<WalletIcon className="h-8 w-8 text-rose-600" />} theme={currentTheme} />
        <StatCard title="Records" value={stats.count} icon={<DocumentArrowDownIcon className="h-8 w-8 text-teal-600" />} theme={currentTheme} />
      </div>
      )}

      {/* Filters & Advanced Filters */}
      {canManage && (
      <div className={`mb-6 rounded-xl p-6 ${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'}`}>
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${currentTheme?.inputBg || 'border-gray-300 bg-gray-50'}`}
              placeholder="Search by student name or CNIC..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`group flex items-center justify-center px-8 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto ${showAdvancedFilters ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
            {canManage && (
              <button onClick={openAdd} className="group flex items-center justify-center px-8 py-2 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5 w-full sm:w-auto">
                <PlusCircleIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />Fee
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className={`mt-6 pt-6 border-t ${currentTheme?.border || 'border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${currentTheme?.title || 'text-gray-800'}`}>Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* Fee Period Filters */}
              <div>
                <label htmlFor="filterFeeMonth" className="block text-sm font-semibold text-gray-700 mb-2">Fee Month</label>
                <select
                  id="filterFeeMonth"
                  value={filterFeeMonth}
                  onChange={(e) => setFilterFeeMonth(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                >
                  <option value="">All Months</option>
                  {months.map(monthName => (
                    <option key={monthName} value={monthName}>{monthName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterFeeYear" className="block text-sm font-semibold text-gray-700 mb-2">Fee Year</label>
                <select
                  id="filterFeeYear"
                  value={filterFeeYear}
                  onChange={(e) => setFilterFeeYear(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Academic Structure Filters */}
              <div>
                <label htmlFor="filterClassType" className="block text-sm font-semibold text-gray-700 mb-2">Class Type</label>
                <select
                  id="filterClassType"
                  value={filterClassType}
                  onChange={(e) => {
                    setFilterClassType(e.target.value);
                    setFilterClassDetail('');
                    setFilterDegreeName('');
                  }}
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                >
                  <option value="">All Class Types</option>
                  <option value="Class">Regular Class (1-8)</option>
                  <option value="BS">BS / Honors / Degree</option>
                  <option value="Almiya">Almiya (9-16)</option>
                  <option value="Hifaz">Hifaz-ul-Quran</option>
                </select>
              </div>
              {/* Conditional Academic Filters */}
              {filterClassType === 'BS' && (
                <>
                  <div>
                    <label htmlFor="filterDegreeName" className="block text-sm font-semibold text-gray-700 mb-2">Degree</label>
                    <select
                      id="filterDegreeName"
                      value={filterDegreeName}
                      onChange={(e) => {
                        setFilterDegreeName(e.target.value);
                        setFilterClassDetail('');
                      }}
                      className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                    >
                      <option value="">All Degrees</option>
                      {(academicStructure?.find(a => a.type === 'BS' || a.slug === 'BS')?.degreeConfig || []).map((degree) => (
                        <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                      ))}
                    </select>
                  </div>
                  {filterDegreeName && (
                    <div>
                      <label htmlFor="filterClassDetail" className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                      <select
                        id="filterClassDetail"
                        value={filterClassDetail}
                        onChange={(e) => setFilterClassDetail(e.target.value)}
                        className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                      >
                        <option value="">All Semesters</option>
                        {getSecondaryFilterOptions().map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {['Class', 'Almiya'].includes(filterClassType) && (
                <div>
                  <label htmlFor="filterClassDetail" className="block text-sm font-semibold text-gray-700 mb-2">
                    {filterClassType === 'Class' ? 'Class' : 'Year'}
                  </label>
                  <select
                    id="filterClassDetail"
                    value={filterClassDetail}
                    onChange={(e) => setFilterClassDetail(e.target.value)}
                    className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                  >
                    <option value="">All {filterClassType === 'Class' ? 'Classes' : 'Years'}</option>
                    {getSecondaryFilterOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Filters */}
              <div>
                <label htmlFor="filterPaymentMethod" className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select
                  id="filterPaymentMethod"
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                >
                  <option value="">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterReceivedBy" className="block text-sm font-semibold text-gray-700 mb-2">Received By</label>
                <input
                  id="filterReceivedBy"
                  type="text"
                  value={filterReceivedBy}
                  onChange={(e) => setFilterReceivedBy(e.target.value)}
                  placeholder="Staff member name..."
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                />
              </div>

              {/* Fee Status Filter */}
              <div>
                <label htmlFor="filterFeeStatus" className="block text-sm font-semibold text-gray-700 mb-2">Fee Status</label>
                <select
                  id="filterFeeStatus"
                  value={filterFeeStatus}
                  onChange={(e) => setFilterFeeStatus(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'}`}
                >
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial Paid</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {canBulkCreateFees && (
                <button
                  onClick={handleBulkCreateFees}
                  disabled={loading}
                  className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  Bulk Create Fees ({filterClassType}{filterClassType === 'BS' && filterDegreeName ? ` - ${filterDegreeName}` : ''}{filterClassDetail ? ` ${filterClassDetail}` : ''} - {filterFeeMonth})
                </button>
              )}
              <button 
                onClick={handleResetFilters} 
                className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <XMarkIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {error && <Message type="error">{error}</Message>}

      {/* List */}
      <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow'} ${currentTheme.border || 'border border-gray-200'} rounded-xl overflow-hidden`}>
        {loading ? (
          <div className="p-10"><Loader /></div>
        ) : fees.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No fees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                <tr>
                  <Th>Student</Th>
                  <Th>Month</Th>
                  <Th>Year</Th>
                  <Th>Total</Th>
                  <Th>Received</Th>
                  <Th>Due</Th>
                  <Th>Method</Th>
                  <Th>Received Date</Th>
                  <Th>Attachment</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fees.map((f, index) => (
                  <tr
                    key={f._id}
                    className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <Td>
                      <div className="flex items-center">
                        {f.studentId?.profilePictureUrl ? (
                          <img
                            src={`${backendBaseUrl}${f.studentId.profilePictureUrl}`}
                            alt="avatar"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/10b981/ffffff?text=' + (f.studentId?.name?.[0] || 'S'); }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-200">
                            <span className="text-green-700 font-bold text-sm">{(f.studentId?.name?.[0] || 'S')}</span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{f.studentId?.name || '—'}</div>
                          <div className="text-xs text-gray-500 font-mono">{f.studentId?.cnic || ''}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{f.month}</Td>
                    <Td>{f.year}</Td>
                    <Td className="text-gray-900 font-semibold">{currency(f.totalFee)}</Td>
                    <Td>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                        {currency(f.receivedAmount)}
                      </span>
                    </Td>
                    <Td>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                        {currency(f.dueAmount)}
                      </span>
                    </Td>
                    <Td>
                      {f.paymentMethod ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {f.paymentMethod}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td>{f.receivedDate ? new Date(f.receivedDate).toLocaleDateString() : '—'}</Td>
                    <Td>
                      {f.billScreenshotUrl ? (
                        <a className="text-teal-700 hover:underline" href={`${backendBaseUrl}${f.billScreenshotUrl}`} target="_blank" rel="noreferrer">View</a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200" onClick={() => openView(f)} title="View">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {canManage && (
                          <>
                            <button className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors duration-200" onClick={() => openEdit(f)} title="Edit">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200" onClick={() => requestDelete(f)} title="Delete">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Primary CTA for mobile */}
      {canManage && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button onClick={openAdd} className="inline-flex items-center px-4 py-3 rounded-full shadow-lg bg-emerald-600 text-white">
            <PlusCircleIcon className="h-6 w-6 mr-2" /> New Fee
          </button>
        </div>
      )}

      {/* Modal */}
      <FeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-xl font-semibold ${currentTheme.title || 'text-gray-900'}`}>{isViewMode ? 'Fee Details (Receipt)' : editingFee ? 'Edit Fee Record' : 'Add New Fee Record'}</h3>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <FeeForm
          editingFee={editingFee}
          fetchFees={fetchFees}
          studentsForForm={students}
          onClose={() => setIsModalOpen(false)}
          isViewMode={isViewMode}
          fetchStudents={fetchStudents}
        />
      </FeeModal>

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        message={feeToDelete ? `Delete fee record for ${feeToDelete.studentId?.name || 'this student'} (${feeToDelete.month} ${feeToDelete.year})?` : 'Delete this fee record?'}
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

const StatCard = ({ title, value, icon, theme }) => (
  <div className={`p-5 rounded-lg flex items-center justify-between ${theme.panelBg || 'bg-gray-50'} ${theme.shadow || 'shadow'} ${theme.border || 'border border-gray-200'} transform hover:-translate-y-0.5 transition`}>
    <div>
      <p className={`${theme.mutedText || 'text-gray-500'} text-sm`}>{title}</p>
      <p className={`text-2xl font-bold ${theme.title || 'text-emerald-800'}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-full ${theme.badgeBg || 'bg-white'} ${theme.shadow || 'shadow'}`}>{icon}</div>
  </div>
);

const Th = ({ children }) => (
  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">{children}</th>
);
const Td = ({ children }) => (
  <td className="px-6 py-4 text-sm text-gray-700 align-middle">{children}</td>
);

export default FeeList;
