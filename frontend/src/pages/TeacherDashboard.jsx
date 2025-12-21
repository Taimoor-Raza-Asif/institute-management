// src/pages/TeacherDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UserCircleIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import api from '../api';

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
          api.get(`/attendance/staff/${currentUser.profileId}?year=${currentYear}&month=${currentMonth}`)
        ];

        const [salaryRes, staffLeaveRes, studentLeaveRes, attendanceRes] = await Promise.allSettled(requests);

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
          { label: 'Present', percent: Math.round((presentDays / totalDays) * 100) },
          { label: 'Leave', percent: Math.round((leaveDays / totalDays) * 100) },
          { label: 'Absent', percent: Math.round((absentDays / totalDays) * 100) }
        ];

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
            totalClasses: Array.isArray(currentUser.assignClasses) ? currentUser.assignClasses.length : 0,
            totalStudents: studentLeaves.length > 0
              ? new Set(studentLeaves.map((l) => (typeof l.student === 'object' ? l.student?._id : l.student))).size
              : 0,
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

  if (!currentUser || currentUser.role !== 'teacher') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have teacher privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-10 mb-10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="uppercase tracking-[0.2em] text-emerald-100 text-xs font-semibold mb-2">Teacher Workspace</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welcome back, {currentUser.name || 'Teacher'}</h1>
              <p className="text-emerald-50/90 mt-3 text-base sm:text-lg max-w-2xl">Stay on top of your profile, classes, students, and attendance with a clean, consistent control center.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 shadow-lg">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/20 text-white">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-100">Role</p>
                <p className="text-lg font-semibold">Teacher</p>
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
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                    {analytics.salary.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-semibold text-emerald-700">{analytics.salary.amount}</p>
                  <p className="text-xs text-gray-500">Expected by {analytics.salary.expectedDate}</p>
                </div>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="My Leave Requests" subtitle="Current month">
              <div className="flex items-center justify-between text-sm">
                <Metric label="Pending" value={analytics.myLeaves.pending} accent="bg-amber-100 text-amber-700" />
                <Metric label="Approved" value={analytics.myLeaves.approved} accent="bg-emerald-100 text-emerald-700" />
                <Metric label="Rejected" value={analytics.myLeaves.rejected} accent="bg-rose-100 text-rose-700" />
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Students' Leave Requests" subtitle="Assigned classes">
              <div className="flex items-center justify-between text-sm">
                <Metric label="Pending" value={analytics.studentLeaves.pending} accent="bg-amber-100 text-amber-700" />
                <Metric label="Today" value={analytics.studentLeaves.today} accent="bg-emerald-100 text-emerald-700" />
              </div>
            </AnalyticsCard>
          </div>

          {/* Attendance */}
          <div className="lg:col-span-2">
            <AnalyticsCard title="Attendance Snapshot" subtitle="This month">
              <div className="space-y-4">
                {analytics.attendance.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium text-emerald-800">{item.label}</span>
                      <span className="text-emerald-700 font-semibold">{item.percent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-emerald-50 overflow-hidden ring-1 ring-emerald-100">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${item.percent}%` }} />
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
            icon={<UserCircleIcon className="h-9 w-9 text-emerald-600" />}
            link={`/profile/staff/${currentUser.profileId}`}
          />
          
          <DashboardCard
            title="My Students"
            description="See assigned students and manage their records."
            icon={<AcademicCapIcon className="h-9 w-9 text-emerald-600" />}
            link="/students"
          />
          <DashboardCard
            title="My Attendance"
            description="Check your attendance history and status."
            icon={<CalendarDaysIcon className="h-9 w-9 text-emerald-600" />}
            link="/staff/my-data"
          />
          <DashboardCard
            title="My Subjects"
            description="Track the subjects you teach and related info."
            icon={<BookOpenIcon className="h-9 w-9 text-emerald-600" />}
            link="/teacher/subjects"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, icon, link }) => (
  <Link
    to={link}
    className="group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-emerald-100 px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative flex items-start gap-4 flex-1">
      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-emerald-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
      Open
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </div>
  </Link>
);

const AnalyticsCard = ({ title, subtitle, children }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 shadow-sm px-5 py-4">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-white opacity-70" />
    <div className="relative flex items-center justify-between mb-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">{title}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

const Metric = ({ label, value, accent }) => (
  <div className="flex flex-col items-start gap-0.5">
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${accent}`}>{label}</span>
    <span className="text-lg font-semibold text-emerald-800">{value}</span>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-lg font-bold text-emerald-700">{value}</p>
  </div>
);

export default TeacherDashboard;
