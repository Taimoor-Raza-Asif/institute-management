// src/components/FeeForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import {
  ArrowDownTrayIcon, PrinterIcon, MinusCircleIcon,
  CurrencyDollarIcon, UserIcon, CalendarDaysIcon,
  BanknotesIcon, DocumentTextIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext';
import DuplicateFeeModal from './DuplicateFeeModal';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i.toString());
  }
  return years;
};

const FeeForm = ({ editingFee, fetchFees, studentsForForm, onClose, isViewMode = false, fetchStudents }) => {
  const { currentTheme } = useTheme();
  const initialState = {
    studentId: '',
    paidBy: '',
    month: months[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    totalFee: '',
    receivedAmount: '',
    dueAmount: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
    paymentMethod: '',
    billScreenshotUrl: '',
  };
  const [fee, setFee] = useState(initialState);
  const [studentQuery, setStudentQuery] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const backendBaseUrl = 'http://localhost:5000';

  const [studentDepositedAmount, setStudentDepositedAmount] = useState(0);
  const [studentOtherDues, setStudentOtherDues] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditAllowed, setIsEditAllowed] = useState(false);
  const [isAddAllowed, setIsAddAllowed] = useState(false);
  const [studentAdmissionFeeStatus, setStudentAdmissionFeeStatus] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountOptions, setBankAccountOptions] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  // Effect to initialize fee form and student financial details when editingFee changes
  useEffect(() => {
    if (editingFee) {
      setFee({
        ...editingFee,
        studentId: editingFee.studentId?._id || '',
        receivedDate: editingFee.receivedDate ? new Date(editingFee.receivedDate).toISOString().split('T')[0] : '',
        month: editingFee.month || months[new Date().getMonth()],
        year: editingFee.year?.toString() || new Date().getFullYear().toString(),
        billScreenshotUrl: editingFee.billScreenshotUrl || '',
      });
      setBankAccount(editingFee.bankAccount?._id || editingFee.bankAccount || '');
      setSelectedFile(null);
      if (editingFee.studentId) {
        setStudentDepositedAmount(editingFee.studentId.depositedAmount || 0);
        setStudentOtherDues(editingFee.studentId.otherDues || 0);
        setStudentAdmissionFeeStatus(editingFee.studentId.admissionFeeStatus);
      }
    } else {
      setFee(initialState);
      setSelectedFile(null);
      setStudentDepositedAmount(0);
      setStudentOtherDues(0);
      setStudentAdmissionFeeStatus(false); 
    }
    setFormError('');
  }, [editingFee]);
  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      setBankAccountsLoading(true);
      try {
        const { data } = await api.get('/bank-accounts');
        setBankAccountOptions(data.filter(acc => acc.isActive));
      } catch (err) {
        console.warn('Could not fetch bank accounts:', err.message);
      } finally {
        setBankAccountsLoading(false);
      }
    };
    fetchBankAccounts();
  }, []);

  // Newly added useEffect hook
  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
    let user = null;
    if (userInfo) {
      try {
        user = JSON.parse(userInfo);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user info from storage", e);
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('userInfo');
      }
    }
    const canPerformAction = user?.role === 'admin' || user?.role === 'accountant';
    setIsAddAllowed(canPerformAction);
    setIsEditAllowed(canPerformAction);
    if (user?.role === 'student' && editingFee && user.profileId === editingFee.studentId) {
      setIsEditAllowed(false);
    }
  }, [editingFee]);

  // Effect to populate totalFee, depositedAmount, and otherDues based on selected student
  useEffect(() => {
    if (fee.studentId && studentsForForm.length > 0) {
      const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
      if (selectedStudent) {
        const baseFee = selectedStudent.feePerMonth || 0;
        const discount = selectedStudent.feeDiscount || 0;
        const effectiveFee = Math.max(0, baseFee - (baseFee * (discount / 100)));
        const isFullDiscount = discount === 100;

        setFee(prev => ({
          ...prev,
          totalFee: effectiveFee.toString(),
          // For 100% discount students, auto-set payment info
          ...(isFullDiscount && !editingFee ? {
            paidBy: 'N/A (100% Discount)',
            receivedBy: 'System',
            receivedAmount: '0',
            paymentMethod: 'Auto',
          } : {}),
        }));
        setStudentDepositedAmount(selectedStudent.depositedAmount || 0);
        setStudentOtherDues(selectedStudent.otherDues || 0);
        setStudentAdmissionFeeStatus(selectedStudent.admissionFeeStatus);
        setStudentQuery(`${selectedStudent.name} (${selectedStudent.cnic})`);
      } else {
        setFee(prev => ({ ...prev, totalFee: '' }));
        setStudentDepositedAmount(0);
        setStudentOtherDues(0);
        setStudentAdmissionFeeStatus(false);
        setStudentQuery('');
      }
    } else if (!fee.studentId && !editingFee) {
      setFee(prev => ({ ...prev, totalFee: '' }));
      setStudentDepositedAmount(0);
      setStudentOtherDues(0);
      setStudentAdmissionFeeStatus(false);
      setStudentQuery('');
    }
  }, [fee.studentId, studentsForForm, editingFee]);

  // Calculate due amount whenever totalFee or receivedAmount changes
  useEffect(() => {
    const total = parseFloat(fee.totalFee);
    const received = parseFloat(fee.receivedAmount);
    const admission = parseFloat(fee.admissionFee) || 0; 
    // if (!isNaN(total) && !isNaN(received)) {
    //   setFee(prev => ({
    //     ...prev,
    //     dueAmount: Math.max(0, total - received)
    //   }));
    // } 
     if (!isNaN(total) && !isNaN(received)) {
      setFee(prev => ({ ...prev, dueAmount: (total + admission) - received })); // MODIFIED THIS LINE
    }
    else {
      setFee(prev => ({ ...prev, dueAmount: 0 }));
    }
  }, [fee.totalFee, fee.receivedAmount, fee.admissionFee]);

  // Function to update student's financial details on the backend
  const updateStudentFinancials = useCallback(async (studentId, updates) => {
    try {
      await api.put(`/students/${studentId}`, updates); // Using the main student update endpoint
    } catch (error) {
      console.error('Failed to update student financials:', error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.message && typeof error.response.data.message === 'string') {
        setFormError('Failed to update student financial details: ' + error.response.data.message);
      } else if (error.response && error.response.data && typeof error.response.data === 'object' && error.response.data.message) {
        const validationErrors = Object.values(error.response.data.message).map(error => error.message).join(', ');
        setFormError('Failed to update student financial details: Validation failed: ' + validationErrors);
      } else {
        setFormError('Failed to update student financial details: ' + (error.message || 'Unknown error'));
      }
      throw error; // Re-throw to stop handleSubmit if financial update fails
    }
  }, []);

  // Format receivedAmount for display: show integer when required (no decimals)
  const formatReceivedForDisplay = (val, paymentMethod) => {
    if (val === null || val === undefined) return '';
    // If value already a number, convert
    const num = parseFloat(val);
    if (Number.isNaN(num)) return String(val || '');
    // When using Deposited Cash we prefer integer display (no decimals)
    if (paymentMethod === 'Deposited Cash') {
      return String(Math.round(num));
    }
    // Otherwise keep user's raw entry but remove trailing .00 for display clarity
    const asStr = String(val);
    if (/^\d+\.0+$/.test(asStr)) return String(Math.round(num));
    return asStr;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'paymentMethod') {
      setFee(prev => ({ ...prev, [name]: value }));
      if (value !== 'Bank') setBankAccount('');

      if (value === 'Deposited Cash') {
        const totalFee = parseFloat(fee.totalFee);
        const currentDeposited = parseFloat(studentDepositedAmount);

        let calculatedReceivedAmount = 0;
        if (!isNaN(totalFee) && totalFee > 0) {
          // calculatedReceivedAmount = Math.min(totalFee, currentDeposited);
          if (totalFee <= currentDeposited) {
            calculatedReceivedAmount = totalFee;
          }
          else if (totalFee > currentDeposited) {
            console.log(`Entered in case totalFee > currentDeposited`);
            if (editingFee &&  editingFee.dueAmount >= currentDeposited) {
              calculatedReceivedAmount = editingFee.receivedAmount + currentDeposited;
              // console.log(`Entered in editing.dueAmout >= `)
            }
            // else{
            //   calculatedReceivedAmount = editingFee.receivedAmount + currentDeposited;
            // }
          }
          else {
            calculatedReceivedAmount = currentDeposited;
          }
        }

        setFee(prev => ({
          ...prev,
          // Store receivedAmount as an integer string for Deposited Cash to satisfy whole-number validation
          receivedAmount: String(Number.isFinite(calculatedReceivedAmount) ? Math.round(calculatedReceivedAmount) : 0),
          paidBy: '-',
          receivedBy: '-',
        }));
      } else {
        // Reset Paid By and Received By if they were - from Deposited Cash
        if (fee.paidBy === '-' || fee.receivedBy === '-') {
          setFee(prev => ({ ...prev, paidBy: '', receivedBy: '' }));
        }
      }
    } else {
      // sanitize numeric fields to digits only where applicable
      const digitOnlyFields = ['totalFee', 'receivedAmount', 'admissionFee'];
      let newVal = value;
      if (digitOnlyFields.includes(name)) {
        newVal = String(value || '').replace(/\D/g, '');
      }
      setFee(prev => ({ ...prev, [name]: newVal }));
    }

  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
  };

  // Handlers for searchable student dropdown
  const handleStudentInputChange = (e) => {
    const val = e.target.value;
    setStudentQuery(val);
    setShowStudentDropdown(true);
    // Clear selected studentId while typing a new query
    setFee(prev => ({ ...prev, studentId: '' }));
  };

  const handleSelectStudent = (student) => {
    setFee(prev => ({ ...prev, studentId: student._id }));
    setStudentQuery(`${student.name} (${student.cnic})`);
    setShowStudentDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (studentRef.current && !studentRef.current.contains(e.target)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isEditAllowed && editingFee) {
      setFormError('You are not authorized to edit this fee record.');
      return;
    }
    if (!isAddAllowed && !editingFee) {
      setFormError('You are not authorized to add fee records.');
      return;
    }
    // Detect 100% discount student
    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    const isFullDiscount = selectedStudent?.feeDiscount === 100;

    // Form validation
    if (!fee.studentId || !fee.month || !fee.year || !fee.receivedDate || !fee.paymentMethod) {
      setFormError('Please fill in all required fields (Student, Month, Year, Received Date, Payment Method).');
      return;
    }
    // For non-discount students require paidBy, receivedBy, receivedAmount
    if (!isFullDiscount && (!fee.paidBy || !fee.receivedBy)) {
      setFormError('Please fill in Paid By and Received By fields.');
      return;
    }
    // totalFee: allow 0 for 100% discount students, else must be positive
    const totalFeeNum = parseInt(fee.totalFee ?? '0', 10);
    if (!isFullDiscount && (!/^\d+$/.test(String(fee.totalFee || '')) || totalFeeNum <= 0)) {
      setFormError('Total Fee must be a positive whole number (auto-populated based on student). Please select a student with a valid fee.');
      return;
    }
    if (isFullDiscount && totalFeeNum !== 0) {
      setFormError('Total Fee should be 0 for students with 100% discount.');
      return;
    }
    if (!/^\d+$/.test(String(fee.receivedAmount ?? '0')) || parseInt(fee.receivedAmount ?? '0', 10) < 0) {
      setFormError('Received Amount must be a non-negative whole number.');
      return;
    }
    // Validation: Prevent receivedAmount from exceeding totalFee for non-Deposited Cash, non-discount methods
    if (!isFullDiscount && fee.paymentMethod !== 'Deposited Cash' && !fee.admissionFee>0 && parseFloat(fee.receivedAmount) > parseFloat(fee.totalFee)) {
      setFormError('Received Amount cannot be greater than Total Fee for this payment method.');
      return;
    }


    const formData = new FormData();
    for (const key in fee) {
      if (key !== 'billScreenshotUrl' && fee[key] !== null) {
        formData.append(key, fee[key]);
      }
    }

    if (selectedFile) {
      formData.append('billScreenshot', selectedFile);
    } else if (fee.billScreenshotUrl) {
      formData.append('billScreenshotUrl', fee.billScreenshotUrl);
    } else {
      formData.append('billScreenshotUrl', '');
    }

    try {
      let savedFeeRecord;
      if (editingFee) {
        savedFeeRecord = await api.put(`/fees/${editingFee._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        savedFeeRecord = await api.post('/fees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // --- Financial Adjustment Logic (after successful fee record save) ---
      const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
      if (selectedStudent) {
        // Fetch the absolute latest student financial data to avoid race conditions
        const studentResponse = await api.get(`/students/${selectedStudent._id}`);
        let currentDeposited = parseFloat(studentResponse.data.depositedAmount || 0);
        let currentOtherDues = parseFloat(studentResponse.data.otherDues || 0);
        const newTotalFee = parseFloat(fee.totalFee);
        const newReceivedAmount = parseFloat(fee.receivedAmount); // This is the final received amount for THIS fee record

        // Determine the actual due amount for the NEW fee record
        const newFeeRecordDueAmount = Math.max(0, newTotalFee - newReceivedAmount);
        let due_Amount =  0;
        // --- 1. UNDO the financial impact of the ORIGINAL fee record if editing ---
        if (editingFee) {
          const oldTotalFee = parseFloat(editingFee.totalFee || 0);
          const oldReceivedAmount = parseFloat(editingFee.receivedAmount || 0);
          const oldPaymentMethod = editingFee.paymentMethod;
          const oldDueAmount = Math.max(0, oldTotalFee - oldReceivedAmount);

          // If old fee was paid via Deposited Cash, return the received amount to deposit
          if (oldPaymentMethod === 'Deposited Cash') {
            // currentDeposited += oldReceivedAmount;

          }
          // If old fee had a due amount, reduce otherDues by that amount (it was added to otherDues before)
          if (oldDueAmount > 0) {
            currentOtherDues -= due_Amount;
          }

          if (oldPaymentMethod !== 'Deposited Cash' && oldReceivedAmount > oldTotalFee) {
            currentDeposited -= (oldReceivedAmount - oldTotalFee);

          }
        }

        if (fee.paymentMethod === 'Deposited Cash') {
          // The `newReceivedAmount` (for this fee record) was drawn from deposit.
          // So, here we just ensure the student's actual deposit is updated correctly by deducting it.eding
          if (editingFee.receivedAmount > 0) {
            //  if(currentDeposited > editingFee.feePerMonth){
            currentDeposited -= due_Amount;
            //  }
            //  else if(currentDeposited < editingFee.feePerMonth){
            //   const remainingFee =  
          }
        }
        // For ALL payment methods (including Deposited Cash, if it still has a due)
        if (newFeeRecordDueAmount > 0) {
          // currentOtherDues += newFeeRecordDueAmount;

        }

        // --- Final Safeguard: Ensure balances don't go negative ---
        currentDeposited = Math.max(0, currentDeposited);
        currentOtherDues = Math.max(0, currentOtherDues);

        // Update the student's financial details on the backend
        await updateStudentFinancials(fee.studentId, {
          depositedAmount: currentDeposited,
          otherDues: currentOtherDues
        });

        // Update local state to reflect the committed changes
        setStudentDepositedAmount(currentDeposited);
        setStudentOtherDues(currentOtherDues);
      }

      fetchFees(); // Refresh the list of fees after successful operation
      fetchStudents(); // CRITICAL: Refresh students data to update dropdown/displays in parent
      onClose();
    } catch (err) {
      console.error('Failed to save fee record or update student financials:', err.response?.data || err.message);
      // If duplicate (conflict) error from backend, show a focused modal instead of the generic error alert
      if (err.response && err.response.status === 409) {
        const msg = (err.response.data && (err.response.data.message || err.response.data)) || 'A fee record for this student for the selected month and year already exists.';
        setDuplicateMessage(msg);
        setDuplicateModalOpen(true);
        return;
      }

      if (err.response && err.response.data && err.response.data.message && typeof err.response.data.message === 'string') {
        setFormError('Failed to save fee record or update student financials: ' + err.response.data.message);
      } else if (err.response && err.response.data && typeof err.response.data === 'object' && err.response.data.message) {
        const validationErrors = Object.values(err.response.data.message).map(error => error.message).join(', ');
        setFormError('Failed to save fee record or update student financials: Validation failed: ' + validationErrors);
      } else {
        setFormError('Failed to save fee record or update student financials: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'Fee Details (Receipt)';
    if (editingFee) return 'Edit Fee Record';
    return 'New Fee Record';
  };

  const handleDownloadReceiptPdf = () => {
    const doc = new jsPDF({ format: 'a4' }); // A4 size

    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    const studentName = selectedStudent ? selectedStudent.name : '-';
    const studentCnic = selectedStudent ? selectedStudent.cnic : '-';
    const studentClassOrDegree = selectedStudent
      ? (selectedStudent.class === 'Class'
        // classNumber now stores the classIdentifier string (e.g. "9th Science")
        ? `${selectedStudent.classNumber || '-'}`
        : selectedStudent.class === 'BS'
        ? `${selectedStudent.degreeName || '-'} (Semester ${selectedStudent.semester || '-'})`
        : selectedStudent.class === 'Almiya'
        ? `Almiya - ${selectedStudent.classNumber || '-'}`
        : selectedStudent.class === 'Hifaz'
        ? 'Hifaz'
        : '-')
      : '-';

    const savePDF = () => {
      const filename = `${studentName.replace(/\s/g, '_')}_Fee_Receipt_${fee.month}_${fee.year}.pdf`;
      doc.save(filename);
    };

    const drawMiniReceipt = (xStart, yStart) => {
      let yPos = yStart;

      // Logo
      const logo = new Image();
      logo.src = './Jamia Logo.png'; // public path logo

      logo.onload = () => {
        // Logo and institute name side by side on left
        const logoWidth = 12;
        const logoHeight = 12;
        const logoX = xStart;
        doc.addImage(logo, 'JPEG', logoX, yPos + 2, logoWidth, logoHeight);

        // Institute Info - Left aligned, next to logo
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Jamia Tul Mastwaar', xStart + logoWidth + 2, yPos + 6);
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Makhdoom Pur Sharif Murid, Chakwal', xStart + logoWidth + 2, yPos + 10);
        doc.setFontSize(6);
        doc.text('(0334) 8724125 | jamiatulmastwaar@gmail.com', xStart + logoWidth + 2, yPos + 13);

        // Divider
        doc.line(xStart, yPos + 18, xStart + 67, yPos + 18);

        // Title
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Fee Receipt', xStart, yPos + 23);

        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 27);

        // Section 1: Student Info
        yPos += 31;
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('Student Information', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 67, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        doc.text(`Name:`, xStart + 5, yPos);
        doc.text(`${studentName}`, xStart + 40, yPos);
        yPos += 4;

        doc.text(`Father's Name:`, xStart + 5, yPos);
        doc.text(`${selectedStudent?.fatherName || '-'}`, xStart + 40, yPos);
        yPos += 4;

        doc.text(`CNIC:`, xStart + 5, yPos);
        doc.text(`${studentCnic}`, xStart + 40, yPos);
        yPos += 4;

        doc.text(`Class/Degree:`, xStart + 5, yPos);
        doc.text(`${studentClassOrDegree}`, xStart + 40, yPos);
        yPos += 6;

        // Section 2: Fee Info
        doc.setFont(undefined, 'bold');
        doc.text('Fee Details', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 67, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        const addField = (label, value) => {
          doc.text(`${label}`, xStart + 5, yPos);
          doc.text(`${value}`, xStart + 50, yPos);
          yPos += 4;
        };

        addField('Total Fee:', `PKR ${parseFloat(fee.totalFee)}`);
        addField('Received Amount:', `PKR ${parseFloat(fee.receivedAmount)}`);
        addField('Due Amount:', `PKR ${parseFloat(fee.dueAmount)}`);
        addField('Paid Month:', fee.month);
        addField('Paid Year:', fee.year);
        addField('Received Date:', new Date(fee.receivedDate).toLocaleDateString());
        addField('Paid By:', fee.paidBy);
        addField('Received By:', fee.receivedBy);
        addField('Payment Method:', fee.paymentMethod);

        // Add Deposited Amount and Other Dues from student (if available)
        if (selectedStudent) {
          addField('Deposited Amount:', `PKR ${parseFloat(selectedStudent.depositedAmount || 0)}`);
          addField('Other Dues:', `PKR ${parseFloat(selectedStudent.otherDues || 0)}`);
        }

        yPos += 5;

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('This is a computer-generated fee receipt. No signature is required.', xStart, yPos + 5);

        savePDF();
      };

      logo.onerror = () => {
        console.warn('Failed to load logo.');
        savePDF();
      };
    };

    // Center the receipt on A4 page (210mm width, 80mm receipt width)
    const pageWidth = 210;
    const receiptWidth = 80;
    const xCenter = (pageWidth - receiptWidth) / 2;
    drawMiniReceipt(xCenter, 10); // Centered horizontally with minimal top margin
  };


  const handlePrintReceipt = async () => {
    if (!fee || !studentsForForm || studentsForForm.length === 0) {
      console.error("Fee data or student data not available for receipt printing.");
      alert("Fee data or student data not available for receipt printing.");
      return;
    }

    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    if (!selectedStudent) {
      console.error("Selected student not found for receipt printing.");
      alert("Selected student not found for receipt printing.");
      return;
    }

    const studentName = selectedStudent ? selectedStudent.name : '-';
    const studentCnic = selectedStudent ? selectedStudent.cnic : '-';
    const studentClassOrDegree = selectedStudent
      ? (selectedStudent.class === 'Class'
        // classNumber now stores the classIdentifier string (e.g. "9th Science")
        ? `${selectedStudent.classNumber || '-'}`
        : selectedStudent.class === 'BS'
        ? `${selectedStudent.degreeName || '-'} (Semester ${selectedStudent.semester || '-'})`
        : selectedStudent.class === 'Almiya'
        ? `Almiya - ${selectedStudent.classNumber || '-'}`
        : selectedStudent.class === 'Hifaz'
        ? 'Hifaz'
        : '-')
      : '-';

    // Function to load an image and return a Promise
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}. Using fallback.`);
          // Resolve with a placeholder image if the actual image fails to load
          const fallbackImg = new Image();
          fallbackImg.src = '/images/default-avatar.png'; // Ensure you have a fallback image
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(`Failed to load fallback image: ${src}`);
        };
      });
    };

    let logoImgSrc = '/default-avatar.jpg'; // Path to your logo
    let billScreenshotImgSrc = fee.billScreenshotUrl ? `${backendBaseUrl}${fee.billScreenshotUrl}` : null;

    let loadedLogo = null;
    let loadedBillScreenshot = null;

    try {
      loadedLogo = await loadImage(logoImgSrc);
      if (billScreenshotImgSrc) {
        loadedBillScreenshot = await loadImage(billScreenshotImgSrc);
      }
    } catch (error) {
      console.error("Error loading images for print:", error);
      alert("Some images could not be loaded for printing. Printing receipt without them.");
      // Continue even if images fail, but loadedImg will be null or fallback
    }

    let receiptHtmlContent = '';
    const numberOfReceipts = 4; // Generate 4 receipts for a 2x2 layout

    for (let i = 0; i < numberOfReceipts; i++) {
      receiptHtmlContent += `
        <div class="receipt">
          <div class="header-section">
            <img class="logo" src="${loadedLogo ? loadedLogo.src : logoImgSrc}" alt="logo" />
            <div class="inst-info">
              <strong>Jamia Tul Mastwaar</strong><br>
              Makhdoom Pur Sharif, Chakwal<br>
              (0334) 8724125<br>
              jamiatulmastwaar@gmail.com
            </div>
          <div class="generated-date">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div class="divider"></div>

          <div class="info-section">
            <strong>Student Information</strong>
            <div class="info-row"><label>Name:</label><span>${studentName}</span></div>
            <div class="info-row"><label>Father's Name:</label><span>${selectedStudent?.fatherName || '-'}</span></div>
            <div class="info-row"><label>CNIC:</label><span>${studentCnic}</span></div>
            <div class="info-row"><label>Class/Degree:</label><span>${studentClassOrDegree}</span></div>
          </div>

          <div class="info-section">
            <strong>Fee Details</strong>
            <div class="info-row"><label>Total Fee:</label><span>PKR ${parseFloat(fee.totalFee)}</span></div>
            <div class="info-row"><label>Received Amount:</label><span>PKR ${parseFloat(fee.receivedAmount)}</span></div>
            <div class="info-row"><label>Due Amount:</label><span>PKR ${parseFloat(fee.dueAmount)}</span></div>
            <div class="info-row"><label>Paid Month:</label><span>${fee.month}</span></div>
            <div class="info-row"><label>Paid Year:</label><span>${fee.year}</span></div>
            <div class="info-row"><label>Received Date:</label><span>${new Date(fee.receivedDate).toLocaleDateString()}</span></div>
            <div class="info-row"><label>Paid By:</label><span>${fee.paidBy}</span></div>
            <div class="info-row"><label>Received By:</label><span>${fee.receivedBy}</span></div>
            <div class="info-row"><label>Payment Method:</label><span>${fee.paymentMethod}</span></div>
            <div class="info-row"><label>Deposited Amount:</label><span>PKR ${parseFloat(studentDepositedAmount)}</span></div>
            <div class="info-row"><label>Other Dues:</label><span>PKR ${parseFloat(studentOtherDues)}</span></div>
          </div>
          ${loadedBillScreenshot ? `
            <div class="screenshot-section">
              <strong>Bill Screenshot:</strong>
              <img class="screenshot" src="${loadedBillScreenshot.src}" alt="Screenshot" />
            </div>
          ` : ''}
          <div class="footer-note">This is a computer-generated fee receipt. No signature is required.</div>
        </div>
      `;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Fee Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            padding: 10mm; /* Match @page margin */
            box-sizing: border-box;
          }
          .receipt {
            width: 48%; /* For 2 receipts per row */
            height: 48vh; /* Use viewport height for better sizing on screen before print */
            box-sizing: border-box;
            padding: 15px;
            border: 1px solid #ddd;
            margin: 1%; /* Space between receipts */
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            background-color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden; /* Hide overflow if content is too large for fixed height */
          }
          .header-section {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .logo {
            width: 45px;
            height: 45px;
            margin-right: 12px;
            border-radius: 50%;
            object-fit: cover;
          }
          .inst-info {
            font-size: 9px;
            line-height: 1.4;
            color: #555;
          }
          .inst-info strong {
              font-size: 11px;
              color: #333;
          }
          .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            margin: 15px 0 10px 0;
          }
          .generated-date {
            text-align: right;
            font-size: 8px;
            color: #999;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px solid #eee;
            margin: 10px 0;
          }
          .info-section {
            margin-top: 10px;
            font-size: 10px;
          }
          .info-section strong {
            display: block;
            font-size: 12px;
            color: #333;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px dashed #eee;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding: 2px 0;
            line-height: 1.3;
          }
          .info-row label {
            font-weight: bold;
            color: #555;
            flex-basis: 45%; /* Adjusted for better alignment */
            text-align: left;
          }
          .info-row span {
            flex-basis: 55%; /* Adjusted for better alignment */
            text-align: right;
            color: #333;
          }
          .screenshot-section {
            margin-top: 15px;
            text-align: center; /* Center the image */
          }
          .screenshot-section strong {
              display: block;
              font-size: 12px;
              color: #333;
              margin-bottom: 5px;
              padding-bottom: 3px;
              border-bottom: 1px dashed #eee;
          }
          img.screenshot {
            max-width: 80%; /* Smaller max-width for screenshot */
            height: auto;
            margin: 8px auto 0 auto; /* Center image */
            border: 1px solid #ddd;
            border-radius: 4px;
            display: block;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .footer-note {
            margin-top: auto; /* Pushes to the bottom */
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 7px;
            color: #999;
            text-align: center;
          }

          /* Print specific adjustments */
          @page {
            size: A4;
            margin: 10mm;
          }
          @media print {
            body { margin: 0; }
            .receipt {
              height: auto; /* Allow height to adjust for print */
              page-break-inside: avoid; /* Avoid breaking receipts across pages */
              margin: 5mm; /* Smaller margins for print to fit more */
              box-shadow: none; /* Remove shadow for print */
              border: 1px solid #ccc; /* Ensure border is visible */
            }
            .receipt-container {
              padding: 0;
              justify-content: flex-start; /* Align to start for print */
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${receiptHtmlContent}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  // Function to handle clearing other dues using deposited amount
  const handleClearOtherDues = async () => {
    if (!fee.studentId) {
      setFormError("Please select a student first to clear other dues.");
      return;
    }

    let currentDeposited = parseFloat(studentDepositedAmount);
    let currentOtherDues = parseFloat(studentOtherDues);

    if (currentOtherDues <= 0) {
      setFormError("No other dues to clear.");
      return;
    }

    let amountToClear = Math.min(currentOtherDues, currentDeposited);
    let remainingOtherDues = currentOtherDues - amountToClear;
    let remainingDeposited = currentDeposited - amountToClear;

    setStudentDepositedAmount(remainingDeposited);
    setStudentOtherDues(remainingOtherDues);

    // Update student's financial details on backend
    try {
      await updateStudentFinancials(fee.studentId, {
        depositedAmount: remainingDeposited,
        otherDues: remainingOtherDues
      });
      setFormError("Other dues adjusted using deposited amount.");
      fetchStudents(); // Refresh students data to update displays
    } catch (error) {
      // Error message will be set by updateStudentFinancials
    }
  };


  // --- Style helpers (match SalaryForm) ---
  const inputBase = `w-full rounded-lg border ${currentTheme?.inputBorder || 'border-gray-200'} ${currentTheme?.inputBg || 'bg-white/80'} px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.shadow || 'shadow-sm'} focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`;
  const inputDisabled = `w-full rounded-lg border ${currentTheme?.inputBorder || 'border-gray-200'} bg-gray-100 px-3.5 py-2.5 text-sm ${currentTheme?.inputText || 'text-gray-500'} cursor-not-allowed`;
  const labelBase = `text-sm font-semibold ${currentTheme?.subtitle || 'text-gray-700'} flex items-center gap-2 mb-1`;
  const sectionBase = `p-4 md:p-5 ${currentTheme?.panelBg || 'bg-gray-50/70'} ${currentTheme?.border || 'border border-gray-100'} rounded-xl space-y-4`;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${currentTheme?.cardBg || 'bg-white/90'} backdrop-blur ${currentTheme?.shadow || 'shadow-2xl'} ${currentTheme?.border || 'border border-emerald-50'} p-6 sm:p-8`}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/50 via-white to-teal-50/40" aria-hidden />
      <div className="relative">

        {/* Error */}
        {formError && (
          <div className={`${currentTheme?.alertErrorBg || 'bg-red-50'} ${currentTheme?.alertErrorBorder || 'border border-red-300'} ${currentTheme?.alertErrorText || 'text-red-700'} px-4 py-3 rounded-xl mb-4 text-sm font-medium`} role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={e => (editingFee && !isEditAllowed) || (!editingFee && !isAddAllowed) ? e.preventDefault() : handleSubmit(e)} className="space-y-5">

          {/* ── Section 1: Student & Fee ── */}
          <div className={sectionBase}>
            <h3 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} flex items-center gap-2`}>
              <UserIcon className="h-5 w-5 text-emerald-600" /> Student & Fee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {/* Student search */}
              <div ref={studentRef} className="relative">
                <label htmlFor="studentIdInput" className={labelBase}>
                  <UserIcon className="h-4 w-4 text-emerald-600" /> Student <span className="text-red-500">*</span>
                </label>
                <input
                  id="studentIdInput"
                  name="studentId"
                  value={studentQuery || (fee.studentId ? (studentsForForm.find(s => s._id === fee.studentId) ? `${studentsForForm.find(s => s._id === fee.studentId).name} (${studentsForForm.find(s => s._id === fee.studentId).cnic})` : '') : '')}
                  onChange={handleStudentInputChange}
                  onFocus={() => setShowStudentDropdown(true)}
                  disabled={isViewMode}
                  autoComplete="off"
                  placeholder="Search by name or CNIC..."
                  className={inputBase}
                />
                {showStudentDropdown && !isViewMode && (
                  <ul className="absolute mt-1 max-h-48 overflow-auto rounded-xl border border-gray-200 bg-white z-50 w-full shadow-xl">
                    <li className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">Search by name or CNIC</li>
                    {studentsForForm.filter(s => {
                      const q = (studentQuery || '').toLowerCase();
                      if (!q) return true;
                      return (s.name || '').toLowerCase().includes(q) || (s.cnic || '').toLowerCase().includes(q);
                    }).map(student => (
                      <li key={student._id} onClick={() => handleSelectStudent(student)} className="px-3 py-2.5 hover:bg-emerald-50 cursor-pointer text-sm text-gray-800 transition">
                        {student.name} <span className="text-gray-400 text-xs">({student.cnic})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Paid By */}
              <div>
                <label htmlFor="paidBy" className={labelBase}>
                  <UserIcon className="h-4 w-4 text-emerald-600" /> Paid By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="paidBy" name="paidBy"
                  value={fee.paidBy} onChange={handleChange}
                  disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'}
                  placeholder="Name of payer"
                  className={isViewMode || fee.paymentMethod === 'Deposited Cash' ? inputDisabled : inputBase}
                />
              </div>

              {/* Total Fee */}
              <div>
                <label htmlFor="totalFee" className={labelBase}>
                  <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" /> Total Fee (Per Month) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" inputMode="numeric" pattern="\d*"
                  id="totalFee" name="totalFee"
                  value={fee.totalFee} onChange={handleChange}
                  disabled={true}
                  className={inputDisabled}
                />
              </div>

              {/* Admission Fee (only on add, and only if not already paid) */}
              {(!editingFee && !studentAdmissionFeeStatus) && (
                <div>
                  <label htmlFor="admissionFee" className={labelBase}>
                    <DocumentTextIcon className="h-4 w-4 text-emerald-600" /> Admission Fee
                  </label>
                  <input
                    type="text" inputMode="numeric" pattern="\d*"
                    id="admissionFee" name="admissionFee"
                    value={fee.admissionFee} onChange={handleChange}
                    readOnly={isViewMode || (!isEditAllowed && editingFee)}
                    className={isViewMode || (!isEditAllowed && editingFee) ? inputDisabled : inputBase}
                  />
                </div>
              )}

              {/* Received Amount */}
              <div>
                <label htmlFor="receivedAmount" className={labelBase}>
                  <BanknotesIcon className="h-4 w-4 text-emerald-600" /> Received Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" inputMode="numeric" pattern="\d*"
                  id="receivedAmount" name="receivedAmount"
                  value={formatReceivedForDisplay(fee.receivedAmount, fee.paymentMethod)}
                  onChange={handleChange}
                  disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'}
                  className={isViewMode || fee.paymentMethod === 'Deposited Cash' ? inputDisabled : inputBase}
                />
              </div>

              {/* Due Amount */}
              <div>
                <label htmlFor="dueAmount" className={labelBase}>
                  <CurrencyDollarIcon className="h-4 w-4 text-amber-500" /> Due Amount
                </label>
                <input
                  type="number" id="dueAmount" name="dueAmount"
                  value={fee.dueAmount} disabled
                  className={inputDisabled}
                />
              </div>

            </div>
          </div>

          {/* ── Section 2: Payment Info ── */}
          <div className={sectionBase}>
            <h3 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} flex items-center gap-2`}>
              <BanknotesIcon className="h-5 w-5 text-emerald-600" /> Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className={labelBase}>
                  <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" /> Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentMethod" name="paymentMethod"
                  value={fee.paymentMethod} onChange={handleChange}
                  disabled={isViewMode}
                  className={isViewMode ? inputDisabled : inputBase}
                >
                  <option value="">— Select Method —</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank / Wallet</option>
                  <option value="Deposited Cash">Deposited Cash (from advance)</option>
                  {isViewMode && fee.paymentMethod === 'Auto' && <option value="Auto">Auto (100% Discount)</option>}
                </select>
              </div>

              {/* Bank / Wallet Account — shown only when paymentMethod === 'Bank' */}
              {fee.paymentMethod === 'Bank' && (
                <div>
                  <label htmlFor="bankAccount" className={labelBase}>
                    <BanknotesIcon className="h-4 w-4 text-emerald-600" /> Bank / Wallet Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bankAccount"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    disabled={isViewMode || bankAccountsLoading}
                    required
                    className={isViewMode ? inputDisabled : inputBase}
                  >
                    <option value="">{bankAccountsLoading ? 'Loading accounts...' : '— Select account —'}</option>
                    {bankAccountOptions.map(acc => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}{acc.accountNumber ? ` (${acc.accountNumber})` : ''}
                      </option>
                    ))}
                  </select>
                  {bankAccountOptions.length === 0 && !bankAccountsLoading && (
                    <p className="text-xs text-amber-600 mt-1">
                      No active accounts configured. Ask admin to add accounts in Accounts & Wallets.
                    </p>
                  )}
                </div>
              )}

              {/* Received By */}
              <div>
                <label htmlFor="receivedBy" className={labelBase}>
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" /> Received By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="receivedBy" name="receivedBy"
                  value={fee.receivedBy} onChange={handleChange}
                  disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'}
                  placeholder="Staff name"
                  className={isViewMode || fee.paymentMethod === 'Deposited Cash' ? inputDisabled : inputBase}
                />
              </div>

              {/* Received Date */}
              <div>
                <label htmlFor="receivedDate" className={labelBase}>
                  <CalendarDaysIcon className="h-4 w-4 text-emerald-600" /> Received Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date" id="receivedDate" name="receivedDate"
                  value={fee.receivedDate} onChange={handleChange}
                  disabled={isViewMode}
                  className={isViewMode ? inputDisabled : inputBase}
                />
              </div>

            </div>
          </div>

          {/* ── Section 3: Period ── */}
          <div className={sectionBase}>
            <h3 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} flex items-center gap-2`}>
              <CalendarDaysIcon className="h-5 w-5 text-emerald-600" /> Fee Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {/* Month */}
              <div>
                <label htmlFor="month" className={labelBase}>
                  <CalendarDaysIcon className="h-4 w-4 text-emerald-600" /> Month <span className="text-red-500">*</span>
                </label>
                <select id="month" name="month" value={fee.month} onChange={handleChange} disabled={isViewMode} className={isViewMode ? inputDisabled : inputBase}>
                  <option value="">Select Month</option>
                  {months.map(monthName => (
                    <option key={monthName} value={monthName}>{monthName}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className={labelBase}>
                  <CalendarDaysIcon className="h-4 w-4 text-emerald-600" /> Year <span className="text-red-500">*</span>
                </label>
                <select id="year" name="year" value={fee.year} onChange={handleChange} disabled={isViewMode} className={isViewMode ? inputDisabled : inputBase}>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* ── Section 4: Student Financials ── */}
          <div className={sectionBase}>
            <h3 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} flex items-center gap-2`}>
              <DocumentTextIcon className="h-5 w-5 text-emerald-600" /> Student Financials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {/* Deposited Amount */}
              <div>
                <label htmlFor="depositedAmountDisplay" className={labelBase}>
                  <BanknotesIcon className="h-4 w-4 text-emerald-600" />Deposited Amount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text" id="depositedAmountDisplay"
                    value={`PKR ${parseFloat(studentDepositedAmount)}`}
                    disabled
                    className={`flex-1 ${inputDisabled} font-bold`}
                  />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => {
                        const input = prompt('Enter amount to deposit:');
                        const amount = parseFloat(input);
                        if (!isNaN(amount) && amount > 0) {
                          const newDeposit = studentDepositedAmount + amount;
                          setStudentDepositedAmount(newDeposit);
                          updateStudentFinancials(fee.studentId, { depositedAmount: newDeposit, otherDues: studentOtherDues });
                        }
                      }}
                      className={`h-10 px-3 rounded-lg text-sm font-semibold transition ${currentTheme?.btnSecondaryBg || 'bg-emerald-50'} ${currentTheme?.btnSecondaryText || 'text-emerald-700'} border ${currentTheme?.btnSecondaryBorder || 'border-emerald-200'} hover:bg-emerald-100 whitespace-nowrap`}
                    >
                      + Deposit
                    </button>
                  )}
                </div>
              </div>

              {/* Other Dues */}
              <div>
                <label htmlFor="otherDuesDisplay" className={labelBase}>
                  <CurrencyDollarIcon className="h-4 w-4 text-amber-500" /> Student Other Dues
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text" id="otherDuesDisplay"
                    value={`PKR ${parseFloat(studentOtherDues)}`}
                    disabled
                    className={`flex-1 ${inputDisabled} font-bold`}
                  />
                  {!isViewMode && studentOtherDues > 0 && (
                    <button
                      type="button"
                      onClick={handleClearOtherDues}
                      className="h-10 px-3 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition whitespace-nowrap"
                      title="Clear Other Dues using Deposited Amount"
                    >
                      <MinusCircleIcon className="h-4 w-4 inline mr-1" /> Clear
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── Section 5: Bill Screenshot ── */}
          <div className={sectionBase}>
            <h3 className={`text-sm font-bold ${currentTheme?.title || 'text-gray-800'} flex items-center gap-2`}>
              <DocumentTextIcon className="h-5 w-5 text-emerald-600" /> Bill Screenshot (Optional)
            </h3>
            {!isViewMode && (
              <input
                type="file" id="billScreenshot" name="billScreenshot"
                onChange={handleFileChange}
                className={`block w-full text-sm ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} rounded-xl cursor-pointer ${currentTheme?.inputBg || 'bg-gray-50'} focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
              />
            )}
            {(fee.billScreenshotUrl || selectedFile) && (
              <div className="mt-3 flex flex-col items-start gap-2">
                <p className="text-xs text-gray-500 font-medium">Current Screenshot:</p>
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : `${backendBaseUrl}${fee.billScreenshotUrl}`}
                  alt="Bill Screenshot"
                  className="h-32 w-auto object-cover rounded-xl border-2 border-emerald-200 shadow-md"
                  onError={e => { e.target.onerror = null; e.target.src = '/images/no-image-available.png'; }}
                />
                {isViewMode && fee.billScreenshotUrl && (
                  <a href={`${backendBaseUrl}${fee.billScreenshotUrl}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-sm font-medium">
                    View Full Image
                  </a>
                )}
                {!isViewMode && fee.billScreenshotUrl && (
                  <button type="button" onClick={() => { setFee(prev => ({ ...prev, billScreenshotUrl: '' })); setSelectedFile(null); }} className="text-red-600 hover:text-red-800 text-sm font-medium transition">
                    Clear Image
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Footer Actions ── */}
          <div className={`pt-4 border-t ${currentTheme?.border || 'border-gray-200'} flex flex-col sm:flex-row justify-end gap-3`}>
            {isViewMode && (
              <>
                <button
                  type="button" onClick={handleDownloadReceiptPdf}
                  className={`flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'}`}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" /> Download PDF
                </button>
                <button
                  type="button" onClick={handlePrintReceipt}
                  className={`flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'}`}
                >
                  <PrinterIcon className="h-5 w-5" /> Print Receipt
                </button>
              </>
            )}
            {!isViewMode && (
              <button
                type="submit" onClick={handleSubmit}
                disabled={(editingFee && !isEditAllowed) || (!editingFee && !isAddAllowed)}
                className={`flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:from-green-700 hover:to-emerald-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CheckCircleIcon className="h-5 w-5" />
                {editingFee ? 'Update Fee' : 'Add Fee Record'}
              </button>
            )}
            <button
              type="button" onClick={onClose}
              className={`flex items-center justify-center h-12 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} border-2 ${currentTheme?.btnSecondaryBorder || 'border-gray-200'} hover:border-gray-300`}
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
          </div>

        </form>
      </div>
      <DuplicateFeeModal isOpen={duplicateModalOpen} onClose={() => setDuplicateModalOpen(false)} message={duplicateMessage} />
    </div>
  );
};

export default FeeForm;
