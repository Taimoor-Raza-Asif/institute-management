// // // src/components/StudentForm.jsx
// // import React, { useState, useEffect } from 'react';
// // import api from '../api';
// // import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// // import jsPDF from 'jspdf';

// // const degreeYearsMap = {
// //   'Islamiyat': 4,
// //   'Software Engineering': 4,
// //   'Honors': 2,
// //   '-': null
// // };

// // const StudentForm = ({ editingStudent, fetchStudents, onClose, isViewMode = false }) => {
// //   const initialState = {
// //     name: '',
// //     fatherName: '',
// //     cnic: '',
// //     dob: '',
// //     gender: '',
// //     email: '',
// //     admissionDate: '',
// //     guardianContact: '',
// //     additionalContact: '',
// //     address: '',
// //     studentStatus: 'Regular',
// //     reason: '',
// //     class: '',
// //     classNumber: '',
// //     majorSubject: '',
// //     degreeName: '',
// //     semester: '',
// //     feePerMonth: '',
// //     profilePictureUrl: '',
// //     depositedAmount: '',
// //     otherDues: '',
// //   };
// //   const [student, setStudent] = useState(initialState);
// //   const [selectedFile, setSelectedFile] = useState(null);
// //   const [generalFormError, setGeneralFormError] = useState('');
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const backendBaseUrl = 'http://localhost:5000';

// //   useEffect(() => {
// //     if (editingStudent) {
// //       setStudent({
// //         ...editingStudent,
// //         dob: editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : '',
// //         admissionDate: editingStudent.admissionDate ? new Date(editingStudent.admissionDate).toISOString().split('T')[0] : '',
// //         profilePictureUrl: editingStudent.profilePictureUrl || '',
// //         feePerMonth: editingStudent.feePerMonth !== undefined ? editingStudent.feePerMonth.toString() : '',
// //         reason: editingStudent.reason || '',
// //         depositedAmount: editingStudent.depositedAmount !== undefined ? editingStudent.depositedAmount.toString() : '',
// //         otherDues: editingStudent.otherDues !== undefined ? editingStudent.otherDues.toString() : '',
// //       });
// //       setSelectedFile(null);
// //     } else {
// //       setStudent(initialState);
// //       setSelectedFile(null);
// //     }
// //     setGeneralFormError('');
// //     setFieldErrors({});
// //   }, [editingStudent]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setStudent(prev => ({ ...prev, [name]: value }));
// //     setFieldErrors(prev => ({ ...prev, [name]: '' }));
// //     setGeneralFormError('');
// //   };

// //   const handleFileChange = (e) => {
// //     setSelectedFile(e.target.files[0]);
// //     setStudent(prev => ({ ...prev, profilePictureUrl: '' }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setGeneralFormError('');
// //     setFieldErrors({});

// //     const newFieldErrors = {};
// //     let hasError = false;

// //     const requiredFields = ['name', 'fatherName', 'cnic', 'dob', 'gender', 'guardianContact', 'address', 'admissionDate', 'studentStatus', 'class', 'feePerMonth'];
// //     requiredFields.forEach(field => {
// //       if (!student[field]) {
// //         newFieldErrors[field] = 'This field is required.';
// //         hasError = true;
// //       }
// //     });

// //     if ((student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && !student.reason) {
// //       newFieldErrors.reason = 'Reason is required for Expelled or Withdrawn status.';
// //       hasError = true;
// //     }

// //     if (student.class === 'Class') {
// //       if (!student.classNumber) { newFieldErrors.classNumber = 'Class Number is required.'; hasError = true; }
// //       if (!student.majorSubject) { newFieldErrors.majorSubject = 'Major Subject is required.'; hasError = true; }
// //     } else if (student.class === 'BS') {
// //       if (!student.degreeName) { newFieldErrors.degreeName = 'Degree Name is required.'; hasError = true; }
// //       if (!student.semester) { newFieldErrors.semester = 'Semester is required.'; hasError = true; }
// //     }

// //     if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) <= 0) {
// //       newFieldErrors.feePerMonth = 'Fee Per Month must be a positive number.';
// //       hasError = true;
// //     }
// //     if (student.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)) {
// //       newFieldErrors.email = 'Please enter a valid email address.';
// //       hasError = true;
// //     }
// //     if (student.cnic && !/^\d{13}$/.test(student.cnic)) {
// //       newFieldErrors.cnic = 'CNIC must be 13 digits.';
// //       hasError = true;
// //     }
// //     if (student.guardianContact && !/^\d{11}$/.test(student.guardianContact)) {
// //       newFieldErrors.guardianContact = 'Guardian Contact must be 11 digits.';
// //       hasError = true;
// //     }
// //     if (student.additionalContact && student.additionalContact !== '' && !/^\d{11}$/.test(student.additionalContact)) {
// //       newFieldErrors.additionalContact = 'Additional Contact must be 11 digits.';
// //       hasError = true;
// //     }

// //     setFieldErrors(newFieldErrors);

// //     if (hasError) {
// //       setGeneralFormError('Please correct the errors in the form.');
// //       return;
// //     }

// //     const formData = new FormData();

// //     for (const key in student) {
// //       if (key !== 'profilePictureUrl' && student[key] !== null) {
// //         formData.append(key, student[key]);
// //       }
// //     }

// //     if (selectedFile) {
// //       formData.append('profilePicture', selectedFile);
// //     } else if (student.profilePictureUrl) {
// //       formData.append('profilePictureUrl', student.profilePictureUrl);
// //     } else {
// //       formData.append('profilePictureUrl', '');
// //     }

// //     try {
// //       if (editingStudent) {
// //         await api.put(`/students/${editingStudent._id}`, formData, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //       } else {
// //         await api.post('/students', formData, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //       }
// //       onClose();
// //     } catch (err) {
// //       console.error('Failed to save student:', err.response?.data || err.message);
// //       const errorMessage = err.response?.data?.message || err.message;

// //       if (errorMessage.includes('duplicate key error') && errorMessage.includes('cnic')) {
// //         setFieldErrors(prev => ({ ...prev, cnic: 'This CNIC is already registered.' }));
// //         setGeneralFormError('Failed to save student: Duplicate CNIC detected.');
// //       } else {
// //         setGeneralFormError('Failed to save student: ' + errorMessage);
// //       }
// //     }
// //   };

// //   const getTitle = () => {
// //     if (isViewMode) return 'Student Details';
// //     if (editingStudent) return 'Edit Student';
// //     return 'Add New Student';
// //   };

// //   const showReasonField = student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn';

// //   const handleDownloadPdf = async () => {
// //     const doc = new jsPDF();
// //     let yPos = 20;
// //     const margin = 30;
// //     const pageWidth = doc.internal.pageSize.getWidth();
// //     const columnGap = 30;
// //     const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

// //     // --- Institute Logo + Title ---
// //     const logo = new Image();
// //     logo.src = '/default-avatar.jpg';

// //     await new Promise((resolve) => {
// //       logo.onload = () => {
// //         doc.addImage(logo, 'JPEG', margin, yPos - 5, 15, 15);
// //         resolve();
// //       };
// //       logo.onerror = () => resolve();
// //     });

// //     doc.setFontSize(16);
// //     doc.setFont(undefined, 'bold');
// //     doc.text('Bright Future Institute', margin + 20, yPos);
// //     yPos += 7;
// //     doc.setFontSize(10);
// //     doc.setFont(undefined, 'normal');
// //     doc.text('123 Education St, Knowledge City', margin + 20, yPos);
// //     yPos += 5;
// //     doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', margin + 20, yPos);
// //     yPos += 12;

// //     // --- Title & Timestamp ---
// //     doc.setFontSize(14);
// //     doc.setFont(undefined, 'bold');
// //     doc.setTextColor(40, 167, 69);
// //     doc.text('Student Details', pageWidth / 2, yPos, { align: 'center' });
// //     yPos += 6;

// //     doc.setFontSize(9);
// //     doc.setFont(undefined, 'normal');
// //     doc.setTextColor(100);
// //     doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
// //     doc.setTextColor(0, 0, 0);
// //     yPos += 5;
// //     doc.line(margin, yPos, pageWidth - margin, yPos);
// //     yPos += 8;

// //     // --- Profile Picture Centered ---
// //     if (student.profilePictureUrl) {
// //       try {
// //         const img = new Image();
// //         img.src = `${backendBaseUrl}${student.profilePictureUrl}`;
// //         await new Promise((resolve) => {
// //           img.onload = () => {
// //             const imgWidth = 40;
// //             const imgHeight = (img.height * imgWidth) / img.width;
// //             const xOffset = (pageWidth - imgWidth) / 2;
// //             if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
// //               doc.addPage();
// //               yPos = margin;
// //             }
// //             doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
// //             yPos += imgHeight + 15;
// //             resolve();
// //           };
// //           img.onerror = () => resolve();
// //         });
// //       } catch {
// //         yPos += 10;
// //       }
// //     } else {
// //       doc.setFontSize(10);
// //       doc.setTextColor(150);
// //       doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
// //       doc.setTextColor(0, 0, 0);
// //       yPos += 10;
// //     }

// //     // --- Add Field Function (Two per row) ---
// //     const addTwoFields = (label1, value1, label2, value2) => {
// //       const addSingle = (x, label, value) => {
// //         doc.setFontSize(10);
// //         doc.setFont(undefined, 'bold');
// //         doc.text(`${label}:`, x, yPos);
// //         const labelWidth = doc.getTextWidth(`${label}:`);
// //         doc.setFont(undefined, 'normal');
// //         doc.text(`${value || '-'}`, x + labelWidth + 3, yPos);
// //       };

// //       // addSingle(margin, label1, value1);
// //       // addSingle(margin + columnWidth + columnGap, label2, value2);

// //       addSingle(margin, label1, value1);

// //       if (label2 && String(label2).trim() !== '') {
// //         addSingle(margin + columnWidth + columnGap, label2, value2);
// //       }
// //       yPos += 8;

// //       if (yPos > doc.internal.pageSize.getHeight() - margin) {
// //         doc.addPage();
// //         yPos = margin;
// //       }
// //     };

// //     const addFullWidthField = (label, value) => {
// //       doc.setFontSize(10);
// //       doc.setFont(undefined, 'bold');
// //       doc.text(`${label}:`, margin, yPos);
// //       const labelWidth = doc.getTextWidth(`${label}:`);
// //       doc.setFont(undefined, 'normal');
// //       const lines = doc.splitTextToSize(value || '-', pageWidth - margin * 2 - labelWidth - 4);
// //       doc.text(lines, margin + labelWidth + 4, yPos);
// //       yPos += lines.length * 7 + 2;

// //       if (yPos > doc.internal.pageSize.getHeight() - margin) {
// //         doc.addPage();
// //         yPos = margin;
// //       }
// //     };

// //     // --- Render Fields ---
// //     addTwoFields('Student Name', student.name, 'Father Name', student.fatherName);
// //     addTwoFields('CNIC', student.cnic, 'Gender', student.gender);
// //     addTwoFields('DOB', student.dob ? new Date(student.dob).toLocaleDateString() : '', 'Email', student.email);
// //     addTwoFields('Guardian Contact', student.guardianContact, 'Additional Contact', student.additionalContact);
// //     addTwoFields('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '', 'Student Status', student.studentStatus);
// //     addTwoFields('Class Type', student.class, '', '');
// //     addTwoFields('Deposited Amount', student.depositedAmount !== '' ? `PKR ${parseFloat(student.depositedAmount).toFixed(2)}` : '');
// //     addTwoFields('Other Dues', student.otherDues !== '' ? `PKR ${parseFloat(student.otherDues).toFixed(2)}` : '');
// //     if (showReasonField) addFullWidthField('Reason', student.reason);
// //     if (student.class === 'Class') {
// //       addTwoFields('Class Number', student.classNumber, 'Major Subject', student.majorSubject);
// //     } else if (student.class === 'BS') {
// //       addTwoFields('Degree Name', student.degreeName, 'Semester', student.semester);
// //       addFullWidthField('Degree Years', degreeYearsMap[student.degreeName] || '-');
// //     }
// //     addFullWidthField('Address', student.address);
// //     addTwoFields('Fee Per Month', student.feePerMonth, '', '');
// //     // Save
// //     doc.save(`${student.name.replace(/\s/g, '_')}_details.pdf`);
// //   };



// //   return (
// //     // Main container for the form, now a flex column with a constrained height and padding
// //     <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
// //       {/* Header Section (fixed at top) */}
// //       <div className="flex-shrink-0 relative">
// //         <button
// //           onClick={onClose}
// //           className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100"
// //           title="Close"
// //         >
// //           <XMarkIcon className="h-7 w-7" />
// //         </button>
// //         <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-indigo-700">{getTitle()}</h2>
// //         <hr className="mb-6 border-indigo-200" />

// //         {generalFormError && (
// //           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
// //             {generalFormError}
// //           </div>
// //         )}
// //       </div>

// //       {/* Scrollable Form Content Area (takes remaining vertical space) */}
// //       <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar"> {/* pr-2 for scrollbar spacing */}
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
// //           <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
// //             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 pr-10">
// //               Profile Picture<span className="text-red-500"></span>
// //             </label>

// //             {!isViewMode ? (
// //               <input
// //                 type="file"
// //                 id="profilePicture"
// //                 name="profilePicture"
// //                 onChange={handleFileChange}
// //                 className="inline w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
// //               />
// //             ) : null}

