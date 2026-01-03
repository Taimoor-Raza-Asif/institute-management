// src/pages/TeacherDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UserCircleIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const TeacherDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const [analytics, setAnalytics] = useState({
    salary: { month: '--', status: '--', amount: '--', expectedDate: '--' },
    myLeaves: { pending: 0, approved: 0, rejected: 0 },
    studentLeaves: { pending: 0, today: 0 },
    attendance: [
      { label: 'Present', percent: 0 },
      { label: 'Leave', percent: 0 },
      { label: 'Absent', percent: 0 }
    ],
    quick: { totalClasses: 0, totalStudents: 0, avgAttendance: 0, pendingReviews: 0 }
  });
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser || !currentUser.profileId) return;
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const formatMonthYear = (monthNumber, yearNumber) => {
        const d = new Date(yearNumber, (monthNumber || 1) - 1, 1);
        return d.toLocaleString('default', { month: 'long', year: 'numeric' });
      };

      const safeNumber = (value) => (typeof value === 'number' && !Number.isNaN(value) ? value : 0);

      try {
        const requests = [
          api.get('/salary/my-salaries'),
          api.get('/staff-leave'),
          api.get('/leave'),
          api.get(`/attendance/staff/${currentUser.profileId}?year=${currentYear}&month=${currentMonth}`),
          api.get(`/staff/${currentUser.profileId}`), // Fetch teacher's staff profile for assignClasses
          api.get('/attendance/students/assigned') // Fetch assigned students for teacher
        ];

        const [salaryRes, staffLeaveRes, studentLeaveRes, attendanceRes, staffProfileRes, assignedStudentsRes] = await Promise.allSettled(requests);

        const salaryData = salaryRes.status === 'fulfilled' ? salaryRes.value.data || [] : [];
        const salaryCurrent = salaryData.find((s) => s.month === currentMonth && s.year === currentYear) || salaryData[0];
        const salaryMonth = salaryCurrent ? formatMonthYear(salaryCurrent.month, salaryCurrent.year) : formatMonthYear(currentMonth, currentYear);
        const salaryAmount = salaryCurrent?.salaryPerMonth || salaryCurrent?.paidAmount || 0;
        const expectedDate = salaryCurrent?.paidAt
          ? new Date(salaryCurrent.paidAt).toLocaleDateString()
          : `${new Date(currentYear, currentMonth, 0).getDate()} ${today.toLocaleString('default', { month: 'short' })}`;

        const staffLeaves = staffLeaveRes.status === 'fulfilled' ? staffLeaveRes.value.data || [] : [];
        const myLeaves = {
          pending: staffLeaves.filter((l) => l.status === 'Pending').length,
          approved: staffLeaves.filter((l) => l.status === 'Approved').length,
          rejected: staffLeaves.filter((l) => l.status === 'Rejected').length
        };

        const studentLeaves = studentLeaveRes.status === 'fulfilled' ? studentLeaveRes.value.data || [] : [];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const studentLeaveCounts = {
          pending: studentLeaves.filter((l) => l.status === 'Pending').length,
          today: studentLeaves.filter((l) => {
            const start = l.startDate ? new Date(l.startDate) : null;
            const end = l.endDate ? new Date(l.endDate) : null;
            return start && end && start <= todayEnd && end >= todayStart;
          }).length
        };

        const attendanceSummary = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data?.summary || {} : {};
        const totalDays = safeNumber(attendanceSummary.totalDays) || 1;
        const presentDays = safeNumber(attendanceSummary.presentDays);
        const leaveDays = safeNumber(attendanceSummary.leaveDays);
        const absentDays = safeNumber(attendanceSummary.absentDays);
        const attendancePercents = [
          { label: 'Present', percent: Math.round((presentDays / (presentDays + leaveDays + absentDays)) * 100) || 0 },
          { label: 'Leave', percent: Math.round((leaveDays / (presentDays + leaveDays + absentDays)) * 100) || 0 },
          { label: 'Absent', percent: Math.round((absentDays / (presentDays + leaveDays + absentDays)) * 100) || 0 }
        ];

        // Get teacher's assigned classes from their staff profile
        const staffProfile = staffProfileRes.status === 'fulfilled' ? staffProfileRes.value.data : null;
        const assignClasses = staffProfile?.assignClasses || [];
        
        // Get assigned students count - filter out students with null name or _id
        const assignedStudents = assignedStudentsRes.status === 'fulfilled' 
          ? (assignedStudentsRes.value.data || []).filter(s => s && s._id && s.name)
          : [];

        setAnalytics({
          salary: {
            month: salaryMonth,
            status: salaryCurrent?.status || 'Pending',
            amount: salaryAmount ? `PKR ${salaryAmount.toLocaleString()}` : '--',
            expectedDate
          },
          myLeaves,
          studentLeaves: studentLeaveCounts,
          attendance: attendancePercents,
          quick: {
            totalClasses: assignClasses.length,
            totalStudents: assignedStudents.length,
            avgAttendance: attendancePercents.find((a) => a.label === 'Present')?.percent || 0,
            pendingReviews: studentLeaveCounts.pending
          }
        });
      } catch (error) {
        console.error('Failed to load analytics', error);
      }
    };

    fetchAnalytics();
  }, [currentUser]);

  const { currentTheme } = useTheme();
  if (!currentUser || currentUser.role !== 'teacher') {
    return (
      <div className={`text-center py-8 ${currentTheme?.mutedText || 'text-red-600'}`}>
        <h2 className={`text-2xl font-bold ${currentTheme?.title || 'text-gray-800'}`}>Access Denied</h2>
        <p className={`mt-2 ${currentTheme?.mutedText || 'text-gray-600'}`}>You do not have teacher privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className={`relative overflow-hidden rounded-3xl ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-2xl'} ${currentTheme?.title || 'text-white'} px-6 sm:px-10 py-10 mb-10`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`uppercase tracking-[0.2em] text-xs font-semibold mb-2 ${currentTheme?.heroSubtitle || 'text-emerald-100'}`}>Teacher Workspace</p>
              <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${currentTheme?.heroTitle || 'text-white'}`}>Welcome back, {currentUser.name || 'Teacher'}</h1>
              <p className={`mt-3 text-base sm:text-lg max-w-2xl ${currentTheme?.heroSubtitle || 'text-emerald-50/90'}`}>Stay on top of your profile, classes, students, and attendance with a clean, consistent control center.</p>
            </div>
            <div className={`flex items-center gap-3 backdrop-blur-md px-5 py-4 rounded-2xl border shadow-lg ${currentTheme?.cardBg || 'bg-white/10 border-white/20'}`}>
              <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${currentTheme?.panelBg || 'bg-white/20'} ${currentTheme?.title || 'text-white'}`}>
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wide ${currentTheme?.heroSubtitle || 'text-emerald-100'}`}>Role</p>
                <p className={`text-lg font-semibold ${currentTheme?.title || 'text-white'}`}>Teacher</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salary & Leave */}
          <div className="lg:col-span-1 space-y-4">
            <AnalyticsCard title="This Month Salary" subtitle={analytics.salary.month}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ${currentTheme?.badgeWarningBg || 'bg-amber-100 text-amber-700 ring-amber-200'}`}>
                    {analytics.salary.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>Amount</p>
                  <p className={`text-xl font-semibold ${currentTheme?.statCardValue || 'text-emerald-700'}`}>{analytics.salary.amount}</p>
                  <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'}`}>Expected by {analytics.salary.expectedDate}</p>
                </div>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="My Leave Requests" subtitle="Current month">
              <div className="flex items-center justify-between text-sm">
                <Metric label="Pending" value={analytics.myLeaves.pending} accentType="warning" />
                <Metric label="Approved" value={analytics.myLeaves.approved} accentType="success" />
                <Metric label="Rejected" value={analytics.myLeaves.rejected} accentType="danger" />
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Students' Leave Requests" subtitle="Assigned classes">
              <div className="flex items-center justify-between text-sm">
                <Metric label="Pending" value={analytics.studentLeaves.pending} accentType="warning" />
                <Metric label="Today" value={analytics.studentLeaves.today} accentType="success" />
              </div>
            </AnalyticsCard>
          </div>

          {/* Attendance */}
          <div className="lg:col-span-2">
            <AnalyticsCard title="Attendance Snapshot" subtitle="This month">
              <div className="space-y-4">
                {analytics.attendance.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className={`flex items-center justify-between text-sm ${currentTheme?.text || 'text-gray-700'}`}>
                      <span className={`font-medium ${currentTheme?.title || 'text-emerald-800'}`}>{item.label}</span>
                      <span className={`font-semibold ${currentTheme?.statCardValue || 'text-emerald-700'}`}>{item.percent}%</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ring-1 ${currentTheme?.pillBg || 'bg-emerald-50 ring-emerald-100'}`}>
                      <div className={`h-full ${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SmallStat label="Classes" value={analytics.quick.totalClasses} />
              <SmallStat label="Students" value={analytics.quick.totalStudents} />
              <SmallStat label="Avg Attendance" value={`${analytics.quick.avgAttendance}%`} />
              <SmallStat label="Pending Reviews" value={analytics.quick.pendingReviews} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardCard
            title="My Profile"
            description="Review and update your staff details."
            icon={<UserCircleIcon className={`h-9 w-9 ${currentTheme?.iconText || 'text-emerald-600'}`} />}
            link={`/profile/staff/${currentUser.profileId}`}
          />
          
          <DashboardCard
            title="My Students"
            description="See assigned students and manage their records."
            icon={<AcademicCapIcon className={`h-9 w-9 ${currentTheme?.iconText || 'text-emerald-600'}`} />}
            link="/teacher/my-students"
          />
          <DashboardCard
            title="My Attendance"
            description="Check your attendance history and status."
            icon={<CalendarDaysIcon className={`h-9 w-9 ${currentTheme?.iconText || 'text-emerald-600'}`} />}
            link={`/attendance/my/${currentUser.profileId}`}
          />
          <DashboardCard
            title="My Subjects"
            description="Track the subjects you teach and related info."
            icon={<BookOpenIcon className={`h-9 w-9 ${currentTheme?.iconText || 'text-emerald-600'}`} />}
            link="/teacher/my-subjects"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, icon, link }) => {
  const { currentTheme } = useTheme();
  return (
    <Link
      to={link}
      className={`group relative overflow-hidden rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-emerald-100'} px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${currentTheme?.panelBg || 'bg-gradient-to-br from-emerald-50 to-white'}`} />
      <div className="relative flex items-start gap-4 flex-1">
        <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${currentTheme?.panelBg || 'bg-emerald-50'} ${currentTheme?.iconText || 'text-emerald-700'} ${currentTheme?.border || 'ring-1 ring-emerald-100'} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-semibold ${currentTheme?.title || 'text-emerald-900'}`}>{title}</h3>
          <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-600'} mt-1 leading-relaxed`}>{description}</p>
        </div>
      </div>
      <div className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${currentTheme?.iconText || 'text-emerald-700'}`}>
        Open
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
};

const AnalyticsCard = ({ title, subtitle, children }) => {
  const { currentTheme } = useTheme();
  return (
    <div className={`relative overflow-hidden rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || 'shadow-sm'} px-5 py-4`}>
      <div className={`absolute inset-0 opacity-70 ${currentTheme?.panelBg ? 'via-transparent to-transparent' : 'bg-gradient-to-br from-emerald-50/60 via-white to-white'}`} />
      <div className="relative flex items-center justify-between mb-3">
        <div>
          <p className={`text-xs uppercase tracking-wide font-semibold ${currentTheme?.iconText || 'text-emerald-600'}`}>{title}</p>
          {subtitle && <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>{subtitle}</p>}
        </div>
        <span className={`h-2 w-2 rounded-full shadow-md ${currentTheme?.btnPrimaryBg || 'bg-emerald-500'}`} />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
};

const Metric = ({ label, value, accentType }) => {
  const { currentTheme } = useTheme();
  
  const accentMap = {
    warning: `${currentTheme?.badgeWarningBg || 'bg-amber-100 text-amber-700'} ring-1`,
    success: `${currentTheme?.badgeSuccessBg || 'bg-emerald-100 text-emerald-700'} ring-1`,
    danger: `${currentTheme?.badgeDangerBg || 'bg-rose-100 text-rose-700'} ring-1`,
  };
  
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${accentMap[accentType] || accentMap.warning}`}>{label}</span>
      <span className={`text-lg font-semibold ${currentTheme?.statCardValue || 'text-emerald-800'}`}>{value}</span>
    </div>
  );
};

const SmallStat = ({ label, value }) => {
  const { currentTheme } = useTheme();
  return (
    <div className={`rounded-xl ${currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.cardBg || 'bg-white'} px-4 py-3 ${currentTheme?.shadow || 'shadow-sm'}`}>
      <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'} mb-1`}>{label}</p>
      <p className={`text-lg font-bold ${currentTheme?.statCardValue || 'text-emerald-700'}`}>{value}</p>
    </div>
  );
};

export default TeacherDashboard;
