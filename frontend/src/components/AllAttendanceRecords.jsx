// src/screens/AllAttendanceRecordsScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDaysIcon, UserGroupIcon, FunnelIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AllAttendanceRecords = () => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState(''); // 'Student' or 'Staff'
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const { data } = await api.get('/attendance', { params });
      setAttendanceRecords(data);
    } catch (err) {
      console.error('Error fetching all attendance records:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      fetchAllAttendance();
    } else {
      setError('You are not authorized to view all attendance records.');
    }
  }, [user, fetchAllAttendance]);

  const handleFilterChange = () => {
    fetchAllAttendance();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return `${currentTheme?.badgeSuccessBg || 'bg-green-50'} ${currentTheme?.badgeSuccessText || 'text-green-600'}`;
      case 'Absent': return `${currentTheme?.badgeDangerBg || 'bg-red-50'} ${currentTheme?.badgeDangerText || 'text-red-600'}`;
      case 'Leave': return `${currentTheme?.badgeWarningBg || 'bg-amber-50'} ${currentTheme?.badgeWarningText || 'text-amber-600'}`;
      case 'Holiday': return `${currentTheme?.badgeInfoBg || 'bg-blue-50'} ${currentTheme?.badgeInfoText || 'text-blue-600'}`;
      default: return `${currentTheme?.badgeBg || 'bg-gray-50'} ${currentTheme?.badgeText || 'text-gray-600'}`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className={`h-5 w-5 ${currentTheme?.successIcon || 'text-green-500'} mr-2`} />;
      case 'Absent': return <XCircleIcon className={`h-5 w-5 ${currentTheme?.dangerIcon || 'text-red-500'} mr-2`} />;
      case 'Leave': return <ClockIcon className={`h-5 w-5 ${currentTheme?.warningIcon || 'text-yellow-500'} mr-2`} />;
      case 'Holiday': return <CalendarDaysIcon className={`h-5 w-5 ${currentTheme?.infoIcon || 'text-green-500'} mr-2`} />;
      default: return <UserGroupIcon className={`h-5 w-5 ${currentTheme?.iconText || 'text-gray-500'} mr-2`} />;
    }
  };

  return (
    <div className={`container mx-auto p-4 sm:p-6 lg:p-8 ${currentTheme?.mainBg || 'bg-gray-50'}`}>
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 text-left">
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>
            <ChartBarIcon className={`h-9 w-9 inline-block mr-3 ${currentTheme?.iconText || ''}`} /> All Attendance Records
          </h1>
          <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm`}>View and filter comprehensive attendance history</p>
        </div>
      </div>

      {error && <Message type="error">{error}</Message>}

      {((user?.role === 'teacher') || user?.role === 'admin') && (
        <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl ${currentTheme?.shadow || 'shadow-xl'} p-6 mb-6 ${currentTheme?.border || 'border border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-1/2 lg:w-2/3">
              <input
                type="text"
                placeholder="Search by student or staff name..."
                className={`block w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputPlaceholder || 'placeholder:text-gray-400'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-emerald-500'} ${currentTheme?.inputFocus || 'focus:border-emerald-500'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme?.mutedText || 'text-gray-400'}`} />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group flex items-center justify-center h-12 px-6 rounded-xl font-semibold transition-all duration-300 ${currentTheme?.shadow || 'shadow-lg'} hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} ${currentTheme?.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-emerald-50'}`}
              >
                <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                {showFilters ? 'Hide' : 'Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t ${currentTheme?.border || 'border-gray-200'}`}>
              <div>
                <label htmlFor="filterType" className={`block text-sm font-medium mb-2 ${currentTheme?.mutedText || 'text-gray-700'}`}>Type</label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-emerald-500'}`}
                >
                  {user?.role === 'admin' && (<option value="">All</option>)}
                  <option value="Student">Student</option>
                  {user?.role === 'admin' && (<option value="Staff">Staff</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filterStatus" className={`block text-sm font-medium mb-2 ${currentTheme?.mutedText || 'text-gray-700'}`}>Status</label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-emerald-500'}`}
                >
                  <option value="">All</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>
              <div>
                <label htmlFor="filterStartDate" className={`block text-sm font-medium mb-2 ${currentTheme?.mutedText || 'text-gray-700'}`}>Start Date</label>
                <input
                  type="date"
                  id="filterStartDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-emerald-500'}`}
                />
              </div>
              <div>
                <label htmlFor="filterEndDate" className={`block text-sm font-medium mb-2 ${currentTheme?.mutedText || 'text-gray-700'}`}>End Date</label>
                <input
                  type="date"
                  id="filterEndDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-emerald-500'}`}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex items-end">
                <button
                  onClick={handleFilterChange}
                  className={`w-full h-12 flex items-center justify-center px-6 rounded-xl font-bold transition-all duration-300 ${currentTheme?.shadow || 'shadow-lg'} hover:shadow-2xl transform hover:-translate-y-0.5 ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryBorder || 'border border-emerald-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={loading}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" /> Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : attendanceRecords.length === 0 && !error ? (
        <Message type="info">No attendance records found with the selected filters.</Message>
      ) : (
        <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl ${currentTheme?.shadow || 'shadow-lg'} overflow-hidden ${currentTheme?.border || 'border border-gray-100'}`}>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mobile-card-table">
            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  CNIC
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Marked By
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                  Marked At
                </th>
              </tr>
            </thead>
            <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
              {attendanceRecords.filter((record) => {
                if (!searchTerm) return true;
                const name = record.user?.name || '';
                const cnic = record.user?.cnic || '';
                const s = searchTerm.toLowerCase();
                return name.toLowerCase().includes(s) || cnic.toLowerCase().includes(s);
              }).map((record) => (
                <tr key={record._id} className={`transition-all duration-150 ${currentTheme?.tableHover || 'hover:bg-emerald-50'} ${currentTheme?.tableStripedBg || currentTheme?.tableStripe || 'odd:bg-gray-50'} ${currentTheme?.tbodyBg || 'bg-white'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>
                    {record.onModel}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme?.text || 'text-gray-900'}`}>
                    {record.user?.name || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                    {record.user?.cnic || 'N/A'}

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)} flex items-center`}>
                      {getStatusIcon(record.status)} {record.status}
                    </span>
                  </td>
                  <td className={`px-10 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                    {record.markedBy?.role || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                    {new Date(record.markedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAttendanceRecords;