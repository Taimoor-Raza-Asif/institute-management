// // src/components/StaffForm.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { XMarkIcon, ArrowDownTrayIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
// import jsPDF from 'jspdf';
// import QRCode from 'qrcode'; // For generating QR code on frontend

// const staffTypes = ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'];
// const educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Other', 'None'];
// const leaveTypes = ['Casual', 'Sick', 'Annual', 'Maternity', 'Paternity', 'Other']; // For reference, not directly in StaffForm

// const StaffForm = ({ editingStaff, fetchStaff, onClose, isViewMode = false }) => {
//   const initialState = {
//     name: '',
//     staffType: '',
//     cnic: '',
//     contactNumber: '',
//     email: '',
//     address: '',
//     dateOfJoining: '',
//     salary: '',
//     profilePictureUrl: '',
//     highestEducationLevel: 'None',
//     degrees: [], // Array of { degreeName, major, institution, yearCompleted }
//     subjectsTaught: [], // Array of strings for teachers
//     emergencyContact: '',
//     bankAccountDetails: {
//       bankName: '',
//       accountNumber: '',
//       iban: '',
//     },
//     qrCodeSecret: '', // Will be set from backend
//   };
//   const [staff, setStaff] = useState(initialState);
//   const [profilePictureFile, setProfilePictureFile] = useState(null);
//   const [formError, setFormError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // State to hold the QR code data URL
//   const backendBaseUrl = 'http://localhost:5000';

//   useEffect(() => {
//     if (editingStaff) {
//       setStaff({
//         ...editingStaff,
//         dateOfJoining: editingStaff.dateOfJoining ? new Date(editingStaff.dateOfJoining).toISOString().split('T')[0] : '',
//         salary: editingStaff.salary !== undefined ? editingStaff.salary.toString() : '',
//         // Ensure nested objects/arrays are correctly initialized
//         degrees: editingStaff.degrees || [],
//         subjectsTaught: editingStaff.subjectsTaught || [],
//         bankAccountDetails: editingStaff.bankAccountDetails || { bankName: '', accountNumber: '', iban: '' },
//         profilePictureUrl: editingStaff.profilePictureUrl || '',
//         qrCodeSecret: editingStaff.qrCodeSecret || '',
//       });
//       setProfilePictureFile(null); // Clear file input when editing
//       if (editingStaff.qrCodeSecret) {
//         QRCode.toDataURL(editingStaff.qrCodeSecret)
//           .then(url => setQrCodeDataUrl(url))
//           .catch(err => console.error("Error generating QR code for existing staff:", err));
//       } else {
//         setQrCodeDataUrl('');
//       }
//     } else {
//       setStaff(initialState);
//       setProfilePictureFile(null);
//       setQrCodeDataUrl('');
//     }
//     setFormError('');
//     setFieldErrors({});
//   }, [editingStaff]);

//   // Generate QR code for newly created staff if secret is available
//   useEffect(() => {
//     if (!editingStaff && staff.qrCodeSecret) {
//       QRCode.toDataURL(staff.qrCodeSecret)
//         .then(url => setQrCodeDataUrl(url))
//         .catch(err => console.error("Error generating QR code for new staff:", err));
//     }
//   }, [staff.qrCodeSecret, editingStaff]);


//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.startsWith('bankAccountDetails.')) {
//       const field = name.split('.')[1];
//       setStaff(prev => ({
//         ...prev,
//         bankAccountDetails: {
//           ...prev.bankAccountDetails,
//           [field]: value
//         }
//       }));
//     } else {
//       setStaff(prev => ({ ...prev, [name]: value }));
//     }
//     setFieldErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
//     setFormError('');
//   };

//   const handleFileChange = (e) => {
//     setProfilePictureFile(e.target.files[0]);
//     setStaff(prev => ({ ...prev, profilePictureUrl: '' })); // Clear existing URL if new file selected
//   };

//   const handleRemoveProfilePicture = () => {
//     setProfilePictureFile(null);
//     setStaff(prev => ({ ...prev, profilePictureUrl: '' }));
//   };

//   // --- Degrees Array Handlers ---
//   const handleDegreeChange = (index, e) => {
//     const { name, value } = e.target;
//     const newDegrees = [...staff.degrees];
//     newDegrees[index] = { ...newDegrees[index], [name]: value };
//     setStaff(prev => ({ ...prev, degrees: newDegrees }));
//   };

//   const addDegree = () => {
//     setStaff(prev => ({
//       ...prev,
//       degrees: [...prev.degrees, { degreeName: '', major: '', institution: '', yearCompleted: '' }]
//     }));
//   };

//   const removeDegree = (index) => {
//     const newDegrees = staff.degrees.filter((_, i) => i !== index);
//     setStaff(prev => ({ ...prev, degrees: newDegrees }));
//   };

//   // --- Subjects Taught Array Handlers ---
//   const handleSubjectChange = (index, e) => {
//     const newSubjects = [...staff.subjectsTaught];
//     newSubjects[index] = e.target.value;
//     setStaff(prev => ({ ...prev, subjectsTaught: newSubjects }));
//   };

