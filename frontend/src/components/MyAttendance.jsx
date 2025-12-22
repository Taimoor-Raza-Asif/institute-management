// src/screens/MyAttendanceScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import Loader from './Loader';
import Message from './Message';
import {
  CalendarDaysIcon, ChartBarIcon, UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Calendar, TrendingUp } from 'lucide-react';

const MyAttendance = () => {
  const { currentUser: user } = useContext(UserContext);
  const { id } = useParams(); // This 'id' will be the student/staff profileId

  const { currentTheme } = useTheme();

  // Role checks for UI visibility
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const canManageAttendance = isAdmin || isTeacher;

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-8 mb-8">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">My Attendance</h1>
                <p className="text-emerald-50/90 mt-1 text-sm sm:text-base max-w-2xl">Track your attendance records and performance</p>
              </div>
            </div>
            {attendanceSummary && (
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-emerald-50/80 text-sm">Attendance Rate</p>
                  <p className={`text-3xl sm:text-4xl font-extrabold ${calculateAttendancePercentage() >= 75 ? 'text-emerald-200' : 'text-red-200'}`}>
                    {calculateAttendancePercentage()}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Message type="error">{error}</Message>
          </div>
        )}

        {/* Filter Section (Only for managers/teachers) */}
        {canManageAttendance && (
        <div className={`p-5 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} border border-emerald-100 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="monthSelect" className="block text-sm font-semibold text-gray-700">
                Select Month
              </label>
              <select
                id="monthSelect"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-emerald-200 ring-1 ring-emerald-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 hover:shadow-md transition"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="yearSelect" className="block text-sm font-semibold text-gray-700">
                Select Year
              </label>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-emerald-200 ring-1 ring-emerald-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 hover:shadow-md transition"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Action
              </label>
              <button
                onClick={handleMonthYearChange}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>View Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : attendanceRecords.length === 0 && !error ? (
        <div className="p-12 rounded-2xl bg-white shadow-lg border border-emerald-100 text-center">
          <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <Message type="info">No attendance records found for the selected period.</Message>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {attendanceSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg border border-blue-200 transform hover:scale-105 transition-all">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-blue-500 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">Total Days</p>
                    <p className="text-4xl font-bold text-blue-900">{attendanceSummary.totalDays}</p>
                  </div>
                  <CalendarDaysIcon className="h-14 w-14 text-blue-300" />
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg border border-green-200 transform hover:scale-105 transition-all">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-green-500 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Present</p>
                    <p className="text-4xl font-bold text-green-900">{attendanceSummary.presentDays}</p>
                  </div>
                  <CheckCircleIcon className="h-14 w-14 text-green-300" />
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-all">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-red-500 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Absent</p>
                    <p className="text-4xl font-bold text-red-900">{attendanceSummary.absentDays}</p>
                  </div>
                  <XCircleIcon className="h-14 w-14 text-red-300" />
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg border border-amber-200 transform hover:scale-105 transition-all">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-amber-500 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-2">On Leave</p>
                    <p className="text-4xl font-bold text-amber-900">{attendanceSummary.leaveDays}</p>
                  </div>
                  <ClockIcon className="h-14 w-14 text-amber-300" />
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records Table */}
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className={`sticky top-0 ${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Marked By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceRecords.map((record, index) => (
                  <tr key={record._id} className={`hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        {record.markedBy?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
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
    </div>
  );
};

export default MyAttendance;