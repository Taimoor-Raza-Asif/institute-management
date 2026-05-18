import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../App';
import api from '../api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import AddEditBillModal from '../components/AddEditBillModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import {
    PlusIcon, FunnelIcon, MagnifyingGlassIcon, PencilIcon,
    TrashIcon, ArrowDownTrayIcon, EyeIcon, ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import FileImportModal from './FileImportModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const billCategories = ['Utilities', 'Kitchen', 'Vendor Payment', 'Repairs', 'Other'];
const billStatuses = ['Paid', 'Unpaid', 'Partial'];

const BillingManagement = () => {
    const { currentUser: user } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMonth, setFilterMonth] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const fetchBills = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/billing', {
                params: {
                    search: searchTerm,
                    category: filterCategory,
                    status: filterStatus,
                    month: filterMonth ? filterMonth.getMonth() + 1 : null,
                    year: filterMonth ? filterMonth.getFullYear() : null,
                }
            });
            setBills(response.data);
        } catch (err) {
            setError('Failed to fetch bills.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterCategory, filterStatus, filterMonth]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);
        const totalAmount = useMemo(() => (
            Array.isArray(bills) ? bills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0) : 0
        ), [bills]);
        const paidCount = useMemo(() => (
            Array.isArray(bills) ? bills.filter(b => b.status === 'Paid').length : 0
        ), [bills]);
        const unpaidCount = useMemo(() => (
            Array.isArray(bills) ? bills.filter(b => b.status !== 'Paid').length : 0
        ), [bills]);


    const handleAddBill = () => {
        setSelectedBill(null);
        setIsViewMode(false);
        setIsModalOpen(true);
    };

    const handleEditBill = (bill) => {
        setSelectedBill(bill);
        setIsViewMode(false);
        setIsModalOpen(true);
    };

    const handleViewBill = (bill) => {
        setSelectedBill(bill);
        setIsViewMode(true);
        setIsModalOpen(true);
    };

        const [confirmOpen, setConfirmOpen] = useState(false);
        const [billIdToDelete, setBillIdToDelete] = useState(null);

        const requestDeleteBill = (id) => {
            setBillIdToDelete(id);
            setConfirmOpen(true);
        };

        const confirmDeleteBill = async () => {
            if (!billIdToDelete) return;
            setLoading(true);
            try {
                await api.delete(`/billing/${billIdToDelete}`);
                fetchBills();
            } catch (err) {
                setError('Failed to delete bill.');
            } finally {
                setLoading(false);
                setConfirmOpen(false);
                setBillIdToDelete(null);
            }
        };

    const handleDownloadReceipt = useCallback(async (billId) => {
        const bill = bills.find(b => b._id === billId);
        if (!bill) {
            console.error("Bill not found for receipt generation.");
            return;
        }

        const doc = new jsPDF({ format: 'a4' });
        const filename = `${bill.title.replace(/\s/g, '_')}_Bill_Summary_${new Date(bill.billDate).toLocaleDateString()}.pdf`;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const headerHeight = 50;

        const savePDF = () => {
            doc.save(filename);
        };

        const generatePDF = async () => {
            // Teal header background
            doc.setFillColor(26, 188, 156);
            doc.rect(0, 0, pageWidth, headerHeight, 'F');

            // Decorative overlay circles
            doc.setFillColor(255, 255, 255);
            doc.setGState(new doc.GState({ opacity: 0.08 }));
            doc.circle(pageWidth * 0.18, 12, 35, 'F');
            doc.circle(pageWidth * 0.82, headerHeight * 0.6, 25, 'F');
            doc.setGState(new doc.GState({ opacity: 1 }));

            // White circle background for logo
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 12, 22, 14, 'F');

            // Institute logo
            const logo = new Image();
            logo.src = '/Jamia Logo.png';
            await new Promise((resolve) => {
                logo.onload = () => {
                    doc.addImage(logo, 'JPEG', margin + 3, 13, 18, 18);
                    resolve();
                };
                logo.onerror = () => resolve();
            });

            // Header text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('Jamia Tul Mastwaar', margin + 30, 18);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(240, 253, 250);
            doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 30, 25);
            doc.text('(0334) 8724125 | jamiatulmastwaar@gmail.com', margin + 30, 31);

            doc.setFontSize(13);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('BILL SUMMARY', pageWidth - margin, 42, { align: 'right' });

            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.setGState(new doc.GState({ opacity: 0.3 }));
            doc.line(margin, headerHeight - 5, pageWidth - margin, headerHeight - 5);
            doc.setGState(new doc.GState({ opacity: 1 }));

            let yPos = headerHeight + 10;
            doc.setTextColor(0, 0, 0);

            // Timestamp badge
            doc.setFillColor(236, 253, 245);
            doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
            doc.setFontSize(8);
            doc.setTextColor(4, 120, 87);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
            doc.setTextColor(0, 0, 0);
            yPos += 15;

            // Helper functions
            const addSectionHeader = (title) => {
                doc.setFillColor(240, 248, 242);
                doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40, 167, 69);
                doc.text(title, margin + 3, yPos + 5.5);
                doc.setTextColor(0, 0, 0);
                yPos += 13;
            };

            const columnGap = 18;
            const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

            const addTwoFields = (label1, value1, label2 = null, value2 = null) => {
                const addSingle = (x, label, value) => {
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(80, 80, 80);
                    doc.text(`${label}:`, x, yPos);
                    const labelWidth = doc.getTextWidth(`${label}:`);
                    doc.setFontSize(9.5);
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(0, 0, 0);
                    const text = value ? String(value) : 'N/A';
                    const lines = doc.splitTextToSize(text, columnWidth - labelWidth - 5);
                    doc.text(lines, x + labelWidth + 3, yPos);
                };

                addSingle(margin, label1, value1);
                if (label2) addSingle(margin + columnWidth + columnGap, label2, value2);
                yPos += 7;
            };

            // Bill Details Section
            addSectionHeader('BILL DETAILS');
            addTwoFields('Bill Title', bill.title, 'Category', bill.category);
            addTwoFields('Amount', `PKR ${parseFloat(bill.amount).toLocaleString()}`, 'Status', bill.status);
            addTwoFields('Bill Date', new Date(bill.billDate).toLocaleDateString(), 'Paid To', bill.paidTo || 'N/A');
            if (bill.status !== 'Unpaid') {
                addTwoFields('Payment Date', new Date(bill.paymentDate).toLocaleDateString(), 'Payment Method', bill.paymentMethod);
            }
            addTwoFields('Remarks', bill.remarks || 'N/A', '', '');
            yPos += 5;

            // Transaction Information Section
            addSectionHeader('TRANSACTION INFORMATION');
            const enteredByName = bill.markedBy?.profileId?.name || bill.markedBy?.cnic || 'N/A';
            const enteredByRole = bill.markedBy?.role || '';
            const enteredByValue = enteredByName !== 'N/A' ? `${enteredByName} (${enteredByRole})` : 'N/A';
            addTwoFields('Entered By', enteredByValue, 'Created At', new Date(bill.createdAt).toLocaleString());
            yPos += 10;

            // Footer
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('This is a computer-generated bill summary. No signature is required.', pageWidth / 2, yPos, { align: 'center' });

            // Page footer
            const footerY = pageHeight - 10;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
            doc.setFontSize(7);
            doc.setTextColor(120);
            doc.text('Jamia Tul Mastwaar - Bill Summary', margin, footerY);
            doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

            savePDF();
        };

        generatePDF();
    }, [bills]);

    // Download a PDF report of the currently filtered bills (as shown in the table)
    const handleDownloadFilteredReport = useCallback(() => {
        const items = (Array.isArray(bills) ? [...bills] : []).sort((a, b) => {
            const dateA = new Date(a.paymentDate || a.billDate);
            const dateB = new Date(b.paymentDate || b.billDate);
            return dateA - dateB;
        });
        const totalAmountReport = items.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

        const doc = new jsPDF({ format: 'a4' });
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const headerHeight = 50;

        const savePDF = () => {
            const monthLabel = filterMonth ? `${filterMonth.toLocaleString('en-US', { month: 'short' })} ${filterMonth.getFullYear()}` : 'All';
            const filename = `Bills_Report_${monthLabel}.pdf`;
            doc.save(filename);
        };

        const generatePDF = async () => {
            // ── Modern Header ──────────────────────────────────────────────
            // Primary dark-teal background
            doc.setFillColor(15, 118, 110);   // dark teal
            doc.rect(0, 0, pageWidth, headerHeight, 'F');

            // Lighter teal right-side panel (diagonal look)
            doc.setFillColor(20, 184, 166);   // medium teal
            doc.triangle(
                pageWidth * 0.45, 0,
                pageWidth, 0,
                pageWidth, headerHeight,
                'F'
            );

            // Subtle geometric circles
            doc.setFillColor(255, 255, 255);
            doc.setGState(new doc.GState({ opacity: 0.06 }));
            doc.circle(pageWidth * 0.75, -8, 42, 'F');
            doc.circle(pageWidth * 0.92, headerHeight + 4, 30, 'F');
            doc.circle(margin + 5, headerHeight + 2, 28, 'F');
            doc.setGState(new doc.GState({ opacity: 1 }));

            // Cyan-teal bottom accent stripe
            doc.setFillColor(8, 145, 178);   // cyan-600
            doc.rect(0, headerHeight - 3.5, pageWidth, 3.5, 'F');

            // White circle with subtle ring for logo
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 14, 25, 15, 'F');
            doc.setDrawColor(8, 145, 178);   // cyan-600 ring
            doc.setLineWidth(1.2);
            doc.circle(margin + 14, 25, 15.8, 'S');

            // Logo
            const logo = new Image();
            logo.src = '/Jamia Logo.png';
            await new Promise((resolve) => {
                logo.onload = () => { doc.addImage(logo, 'JPEG', margin + 4, 15, 20, 20); resolve(); };
                logo.onerror = () => resolve();
            });

            // Institute name – large bold
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Jamia Tul Mastwaar', margin + 34, 20);

            // Tagline / address
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(204, 251, 241);  // teal-100
            doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 34, 27);
            doc.text('(0334) 8724125  |  jamiatulmastwaar@gmail.com', margin + 34, 33);

            // ── Report-title badge (right side) — white + teal ──
            const badgeW = 52;
            const badgeH = 11;
            const badgeX = pageWidth - margin - badgeW;
            const badgeY = 32;
            // White fill
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'F');
            // Teal border
            doc.setDrawColor(15, 118, 110);
            doc.setLineWidth(0.8);
            doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'S');
            // Label
            doc.setFontSize(8.5);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(15, 118, 110);
            doc.text('BILLS REPORT', badgeX + badgeW / 2, badgeY + 7.2, { align: 'center' });

            let yPos = headerHeight + 10;

            // Filters summary
            const monthLabel = filterMonth ? `${filterMonth.toLocaleString('en-US', { month: 'long' })} ${filterMonth.getFullYear()}` : 'All';
            const categoryLabel = filterCategory || 'All Categories';
            const statusLabel = filterStatus || 'All Statuses';

            doc.setFillColor(236, 253, 245);
            doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 1.5, 1.5, 'F');
            doc.setFontSize(9);
            doc.setTextColor(4, 120, 87);
            doc.text(`Filters — Category: ${categoryLabel} | Status: ${statusLabel} | Month: ${monthLabel}`,
                margin + 3, yPos + 8);
            doc.setTextColor(0, 0, 0);
            yPos += 18;

            // Section header helper
            const addSectionHeader = (title) => {
                doc.setFillColor(240, 248, 242);
                doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40, 167, 69);
                doc.text(title, margin + 3, yPos + 5.5);
                doc.setTextColor(0, 0, 0);
                yPos += 13;
            };

            // Table layout constants
            // Columns: #, Title, Amount, Payment Date, Payment Method, Remarks
            const tableWidth = pageWidth - 2 * margin;
            const colWidths = [8, 55, 28, 30, 32, tableWidth - 8 - 55 - 28 - 30 - 32]; // last col = Remarks
            const colHeaders = ['#', 'Title', 'Amount (PKR)', 'Payment Date', 'Method', 'Paid To'];
            const rowHeight = 8;
            const cellPadX = 2;
            const cellPadY = 5.5;

            const drawTableHeader = () => {
                doc.setFillColor(26, 188, 156);
                doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(255, 255, 255);
                let x = margin;
                colHeaders.forEach((h, i) => {
                    doc.text(h, x + cellPadX, yPos + cellPadY);
                    x += colWidths[i];
                });
                doc.setTextColor(0, 0, 0);
                yPos += rowHeight;
            };

            const drawTableRow = (rowData, isEven) => {
                if (isEven) {
                    doc.setFillColor(236, 253, 245);
                    doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
                }
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(40, 40, 40);
                let x = margin;
                rowData.forEach((cell, i) => {
                    const text = cell ? String(cell) : 'N/A';
                    const truncated = doc.splitTextToSize(text, colWidths[i] - cellPadX * 2)[0] || '';
                    doc.text(truncated, x + cellPadX, yPos + cellPadY);
                    x += colWidths[i];
                });
                // Bottom border
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.2);
                doc.line(margin, yPos + rowHeight, margin + tableWidth, yPos + rowHeight);
                yPos += rowHeight;
            };

            // Records section
            addSectionHeader('RECORDS');
            if (!items.length) {
                doc.setFontSize(10);
                doc.text('No records for the selected filters.', margin, yPos + 4);
                yPos += 12;
            } else {
                drawTableHeader();
                items.forEach((b, idx) => {
                    // Page break: leave room for total + footer
                    if (yPos > pageHeight - 50) {
                        doc.addPage();
                        yPos = margin + 5;
                        addSectionHeader('RECORDS (continued)');
                        drawTableHeader();
                    }
                    const paymentDate = b.status !== 'Unpaid' && b.paymentDate
                        ? new Date(b.paymentDate).toLocaleDateString()
                        : 'N/A';
                    const method = b.status !== 'Unpaid' ? (b.paymentMethod || 'N/A') : 'N/A';
                    drawTableRow(
                        [idx + 1, b.title, `${Number(b.amount).toLocaleString()}`, paymentDate, method, b.paidTo || 'N/A'],
                        idx % 2 === 1
                    );
                });
                yPos += 4;
            }

            // Ensure TOTAL section has space on current page
            if (yPos > pageHeight - 45) {
                doc.addPage();
                yPos = margin + 5;
            }

            // ── Modern Total Card ──
            yPos += 4;
            const cardH = 22;
            // Teal gradient-style card: dark layer + lighter overlay strip
            doc.setFillColor(15, 118, 110);
            doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardH, 3, 3, 'F');
            doc.setFillColor(20, 184, 166);
            doc.setGState(new doc.GState({ opacity: 0.35 }));
            doc.roundedRect(margin + (pageWidth - 2 * margin) * 0.55, yPos, (pageWidth - 2 * margin) * 0.45, cardH, 3, 3, 'F');
            doc.setGState(new doc.GState({ opacity: 1 }));
            // Left label
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(204, 251, 241);   // teal-100
            doc.text('TOTAL EXPENDITURE', margin + 5, yPos + 8);
            // Large amount
            doc.setFontSize(13);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`PKR ${Number(totalAmountReport).toLocaleString()}`, margin + 5, yPos + 17);
            // Right decorative text
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(153, 246, 228);   // teal-200
            doc.text('Bills Report Summary', pageWidth - margin - 5, yPos + 13, { align: 'right' });
            yPos += cardH;

            // Footer (always on bottom of current page)
            const footerY = pageHeight - 10;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('This is a computer-generated report. No signature is required.', pageWidth / 2, footerY - 8, { align: 'center' });
            doc.setTextColor(120);
            doc.text('Jamia Tul Mastwaar - Bills Report', margin, footerY);
            doc.text(`Page ${doc.getNumberOfPages()} of ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

            savePDF();
        };

        generatePDF();
    }, [bills, filterCategory, filterStatus, filterMonth]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setFilterStatus('');
        setFilterMonth(null);
    };

    const isAllowed = user?.role === 'admin'  || user?.role === 'accountant';

        return (
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        {/* Hero Header */}
                        <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Billing Management</h1>
                                        <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm sm:text-base`}>Track institute bills and payments</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Total Amount</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>PKR {Number(totalAmount).toFixed(2)}</p>
                                    </div>
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Paid Bills</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>{paidCount}</p>
                                    </div>
                                    <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || currentTheme?.border || 'border border-emerald-100'} ${currentTheme?.shadow || ''} rounded-lg p-4`}>
                                        <p className={`${currentTheme?.statCardLabel || currentTheme?.mutedText || 'text-gray-600'} text-sm`}>Pending/Unpaid</p>
                                        <p className={`${currentTheme?.statCardValue || currentTheme?.text || 'text-white'} text-2xl font-bold`}>{unpaidCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
            {error && <Message type="error">{error}</Message>}

            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-6 mb-6`}>
                {/* Search Bar - Full Width */}
                <div className="relative w-full mb-4">
                    <input
                        type="text"
                        placeholder="Search by title or paid to..."
                        className={`w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-gray-400'}`} />
                </div>
                {/* Action Buttons - Multi-row on mobile, single row on larger screens */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} flex-1 sm:flex-initial whitespace-nowrap`}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                    </button>
                    <button
                        onClick={handleDownloadFilteredReport}
                        className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} flex-1 sm:flex-initial whitespace-nowrap`}
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Download Report
                    </button>
                    {isAllowed && (
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'} flex-1 sm:flex-initial whitespace-nowrap`}
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Upload from file
                        </button>
                    )}
                    {isAllowed && (
                        <button
                            onClick={handleAddBill}
                            className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'} ${currentTheme?.shadow || 'shadow-md'} flex-1 sm:flex-initial whitespace-nowrap`}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add New Bill
                        </button>
                    )}
                </div>

                {showAdvancedFilters && (
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'} rounded-md ${currentTheme?.shadow || 'shadow-inner'}`}>
                        <div>
                            <label htmlFor="filterCategory" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Category</label>
                            <select
                                id="filterCategory"
                                name="filterCategory"
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterStatus" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Status</label>
                            <select
                                id="filterStatus"
                                name="filterStatus"
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {billStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterMonth" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'} mb-1`}>Month</label>
                            <DatePicker
                                selected={filterMonth}
                                onChange={(date) => setFilterMonth(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                className={`mt-1 block w-full p-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} sm:text-sm`}
                                placeholderText="Select Month"
                            />
                        </div>
                        <div className="col-span-full flex justify-end">
                            <button onClick={handleResetFilters} className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} ${currentTheme?.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'}`}>
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
                    <div className="overflow-x-auto rounded-xl overflow-hidden">
                        <table className={`min-w-full divide-y ${currentTheme?.border || 'divide-gray-200'}`}>
                            <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                                <tr>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tl-xl`}>Title</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Category</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Amount</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Status</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Bill Date</th>
                                    <th scope="col" className={`px-6 py-4 text-left text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider`}>Paid To</th>
                                    <th scope="col" className={`px-6 py-4 text-center text-xs font-bold ${currentTheme?.theadText || 'text-white'} uppercase tracking-wider rounded-tr-xl`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${currentTheme?.border || 'divide-gray-100'}`}>
                                {bills.length > 0 ? bills.map((bill) => (
                                    <tr
                                        key={bill._id}
                                        className={`transition-all duration-150 ${currentTheme?.tbodyBg || 'bg-white'} ${currentTheme?.tableStripedBg || 'odd:bg-white even:bg-gray-50'} ${currentTheme?.tableHover || 'hover:bg-emerald-50'} hover:shadow-md`}
                                    >
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{bill.title}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{bill.category}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {Number(bill.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${bill.status === 'Paid' ? `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}` : bill.status === 'Unpaid' ? `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}` : `${currentTheme.badgeWarningBg || 'bg-amber-100'} ${currentTheme.badgeWarningText || 'text-amber-800'}`}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{bill.paidTo || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleViewBill(bill)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="View Bill Details">
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                {isAllowed && (
                                                    <>
                                                        <button onClick={() => handleEditBill(bill)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Edit">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => requestDeleteBill(bill._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Delete">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDownloadReceipt(bill._id)} className={`p-2 ${currentTheme?.iconText || 'text-emerald-700'} hover:opacity-80 transition-opacity duration-200`} title="Download Receipt">
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className={`text-center p-4 ${currentTheme?.mutedText || 'text-gray-500'} text-sm`}>No bills found. {isAllowed && 'Add a new bill!'}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBill(null); setIsViewMode(false); }} title={selectedBill ? (isViewMode ? "Bill Details" : "Edit Bill") : "Add New Bill"}>
                <AddEditBillModal
                    billToEdit={selectedBill}
                    onAdd={fetchBills}
                    onEdit={fetchBills}
                    onClose={() => { setIsModalOpen(false); setSelectedBill(null); setIsViewMode(false); }}
                    isViewMode={isViewMode}
                />
            </Modal>

            <ConfirmationModal
              isOpen={confirmOpen}
              onClose={() => { setConfirmOpen(false); setBillIdToDelete(null); }}
              onConfirm={confirmDeleteBill}
              message="Are you sure you want to delete this bill?"
            />
                        <FileImportModal
                                isOpen={isImportOpen}
                                onClose={() => setIsImportOpen(false)}
                                entityType="billing"
                                onComplete={() => { setIsImportOpen(false); fetchBills(); }}
                        />
        </div>
    );
};

export default BillingManagement;