//   const addSubject = () => {
//     setStaff(prev => ({
//       ...prev,
//       subjectsTaught: [...prev.subjectsTaught, '']
//     }));
//   };

//   const removeSubject = (index) => {
//     const newSubjects = staff.subjectsTaught.filter((_, i) => i !== index);
//     setStaff(prev => ({ ...prev, subjectsTaught: newSubjects }));
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError('');
//     setFieldErrors({});

//     const newFieldErrors = {};
//     let hasError = false;

//     // Basic validation
//     const requiredFields = ['name', 'staffType', 'contactNumber', 'address', 'dateOfJoining', 'salary'];
//     requiredFields.forEach(field => {
//       if (!staff[field]) {
//         newFieldErrors[field] = 'This field is required.';
//         hasError = true;
//       }
//     });

//     if (staff.contactNumber && !/^\d{11}$/.test(staff.contactNumber)) {
//       newFieldErrors.contactNumber = 'Contact number must be 11 digits.';
//       hasError = true;
//     }
//     if (staff.email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(staff.email)) {
//       newFieldErrors.email = 'Please enter a valid email address.';
//       hasError = true;
//     }
//     if (isNaN(parseFloat(staff.salary)) || parseFloat(staff.salary) < 0) {
//       newFieldErrors.salary = 'Salary must be a non-negative number.';
//       hasError = true;
//     }

//     // Conditional validation for Teacher subjects
//     if (staff.staffType === 'Teacher' && staff.subjectsTaught.length === 0) {
//       newFieldErrors.subjectsTaught = 'Teachers must have at least one subject.';
//       hasError = true;
//     }
//     if (staff.staffType === 'Teacher' && staff.subjectsTaught.some(sub => !sub.trim())) {
//         newFieldErrors.subjectsTaught = 'All subjects must be filled.';
//         hasError = true;
//     }

//     // Degrees validation
//     staff.degrees.forEach((degree, index) => {
//       if (!degree.degreeName || !degree.institution || !degree.yearCompleted) {
//         newFieldErrors[`degrees[${index}]`] = 'Degree name, institution, and year are required.';
//         hasError = true;
//       }
//       if (isNaN(parseInt(degree.yearCompleted)) || parseInt(degree.yearCompleted) < 1900 || parseInt(degree.yearCompleted) > new Date().getFullYear() + 5) {
//         newFieldErrors[`degrees[${index}]`] = 'Invalid year completed.';
//         hasError = true;
//       }
//     });


//     setFieldErrors(newFieldErrors);

//     if (hasError) {
//       setFormError('Please correct the errors in the form before submitting.');
//       return;
//     }

//     const formData = new FormData();

//     // Append all basic staff fields
//     for (const key in staff) {
//       if (key !== 'profilePictureUrl' && key !== 'degrees' && key !== 'subjectsTaught' && key !== 'bankAccountDetails' && staff[key] !== null) {
//         formData.append(key, staff[key]);
//       }
//     }

//     // Append profile picture file or its URL
//     if (profilePictureFile) {
//       formData.append('profilePicture', profilePictureFile);
//     } else if (staff.profilePictureUrl) {
//       formData.append('profilePictureUrl', staff.profilePictureUrl);
//     } else {
//       formData.append('profilePictureUrl', '');
//     }

//     // Append degrees and subjectsTaught as JSON strings
//     formData.append('degrees', JSON.stringify(staff.degrees));
//     formData.append('subjectsTaught', JSON.stringify(staff.subjectsTaught));
//     formData.append('bankAccountDetails', JSON.stringify(staff.bankAccountDetails));


//     try {
//       let res;
//       if (editingStaff) {
//         res = await api.put(`/staff/${editingStaff._id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         res = await api.post('/staff', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         // If new staff created, set the QR code data URL
//         if (res.data.qrCodeDataUrl) {
//           setQrCodeDataUrl(res.data.qrCodeDataUrl);
//           setStaff(prev => ({ ...prev, qrCodeSecret: res.data.staff.qrCodeSecret })); // Store the secret
//         }
//       }
//       fetchStaff(); // Refresh staff list
//       onClose(); // Close modal on success
//     } catch (err) {
//       console.error('Failed to save staff:', err.response?.data || err.message);
//       const errorMessage = err.response?.data?.message || err.message;

//       if (err.response?.data?.errors) {
//         const backendErrors = err.response.data.errors;
//         const newErrors = {};
//         for (const key in backendErrors) {
//           newErrors[key] = backendErrors[key].message;
//         }
//         setFieldErrors(prev => ({ ...prev, ...newErrors }));
//         setFormError('Failed to save staff: Please correct the highlighted fields.');
//       } else {
//         setFormError('Failed to save staff: ' + errorMessage);
//       }
//     }
//   };

//   const getTitle = () => {
//     if (isViewMode) return 'Staff Details';
//     if (editingStaff) return 'Edit Staff Member';
//     return 'Add New Staff Member';
//   };

//   const handleDownloadPdf = async () => {
//     const doc = new jsPDF();
//     let yPos = 20;
//     const margin = 15;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const col1X = margin;
//     const col2X = pageWidth / 2 + 10; // Second column starts slightly right of center