// //             <div className="mt-4 flex flex-col pr-10 items-center w-full">
// //               {selectedFile ? (
// //                 <img
// //                   src={URL.createObjectURL(selectedFile)}
// //                   alt="Profile"
// //                   className="h-28 w-28 object-cover rounded-full border-4 border-indigo-200 shadow-md"
// //                 />
// //               ) : student.profilePictureUrl ? (
// //                 isViewMode ? (
// //                   <a
// //                     href={`${backendBaseUrl}${student.profilePictureUrl}`}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                   >
// //                     <img
// //                       src={`${backendBaseUrl}${student.profilePictureUrl}`}
// //                       alt="Profile"
// //                       className="h-28 w-28 object-cover rounded-full border-4 border-indigo-200 shadow-md cursor-pointer"
// //                       onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
// //                     />
// //                   </a>
// //                 ) : (
// //                   <img
// //                     src={`${backendBaseUrl}${student.profilePictureUrl}`}
// //                     alt="Profile"
// //                     className="h-28 w-28 object-cover rounded-full border-4 border-indigo-200 shadow-md"
// //                     onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-avatar.png'; }}
// //                   />
// //                 )
// //               ) : (
// //                 <p className="text-gray-500 text-sm mt-2">-</p>
// //               )}

// //               {!isViewMode && student.profilePictureUrl && (
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setStudent(prev => ({ ...prev, profilePictureUrl: '' }));
// //                     setSelectedFile(null);
// //                   }}
// //                   className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
// //                 >
// //                   Clear Image
// //                 </button>
// //               )}
// //             </div>
// //           </div>


// //           {/* Student Name */}
// //           {/* <div>
// //             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Student Name<span className="text-red-500">*</span></label>
// //             <input type="text" id="name" name="name" value={student.name} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.name ? 'border-red-500' : ''}`} />
// //             {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
// //           </div> */}

// //           <div className="flex flex-col justify-center h-full">
// //             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
// //               Student Name<span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="text"
// //               id="name"
// //               name="name"
// //               value={student.name}
// //               onChange={handleChange}
// //               disabled={isViewMode}
// //               className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.name ? 'border-red-500' : ''}`}
// //             />
// //             {fieldErrors.name && (
// //               <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
// //             )}
// //           </div>

// //           {/* Father Name */}
// //           {/* <div>
// //             <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">Father Name<span className="text-red-500">*</span></label>
// //             <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.fatherName ? 'border-red-500' : ''}`} />
// //             {fieldErrors.fatherName && <p className="text-red-500 text-sm mt-1">{fieldErrors.fatherName}</p>}
// //           </div> */}
// //           <div className="flex flex-col justify-center h-full">
// //             <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
// //               Father Name<span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="text"
// //               id="fatherName"
// //               name="fatherName"
// //               value={student.fatherName}
// //               onChange={handleChange}
// //               disabled={isViewMode}
// //               className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.fatherName ? 'border-red-500' : ''}`}
// //             />
// //             {fieldErrors.fatherName && (
// //               <p className="text-red-500 text-sm mt-1">{fieldErrors.fatherName}</p>
// //             )}
// //           </div>

// //           {/* CNIC */}
// //           {/* <div>
// //             <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC<span className="text-red-500">*</span></label>
// //             <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.cnic ? 'border-red-500' : ''}`} placeholder="XXXXX-XXXXXXX-X" />
// //             {fieldErrors.cnic && <p className="text-red-500 text-sm mt-1">{fieldErrors.cnic}</p>}
// //           </div> */}
// //           <div className="flex flex-col justify-center h-full">
// //             <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">
// //               CNIC<span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="text"
// //               id="cnic"
// //               name="cnic"
// //               value={student.cnic}
// //               onChange={handleChange}
// //               disabled={isViewMode}
// //               placeholder="XXXXX-XXXXXXX-X"
// //               className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.cnic ? 'border-red-500' : ''}`}
// //             />
// //             {fieldErrors.cnic && (
// //               <p className="text-red-500 text-sm mt-1">{fieldErrors.cnic}</p>
// //             )}
// //           </div>

// //           {/* Date of Birth */}
// //           <div>
// //             <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth<span className="text-red-500">*</span></label>
// //             <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.dob ? 'border-red-500' : ''}`} />
// //             {fieldErrors.dob && <p className="text-red-500 text-sm mt-1">{fieldErrors.dob}</p>}
// //           </div>
// //           {/* Gender */}
// //           <div>
// //             <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender<span className="text-red-500">*</span></label>
// //             <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.gender ? 'border-red-500' : ''}`}>
// //               <option value="">Select Gender</option>
// //               <option value="Male">Male</option>
// //               <option value="Female">Female</option>
// //               <option value="Other">Other</option>
// //             </select>
// //             {fieldErrors.gender && <p className="text-red-500 text-sm mt-1">{fieldErrors.gender}</p>}
// //           </div>
// //           {/* Guardian Contact */}
// //           <div>
// //             <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact<span className="text-red-500">*</span></label>
// //             <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.guardianContact ? 'border-red-500' : ''}`} />
// //             {fieldErrors.guardianContact && <p className="text-red-500 text-sm mt-1">{fieldErrors.guardianContact}</p>}
// //           </div>
// //           {/* Additional Contact */}
// //           <div>
// //             <label htmlFor="additionalContact" className="block text-sm font-medium text-gray-700 mb-1">Additional Contact</label>
// //             <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.additionalContact ? 'border-red-500' : ''}`} />
// //             {fieldErrors.additionalContact && <p className="text-red-500 text-sm mt-1">{fieldErrors.additionalContact}</p>}
// //           </div>
// //           {/* Email */}
// //           <div>
// //             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
// //             <input type="email" id="email" name="email" value={student.email} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.email ? 'border-red-500' : ''}`} />
// //             {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
// //           </div>
// //           {/* Address */}
// //           <div className="sm:col-span-2 lg:col-span-1"> {/* This will take 2 columns on small screens, 1 on large */}
// //             <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address<span className="text-red-500">*</span></label>
// //             <textarea id="address" name="address" value={student.address} onChange={handleChange} disabled={isViewMode} rows="1" className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-20 p-2.5 transition duration-150 ease-in-out ${fieldErrors.address ? 'border-red-500' : ''}`}></textarea>
// //             {fieldErrors.address && <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>}
// //           </div>
// //           {/* Admission Date */}
// //           <div>
// //             <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">Admission Date<span className="text-red-500">*</span></label>
// //             <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.admissionDate ? 'border-red-500' : ''}`} />
// //             {fieldErrors.admissionDate && <p className="text-red-500 text-sm mt-1">{fieldErrors.admissionDate}</p>}
// //           </div>
// //           {/* Student Status */}
// //           <div>
// //             <label htmlFor="studentStatus" className="block text-sm font-medium text-gray-700 mb-1">Student Status<span className="text-red-500">*</span></label>
// //             <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.studentStatus ? 'border-red-500' : ''}`}>
// //               <option value="Regular">Regular</option>
// //               <option value="Withdrawn">Withdrawn</option>
// //               <option value="Graduated">Graduated</option>
// //               <option value="Expelled">Expelled</option>
// //             </select>
// //             {fieldErrors.studentStatus && <p className="text-red-500 text-sm mt-1">{fieldErrors.studentStatus}</p>}
// //           </div>
// //           {/* Reason Field (conditionally rendered) */}
// //           {showReasonField && (
// //             <div className="sm:col-span-2 lg:col-span-3"> {/* This will take full width on small/medium, and 3 columns on large */}
// //               <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-500">*</span></label>
// //               <textarea
// //                 id="reason"
// //                 name="reason"
// //                 value={student.reason}
// //                 onChange={handleChange}
// //                 disabled={isViewMode}
// //                 rows="3"
// //                 className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.reason ? 'border-red-500' : ''}`}
// //                 placeholder="Provide a reason for withdrawal or expulsion"
// //               ></textarea>
// //               {fieldErrors.reason && <p className="text-red-500 text-sm mt-1">{fieldErrors.reason}</p>}
// //             </div>
// //           )}
// //           {/* Class Type */}
// //           <div>
// //             <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class Type<span className="text-red-500">*</span></label>
// //             <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.class ? 'border-red-500' : ''}`}>
// //               <option value="">Select Class Type</option>
// //               <option value="Class">Class (1-12)</option>
// //               <option value="BS">BS Level</option>
// //             </select>
// //             {fieldErrors.class && <p className="text-red-500 text-sm mt-1">{fieldErrors.class}</p>}
// //           </div>

// //           {student.class === 'Class' && (
// //             <>
// //               <div>
// //                 <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-1">Class Number<span className="text-red-500">*</span></label>
// //                 <select id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.classNumber ? 'border-red-500' : ''}`}>
// //                   <option value="">Select Class</option>
// //                   {[...Array(12)].map((_, i) => (
// //                     <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
// //                   ))}
// //                 </select>
// //                 {fieldErrors.classNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.classNumber}</p>}
// //               </div>
// //               <div>
// //                 <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700 mb-1">Major Subject<span className="text-red-500">*</span></label>
// //                 <select id="majorSubject" name="majorSubject" value={student.majorSubject} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.majorSubject ? 'border-red-500' : ''}`}>
// //                   <option value="">Select Subject</option>
// //                   <option value="Arts">Arts</option>
// //                   <option value="Science">Science</option>
// //                 </select>
// //                 {fieldErrors.majorSubject && <p className="text-red-500 text-sm mt-1">{fieldErrors.majorSubject}</p>}
// //               </div>
// //             </>
// //           )}

// //           {student.class === 'BS' && (
// //             <>
// //               <div>
// //                 <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700 mb-1">Degree Name<span className="text-red-500">*</span></label>
// //                 <select id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.degreeName ? 'border-red-500' : ''}`}>
// //                   <option value="">Select Degree</option>
// //                   <option value="Islamiyat">Islamiyat</option>
// //                   <option value="Software Engineering">Software Engineering</option>
// //                   <option value="Honors">Honors</option>
// //                 </select>
// //                 {fieldErrors.degreeName && <p className="text-red-500 text-sm mt-1">{fieldErrors.degreeName}</p>}
// //               </div>
// //               <div>
// //                 <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester<span className="text-red-500">*</span></label>
// //                 <select id="semester" name="semester" value={student.semester} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.semester ? 'border-red-500' : ''}`}>
// //                   <option value="">Select Semester</option>
// //                   {[...Array(8)].map((_, i) => (
// //                     <option key={i + 1} value={i + 1}>{i + 1}</option>
// //                   ))}
// //                 </select>
// //                 {fieldErrors.semester && <p className="text-red-500 text-sm mt-1">{fieldErrors.semester}</p>}
// //               </div>
// //               {student.degreeName && (
// //                 <div>
// //                   <p className="block text-sm font-medium text-gray-700 mb-1">Degree Years:</p>
// //                   <p className="p-2.5 text-gray-900 font-bold">{degreeYearsMap[student.degreeName] || '-'} years</p>
// //                 </div>
// //               )}
// //             </>
// //           )}

// //           {/* Fee Per Month */}
// //           <div>
// //             <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700 mb-1">Fee Per Month<span className="text-red-500">*</span></label>
// //             <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.feePerMonth ? 'border-red-500' : ''}`} />
// //             {fieldErrors.feePerMonth && <p className="text-red-500 text-sm mt-1">{fieldErrors.feePerMonth}</p>}
// //           </div>
// //           <div>
// //             <label htmlFor="depositedAmount" className="block text-sm font-medium text-gray-700">Deposited Amount (Advance)</label>
// //             <input
// //               type="number"
// //               id="depositedAmount"
// //               name="depositedAmount"
// //               value={student.depositedAmount}
// //               onChange={handleChange}
// //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
// //               disabled={isViewMode}
// //             />
// //           </div>
// //           <div>
// //             <label htmlFor="otherDues" className="block text-sm font-medium text-gray-700">Other Dues (Fines, etc.)</label>
// //             <input
// //               type="number"
// //               id="otherDues"
// //               name="otherDues"
// //               value={student.otherDues}
// //               onChange={handleChange}
// //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
// //               disabled={isViewMode}
// //             />
// //           </div>
// //           {/* --- END NEW INPUT FIELDS ---
// //           </div> */}


// //         </div>
// //       </form>

// //       {/* Footer Section (fixed at bottom) */}
// //       <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
// //         {isViewMode && (
// //           <button
// //             type="button"
// //             onClick={handleDownloadPdf}
// //             className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
// //             title="Download Student Details as PDF"
// //           >
// //             <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
// //             Download PDF
// //           </button>
// //         )}
// //         {!isViewMode && (
// //           <button
// //             type="submit"
// //             onClick={handleSubmit}
// //             className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
// //           >
// //             {editingStudent ? 'Update Student' : 'Add Student'}
// //           </button>
// //         )}
// //         <button
// //           type="button"
// //           onClick={onClose}
// //           className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-md w-full sm:w-auto"
// //         >
// //           {isViewMode ? 'Close' : 'Cancel'}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default StudentForm;




// // src/components/StudentForm.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { XMarkIcon, ArrowDownTrayIcon, MinusCircleIcon } from '@heroicons/react/24/outline'; // Added MinusCircleIcon for file removal
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable'; // For better table generation in PDF

// const degreeYearsMap = {
//   'Islamiyat': 4,
//   'Software Engineering': 4,
//   'Honors': 2,
//   '-': null
// };

// // Helper to calculate age from DOB
// const calculateAge = (dobString) => {
//   if (!dobString) return null;
//   const dob = new Date(dobString);
//   const today = new Date();
//   let age = today.getFullYear() - dob.getFullYear();
//   const m = today.getMonth() - dob.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
//   return age;
// };

// const StudentForm = ({ editingStudent, fetchStudents, onClose, isViewMode = false }) => {
//   const initialState = {
//     name: '',
//     fatherName: '',
//     cnic: '',
//     dob: '',
//     gender: '',
//     email: '',
//     admissionDate: '',
//     guardianContact: '',
//     additionalContact: '',
//     address: '',
//     studentStatus: 'Regular',
//     reason: '',
//     class: '',
//     classNumber: '',
//     majorSubject: '',
//     degreeName: '',
//     semester: '',
//     feePerMonth: '',
//     profilePictureUrl: '',
//     depositedAmount: '',
//     otherDues: '',
//     // New document fields
//     cnicFrontUrl: '',
//     cnicBackUrl: '',
//     bFormUrl: '',
//     characterCertificateUrl: '',
//     previousClassResultUrl: '', // For Class >= 9
//     class10ResultUrl: '',       // For BS students
//     class12ResultUrl: '',       // For BS students
//   };
//   const [student, setStudent] = useState(initialState);
//   const [profilePictureFile, setProfilePictureFile] = useState(null);
//   const [cnicFrontFile, setCnicFrontFile] = useState(null);
//   const [cnicBackFile, setCnicBackFile] = useState(null);
//   const [bFormFile, setBFormFile] = useState(null);
//   const [characterCertificateFile, setCharacterCertificateFile] = useState(null);
//   const [previousClassResultFile, setPreviousClassResultFile] = useState(null);
//   const [class10ResultFile, setClass10ResultFile] = useState(null);
//   const [class12ResultFile, setClass12ResultFile] = useState(null);

