// src/components/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

const degreeYearsMap = {
  'Islamiyat': 4,
  'Software Engineering': 4,
  'Honors': 2,
  'N/A': null
};

const StudentForm = ({ editingStudent, fetchStudents, onClose, isViewMode = false }) => {
  const initialState = {
    name: '',
    fatherName: '',
    cnic: '',
    dob: '',
    gender: '',
    email: '',
    admissionDate: '',
    guardianContact: '',
    additionalContact: '',
    address: '',
    studentStatus: 'Regular',
    reason: '',
    class: '',
    classNumber: '',
    majorSubject: '',
    degreeName: '',
    semester: '',
    feePerMonth: '',
    profilePictureUrl: '',
  };
  const [student, setStudent] = useState(initialState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [generalFormError, setGeneralFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const backendBaseUrl = 'http://localhost:5000';

  useEffect(() => {
    if (editingStudent) {
      setStudent({
        ...editingStudent,
        dob: editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : '',
        admissionDate: editingStudent.admissionDate ? new Date(editingStudent.admissionDate).toISOString().split('T')[0] : '',
        profilePictureUrl: editingStudent.profilePictureUrl || '',
        feePerMonth: editingStudent.feePerMonth !== undefined ? editingStudent.feePerMonth.toString() : '',
        reason: editingStudent.reason || '',
      });
      setSelectedFile(null);
    } else {
      setStudent(initialState);
      setSelectedFile(null);
    }
    setGeneralFormError('');
    setFieldErrors({});
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralFormError('');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setStudent(prev => ({ ...prev, profilePictureUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralFormError('');
    setFieldErrors({});

    const newFieldErrors = {};
    let hasError = false;

    const requiredFields = ['name', 'fatherName', 'cnic', 'dob', 'gender', 'guardianContact', 'address', 'admissionDate', 'studentStatus', 'class', 'feePerMonth'];
    requiredFields.forEach(field => {
      if (!student[field]) {
        newFieldErrors[field] = 'This field is required.';
        hasError = true;
      }
    });

    if ((student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && !student.reason) {
      newFieldErrors.reason = 'Reason is required for Expelled or Withdrawn status.';
      hasError = true;
    }

    if (student.class === 'Class') {
      if (!student.classNumber) { newFieldErrors.classNumber = 'Class Number is required.'; hasError = true; }
      if (!student.majorSubject) { newFieldErrors.majorSubject = 'Major Subject is required.'; hasError = true; }
    } else if (student.class === 'BS') {
      if (!student.degreeName) { newFieldErrors.degreeName = 'Degree Name is required.'; hasError = true; }
      if (!student.semester) { newFieldErrors.semester = 'Semester is required.'; hasError = true; }
    }

    if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) <= 0) {
      newFieldErrors.feePerMonth = 'Fee Per Month must be a positive number.';
      hasError = true;
    }
    if (student.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)) {
      newFieldErrors.email = 'Please enter a valid email address.';
      hasError = true;
    }
    if (student.cnic && !/^\d{13}$/.test(student.cnic)) {
      newFieldErrors.cnic = 'CNIC must be 13 digits.';
      hasError = true;
    }
    if (student.guardianContact && !/^\d{11}$/.test(student.guardianContact)) {
      newFieldErrors.guardianContact = 'Guardian Contact must be 11 digits.';
      hasError = true;
    }
    if (student.additionalContact && student.additionalContact !== '' && !/^\d{11}$/.test(student.additionalContact)) {
      newFieldErrors.additionalContact = 'Additional Contact must be 11 digits.';
      hasError = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasError) {
      setGeneralFormError('Please correct the errors in the form.');
      return;
    }

    const formData = new FormData();

    for (const key in student) {
      if (key !== 'profilePictureUrl' && student[key] !== null) {
        formData.append(key, student[key]);
      }
    }

    if (selectedFile) {
      formData.append('profilePicture', selectedFile);
    } else if (student.profilePictureUrl) {
      formData.append('profilePictureUrl', student.profilePictureUrl);
    } else {
      formData.append('profilePictureUrl', '');
    }

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/students', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save student:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message;

      if (errorMessage.includes('duplicate key error') && errorMessage.includes('cnic')) {
        setFieldErrors(prev => ({ ...prev, cnic: 'This CNIC is already registered.' }));
        setGeneralFormError('Failed to save student: Duplicate CNIC detected.');
      } else {
        setGeneralFormError('Failed to save student: ' + errorMessage);
      }
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'Student Details';
    if (editingStudent) return 'Edit Student';
    return 'Add New Student';
  };

  const showReasonField = student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn';

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Student Details', 10, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, yPos);
    yPos += 15;
    doc.line(10, yPos, 200, yPos);
    yPos += 10;

    const addField = (label, value) => {
      if (value !== null && value !== undefined && value !== '') {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 10, yPos);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(String(value), 180);
        doc.text(lines, 50, yPos);
        yPos += (lines.length * 7) + 3;
      }
    };

    addField('Student Name', student.name);
    addField('Father Name', student.fatherName);
    addField('CNIC', student.cnic);
    addField('Date of Birth', student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A');
    addField('Gender', student.gender);
    addField('Email', student.email);
    addField('Address', student.address);
    addField('Guardian Contact', student.guardianContact);
    addField('Additional Contact', student.additionalContact);
    addField('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A');
    addField('Student Status', student.studentStatus);
    if (showReasonField) {
      addField('Reason', student.reason);
    }
    addField('Class Type', student.class);
    if (student.class === 'Class') {
      addField('Class Number', student.classNumber);
      addField('Major Subject', student.majorSubject);
    } else if (student.class === 'BS') {
      addField('Degree Name', student.degreeName);
      addField('Semester', student.semester);
      addField('Degree Years', degreeYearsMap[student.degreeName] || 'N/A');
    }
    addField('Fee Per Month', student.feePerMonth);
    addField('Profile Picture URL', student.profilePictureUrl ? `${backendBaseUrl}${student.profilePictureUrl}` : 'N/A');

    doc.save(`${student.name.replace(/\s/g, '_')}_details.pdf`);
  };

  return (
    // Main container for the form, now a flex column with a constrained height and padding
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      {/* Header Section (fixed at top) */}
      <div className="flex-shrink-0 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100"
          title="Close"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-indigo-700">{getTitle()}</h2>
        <hr className="mb-6 border-indigo-200" />

        {generalFormError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
            {generalFormError}
          </div>
        )}
      </div>

      {/* Scrollable Form Content Area (takes remaining vertical space) */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar"> {/* pr-2 for scrollbar spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Student Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Student Name<span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={student.name} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.name ? 'border-red-500' : ''}`} />
            {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
          </div>
          {/* Father Name */}
          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">Father Name<span className="text-red-500">*</span></label>
            <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.fatherName ? 'border-red-500' : ''}`} />
            {fieldErrors.fatherName && <p className="text-red-500 text-sm mt-1">{fieldErrors.fatherName}</p>}
          </div>
          {/* CNIC */}
          <div>
            <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC<span className="text-red-500">*</span></label>
            <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.cnic ? 'border-red-500' : ''}`} placeholder="XXXXX-XXXXXXX-X" />
            {fieldErrors.cnic && <p className="text-red-500 text-sm mt-1">{fieldErrors.cnic}</p>}
          </div>
          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth<span className="text-red-500">*</span></label>
            <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.dob ? 'border-red-500' : ''}`} />
            {fieldErrors.dob && <p className="text-red-500 text-sm mt-1">{fieldErrors.dob}</p>}
          </div>
          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender<span className="text-red-500">*</span></label>
            <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.gender ? 'border-red-500' : ''}`}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {fieldErrors.gender && <p className="text-red-500 text-sm mt-1">{fieldErrors.gender}</p>}
          </div>
          {/* Guardian Contact */}
          <div>
            <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact<span className="text-red-500">*</span></label>
            <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.guardianContact ? 'border-red-500' : ''}`} />
            {fieldErrors.guardianContact && <p className="text-red-500 text-sm mt-1">{fieldErrors.guardianContact}</p>}
          </div>
          {/* Additional Contact */}
          <div>
            <label htmlFor="additionalContact" className="block text-sm font-medium text-gray-700 mb-1">Additional Contact</label>
            <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.additionalContact ? 'border-red-500' : ''}`} />
            {fieldErrors.additionalContact && <p className="text-red-500 text-sm mt-1">{fieldErrors.additionalContact}</p>}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" value={student.email} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.email ? 'border-red-500' : ''}`} />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>
          {/* Address */}
          <div className="sm:col-span-2 lg:col-span-1"> {/* This will take 2 columns on small screens, 1 on large */}
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address<span className="text-red-500">*</span></label>
            <textarea id="address" name="address" value={student.address} onChange={handleChange} disabled={isViewMode} rows="1" className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-20 p-2.5 transition duration-150 ease-in-out ${fieldErrors.address ? 'border-red-500' : ''}`}></textarea>
            {fieldErrors.address && <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>}
          </div>
          {/* Admission Date */}
          <div>
            <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">Admission Date<span className="text-red-500">*</span></label>
            <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.admissionDate ? 'border-red-500' : ''}`} />
            {fieldErrors.admissionDate && <p className="text-red-500 text-sm mt-1">{fieldErrors.admissionDate}</p>}
          </div>
          {/* Student Status */}
          <div>
            <label htmlFor="studentStatus" className="block text-sm font-medium text-gray-700 mb-1">Student Status<span className="text-red-500">*</span></label>
            <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.studentStatus ? 'border-red-500' : ''}`}>
              <option value="Regular">Regular</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Graduated">Graduated</option>
              <option value="Expelled">Expelled</option>
            </select>
            {fieldErrors.studentStatus && <p className="text-red-500 text-sm mt-1">{fieldErrors.studentStatus}</p>}
          </div>
          {/* Reason Field (conditionally rendered) */}
          {showReasonField && (
            <div className="sm:col-span-2 lg:col-span-3"> {/* This will take full width on small/medium, and 3 columns on large */}
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-500">*</span></label>
              <textarea
                id="reason"
                name="reason"
                value={student.reason}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.reason ? 'border-red-500' : ''}`}
                placeholder="Provide a reason for withdrawal or expulsion"
              ></textarea>
              {fieldErrors.reason && <p className="text-red-500 text-sm mt-1">{fieldErrors.reason}</p>}
            </div>
          )}
          {/* Class Type */}
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class Type<span className="text-red-500">*</span></label>
            <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.class ? 'border-red-500' : ''}`}>
              <option value="">Select Class Type</option>
              <option value="Class">Class (1-12)</option>
              <option value="BS">BS Level</option>
            </select>
            {fieldErrors.class && <p className="text-red-500 text-sm mt-1">{fieldErrors.class}</p>}
          </div>

          {student.class === 'Class' && (
            <>
              <div>
                <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-1">Class Number<span className="text-red-500">*</span></label>
                <select id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.classNumber ? 'border-red-500' : ''}`}>
                  <option value="">Select Class</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
                  ))}
                </select>
                {fieldErrors.classNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.classNumber}</p>}
              </div>
              <div>
                <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700 mb-1">Major Subject<span className="text-red-500">*</span></label>
                <select id="majorSubject" name="majorSubject" value={student.majorSubject} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.majorSubject ? 'border-red-500' : ''}`}>
                  <option value="">Select Subject</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                </select>
                {fieldErrors.majorSubject && <p className="text-red-500 text-sm mt-1">{fieldErrors.majorSubject}</p>}
              </div>
            </>
          )}

          {student.class === 'BS' && (
            <>
              <div>
                <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700 mb-1">Degree Name<span className="text-red-500">*</span></label>
                <select id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.degreeName ? 'border-red-500' : ''}`}>
                  <option value="">Select Degree</option>
                  <option value="Islamiyat">Islamiyat</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Honors">Honors</option>
                </select>
                {fieldErrors.degreeName && <p className="text-red-500 text-sm mt-1">{fieldErrors.degreeName}</p>}
              </div>
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester<span className="text-red-500">*</span></label>
                <select id="semester" name="semester" value={student.semester} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.semester ? 'border-red-500' : ''}`}>
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                {fieldErrors.semester && <p className="text-red-500 text-sm mt-1">{fieldErrors.semester}</p>}
              </div>
              {student.degreeName && (
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Degree Years:</p>
                  <p className="p-2.5 text-gray-900 font-bold">{degreeYearsMap[student.degreeName] || 'N/A'} years</p>
                </div>
              )}
            </>
          )}

          {/* Fee Per Month */}
          <div>
            <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700 mb-1">Fee Per Month<span className="text-red-500">*</span></label>
            <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.feePerMonth ? 'border-red-500' : ''}`} />
            {fieldErrors.feePerMonth && <p className="text-red-500 text-sm mt-1">{fieldErrors.feePerMonth}</p>}
          </div>

          {/* Profile Picture */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center md:items-start">
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            {!isViewMode ? (
              <input type="file" id="profilePicture" name="profilePicture" onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            ) : null}

            {(student.profilePictureUrl || selectedFile) && (
              <div className="mt-4 flex flex-col items-center md:items-start">
                <p className="text-sm text-gray-500 mb-2">Current Picture:</p>
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : `${backendBaseUrl}${student.profilePictureUrl}`}
                  alt="Profile"
                  className="h-32 w-32 object-cover rounded-full border-4 border-indigo-200 shadow-md"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
                />
                {isViewMode && student.profilePictureUrl && (
                   <a
                    href={`${backendBaseUrl}${student.profilePictureUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
                  >
                    View Full Image
                  </a>
                )}
                {!isViewMode && student.profilePictureUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudent(prev => ({ ...prev, profilePictureUrl: '' }));
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

      {/* Footer Section (fixed at bottom) */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
        {isViewMode && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
            title="Download Student Details as PDF"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        )}
        {!isViewMode && (
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
          >
            {editingStudent ? 'Update Student' : 'Add Student'}
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

export default StudentForm;