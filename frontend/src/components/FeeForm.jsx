// src/components/FeeForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon, PrinterIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');
  const backendBaseUrl = 'http://localhost:5000';

  const [studentDepositedAmount, setStudentDepositedAmount] = useState(0);
  const [studentOtherDues, setStudentOtherDues] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditAllowed, setIsEditAllowed] = useState(false);
  const [isAddAllowed, setIsAddAllowed] = useState(false);
  const [studentAdmissionFeeStatus, setStudentAdmissionFeeStatus] = useState(false); 

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
  // Newly added useEffect hook
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    let user = null;
    if (userInfo) {
      try {
        user = JSON.parse(userInfo);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user info from localStorage", e);
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
        setFee(prev => ({
          ...prev,
          totalFee: selectedStudent.feePerMonth !== undefined ? selectedStudent.feePerMonth.toString() : ''
        }));
        setStudentDepositedAmount(selectedStudent.depositedAmount || 0);
        setStudentOtherDues(selectedStudent.otherDues || 0);
        setStudentAdmissionFeeStatus(selectedStudent.admissionFeeStatus); 
      } else {
        setFee(prev => ({ ...prev, totalFee: '' }));
        setStudentDepositedAmount(0);
        setStudentOtherDues(0);
        setStudentAdmissionFeeStatus(false);
      }
    } else if (!fee.studentId && !editingFee) {
      setFee(prev => ({ ...prev, totalFee: '' }));
      setStudentDepositedAmount(0);
      setStudentOtherDues(0);
      setStudentAdmissionFeeStatus(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'paymentMethod') {
      setFee(prev => ({ ...prev, [name]: value }));

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
          receivedAmount: calculatedReceivedAmount.toFixed(2),
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
      setFee(prev => ({ ...prev, [name]: value }));
    }

  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
  };


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
    // Form validation
    if (!fee.studentId || !fee.paidBy || !fee.receivedAmount || !fee.month || !fee.year || !fee.receivedDate || !fee.receivedBy || !fee.paymentMethod) {
      setFormError('Please fill in all required fields (Student, Paid By, Received Amount, Month, Year, Received Date, Received By, Payment Method).');
      return;
    }
    if (isNaN(parseFloat(fee.totalFee)) || parseFloat(fee.totalFee) <= 0) {
      setFormError('Total Fee must be a positive number (auto-populated based on student). Please select a student with a valid fee.');
      return;
    }
    if (isNaN(parseFloat(fee.receivedAmount)) || parseFloat(fee.receivedAmount) < 0) {
      setFormError('Received Amount must be a non-negative number.');
      return;
    }
    // Validation: Prevent receivedAmount from exceeding totalFee for non-Deposited Cash methods
    if (fee.paymentMethod !== 'Deposited Cash' && !fee.admissionFee>0 && parseFloat(fee.receivedAmount) > parseFloat(fee.totalFee)) {
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
    return 'Add New Fee Record';
  };

  const handleDownloadReceiptPdf = () => {
    const doc = new jsPDF({ format: 'a4' }); // A4 size

    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    const studentName = selectedStudent ? selectedStudent.name : '-';
    const studentCnic = selectedStudent ? selectedStudent.cnic : '-';
    const studentClassOrDegree = selectedStudent
      ? (selectedStudent.class === 'Class'
        ? `${selectedStudent.classNumber} Class`
        : `${selectedStudent.degreeName} (Semester ${selectedStudent.semester})`)
      : '-';

    const savePDF = () => {
      const filename = `${studentName.replace(/\s/g, '_')}_Fee_Receipt_${fee.month}_${fee.year}.pdf`;
      doc.save(filename);
    };

    const drawMiniReceipt = (xStart, yStart) => {
      let yPos = yStart;

      // Logo
      const logo = new Image();
      logo.src = '/default-avatar.jpg'; // public path logo

      logo.onload = () => {
        doc.addImage(logo, 'JPEG', xStart, yPos, 15, 15); // logo top-right of mini receipt

        // Institute Info
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Bright Future Institute', xStart + 17, yPos + 5);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('123 Education St, Knowledge City', xStart + 17, yPos + 10);
        doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', xStart + 17, yPos + 14);

        // Divider
        doc.line(xStart, yPos + 18, xStart + 80, yPos + 18);

        // Title
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Fee Receipt', xStart + 40, yPos + 24, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, xStart, yPos + 29);

        // Section 1: Student Info
        yPos += 34;
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text('Student Information', xStart, yPos);
        yPos += 4;
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        doc.text(`Name:`, xStart + 5, yPos);
        doc.text(`${studentName}`, xStart + 40, yPos);
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
        doc.line(xStart, yPos, xStart + 80, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');
        const addField = (label, value) => {
          doc.text(`${label}`, xStart + 5, yPos);
          doc.text(`${value}`, xStart + 50, yPos);
          yPos += 4;
        };

        addField('Total Fee:', `PKR ${parseFloat(fee.totalFee).toFixed(2)}`);
        addField('Received Amount:', `PKR ${parseFloat(fee.receivedAmount).toFixed(2)}`);
        addField('Due Amount:', `PKR ${parseFloat(fee.dueAmount).toFixed(2)}`);
        addField('Paid Month:', fee.month);
        addField('Paid Year:', fee.year);
        addField('Received Date:', new Date(fee.receivedDate).toLocaleDateString());
        addField('Paid By:', fee.paidBy);
        addField('Received By:', fee.receivedBy);
        addField('Payment Method:', fee.paymentMethod);

        // Add Deposited Amount and Other Dues from student (if available)
        if (selectedStudent) {
          addField('Deposited Amount:', `PKR ${parseFloat(selectedStudent.depositedAmount || 0).toFixed(2)}`);
          addField('Other Dues:', `PKR ${parseFloat(selectedStudent.otherDues || 0).toFixed(2)}`);
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

    // Draw in top-left quadrant for now
    drawMiniReceipt(10, 10); // (xStart, yStart)
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
    const studentClassOrDegree = selectedStudent ? (selectedStudent.class === 'Class' ? `${selectedStudent.classNumber} Class` : `${selectedStudent.degreeName} (Semester ${selectedStudent.semester})`) : '-';

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
              <strong>Bright Future Institute</strong><br>
              123 Education St, Knowledge City<br>
              Phone: (042) 1234567<br>Email: info@bfi.edu.pk
            </div>
          </div>

          <div class="title">Fee Receipt</div>
          <div class="generated-date">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div class="divider"></div>

          <div class="info-section">
            <strong>Student Information</strong>
            <div class="info-row"><label>Name:</label><span>${studentName}</span></div>
            <div class="info-row"><label>CNIC:</label><span>${studentCnic}</span></div>
            <div class="info-row"><label>Class/Degree:</label><span>${studentClassOrDegree}</span></div>
          </div>

          <div class="info-section">
            <strong>Fee Details</strong>
            <div class="info-row"><label>Total Fee:</label><span>PKR ${parseFloat(fee.totalFee).toFixed(2)}</span></div>
            <div class="info-row"><label>Received Amount:</label><span>PKR ${parseFloat(fee.receivedAmount).toFixed(2)}</span></div>
            <div class="info-row"><label>Due Amount:</label><span>PKR ${parseFloat(fee.dueAmount).toFixed(2)}</span></div>
            <div class="info-row"><label>Paid Month:</label><span>${fee.month}</span></div>
            <div class="info-row"><label>Paid Year:</label><span>${fee.year}</span></div>
            <div class="info-row"><label>Received Date:</label><span>${new Date(fee.receivedDate).toLocaleDateString()}</span></div>
            <div class="info-row"><label>Paid By:</label><span>${fee.paidBy}</span></div>
            <div class="info-row"><label>Received By:</label><span>${fee.receivedBy}</span></div>
            <div class="info-row"><label>Payment Method:</label><span>${fee.paymentMethod}</span></div>
            <div class="info-row"><label>Deposited Amount:</label><span>PKR ${parseFloat(studentDepositedAmount).toFixed(2)}</span></div>
            <div class="info-row"><label>Other Dues:</label><span>PKR ${parseFloat(studentOtherDues).toFixed(2)}</span></div>
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


  return (
    // Main container for the form, now a flex column with responsive width and padding
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto relative flex flex-col h-full">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-200 p-1 rounded-full hover:bg-gray-100"
        title="Close"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-green-700 mt-2 sm:mt-0">{getTitle()}</h2>
      <hr className="mb-4 border-green-200" />

      {/* Form Error */}
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
          {formError}
        </div>
      )}

      {/* Scrollable Form Content */}
      {/* <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar"> */}
      <form onSubmit={e => (editingFee && !isEditAllowed) || (!editingFee && !isAddAllowed) ? e.preventDefault() : handleSubmit(e)} className="p-4 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Student */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student<span className="text-red-500">*</span></label>
            <select id="studentId" name="studentId" value={fee.studentId} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out">
              <option value="">Select Student</option>
              {studentsForForm.map(student => (
                <option key={student._id} value={student._id}>{student.name} ({student.cnic})</option>
              ))}
            </select>
          </div>
          {/* Paid By */}
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">Paid By<span className="text-red-500">*</span></label>
            <input type="text" id="paidBy" name="paidBy" value={fee.paidBy} onChange={handleChange} disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
          </div>
          {/* Total Fee (Auto-populated and disabled) */}
          <div>
            <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700 mb-1">Total Fee (Per Month)<span className="text-red-500">*</span></label>
            <input
              type="number"
              id="totalFee"
              name="totalFee"
              value={fee.totalFee}
              onChange={handleChange}
              disabled={true}
              className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2.5 text-gray-700 cursor-not-allowed"
            />
          </div>
          {(!editingFee && !studentAdmissionFeeStatus) && (
            <div>
              <label htmlFor="admissionFee" className="block text-sm font-medium text-gray-700 mb-1">Admission Fee</label>
              <input
                type="number"
                id="admissionFee"
                name="admissionFee"
                value={fee.admissionFee}
                onChange={handleChange}
                readOnly={isViewMode || !isEditAllowed && editingFee}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${isViewMode || !isEditAllowed && editingFee ? 'bg-gray-100' : ''}`}
              />
            </div>
          )}
          {/* Received Amount */}
          <div>
            <label htmlFor="receivedAmount" className="block text-sm font-medium text-gray-700 mb-1">Received Amount<span className="text-red-500">*</span></label>
            <input type="number" id="receivedAmount" name="receivedAmount" value={fee.receivedAmount} onChange={handleChange} disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
          </div>
          {/* Due Amount (Display only) */}
          <div>
            <label htmlFor="dueAmount" className="block text-sm font-medium text-gray-700 mb-1">Due Amount</label>
            <input type="number" id="dueAmount" name="dueAmount" value={fee.dueAmount.toFixed(2)} disabled className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2.5 text-gray-700 cursor-not-allowed" />
          </div>
          {/* Month */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month<span className="text-red-500">*</span></label>
            <select id="month" name="month" value={fee.month} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out">
              <option value="">Select Month</option>
              {months.map(monthName => (
                <option key={monthName} value={monthName}>{monthName}</option>
              ))}
            </select>
          </div>
          {/* Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year<span className="text-red-500">*</span></label>
            <select id="year" name="year" value={fee.year} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out">
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* Received Date */}
          <div>
            <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700 mb-1">Received Date<span className="text-red-500">*</span></label>
            <input type="date" id="receivedDate" name="receivedDate" value={fee.receivedDate} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
          </div>
          {/* Received By */}
          <div>
            <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-700 mb-1">Received By<span className="text-red-500">*</span></label>
            <input type="text" id="receivedBy" name="receivedBy" value={fee.receivedBy} onChange={handleChange} disabled={isViewMode || fee.paymentMethod === 'Deposited Cash'} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
          </div>
          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method<span className="text-red-500">*</span></label>
            <select id="paymentMethod" name="paymentMethod" value={fee.paymentMethod} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out">
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Online Wallet">Online Wallet</option>
              <option value="Deposited Cash">Deposited Cash (from advance)</option> {/* New option */}
            </select>
          </div>

          {/* Display Deposited Amount */}
          <div className="sm:col-span-1">
            <label htmlFor="depositedAmountDisplay" className="block text-sm font-medium text-gray-700 mb-1">Student Deposited Amount</label>
            <input
              type="text"
              id="depositedAmountDisplay"
              value={`PKR ${parseFloat(studentDepositedAmount).toFixed(2)}`}
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2.5 text-gray-700 font-bold cursor-not-allowed"
            />
            <button
              onClick={() => {
                const input = prompt("Enter amount to deposit:");
                const amount = parseFloat(input);
                if (!isNaN(amount) && amount > 0) {
                  const newDeposit = studentDepositedAmount + amount;
                  setStudentDepositedAmount(newDeposit);
                  updateStudentFinancials(fee.studentId, {
                    depositedAmount: newDeposit,
                    otherDues: studentOtherDues
                  });
                }
              }}
              className="ml-2 text-blue-500 underline text-sm"
            >
              + Deposit
            </button>

          </div>

          {/* Display Other Dues with Clear Button */}
          <div className="sm:col-span-1">
            <label htmlFor="otherDuesDisplay" className="block text-sm font-medium text-gray-700 mb-1">Student Other Dues</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="otherDuesDisplay"
                value={`PKR ${parseFloat(studentOtherDues).toFixed(2)}`}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2.5 text-gray-700 font-bold cursor-not-allowed"
              />
              {!isViewMode && studentOtherDues > 0 && (
                <button
                  type="button"
                  onClick={handleClearOtherDues}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200 shadow-md flex items-center justify-center"
                  title="Clear Other Dues using Deposited Amount"
                >
                  <MinusCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Bill Screenshot */}
          <div className="sm:col-span-2"> {/* This div spans 2 columns on small screens and up */}
            <label htmlFor="billScreenshot" className="block text-sm font-medium text-gray-700 mb-1">Bill Screenshot</label>
            {!isViewMode ? (
              <input type="file" id="billScreenshot" name="billScreenshot" onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            ) : null}

            {(fee.billScreenshotUrl || selectedFile) && (
              <div className="mt-4 flex flex-col items-center sm:items-start">
                <p className="text-sm text-gray-500 mb-2">Current Screenshot:</p>
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : `${backendBaseUrl}${fee.billScreenshotUrl}`}
                  alt="Bill Screenshot"
                  className="h-32 w-auto object-cover rounded-md border-4 border-green-200 shadow-md"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/no-image-available.png'; }}
                />
                {isViewMode && fee.billScreenshotUrl && (
                  <a
                    href={`${backendBaseUrl}${fee.billScreenshotUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
                  >
                    View Full Image
                  </a>
                )}
                {!isViewMode && fee.billScreenshotUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
        {isViewMode && (
          <>
            <button
              type="button"
              onClick={handleDownloadReceiptPdf}
              className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
              title="Download Fee Receipt as PDF"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 shadow-md w-full sm:w-auto"
              title="Print Fee Receipt"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print Receipt
            </button>
          </>
        )}
        {!isViewMode && (
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={(editingFee && !isEditAllowed) || (!editingFee && !isAddAllowed)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
          >
            {editingFee ? 'Update Fee' : 'Add Fee'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-md w-full sm:w-auto"
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  );
};

export default FeeForm;