//   const [generalFormError, setGeneralFormError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
//   const backendBaseUrl = 'http://localhost:5000';

//   useEffect(() => {
//     if (editingStudent) {
//       setStudent({
//         ...editingStudent,
//         dob: editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : '',
//         admissionDate: editingStudent.admissionDate ? new Date(editingStudent.admissionDate).toISOString().split('T')[0] : '',
//         profilePictureUrl: editingStudent.profilePictureUrl || '',
//         feePerMonth: editingStudent.feePerMonth !== undefined ? editingStudent.feePerMonth.toString() : '',
//         reason: editingStudent.reason || '',
//         depositedAmount: editingStudent.depositedAmount !== undefined ? editingStudent.depositedAmount.toString() : '',
//         otherDues: editingStudent.otherDues !== undefined ? editingStudent.otherDues.toString() : '',
//         // Initialize new document URLs
//         cnicFrontUrl: editingStudent.cnicFrontUrl || '',
//         cnicBackUrl: editingStudent.cnicBackUrl || '',
//         bFormUrl: editingStudent.bFormUrl || '',
//         characterCertificateUrl: editingStudent.characterCertificateUrl || '',
//         previousClassResultUrl: editingStudent.previousClassResultUrl || '',
//         class10ResultUrl: editingStudent.class10ResultUrl || '',
//         class12ResultUrl: editingStudent.class12ResultUrl || '',
//       });
//       // Clear file inputs when editing an existing student, as URLs are used
//       setProfilePictureFile(null);
//       setCnicFrontFile(null);
//       setCnicBackFile(null);
//       setBFormFile(null);
//       setCharacterCertificateFile(null);
//       setPreviousClassResultFile(null);
//       setClass10ResultFile(null);
//       setClass12ResultFile(null);

//     } else {
//       setStudent(initialState);
//       // Clear all file states for a new form
//       setProfilePictureFile(null);
//       setCnicFrontFile(null);
//       setCnicBackFile(null);
//       setBFormFile(null);
//       setCharacterCertificateFile(null);
//       setPreviousClassResultFile(null);
//       setClass10ResultFile(null);
//       setClass12ResultFile(null);
//     }
//     setGeneralFormError('');
//     setFieldErrors({});
//   }, [editingStudent]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setStudent(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' }));
//     setGeneralFormError('');
//   };

//   // Generic file handler for new document fields
//   const handleDocumentFileChange = (e, setFileState, urlFieldName) => {
//     const file = e.target.files[0];
//     setFileState(file);
//     // Clear the existing URL for this field if a new file is selected
//     setStudent(prev => ({ ...prev, [urlFieldName]: '' }));
//   };

//   const handleRemoveDocumentFile = (setFileState, urlFieldName) => {
//     setFileState(null);
//     setStudent(prev => ({ ...prev, [urlFieldName]: '' })); // Clear the URL in state
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setGeneralFormError('');
//     setFieldErrors({});

//     const newFieldErrors = {};
//     let hasError = false;

//     const requiredFields = ['name', 'fatherName', 'cnic', 'dob', 'gender', 'guardianContact', 'address', 'admissionDate', 'studentStatus', 'class', 'feePerMonth'];
//     requiredFields.forEach(field => {
//       if (!student[field]) {
//         newFieldErrors[field] = 'This field is required.';
//         hasError = true;
//       }
//     });

//     if ((student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && !student.reason) {
//       newFieldErrors.reason = 'Reason is required for Expelled or Withdrawn status.';
//       hasError = true;
//     }

//     if (student.class === 'Class') {
//       if (!student.classNumber) { newFieldErrors.classNumber = 'Class Number is required.'; hasError = true; }
//       if (!student.majorSubject) { newFieldErrors.majorSubject = 'Major Subject is required.'; hasError = true; }
//     } else if (student.class === 'BS') {
//       if (!student.degreeName) { newFieldErrors.degreeName = 'Degree Name is required.'; hasError = true; }
//       if (!student.semester) { newFieldErrors.semester = 'Semester is required.'; hasError = true; }
//     }

//     if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) <= 0) {
//       newFieldErrors.feePerMonth = 'Fee Per Month must be a positive number.';
//       hasError = true;
//     }
//     if (student.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)) {
//       newFieldErrors.email = 'Please enter a valid email address.';
//       hasError = true;
//     }
//     if (student.cnic && !/^\d{13}$/.test(student.cnic)) {
//       newFieldErrors.cnic = 'CNIC must be 13 digits.';
//       hasError = true;
//     }
//     if (student.guardianContact && !/^\d{11}$/.test(student.guardianContact)) {
//       newFieldErrors.guardianContact = 'Guardian Contact must be 11 digits.';
//       hasError = true;
//     }
//     if (student.additionalContact && student.additionalContact !== '' && !/^\d{11}$/.test(student.additionalContact)) {
//       newFieldErrors.additionalContact = 'Additional Contact must be 11 digits.';
//       hasError = true;
//     }

//     // --- New Document Field Validations ---
//     const studentAge = calculateAge(student.dob);
//     const isAdult = studentAge !== null && studentAge >= 18;
//     const isClass9OrAbove = student.class === 'Class' && parseInt(student.classNumber) >= 9;
//     const isBsStudent = student.class === 'BS';

//     if (isAdult) {
//       // If CNIC is provided, require CNIC photos
//       if (student.cnic && student.cnic.length === 13) {
//         if (!cnicFrontFile && !student.cnicFrontUrl) {
//           newFieldErrors.cnicFrontUrl = 'CNIC Front Photo is required.'; hasError = true;
//         }
//         if (!cnicBackFile && !student.cnicBackUrl) {
//           newFieldErrors.cnicBackUrl = 'CNIC Back Photo is required.'; hasError = true;
//         }
//       } else { // If CNIC not provided or invalid, require B-Form
//         if (!bFormFile && !student.bFormUrl) {
//           newFieldErrors.bFormUrl = 'B-Form Copy is required if CNIC is not provided/valid.'; hasError = true;
//         }
//       }
//     } else { // For minors, B-Form is required
//       if (!bFormFile && !student.bFormUrl) {
//         newFieldErrors.bFormUrl = 'B-Form Copy is required for students under 18.'; hasError = true;
//       }
//     }

//     if (!characterCertificateFile && !student.characterCertificateUrl) {
//       newFieldErrors.characterCertificateUrl = 'Character Certificate is required.'; hasError = true;
//     }

//     if (isClass9OrAbove) {
//       if (!previousClassResultFile && !student.previousClassResultUrl) {
//         newFieldErrors.previousClassResultUrl = 'Previous Class Result is required for Class 9 and above.'; hasError = true;
//       }
//     }
//     if (isBsStudent) {
//       if (!class10ResultFile && !student.class10ResultUrl) {
//         newFieldErrors.class10ResultUrl = 'Class 10 Result is required for BS students.'; hasError = true;
//       }
//       if (!class12ResultFile && !student.class12ResultUrl) {
//         newFieldErrors.class12ResultUrl = 'Class 12 Result is required for BS students.'; hasError = true;
//       }
//     }
//     // --- End New Document Field Validations ---


//     setFieldErrors(newFieldErrors);

//     if (hasError) {
//       setGeneralFormError('Please correct the errors in the form before submitting.');
//       return;
//     }

//     const formData = new FormData();

//     // Append all student fields
//     for (const key in student) {
//       // Exclude file URLs from direct append, as they are handled separately by file inputs
//       if (!key.endsWith('Url') && student[key] !== null) {
//         formData.append(key, student[key]);
//       }
//     }

//     // Append files or their existing URLs
//     const appendFileOrUrl = (file, url, fieldName) => {
//       if (file) {
//         formData.append(fieldName, file);
//       } else if (url) {
//         formData.append(`${fieldName}Url`, url);
//       } else {
//         formData.append(`${fieldName}Url`, ''); // Explicitly clear if no file and no URL
//       }
//     };

//     appendFileOrUrl(profilePictureFile, student.profilePictureUrl, 'profilePicture');
//     appendFileOrUrl(cnicFrontFile, student.cnicFrontUrl, 'cnicFront');
//     appendFileOrUrl(cnicBackFile, student.cnicBackUrl, 'cnicBack');
//     appendFileOrUrl(bFormFile, student.bFormUrl, 'bForm');
//     appendFileOrUrl(characterCertificateFile, student.characterCertificateUrl, 'characterCertificate');
//     appendFileOrUrl(previousClassResultFile, student.previousClassResultUrl, 'previousClassResult');
//     appendFileOrUrl(class10ResultFile, student.class10ResultUrl, 'class10Result');
//     appendFileOrUrl(class12ResultFile, student.class12ResultUrl, 'class12Result');

//     try {
//       if (editingStudent) {
//         await api.put(`/students/${editingStudent._id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         await api.post('/students', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }
//       fetchStudents(); // Refresh student list in parent component
//       onClose();
//     } catch (err) {
//       console.error('Failed to save student:', err.response?.data || err.message);
//       const errorMessage = err.response?.data?.message || err.message;

//       if (errorMessage.includes('duplicate key error') && errorMessage.includes('cnic')) {
//         setFieldErrors(prev => ({ ...prev, cnic: 'This CNIC is already registered.' }));
//         setGeneralFormError('Failed to save student: Duplicate CNIC detected.');
//       } else if (err.response?.data?.errors) {
//         // Handle Mongoose validation errors
//         const backendErrors = err.response.data.errors;
//         const newErrors = {};
//         for (const key in backendErrors) {
//           newErrors[key] = backendErrors[key].message;
//         }
//         setFieldErrors(prev => ({ ...prev, ...newErrors }));
//         setGeneralFormError('Failed to save student: Please correct the highlighted fields.');
//       }
//       else {
//         setGeneralFormError('Failed to save student: ' + errorMessage);
//       }
//     }
//   };

//   const getTitle = () => {
//     if (isViewMode) return 'Student Details';
//     if (editingStudent) return 'Edit Student';
//     return 'Add New Student';
//   };

//   const showReasonField = student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn';
//   const studentAge = calculateAge(student.dob);
//   const isAdult = studentAge !== null && studentAge >= 18;
//   const isClass9OrAbove = student.class === 'Class' && parseInt(student.classNumber) >= 9;
//   const isBsStudent = student.class === 'BS';

//   // Determine which ID proof fields to show
//   const showCnicFields = isAdult && student.cnic && student.cnic.length === 13;
//   const showBFormField = !isAdult || (isAdult && (!student.cnic || student.cnic.length !== 13));

//   // Determine which result fields to show
//   const showPreviousClassResultField = isClass9OrAbove;
//   const showBsResultsFields = isBsStudent;


//   const handleDownloadPdf = async () => {
//     const doc = new jsPDF();
//     let yPos = 20;
//     const margin = 30;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const columnGap = 30;
//     const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

//     // --- Institute Logo + Title ---
//     const logo = new Image();
//     logo.src = '/default-avatar.jpg';

//     await new Promise((resolve) => {
//       logo.onload = () => {
//         doc.addImage(logo, 'JPEG', margin, yPos - 5, 15, 15);
//         resolve();
//       };
//       logo.onerror = () => resolve();
//     });

//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
//     doc.text('Bright Future Institute', margin + 20, yPos);
//     yPos += 7;
//     doc.setFontSize(10);
//     doc.setFont(undefined, 'normal');
//     doc.text('123 Education St, Knowledge City', margin + 20, yPos);
//     yPos += 5;
//     doc.text('Phone: (042) 1234567 | Email: info@bfi.edu.pk', margin + 20, yPos);
//     yPos += 12;

//     // --- Title & Timestamp ---
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(40, 167, 69);
//     doc.text('Student Details', pageWidth / 2, yPos, { align: 'center' });
//     yPos += 6;

//     doc.setFontSize(9);
//     doc.setFont(undefined, 'normal');
//     doc.setTextColor(100);
//     doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
//     doc.setTextColor(0, 0, 0);
//     yPos += 5;
//     doc.line(margin, yPos, pageWidth - margin, yPos);
//     yPos += 8;

//     // --- Profile Picture Centered ---
//     if (student.profilePictureUrl) {
//       try {
//         const img = new Image();
//         img.src = `${backendBaseUrl}${student.profilePictureUrl}`;
//         await new Promise((resolve) => {
//           img.onload = () => {
//             const imgWidth = 40;
//             const imgHeight = (img.height * imgWidth) / img.width;
//             const xOffset = (pageWidth - imgWidth) / 2;
//             if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
//               doc.addPage();
//               yPos = margin;
//             }
//             doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
//             yPos += imgHeight + 15;
//             resolve();
//           };
//           img.onerror = () => resolve();
//         });
//       } catch {
//         yPos += 10;
//       }
//     } else {
//       doc.setFontSize(10);
//       doc.setTextColor(150);
//       doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
//       doc.setTextColor(0, 0, 0);
//       yPos += 10;
//     }

//     // --- Add Field Function (Two per row) ---
//     const addTwoFields = (label1, value1, label2, value2) => {
//       const addSingle = (x, label, value) => {
//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text(`${label}:`, x, yPos);
//         const labelWidth = doc.getTextWidth(`${label}:`);
//         doc.setFont(undefined, 'normal');
//         doc.text(`${value || '-'}`, x + labelWidth + 3, yPos);
//       };

//       addSingle(margin, label1, value1);

//       if (label2 && String(label2).trim() !== '') {
//         addSingle(margin + columnWidth + columnGap, label2, value2);
//       }
//       yPos += 8;