//     doc.setFontSize(18);
//     doc.text('Staff Details', pageWidth / 2, yPos, { align: 'center' });
//     yPos += 10;

//     // Add profile picture
//     if (staff.profilePictureUrl) {
//         try {
//             const img = new Image();
//             img.src = `${backendBaseUrl}${staff.profilePictureUrl}`;
//             await new Promise((resolve) => {
//                 img.onload = () => {
//                     const imgWidth = 40;
//                     const imgHeight = (img.height * imgWidth) / img.width;
//                     const xOffset = (pageWidth - imgWidth) / 2;
//                     doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
//                     yPos += imgHeight + 10;
//                     resolve();
//                 };
//                 img.onerror = () => {
//                     console.warn('Failed to load profile picture for PDF.');
//                     yPos += 10; // Just move down if image fails
//                     resolve();
//                 };
//             });
//         } catch (e) {
//             console.error('Error adding profile picture to PDF:', e);
//             yPos += 10;
//         }
//     } else {
//         doc.setFontSize(10);
//         doc.setTextColor(150);
//         doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
//         doc.setTextColor(0);
//         yPos += 10;
//     }

//     // Add QR Code if available
//     if (qrCodeDataUrl) {
//         try {
//             const qrWidth = 40;
//             const qrXOffset = (pageWidth - qrWidth) / 2;
//             doc.addImage(qrCodeDataUrl, 'PNG', qrXOffset, yPos, qrWidth, qrWidth);
//             doc.setFontSize(8);
//             doc.text('Attendance QR Code', pageWidth / 2, yPos + qrWidth + 5, { align: 'center' });
//             yPos += qrWidth + 15;
//         } catch (e) {
//             console.error('Error adding QR code to PDF:', e);
//             yPos += 10;
//         }
//     }


//     doc.setFontSize(10);
//     doc.setTextColor(0);

//     const addField = (label, value, x, y) => {
//         doc.setFont(undefined, 'bold');
//         doc.text(`${label}:`, x, y);
//         doc.setFont(undefined, 'normal');
//         doc.text(String(value || 'N/A'), x + doc.getTextWidth(`${label}: `), y);
//     };

//     const checkPageBreak = () => {
//         if (yPos > doc.internal.pageSize.getHeight() - margin) {
//             doc.addPage();
//             yPos = margin;
//         }
//     };

//     yPos += 5;
//     doc.line(margin, yPos, pageWidth - margin, yPos);
//     yPos += 10;

//     // Basic Information
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'bold');
//     doc.text('Basic Information', col1X, yPos);
//     yPos += 7;
//     checkPageBreak();

//     addField('Name', staff.name, col1X, yPos);
//     addField('Staff Type', staff.staffType, col2X, yPos);
//     yPos += 7; checkPageBreak();
//     addField('CNIC', staff.cnic, col1X, yPos);
//     addField('Contact Number', staff.contactNumber, col2X, yPos);
//     yPos += 7; checkPageBreak();
//     addField('Email', staff.email, col1X, yPos);
//     addField('Date of Joining', staff.dateOfJoining ? new Date(staff.dateOfJoining).toLocaleDateString() : 'N/A', col2X, yPos);
//     yPos += 7; checkPageBreak();
//     addField('Salary', `PKR ${parseFloat(staff.salary).toFixed(2)}`, col1X, yPos);
//     addField('Emergency Contact', staff.emergencyContact, col2X, yPos);
//     yPos += 7; checkPageBreak();
//     addField('Address', staff.address, col1X, yPos);
//     yPos += 10; checkPageBreak();

//     // Education Details
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'bold');
//     doc.text('Education Details', col1X, yPos);
//     yPos += 7;
//     checkPageBreak();

//     addField('Highest Education', staff.highestEducationLevel, col1X, yPos);
//     yPos += 7; checkPageBreak();

//     if (staff.degrees && staff.degrees.length > 0) {
//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text('Degrees:', col1X, yPos);
//         yPos += 5; checkPageBreak();
//         staff.degrees.forEach((degree, index) => {
//             const degreeText = `${degree.degreeName} (${degree.major || 'N/A'}) from ${degree.institution}, ${degree.yearCompleted}`;
//             doc.setFont(undefined, 'normal');
//             doc.text(`- ${degreeText}`, col1X + 5, yPos);
//             yPos += 5; checkPageBreak();
//         });
//     } else {
//         doc.setFont(undefined, 'normal');
//         doc.text('No degrees recorded.', col1X, yPos);
//         yPos += 7; checkPageBreak();
//     }

//     // Teacher Specific
//     if (staff.staffType === 'Teacher' && staff.subjectsTaught && staff.subjectsTaught.length > 0) {
//         yPos += 10; checkPageBreak();
//         doc.setFontSize(12);
//         doc.setFont(undefined, 'bold');
//         doc.text('Teaching Information', col1X, yPos);
//         yPos += 7; checkPageBreak();

//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text('Subjects Taught:', col1X, yPos);
//         yPos += 5; checkPageBreak();
//         staff.subjectsTaught.forEach((subject, index) => {
//             doc.setFont(undefined, 'normal');
//             doc.text(`- ${subject}`, col1X + 5, yPos);
//             yPos += 5; checkPageBreak();
//         });
//     }

//     // Bank Account Details
//     if (staff.bankAccountDetails && (staff.bankAccountDetails.bankName || staff.bankAccountDetails.accountNumber || staff.bankAccountDetails.iban)) {
//         yPos += 10; checkPageBreak();
//         doc.setFontSize(12);
//         doc.setFont(undefined, 'bold');
//         doc.text('Bank Account Details', col1X, yPos);
//         yPos += 7; checkPageBreak();

//         addField('Bank Name', staff.bankAccountDetails.bankName, col1X, yPos);
//         addField('Account Number', staff.bankAccountDetails.accountNumber, col2X, yPos);
//         yPos += 7; checkPageBreak();
//         addField('IBAN', staff.bankAccountDetails.iban, col1X, yPos);
//         yPos += 7; checkPageBreak();
//     }

//     doc.save(`${staff.name.replace(/\s/g, '_')}_Staff_Details.pdf`);
//   };


//   return (
//     <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
//       {/* Header Section */}
//       <div className="flex-shrink-0 relative">
//         <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
//           <XMarkIcon className="h-7 w-7" />
//         </button>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-purple-700">{getTitle()}</h2>
//         <hr className="mb-6 border-purple-200" />
//         {formError && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
//             {formError}
//           </div>
//         )}
//       </div>

//       {/* Scrollable Form Content Area */}
//       <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
//           {/* Profile Picture */}
//           <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
//             <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
//             {!isViewMode && (
//               <input
//                 type="file"
//                 id="profilePicture"
//                 name="profilePicture"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//               />
//             )}
//             {(profilePictureFile || staff.profilePictureUrl) && (
//               <div className="mt-2 relative w-40 h-40 border border-gray-300 rounded-md overflow-hidden">
//                 <img src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : `${backendBaseUrl}${staff.profilePictureUrl}`} alt="Profile Preview" className="w-full h-full object-cover" />
//                 {!isViewMode && (
//                   <button
//                     type="button"
//                     onClick={handleRemoveProfilePicture}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
//                     aria-label="Remove Profile Picture"
//                   >
//                     <MinusCircleIcon className="h-4 w-4" />
//                   </button>
//                 )}
//                 {isViewMode && staff.profilePictureUrl && (
//                   <a
//                     href={`${backendBaseUrl}${staff.profilePictureUrl}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:bg-opacity-75"
//                   >
//                     View Full
//                   </a>
//                 )}
//               </div>
//             )}
//             {fieldErrors.profilePictureUrl && <p className="mt-1 text-sm text-red-600">{fieldErrors.profilePictureUrl}</p>}
//           </div>

//           {/* QR Code Display */}
//           {staff.qrCodeSecret && (isViewMode || editingStaff) && qrCodeDataUrl && ( // Only show QR for existing staff in view/edit mode
//             <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center border p-4 rounded-md bg-gray-50">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Attendance QR Code</label>
//               <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 border border-gray-300 p-1 rounded-md" />
//               <p className="text-xs text-gray-500 mt-2">Scan for attendance</p>
//               <p className="text-xs text-gray-500">Secret: {staff.qrCodeSecret}</p>
//             </div>
//           )}

//           {/* Basic Info */}
//           <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//             {/* Name */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
//               <input type="text" id="name" name="name" value={staff.name} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
//             </div>
//             {/* Staff Type */}
//             <div>
//               <label htmlFor="staffType" className="block text-sm font-medium text-gray-700">Staff Type<span className="text-red-500">*</span></label>
//               <select id="staffType" name="staffType" value={staff.staffType} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                 <option value="">Select Type</option>
//                 {staffTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//               {fieldErrors.staffType && <p className="mt-1 text-sm text-red-600">{fieldErrors.staffType}</p>}
//             </div>
//             {/* CNIC */}
//             <div>
//               <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC</label>
//               <input type="text" id="cnic" name="cnic" value={staff.cnic} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
//             </div>
//             {/* Contact Number */}
//             <div>
//               <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number<span className="text-red-500">*</span></label>
//               <input type="text" id="contactNumber" name="contactNumber" value={staff.contactNumber} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.contactNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.contactNumber}</p>}
//             </div>
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//               <input type="email" id="email" name="email" value={staff.email} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
//             </div>
//             {/* Date of Joining */}
//             <div>
//               <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">Date of Joining<span className="text-red-500">*</span></label>
//               <input type="date" id="dateOfJoining" name="dateOfJoining" value={staff.dateOfJoining} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.dateOfJoining && <p className="mt-1 text-sm text-red-600">{fieldErrors.dateOfJoining}</p>}
//             </div>
//             {/* Salary */}
//             <div>
//               <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary (PKR)<span className="text-red-500">*</span></label>
//               <input type="number" id="salary" name="salary" value={staff.salary} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.salary && <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>}
//             </div>
//             {/* Emergency Contact */}
//             <div>
//               <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
//               <input type="text" id="emergencyContact" name="emergencyContact" value={staff.emergencyContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.emergencyContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.emergencyContact}</p>}
//             </div>
//             {/* Address */}
//             <div className="sm:col-span-2">
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address<span className="text-red-500">*</span></label>
//               <textarea id="address" name="address" value={staff.address} onChange={handleChange} readOnly={isViewMode} rows="2" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}></textarea>
//               {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Education Details */}
//         <div className="border-t pt-4 mt-4 border-gray-200">
//           <h3 className="text-lg font-bold text-gray-800 mb-4">Education Details</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4">
//             {/* Highest Education Level */}
//             <div>
//               <label htmlFor="highestEducationLevel" className="block text-sm font-medium text-gray-700">Highest Education Level</label>
//               <select id="highestEducationLevel" name="highestEducationLevel" value={staff.highestEducationLevel} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                 {educationLevels.map(level => (
//                   <option key={level} value={level}>{level}</option>
//                 ))}
//               </select>
//               {fieldErrors.highestEducationLevel && <p className="mt-1 text-sm text-red-600">{fieldErrors.highestEducationLevel}</p>}
//             </div>
//           </div>

