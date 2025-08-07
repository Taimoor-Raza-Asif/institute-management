// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import Loader from '../components/Loader';
import Message from '../components/Message';
import api from '../api';

// Define the colors for the pie chart
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FEE', '#FF6666'];

// Get current month and year for default filter values
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const Reports = () => {
  const [reportsData, setReportsData] = useState({
    fees: { monthlyReport: [], paymentMethodReport: [], admissionFeeReport: [] },
    salaries: { monthlyReport: [], roleReport: [] },
    billing: { monthlyReport: [], categoryReport: [] },
    donations: { monthlyReport: [], purposeReport: [] },
    attendance: { dailySummary: [], monthlySummary: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fees');

  // Filter states
  const [feesFilters, setFeesFilters] = useState({ year: currentYear });
  const [salariesFilters, setSalariesFilters] = useState({ year: currentYear });
  const [billingFilters, setBillingFilters] = useState({ year: currentYear });
  const [donationsFilters, setDonationsFilters] = useState({ year: currentYear });
  const [attendanceFilters, setAttendanceFilters] = useState({ type: 'Student', startDate: '', endDate: '' });

  const fetchData = async (url, params = {}) => {
    try {
      const { data } = await api.get(url, { params });
      return data;
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      return { monthlyReport: [], paymentMethodReport: [], roleReport: [], categoryReport: [], purposeReport: [], dailySummary: [], monthlySummary: [] };
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const fees = await fetchData('/fees/reports', feesFilters);
        const salaries = await fetchData('/salary/reports', salariesFilters);
        const billing = await fetchData('/billing/reports', billingFilters);
        const donations = await fetchData('/donations/reports', donationsFilters);
        const attendance = await fetchData('/attendance/reports', attendanceFilters);
        setReportsData({ fees, salaries, billing, donations, attendance });
      } catch (err) {
        setError("Failed to load reports. Please check your network connection and server.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [feesFilters, salariesFilters, billingFilters, donationsFilters, attendanceFilters]);


  // Helper function to generate options for years
  const getYears = () => {
    const years = [];
    const startYear = 2020;
    const endYear = new Date().getFullYear() + 1;
    for (let i = endYear; i >= startYear; i--) {
      years.push(i);
    }
    return years;
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  // Data processing for charts
  const feesChartData = reportsData?.fees?.monthlyReport?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    'Total Collected': item.totalCollected,
    'Total Due': item.totalDue,
  })) || [];

  const admissionFeeChartData = reportsData?.fees?.admissionFeeReport?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    'Total Admission Fee': item.totalAdmissionFee,
  })) || [];

  const salariesChartData = reportsData?.salaries?.monthlyReport?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    'Total Paid': item.totalPaid,
    'Bonus': item.totalBonus,
    'Overtime': item.totalOvertime
  })) || [];

  const billingChartData = reportsData?.billing?.monthlyReport?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    'Total Expenses': item.totalPaid
  })) || [];

  const donationsChartData = reportsData?.donations?.monthlyReport?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    'Total Donations': item.totalDonations
  })) || [];

  const paymentMethodPieData = reportsData?.fees?.paymentMethodReport?.map(item => ({
    name: item._id,
    value: item.totalAmount
  })) || [];

  const salaryRolePieData = reportsData?.salaries?.roleReport?.map(item => ({
    name: item.role,
    value: item.totalPaid
  })) || [];

  const expenseCategoryPieData = reportsData?.billing?.categoryReport?.map(item => ({
    name: item.category,
    value: item.totalAmount
  })) || [];

  const monthlyAttendanceData = reportsData?.attendance?.monthlySummary?.map(month => {
    const monthName = `${month._id.month}/${month._id.year}`;
    const present = month.statuses.find(s => s.status === 'Present')?.count || 0;
    const absent = month.statuses.find(s => s.status === 'Absent')?.count || 0;
    const leave = month.statuses.find(s => s.status === 'Leave')?.count || 0;
    return { name: monthName, present, absent, leave };
  }) || [];

  const dailyAttendanceData = reportsData?.attendance?.dailySummary?.slice(0, 7)?.map(day => {
    const date = new Date(day._id.date).toLocaleDateString();
    const present = day.statuses.find(s => s.status === 'Present')?.count || 0;
    const absent = day.statuses.find(s => s.status === 'Absent')?.count || 0;
    const leave = day.statuses.find(s => s.status === 'Leave')?.count || 0;
    return { name: date, present, absent, leave };
  }) || [];

  const totalCollected = feesChartData.reduce((acc, curr) => acc + curr['Total Collected'], 0);
  const totalDue = feesChartData.reduce((acc, curr) => acc + curr['Total Due'], 0);
  const totalAdmissionFees = reportsData?.fees?.admissionFeeReport?.reduce((acc, curr) => acc + curr.totalAdmissionFee, 0) || 0;
  const totalSalaryPaid = salariesChartData.reduce((acc, curr) => acc + curr['Total Paid'], 0);
  const totalBonusPaid = salariesChartData.reduce((acc, curr) => acc + curr['Bonus'], 0);
  const totalOvertimePaid = salariesChartData.reduce((acc, curr) => acc + curr['Overtime'], 0);
  const totalExpenses = billingChartData.reduce((acc, curr) => acc + curr['Total Expenses'], 0);
  const totalDonations = donationsChartData.reduce((acc, curr) => acc + curr['Total Donations'], 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'fees':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <label className="font-semibold text-gray-700">Filter by Year:</label>
              <select
                className="p-2 border rounded-md"
                value={feesFilters.year}
                onChange={(e) => setFeesFilters({ ...feesFilters, year: parseInt(e.target.value) })}
              >
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Collected</h3>
                  <p className="text-3xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-green-400">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Due</h3>
                  <p className="text-3xl font-bold text-red-600">Rs. {totalDue.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-red-400">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Admission Fees</h3>
                  <p className="text-3xl font-bold text-blue-600">Rs. {totalAdmissionFees.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-blue-400">
                  <i className="fas fa-user-plus"></i>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Fees Collected & Due</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={feesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Collected" stroke="#00C49F" name="Collected" />
                    <Line type="monotone" dataKey="Total Due" stroke="#FFBB28" name="Due" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Fees by Payment Method</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {paymentMethodPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Monthly Admission Fees</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={admissionFeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Admission Fee" stroke="#00C49F" name="Admission Fees" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'salaries':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <label className="font-semibold text-gray-700">Filter by Year:</label>
              <select
                className="p-2 border rounded-md"
                value={salariesFilters.year}
                onChange={(e) => setSalariesFilters({ ...salariesFilters, year: parseInt(e.target.value) })}
              >
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Salary Paid</h3>
                  <p className="text-3xl font-bold text-green-600">Rs. {totalSalaryPaid.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-green-400">
                  <i className="fas fa-wallet"></i>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Bonus</h3>
                  <p className="text-3xl font-bold text-blue-600">Rs. {totalBonusPaid.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-blue-400">
                  <i className="fas fa-gift"></i>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Overtime</h3>
                  <p className="text-3xl font-bold text-purple-600">Rs. {totalOvertimePaid.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-purple-400">
                  <i className="fas fa-clock"></i>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Salaries, Bonus & Overtime Paid</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salariesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Paid" fill="#8884d8" />
                    <Bar dataKey="Bonus" fill="#82ca9d" />
                    <Bar dataKey="Overtime" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Salaries by Staff Role</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salaryRolePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {salaryRolePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'billing':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <label className="font-semibold text-gray-700">Filter by Year:</label>
              <select
                className="p-2 border rounded-md"
                value={billingFilters.year}
                onChange={(e) => setBillingFilters({ ...billingFilters, year: parseInt(e.target.value) })}
              >
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
                  <p className="text-3xl font-bold text-red-600">Rs. {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-red-400">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Monthly Bills & Expenses</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={billingChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Expenses" stroke="#FF6666" name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Expenses by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {expenseCategoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'donations':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <label className="font-semibold text-gray-700">Filter by Year:</label>
              <select
                className="p-2 border rounded-md"
                value={donationsFilters.year}
                onChange={(e) => setDonationsFilters({ ...donationsFilters, year: parseInt(e.target.value) })}
              >
                {getYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Donations</h3>
                  <p className="text-3xl font-bold text-green-600">Rs. {totalDonations.toLocaleString()}</p>
                </div>
                <div className="text-4xl text-green-400">
                  <i className="fas fa-hand-holding-heart"></i>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Monthly Donations</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={donationsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Donations" stroke="#8884d8" name="Donations" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Donations by Purpose</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsData?.donations?.purposeReport?.map(item => ({
                        name: item.purpose,
                        value: item.totalAmount
                      })) || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {reportsData?.donations?.purposeReport?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'attendance':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <label className="font-semibold text-gray-700">Filter by Type:</label>
              <select
                className="p-2 border rounded-md"
                value={attendanceFilters.type}
                onChange={(e) => setAttendanceFilters({ ...attendanceFilters, type: e.target.value })}
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Monthly Attendance Summary</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#4CAF50" name="Present" />
                    <Bar dataKey="absent" fill="#F44336" name="Absent" />
                    <Bar dataKey="leave" fill="#FFC107" name="On Leave" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Daily Attendance Summary</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#4CAF50" name="Present" />
                    <Bar dataKey="absent" fill="#F44336" name="Absent" />
                    <Bar dataKey="leave" fill="#FFC107" name="On Leave" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl text-center sm:text-4xl font-bold text-green-800 mb-6">Financial & Performance Reports</h1>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'fees'
              ? 'border-b-4 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('fees')}
        >
          Fees
        </button>
        <button
          className={`py-2 px-4 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'salaries'
              ? 'border-b-4 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('salaries')}
        >
          Salaries
        </button>
        <button
          className={`py-2 px-4 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'billing'
              ? 'border-b-4 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button
          className={`py-2 px-4 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'donations'
              ? 'border-b-4 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('donations')}
        >
          Donations
        </button>
        <button
          className={`py-2 px-4 font-semibold text-lg transition-colors duration-200 ${
            activeTab === 'attendance'
              ? 'border-b-4 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>

      {/* Report Content based on active tab */}
      {renderContent()}
    </div>
  );
};

export default Reports;