//       if (yPos > doc.internal.pageSize.getHeight() - margin) {
//         doc.addPage();
//         yPos = margin;
//       }
//     };

//     const addFullWidthField = (label, value) => {
//       doc.setFontSize(10);
//       doc.setFont(undefined, 'bold');
//       doc.text(`${label}:`, margin, yPos);
//       const labelWidth = doc.getTextWidth(`${label}:`);
//       doc.setFont(undefined, 'normal');
//       const lines = doc.splitTextToSize(value || '-', pageWidth - margin * 2 - labelWidth - 4);
//       doc.text(lines, margin + labelWidth + 4, yPos);
//       yPos += lines.length * 7 + 2;

//       if (yPos > doc.internal.pageSize.getHeight() - margin) {
//         doc.addPage();
//         yPos = margin;
//       }
//     };

//     const addDocumentFieldToPdf = async (label, url) => {
//       if (url) {
//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text(`${label}:`, margin, yPos);
//         doc.setFont(undefined, 'normal');
//         doc.setTextColor(0, 0, 255); // Blue color for link
//         doc.textWithLink('View Document', margin + doc.getTextWidth(`${label}: `), yPos, { url: `${backendBaseUrl}${url}` });
//         doc.setTextColor(0, 0, 0); // Reset color
//         yPos += 8;
//       } else {
//         doc.setFontSize(10);
//         doc.setFont(undefined, 'bold');
//         doc.text(`${label}:`, margin, yPos);
//         doc.setFont(undefined, 'normal');
//         doc.text('N/A', margin + doc.getTextWidth(`${label}: `), yPos);
//         yPos += 8;
//       }
//       if (yPos > doc.internal.pageSize.getHeight() - margin) {
//         doc.addPage();
//         yPos = margin;
//       }
//     };


//     // --- Render Fields ---
//     addTwoFields('Student Name', student.name, 'Father Name', student.fatherName);
//     addTwoFields('CNIC', student.cnic, 'Gender', student.gender);
//     addTwoFields('DOB', student.dob ? new Date(student.dob).toLocaleDateString() : '', 'Email', student.email);
//     addTwoFields('Guardian Contact', student.guardianContact, 'Additional Contact', student.additionalContact);
//     addTwoFields('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '', 'Student Status', student.studentStatus);
//     addTwoFields('Class Type', student.class, 'Fee Per Month', student.feePerMonth);
//     addTwoFields('Deposited Amount', student.depositedAmount !== '' ? `PKR ${parseFloat(student.depositedAmount).toFixed(2)}` : 'PKR 0.00', 'Other Dues', student.otherDues !== '' ? `PKR ${parseFloat(student.otherDues).toFixed(2)}` : 'PKR 0.00');

//     if (showReasonField) addFullWidthField('Reason', student.reason);
//     if (student.class === 'Class') {
//       addTwoFields('Class Number', student.classNumber, 'Major Subject', student.majorSubject);
//     } else if (student.class === 'BS') {
//       addTwoFields('Degree Name', student.degreeName, 'Semester', student.semester);
//       addFullWidthField('Degree Years', degreeYearsMap[student.degreeName] || '-');
//     }
//     addFullWidthField('Address', student.address);

//     // --- Document Section ---
//     yPos += 10;
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.text('Uploaded Documents', 15, yPos);
//     yPos += 8;

//     if (showCnicFields) {
//       await addDocumentFieldToPdf('CNIC Front', student.cnicFrontUrl);
//       await addDocumentFieldToPdf('CNIC Back', student.cnicBackUrl);
//     }
//     if (showBFormField) {
//       await addDocumentFieldToPdf('B-Form Copy', student.bFormUrl);
//     }
//     await addDocumentFieldToPdf('Character Certificate', student.characterCertificateUrl);
//     if (showPreviousClassResultField) {
//       await addDocumentFieldToPdf('Previous Class Result', student.previousClassResultUrl);
//     }
//     if (showBsResultsFields) {
//       await addDocumentFieldToPdf('Class 10 Result', student.class10ResultUrl);
//       await addDocumentFieldToPdf('Class 12 Result', student.class12ResultUrl);
//     }

//     // Save
//     doc.save(`${student.name.replace(/\s/g, '_')}_details.pdf`);
//   };

//   // Helper component to render file input and preview
//   const FileInputWithPreview = ({ label, name, file, url, onFileChange, onRemoveFile, error, isViewMode }) => (
//     <div>
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
//       {!isViewMode ? (
//         <input
//           type="file"
//           id={name}
//           name={name}
//           accept="image/*"
//           onChange={onFileChange}
//           className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//         />
//       ) : null}
//       {(file || url) && (
//         <div className="mt-2 relative w-40 h-40 border border-gray-300 rounded-md overflow-hidden">
//           <img src={file ? URL.createObjectURL(file) : `${backendBaseUrl}${url}`} alt={`${label} Preview`} className="w-full h-full object-cover" />
//           {!isViewMode && (
//             <button
//               type="button"
//               onClick={onRemoveFile}
//               className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
//               aria-label={`Remove ${label}`}
//             >
//               <MinusCircleIcon className="h-4 w-4" />
//             </button>
//           )}
//           {isViewMode && url && (
//             <a
//               href={`${backendBaseUrl}${url}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:bg-opacity-75"
//             >
//               View Full
//             </a>
//           )}
//         </div>
//       )}
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );


//   return (
//     <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
//       {/* Header Section (fixed at top) */}
//       <div className="flex-shrink-0 relative">
//         <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
//           <XMarkIcon className="h-7 w-7" />
//         </button>
//         <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-indigo-700">{getTitle()}</h2>
//         <hr className="mb-6 border-indigo-200" />
//         {generalFormError && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
//             {generalFormError}
//           </div>
//         )}
//       </div>

//       {/* Scrollable Form Content Area (takes remaining vertical space) */}
//       <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 md:gap-6 mb-6">
//           {/* Profile Picture */}
//           <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
//             <FileInputWithPreview
//               label="Profile Picture"
//               name="profilePicture"
//               file={profilePictureFile}
//               url={student.profilePictureUrl}
//               onFileChange={(e) => handleDocumentFileChange(e, setProfilePictureFile, 'profilePictureUrl')}
//               onRemoveFile={() => handleRemoveDocumentFile(setProfilePictureFile, 'profilePictureUrl')}
//               error={fieldErrors.profilePictureUrl}
//               isViewMode={isViewMode}
//             />
//           </div>

//           {/* Basic Info */}
//           <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
//             {/* Name */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//               <input type="text" id="name" name="name" value={student.name} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
//             </div>
//             {/* Father Name */}
//             <div>
//               <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father Name</label>
//               <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.fatherName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fatherName}</p>}
//             </div>
//             {/* CNIC */}
//             <div>
//               <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC</label>
//               <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
//             </div>
//             {/* DOB */}
//             <div>
//               <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
//               <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.dob && <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>}
//             </div>
//             {/* Gender */}
//             <div>
//               <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
//               <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               {fieldErrors.gender && <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>}
//             </div>
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//               <input type="email" id="email" name="email" value={student.email} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
//             </div>
//             {/* Admission Date */}
//             <div>
//               <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Admission Date</label>
//               <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.admissionDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.admissionDate}</p>}
//             </div>
//             {/* Guardian Contact */}
//             <div>
//               <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">Guardian Contact</label>
//               <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.guardianContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.guardianContact}</p>}
//             </div>
//             {/* Additional Contact */}
//             <div>
//               <label htmlFor="additionalContact" className="block text-sm font-medium text-gray-700">Additional Contact</label>
//               <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.additionalContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.additionalContact}</p>}
//             </div>
//             {/* Address */}
//             <div className="sm:col-span-2">
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
//               <textarea id="address" name="address" value={student.address} onChange={handleChange} readOnly={isViewMode} rows="2" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}></textarea>
//               {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
//             </div>
//           </div>

//           {/* Academic Info */}
//           <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-t pt-4 mt-4 border-gray-200">
//             {/* Student Status */}
//             <div>
//               <label htmlFor="studentStatus" className="block text-sm font-medium text-gray-700">Student Status</label>
//               <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                 <option value="Regular">Regular</option>
//                 <option value="Expelled">Expelled</option>
//                 <option value="Withdrawn">Withdrawn</option>
//                 <option value="Graduated">Graduated</option>
//               </select>
//               {fieldErrors.studentStatus && <p className="mt-1 text-sm text-red-600">{fieldErrors.studentStatus}</p>}
//             </div>
//             {/* Reason (Conditional) */}
//             {showReasonField && (
//               <div className="sm:col-span-1">
//                 <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
//                 <textarea id="reason" name="reason" value={student.reason} onChange={handleChange} readOnly={isViewMode} rows="1" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}></textarea>
//                 {fieldErrors.reason && <p className="mt-1 text-sm text-red-600">{fieldErrors.reason}</p>}
//               </div>
//             )}
//             {/* Class Type */}
//             <div>
//               <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class Type</label>
//               <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                 <option value="">Select Class Type</option>
//                 <option value="Class">Class</option>
//                 <option value="BS">BS</option>
//               </select>
//               {fieldErrors.class && <p className="mt-1 text-sm text-red-600">{fieldErrors.class}</p>}
//             </div>
//             {/* Conditional Class/Degree Fields */}
//             {student.class === 'Class' && (
//                           <>
//               <div>
//                 <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-1">Class Number<span className="text-red-500">*</span></label>
//                 <select id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.classNumber ? 'border-red-500' : ''}`}>
//                   <option value="">Select Class</option>
//                   {[...Array(12)].map((_, i) => (
//                     <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
//                   ))}
//                 </select>
//                 {fieldErrors.classNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.classNumber}</p>}
//               </div>
//               <div>
//                 <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700 mb-1">Major Subject<span className="text-red-500">*</span></label>
//                 <select id="majorSubject" name="majorSubject" value={student.majorSubject} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.majorSubject ? 'border-red-500' : ''}`}>
//                   <option value="">Select Subject</option>
//                   <option value="Arts">Arts</option>
//                   <option value="Science">Science</option>
//                 </select>
//                 {fieldErrors.majorSubject && <p className="text-red-500 text-sm mt-1">{fieldErrors.majorSubject}</p>}
//               </div>
//             </>
    
//             )}
//             {student.class === 'BS' && (
//               <>
//                 <div>
//                   <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                   <select id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
//                     <option value="">Select Degree</option>
//                     {Object.keys(degreeYearsMap).filter(key => key !== '-').map(degree => (
//                       <option key={degree} value={degree}>{degree}</option>
//                     ))}
//                   </select>
//                   {fieldErrors.degreeName && <p className="mt-1 text-sm text-red-600">{fieldErrors.degreeName}</p>}
//                 </div>
//                 <div>
//                   <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
//                   <input type="number" id="semester" name="semester" value={student.semester} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors.semester && <p className="mt-1 text-sm text-red-600">{fieldErrors.semester}</p>}
//                 </div>
//                 {student.degreeName && degreeYearsMap[student.degreeName] && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Degree Years</label>
//                     <p className="mt-1 text-sm text-gray-900">{degreeYearsMap[student.degreeName]}</p>
//                   </div>
//                 )}
//               </>
//             )}
//             {/* Fee Per Month */}
//             <div>
//               <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700">Fee Per Month (PKR)</label>
//               <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.feePerMonth && <p className="mt-1 text-sm text-red-600">{fieldErrors.feePerMonth}</p>}
//             </div>
//             {/* Deposited Amount */}
//             <div>
//               <label htmlFor="depositedAmount" className="block text-sm font-medium text-gray-700">Deposited Amount (PKR)</label>
//               <input type="number" id="depositedAmount" name="depositedAmount" value={student.depositedAmount} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.depositedAmount && <p className="mt-1 text-sm text-red-600">{fieldErrors.depositedAmount}</p>}
//             </div>
//             {/* Other Dues */}
//             <div>
//               <label htmlFor="otherDues" className="block text-sm font-medium text-gray-700">Other Dues (PKR)</label>
//               <input type="number" id="otherDues" name="otherDues" value={student.otherDues} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.otherDues && <p className="mt-1 text-sm text-red-600">{fieldErrors.otherDues}</p>}
//             </div>
//           </div>

//           {/* New Document Upload Fields */}
//           <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 border-t pt-4 mt-4 border-gray-200">
//             <h3 className="col-span-full text-lg font-bold text-gray-800 mb-2">Required Documents</h3>

//             {/* CNIC Front & Back (Conditional) */}
//             {showCnicFields && (
//               <>
//                 <FileInputWithPreview
//                   label="CNIC Front Photo"
//                   name="cnicFront"
//                   file={cnicFrontFile}
//                   url={student.cnicFrontUrl}
//                   onFileChange={(e) => handleDocumentFileChange(e, setCnicFrontFile, 'cnicFrontUrl')}
//                   onRemoveFile={() => handleRemoveDocumentFile(setCnicFrontFile, 'cnicFrontUrl')}
//                   error={fieldErrors.cnicFrontUrl}
//                   isViewMode={isViewMode}
//                 />
//                 <FileInputWithPreview
//                   label="CNIC Back Photo"
//                   name="cnicBack"
//                   file={cnicBackFile}
//                   url={student.cnicBackUrl}
//                   onFileChange={(e) => handleDocumentFileChange(e, setCnicBackFile, 'cnicBackUrl')}
//                   onRemoveFile={() => handleRemoveDocumentFile(setCnicBackFile, 'cnicBackUrl')}
//                   error={fieldErrors.cnicBackUrl}
//                   isViewMode={isViewMode}
//                 />
//               </>
//             )}

//             {/* B-Form Copy (Conditional) */}
//             {showBFormField && (
//               <FileInputWithPreview
//                 label="B-Form Copy"
//                 name="bForm"
//                 file={bFormFile}
//                 url={student.bFormUrl}
//                 onFileChange={(e) => handleDocumentFileChange(e, setBFormFile, 'bFormUrl')}
//                 onRemoveFile={() => handleRemoveDocumentFile(setBFormFile, 'bFormUrl')}
//                 error={fieldErrors.bFormUrl}
//                 isViewMode={isViewMode}
//               />
//             )}

