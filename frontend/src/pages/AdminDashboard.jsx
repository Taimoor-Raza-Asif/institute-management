// src/pages/AdminDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  BanknotesIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    pendingLeaves: 0,
    feesCollectedThisMonth: 0,
    feesDueThisMonth: 0,
    attendanceTodayRate: 0,
    monthlyFeesSeries: [],
    paymentMethodBreakdown: [],
    recentLeaves: [],
  });

  const year = new Date().getFullYear();
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');

        const [studentsRes, staffRes, feesReportRes, leavesRes, staffLeavesRes, attendanceRes] = await Promise.all([
          api.get('/students'),
          api.get('/staff'),
          api.get('/fees/reports', { params: { year } }),
          api.get('/leave', { params: { status: 'Pending' } }),
          api.get('/staff-leave', { params: { status: 'Pending' } }),
          api.get(`/attendance/${todayStr}`),
        ]);

        const students = studentsRes.data || [];
        const staff = staffRes.data || [];
        const feeReports = feesReportRes.data || {};
        const monthlyReport = feeReports.monthlyReport || [];
        const paymentMethodReport = feeReports.paymentMethodReport || [];
        const admissionFeeReport = feeReports.admissionFeeReport || [];
        const pendingLeaves = leavesRes.data || [];
        const pendingStaffLeaves = staffLeavesRes.data || [];
        const attendanceRecords = attendanceRes.data || [];

        // Prepare monthly fees series for chart (Jan-Dec)
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const normalizeMonth = (val) => {
          if (typeof val === 'number') return val;
          const idx = monthNames.findIndex((n) => n.toLowerCase() === String(val).toLowerCase());
          return idx >= 0 ? idx + 1 : null;
        };

        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const monthlyFeesSeries = months.map((m) => {
          const entry = monthlyReport.find((r) => normalizeMonth(r._id.month) === m && (!r._id.year || r._id.year === year));
          return {
            month: m,
            collected: entry ? entry.totalCollected : 0,
            due: entry ? entry.totalDue : 0,
          };
        });

        const currentMonth = new Date().getMonth() + 1;
        const currentEntry = monthlyFeesSeries.find((x) => x.month === currentMonth) || { collected: 0, due: 0 };

        // Attendance rate for students today
        const studentToday = attendanceRecords.filter((rec) => rec.onModel === 'Student');
        const presentCount = studentToday.filter((rec) => rec.status === 'Present').length;
        const totalMarked = studentToday.length;
        const attendanceTodayRate = totalMarked ? Math.round((presentCount / totalMarked) * 100) : 0;

        // Payment method breakdown (for horizontal bars)
        const paymentMethodBreakdown = paymentMethodReport.map((p) => ({
          method: p.paymentMethod || 'Unknown',
          amount: p.totalAmount || 0,
        }));

        // Recent 5 pending leaves
        // Combine student + staff pending leaves; show first 5
        const combinedPending = [...pendingLeaves, ...pendingStaffLeaves];
        const recentLeaves = combinedPending.slice(0, 5).map((l) => ({
          id: l._id,
          studentName: l.studentName || l.staffName || (l.student && l.student.name) || (l.staff && l.staff.name) || 'N/A',
          startDate: l.startDate,
          endDate: l.endDate,
          status: l.status,
        }));

        setStats({
          students: students.length,
          staff: staff.length,
          pendingLeaves: combinedPending.length,
          feesCollectedThisMonth: currentEntry.collected,
          feesDueThisMonth: currentEntry.due,
          attendanceTodayRate,
          monthlyFeesSeries,
          paymentMethodBreakdown,
          recentLeaves,
          admissionFeesSeries: admissionFeeReport,
        });
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'admin') fetchAll();
  }, [currentUser, year, todayStr]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  const currency = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n || 0);

  const kpis = [
    { title: 'Total Students', value: stats.students, icon: <AcademicCapIcon className="h-8 w-8 text-emerald-600" /> },
    { title: 'Total Staff', value: stats.staff, icon: <BriefcaseIcon className="h-8 w-8 text-emerald-600" /> },
    { title: 'Fees Collected (Month)', value: currency(stats.feesCollectedThisMonth), icon: <BanknotesIcon className="h-8 w-8 text-green-600" /> },
    { title: 'Outstanding Dues (Month)', value: currency(stats.feesDueThisMonth), icon: <WalletIconLite /> },
    { title: 'Attendance Today', value: `${stats.attendanceTodayRate}%`, icon: <ArrowTrendingUpIcon className="h-8 w-8 text-teal-600" /> },
    { title: 'Pending Leave Requests', value: stats.pendingLeaves, icon: <ClockIcon className="h-8 w-8 text-orange-500" /> },
  ];

  return (
    <div className="relative -m-6 sm:-m-8 p-6 sm:p-8 dash-shell min-h-screen overflow-hidden">
      <div className="dash-accent top-0 left-10" />
      <div className="dash-accent bottom-10 right-8" />
      <div className="absolute inset-0 dash-grid pointer-events-none" />

      <div className="relative z-10 space-y-8 ">
        {/* Header */}
        <div className="glass-card shine rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-emerald-100/50 shadow-xl animate-rise bg-gradient-to-br from-emerald-200 via-emerald-50 to-emerald-500">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping-slow" />
              Control Center · {year}
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${currentTheme.title || 'text-emerald-900'}`}>Admin Dashboard</h1>
            <p className={`${currentTheme.mutedText || 'text-emerald-700'} mt-2 text-base`}>Full control over the Student Management System with a refreshed, modern look.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-700">
              <Badge icon={<UsersIcon className="h-4 w-4" />} label={`${stats.students} students`} />
              <Badge icon={<BriefcaseIcon className="h-4 w-4" />} label={`${stats.staff} staff`} />
              <Badge icon={<Cog6ToothIcon className="h-4 w-4" />} label="Realtime sync" variant="neutral" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-emerald-300 via-emerald-200 to-green-200 opacity-80 animate-floaty" />
            <img src="/Jamia%20Logo.png" alt="Jamia logo" className="relative w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow" />
          </div>
        </div>

        {error && (
          <div className={`mb-2 px-4 py-3 rounded-lg ${currentTheme.errorBg || 'bg-red-100'} ${currentTheme.errorText || 'text-red-700'} ${currentTheme.errorBorder || 'border border-red-300'} animate-rise`}>{error}</div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {kpis.map((item, idx) => (
              <KpiCard key={item.title} {...item} theme={currentTheme} delay={idx * 90} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="col-span-2 glass-card rounded-2xl p-6 border border-white/60 shadow-xl animate-rise" style={{ animationDelay: '120ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${currentTheme.title || 'text-gray-900'}`}>Fees Trend ({year})</h3>
                  <span className={`${currentTheme.mutedText || 'text-gray-500'} text-sm flex items-center gap-2`}>
                    <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Collected</span>
                    <span className="inline-flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500" /> Due</span>
                  </span>
                </div>
                <Sparkline data={stats.monthlyFeesSeries} theme={currentTheme} />
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-xl animate-rise" style={{ animationDelay: '200ms' }}>
                <h3 className={`text-xl font-semibold mb-4 ${currentTheme.title || 'text-gray-900'}`}>Payment Methods</h3>
                <div className="space-y-4">
                  {stats.paymentMethodBreakdown.length === 0 ? (
                    <p className={`${currentTheme.mutedText || 'text-gray-500'}`}>No payment data</p>
                  ) : (
                    stats.paymentMethodBreakdown.map((pm) => (
                      <BarRow key={pm.method} label={pm.method} value={pm.amount} max={Math.max(...stats.paymentMethodBreakdown.map((x) => x.amount)) || 1} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent activity + Quick links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-xl animate-rise" style={{ animationDelay: '240ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${currentTheme.title || 'text-gray-900'}`}>Recent Pending Leaves</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Live feed</span>
                </div>
                <ul className="divide-y divide-gray-200/70">
                  {stats.recentLeaves.length === 0 ? (
                    <li className={`${currentTheme.mutedText || 'text-gray-500'}`}>No pending requests</li>
                  ) : (
                    stats.recentLeaves.map((l, i) => (
                      <li key={l.id} className="py-3 flex items-center justify-between animate-rise" style={{ animationDelay: `${80 * i}ms` }}>
                        <div>
                          <p className="font-semibold text-gray-900">{l.studentName}</p>
                          <p className={`${currentTheme.mutedText || 'text-gray-500'} text-sm`}>{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">{l.status}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/60 shadow-xl animate-rise" style={{ animationDelay: '280ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${currentTheme.title || 'text-gray-900'}`}>Quick Actions</h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Always at hand</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DashboardCard title="Students" description="Manage student records" icon={<AcademicCapIcon className="h-6 w-6 text-emerald-600" />} link="/students" />
                  <DashboardCard title="Staff" description="View and edit staff" icon={<BriefcaseIcon className="h-6 w-6 text-emerald-600" />} link="/staff" />
                  <DashboardCard title="Fees" description="Review payments" icon={<BanknotesIcon className="h-6 w-6 text-green-600" />} link="/fees" />
                  <DashboardCard title="Reports" description="Financial & attendance" icon={<ChartBarIcon className="h-6 w-6 text-teal-600" />} link="/reports" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, theme, delay = 0 }) => (
  <div
    className={`relative glass-card shine rounded-2xl p-5 flex items-center justify-between border border-white/60 shadow-xl hover:-translate-y-1 transition duration-500 hover:shadow-2xl animate-rise`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div>
      <p className={`${theme.mutedText || 'text-gray-600'} text-sm`}>{title}</p>
      <p className={`text-2xl font-bold ${theme.title || 'text-gray-900'}`}>{value}</p>
    </div>
    <div className="p-3 rounded-full bg-gradient-to-br from-emerald-50 to-white shadow-inner animate-floaty border border-emerald-50">
      {icon}
    </div>
    <div className="absolute -right-3 -top-3 w-16 h-16 bg-gradient-to-br from-emerald-200/30 to-white/10 rounded-full blur-2xl pointer-events-none" />
  </div>
);

const WalletIconLite = () => <svg className="h-8 w-8 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" d="M3 7a2 2 0 012-2h12a2 2 0 012 2v1H7a2 2 0 00-2 2v6H5a2 2 0 01-2-2V7z"/><rect x="7" y="8" width="14" height="9" rx="2" strokeWidth="1.5"/><circle cx="16" cy="12.5" r="1"/></svg>;

const Badge = ({ icon, label, variant = 'accent' }) => {
  const colors =
    variant === 'neutral'
      ? 'bg-gray-50 text-gray-600 border border-gray-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors}`}>
      {icon}
      {label}
    </span>
  );
};

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="h-28 rounded-2xl glass-card border border-white/60 shadow-xl overflow-hidden relative animate-pulse-soft"
        style={{ animationDelay: `${idx * 90}ms` }}
      >
        <div className="absolute inset-0 shimmer-mask" />
        <div className="p-5 space-y-3">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-300 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const DashboardCard = ({ title, description, icon, link }) => (
  <Link to={link} className="block p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition">
    <div className="flex items-center mb-2">
      {icon}
      <h4 className="text-lg font-semibold ml-2">{title}</h4>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);

// Minimal SVG sparkline for 12 months: collected vs due
const Sparkline = ({ data, theme }) => {
  const width = 720; // responsive container handles scale
  const height = 220;
  const padding = 24;
  const maxVal = Math.max(...data.map((d) => Math.max(d.collected, d.due)), 1);
  const xStep = (width - padding * 2) / Math.max(data.length - 1, 1);

  const toPoint = (i, v) => [padding + i * xStep, height - padding - (v / maxVal) * (height - padding * 2)];
  const linePath = (seriesKey) => {
    const pts = data.map((d, i) => toPoint(i, d[seriesKey]));
    return pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
        {/* Due line */}
        <path d={linePath('due')} fill="none" stroke="#f59e0b" strokeWidth="2" />
        {/* Collected line */}
        <path d={linePath('collected')} fill="none" stroke="#10b981" strokeWidth="2.5" />
        {/* Month dots */}
        {data.map((d, i) => {
          const [xC, yC] = toPoint(i, d.collected);
          return <circle key={`c-${i}`} cx={xC} cy={yC} r="3" fill="#10b981" />;
        })}
      </svg>
      <div className="flex justify-between text-xs mt-2 px-2">
        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
          <span key={m} className={`${theme.mutedText || 'text-gray-500'}`}>{m}</span>
        ))}
      </div>
    </div>
  );
};

// Horizontal bar row for payment methods
const BarRow = ({ label, value, max }) => {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="font-medium">{label}</span><span className="text-gray-600">{pct}%</span></div>
      <div className="h-3 rounded bg-gray-200">
        <div className="h-3 rounded bg-green-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default AdminDashboard;
