// src/screens/MyAttendanceScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import Loader from './Loader';
import Message from './Message';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDaysIcon, ChartBarIcon, UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const MyAttendance = () => {
  const { currentUser: user } = useContext(UserContext);
  const { id } = useParams(); // This 'id' will be the student/staff profileId

  const { currentTheme } = useTheme();

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
      case 'Present': return 'text-green-700 bg-green-100 border-green-300';
      case 'Absent': return 'text-red-700 bg-red-100 border-red-300';
      case 'Leave': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'Holiday': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />;
      case 'Absent': return <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />;
      case 'Leave': return <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />;
      case 'Holiday': return <CalendarDaysIcon className="h-5 w-5 text-green-500 mr-2" />;
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

  const calculateAttendancePercentage = () => {
    if (!attendanceSummary || attendanceSummary.totalDays === 0) return 0;
    return Math.round((attendanceSummary.presentDays / attendanceSummary.totalDays) * 100);
  };

  return (
    <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gradient-to-br from-gray-50 to-gray-100'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-2xl p-6 mb-6 border ${currentTheme?.border || 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${currentTheme?.iconBg || 'bg-gradient-to-br from-green-400 to-green-600'}`}>
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${currentTheme?.title || 'text-gray-800'}`}>
                  My Attendance
                </h1>
                <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'} mt-1`}>
                  Track your attendance records and performance
                </p>
              </div>
            </div>
            {attendanceSummary && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="text-right">
                  <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>Attendance Rate</p>
                  <p className={`text-2xl font-bold ${calculateAttendancePercentage() >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateAttendancePercentage()}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-pulse">
            <Message type="error">{error}</Message>
          </div>
        )}

        {/* Filter Section */}
        <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-2xl p-6 mb-6 border ${currentTheme?.border || 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="monthSelect" className={`block text-sm font-semibold ${currentTheme?.text || 'text-gray-700'}`}>
                Select Month
              </label>
              <select
                id="monthSelect"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={`w-full px-4 py-3 ${currentTheme?.inputBg || 'bg-gray-50'} border ${currentTheme?.border || 'border-gray-300'} rounded-xl ${currentTheme?.shadow || 'shadow-sm'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${currentTheme?.text || 'text-gray-800'}`}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="yearSelect" className={`block text-sm font-semibold ${currentTheme?.text || 'text-gray-700'}`}>
                Select Year
              </label>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`w-full px-4 py-3 ${currentTheme?.inputBg || 'bg-gray-50'} border ${currentTheme?.border || 'border-gray-300'} rounded-xl ${currentTheme?.shadow || 'shadow-sm'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${currentTheme?.text || 'text-gray-800'}`}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${currentTheme?.text || 'text-gray-700'}`}>
                Action
              </label>
              <button
                onClick={handleMonthYearChange}
                disabled={loading}
                className={`w-full h-12 ${currentTheme?.buttonPrimary || 'bg-gradient-to-r from-green-500 to-green-600'} ${currentTheme?.buttonText || 'text-white'} px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${currentTheme?.shadow || 'shadow-lg hover:shadow-xl'} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>View Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : attendanceRecords.length === 0 && !error ? (
        <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-2xl p-12 text-center border ${currentTheme?.border || 'border-gray-200'}`}>
          <CalendarDaysIcon className={`h-16 w-16 mx-auto ${currentTheme?.mutedText || 'text-gray-400'} mb-4`} />
          <Message type="info">No attendance records found for the selected period.</Message>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {attendanceSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Days</p>
                    <p className="text-3xl font-bold text-blue-800">{attendanceSummary.totalDays}</p>
                  </div>
                  <CalendarDaysIcon className="h-12 w-12 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Present</p>
                    <p className="text-3xl font-bold text-green-800">{attendanceSummary.presentDays}</p>
                  </div>
                  <CheckCircleIcon className="h-12 w-12 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Absent</p>
                    <p className="text-3xl font-bold text-red-800">{attendanceSummary.absentDays}</p>
                  </div>
                  <XCircleIcon className="h-12 w-12 text-red-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl shadow-lg border border-yellow-200 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 mb-1">On Leave</p>
                    <p className="text-3xl font-bold text-yellow-800">{attendanceSummary.leaveDays}</p>
                  </div>
                  <ClockIcon className="h-12 w-12 text-yellow-400" />
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records Table */}
          <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-2xl overflow-hidden border ${currentTheme?.border || 'border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                  <tr>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.text || 'text-gray-700'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.text || 'text-gray-700'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.text || 'text-gray-700'} uppercase tracking-wider`}>
                      Marked By
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.text || 'text-gray-700'} uppercase tracking-wider`}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y ${currentTheme?.divide || 'divide-gray-200'}`}>
                  {attendanceRecords.map((record, index) => (
                    <tr key={record._id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? '' : 'bg-gray-25'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-bold rounded-full border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)} 
                          {record.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {record.markedBy?.name || 'N/A'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                        {record.reason || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default MyAttendance;