//             {/* Character Certificate */}
//             <FileInputWithPreview
//               label="Character Certificate"
//               name="characterCertificate"
//               file={characterCertificateFile}
//               url={student.characterCertificateUrl}
//               onFileChange={(e) => handleDocumentFileChange(e, setCharacterCertificateFile, 'characterCertificateUrl')}
//               onRemoveFile={() => handleRemoveDocumentFile(setCharacterCertificateFile, 'characterCertificateUrl')}
//               error={fieldErrors.characterCertificateUrl}
//               isViewMode={isViewMode}
//             />

//             {/* Previous Class Result (Conditional for Class >= 9) */}
//             {showPreviousClassResultField && (
//               <FileInputWithPreview
//                 label="Previous Class Result"
//                 name="previousClassResult"
//                 file={previousClassResultFile}
//                 url={student.previousClassResultUrl}
//                 onFileChange={(e) => handleDocumentFileChange(e, setPreviousClassResultFile, 'previousClassResultUrl')}
//                 onRemoveFile={() => handleRemoveDocumentFile(setPreviousClassResultFile, 'previousClassResultUrl')}
//                 error={fieldErrors.previousClassResultUrl}
//                 isViewMode={isViewMode}
//               />
//             )}

//             {/* Class 10 & 12 Results (Conditional for BS Students) */}
//             {showBsResultsFields && (
//               <>
//                 <FileInputWithPreview
//                   label="Class 10 Result"
//                   name="class10Result"
//                   file={class10ResultFile}
//                   url={student.class10ResultUrl}
//                   onFileChange={(e) => handleDocumentFileChange(e, setClass10ResultFile, 'class10ResultUrl')}
//                   onRemoveFile={() => handleRemoveDocumentFile(setClass10ResultFile, 'class10ResultUrl')}
//                   error={fieldErrors.class10ResultUrl}
//                   isViewMode={isViewMode}
//                 />
//                 <FileInputWithPreview
//                   label="Class 12 Result"
//                   name="class12Result"
//                   file={class12ResultFile}
//                   url={student.class12ResultUrl}
//                   onFileChange={(e) => handleDocumentFileChange(e, setClass12ResultFile, 'class12ResultUrl')}
//                   onRemoveFile={() => handleRemoveDocumentFile(setClass12ResultFile, 'class12ResultUrl')}
//                   error={fieldErrors.class12ResultUrl}
//                   isViewMode={isViewMode}
//                 />
//               </>
//             )}
//           </div>
//         </div>
//       </form>

//       {/* Footer Section (fixed at bottom) */}
//       <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
//         {isViewMode && (
//           <button
//             type="button"
//             onClick={handleDownloadPdf}
//             className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
//             title="Download Student Details as PDF"
//           >
//             <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//             Download PDF
//           </button>
//         )}
//         {!isViewMode && (
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
//           >
//             {editingStudent ? 'Update Student' : 'Add Student'}
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

// export default StudentForm;


// // src/components/StudentForm.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// import jsPDF from 'jspdf';
// import { useParams } from 'react-router-dom'; // Import useParams for route parameters

// const degreeYearsMap = {
//   'Islamiyat': 4,
//   'Software Engineering': 4,
//   'Honors': 2,
//   '-': null
// };

// const StudentForm = ({ editingStudent, fetchStudents, onClose, isViewMode = false }) => {
//   const initialState = {
//     name: '',
//     fatherName: '',
//     cnic: '',
//     dob: '',
//     gender: '',
//     email: '',
//     admissionDate: '',
//     guardianContact: '',
//     additionalContact: '',
//     address: '',
//     studentStatus: 'Regular',
//     reason: '',
//     class: '',
//     classNumber: '',
//     majorSubject: '',
//     degreeName: '',
//     semester: '',
//     feePerMonth: '',
//     profilePictureUrl: '',
//     depositedAmount: '',
//     otherDues: '',
//     cnicFrontUrl: '',
//     cnicBackUrl: '',
//     bFormUrl: '',
//     characterCertificateUrl: '',
//     previousClassResultUrl: '',
//     class10ResultUrl: '',
//     class12ResultUrl: '',
//   };
//   const [student, setStudent] = useState(initialState);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [generalFormError, setGeneralFormError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
//   const backendBaseUrl = 'http://localhost:5000';

//   const { id: routeStudentId } = useParams(); // Get ID from URL params (e.g., for /students/my-data/:id)

//   // --- Auth States ---
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isEditAllowed, setIsEditAllowed] = useState(false);
//   const [formLoading, setFormLoading] = useState(true); // New loading state for the form itself

//   // Effect to load current user and set edit permissions
//   useEffect(() => {
//     const userInfo = localStorage.getItem('userInfo');
//     let user = null;
//     if (userInfo) {
//       try {
//         user = JSON.parse(userInfo);
//         setCurrentUser(user);
//       } catch (e) {
//         console.error("Failed to parse user info from localStorage", e);
//         localStorage.removeItem('userInfo');
//       }
//     }

//     let allowed = false;
//     // Admin can always edit
//     if (user?.role === 'admin') {
//       allowed = true;
//     }
//     // Teacher can edit if editModeEnabled is true
//     else if (user?.role === 'teacher' && user.editModeEnabled) {
//       allowed = true;
//     }
//     // Student can edit if editModeEnabled is true AND it's their own profile
//     else if (user?.role === 'student' && user.editModeEnabled) {
//       // Check if the student ID being edited/viewed matches the logged-in student's profileId
//       const currentProfileId = user.profileId;
//       // Determine the ID this form is trying to modify/view
//       // If editingStudent is provided, use its ID. Otherwise, use routeStudentId.
//       const formTargetId = editingStudent?._id || routeStudentId;

//       if (currentProfileId === formTargetId) {
//         allowed = true;
//       }
//     }
//     // Other roles (cook, cleaner, accountant) cannot edit student data
//     setIsEditAllowed(allowed);
//   }, [editingStudent, routeStudentId]); // Re-run if editingStudent or routeStudentId changes


//   // Effect to load student data, either from prop or from API for "my-data" route
//   useEffect(() => {
//     const loadStudentData = async () => {
//       setFormLoading(true);
//       setGeneralFormError('');
//       setFieldErrors({});
//       let studentToLoad = null;

//       if (editingStudent) {
//         // If editingStudent prop is provided (from StudentList modal)
//         studentToLoad = editingStudent;
//       } else if (routeStudentId && currentUser) {
//         // If routeStudentId is present (e.g., /students/my-data/:id)
//         // And ensure the current user is authorized to fetch this ID
//         const isAuthorizedToFetch = currentUser.role === 'admin' ||
//                                    (currentUser.role === 'teacher') || // Teacher can view any student
//                                    (currentUser.role === 'student' && currentUser.profileId === routeStudentId);

//         if (isAuthorizedToFetch) {
//           try {
//             const res = await api.get(`/students/${routeStudentId}`);
//             studentToLoad = res.data;
//           } catch (err) {
//             console.error('Failed to fetch student for "my-data" route:', err);
//             setGeneralFormError('Failed to load student data. Please check your access.');
//             setFormLoading(false);
//             return;
//           }
//         } else {
//           setGeneralFormError('You are not authorized to view this student profile.');
//           setFormLoading(false);
//           return;
//         }
//       }

//       if (studentToLoad) {
//         setStudent({
//           ...studentToLoad,
//           dob: studentToLoad.dob ? new Date(studentToLoad.dob).toISOString().split('T')[0] : '',
//           admissionDate: studentToLoad.admissionDate ? new Date(studentToLoad.admissionDate).toISOString().split('T')[0] : '',
//           // Ensure all document URLs are initialized
//           cnicFrontUrl: studentToLoad.cnicFrontUrl || '',
//           cnicBackUrl: studentToLoad.cnicBackUrl || '',
//           bFormUrl: studentToLoad.bFormUrl || '',
//           characterCertificateUrl: studentToLoad.characterCertificateUrl || '',
//           previousClassResultUrl: studentToLoad.previousClassResultUrl || '',
//           class10ResultUrl: studentToLoad.class10ResultUrl || '',
//           class12ResultUrl: studentToLoad.class12ResultUrl || '',
//         });
//       } else {
//         setStudent(initialState);
//       }
//       setSelectedFile(null); // Clear file input
//       setFormLoading(false);
//     };

