// src/components/StaffForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import QRCode from 'qrcode'; // For generating QR code on frontend

const staffTypes = ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'];
const educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Other', 'None'];
const leaveTypes = ['Casual', 'Sick', 'Annual', 'Maternity', 'Paternity', 'Other']; // For reference, not directly in StaffForm

const StaffForm = ({ editingStaff, fetchStaff, onClose, isViewMode = false }) => {
  const initialState = {
    name: '',
    fatherName: '',
    staffType: '',
    cnic: '',
    contactNumber: '',
    email: '',
    address: '',
    dateOfJoining: '',
    salary: '',
    profilePictureUrl: '',
    highestEducationLevel: 'None',
    degrees: [], // Array of { degreeName, major, institution, yearCompleted }
    subjectsTaught: [], // Array of strings for teachers
    emergencyContact: '',
    bankAccountDetails: {
      bankName: '',
      accountNumber: '',
      iban: '',
    },
    qrCodeSecret: '', // Will be set from backend
  };
  const [staff, setStaff] = useState(initialState);
  const { currentTheme } = useTheme();
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isSelfEdit, setIsSelfEdit] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // State to hold the QR code data URL
  const backendBaseUrl = 'http://localhost:5000';

  // Multi-step pagination
  const steps = ['Personal', 'Education', 'Additional', 'Review'];
  const [currentStep, setCurrentStep] = useState(0);

  const validateStep = (stepIdx) => {
    const newFieldErrors = {};
    let ok = true;

    if (stepIdx === 0) {
      // Personal step validation
      ['name', 'staffType', 'contactNumber', 'dateOfJoining', 'salary', 'address', 'email', 'cnic'].forEach((f) => {
        if (!staff[f]) { newFieldErrors[f] = 'This field is required.'; ok = false; }
      });
      if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(staff.email || '')) {
        newFieldErrors.email = 'Please enter a valid email address.'; ok = false;
      }
      if (!/^\d{13}$/.test(staff.cnic || '')) {
        newFieldErrors.cnic = 'CNIC must be 13 digits.'; ok = false;
      }
      if (isNaN(parseFloat(staff.salary)) || parseFloat(staff.salary) <= 0) {
        newFieldErrors.salary = 'Salary must be a positive number.'; ok = false;
      }
    }

    if (stepIdx === 1) {
      // Education step validation - degrees must have required fields if added
      staff.degrees.forEach((degree, idx) => {
        if (!degree.degreeName || !degree.institution || !degree.yearCompleted) {
          newFieldErrors[`degrees[${idx}]`] = 'Degree name, institution, and year are required.';
          ok = false;
        }
      });
    }

    if (stepIdx === 2) {
      // Additional step - teaching info validation if teacher
      if (staff.staffType === 'Teacher' && staff.subjectsTaught.length === 0) {
        newFieldErrors.subjectsTaught = 'Please add at least one subject for teachers.';
        ok = false;
      }
    }

    setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
    if (!ok) setFormError('Please correct the errors before continuing.');
    return ok;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
      setFormError('');
    }
  };

  const goPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    setFormError('');
  };

  useEffect(() => {
    if (editingStaff) {
      setStaff({
        ...editingStaff,
        dateOfJoining: editingStaff.dateOfJoining ? new Date(editingStaff.dateOfJoining).toISOString().split('T')[0] : '',
        salary: editingStaff.salary !== undefined ? editingStaff.salary.toString() : '',
        // Ensure nested objects/arrays are correctly initialized
        degrees: editingStaff.degrees || [],
        subjectsTaught: editingStaff.subjectsTaught || [],
        bankAccountDetails: editingStaff.bankAccountDetails || { bankName: '', accountNumber: '', iban: '' },
        profilePictureUrl: editingStaff.profilePictureUrl || '',
        qrCodeSecret: editingStaff.qrCodeSecret || '',
      });
      setProfilePictureFile(null); // Clear file input when editing
      if (editingStaff.qrCodeSecret) {
        QRCode.toDataURL(editingStaff.qrCodeSecret)
          .then(url => setQrCodeDataUrl(url))
          .catch(err => console.error("Error generating QR code for existing staff:", err));
      } else {
        setQrCodeDataUrl('');
      }
    } else {
      setStaff(initialState);
      setProfilePictureFile(null);
      setQrCodeDataUrl('');
    }
    setFormError('');
    setFieldErrors({});
  }, [editingStaff]);

  // Load current user and detect if editing own profile
  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
    let user = null;
    if (userInfo) {
      try {
        user = JSON.parse(userInfo);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse userInfo', e);
      }
    }
    if (user && editingStaff) {
      // If the logged in user's profileId matches the editing staff _id and user is not admin, treat as self-edit
      const self = (String(user.profileId) === String(editingStaff._id)) && user.role !== 'admin';
      setIsSelfEdit(!!self);
    } else {
      setIsSelfEdit(false);
    }
  }, [editingStaff]);

  // Generate QR code for newly created staff if secret is available
  useEffect(() => {
    if (!editingStaff && staff.qrCodeSecret) {
      QRCode.toDataURL(staff.qrCodeSecret)
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error("Error generating QR code for new staff:", err));
    }
  }, [staff.qrCodeSecret, editingStaff]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bankAccountDetails.')) {
      const field = name.split('.')[1];
      setStaff(prev => ({
        ...prev,
        bankAccountDetails: {
          ...prev.bankAccountDetails,
          [field]: value
        }
      }));
    } else {
      // sanitize digit-only fields
      const digitOnlyFields = ['cnic', 'contactNumber', 'emergencyContact', 'salary'];
      let newVal = value;
      if (digitOnlyFields.includes(name)) {
        newVal = String(value || '').replace(/\D/g, '');
      }
      // enforce maxlength for cnic/contact
      if (name === 'cnic') newVal = newVal.slice(0, 13);
      if (name === 'contactNumber' || name === 'emergencyContact') newVal = newVal.slice(0, 11);

      setStaff(prev => ({ ...prev, [name]: newVal }));
    }
    setFieldErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    setFormError('');
  };

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
    setStaff(prev => ({ ...prev, profilePictureUrl: '' })); // Clear existing URL if new file selected
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    setStaff(prev => ({ ...prev, profilePictureUrl: '' }));
  };

  // --- Degrees Array Handlers ---
  const handleDegreeChange = (index, e) => {
    const { name, value } = e.target;
    const newDegrees = [...staff.degrees];
    newDegrees[index] = { ...newDegrees[index], [name]: value };
    setStaff(prev => ({ ...prev, degrees: newDegrees }));
  };

  const addDegree = () => {
    setStaff(prev => ({
      ...prev,
      degrees: [...prev.degrees, { degreeName: '', major: '', institution: '', yearCompleted: '' }]
    }));
  };

  const removeDegree = (index) => {
    const newDegrees = staff.degrees.filter((_, i) => i !== index);
    setStaff(prev => ({ ...prev, degrees: newDegrees }));
  };

  // --- Subjects Taught Array Handlers ---
  const handleSubjectChange = (index, e) => {
    const newSubjects = [...staff.subjectsTaught];
    newSubjects[index] = e.target.value;
    setStaff(prev => ({ ...prev, subjectsTaught: newSubjects }));
  };

  const addSubject = () => {
    setStaff(prev => ({
      ...prev,
      subjectsTaught: [...prev.subjectsTaught, '']
    }));
  };

  const removeSubject = (index) => {
    const newSubjects = staff.subjectsTaught.filter((_, i) => i !== index);
    setStaff(prev => ({ ...prev, subjectsTaught: newSubjects }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    const newFieldErrors = {};
    let hasError = false;

    // Basic validation
    const requiredFields = ['name', 'staffType', 'contactNumber', 'address', 'dateOfJoining', 'salary', 'email', 'cnic'];
    requiredFields.forEach(field => {
      if (!staff[field]) {
        newFieldErrors[field] = 'This field is required.';
        hasError = true;
      }
    });

    if (staff.contactNumber && !/^\d{11}$/.test(staff.contactNumber)) {
      newFieldErrors.contactNumber = 'Contact number must be 11 digits.';
      hasError = true;
    }
    if (!/^\d{13}$/.test(staff.cnic || '')) {
      newFieldErrors.cnic = 'CNIC must be 13 digits.';
      hasError = true;
    }
    if (staff.emergencyContact && !/^\d{11}$/.test(staff.emergencyContact)) {
      newFieldErrors.emergencyContact = 'Emergency contact must be 11 digits.';
      hasError = true;
    }
    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(staff.email || '')) {
      newFieldErrors.email = 'Please enter a valid email address.';
      hasError = true;
    }
    if (!/^\d+$/.test(String(staff.salary || '')) || parseInt(staff.salary || '0', 10) < 0) {
      newFieldErrors.salary = 'Salary must be a non-negative integer.';
      hasError = true;
    }

    // Conditional validation for Teacher subjects
    if (staff.staffType === 'Teacher' && staff.subjectsTaught.length === 0) {
      newFieldErrors.subjectsTaught = 'Teachers must have at least one subject.';
      hasError = true;
    }
    if (staff.staffType === 'Teacher' && staff.subjectsTaught.some(sub => !sub.trim())) {
      newFieldErrors.subjectsTaught = 'All subjects must be filled.';
      hasError = true;
    }

    // Degrees validation
    staff.degrees.forEach((degree, index) => {
      if (!degree.degreeName || !degree.institution || !degree.yearCompleted) {
        newFieldErrors[`degrees[${index}]`] = 'Degree name, institution, and year are required.';
        hasError = true;
      }
      if (isNaN(parseInt(degree.yearCompleted)) || parseInt(degree.yearCompleted) < 1900 || parseInt(degree.yearCompleted) > new Date().getFullYear() + 5) {
        newFieldErrors[`degrees[${index}]`] = 'Invalid year completed.';
        hasError = true;
      }
    });


    setFieldErrors(newFieldErrors);

    if (hasError) {
      setFormError('Please correct the errors in the form before submitting.');
      return;
    }

    const formData = new FormData();

    // Append all basic staff fields
    for (const key in staff) {
      if (key !== 'profilePictureUrl' && key !== 'degrees' && key !== 'subjectsTaught' && key !== 'bankAccountDetails' && staff[key] !== null) {
        formData.append(key, staff[key]);
      }
    }

    // Append profile picture file or its URL
    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    } else if (staff.profilePictureUrl) {
      formData.append('profilePictureUrl', staff.profilePictureUrl);
    } else {
      formData.append('profilePictureUrl', '');
    }

    // Append degrees and subjectsTaught as JSON strings
    formData.append('degrees', JSON.stringify(staff.degrees));
    formData.append('subjectsTaught', JSON.stringify(staff.subjectsTaught));
    formData.append('bankAccountDetails', JSON.stringify(staff.bankAccountDetails));


    try {
      let res;
      if (editingStaff) {
        res = await api.put(`/staff/${editingStaff._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/staff', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // If new staff created, set the QR code data URL
        if (res.data.qrCodeDataUrl) {
          setQrCodeDataUrl(res.data.qrCodeDataUrl);
          setStaff(prev => ({ ...prev, qrCodeSecret: res.data.staff.qrCodeSecret })); // Store the secret
        }
      }
      fetchStaff(); // Refresh staff list
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Failed to save staff:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key].message;
        }
        setFieldErrors(prev => ({ ...prev, ...newErrors }));
        setFormError('Failed to save staff: Please correct the highlighted fields.');
      } else {
        setFormError('Failed to save staff: ' + errorMessage);
      }
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'Staff Details';
    if (editingStaff) return 'Edit Staff Member';
    return 'Add New Staff Member';
  };

  const handleDownloadPdf = async () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const columnGap = 18;
    const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;
    let yPos = 10;

    // --- Gradient Hero Header ---
    const headerHeight = 55;
    const steps = 50;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(16 + (20 - 16) * ratio);
      const g = Math.round(185 + (184 - 185) * ratio);
      const b = Math.round(129 + (166 - 129) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, (i * headerHeight) / steps, pageWidth, headerHeight / steps + 1, 'F');
    }

    doc.setFillColor(255, 255, 255);
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.circle(pageWidth * 0.18, 12, 35, 'F');
    doc.circle(pageWidth * 0.82, headerHeight * 0.6, 25, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Logo circle (placeholder if no logo)
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 12, 22, 14, 'F');

    // Institute logo (reuse student logo)
    const logo = new Image();
    logo.src = './Jamia Logo.png';
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
    doc.text('STAFF DETAILS', pageWidth - margin, 42, { align: 'right' });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.setGState(new doc.GState({ opacity: 0.3 }));
    doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8);
    doc.setGState(new doc.GState({ opacity: 1 }));

    yPos = headerHeight + 6;
    doc.setTextColor(0, 0, 0);

    // Timestamp badge
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Profile picture with border
    if (staff.profilePictureUrl) {
      try {
        const img = new Image();
        img.src = `${backendBaseUrl}${staff.profilePictureUrl}`;
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 42;
            const imgHeight = (img.height * imgWidth) / img.width;
            const xOffset = (pageWidth - imgWidth) / 2;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.roundedRect(xOffset - 2, yPos - 2, imgWidth + 4, imgHeight + 4, 2, 2);
            doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
            resolve();
          };
          img.onerror = () => resolve();
        });
      } catch {
        yPos += 8;
      }
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      yPos += 10;
    }

    // Helpers
    const ensureSpace = (extra = 12) => {
      if (yPos + extra > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    const addSectionHeader = (title) => {
      ensureSpace(15);
      doc.setFillColor(240, 248, 242);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 167, 69);
      doc.text(title, margin + 3, yPos + 5.5);
      doc.setTextColor(0, 0, 0);
      yPos += 13;
    };

    const addTwoFields = (label1, value1, label2, value2) => {
      ensureSpace(10);
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

    const addFullWidthField = (label, value) => {
      ensureSpace(10);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(`${label}:`, margin, yPos);
      const labelWidth = doc.getTextWidth(`${label}:`);
      doc.setFontSize(9.5);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(value || 'N/A', pageWidth - margin * 2 - labelWidth - 5);
      doc.text(lines, margin + labelWidth + 3, yPos);
      yPos += lines.length * 6 + 3;
    };

    const addList = (items, label) => {
      ensureSpace(10);
      doc.setFontSize(9.5);
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, margin, yPos);
      yPos += 6;
      if (!items || items.length === 0) {
        doc.setFont(undefined, 'normal');
        doc.text('Not available', margin + 3, yPos);
        yPos += 6;
        return;
      }
      doc.setFont(undefined, 'normal');
      items.forEach((item) => {
        ensureSpace(6);
        doc.text(`• ${item}`, margin + 3, yPos);
        yPos += 5;
      });
    };

    // Sections
    addSectionHeader('BASIC INFORMATION');
    addTwoFields('Name', staff.name, 'Staff Type', staff.staffType);
    addTwoFields("Father's Name", staff.fatherName, 'CNIC', staff.cnic);
    addTwoFields('Contact Number', staff.contactNumber, 'Email', staff.email);
    addTwoFields('Date of Joining', staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString() : 'N/A', 'Salary', staff.salary ? `PKR ${parseFloat(staff.salary).toLocaleString()}` : 'N/A');
    addTwoFields('Emergency Contact', staff.emergencyContact, '', '');
    addFullWidthField('Address', staff.address);

    addSectionHeader('EDUCATION DETAILS');
    addFullWidthField('Highest Education', staff.highestEducationLevel || 'Not specified');
    const degreeLines = (staff.degrees || []).map((degree) => {
      const parts = [degree.degreeName || 'Degree'];
      if (degree.major) parts.push(`Major: ${degree.major}`);
      if (degree.institution) parts.push(`Institute: ${degree.institution}`);
      if (degree.yearCompleted) parts.push(`Year: ${degree.yearCompleted}`);
      return parts.join(' | ');
    });
    addList(degreeLines, 'Degrees');

    if (staff.staffType === 'Teacher') {
      addSectionHeader('TEACHING INFORMATION');
      addList(staff.subjectsTaught, 'Subjects Taught');
    }

    // Always show Bank section to mirror form visibility
    if (!staff.bankAccountDetails) {
      staff.bankAccountDetails = { bankName: '', accountNumber: '', iban: '' };
    }
    addSectionHeader('BANK ACCOUNT DETAILS');
    addTwoFields('Bank Name', staff.bankAccountDetails.bankName, 'Account Number', staff.bankAccountDetails.accountNumber);
    addFullWidthField('IBAN', staff.bankAccountDetails.iban);

    // Footer
    const addFooter = (pageNum, totalPages) => {
      const footerY = pageHeight - 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text('Jamia Tul Mastwaar - Staff Details', margin, footerY);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      doc.setTextColor(0);
    };

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    doc.save(`${staff.name.replace(/\s/g, '_')}_Staff_Details.pdf`);
  };


  return (
    <div className="flex flex-col h-full p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100">
      {/* Header Section */}
      <div className="flex-shrink-0 relative mb-8">
        <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close">
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">{getTitle()}</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Complete the form below to add or update staff information</p>
        
        {/* Stepper for multi-step form */}
        {!isViewMode && (
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-teal-300" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, marginLeft: 'auto', marginRight: 'auto' }}></div>
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  idx < currentStep 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg ring-4 ring-green-200' 
                    : idx === currentStep 
                      ? 'bg-white border-4 border-green-500 text-green-600 shadow-lg ring-4 ring-green-200' 
                      : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                }`}>
                  {idx < currentStep ? '\u2713' : idx + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${idx <= currentStep ? 'text-green-600' : 'text-gray-400'}`}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {formError && (
          <div className={`${currentTheme.alertErrorBg || 'bg-red-100'} ${currentTheme.alertErrorBorder || 'border border-red-400'} ${currentTheme.alertErrorText || 'text-red-700'} px-4 py-3 rounded-lg relative mb-4 shadow-sm`} role="alert">
            {formError}
          </div>
        )}
      </div>

      {/* Scrollable Form Content Area */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Step 0: Personal Information */}
        <div className={currentStep === 0 || isViewMode ? 'animate-fade-in' : 'hidden'}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Profile Picture */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
              <label htmlFor="profilePicture" className="block text-sm font-bold text-gray-700 mb-2">Profile Picture</label>
              {!isViewMode && (
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-50 file:to-emerald-50 file:text-green-700 hover:file:from-green-100 hover:file:to-emerald-100 transition"
                />
              )}
              {(profilePictureFile || staff.profilePictureUrl) && (
                <div className="mt-3 relative w-48 h-48 border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                  <img src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : `${backendBaseUrl}${staff.profilePictureUrl}`} alt="Profile Preview" className="w-full h-full object-cover" />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className={`absolute top-2 right-2 ${currentTheme.btnDangerBg || 'bg-red-500'} ${currentTheme.btnDangerText || 'text-white'} rounded-full p-1.5 text-xs ${currentTheme.btnDangerHover || 'hover:bg-red-600'} transition-all shadow-md hover:shadow-lg active:scale-95`}
                      aria-label="Remove Profile Picture"
                    >
                      <MinusCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  {isViewMode && staff.profilePictureUrl && (
                    <a
                      href={`${backendBaseUrl}${staff.profilePictureUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-opacity-75 transition"
                    >
                      View Full
                    </a>
                  )}
                </div>
              )}
              {fieldErrors.profilePictureUrl && <p className="mt-1 text-sm text-red-600">{fieldErrors.profilePictureUrl}</p>}
            </div>

            {/* Basic Info Fields */}
            <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={staff.name} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
              </div>

              {/* Father's Name */}
              <div>
                <label htmlFor="fatherName" className="block text-sm font-bold text-gray-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={staff.fatherName}
                  onChange={handleChange}
                  placeholder="Father's Name"
                  readOnly={isViewMode}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.fatherName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fatherName}</p>}
              </div>

              {/* Staff Type */}
              <div>
                <label htmlFor="staffType" className="block text-sm font-bold text-gray-700 mb-2">Staff Type<span className="text-red-500">*</span></label>
                <select 
                  id="staffType" 
                  name="staffType" 
                  value={staff.staffType} 
                  onChange={handleChange} 
                  disabled={isViewMode || isSelfEdit} 
                  title={isSelfEdit ? 'You cannot change your role while editing your own profile.' : undefined}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="">Select Type</option>
                  {staffTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {fieldErrors.staffType && <p className="mt-1 text-sm text-red-600">{fieldErrors.staffType}</p>}
              </div>

              {/* CNIC */}
              <div>
                <label htmlFor="cnic" className="block text-sm font-bold text-gray-700 mb-2">CNIC <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={13}
                  placeholder="13 digits"
                  id="cnic" 
                  name="cnic" 
                  value={staff.cnic} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  required={!isViewMode}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
              </div>

              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-bold text-gray-700 mb-2">Contact Number<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={11}
                  placeholder="03XXXXXXXXX"
                  id="contactNumber" 
                  name="contactNumber" 
                  value={staff.contactNumber} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.contactNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.contactNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={staff.email} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  required={!isViewMode}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              {/* Date of Joining */}
              <div>
                <label htmlFor="dateOfJoining" className="block text-sm font-bold text-gray-700 mb-2">Date of Joining<span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  id="dateOfJoining" 
                  name="dateOfJoining" 
                  value={staff.dateOfJoining} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.dateOfJoining && <p className="mt-1 text-sm text-red-600">{fieldErrors.dateOfJoining}</p>}
              </div>

              {/* Salary */}
              <div>
                <label htmlFor="salary" className="block text-sm font-bold text-gray-700 mb-2">Salary (PKR)<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="e.g. 50000"
                  id="salary" 
                  name="salary" 
                  value={staff.salary} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.salary && <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>}
              </div>

              {/* Emergency Contact */}
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={11}
                  placeholder="Emergency contact (11 digits)"
                  id="emergencyContact" 
                  name="emergencyContact" 
                  value={staff.emergencyContact} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {fieldErrors.emergencyContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.emergencyContact}</p>}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">Address<span className="text-red-500">*</span></label>
                <textarea 
                  id="address" 
                  name="address" 
                  value={staff.address} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  rows="3" 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                ></textarea>
                {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Education Details */}
        <div className={currentStep === 1 || isViewMode ? 'animate-fade-in' : 'hidden'}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">Education Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Highest Education Level */}
            <div>
              <label htmlFor="highestEducationLevel" className="block text-sm font-bold text-gray-700 mb-2">Highest Education Level</label>
              <select 
                id="highestEducationLevel" 
                name="highestEducationLevel" 
                value={staff.highestEducationLevel} 
                onChange={handleChange} 
                disabled={isViewMode} 
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
              >
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {fieldErrors.highestEducationLevel && <p className="mt-1 text-sm text-red-600">{fieldErrors.highestEducationLevel}</p>}
            </div>
          </div>

          {/* Degrees List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-bold text-gray-700">Degrees</label>
              {!isViewMode && (
                <button 
                  type="button" 
                  onClick={addDegree} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg active:scale-95"
                >
                  Add Degree
                </button>
              )}
            </div>
            {staff.degrees.length === 0 && isViewMode && <p className="text-gray-500 text-sm">No degrees recorded.</p>}
            {staff.degrees.map((degree, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-6 border-2 border-gray-200 p-5 rounded-xl mb-4 relative bg-white shadow-sm hover:shadow-md transition">
                <div>
                  <label htmlFor={`degreeName-${index}`} className="block text-sm font-bold text-gray-700 mb-2">Degree Name<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id={`degreeName-${index}`} 
                    name="degreeName" 
                    value={degree.degreeName} 
                    onChange={(e) => handleDegreeChange(index, e)} 
                    readOnly={isViewMode} 
                    className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                  />
                  {fieldErrors[`degrees[${index}]`] && <p className="mt-1 text-sm text-red-600">{fieldErrors[`degrees[${index}]`]}</p>}
                </div>
                <div>
                  <label htmlFor={`major-${index}`} className="block text-sm font-bold text-gray-700 mb-2">Major</label>
                  <input 
                    type="text" 
                    id={`major-${index}`} 
                    name="major" 
                    value={degree.major} 
                    onChange={(e) => handleDegreeChange(index, e)} 
                    readOnly={isViewMode} 
                    className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label htmlFor={`institution-${index}`} className="block text-sm font-bold text-gray-700 mb-2">Institution<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id={`institution-${index}`} 
                    name="institution" 
                    value={degree.institution} 
                    onChange={(e) => handleDegreeChange(index, e)} 
                    readOnly={isViewMode} 
                    className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label htmlFor={`yearCompleted-${index}`} className="block text-sm font-bold text-gray-700 mb-2">Year Completed<span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    id={`yearCompleted-${index}`} 
                    name="yearCompleted" 
                    value={degree.yearCompleted} 
                    onChange={(e) => handleDegreeChange(index, e)} 
                    readOnly={isViewMode} 
                    className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
                {!isViewMode && (
                  <button 
                    type="button" 
                    onClick={() => removeDegree(index)} 
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                  >
                    <MinusCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Additional Information (Teaching + Bank Details) */}
        <div className={currentStep === 2 || isViewMode ? 'animate-fade-in' : 'hidden'}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">Additional Information</h3>
          
          {/* Teacher Specific Fields */}
          {staff.staffType === 'Teacher' && (
            <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Teaching Information</h4>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-bold text-gray-700">Subjects Taught</label>
                  {!isViewMode && (
                    <button 
                      type="button" 
                      onClick={addSubject} 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg active:scale-95"
                    >
                      Add Subject
                    </button>
                  )}
                </div>
                {staff.subjectsTaught.length === 0 && isViewMode && <p className="text-gray-500 text-sm">No subjects taught recorded.</p>}
                {staff.subjectsTaught.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={(e) => handleSubjectChange(index, e)} 
                      readOnly={isViewMode} 
                      placeholder={`Subject ${index + 1}`}
                      className={`flex-grow border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                    />
                    {!isViewMode && (
                      <button 
                        type="button" 
                        onClick={() => removeSubject(index)} 
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <MinusCircleIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                ))}
                {fieldErrors.subjectsTaught && <p className="mt-2 text-sm text-red-600">{fieldErrors.subjectsTaught}</p>}
              </div>
            </div>
          )}

          {/* Bank Account Details */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm">
            <h4 className="text-xl font-bold text-gray-800 mb-6">Bank Account Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bankName" className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                <input 
                  type="text" 
                  id="bankName" 
                  name="bankAccountDetails.bankName" 
                  value={staff.bankAccountDetails.bankName} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                <input 
                  type="text" 
                  id="accountNumber" 
                  name="bankAccountDetails.accountNumber" 
                  value={staff.bankAccountDetails.accountNumber} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="iban" className="block text-sm font-bold text-gray-700 mb-2">IBAN</label>
                <input 
                  type="text" 
                  id="iban" 
                  name="bankAccountDetails.iban" 
                  value={staff.bankAccountDetails.iban} 
                  onChange={handleChange} 
                  readOnly={isViewMode} 
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Review */}
        <div className={currentStep === 3 || !isViewMode ? 'animate-fade-in' : 'hidden'}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">Review Form</h3>
          <p className="text-gray-600 mb-6 text-center">Please review the information below before submitting</p>
          
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-green-300 pb-2">Personal Details</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{staff.name || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Father's Name:</span> <span className="text-gray-600">{staff.fatherName || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Staff Type:</span> <span className="text-gray-600">{staff.staffType || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">CNIC:</span> <span className="text-gray-600">{staff.cnic || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Contact:</span> <span className="text-gray-600">{staff.contactNumber || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-600">{staff.email || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Date of Joining:</span> <span className="text-gray-600">{staff.dateOfJoining || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Salary:</span> <span className="text-gray-600">PKR {staff.salary || 'N/A'}</span></p>
                </div>
              </div>

              {/* Education & Professional */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-green-300 pb-2">Education & Professional</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold text-gray-700">Highest Education:</span> <span className="text-gray-600">{staff.highestEducationLevel || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Degrees:</span> <span className="text-gray-600">{staff.degrees.length > 0 ? `${staff.degrees.length} degree(s)` : 'None'}</span></p>
                  {staff.staffType === 'Teacher' && (
                    <p><span className="font-semibold text-gray-700">Subjects Taught:</span> <span className="text-gray-600">{staff.subjectsTaught.length > 0 ? staff.subjectsTaught.join(', ') : 'None'}</span></p>
                  )}
                  <p><span className="font-semibold text-gray-700">Bank Name:</span> <span className="text-gray-600">{staff.bankAccountDetails.bankName || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">Account Number:</span> <span className="text-gray-600">{staff.bankAccountDetails.accountNumber || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700">IBAN:</span> <span className="text-gray-600">{staff.bankAccountDetails.iban || 'N/A'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Section with Navigation */}
      <div className="mt-auto pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
        {/* Back/Next Buttons (only in edit mode) */}
        {!isViewMode && (
          <div className="flex justify-between w-full sm:w-auto sm:flex-grow space-x-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition shadow-md hover:shadow-lg active:scale-95"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg active:scale-95 sm:ml-auto"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:ml-auto space-y-3 sm:space-y-0 sm:space-x-3">
          {isViewMode && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition shadow-md hover:shadow-lg active:scale-95"
              title="Download Staff Details as PDF"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          )}
          {!isViewMode && currentStep === steps.length - 1 && (
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition shadow-md hover:shadow-lg active:scale-95 font-semibold justify-center"
            >
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition shadow-md hover:shadow-lg active:scale-95 justify-center"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;

