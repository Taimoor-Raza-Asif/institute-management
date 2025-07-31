// src/screens/MyAttendanceScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import Loader from './Loader';
import Message from './Message';
import {
  CalendarDaysIcon, ChartBarIcon, UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';

const MyAttendance = () => {
  const { currentUser: user } = useContext(UserContext);
  const { id } = useParams(); // This 'id' will be the student/staff profileId

  const navigate = useNavigate();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fetchMyAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (user?.role === 'student' && user?.profileId?.toString() === id) {
        endpoint = `/attendance/student/${id}`;
      } else if (['teacher', 'accountant', 'cook', 'cleaner'].includes(user?.role) && user?.profileId?.toString() === id) {
        endpoint = `/attendance/staff/${id}`;
      } else {
        // If the user is not authorized for this ID, redirect or show error
        setError('Not authorized to view this attendance record.');
        setLoading(false);
        return;
      }

      const { data } = await api.get(endpoint, {
        params: { year: selectedYear, month: selectedMonth }
      });
      setAttendanceRecords(data.records);
      setAttendanceSummary(data.summary);
    } catch (err) {
      console.error('Error fetching my attendance:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance.');
    } finally {
      setLoading(false);
    }
  }, [user, id, selectedYear, selectedMonth]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Ensure the ID in the URL matches the current user's profileId
    if (user.profileId?.toString() !== id) {
        setError("You are not authorized to view this profile's attendance.");
        setLoading(false);
        return;
    }
    fetchMyAttendance();
  }, [user, id, navigate, fetchMyAttendance]);

  const handleMonthYearChange = () => {
    fetchMyAttendance(); // Re-fetch when month/year changes
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
      default: return <UserIcon className="h-5 w-5 text-gray-500 mr-2" />;
    }
  };

  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // Current year +/- 2

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
        <ChartBarIcon className="h-8 w-8 mr-3 text-indigo-600" /> My Attendance
      </h2>

      {error && <Message type="error">{error}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="monthSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <select
            id="monthSelect"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleMonthYearChange}
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 shadow-sm flex items-center justify-center"
            disabled={loading}
          >
            <CalendarDaysIcon className="h-5 w-5 mr-2" /> View Attendance
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : attendanceRecords.length === 0 && !error ? (
        <Message type="info">No attendance records found for the selected period.</Message>
      ) : (
        <>
          {attendanceSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 text-center">
                <p className="text-sm text-blue-700">Total Days</p>
                <p className="text-2xl font-bold text-blue-800">{attendanceSummary.totalDays}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200 text-center">
                <p className="text-sm text-green-700">Present</p>
                <p className="text-2xl font-bold text-green-800">{attendanceSummary.presentDays}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200 text-center">
                <p className="text-sm text-red-700">Absent</p>
                <p className="text-2xl font-bold text-red-800">{attendanceSummary.absentDays}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200 text-center">
                <p className="text-sm text-yellow-700">On Leave</p>
                <p className="text-2xl font-bold text-yellow-800">{attendanceSummary.leaveDays}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map(record => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
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
                      {record.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;