//     // Only load data if currentUser is available (ensures permissions are set)
//     if (currentUser !== null) {
//       loadStudentData();
//     }
//   }, [editingStudent, routeStudentId, currentUser, isViewMode]); // Added currentUser and isViewMode to dependencies

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setStudent(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
//     setGeneralFormError('');
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       // Clear the existing URL if a new file is selected, so backend knows to replace
//       setStudent(prev => ({ ...prev, [e.target.name + 'Url']: '' }));
//     }
//   };

//   const handleRemoveFile = (fieldName) => {
//     setSelectedFile(null); // Clear selected file if it was for this field
//     setStudent(prev => ({ ...prev, [fieldName]: '' })); // Set URL in state to empty string
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setGeneralFormError('');
//     setFieldErrors({});

//     if (!isEditAllowed) {
//       setGeneralFormError('You do not have permission to perform this action.');
//       return;
//     }

//     const newFieldErrors = {};
//     let hasError = false;

//     // Basic validation
//     const requiredFields = ['name', 'fatherName', 'cnic', 'address', 'guardianContact', 'dob', 'gender', 'admissionDate', 'class', 'feePerMonth'];
//     requiredFields.forEach(field => {
//       if (!student[field]) {
//         newFieldErrors[field] = 'This field is required.';
//         hasError = true;
//       }
//     });

//     if (student.cnic && !/^\d{13}$/.test(student.cnic)) {
//       newFieldErrors.cnic = 'CNIC must be 13 digits.';
//       hasError = true;
//     }
//     if (student.guardianContact && !/^\d{11}$/.test(student.guardianContact)) {
//       newFieldErrors.guardianContact = 'Guardian contact must be 11 digits.';
//       hasError = true;
//     }
//     if (student.additionalContact && !/^\d{11}$/.test(student.additionalContact)) {
//       newFieldErrors.additionalContact = 'Additional contact must be 11 digits.';
//       hasError = true;
//     }
//     if (student.email && !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(student.email)) {
//       newFieldErrors.email = 'Please enter a valid email address.';
//       hasError = true;
//     }
//     if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) < 0) {
//       newFieldErrors.feePerMonth = 'Fee per month must be a non-negative number.';
//       hasError = true;
//     }

//     // Conditional validation for 'reason'
//     if ((student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && !student.reason) {
//       newFieldErrors.reason = 'Reason is required for Expelled or Withdrawn status.';
//       hasError = true;
//     }

//     setFieldErrors(newFieldErrors);

//     if (hasError) {
//       setGeneralFormError('Please correct the errors in the form before submitting.');
//       return;
//     }

//     const formData = new FormData();
//     for (const key in student) {
//       // Don't append file URLs directly if a new file is selected for that field
//       // The backend handles the URL based on `req.files` or `existingUrlFromReqBody`
//       if (!key.endsWith('Url') && student[key] !== null) {
//         formData.append(key, student[key]);
//       }
//     }

//     // Append file inputs
//     if (selectedFile) {
//       formData.append('profilePicture', selectedFile);
//     } else if (student.profilePictureUrl) {
//       formData.append('profilePictureUrl', student.profilePictureUrl);
//     } else {
//       formData.append('profilePictureUrl', '');
//     }

//     // Append other document files/URLs
//     const documentFields = ['cnicFront', 'cnicBack', 'bForm', 'characterCertificate', 'previousClassResult', 'class10Result', 'class12Result'];
//     documentFields.forEach(field => {
//       const fileKey = field; // e.g., 'cnicFront'
//       const urlKey = `${field}Url`; // e.g., 'cnicFrontUrl'
//       // Assuming you'd have a separate state for each document file if allowing multiple new uploads
//       // For now, if student[urlKey] is explicitly cleared, send empty string
//       if (student[urlKey] === '') {
//         formData.append(urlKey, '');
//       } else if (student[urlKey]) { // If there's an existing URL and no new file
//         formData.append(urlKey, student[urlKey]);
//       }
//       // If a new file was selected for this specific document type, it would be handled here
//       // For this current setup, selectedFile only handles profilePicture.
//       // You would need separate useState for each document file if allowing new uploads for them.
//       // For now, relying on the backend's handleFileUploadLogic to keep existing if no new file/empty string.
//     });


//     try {
//       if (editingStudent || routeStudentId) {
//         // Use editingStudent._id if available, otherwise routeStudentId
//         const idToUpdate = editingStudent?._id || routeStudentId;
//         await api.put(`/students/${idToUpdate}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         await api.post('/students', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }
//       // Only call fetchStudents and onClose if they are provided as props (i.e., when used in a modal)
//       if (fetchStudents) fetchStudents(); // Refresh the list
//       if (onClose) onClose(); // Close the modal
//     } catch (err) {
//       console.error('Failed to save student:', err.response?.data || err.message);
//       const errorMessage = err.response?.data?.message || err.message;

//       if (err.response?.data?.errors) {
//         const backendErrors = err.response.data.errors;
//         const newErrors = {};
//         for (const key in backendErrors) {
//           newErrors[key] = backendErrors[key].message;
//         }
//         setFieldErrors(prev => ({ ...prev, ...newErrors }));
//         setGeneralFormError('Failed to save student: Please correct the highlighted fields.');
//       } else {
//         setGeneralFormError('Failed to save student: ' + errorMessage);
//       }
//     }
//   };

//   const getTitle = () => {
//     if (isViewMode) return 'Student Details';
//     if (editingStudent || routeStudentId) return 'Edit Student';
//     return 'Add New Student';
//   };

//   const handleDownloadPdf = () => {
//     const doc = new jsPDF();
//     let yPos = 20;
//     const margin = 15;
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const col1X = margin;
//     const col2X = pageWidth / 2 + 10;

//     doc.setFontSize(18);
//     doc.text('Student Details', pageWidth / 2, yPos, { align: 'center' });
//     yPos += 10;

//     const addField = (label, value, x, y) => {
//       doc.setFont(undefined, 'bold');
//       doc.text(`${label}:`, x, y);
//       doc.setFont(undefined, 'normal');
//       doc.text(String(value || 'N/A'), x + doc.getTextWidth(`${label}: `), y);
//     };

//     const checkPageBreak = () => {
//       if (yPos > doc.internal.pageSize.getHeight() - margin) {
//         doc.addPage();
//         yPos = margin;
//       }
//     };

//     // Profile Picture
//     if (student.profilePictureUrl) {
//       const img = new Image();
//       img.src = `${backendBaseUrl}${student.profilePictureUrl}`;
//       img.onload = () => {
//         const imgWidth = 40;
//         const imgHeight = (img.height * imgWidth) / img.width;
//         const xOffset = (pageWidth - imgWidth) / 2;
//         doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
//         yPos += imgHeight + 10;
//         checkPageBreak();
//         drawContent();
//       };
//       img.onerror = () => {
//         console.warn('Failed to load profile picture for PDF. Proceeding without it.');
//         yPos += 10;
//         checkPageBreak();
//         drawContent();
//       };
//     } else {
//       yPos += 10; // Space for missing image
//       checkPageBreak();
//       drawContent();
//     }

//     const drawContent = () => {
//       yPos += 5;
//       doc.line(margin, yPos, pageWidth - margin, yPos);
//       yPos += 10;

//       // Basic Information
//       doc.setFontSize(12);
//       doc.setFont(undefined, 'bold');
//       doc.text('Basic Information', col1X, yPos);
//       yPos += 7;
//       checkPageBreak();

//       addField('Name', student.name, col1X, yPos);
//       addField('Father Name', student.fatherName, col2X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('CNIC', student.cnic, col1X, yPos);
//       addField('Date of Birth', student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A', col2X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('Gender', student.gender, col1X, yPos);
//       addField('Email', student.email, col2X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A', col1X, yPos);
//       addField('Guardian Contact', student.guardianContact, col2X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('Additional Contact', student.additionalContact, col1X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('Address', student.address, col1X, yPos);
//       yPos += 10; checkPageBreak();

//       // Academic & Financial Information
//       doc.setFontSize(12);
//       doc.setFont(undefined, 'bold');
//       doc.text('Academic & Financial Information', col1X, yPos);
//       yPos += 7;
//       checkPageBreak();

//       addField('Class Type', student.class, col1X, yPos);
//       if (student.class === 'Class') {
//         addField('Class Number', student.classNumber, col2X, yPos);
//         yPos += 7; checkPageBreak();
//         addField('Major Subject', student.majorSubject, col1X, yPos);
//       } else if (student.class === 'BS') {
//         addField('Degree Name', student.degreeName, col2X, yPos);
//         yPos += 7; checkPageBreak();
//         addField('Semester', student.semester, col1X, yPos);
//       }
//       yPos += 7; checkPageBreak();
//       addField('Fee Per Month', `PKR ${parseFloat(student.feePerMonth || 0).toFixed(2)}`, col1X, yPos);
//       addField('Deposited Amount', `PKR ${parseFloat(student.depositedAmount || 0).toFixed(2)}`, col2X, yPos);
//       yPos += 7; checkPageBreak();
//       addField('Other Dues', `PKR ${parseFloat(student.otherDues || 0).toFixed(2)}`, col1X, yPos);
//       addField('Student Status', student.studentStatus, col2X, yPos);
//       yPos += 7; checkPageBreak();
//       if (student.reason) {
//         addField('Reason', student.reason, col1X, yPos);
//         yPos += 7; checkPageBreak();
//       }
//       yPos += 10; checkPageBreak();

//       // Documents Section
//       doc.setFontSize(12);
//       doc.setFont(undefined, 'bold');
//       doc.text('Documents', col1X, yPos);
//       yPos += 7;
//       checkPageBreak();

//       const documentFields = [
//         { label: 'CNIC Front', url: student.cnicFrontUrl },
//         { label: 'CNIC Back', url: student.cnicBackUrl },
//         { label: 'B-Form', url: student.bFormUrl },
//         { label: 'Character Certificate', url: student.characterCertificateUrl },
//         { label: 'Previous Class Result', url: student.previousClassResultUrl },
//         { label: 'Class 10 Result', url: student.class10ResultUrl },
//         { label: 'Class 12 Result', url: student.class12ResultUrl },
//       ];

//       documentFields.forEach(docField => {
//         if (docField.url) {
//           doc.setFont(undefined, 'bold');
//           doc.text(`${docField.label}:`, col1X, yPos);
//           doc.setFont(undefined, 'normal');
//           doc.setTextColor(0, 0, 255); // Blue for link
//           doc.textWithLink('View Document', col1X + doc.getTextWidth(`${docField.label}: `), yPos, { url: `${backendBaseUrl}${docField.url}` });
//           doc.setTextColor(0); // Reset color
//           yPos += 7; checkPageBreak();
//         } else {
//           doc.setFont(undefined, 'bold');
//           doc.text(`${docField.label}:`, col1X, yPos);
//           doc.setFont(undefined, 'normal');
//           doc.text('N/A', col1X + doc.getTextWidth(`${docField.label}: `), yPos);
//           yPos += 7; checkPageBreak();
//         }
//       });

//       doc.save(`${student.name.replace(/\s/g, '_')}_Details.pdf`);
//     };
//   };

//   if (formLoading) {
//     return <div className="p-6 text-center">Loading student data...</div>;
//   }

//   return (
//     <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto relative flex flex-col h-full">
//       {/* Close Button */}
//       <button
//         onClick={onClose}
//         className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-200 p-1 rounded-full hover:bg-gray-100"
//         title="Close"
//       >
//         <XMarkIcon className="h-6 w-6" />
//       </button>

//       {/* Header */}
//       <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-indigo-700 mt-2 sm:mt-0">{getTitle()}</h2>
//       <hr className="mb-4 border-indigo-200" />

//       {/* Form Error */}
//       {generalFormError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow-sm" role="alert">
//           {generalFormError}
//         </div>
//       )}

//       {/* Scrollable Form Content */}
//       <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
//           {/* Profile Picture */}
//           <div className="lg:col-span-1 flex flex-col items-center">
//             <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
//             {(!isViewMode && isEditAllowed) && (
//               <input
//                 type="file"
//                 id="profilePicture"
//                 name="profilePicture"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//               />
//             )}
//             {(selectedFile || student.profilePictureUrl) && (
//               <div className="mt-2 relative w-40 h-40 border border-gray-300 rounded-md overflow-hidden">
//                 <img src={selectedFile ? URL.createObjectURL(selectedFile) : `${backendBaseUrl}${student.profilePictureUrl}`} alt="Profile Preview" className="w-full h-full object-cover" />
//                 {(!isViewMode && isEditAllowed) && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveFile('profilePictureUrl')}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
//                     aria-label="Remove Profile Picture"
//                   >
//                     <XMarkIcon className="h-4 w-4" />
//                   </button>
//                 )}
//                 {(isViewMode || !isEditAllowed) && student.profilePictureUrl && (
//                   <a
//                     href={`${backendBaseUrl}${student.profilePictureUrl}`}
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

//           {/* Basic Info - First Column */}
//           <div className="sm:col-span-1 lg:col-span-1 grid grid-cols-1 gap-4 md:gap-6">
//             {/* Name */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name<span className="text-red-500">*</span></label>
//               <input type="text" id="name" name="name" value={student.name} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
//             </div>
//             {/* Father Name */}
//             <div>
//               <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father Name<span className="text-red-500">*</span></label>
//               <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.fatherName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fatherName}</p>}
//             </div>
//             {/* CNIC */}
//             <div>
//               <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC<span className="text-red-500">*</span></label>
//               <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
//             </div>
//             {/* DOB */}
//             <div>
//               <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth<span className="text-red-500">*</span></label>
//               <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.dob && <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>}
//             </div>
//             {/* Gender */}
//             <div>
//               <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender<span className="text-red-500">*</span></label>
//               <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`}>
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               {fieldErrors.gender && <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>}
//             </div>
//           </div>

//           {/* Basic Info - Second Column */}
//           <div className="sm:col-span-1 lg:col-span-1 grid grid-cols-1 gap-4 md:gap-6">
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//               <input type="email" id="email" name="email" value={student.email} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
//             </div>
//             {/* Admission Date */}
//             <div>
//               <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Admission Date<span className="text-red-500">*</span></label>
//               <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.admissionDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.admissionDate}</p>}
//             </div>
//             {/* Guardian Contact */}
//             <div>
//               <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">Guardian Contact<span className="text-red-500">*</span></label>
//               <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.guardianContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.guardianContact}</p>}
//             </div>
//             {/* Additional Contact */}
//             <div>
//               <label htmlFor="additionalContact" className="block text-sm font-medium text-gray-700">Additional Contact</label>
//               <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.additionalContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.additionalContact}</p>}
//             </div>
//             {/* Address */}
//             <div>
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address<span className="text-red-500">*</span></label>
//               <textarea id="address" name="address" value={student.address} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} rows="2" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`}></textarea>
//               {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Academic and Financial Info */}
//         <div className="border-t pt-4 mt-4 border-gray-200">
//           <h3 className="text-lg font-bold text-gray-800 mb-4">Academic & Financial Information</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
//             {/* Class */}
//             <div>
//               <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class Type<span className="text-red-500">*</span></label>
//               <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`}>
//                 <option value="">Select Class Type</option>
//                 <option value="Class">Class</option>
//                 <option value="BS">BS</option>
//               </select>
//               {fieldErrors.class && <p className="mt-1 text-sm text-red-600">{fieldErrors.class}</p>}
//             </div>
//             {/* Conditional Fields based on Class Type */}
//             {student.class === 'Class' && (
//               <>
//                 <div>
//                   <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                   <input type="number" id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors.classNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.classNumber}</p>}
//                 </div>
//                 <div>
//                   <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
//                   <input type="text" id="majorSubject" name="majorSubject" value={student.majorSubject} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors.majorSubject && <p className="mt-1 text-sm text-red-600">{fieldErrors.majorSubject}</p>}
//                 </div>
//               </>
//             )}
//             {student.class === 'BS' && (
//               <>
//                 <div>
//                   <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                   <input type="text" id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors.degreeName && <p className="mt-1 text-sm text-red-600">{fieldErrors.degreeName}</p>}
//                 </div>
//                 <div>
//                   <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
//                   <input type="number" id="semester" name="semester" value={student.semester} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//                   {fieldErrors.semester && <p className="mt-1 text-sm text-red-600">{fieldErrors.semester}</p>}
//                 </div>
//               </>
//             )}
//             {/* Fee Per Month */}
//             <div>
//               <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700">Fee Per Month<span className="text-red-500">*</span></label>
//               <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.feePerMonth && <p className="mt-1 text-sm text-red-600">{fieldErrors.feePerMonth}</p>}
//             </div>
//             {/* Deposited Amount */}
//             <div>
//               <label htmlFor="depositedAmount" className="block text-sm font-medium text-gray-700">Deposited Amount</label>
//               <input type="number" id="depositedAmount" name="depositedAmount" value={student.depositedAmount} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.depositedAmount && <p className="mt-1 text-sm text-red-600">{fieldErrors.depositedAmount}</p>}
//             </div>
//             {/* Other Dues */}
//             <div>
//               <label htmlFor="otherDues" className="block text-sm font-medium text-gray-700">Other Dues</label>
//               <input type="number" id="otherDues" name="otherDues" value={student.otherDues} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`} />
//               {fieldErrors.otherDues && <p className="mt-1 text-sm text-red-600">{fieldErrors.otherDues}</p>}
//             </div>
//             {/* Student Status */}
//             <div>
//               <label htmlFor="studentStatus" className="block text-sm font-medium text-gray-700">Student Status</label>
//               <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode || !isEditAllowed} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`}>
//                 <option value="Regular">Regular</option>
//                 <option value="Withdrawn">Withdrawn</option>
//                 <option value="Expelled">Expelled</option>
//                 <option value="Graduated">Graduated</option>
//               </select>
//               {fieldErrors.studentStatus && <p className="mt-1 text-sm text-red-600">{fieldErrors.studentStatus}</p>}
//             </div>
//             {/* Reason (conditional) */}
//             {(student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && (
//               <div>
//                 <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason<span className="text-red-500">*</span></label>
//                 <textarea id="reason" name="reason" value={student.reason} onChange={handleChange} readOnly={isViewMode || !isEditAllowed} rows="2" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isEditAllowed ? 'bg-gray-50' : ''}`}></textarea>
//                 {fieldErrors.reason && <p className="mt-1 text-sm text-red-600">{fieldErrors.reason}</p>}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Documents Section */}
//         <div className="border-t pt-4 mt-4 border-gray-200">
//           <h3 className="text-lg font-bold text-gray-800 mb-4">Documents</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//             {/* CNIC Front */}
//             <div>
//               <label htmlFor="cnicFront" className="block text-sm font-medium text-gray-700">CNIC Front</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="cnicFront" name="cnicFront" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.cnicFrontUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.cnicFrontUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('cnicFrontUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* CNIC Back */}
//             <div>
//               <label htmlFor="cnicBack" className="block text-sm font-medium text-gray-700">CNIC Back</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="cnicBack" name="cnicBack" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.cnicBackUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.cnicBackUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('cnicBackUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* B-Form */}
//             <div>
//               <label htmlFor="bForm" className="block text-sm font-medium text-gray-700">B-Form</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="bForm" name="bForm" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.bFormUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.bFormUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('bFormUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* Character Certificate */}
//             <div>
//               <label htmlFor="characterCertificate" className="block text-sm font-medium text-gray-700">Character Certificate</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="characterCertificate" name="characterCertificate" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.characterCertificateUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.characterCertificateUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('characterCertificateUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* Previous Class Result */}
//             <div>
//               <label htmlFor="previousClassResult" className="block text-sm font-medium text-gray-700">Previous Class Result</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="previousClassResult" name="previousClassResult" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.previousClassResultUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.previousClassResultUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('previousClassResultUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* Class 10 Result */}
//             <div>
//               <label htmlFor="class10Result" className="block text-sm font-medium text-gray-700">Class 10 Result</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="class10Result" name="class10Result" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.class10ResultUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.class10ResultUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('class10ResultUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//             {/* Class 12 Result */}
//             <div>
//               <label htmlFor="class12Result" className="block text-sm font-medium text-gray-700">Class 12 Result</label>
//               {(!isViewMode && isEditAllowed) && (
//                 <input type="file" id="class12Result" name="class12Result" accept="image/*,application/pdf" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
//               )}
//               {(student.class12ResultUrl) && (
//                 <div className="mt-2 flex items-center space-x-2">
//                   <a href={`${backendBaseUrl}${student.class12ResultUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
//                     View Current <EyeIcon className="h-4 w-4 ml-1" />
//                   </a>
//                   {(!isViewMode && isEditAllowed) && (
//                     <button type="button" onClick={() => handleRemoveFile('class12ResultUrl')} className="text-red-500 hover:text-red-700 text-sm flex items-center">
//                       Remove <XMarkIcon className="h-4 w-4 ml-1" />
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </form>

//       {/* Footer Section (fixed at bottom) */}
//       <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
//         {isViewMode && (
//           <button
//             type="button"
//             onClick={handleDownloadPdf}
//             className="flex items-center justify-center bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
//             title="Download Student Details as PDF"
//           >
//             <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//             Download PDF
//           </button>
//         )}
//         {(!isViewMode && isEditAllowed) && ( // Only show submit if not view mode AND editing is allowed
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
//           >
//             {editingStudent || routeStudentId ? 'Update Student' : 'Add Student'}
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

// export default StudentForm;



// src/components/StudentForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon, MinusCircleIcon } from '@heroicons/react/24/outline'; // Added MinusCircleIcon for file removal
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // For better table generation in PDF

const degreeYearsMap = {
    'Islamiyat': 4,
    'Software Engineering': 4,
    'Honors': 2,
    '-': null
};

// Helper to calculate age from DOB
const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
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
        depositedAmount: '',
        otherDues: '',
        // New document fields
        cnicFrontUrl: '',
        cnicBackUrl: '',
        bFormUrl: '',
        characterCertificateUrl: '',
        previousClassResultUrl: '', // For Class >= 9
        class10ResultUrl: '',       // For BS students
        class12ResultUrl: '',       // For BS students
        rollNumber: '',
    };
    const [student, setStudent] = useState(initialState);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [cnicFrontFile, setCnicFrontFile] = useState(null);
    const [cnicBackFile, setCnicBackFile] = useState(null);
    const [bFormFile, setBFormFile] = useState(null);
    const [characterCertificateFile, setCharacterCertificateFile] = useState(null);
    const [previousClassResultFile, setPreviousClassResultFile] = useState(null);
    const [class10ResultFile, setClass10ResultFile] = useState(null);
    const [class12ResultFile, setClass12ResultFile] = useState(null);

    const [generalFormError, setGeneralFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const backendBaseUrl = 'http://localhost:5000';

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditAllowed, setIsEditAllowed] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (editingStudent) {
            setStudent({
                ...editingStudent,
                dob: editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : '',
                admissionDate: editingStudent.admissionDate ? new Date(editingStudent.admissionDate).toISOString().split('T')[0] : '',
                profilePictureUrl: editingStudent.profilePictureUrl || '',
                feePerMonth: editingStudent.feePerMonth !== undefined ? editingStudent.feePerMonth.toString() : '',
                reason: editingStudent.reason || '',
                depositedAmount: editingStudent.depositedAmount !== undefined ? editingStudent.depositedAmount.toString() : '',
                otherDues: editingStudent.otherDues !== undefined ? editingStudent.otherDues.toString() : '',
                // Initialize new document URLs
                cnicFrontUrl: editingStudent.cnicFrontUrl || '',
                cnicBackUrl: editingStudent.cnicBackUrl || '',
                bFormUrl: editingStudent.bFormUrl || '',
                characterCertificateUrl: editingStudent.characterCertificateUrl || '',
                previousClassResultUrl: editingStudent.previousClassResultUrl || '',
                class10ResultUrl: editingStudent.class10ResultUrl || '',
                class12ResultUrl: editingStudent.class12ResultUrl || '',
                rollNumber: editingStudent.rollNumber || '',
            });
            // Clear file inputs when editing an existing student, as URLs are used
            setProfilePictureFile(null);
            setCnicFrontFile(null);
            setCnicBackFile(null);
            setBFormFile(null);
            setCharacterCertificateFile(null);
            setPreviousClassResultFile(null);
            setClass10ResultFile(null);
            setClass12ResultFile(null);

        } else {
            setStudent(initialState);
            // Clear all file states for a new form
            setProfilePictureFile(null);
            setCnicFrontFile(null);
            setCnicBackFile(null);
            setBFormFile(null);
            setCharacterCertificateFile(null);
            setPreviousClassResultFile(null);
            setClass10ResultFile(null);
            setClass12ResultFile(null);
        }
        setGeneralFormError('');
        setFieldErrors({});
    }, [editingStudent]);


    // Effect to load current user and set edit permissions
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

        let allowed = false;
        // Admin can always edit
        if (user?.role === 'admin') {
            allowed = true;
        }
        // Teacher can edit if editModeEnabled is true
        else if (user?.role === 'teacher' && user.editModeEnabled) {
            allowed = true;
        }
        // Student can edit if editModeEnabled is true AND it's their own profile
        else if (user?.role === 'student' && user.editModeEnabled) {
            const currentProfileId = user.profileId;
            const formTargetId = editingStudent?._id;
            if (currentProfileId === formTargetId) {
                allowed = true;
            }
        }
        // Other roles (cook, cleaner, accountant) cannot edit student data
        setIsEditAllowed(allowed);
    }, [editingStudent]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setGeneralFormError('');
    };

    // Generic file handler for new document fields
    const handleDocumentFileChange = (e, setFileState, urlFieldName) => {
        const file = e.target.files[0];
        setFileState(file);
        // Clear the existing URL for this field if a new file is selected
        setStudent(prev => ({ ...prev, [urlFieldName]: '' }));
    };

    const handleRemoveDocumentFile = (setFileState, urlFieldName) => {
        setFileState(null);
        setStudent(prev => ({ ...prev, [urlFieldName]: '' })); // Clear the URL in state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralFormError('');
        setFieldErrors({});

        // Add this permission check
        if (!isEditAllowed) {
            setGeneralFormError('You do not have permission to perform this action.');
            return;
        }
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

        // --- New Document Field Validations ---
        const studentAge = calculateAge(student.dob);
        const isAdult = studentAge !== null && studentAge >= 18;
        const isClass9OrAbove = student.class === 'Class' && parseInt(student.classNumber) >= 9;
        const isBsStudent = student.class === 'BS';

        // if (isAdult) {
        //     // If CNIC is provided, require CNIC photos
        //     if (student.cnic && student.cnic.length === 13) {
        //         if (!cnicFrontFile && !student.cnicFrontUrl) {
        //             newFieldErrors.cnicFrontUrl = 'CNIC Front Photo is required.'; hasError = true;
        //         }
        //         if (!cnicBackFile && !student.cnicBackUrl) {
        //             newFieldErrors.cnicBackUrl = 'CNIC Back Photo is required.'; hasError = true;
        //         }
        //     } else { // If CNIC not provided or invalid, require B-Form
        //         if (!bFormFile && !student.bFormUrl) {
        //             newFieldErrors.bFormUrl = 'B-Form Copy is required if CNIC is not provided/valid.'; hasError = true;
        //         }
        //     }
        // } else { // For minors, B-Form is required
        //     if (!bFormFile && !student.bFormUrl) {
        //         newFieldErrors.bFormUrl = 'B-Form Copy is required for students under 18.'; hasError = true;
        //     }
        // }

        // if (!characterCertificateFile && !student.characterCertificateUrl) {
        //     newFieldErrors.characterCertificateUrl = 'Character Certificate is required.'; hasError = true;
        // }

        // if (isClass9OrAbove) {
        //     if (!previousClassResultFile && !student.previousClassResultUrl) {
        //         newFieldErrors.previousClassResultUrl = 'Previous Class Result is required for Class 9 and above.'; hasError = true;
        //     }
        // }
        // if (isBsStudent) {
        //     if (!class10ResultFile && !student.class10ResultUrl) {
        //         newFieldErrors.class10ResultUrl = 'Class 10 Result is required for BS students.'; hasError = true;
        //     }
        //     if (!class12ResultFile && !student.class12ResultUrl) {
        //         newFieldErrors.class12ResultUrl = 'Class 12 Result is required for BS students.'; hasError = true;
        //     }
        // }
        // --- End New Document Field Validations ---


        setFieldErrors(newFieldErrors);

        if (hasError) {
            setGeneralFormError('Please correct the errors in the form before submitting.');
            return;
        }

        const formData = new FormData();

        // Append all student fields
        for (const key in student) {
            // Exclude file URLs from direct append, as they are handled separately by file inputs
            if (!key.endsWith('Url') && student[key] !== null) {
                formData.append(key, student[key]);
            }
        }

        // Append files or their existing URLs
        const appendFileOrUrl = (file, url, fieldName) => {
            if (file) {
                formData.append(fieldName, file);
            } else if (url) {
                formData.append(`${fieldName}Url`, url);
            } else {
                formData.append(`${fieldName}Url`, ''); // Explicitly clear if no file and no URL
            }
        };

        appendFileOrUrl(profilePictureFile, student.profilePictureUrl, 'profilePicture');
        appendFileOrUrl(cnicFrontFile, student.cnicFrontUrl, 'cnicFront');
        appendFileOrUrl(cnicBackFile, student.cnicBackUrl, 'cnicBack');
        appendFileOrUrl(bFormFile, student.bFormUrl, 'bForm');
        appendFileOrUrl(characterCertificateFile, student.characterCertificateUrl, 'characterCertificate');
        appendFileOrUrl(previousClassResultFile, student.previousClassResultUrl, 'previousClassResult');
        appendFileOrUrl(class10ResultFile, student.class10ResultUrl, 'class10Result');
        appendFileOrUrl(class12ResultFile, student.class12ResultUrl, 'class12Result');

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
            // } else {
            //     // This is the new logic for creating a new user account
            //     const studentResponse = await api.post('/students', formData, {
            //         headers: { 'Content-Type': 'multipart/form-data' },
            //     });

            //     const newStudent = studentResponse.data.student;
            //     alert('Student added successfully! Creating a new user for the student...');

            //     const userRegistrationData = {
            //         name: newStudent.name,
            //         email: newStudent.email || '',
            //         password: newStudent.cnic,
            //         role: 'student',
            //         profileId: newStudent._id,
            //     };

            //     try {
            //         await api.post('/auth/register-student', userRegistrationData);
            //         alert('User account created for student with CNIC as password.');
            //         navigate('/dashboard'); // Use navigate to redirect after successful creation
            //     } catch (registrationError) {
            //         console.error('Failed to register user for new student:', registrationError.response?.data || registrationError.message);
            //         alert('Warning: Student added but failed to create a user account. Please create one manually.');
            //     }
            // }
            fetchStudents(); // Refresh student list in parent component
            onClose();
        } catch (err) {
            console.error('Failed to save student:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.message;

            if (errorMessage.includes('duplicate key error') && errorMessage.includes('cnic')) {
                setFieldErrors(prev => ({ ...prev, cnic: 'This CNIC is already registered.' }));
                setGeneralFormError('Failed to save student: Duplicate CNIC detected.');
            } else if (err.response?.data?.errors) {
                // Handle Mongoose validation errors
                const backendErrors = err.response.data.errors;
                const newErrors = {};
                for (const key in backendErrors) {
                    newErrors[key] = backendErrors[key].message;
                }
                setFieldErrors(prev => ({ ...prev, ...newErrors }));
                setGeneralFormError('Failed to save student: Please correct the highlighted fields.');
            }
            else {
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
    const studentAge = calculateAge(student.dob);
    const isAdult = studentAge !== null && studentAge >= 18;
    const isClass9OrAbove = student.class === 'Class' && parseInt(student.classNumber) >= 9;
    const isBsStudent = student.class === 'BS';

    // Determine which ID proof fields to show
    const showCnicFields = isAdult && student.cnic && student.cnic.length === 13;
    const showBFormField = !isAdult || (isAdult && (!student.cnic || student.cnic.length !== 13));

    // Determine which result fields to show
    const showPreviousClassResultField = isClass9OrAbove;
    const showBsResultsFields = isBsStudent;


    const handleDownloadPdf = async () => {
        const doc = new jsPDF();
        let yPos = 20;
        const margin = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const columnGap = 30;
        const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

        // --- Institute Logo + Title ---
        const logo = new Image();
        logo.src = '/default-avatar.jpg';

        await new Promise((resolve) => {
            logo.onload = () => {
                doc.addImage(logo, 'JPEG', margin, yPos - 5, 15, 15);
                resolve();
            };
            logo.onerror = () => resolve();
        });

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Jamia Tul Mastwaar', margin + 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Makhdoom Pur Sharif, Chakwal', margin + 20, yPos);
        yPos += 5;
        doc.text('Phone: (042) 1234567 | Email: info.mastwaar@gmail.com', margin + 20, yPos);
        yPos += 12;

        // --- Title & Timestamp ---
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Student Details', pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // --- Profile Picture Centered ---
        if (student.profilePictureUrl) {
            try {
                const img = new Image();
                img.src = `${backendBaseUrl}${student.profilePictureUrl}`;
                await new Promise((resolve) => {
                    img.onload = () => {
                        const imgWidth = 40;
                        const imgHeight = (img.height * imgWidth) / img.width;
                        const xOffset = (pageWidth - imgWidth) / 2;
                        if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                            doc.addPage();
                            yPos = margin;
                        }
                        doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 15;
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
            } catch {
                yPos += 10;
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yPos += 10;
        }

        // --- Add Field Function (Two per row) ---
        const addTwoFields = (label1, value1, label2, value2) => {
            const addSingle = (x, label, value) => {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, x, yPos);
                const labelWidth = doc.getTextWidth(`${label}:`);
                doc.setFont(undefined, 'normal');
                doc.text(`${value || '-'}`, x + labelWidth + 3, yPos);
            };

            addSingle(margin, label1, value1);

            if (label2 && String(label2).trim() !== '') {
                addSingle(margin + columnWidth + columnGap, label2, value2);
            }
            yPos += 8;

            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };

        const addFullWidthField = (label, value) => {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`${label}:`, margin, yPos);
            const labelWidth = doc.getTextWidth(`${label}:`);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(value || '-', pageWidth - margin * 2 - labelWidth - 4);
            doc.text(lines, margin + labelWidth + 4, yPos);
            yPos += lines.length * 7 + 2;

            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };

        const addDocumentFieldToPdf = async (label, url) => {
            if (url) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, margin, yPos);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 255); // Blue color for link
                doc.textWithLink('View Document', margin + doc.getTextWidth(`${label}: `), yPos, { url: `${backendBaseUrl}${url}` });
                doc.setTextColor(0, 0, 0); // Reset color
                yPos += 8;
            } else {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, margin, yPos);
                doc.setFont(undefined, 'normal');
                doc.text('N/A', margin + doc.getTextWidth(`${label}: `), yPos);
                yPos += 8;
            }
            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };


        // --- Render Fields ---
        addTwoFields('Student Name', student.name, 'Father Name', student.fatherName);
        addTwoFields('CNIC', student.cnic, 'Gender', student.gender);
        addTwoFields('DOB', student.dob ? new Date(student.dob).toLocaleDateString() : '', 'Email', student.email);
        addTwoFields('Guardian Contact', student.guardianContact, 'Additional Contact', student.additionalContact);
        addTwoFields('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '', 'Student Status', student.studentStatus);
        addTwoFields('Class Type', student.class, 'Fee Per Month', student.feePerMonth);
        addTwoFields('Deposited Amount', student.depositedAmount !== '' ? `PKR ${parseFloat(student.depositedAmount).toFixed(2)}` : 'PKR 0.00', 'Other Dues', student.otherDues !== '' ? `PKR ${parseFloat(student.otherDues).toFixed(2)}` : 'PKR 0.00');

        if (showReasonField) addFullWidthField('Reason', student.reason);
        if (student.class === 'Class') {
            addTwoFields('Class Number', student.classNumber, 'Major Subject', student.majorSubject);
        } else if (student.class === 'BS') {
            addTwoFields('Degree Name', student.degreeName, 'Semester', student.semester);
            addFullWidthField('Degree Years', degreeYearsMap[student.degreeName] || '-');
        }
        addFullWidthField('Address', student.address);

        // --- Document Section ---
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Uploaded Documents', 15, yPos);
        yPos += 8;

        if (showCnicFields) {
            await addDocumentFieldToPdf('CNIC Front', student.cnicFrontUrl);
            await addDocumentFieldToPdf('CNIC Back', student.cnicBackUrl);
        }
        if (showBFormField) {
            await addDocumentFieldToPdf('B-Form Copy', student.bFormUrl);
        }
        await addDocumentFieldToPdf('Character Certificate', student.characterCertificateUrl);
        if (showPreviousClassResultField) {
            await addDocumentFieldToPdf('Previous Class Result', student.previousClassResultUrl);
        }
        if (showBsResultsFields) {
            await addDocumentFieldToPdf('Class 10 Result', student.class10ResultUrl);
            await addDocumentFieldToPdf('Class 12 Result', student.class12ResultUrl);
        }

        // Save
        doc.save(`${student.name.replace(/\s/g, '_')}_details.pdf`);
    };

    // Helper component to render file input and preview
    const FileInputWithPreview = ({ label, name, file, url, onFileChange, onRemoveFile, error, isViewMode }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            {!isViewMode ? (
                <input
                    type="file"
                    id={name}
                    name={name}
                    accept="image/*"
                    onChange={onFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            ) : null}
            {(file || url) && (
                <div className="mt-2 relative w-40 h-40 border border-gray-300 rounded-md overflow-hidden">
                    <img src={file ? URL.createObjectURL(file) : `${backendBaseUrl}${url}`} alt={`${label} Preview`} className="w-full h-full object-cover" />
                    {!isViewMode && (
                        <button
                            type="button"
                            onClick={onRemoveFile}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                            aria-label={`Remove ${label}`}
                        >
                            <MinusCircleIcon className="h-4 w-4" />
                        </button>
                    )}
                    {isViewMode && url && (
                        <a
                            href={`${backendBaseUrl}${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:bg-opacity-75"
                        >
                            View Full
                        </a>
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );


    return (
        <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
            {/* Header Section (fixed at top) */}
            <div className="flex-shrink-0 relative">
                <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 md:gap-6 mb-6">
                    {/* Profile Picture */}
                    <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
                        <FileInputWithPreview
                            label="Profile Picture"
                            name="profilePicture"
                            file={profilePictureFile}
                            url={student.profilePictureUrl}
                            onFileChange={(e) => handleDocumentFileChange(e, setProfilePictureFile, 'profilePictureUrl')}
                            onRemoveFile={() => handleRemoveDocumentFile(setProfilePictureFile, 'profilePictureUrl')}
                            error={fieldErrors.profilePictureUrl}
                            isViewMode={isViewMode}
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name" name="name" value={student.name} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                        </div>
                        {/* Father Name */}
                        <div>
                            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father Name</label>
                            <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.fatherName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fatherName}</p>}
                        </div>
                        {/* CNIC */}
                        <div>
                            <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC</label>
                            <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
                        </div>
                        <div className="col-span-1">
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={student.rollNumber}
                onChange={handleChange}
                readOnly={isViewMode}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
                        {/* DOB */}
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.dob && <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>}
                        </div>
                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {fieldErrors.gender && <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>}
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={student.email} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
                        </div>
                        {/* Admission Date */}
                        <div>
                            <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Admission Date</label>
                            <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.admissionDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.admissionDate}</p>}
                        </div>
                        {/* Guardian Contact */}
                        <div>
                            <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">Guardian Contact</label>
                            <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.guardianContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.guardianContact}</p>}
                        </div>
                        {/* Additional Contact */}
                        <div>
                            <label htmlFor="additionalContact" className="block text-sm font-medium text-gray-700">Additional Contact</label>
                            <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.additionalContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.additionalContact}</p>}
                        </div>
                        {/* Address */}
                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea id="address" name="address" value={student.address} onChange={handleChange} readOnly={isViewMode} rows="2" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}></textarea>
                            {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-t pt-4 mt-4 border-gray-200">
                        {/* Student Status */}
                        <div>
                            <label htmlFor="studentStatus" className="block text-sm font-medium text-gray-700">Student Status</label>
                            <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                <option value="Regular">Regular</option>
                                <option value="Expelled">Expelled</option>
                                <option value="Withdrawn">Withdrawn</option>
                                <option value="Graduated">Graduated</option>
                            </select>
                            {fieldErrors.studentStatus && <p className="mt-1 text-sm text-red-600">{fieldErrors.studentStatus}</p>}
                        </div>
                        {/* Reason (Conditional) */}
                        {showReasonField && (
                            <div className="sm:col-span-1">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                                <textarea id="reason" name="reason" value={student.reason} onChange={handleChange} readOnly={isViewMode} rows="1" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}></textarea>
                                {fieldErrors.reason && <p className="mt-1 text-sm text-red-600">{fieldErrors.reason}</p>}
                            </div>
                        )}
                        {/* Class Type */}
                        <div>
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class Type</label>
                            <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                <option value="">Select Class Type</option>
                                <option value="Class">Class</option>
                                <option value="BS">BS</option>
                            </select>
                            {fieldErrors.class && <p className="mt-1 text-sm text-red-600">{fieldErrors.class}</p>}
                        </div>
                        {/* Conditional Class/Degree Fields */}
                        {student.class === 'Class' && (
                            <>
                                <div>
                                    <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-1">Class Number<span className="text-red-500">*</span></label>
                                    <select id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.classNumber ? 'border-red-500' : ''}`}>
                                        <option value="">Select Class</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={`${i + 1}`}>{`${i + 1}`}</option>
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
                                    <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                                    <select id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                        <option value="">Select Degree</option>
                                        {Object.keys(degreeYearsMap).filter(key => key !== '-').map(degree => (
                                            <option key={degree} value={degree}>{degree}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.degreeName && <p className="mt-1 text-sm text-red-600">{fieldErrors.degreeName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                                    <input type="number" id="semester" name="semester" value={student.semester} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                                    {fieldErrors.semester && <p className="mt-1 text-sm text-red-600">{fieldErrors.semester}</p>}
                                </div>
                                {student.degreeName && degreeYearsMap[student.degreeName] && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Degree Years</label>
                                        <p className="mt-1 text-sm text-gray-900">{degreeYearsMap[student.degreeName]}</p>
                                    </div>
                                )}
                            </>
                        )}
                        {/* Fee Per Month */}
                        <div>
                            <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700">Fee Per Month (PKR)</label>
                            <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.feePerMonth && <p className="mt-1 text-sm text-red-600">{fieldErrors.feePerMonth}</p>}
                        </div>
                        {/* Deposited Amount */}
                        <div>
                            <label htmlFor="depositedAmount" className="block text-sm font-medium text-gray-700">Deposited Amount (PKR)</label>
                            <input type="number" id="depositedAmount" name="depositedAmount" value={student.depositedAmount} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.depositedAmount && <p className="mt-1 text-sm text-red-600">{fieldErrors.depositedAmount}</p>}
                        </div>
                        {/* Other Dues */}
                        <div>
                            <label htmlFor="otherDues" className="block text-sm font-medium text-gray-700">Other Dues (PKR)</label>
                            <input type="number" id="otherDues" name="otherDues" value={student.otherDues} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                            {fieldErrors.otherDues && <p className="mt-1 text-sm text-red-600">{fieldErrors.otherDues}</p>}
                        </div>
                    </div>

                    {/* New Document Upload Fields */}
                    <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 border-t pt-4 mt-4 border-gray-200">
                        <h3 className="col-span-full text-lg font-bold text-gray-800 mb-2">Required Documents</h3>

                        {/* CNIC Front & Back (Conditional) */}
                        {showCnicFields && (
                            <>
                                <FileInputWithPreview
                                    label="CNIC Front Photo"
                                    name="cnicFront"
                                    file={cnicFrontFile}
                                    url={student.cnicFrontUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setCnicFrontFile, 'cnicFrontUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setCnicFrontFile, 'cnicFrontUrl')}
                                    error={fieldErrors.cnicFrontUrl}
                                    isViewMode={isViewMode}
                                />
                                <FileInputWithPreview
                                    label="CNIC Back Photo"
                                    name="cnicBack"
                                    file={cnicBackFile}
                                    url={student.cnicBackUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setCnicBackFile, 'cnicBackUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setCnicBackFile, 'cnicBackUrl')}
                                    error={fieldErrors.cnicBackUrl}
                                    isViewMode={isViewMode}
                                />
                            </>
                        )}

                        {/* B-Form Copy (Conditional) */}
                        {showBFormField && (
                            <FileInputWithPreview
                                label="B-Form Copy"
                                name="bForm"
                                file={bFormFile}
                                url={student.bFormUrl}
                                onFileChange={(e) => handleDocumentFileChange(e, setBFormFile, 'bFormUrl')}
                                onRemoveFile={() => handleRemoveDocumentFile(setBFormFile, 'bFormUrl')}
                                error={fieldErrors.bFormUrl}
                                isViewMode={isViewMode}
                            />
                        )}

                        {/* Character Certificate */}
                        <FileInputWithPreview
                            label="Character Certificate"
                            name="characterCertificate"
                            file={characterCertificateFile}
                            url={student.characterCertificateUrl}
                            onFileChange={(e) => handleDocumentFileChange(e, setCharacterCertificateFile, 'characterCertificateUrl')}
                            onRemoveFile={() => handleRemoveDocumentFile(setCharacterCertificateFile, 'characterCertificateUrl')}
                            error={fieldErrors.characterCertificateUrl}
                            isViewMode={isViewMode}
                        />

                        {/* Previous Class Result (Conditional for Class >= 9) */}
                        {showPreviousClassResultField && (
                            <FileInputWithPreview
                                label="Previous Class Result"
                                name="previousClassResult"
                                file={previousClassResultFile}
                                url={student.previousClassResultUrl}
                                onFileChange={(e) => handleDocumentFileChange(e, setPreviousClassResultFile, 'previousClassResultUrl')}
                                onRemoveFile={() => handleRemoveDocumentFile(setPreviousClassResultFile, 'previousClassResultUrl')}
                                error={fieldErrors.previousClassResultUrl}
                                isViewMode={isViewMode}
                            />
                        )}

                        {/* Class 10 & 12 Results (Conditional for BS Students) */}
                        {showBsResultsFields && (
                            <>
                                <FileInputWithPreview
                                    label="Class 10 Result"
                                    name="class10Result"
                                    file={class10ResultFile}
                                    url={student.class10ResultUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setClass10ResultFile, 'class10ResultUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setClass10ResultFile, 'class10ResultUrl')}
                                    error={fieldErrors.class10ResultUrl}
                                    isViewMode={isViewMode}
                                />
                                <FileInputWithPreview
                                    label="Class 12 Result"
                                    name="class12Result"
                                    file={class12ResultFile}
                                    url={student.class12ResultUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setClass12ResultFile, 'class12ResultUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setClass12ResultFile, 'class12ResultUrl')}
                                    error={fieldErrors.class12ResultUrl}
                                    isViewMode={isViewMode}
                                />
                            </>
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

