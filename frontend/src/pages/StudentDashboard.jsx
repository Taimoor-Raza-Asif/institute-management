// src/pages/StudentDashboard.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import api from '../api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';
import { BarChart3, CalendarCheck, Wallet, FileClock, GraduationCap, User, DollarSign, Calendar, FileText, TrendingUp, Award, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have student privileges to view this page.</p>
      </div>
    );
  }

  // --- Analytics state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [marksRes, feesRes, attRes, leavesRes] = await Promise.all([
          api.get(`/marks/student/${currentUser.profileId}`),
          api.get(`/fees/student/${currentUser.profileId}`),
          api.get(`/attendance/student/${currentUser.profileId}`),
          api.get('/leave')
        ]);
        setMarks(Array.isArray(marksRes.data) ? marksRes.data : []);
        setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
        setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      } catch (err) {
        setError('Failed to load analytics.');
        toast.error('Failed to load student analytics.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.profileId) fetchData();
  }, [currentUser]);

  const safeDiv = (a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isFinite(numA) || !Number.isFinite(numB) || numB === 0) return 0;
    return (numA / numB) * 100;
  };

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const analytics = useMemo(() => {
    const safeMarks = Array.isArray(marks) ? marks : [];
    const safeFees = Array.isArray(fees) ? fees : [];
    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const safeLeaves = Array.isArray(leaves) ? leaves : [];

    // Average marks percentage
    const marksPct = safeMarks.length
      ? Math.round(
          (safeMarks.reduce((sum, m) => sum + safeDiv(m.marksObtained, m.totalMarks), 0) / safeMarks.length)
        )
      : 0;

    // Fees due total
    const totalDue = safeFees.reduce((sum, f) => sum + (Number(f.dueAmount) || 0), 0);

    // Attendance rate for current month
    const attThisMonth = safeAttendance.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const presentCount = attThisMonth.filter(r => r.status === 'Present').length;
    const attRate = attThisMonth.length ? Math.round((presentCount / attThisMonth.length) * 100) : 0;

    // Pending leaves
    const pendingLeaves = safeLeaves.filter(l => l.status === 'Pending').length;

    // Subjects count from marks
    const subjects = new Set(safeMarks.map(m => m.subject)).size;

    // Total marks and total attendance
    const totalMarks = safeMarks.length;
    const totalAttendance = safeAttendance.length;

    return { marksPct, totalDue, attRate, pendingLeaves, subjects, totalMarks, totalAttendance };
  }, [marks, fees, attendance, leaves, month, year]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader /></div>;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-10 mb-8">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-8 w-8" />
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Student Dashboard</h1>
            </div>
            <p className="text-emerald-50/90 text-sm sm:text-base max-w-2xl mb-4">Welcome back! Here's your academic overview and quick actions.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                <Award className="h-3.5 w-3.5" />
                {analytics.totalMarks} Marks
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {analytics.totalAttendance} Days Tracked
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                <FileText className="h-3.5 w-3.5" />
                {analytics.subjects} Subjects
              </span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<BarChart3 className="h-5 w-5" />} title="Avg Marks" value={`${analytics.marksPct}%`} accent="bg-emerald-100 text-emerald-700" />
          <StatCard icon={<Wallet className="h-5 w-5" />} title="Fees Due" value={`Rs ${analytics.totalDue}`} accent="bg-rose-100 text-rose-700" />
          <StatCard icon={<CalendarCheck className="h-5 w-5" />} title="Attendance (MTD)" value={`${analytics.attRate}%`} accent="bg-teal-100 text-teal-700" />
          <StatCard icon={<FileClock className="h-5 w-5" />} title="Pending Leaves" value={analytics.pendingLeaves} accent="bg-amber-100 text-amber-700" />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <QuickActionCard
              title="My Profile"
              description="View and manage your personal information."
              icon={<User className="h-6 w-6" />}
              link="/students/my-data"
              accentColor="emerald"
            />
            <QuickActionCard
              title="My Fees"
              description="Payment history and current dues."
              icon={<DollarSign className="h-6 w-6" />}
              link="/fees"
              accentColor="purple"
            />
            <QuickActionCard
              title="My Attendance"
              description="Check your attendance records."
              icon={<Calendar className="h-6 w-6" />}
              link="/student/attendance"
              accentColor="teal"
            />
            <QuickActionCard
              title="My Leave Requests"
              description="Submit and track your leave requests."
              icon={<FileClock className="h-6 w-6" />}
              link="/leaves"
              accentColor="amber"
            />
            <QuickActionCard
              title="My Marks"
              description="View your marks and academic progress."
              icon={<Award className="h-6 w-6" />}
              link="/marks"
              accentColor="rose"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon, link, accentColor }) => {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  const accentClass = colorMap[accentColor] || colorMap.emerald;

  return (
    <Link
      to={link}
      className="group relative block bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition border border-emerald-100 hover:border-emerald-200 overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${accentClass} transition group-hover:scale-110`}>
          {icon}
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
};

const StatCard = ({ icon, title, value, accent }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm`}> 
    <div className="flex items-center gap-3">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${accent}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold text-gray-800">{value}</div>
      </div>
    </div>
    <GraduationCap className="h-5 w-5 text-emerald-600 opacity-0" />
  </div>
);

export default StudentDashboard;
