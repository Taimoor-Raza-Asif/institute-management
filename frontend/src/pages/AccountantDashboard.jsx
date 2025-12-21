// src/pages/AccountantDashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  UserCircleIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ChartPieIcon,
  ReceiptPercentIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

const AccountantDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    pendingFees: 0,
    totalDonations: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    revenueTrend: '0%',
    expensesTrend: '0%',
    donationsTrend: '0%',
    recentTransactions: [],
    chartData: {
      monthlyData: [],
      expenseCategories: [],
      feeStatus: []
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch multiple endpoints in parallel
      const [feesRes, billingRes, donationsRes] = await Promise.all([
        api.get('/fees').catch(() => ({ data: [] })),
        api.get('/billing').catch(() => ({ data: [] })),
        api.get('/donations').catch(() => ({ data: [] }))
      ]);

      // Extract data from responses
      const feesData = Array.isArray(feesRes.data) ? feesRes.data : [];
      const billingData = Array.isArray(billingRes.data) ? billingRes.data : [];
      const donationsData = Array.isArray(donationsRes.data) ? donationsRes.data : [];

      console.log('Fees Data:', feesData);
      console.log('Billing Data:', billingData);
      console.log('Donations Data:', donationsData);

      // Calculate statistics using correct field names
      const totalRevenue = feesData.reduce((sum, fee) => {
        return sum + (fee.receivedAmount || 0);
      }, 0);
      
      const pendingFees = feesData.reduce((sum, fee) => {
        return sum + (fee.dueAmount || 0);
      }, 0);
      
      const totalExpenses = billingData
        .filter(bill => bill.status === 'Paid')
        .reduce((sum, bill) => sum + (bill.amount || 0), 0);
      
      const totalDonations = donationsData.reduce((sum, donation) => {
        return sum + (donation.donationAmount || 0);
      }, 0);

      // Calculate monthly data (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = feesData
        .filter(fee => {
          const feeDate = new Date(fee.receivedDate || 0);
          return feeDate.getMonth() === currentMonth && feeDate.getFullYear() === currentYear;
        })
        .reduce((sum, fee) => sum + (fee.receivedAmount || 0), 0);

      // Calculate previous month revenue for trend
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const previousMonthRevenue = feesData
        .filter(fee => {
          const feeDate = new Date(fee.receivedDate || 0);
          return feeDate.getMonth() === previousMonth && feeDate.getFullYear() === previousYear;
        })
        .reduce((sum, fee) => sum + (fee.receivedAmount || 0), 0);

      const monthlyExpenses = billingData
        .filter(bill => {
          const billDate = new Date(bill.billDate || 0);
          return bill.status === 'Paid' && billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        })
        .reduce((sum, bill) => sum + (bill.amount || 0), 0);

      // Calculate previous month expenses for trend
      const previousMonthExpenses = billingData
        .filter(bill => {
          const billDate = new Date(bill.billDate || 0);
          return bill.status === 'Paid' && billDate.getMonth() === previousMonth && billDate.getFullYear() === previousYear;
        })
        .reduce((sum, bill) => sum + (bill.amount || 0), 0);

      // Calculate trends
      const revenueTrend = previousMonthRevenue > 0 
        ? (((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
        : monthlyRevenue > 0 ? 100 : 0;

      const expensesTrend = previousMonthExpenses > 0 
        ? (((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100).toFixed(1)
        : monthlyExpenses > 0 ? 100 : 0;

      const totalIncome = totalRevenue + totalDonations;
      const donationsTrend = totalIncome > 0 
        ? ((totalDonations / totalIncome) * 100).toFixed(1)
        : 0;

      // Prepare chart data
      // 1. Monthly revenue vs expenses data
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const monthNum = date.getMonth();
        const yearNum = date.getFullYear();

        const monthRev = feesData
          .filter(f => new Date(f.receivedDate).getMonth() === monthNum && new Date(f.receivedDate).getFullYear() === yearNum)
          .reduce((sum, f) => sum + (f.receivedAmount || 0), 0);

        const monthExp = billingData
          .filter(b => b.status === 'Paid' && new Date(b.billDate).getMonth() === monthNum && new Date(b.billDate).getFullYear() === yearNum)
          .reduce((sum, b) => sum + (b.amount || 0), 0);

        monthlyData.push({ month, revenue: monthRev, expenses: monthExp });
      }

      // 2. Expense categories breakdown
      const categoryMap = {};
      billingData
        .filter(b => b.status === 'Paid')
        .forEach(bill => {
          const cat = bill.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + (bill.amount || 0);
        });

      const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
      const expenseCategories = Object.entries(categoryMap).map(([name, value], idx) => ({
        name,
        value,
        color: COLORS[idx % COLORS.length]
      }));

      // 3. Fee collection status
      const collectedFees = feesData.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
      const pendingFeeAmount = feesData.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

      const feeStatus = [
        { name: 'Collected', value: collectedFees, color: '#10b981' },
        { name: 'Pending', value: pendingFeeAmount, color: '#fca5a5' }
      ];

      setStats({
        totalRevenue,
        totalExpenses,
        pendingFees,
        totalDonations,
        monthlyRevenue,
        monthlyExpenses,
        revenueTrend: `${revenueTrend > 0 ? '+' : ''}${revenueTrend}%`,
        expensesTrend: `${expensesTrend > 0 ? '+' : ''}${expensesTrend}%`,
        donationsTrend: `${donationsTrend}%`,
        recentTransactions: [...feesData.slice(0, 3), ...billingData.slice(0, 2)],
        chartData: {
          monthlyData,
          expenseCategories,
          feeStatus
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalRevenue: 0,
        totalExpenses: 0,
        pendingFees: 0,
        totalDonations: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        revenueTrend: '0%',
        expensesTrend: '0%',
        donationsTrend: '0%',
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'accountant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center py-12 px-8 bg-white rounded-2xl shadow-2xl border border-red-200">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg">You do not have accountant privileges to view this page.</p>
        </div>
      </div>
    );
  }

  const netIncome = stats.totalRevenue + stats.totalDonations - stats.totalExpenses;
  const monthlyNet = stats.monthlyRevenue - stats.monthlyExpenses;
  const totalIncome = stats.totalRevenue + stats.totalDonations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg">
                <ChartPieIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                  Accountant Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all financial aspects of the institution.
                </p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Fee Revenue"
                value={`Rs ${stats.totalRevenue.toLocaleString()}`}
                icon={<ArrowTrendingUpIcon className="h-8 w-8" />}
                bgGradient="from-green-400 to-green-600"
                trend={stats.revenueTrend}
                trendUp={parseFloat(stats.revenueTrend) >= 0}
              />
              <StatCard
                title="Total Expenses"
                value={`Rs ${stats.totalExpenses.toLocaleString()}`}
                icon={<ArrowTrendingDownIcon className="h-8 w-8" />}
                bgGradient="from-red-400 to-red-600"
                trend={stats.expensesTrend}
                trendUp={parseFloat(stats.expensesTrend) <= 0}
              />
              <StatCard
                title="Pending Fees"
                value={`Rs ${stats.pendingFees.toLocaleString()}`}
                icon={<ReceiptPercentIcon className="h-8 w-8" />}
                bgGradient="from-yellow-400 to-yellow-600"
                trend={stats.donationsTrend}
                trendUp={parseFloat(stats.donationsTrend) <= 50}
              />
              <StatCard
                title="Total Donations"
                value={`Rs ${stats.totalDonations.toLocaleString()}`}
                icon={<GiftIcon className="h-8 w-8" />}
                bgGradient="from-blue-400 to-blue-600"
                trend={stats.donationsTrend}
                trendUp={true}
              />
            </div>

            {/* Net Income & Monthly Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Net Income</h3>
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-4">
                  <div className={`text-5xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rs {netIncome.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Total Revenue: Rs {totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Net Income: Rs {netIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Expenses: Rs {stats.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min((netIncome / (stats.totalRevenue + stats.totalDonations)) * 100, 100)}%` }}
                      ></div>
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.totalExpenses / (stats.totalRevenue + stats.totalDonations)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">This Month</h3>
                  <CalendarDaysIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-800">Rs {stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <ArrowTrendingUpIcon className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <div>
                      <p className="text-sm text-red-700 font-medium">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-800">Rs {stats.monthlyExpenses.toLocaleString()}</p>
                    </div>
                    <ArrowTrendingDownIcon className="h-10 w-10 text-red-500" />
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${monthlyNet >= 0 ? 'bg-blue-50 border-blue-300' : 'bg-orange-50 border-orange-300'}`}>
                    <p className={`text-sm font-medium ${monthlyNet >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net This Month</p>
                    <p className={`text-3xl font-bold ${monthlyNet >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                      Rs {monthlyNet.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <ChartBarIcon className="h-7 w-7 mr-3 text-purple-600" />
                Analytics & Reports
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Revenue vs Expenses Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.chartData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Expense Categories Pie Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.chartData.expenseCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: Rs ${value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.chartData.expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fee Collection Status */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Fee Collection Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.chartData.feeStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#8884d8" name="Amount">
                      {stats.chartData.feeStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BriefcaseIcon className="h-7 w-7 mr-3 text-green-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  title="Fee Management"
                  description="View, add, edit, and delete fee records."
                  icon={<BanknotesIcon className="h-10 w-10" />}
                  link="/fees"
                  gradient="from-green-500 to-green-700"
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
                <ActionCard
                  title="My Profile"
                  description="View and update your personal staff information."
                  icon={<UserCircleIcon className="h-10 w-10" />}
                  link="/staff/my-data"
                  gradient="from-green-500 to-green-700"
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
                <ActionCard
                  title="Bill Management"
                  description="Handle utility bills and other expenses."
                  icon={<DocumentTextIcon className="h-10 w-10" />}
                  link="/bills"
                  gradient="from-red-500 to-red-700"
                  iconBg="bg-red-100"
                  iconColor="text-red-600"
                />
                <ActionCard
                  title="Donation Management"
                  description="Track and manage donations received."
                  icon={<GiftIcon className="h-10 w-10" />}
                  link="/donations"
                  gradient="from-yellow-500 to-yellow-700"
                  iconBg="bg-yellow-100"
                  iconColor="text-yellow-600"
                />
                <ActionCard
                  title="Financial Reports"
                  description="Generate financial summaries and reports."
                  icon={<ChartBarIcon className="h-10 w-10" />}
                  link="/financial-reports"
                  gradient="from-teal-500 to-teal-700"
                  iconBg="bg-teal-100"
                  iconColor="text-teal-600"
                />
                <ActionCard
                  title="My Attendance"
                  description="View your attendance records and history."
                  icon={<CalendarDaysIcon className="h-10 w-10" />}
                  link={`/my-attendance/${currentUser?.profileId}`}
                  gradient="from-green-500 to-green-700"
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgGradient, trend, trendUp }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-gradient-to-br ${bgGradient} rounded-xl shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      {trend && (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ActionCard = ({ title, description, icon, link, gradient, iconBg, iconColor }) => (
  <Link 
    to={link} 
    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-2"
  >
    <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
    <div className="p-6">
      <div className={`inline-flex p-4 ${iconBg} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </Link>
);

export default AccountantDashboard;
