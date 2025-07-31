// src/screens/AllAttendanceRecordsScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  CalendarDaysIcon, UserGroupIcon, FunnelIcon, ChartBarIcon, CheckCircleIcon,  XCircleIcon 
} from '@heroicons/react/24/outline';

const AllAttendanceRecords = () => {
  const { currentUser: user } = useContext(UserContext);

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
    if (user?.role === 'admin') {
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
      case 'Holiday': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />;
      case 'Absent': return <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />;
      case 'Leave': return <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />;
      case 'Holiday': return <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />;
      default: return <UserGroupIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
        <ChartBarIcon className="h-8 w-8 mr-3 text-indigo-600" /> All Attendance Records
      </h2>

      {error && <Message type="error">{error}</Message>}

      {user?.role === 'admin' && (
        <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="filterStartDate"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="filterEndDate"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-full lg:col-span-1 flex items-end">
              <button
                onClick={handleFilterChange}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 shadow-sm flex items-center justify-center"
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
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNIC
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marked By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marked At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map(record => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.onModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.user?.cnic || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)} flex items-center`}>
                      {getStatusIcon(record.status)} {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.markedBy?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.markedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllAttendanceRecords;