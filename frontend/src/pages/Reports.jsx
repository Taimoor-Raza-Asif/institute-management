// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import Loader from '../components/Loader';
import Message from '../components/Message';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { BanknotesIcon, ExclamationTriangleIcon, UserPlusIcon, WalletIcon, GiftIcon, ClockIcon, DocumentCurrencyDollarIcon, HeartIcon } from '@heroicons/react/24/outline';

// Note: PIE colors will be derived from theme inside the component so themes can override chart palettes

// Get current month and year for default filter values
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const monthOptions = [
  { value: 'all', label: 'All months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

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
  const { currentTheme } = useTheme();

  // Chart color palette - allow theme override
  const PIE_COLORS = currentTheme?.pieColors || ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FEE', '#FF6666'];
  const CHART_COLORS = {
    success: currentTheme?.chartSuccess || '#00C49F',
    warning: currentTheme?.chartWarning || '#FFBB28',
    primary: currentTheme?.chartPrimary || '#8884d8',
    secondary: currentTheme?.chartSecondary || '#82ca9d',
    accent: currentTheme?.chartAccent || '#ffc658',
    danger: currentTheme?.chartDanger || '#F44336'
  };

  // Filter states
  const [feesFilters, setFeesFilters] = useState({ year: currentYear, month: 'all' });
  const [salariesFilters, setSalariesFilters] = useState({ year: currentYear, month: 'all' });
  const [billingFilters, setBillingFilters] = useState({ year: currentYear, month: 'all' });
  const [donationsFilters, setDonationsFilters] = useState({ year: currentYear, month: 'all' });
  const [attendanceFilters, setAttendanceFilters] = useState({ type: 'Student', year: currentYear, month: 'all' });

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
        const feesParams = { ...feesFilters };
        if (feesParams.month === 'all') delete feesParams.month;

        const salaryParams = { ...salariesFilters };
        if (salaryParams.month === 'all') delete salaryParams.month;

        const billingParams = { ...billingFilters };
        if (billingParams.month === 'all') delete billingParams.month;

        const donationParams = { ...donationsFilters };
        if (donationParams.month === 'all') delete donationParams.month;

        const fees = await fetchData('/fees/reports', feesParams);
        const salaries = await fetchData('/salary/reports', salaryParams);
        const billing = await fetchData('/billing/reports', billingParams);
        const donations = await fetchData('/donations/reports', donationParams);

        const attendanceParams = {
          type: attendanceFilters.type,
          year: attendanceFilters.year,
          ...(attendanceFilters.month !== 'all' ? { month: attendanceFilters.month } : {})
        };
        const attendance = await fetchData('/attendance/reports', attendanceParams);
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
            <div className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} p-4 sm:p-5 mb-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Filter by Year</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ${currentTheme?.inputText || 'text-gray-800'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={feesFilters.year}
                    onChange={(e) => setFeesFilters({ ...feesFilters, year: parseInt(e.target.value) })}
                  >
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ${currentTheme?.inputText || 'text-gray-800'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={feesFilters.month}
                    onChange={(e) => setFeesFilters({ ...feesFilters, month: e.target.value })}
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Collected</h3>
                    <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-red-600'}`}>Rs. {totalCollected.toLocaleString()}</p>
                </div>
                <BanknotesIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`} />
              </div>
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Due</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-red-600'}`}>Rs. {totalDue.toLocaleString()}</p>
                </div>
                <ExclamationTriangleIcon className={`${currentTheme?.iconText || 'text-red-600'} h-10 w-10`} />
              </div>
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Admission Fees</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-red-600'}`}>Rs. {totalAdmissionFees.toLocaleString()}</p>                </div>
                <UserPlusIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Fees Collected & Due</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={feesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Collected" stroke={CHART_COLORS.success} name="Collected" />
                    <Line type="monotone" dataKey="Total Due" stroke={CHART_COLORS.warning} name="Due" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Fees by Payment Method</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill={CHART_COLORS.primary}
                      label
                    >
                      {paymentMethodPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend formatter={(value, entry) => entry?.payload?.name || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} col-span-1 md:col-span-2`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Monthly Admission Fees</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={admissionFeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Admission Fee" stroke={CHART_COLORS.success} name="Admission Fees" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'salaries':
        return (
          <>
            <div className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} p-4 sm:p-5 mb-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Filter by Year</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ${currentTheme?.inputText || 'text-gray-800'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={salariesFilters.year}
                    onChange={(e) => setSalariesFilters({ ...salariesFilters, year: parseInt(e.target.value) })}
                  >
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ${currentTheme?.inputText || 'text-gray-800'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={salariesFilters.month}
                    onChange={(e) => setSalariesFilters({ ...salariesFilters, month: e.target.value })}
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Salary Paid</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-red-600'}`}>Rs. {totalSalaryPaid.toLocaleString()}</p>
                </div>
                <WalletIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`} />
              </div>
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Bonus</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-red-600'}`}>Rs. {totalBonusPaid.toLocaleString()}</p>
                </div>
                <GiftIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`} />
              </div>
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Overtime</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-purple-600'}`}>Rs. {totalOvertimePaid.toLocaleString()}</p>
                </div>
                <ClockIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`}/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Salaries, Bonus & Overtime Paid</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salariesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Paid" fill={CHART_COLORS.primary} />
                    <Bar dataKey="Bonus" fill={CHART_COLORS.secondary} />
                    <Bar dataKey="Overtime" fill={CHART_COLORS.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Salaries by Staff Role</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salaryRolePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill={CHART_COLORS.primary}
                      label
                    >
                      {salaryRolePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend formatter={(value, entry) => entry?.payload?.name || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'billing':
        return (
          <>
            <div className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} p-4 sm:p-5 mb-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Filter by Year</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={billingFilters.year}
                    onChange={(e) => setBillingFilters({ ...billingFilters, year: parseInt(e.target.value) })}
                  >
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={billingFilters.month}
                    onChange={(e) => setBillingFilters({ ...billingFilters, month: e.target.value })}
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
                  <p className="text-3xl font-bold text-red-600">Rs. {totalExpenses.toLocaleString()}</p>
                </div>
                <DocumentCurrencyDollarIcon className="text-red-600 h-10 w-10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Monthly Bills & Expenses</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={billingChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Expenses" stroke={CHART_COLORS.danger} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Expenses by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill={CHART_COLORS.primary}
                      label
                    >
                      {expenseCategoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend formatter={(value, entry) => entry?.payload?.name || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'donations':
        return (
          <>
            <div className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} p-4 sm:p-5 mb-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Filter by Year</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputBorder || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-sm`}
                    value={donationsFilters.year}
                    onChange={(e) => setDonationsFilters({ ...donationsFilters, year: parseInt(e.target.value) })}
                  >
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputRing || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-300'} focus:border-emerald-300 text-sm`}
                    value={donationsFilters.month}
                    onChange={(e) => setDonationsFilters({ ...donationsFilters, month: e.target.value })}
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className={`${currentTheme?.cardBg || currentTheme?.statCard || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'} flex justify-between items-center`}>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme?.mutedText || 'text-gray-600'}`}>Total Donations</h3>
                  <p className={`text-3xl font-bold ${currentTheme?.mutedText || 'text-purple-600'}`}>Rs. {totalDonations.toLocaleString()}</p>
                </div>
                <HeartIcon className={`${currentTheme?.iconText || 'text-emerald-600'} h-10 w-10`} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Monthly Donations</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={donationsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Total Donations" stroke={CHART_COLORS.primary} name="Donations" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Donations by Purpose</h2>
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
                      fill={CHART_COLORS.primary}
                      label
                    >
                      {reportsData?.donations?.purposeReport?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend formatter={(value, entry) => entry?.payload?.name || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'attendance':
        return (
          <>
            <div className={`rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} p-4 sm:p-5 mb-6`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Filter by Type</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputRing || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-300'} focus:border-emerald-300 text-sm`}
                    value={attendanceFilters.type}
                    onChange={(e) => setAttendanceFilters({ ...attendanceFilters, type: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Year</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputRing || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-300'} focus:border-emerald-300 text-sm`}
                    value={attendanceFilters.year}
                    onChange={(e) => setAttendanceFilters({ ...attendanceFilters, year: parseInt(e.target.value) })}
                  >
                    {getYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                  <select
                    className={`w-full px-3 py-2.5 rounded-xl ${currentTheme?.inputBg || 'bg-white/80'} ${currentTheme?.inputText || 'text-gray-800'} backdrop-blur-sm ${currentTheme?.inputBorder || 'border border-emerald-200'} ring-1 ${currentTheme?.inputRing || 'ring-emerald-100'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-300'} focus:border-emerald-300 text-sm`}
                    value={attendanceFilters.month}
                    onChange={(e) => setAttendanceFilters({ ...attendanceFilters, month: e.target.value })}
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Monthly Attendance Summary</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill={CHART_COLORS.success} name="Present" />
                    <Bar dataKey="absent" fill={CHART_COLORS.danger} name="Absent" />
                    <Bar dataKey="leave" fill={CHART_COLORS.warning} name="On Leave" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={`${currentTheme?.cardBg || 'bg-white'} p-4 sm:p-6 rounded-lg ${currentTheme?.shadow || 'shadow-md'}`}>
                <h2 className={`text-xl sm:text-2xl font-semibold ${currentTheme?.title || 'text-gray-700'} mb-4`}>Daily Attendance Summary</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <YAxis stroke={currentTheme?.chartAxis || '#94a3b8'} tick={{ fill: currentTheme?.mutedText || '#94a3b8' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill={CHART_COLORS.success} name="Present" />
                    <Bar dataKey="absent" fill={CHART_COLORS.danger} name="Absent" />
                    <Bar dataKey="leave" fill={CHART_COLORS.warning} name="On Leave" />
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
    <div className="container mx-auto p-4 sm:p-6 md:p-8 ">
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 text-left ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Financial & Performance Reports</h1>
          <p className={`text-left ${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm sm:text-base`}>Overview of institute finances and attendance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`h-12 px-5 rounded-lg font-semibold text-sm sm:text-base transition-all ${activeTab === 'fees' ? `${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
          onClick={() => setActiveTab('fees')}
        >
          Fees
        </button>
        <button
          className={`h-12 px-5 rounded-lg font-semibold text-sm sm:text-base transition-all ${activeTab === 'salaries' ? `${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
          onClick={() => setActiveTab('salaries')}
        >
          Salaries
        </button>
        <button
          className={`h-12 px-5 rounded-lg font-semibold text-sm sm:text-base transition-all ${activeTab === 'billing' ? `${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button
          className={`h-12 px-5 rounded-lg font-semibold text-sm sm:text-base transition-all ${activeTab === 'donations' ? `${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
          onClick={() => setActiveTab('donations')}
        >
          Donations
        </button>
        <button
          className={`h-12 px-5 rounded-lg font-semibold text-sm sm:text-base transition-all ${activeTab === 'attendance' ? `${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
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