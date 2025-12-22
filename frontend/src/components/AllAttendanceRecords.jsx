// src/screens/AllAttendanceRecordsScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDaysIcon, UserGroupIcon, FunnelIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
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
      case 'Present': return 'text-green-600 bg-green-50';
      case 'Absent': return 'text-red-600 bg-red-50';
      case 'Leave': return 'text-yellow-600 bg-yellow-50';
      case 'Holiday': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />;
      case 'Absent': return <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />;
      case 'Leave': return <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />;
      case 'Holiday': return <CalendarDaysIcon className="h-5 w-5 text-green-500 mr-2" />;
      default: return <UserGroupIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 text-left">
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>
            <ChartBarIcon className="h-9 w-9 inline-block mr-3" /> All Attendance Records
          </h1>
          <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm`}>View and filter comprehensive attendance history</p>
        </div>
      </div>

      {error && <Message type="error">{error}</Message>}

      {((user?.role === 'teacher')  || user?.role === 'admin') && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-3">
            <FunnelIcon className="h-6 w-6 mr-2 text-green-600" /> Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {user?.role === 'admin' && (<option value="">All</option>)}
                <option value="Student">Student</option>
                {user?.role === 'admin' && (<option value="Staff">Staff</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                id="filterStartDate"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                id="filterEndDate"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex items-end">
              <button
                onClick={handleFilterChange}
                className="w-full h-12 flex items-center justify-center px-6 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FunnelIcon className="h-5 w-5 mr-2" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : attendanceRecords.length === 0 && !error ? (
        <Message type="info">No attendance records found with the selected filters.</Message>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  CNIC
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Marked By
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Marked At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {attendanceRecords.map((record, index) => (
                <tr key={record._id} className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.onModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.user?.cnic || 'N/A'}

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)} flex items-center`}>
                      {getStatusIcon(record.status)} {record.status}
                    </span>
                  </td>
                  <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-600">
                    {record.markedBy?.role || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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