//           {/* Degrees List */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Degrees</label>
//             {!isViewMode && (
//               <button type="button" onClick={addDegree} className="mb-3 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">
//                 Add Degree
//               </button>
//             )}
//             {staff.degrees.length === 0 && isViewMode && <p className="text-gray-500">No degrees recorded.</p>}
//             {staff.degrees.map((degree, index) => (
//               <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 border p-3 rounded-md mb-3 relative">
//                 <div>
//                   <label htmlFor={`degreeName-${index}`} className="block text-sm font-medium text-gray-700">Degree Name<span className="text-red-500">*</span></label>
//                   <input type="text" id={`degreeName-${index}`} name="degreeName" value={degree.degreeName} onChange={(e) => handleDegreeChange(index, e)} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors[`degrees[${index}]`] && <p className="mt-1 text-sm text-red-600">{fieldErrors[`degrees[${index}]`]}</p>}
//                 </div>
//                 <div>
//                   <label htmlFor={`major-${index}`} className="block text-sm font-medium text-gray-700">Major</label>
//                   <input type="text" id={`major-${index}`} name="major" value={degree.major} onChange={(e) => handleDegreeChange(index, e)} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                 </div>
//                 <div>
//                   <label htmlFor={`institution-${index}`} className="block text-sm font-medium text-gray-700">Institution<span className="text-red-500">*</span></label>
//                   <input type="text" id={`institution-${index}`} name="institution" value={degree.institution} onChange={(e) => handleDegreeChange(index, e)} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                 </div>
//                 <div>
//                   <label htmlFor={`yearCompleted-${index}`} className="block text-sm font-medium text-gray-700">Year Completed<span className="text-red-500">*</span></label>
//                   <input type="number" id={`yearCompleted-${index}`} name="yearCompleted" value={degree.yearCompleted} onChange={(e) => handleDegreeChange(index, e)} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                 </div>
//                 {!isViewMode && (
//                   <button type="button" onClick={() => removeDegree(index)} className="absolute top-1 right-1 text-red-500 hover:text-red-700 transition">
//                     <MinusCircleIcon className="h-5 w-5" />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Teacher Specific Fields */}
//         {staff.staffType === 'Teacher' && (
//           <div className="border-t pt-4 mt-4 border-gray-200">
//             <h3 className="text-lg font-bold text-gray-800 mb-4">Teaching Information</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
//               {!isViewMode && (
//                 <button type="button" onClick={addSubject} className="mb-3 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">
//                   Add Subject
//                 </button>
//               )}
//               {staff.subjectsTaught.length === 0 && isViewMode && <p className="text-gray-500">No subjects taught recorded.</p>}
//               {staff.subjectsTaught.map((subject, index) => (
//                 <div key={index} className="flex items-center space-x-2 mb-2">
//                   <input type="text" value={subject} onChange={(e) => handleSubjectChange(index, e)} readOnly={isViewMode} className={`flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                   {!isViewMode && (
//                     <button type="button" onClick={() => removeSubject(index)} className="text-red-500 hover:text-red-700 transition">
//                       <MinusCircleIcon className="h-5 w-5" />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               {fieldErrors.subjectsTaught && <p className="mt-1 text-sm text-red-600">{fieldErrors.subjectsTaught}</p>}
//             </div>
//           </div>
//         )}

//         {/* Bank Account Details */}
//         <div className="border-t pt-4 mt-4 border-gray-200">
//           <h3 className="text-lg font-bold text-gray-800 mb-4">Bank Account Details</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4">
//             <div>
//               <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
//               <input type="text" id="bankName" name="bankAccountDetails.bankName" value={staff.bankAccountDetails.bankName} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//             </div>
//             <div>
//               <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
//               <input type="text" id="accountNumber" name="bankAccountDetails.accountNumber" value={staff.bankAccountDetails.accountNumber} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//             </div>
//             <div className="sm:col-span-2">
//               <label htmlFor="iban" className="block text-sm font-medium text-gray-700">IBAN</label>
//               <input type="text" id="iban" name="bankAccountDetails.iban" value={staff.bankAccountDetails.iban} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//             </div>
//           </div>
//         </div>
//       </form>

