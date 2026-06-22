import React, { useState, useEffect, useContext, useMemo } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const DiscountedStudents = () => {
  const { currentTheme } = useTheme();
  const { currentUser } = useContext(UserContext);
  const [students, setStudents] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassType, setFilterClassType] = useState('');
  const [filterDiscountMin, setFilterDiscountMin] = useState('');
  const [filterDiscountMax, setFilterDiscountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/fees/discounted-students');
      setStudents(data.students || []);
      setServerStats(data.stats || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching discounted students:', err);
      setError('Failed to load student data.');
      toast.error('Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth  = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const headerHeight = 44;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
    const isFiltered = searchTerm || filterClassType || filterDiscountMin || filterDiscountMax;
    const reportBadgeLabel = isFiltered ? 'DISCOUNTED FEES — FILTERED' : 'DISCOUNTED FEES REPORT';

    // ── Premium Header ─────────────────────────────────────────────────────
    // Primary dark-teal background
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Lighter teal diagonal right panel
    doc.setFillColor(20, 184, 166);
    doc.triangle(pageWidth * 0.52, 0, pageWidth, 0, pageWidth, headerHeight, 'F');

    // Subtle geometric circles
    doc.setFillColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.06 }));
    doc.circle(pageWidth * 0.72, -6, 40, 'F');
    doc.circle(pageWidth * 0.92, headerHeight + 4, 28, 'F');
    doc.circle(margin + 4, headerHeight + 2, 26, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Cyan accent stripe at bottom of header
    doc.setFillColor(8, 145, 178);
    doc.rect(0, headerHeight - 3, pageWidth, 3, 'F');

    // White circle with cyan ring for logo
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 12, headerHeight / 2, 13, 'F');
    doc.setDrawColor(8, 145, 178);
    doc.setLineWidth(1.2);
    doc.circle(margin + 12, headerHeight / 2, 13.7, 'S');

    // Logo
    const logo = new Image();
    logo.src = '/Jamia Logo.png';
    await new Promise((resolve) => {
      logo.onload = () => { doc.addImage(logo, 'JPEG', margin + 3, (headerHeight / 2) - 10, 18, 18); resolve(); };
      logo.onerror = () => resolve();
    });

    // Institute name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.setFont(undefined, 'bold');
    doc.text('Jamia Tul Mastwaar', margin + 30, 15);

    // Address & contact
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(204, 251, 241);
    doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 30, 22);
    doc.text('(0334) 8724125  |  jamiatulmastwaar@gmail.com', margin + 30, 28);

    // Report badge (right side)
    const badgeW = 66;
    const badgeH = 11;
    const badgeX = pageWidth - margin - badgeW;
    const badgeY = headerHeight - badgeH - 8;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'F');
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.8);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'S');
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(reportBadgeLabel, badgeX + badgeW / 2, badgeY + 7.2, { align: 'center' });

    let currentY = headerHeight + 8;

    // ── Generated date + filter summary ──────────────────────────────────
    const filterParts = [];
    if (searchTerm) filterParts.push(`Search: "${searchTerm}"`);
    if (filterClassType) filterParts.push(`Class: ${classTypeLabel[filterClassType] || filterClassType}`);
    if (filterDiscountMin) filterParts.push(`Min: ${filterDiscountMin}%`);
    if (filterDiscountMax) filterParts.push(`Max: ${filterDiscountMax}%`);
    const filterLine = filterParts.length ? filterParts.join(' | ') : 'All Students';

    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 11, 1.5, 1.5, 'F');
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(4, 120, 87);
    doc.text(`Generated: ${dateStr}   |   Filters — ${filterLine}`, margin + 3, currentY + 7.5);
    doc.setTextColor(0, 0, 0);
    currentY += 16;

    // ── Table columns ──────────────────────────────────────────────────────
    const tableColumns = [
      { header: '#', dataKey: 'no' },
      { header: 'Student Name', dataKey: 'name' },
      { header: 'CNIC', dataKey: 'cnic' },
      { header: 'Class', dataKey: 'class' },
      { header: 'Discount %', dataKey: 'discount' },
      { header: 'Base Fee/Mo', dataKey: 'baseFee' },
      { header: 'Discount Amt', dataKey: 'discountAmt' },
      { header: 'Effective Fee', dataKey: 'effectiveFee' },
      { header: 'Fee Status', dataKey: 'status' },
    ];

    const makeRow = (student, idx) => {
      const base = student.feePerMonth || 0;
      const pct  = student.feeDiscount || 0;
      const discAmt     = base * (pct / 100);
      const effectiveFee = Math.max(0, base - discAmt);
      return {
        no: idx + 1,
        name: student.name || '-',
        cnic: student.cnic || '-',
        class: getStudentClassLabel(student),
        discount: `${pct}%`,
        baseFee: fmt(base),
        discountAmt: `- ${fmt(discAmt)}`,
        effectiveFee: pct === 100 ? 'FREE' : fmt(effectiveFee),
        status: student.feeStatus || 'Unpaid',
      };
    };

    // Section label helper
    const addSectionLabel = (title, color) => {
      doc.setFillColor(240, 248, 242);
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 7.5, 1, 1, 'F');
      doc.setFontSize(9.5);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, margin + 3, currentY + 5.2);
      doc.setTextColor(0, 0, 0);
      currentY += 10;
    };

    // ── Filtered (flat) or Grouped report ────────────────────────────────
    if (isFiltered) {
      const rows = filteredStudents.map((s, i) => makeRow(s, i));
      addSectionLabel('MATCHING RECORDS', [15, 118, 110]);
      autoTable(doc, {
        startY: currentY,
        head: [tableColumns.map(c => c.header)],
        body: rows.map(r => tableColumns.map(c => r[c.dataKey])),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [26, 188, 156], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        margin: { left: margin, right: margin },
      });
      currentY = doc.lastAutoTable.finalY + 5;

      // Total card
      const cardH = 18;
      if (currentY + cardH + 20 > pageHeight - 10) { doc.addPage(); currentY = margin; }
      doc.setFillColor(15, 118, 110);
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, cardH, 3, 3, 'F');
      doc.setFillColor(20, 184, 166);
      doc.setGState(new doc.GState({ opacity: 0.35 }));
      doc.roundedRect(margin + (pageWidth - 2 * margin) * 0.55, currentY, (pageWidth - 2 * margin) * 0.45, cardH, 3, 3, 'F');
      doc.setGState(new doc.GState({ opacity: 1 }));
      doc.setFontSize(7.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(204, 251, 241);
      doc.text('TOTAL STUDENTS', margin + 5, currentY + 6.5);
      doc.text('TOTAL MONTHLY DISCOUNT', margin + 70, currentY + 6.5);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(String(filteredStudents.length), margin + 5, currentY + 14);
      doc.text(fmt(filteredStats.totalDiscount), margin + 70, currentY + 14);
      currentY += cardH;

    } else {
      const discountRanges = [
        { label: 'Full Waiver (100%)',  min: 100, max: 100, color: [22, 163, 74],  headColor: [26, 188, 156] },
        { label: '81% – 99% Discount', min: 81,  max: 99,  color: [37, 99, 235],  headColor: [59, 130, 246] },
        { label: '60% – 80% Discount', min: 60,  max: 80,  color: [217, 119, 6],  headColor: [245, 158, 11] },
        { label: '1% – 59% Discount',  min: 1,   max: 59,  color: [220, 38, 38],  headColor: [239, 68, 68]  },
      ];
      let grandStudents = 0;
      let grandDiscount = 0;

      discountRanges.forEach((range) => {
        const group = students.filter(s => {
          const pct = s.feeDiscount || 0;
          return pct >= range.min && pct <= range.max;
        });
        if (group.length === 0) return;

        const rows = group.map((s, i) => makeRow(s, i));
        const groupDiscount = group.reduce((sum, s) =>
          sum + ((s.feePerMonth || 0) * ((s.feeDiscount || 0) / 100)), 0);
        grandStudents += group.length;
        grandDiscount += groupDiscount;

        if (currentY > pageHeight - 60) { doc.addPage(); currentY = margin + 2; }

        addSectionLabel(`${range.label}  (${group.length} student${group.length !== 1 ? 's' : ''})`, range.color);

        autoTable(doc, {
          startY: currentY,
          head: [tableColumns.map(c => c.header)],
          body: rows.map(r => tableColumns.map(c => r[c.dataKey])),
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: range.headColor, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: margin, right: margin },
          didDrawPage: () => {},
        });

        currentY = doc.lastAutoTable.finalY + 3;
        doc.setFontSize(7.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`  Group Subtotal: ${group.length} students  |  Monthly Discount: ${fmt(groupDiscount)}`, margin, currentY);
        currentY += 9;
      });

      // Grand total card
      const cardH = 20;
      if (currentY + cardH + 20 > pageHeight - 10) { doc.addPage(); currentY = margin; }
      currentY += 2;
      doc.setFillColor(15, 118, 110);
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, cardH, 3, 3, 'F');
      doc.setFillColor(20, 184, 166);
      doc.setGState(new doc.GState({ opacity: 0.35 }));
      doc.roundedRect(margin + (pageWidth - 2 * margin) * 0.55, currentY, (pageWidth - 2 * margin) * 0.45, cardH, 3, 3, 'F');
      doc.setGState(new doc.GState({ opacity: 1 }));
      doc.setFontSize(7.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(204, 251, 241);
      doc.text('GRAND TOTAL STUDENTS', margin + 5, currentY + 7);
      doc.text('TOTAL MONTHLY DISCOUNT', margin + 80, currentY + 7);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(String(grandStudents), margin + 5, currentY + 16);
      doc.text(fmt(grandDiscount), margin + 80, currentY + 16);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(153, 246, 228);
      doc.text('Discounted Fee Students Report', pageWidth - margin - 5, currentY + 12, { align: 'right' });
      currentY += cardH;
    }

    // ── Footer ────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      const footerY = pageHeight - 8;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
      doc.setFontSize(6.5);
      doc.setTextColor(150);
      doc.text('This is a computer-generated report. No signature required.', pageWidth / 2, footerY - 6, { align: 'center' });
      doc.setTextColor(120);
      doc.text('Jamia Tul Mastwaar — Discounted Fee Students Report', margin, footerY);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
    }

    const fileName = isFiltered
      ? `discounted_students_filtered_${now.toISOString().slice(0, 10)}.pdf`
      : `discounted_students_all_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    toast.success('PDF downloaded!');
  };

  // Filtered students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        !searchTerm ||
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cnic?.includes(searchTerm);
      const matchesClass = !filterClassType || student.class === filterClassType;
      const pct = student.feeDiscount || 0;
      const matchesMin = !filterDiscountMin || pct >= parseFloat(filterDiscountMin);
      const matchesMax = !filterDiscountMax || pct <= parseFloat(filterDiscountMax);
      return matchesSearch && matchesClass && matchesMin && matchesMax;
    });
  }, [students, searchTerm, filterClassType, filterDiscountMin, filterDiscountMax]);

  // Client-side stats for filtered list
  const filteredStats = useMemo(() => {
    let totalDiscount = 0;
    const byClass = {};
    filteredStudents.forEach(student => {
      const base = student.feePerMonth || 0;
      const pct = student.feeDiscount || 0;
      const discAmt = base * (pct / 100);
      totalDiscount += discAmt;
      const cls = student.class || 'Unknown';
      if (!byClass[cls]) byClass[cls] = { amount: 0, count: 0 };
      byClass[cls].amount += discAmt;
      byClass[cls].count += 1;
    });
    return {
      totalDiscount,
      byClass,
      fullDiscount: filteredStudents.filter(s => s.feeDiscount === 100).length,
      partialDiscount: filteredStudents.filter(s => s.feeDiscount > 0 && s.feeDiscount < 100).length,
    };
  }, [filteredStudents]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(n || 0);

  const classTypeLabel = {
    Class: 'Regular Class',
    BS: 'BS / Degree',
    Almiya: 'Almiya',
    Hifaz: 'Hifaz-ul-Quran',
  };

  const classColors = {
    Class: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    BS: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    Almiya: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    Hifaz: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    Unknown: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  };

  const getStudentClassLabel = (student) => {
    if (student.class === 'Class' || student.class === 'Almiya') {
      return `${student.class} ${student.classNumber || ''}`.trim();
    }
    if (student.class === 'BS') {
      return `${student.degreeName || ''} (Sem ${student.semester || '-'})`.trim();
    }
    return student.class || '-';
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterClassType('');
    setFilterDiscountMin('');
    setFilterDiscountMax('');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.background}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4" />
          <p className={`text-lg font-medium ${currentTheme.text}`}>Loading discounted students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.background}`}>
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200 max-w-md">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchStudents}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Stats to display: use server stats if no filter applied, else use filtered stats
  const isFiltered = searchTerm || filterClassType || filterDiscountMin || filterDiscountMax;
  const displayStats = isFiltered ? filteredStats : (serverStats ? {
    totalDiscount: serverStats.totalMonthlyDiscount,
    byClass: serverStats.byClass,
    fullDiscount: serverStats.fullDiscount,
    partialDiscount: serverStats.partialDiscount,
  } : filteredStats);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen ${currentTheme.background} ${currentTheme.text}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className={`mb-6 p-6 rounded-2xl ${currentTheme.heroBg || 'bg-emerald-50'} ${currentTheme.shadow || 'shadow-md'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${currentTheme.heroPillBg || 'bg-green-100'}`}>
              <TagIcon className={`h-8 w-8 ${currentTheme.iconText || 'text-green-700'}`} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold ${currentTheme.heroTitle || 'text-green-800'}`}>
                Discounted Fee Students
              </h1>
              <p className={`text-sm mt-1 ${currentTheme.heroSubtitle || 'text-gray-600'}`}>
                Overview of all students receiving fee discounts and their monthly impact.
              </p>
            </div>
          </div>
        <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentTheme.heroPillBg || 'bg-green-100'}`}>
              <UserGroupIcon className={`h-5 w-5 ${currentTheme.iconText || 'text-green-700'}`} />
              <span className={`font-bold text-lg ${currentTheme.iconText || 'text-green-700'}`}>{isFiltered ? filteredStudents.length : (serverStats?.total || students.length)}</span>
              <span className={`text-sm ${currentTheme.heroSubtitle || 'text-gray-600'}`}>Students</span>
            </div>
            <button
              onClick={handleDownloadPDF}
              title="Download PDF report"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition font-semibold text-sm"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Monthly Discount */}
        <div className={`rounded-2xl p-5 border-l-4 border-blue-500 col-span-2 lg:col-span-1 ${currentTheme.cardBg || 'bg-white'} shadow-md`}>
          <div className="flex items-center gap-3 mb-1">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            <p className={`text-xs font-semibold uppercase tracking-wide ${currentTheme.mutedText || 'text-gray-500'}`}>Monthly Discount Lost</p>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-700">{fmt(displayStats.totalDiscount)}</p>
          {isFiltered && <p className={`text-xs mt-1 ${currentTheme.mutedText || 'text-gray-400'}`}>(filtered)</p>}
        </div>

        {/* 100% Discounted */}
        <div className={`rounded-2xl p-5 border-l-4 border-green-500 ${currentTheme.cardBg || 'bg-white'} shadow-md`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🆓</span>
            <p className={`text-xs font-semibold uppercase tracking-wide ${currentTheme.mutedText || 'text-gray-500'}`}>Full Waiver</p>
          </div>
          <p className="text-2xl font-extrabold text-green-700">{displayStats.fullDiscount}</p>
          <p className={`text-xs mt-1 ${currentTheme.mutedText || 'text-gray-400'}`}>100% Discount</p>
        </div>

        {/* Partial Discount */}
        <div className={`rounded-2xl p-5 border-l-4 border-amber-500 ${currentTheme.cardBg || 'bg-white'} shadow-md`}>
          <div className="flex items-center gap-2 mb-1">
            <TagIcon className="h-5 w-5 text-amber-600" />
            <p className={`text-xs font-semibold uppercase tracking-wide ${currentTheme.mutedText || 'text-gray-500'}`}>Partial Discount</p>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{displayStats.partialDiscount}</p>
          <p className={`text-xs mt-1 ${currentTheme.mutedText || 'text-gray-400'}`}>1–99% Reduced</p>
        </div>

        {/* Total */}
        <div className={`rounded-2xl p-5 border-l-4 border-purple-500 ${currentTheme.cardBg || 'bg-white'} shadow-md`}>
          <div className="flex items-center gap-2 mb-1">
            <UserGroupIcon className="h-5 w-5 text-purple-600" />
            <p className={`text-xs font-semibold uppercase tracking-wide ${currentTheme.mutedText || 'text-gray-500'}`}>All Discounted</p>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{isFiltered ? filteredStudents.length : (serverStats?.total || students.length)}</p>
          <p className={`text-xs mt-1 ${currentTheme.mutedText || 'text-gray-400'}`}>Total Students</p>
        </div>
      </div>

      {/* Class Breakdown */}
      {Object.keys(displayStats.byClass).length > 0 && (
        <div className={`mb-6 p-6 rounded-2xl ${currentTheme.cardBg || 'bg-white'} shadow-md border ${currentTheme.border || 'border-gray-100'}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${currentTheme.title || 'text-gray-700'}`}>
            Monthly Discount by Class Type {isFiltered ? '(Filtered)' : ''}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(displayStats.byClass).map(([cls, data]) => {
              const amount = typeof data === 'object' ? data.amount : data;
              const count = typeof data === 'object' ? data.count : null;
              const colors = classColors[cls] || classColors.Unknown;
              return (
                <div key={cls} className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${colors.text} mb-1`}>
                    {classTypeLabel[cls] || cls}
                  </p>
                  <p className={`text-lg font-extrabold ${colors.text}`}>{fmt(amount)}</p>
                  {count !== null && (
                    <p className={`text-xs mt-1 ${colors.text} opacity-70`}>{count} student{count !== 1 ? 's' : ''}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className={`mb-6 p-5 rounded-2xl ${currentTheme.cardBg || 'bg-white'} shadow-md border ${currentTheme.border || 'border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or CNIC..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${currentTheme.inputBg || 'border-gray-300 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-400 transition`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition ${showFilters ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'}`}
          >
            <FunnelIcon className="h-5 w-5" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          {(searchTerm || filterClassType || filterDiscountMin || filterDiscountMax) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
            >
              <XMarkIcon className="h-5 w-5" />
              Reset
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class Type</label>
              <select
                value={filterClassType}
                onChange={(e) => setFilterClassType(e.target.value)}
                className={`w-full rounded-lg border p-2.5 ${currentTheme.inputBg || 'border-gray-300'} focus:ring-2 focus:ring-green-300`}
              >
                <option value="">All Types</option>
                <option value="Class">Regular Class</option>
                <option value="BS">BS / Degree</option>
                <option value="Almiya">Almiya</option>
                <option value="Hifaz">Hifaz-ul-Quran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filterDiscountMin}
                onChange={(e) => setFilterDiscountMin(e.target.value)}
                placeholder="e.g. 10"
                className={`w-full rounded-lg border p-2.5 ${currentTheme.inputBg || 'border-gray-300'} focus:ring-2 focus:ring-green-300`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filterDiscountMax}
                onChange={(e) => setFilterDiscountMax(e.target.value)}
                placeholder="e.g. 100"
                className={`w-full rounded-lg border p-2.5 ${currentTheme.inputBg || 'border-gray-300'} focus:ring-2 focus:ring-green-300`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className={`rounded-2xl shadow-md overflow-hidden ${currentTheme.cardBg || 'bg-white'} border ${currentTheme.border || 'border-gray-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className={`${currentTheme.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
              <tr className="text-left text-xs font-bold text-white uppercase tracking-wider">
                <th className="px-5 py-4 rounded-tl-2xl">Student</th>
                <th className="px-5 py-4">Class / Detail</th>
                <th className="px-5 py-4">Fee Type</th>
                <th className="px-5 py-4">Base Fee / Month</th>
                <th className="px-5 py-4">Discount %</th>
                <th className="px-5 py-4">Discount Amt</th>
                <th className="px-5 py-4">Effective Fee</th>
                <th className="px-5 py-4 rounded-tr-2xl">Fee Status</th>
              </tr>
            </thead>
            <tbody className={`${currentTheme.tbodyBg || 'bg-white'} divide-y ${currentTheme.border || 'divide-gray-100'}`}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const base = student.feePerMonth || 0;
                  const pct = student.feeDiscount || 0;
                  const discountAmt = base * (pct / 100);
                  const effectiveFee = Math.max(0, base - discountAmt);
                  const colors = classColors[student.class] || classColors.Unknown;
                  const isFullDiscount = pct === 100;

                  return (
                    <tr
                      key={student._id}
                      className={`transition-all duration-150 ${currentTheme.tableHover || 'hover:bg-green-50'} ${index % 2 === 0 ? (currentTheme.tbodyBg || 'bg-white') : (currentTheme.tableStripedBg || 'bg-gray-50')}`}
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex-shrink-0 ${colors.bg} flex items-center justify-center ring-2 ${colors.border}`}>
                            <span className={`font-bold text-sm ${colors.text}`}>
                              {student.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${currentTheme.text || 'text-gray-900'}`}>{student.name}</p>
                            <p className={`text-xs font-mono ${currentTheme.mutedText || 'text-gray-400'}`}>{student.cnic}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class Detail */}
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {getStudentClassLabel(student)}
                        </span>
                      </td>

                      {/* Fee Type */}
                      <td className="px-5 py-4">
                        {isFullDiscount ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                            Full Waiver
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Partial Disc.
                          </span>
                        )}
                      </td>

                      {/* Base Fee */}
                      <td className={`px-5 py-4 text-sm font-semibold ${currentTheme.text || 'text-gray-800'}`}>
                        {fmt(base)}
                      </td>

                      {/* Discount % */}
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                          {pct}%
                        </span>
                      </td>

                      {/* Discount Amount */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-rose-600">
                          - {fmt(discountAmt)}
                        </span>
                      </td>

                      {/* Effective Fee */}
                      <td className="px-5 py-4">
                        <span className={`text-sm font-extrabold ${isFullDiscount ? 'text-green-700' : currentTheme.text || 'text-gray-900'}`}>
                          {isFullDiscount ? 'FREE' : fmt(effectiveFee)}
                        </span>
                      </td>

                      {/* Fee Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          student.feeStatus === 'Paid'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : student.feeStatus === 'Partial Paid'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {student.feeStatus || 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TagIcon className="h-12 w-12 text-gray-300" />
                      <p className={`text-base font-medium ${currentTheme.mutedText || 'text-gray-500'}`}>
                        No discounted students found
                      </p>
                      {(searchTerm || filterClassType) && (
                        <button onClick={handleReset} className="text-green-600 text-sm underline">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filteredStudents.length > 0 && (
          <div className={`px-6 py-4 border-t ${currentTheme.border || 'border-gray-100'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
            <p className={`text-sm ${currentTheme.mutedText || 'text-gray-500'}`}>
              Showing <span className="font-bold">{filteredStudents.length}</span> discounted student{filteredStudents.length !== 1 ? 's' : ''}
              {isFiltered && <span> (filtered from {students.length} total)</span>}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${currentTheme.mutedText || 'text-gray-500'}`}>Total monthly discount:</span>
              <span className="text-base font-extrabold text-rose-600">{fmt(filteredStats.totalDiscount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountedStudents;
