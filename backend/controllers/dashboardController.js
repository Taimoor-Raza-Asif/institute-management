// backend/controllers/dashboardController.js
import asyncHandler from 'express-async-handler';
import FeeRecord from '../models/FeeRecord.js';
import Bill from '../models/Bill.js';
import Salary from '../models/Salary.js';
import Donation from '../models/Donation.js';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// Helper: start/end of today (PKT = UTC+5)
const todayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
};

// Helper: start/end of current month
const monthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc  Get daily summary data for Admin Dashboard
// @route GET /api/dashboard/daily-summary
// @access Private/Admin
export const getDailySummary = asyncHandler(async (req, res) => {
  const { start: todayStart, end: todayEnd } = todayRange();
  const { start: monthStart, end: monthEnd } = monthRange();

  const [
    feesToday,
    billsToday,
    salariesThisMonth,
    donationsToday,
    todayAttendance,
    totalStudents,
    recentFees,
    recentBills,
    recentSalaries,
    recentDonations,
  ] = await Promise.all([
    // Fees collected today
    FeeRecord.find({ receivedDate: { $gte: todayStart, $lte: todayEnd } })
      .populate('studentId', 'name'),

    // Bills paid today
    Bill.find({ paymentDate: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['Paid', 'Partial'] } }),

    // Salaries paid this month
    Salary.find({ paymentDate: { $gte: monthStart, $lte: monthEnd }, status: 'Paid' }),

    // Donations received today
    Donation.find({ donationDate: { $gte: todayStart, $lte: todayEnd } }),

    // Attendance today (students only)
    Attendance.find({ date: { $gte: todayStart, $lte: todayEnd }, onModel: 'Student' }),

    // Total students count
    Student.countDocuments(),

    // Last 5 fee records (for activity feed)
    FeeRecord.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'name'),

    // Last 5 bills (for activity feed)
    Bill.find().sort({ createdAt: -1 }).limit(5),

    // Last 5 salaries (for activity feed)
    Salary.find().sort({ createdAt: -1 }).limit(5),

    // Last 5 donations (for activity feed)
    Donation.find().sort({ createdAt: -1 }).limit(5),
  ]);

  // ── Aggregate ─────────────────────────────────────────────
  const feesTodayAmount = feesToday.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
  const billsTodayAmount = billsToday.reduce((sum, b) => sum + (b.amount || 0), 0);
  const salariesMonthAmount = salariesThisMonth.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const donationsTodayAmount = donationsToday.reduce((sum, d) => sum + (d.donationAmount || 0), 0);

  const studentsPresent = todayAttendance.filter(a => a.status === 'Present').length;
  const studentsMarked  = todayAttendance.length;

  // ── Recent Activity Feed (combine & sort latest 5) ────────
  const activities = [
    ...recentFees.map(f => ({
      type: 'fee',
      label: `Fee received — ${f.studentId?.name || 'Student'}`,
      subLabel: `${f.month} ${f.year}`,
      amount: f.receivedAmount,
      time: f.createdAt,
      positive: true,
    })),
    ...recentBills.map(b => ({
      type: 'bill',
      label: `Bill paid — ${b.title}`,
      subLabel: b.category || '',
      amount: b.amount,
      time: b.createdAt,
      positive: false,
    })),
    ...recentSalaries.map(s => ({
      type: 'salary',
      label: `Salary — ${s.staffName || 'Staff member'}`,
      subLabel: s.month && s.year ? `Month ${s.month} / ${s.year}` : '',
      amount: s.paidAmount || 0,
      time: s.createdAt,
      positive: false,
    })),
    ...recentDonations.map(d => ({
      type: 'donation',
      label: `Donation — ${d.donorName || 'Anonymous'}`,
      subLabel: d.donationPurpose || '',
      amount: d.donationAmount,
      time: d.createdAt,
      positive: true,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8);

  res.json({
    today: {
      date: todayStart,
      fees: { count: feesToday.length, amount: feesTodayAmount },
      bills: { count: billsToday.length, amount: billsTodayAmount },
      donations: { count: donationsToday.length, amount: donationsTodayAmount },
      attendance: { present: studentsPresent, marked: studentsMarked, total: totalStudents },
    },
    thisMonth: {
      salaries: { count: salariesThisMonth.length, amount: salariesMonthAmount },
    },
    recentActivity: activities,
  });
});