//       {/* Footer Section */}
//       <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
//         {isViewMode && (
//           <button
//             type="button"
//             onClick={handleDownloadPdf}
//             className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
//             title="Download Staff Details as PDF"
//           >
//             <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//             Download PDF
//           </button>
//         )}
//         {!isViewMode && (
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
//           >
//             {editingStaff ? 'Update Staff' : 'Add Staff'}
//           </button>
//         )}
//         <button
//           type="button"
//           onClick={onClose}
//           className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-md w-full sm:w-auto"
//         >
//           {isViewMode ? 'Close' : 'Cancel'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default StaffForm;



// src/components/StaffForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // State for QR code image data URL

  const backendBaseUrl = 'http://localhost:5000'; // Adjust as per your backend URL

  // Get current user from local storage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Determine if the current user can edit this specific staff member's data
  const canEdit = currentUser && (
    currentUser.role === 'admin' ||
    (currentUser.profileId === editingStaff?._id && currentUser.editModeEnabled)
  );
  // Determine if the current user can add a new staff member
  const canAdd = currentUser && (currentUser.role === 'admin' || currentUser.editModeEnabled);


  useEffect(() => {
    if (editingStaff) {
      setStaff({
        ...editingStaff,
        dateOfJoining: editingStaff.dateOfJoining ? new Date(editingStaff.dateOfJoining).toISOString().split('T')[0] : '',
        // Ensure bankAccountDetails and degrees are properly initialized if they might be missing
        bankAccountDetails: editingStaff.bankAccountDetails || initialState.bankAccountDetails,
        degrees: editingStaff.degrees || [],
        subjectsTaught: editingStaff.subjectsTaught || [],
      });
      if (editingStaff.qrCodeSecret) {
        generateQrCode(editingStaff.qrCodeSecret);
      }
    } else {
      setStaff(initialState); // Reset form for adding new staff
      setQrCodeDataUrl('');
    }
    setProfilePictureFile(null); // Clear file input on edit/add
    setFormError('');
    setFieldErrors({});
  }, [editingStaff]);

  const generateQrCode = useCallback(async (text) => {
    try {
      const dataUrl = await QRCode.toDataURL(text);
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setQrCodeDataUrl('');
    }
  }, []);

  useEffect(() => {
    if (staff.qrCodeSecret) {
      generateQrCode(staff.qrCodeSecret);
    }
  }, [staff.qrCodeSecret, generateQrCode]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prevStaff => ({
      ...prevStaff,
      [name]: value
    }));
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on change
    setFormError('');
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    setStaff(prevStaff => ({
      ...prevStaff,
      bankAccountDetails: {
        ...prevStaff.bankAccountDetails,
        [name]: value
      }
    }));
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    setFormError('');
  };

  const handleDegreeChange = (index, e) => {
    const { name, value } = e.target;
    const newDegrees = [...staff.degrees];
    newDegrees[index] = { ...newDegrees[index], [name]: value };
    setStaff(prevStaff => ({ ...prevStaff, degrees: newDegrees }));
  };

  const addDegree = () => {
    setStaff(prevStaff => ({
      ...prevStaff,
      degrees: [...prevStaff.degrees, { degreeName: '', major: '', institution: '', yearCompleted: '' }]
    }));
  };

  const removeDegree = (index) => {
    setStaff(prevStaff => ({
      ...prevStaff,
      degrees: prevStaff.degrees.filter((_, i) => i !== index)
    }));
  };

  const handleSubjectsTaughtChange = (e) => {
    const { value } = e.target;
    // Split by comma and trim whitespace, filter out empty strings
    const subjects = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setStaff(prevStaff => ({ ...prevStaff, subjectsTaught: subjects }));
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFieldErrors(prevErrors => ({ ...prevErrors, profilePicture: '' }));
    } else {
      setSelectedFile(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!staff.name) errors.name = 'Name is required.';
    if (!staff.staffType) errors.staffType = 'Staff Type is required.';
    if (!staff.cnic) errors.cnic = 'CNIC is required.';
    if (!staff.contactNumber) errors.contactNumber = 'Contact Number is required.';
    else if (!/^\d{11}$/.test(staff.contactNumber)) errors.contactNumber = 'Contact must be 11 digits.';
    if (!staff.email) errors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(staff.email)) errors.email = 'Invalid email format.';
    if (!staff.address) errors.address = 'Address is required.';
    if (!staff.dateOfJoining) errors.dateOfJoining = 'Date of Joining is required.';
    if (!staff.salary || isNaN(staff.salary) || parseFloat(staff.salary) <= 0) errors.salary = 'Valid Salary is required.';

    if (staff.staffType === 'Teacher') {
      if (!staff.subjectsTaught || staff.subjectsTaught.length === 0) {
        errors.subjectsTaught = 'Teachers must have at least one subject taught.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous form-wide errors

    // if (!canEdit && editingStaff) { // If trying to update but no permission
    //   setFormError('You do not have permission to edit this staff member.');
    //   return;
    // }
    // if (!canAdd && !editingStaff) { // If trying to add but no permission
    //   setFormError('You do not have permission to add staff members.');
    //   return;
    // }


    if (!validateForm()) {
      setFormError('Please correct the errors in the form.');
      return;
    }

    const formData = new FormData();
    // Append all staff fields
    for (const key in staff) {
      if (key === 'degrees') {
        formData.append(key, JSON.stringify(staff[key])); // Stringify array of objects
      } else if (key === 'bankAccountDetails') {
        formData.append(key, JSON.stringify(staff[key])); // Stringify object
      } else if (key === 'subjectsTaught') {
        formData.append(key, JSON.stringify(staff[key])); // Stringify array of strings
      }
      else if (key === 'profilePictureUrl' && profilePictureFile) {
        // If a new file is selected, this will be handled by formData.append('profilePicture', ...)
        // Otherwise, send the existing URL if no new file is selected but the field isn't empty
        if (!profilePictureFile && staff.profilePictureUrl) {
          formData.append(key, staff[key]);
        }
      }
      else {
        formData.append(key, staff[key]);
      }
    }

    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    } else if (staff.profilePictureUrl === '' && editingStaff?.profilePictureUrl) {
      // Explicitly indicate if a previously existing profile picture was cleared
      formData.append('profilePictureUrl', '');
    }


    try {
      if (editingStaff) {
        // Update staff
        await api.put(`/staff/${editingStaff._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Staff record updated successfully!');
      } else {
        // Add new staff
        await api.post('/staff', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Staff added successfully!');
      }
      onClose(); // Close modal on success
      fetchStaff(); // Refresh staff list
    } catch (err) {
      console.error("Error saving staff record:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save staff record. Please try again.');
      }
    }
  };


  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Staff Details", 14, 22);

    doc.setFontSize(12);
    let yPos = 30;
    const addField = (label, value) => {
      if (value) {
        doc.text(`${label}: ${value}`, 14, yPos);
        yPos += 7;
      }
    };

    addField("Name", staff.name);
    addField("CNIC", staff.cnic);
    addField("Staff Type", staff.staffType);
    addField("Contact Number", staff.contactNumber);
    addField("Email", staff.email);
    addField("Address", staff.address);
    addField("Date of Joining", staff.dateOfJoining);
    addField("Salary", `PKR ${staff.salary?.toLocaleString()}`);
    addField("Highest Education", staff.highestEducationLevel);
    addField("Emergency Contact", staff.emergencyContact);

    if (staff.bankAccountDetails.bankName) addField("Bank Name", staff.bankAccountDetails.bankName);
    if (staff.bankAccountDetails.accountNumber) addField("Account Number", staff.bankAccountDetails.accountNumber);
    if (staff.bankAccountDetails.iban) addField("IBAN", staff.bankAccountDetails.iban);

    if (staff.subjectsTaught && staff.subjectsTaught.length > 0) {
      addField("Subjects Taught", staff.subjectsTaught.join(', '));
    }

    if (staff.degrees && staff.degrees.length > 0) {
      doc.setFontSize(14);
      doc.text("Degrees:", 14, yPos);
      yPos += 7;
      staff.degrees.forEach((degree, index) => {
        doc.setFontSize(12);
        addField(`  Degree ${index + 1}`, `${degree.degreeName} in ${degree.major} from ${degree.institution} (${degree.yearCompleted})`);
      });
    }

    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 14, yPos, 50, 50);
      doc.setFontSize(10);
      doc.text("QR Code for Attendance", 14, yPos + 55);
    }


    doc.save(`${staff.name}_StaffDetails.pdf`);
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto my-6 flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{editingStaff ? (isViewMode ? 'Staff Details' : 'Edit Staff') : 'Add New Staff'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {formError}</span>
        </div>
      )}

      <div className="overflow-y-auto pr-2 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Profile Picture Upload */}
          <div className="md:col-span-2 flex flex-col items-center">
            {staff.profilePictureUrl && (
              <img
                src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : `${backendBaseUrl}${staff.profilePictureUrl}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-3 border-2 border-purple-300"
              />
            )}
            {!isViewMode && (canEdit || canAdd) && (
              <div className="w-full">
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                  {staff.profilePictureUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  disabled={isViewMode  }
                />
                {fieldErrors.profilePicture && <p className="text-red-500 text-xs mt-1">{fieldErrors.profilePicture}</p>}
                {staff.profilePictureUrl && !profilePictureFile && (
                  <button
                    type="button"
                    onClick={() => setStaff(prev => ({ ...prev, profilePictureUrl: '' }))}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center"
                    title="Remove current profile picture"
                  >
                    <MinusCircleIcon className="h-4 w-4 mr-1" /> Remove Picture
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={staff.name}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          {/* CNIC */}
          <div>
            <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC</label>
            <input
              type="text"
              id="cnic"
              name="cnic"
              value={staff.cnic}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.cnic ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.cnic && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnic}</p>}
          </div>

          {/* Staff Type */}
          <div>
            <label htmlFor="staffType" className="block text-sm font-medium text-gray-700">Staff Type</label>
            <select
              id="staffType"
              name="staffType"
              value={staff.staffType}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.staffType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            >
              <option value="">Select Type</option>
              {staffTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {fieldErrors.staffType && <p className="text-red-500 text-xs mt-1">{fieldErrors.staffType}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={staff.contactNumber}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.contactNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactNumber}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={staff.email}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Date of Joining */}
          <div>
            <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700">Date of Joining</label>
            <input
              type="date"
              id="dateOfJoining"
              name="dateOfJoining"
              value={staff.dateOfJoining}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.dateOfJoining ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{fieldErrors.dateOfJoining}</p>}
          </div>

          {/* Salary */}
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary (PKR)</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={staff.salary}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border ${fieldErrors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
            {fieldErrors.salary && <p className="text-red-500 text-xs mt-1">{fieldErrors.salary}</p>}
          </div>

          {/* Emergency Contact */}
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="text"
              id="emergencyContact"
              name="emergencyContact"
              value={staff.emergencyContact}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            />
          </div>

          {/* Address - Full width */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="address"
              name="address"
              value={staff.address}
              onChange={handleChange}
              rows="3"
              className={`mt-1 block w-full p-2 border ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            ></textarea>
            {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
          </div>

          {/* Highest Education Level */}
          <div>
            <label htmlFor="highestEducationLevel" className="block text-sm font-medium text-gray-700">Highest Education Level</label>
            <select
              id="highestEducationLevel"
              name="highestEducationLevel"
              value={staff.highestEducationLevel}
              onChange={handleChange}
              className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
              disabled={isViewMode  }
            >
              {educationLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Subjects Taught (only for Teachers) */}
          {staff.staffType === 'Teacher' && (
            <div>
              <label htmlFor="subjectsTaught" className="block text-sm font-medium text-gray-700">Subjects Taught (comma-separated)</label>
              <input
                type="text"
                id="subjectsTaught"
                name="subjectsTaught"
                value={staff.subjectsTaught.join(', ')}
                onChange={handleSubjectsTaughtChange}
                className={`mt-1 block w-full p-2 border ${fieldErrors.subjectsTaught ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                placeholder="e.g., Math, Science, English"
                disabled={isViewMode  }
              />
              {fieldErrors.subjectsTaught && <p className="text-red-500 text-xs mt-1">{fieldErrors.subjectsTaught}</p>}
            </div>
          )}

          {/* Bank Account Details */}
          <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={staff.bankAccountDetails.bankName}
                  onChange={handleNestedChange}
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                  disabled={isViewMode  }
                />
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={staff.bankAccountDetails.accountNumber}
                  onChange={handleNestedChange}
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                  disabled={isViewMode  }
                />
              </div>
              <div>
                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">IBAN</label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  value={staff.bankAccountDetails.iban}
                  onChange={handleNestedChange}
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                  disabled={isViewMode  }
                />
              </div>
            </div>
          </div>

          {/* Degrees Section */}
          <div className="md:col-span-2 border-t pt-4 mt-4 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Degrees / Qualifications</h3>
            {staff.degrees.map((degree, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border border-gray-200 rounded-md relative">
                <div className="md:col-span-1">
                  <label htmlFor={`degreeName-${index}`} className="block text-sm font-medium text-gray-700">Degree Name</label>
                  <input
                    type="text"
                    id={`degreeName-${index}`}
                    name="degreeName"
                    value={degree.degreeName}
                    onChange={(e) => handleDegreeChange(index, e)}
                    className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                    disabled={isViewMode  }
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`major-${index}`} className="block text-sm font-medium text-gray-700">Major</label>
                  <input
                    type="text"
                    id={`major-${index}`}
                    name="major"
                    value={degree.major}
                    onChange={(e) => handleDegreeChange(index, e)}
                    className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                    disabled={isViewMode  }
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`institution-${index}`} className="block text-sm font-medium text-gray-700">Institution</label>
                  <input
                    type="text"
                    id={`institution-${index}`}
                    name="institution"
                    value={degree.institution}
                    onChange={(e) => handleDegreeChange(index, e)}
                    className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                    disabled={isViewMode  }
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`yearCompleted-${index}`} className="block text-sm font-medium text-gray-700">Year Completed</label>
                  <input
                    type="text"
                    id={`yearCompleted-${index}`}
                    name="yearCompleted"
                    value={degree.yearCompleted}
                    onChange={(e) => handleDegreeChange(index, e)}
                    className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${isViewMode   ? 'bg-gray-50' : ''}`}
                    disabled={isViewMode }
                  />
                </div>
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => removeDegree(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Remove Degree"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {!isViewMode && (
              <button
                type="button"
                onClick={addDegree}
                className="mt-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
              >
                + Add Degree
              </button>
            )}
          </div>
          {staff.qrCodeSecret && (
            <div className="md:col-span-2 flex flex-col items-center border-t pt-4 mt-4 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Attendance QR Code</h3>
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 border border-gray-300 p-2 rounded-md" />
              ) : (
                <p className="text-sm text-gray-500">Generating QR code...</p>
              )}
              <p className="text-xs text-gray-400 mt-2">Scan this QR code for attendance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
        {isViewMode && editingStaff && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
            title="Download Staff Details as PDF"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        )}
        {!isViewMode && (
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
          >
            {editingStaff ? 'Update Staff' : 'Add Staff'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-sm w-full sm:w-auto"
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;