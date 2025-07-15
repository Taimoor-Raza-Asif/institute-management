// // src/components/FeeForm.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../api';
// import { XMarkIcon } from '@heroicons/react/24/outline'; // For the close button

// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// // Helper function to generate year options
// const generateYearOptions = () => {
//   const currentYear = new Date().getFullYear();
//   const years = [];
//   for (let i = currentYear - 5; i <= currentYear + 1; i++) {
//     years.push(i.toString());
//   }
//   return years;
// };


// const FeeForm = ({ editingFee, fetchFees, studentsForForm, onClose, isViewMode = false }) => {
//   const initialState = {
//     studentId: '',
//     paidBy: '',
//     month: months[new Date().getMonth()],
//     year: new Date().getFullYear().toString(),
//     totalFee: '', // Will be auto-populated
//     receivedAmount: '',
//     dueAmount: 0,
//     receivedDate: new Date().toISOString().split('T')[0],
//     receivedBy: '',
//     paymentMethod: '',
//     billScreenshotUrl: '',
//   };
//   const [fee, setFee] = useState(initialState);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [formError, setFormError] = useState('');
//   const backendBaseUrl = 'http://localhost:5000'; // Make sure this matches your backend port


//   useEffect(() => {
//     if (editingFee) {
//       setFee({
//         ...editingFee,
//         studentId: editingFee.studentId?._id || '',
//         receivedDate: editingFee.receivedDate ? new Date(editingFee.receivedDate).toISOString().split('T')[0] : '',
//         month: editingFee.month || months[new Date().getMonth()],
//         year: editingFee.year?.toString() || new Date().getFullYear().toString(),
//         billScreenshotUrl: editingFee.billScreenshotUrl || '',
//       });
//       setSelectedFile(null);
//     } else {
//       setFee(initialState);
//       setSelectedFile(null);
//     }
//     setFormError('');
//   }, [editingFee]);

//   // NEW useEffect to populate totalFee based on selected student
//   useEffect(() => {
//     if (fee.studentId && studentsForForm.length > 0) {
//       const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
//       if (selectedStudent && selectedStudent.feePerMonth !== undefined) {
//         setFee(prev => ({
//           ...prev,
//           totalFee: selectedStudent.feePerMonth.toString() // Ensure it's a string for input value
//         }));
//       } else {
//         // If student not found or feePerMonth is missing, clear totalFee
//         setFee(prev => ({ ...prev, totalFee: '' }));
//       }
//     } else if (!fee.studentId && !editingFee) { // Clear totalFee if no student selected for new record
//         setFee(prev => ({ ...prev, totalFee: '' }));
//     }
//   }, [fee.studentId, studentsForForm, editingFee]); // Depend on studentId and studentsForForm

//   // Calculate due amount whenever totalFee or receivedAmount changes
//   useEffect(() => {
//     const total = parseFloat(fee.totalFee);
//     const received = parseFloat(fee.receivedAmount);
//     if (!isNaN(total) && !isNaN(received)) {
//       setFee(prev => ({
//         ...prev,
//         dueAmount: Math.max(0, total - received)
//       }));
//     } else {
//       setFee(prev => ({ ...prev, dueAmount: 0 }));
//     }
//   }, [fee.totalFee, fee.receivedAmount]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFee(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//     setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError('');

//     // Form validation
//     // totalFee is now auto-populated, so we check if it's a valid number.
//     // If a student is selected, totalFee should be set.
//     if (!fee.studentId || !fee.paidBy || !fee.receivedAmount || !fee.month || !fee.year || !fee.receivedDate || !fee.receivedBy || !fee.paymentMethod) {
//       setFormError('Please fill in all required fields (Student, Paid By, Received Amount, Month, Year, Received Date, Received By, Payment Method).');
//       return;
//     }
//     if (isNaN(parseFloat(fee.totalFee)) || parseFloat(fee.totalFee) <= 0) {
//         setFormError('Total Fee must be a positive number (auto-populated based on student). Please select a student with a valid fee.');
//         return;
//     }
//     if (isNaN(parseFloat(fee.receivedAmount)) || parseFloat(fee.receivedAmount) < 0) {
//       setFormError('Received Amount must be a non-negative number.');
//       return;
//     }
//     if (parseFloat(fee.receivedAmount) > parseFloat(fee.totalFee)) {
//         setFormError('Received Amount cannot be greater than Total Fee.');
//         return;
//     }


//     const formData = new FormData();
//     for (const key in fee) {
//       if (key !== 'billScreenshotUrl' && fee[key] !== null) {
//         formData.append(key, fee[key]);
//       }
//     }

//     if (selectedFile) {
//       formData.append('billScreenshot', selectedFile);
//     } else if (fee.billScreenshotUrl) {
//       formData.append('billScreenshotUrl', fee.billScreenshotUrl);
//     } else {
//       formData.append('billScreenshotUrl', '');
//     }


//     try {
//       if (editingFee) {
//         await api.put(`/fees/${editingFee._id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         await api.post('/fees', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }
//       onClose();
//     } catch (err) {
//       console.error('Failed to save fee record:', err.response?.data || err.message);
//       setFormError('Failed to save fee record: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const getTitle = () => {
//     if (isViewMode) return 'Fee Details (Receipt)';
//     if (editingFee) return 'Edit Fee Record';
//     return 'Add New Fee Record';
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto relative">
//       <button
//         onClick={onClose}
//         className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
//         title="Close"
//       >
//         <XMarkIcon className="h-6 w-6" />
//       </button>
//       <h2 className="text-2xl font-bold mb-4 text-center text-green-700">{getTitle()}</h2>
//       <hr className="mb-4" />

//       {formError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           {formError}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           {/* Student */}
//           <div>
//             <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student<span className="text-red-500">*</span></label>
//             <select id="studentId" name="studentId" value={fee.studentId} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
//               <option value="">Select Student</option>
//               {studentsForForm.map(student => (
//                 <option key={student._id} value={student._id}>{student.name} ({student.cnic})</option>
//               ))}
//             </select>
//           </div>
//           {/* Paid By */}
//           <div>
//             <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">Paid By<span className="text-red-500">*</span></label>
//             <input type="text" id="paidBy" name="paidBy" value={fee.paidBy} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
//           </div>
//           {/* Total Fee (Auto-populated and disabled) */}
//           <div>
//             <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700">Total Fee (Per Month)<span className="text-red-500">*</span></label>
//             <input
//               type="number"
//               id="totalFee"
//               name="totalFee"
//               value={fee.totalFee}
//               onChange={handleChange} // Keep onChange for internal state updates (dueAmount)
//               disabled={true} // Always disabled as it's auto-populated
//               className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 text-gray-700"
//             />
//           </div>
//           {/* Received Amount */}
//           <div>
//             <label htmlFor="receivedAmount" className="block text-sm font-medium text-gray-700">Received Amount<span className="text-red-500">*</span></label>
//             <input type="number" id="receivedAmount" name="receivedAmount" value={fee.receivedAmount} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
//           </div>
//           {/* Due Amount (Display only) */}
//           <div>
//             <label htmlFor="dueAmount" className="block text-sm font-medium text-gray-700">Due Amount</label>
//             <input type="number" id="dueAmount" name="dueAmount" value={fee.dueAmount.toFixed(2)} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 text-gray-700" />
//           </div>
//           {/* Month */}
//           <div>
//             <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month<span className="text-red-500">*</span></label>
//             <select id="month" name="month" value={fee.month} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
//               <option value="">Select Month</option>
//               {months.map(monthName => (
//                 <option key={monthName} value={monthName}>{monthName}</option>
//               ))}
//             </select>
//           </div>
//           {/* Year */}
//           <div>
//             <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year<span className="text-red-500">*</span></label>
//             <select id="year" name="year" value={fee.year} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
//               {generateYearOptions().map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>
//           </div>
//           {/* Received Date */}
//           <div>
//             <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700">Received Date<span className="text-red-500">*</span></label>
//             <input type="date" id="receivedDate" name="receivedDate" value={fee.receivedDate} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
//           </div>
//           {/* Received By */}
//           <div>
//             <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-700">Received By<span className="text-red-500">*</span></label>
//             <input type="text" id="receivedBy" name="receivedBy" value={fee.receivedBy} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
//           </div>
//           {/* Payment Method */}
//           <div>
//             <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method<span className="text-red-500">*</span></label>
//             <select id="paymentMethod" name="paymentMethod" value={fee.paymentMethod} onChange={handleChange} disabled={isViewMode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
//               <option value="">Select Method</option>
//               <option value="Cash">Cash</option>
//               <option value="Bank Transfer">Bank Transfer</option>
//               <option value="Easypaisa">Easypaisa</option>
//               <option value="JazzCash">JazzCash</option>
//               <option value="Online Wallet">Online Wallet</option>
//             </select>
//           </div>

//           {/* Bill Screenshot */}
//           <div className="md:col-span-2">
//             <label htmlFor="billScreenshot" className="block text-sm font-medium text-gray-700">Bill Screenshot</label>
//             {!isViewMode ? ( // Show file input only in edit/add mode
//               <input type="file" id="billScreenshot" name="billScreenshot" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
//             ) : null}

//             {(fee.billScreenshotUrl || selectedFile) && ( // Display existing image or new file preview
//               <div className="mt-2">
//                 <p className="text-sm text-gray-500 mb-1">Current Screenshot:</p>
//                 <img
//                   src={selectedFile ? URL.createObjectURL(selectedFile) : `${backendBaseUrl}${fee.billScreenshotUrl}`}
//                   alt="Bill Screenshot"
//                   className="h-32 w-auto object-cover rounded-md border border-gray-300"
//                   style={{ maxHeight: '150px' }}
//                   onError={(e) => { e.target.onerror = null; e.target.src = '/images/no-image-available.png'; }} // Fallback
//                 />
//                 {isViewMode && fee.billScreenshotUrl && (
//                   <a
//                     href={`${backendBaseUrl}${fee.billScreenshotUrl}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline text-sm mt-1 inline-block"
//                   >
//                     View Full Image
//                   </a>
//                 )}
//                 {!isViewMode && fee.billScreenshotUrl && ( // Option to clear image in edit mode
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
//                       setSelectedFile(null);
//                     }}
//                     className="ml-2 text-red-600 hover:text-red-800 text-sm"
//                   >
//                     Clear Image
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-3">
//           {!isViewMode && ( // Show submit button only in add/edit mode
//             <button
//               type="submit"
//               className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
//             >
//               {editingFee ? 'Update Fee' : 'Add Fee'}
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition"
//           >
//             {isViewMode ? 'Close' : 'Cancel'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FeeForm;



// src/components/FeeForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'; // Added PrinterIcon
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper function to generate year options
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Go back 5 years and forward 1 year from current year
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i.toString());
  }
  return years;
};

const FeeForm = ({ editingFee, fetchFees, studentsForForm, onClose, isViewMode = false }) => {
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
  const backendBaseUrl = 'http://localhost:5000'; // Make sure this matches your backend port

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
    } else {
      setFee(initialState);
      setSelectedFile(null);
    }
    setFormError('');
  }, [editingFee, studentsForForm]); // Added studentsForForm to dependency array

  // Effect to populate totalFee based on selected student
  useEffect(() => {
    if (fee.studentId && studentsForForm.length > 0) {
      const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
      if (selectedStudent && selectedStudent.feePerMonth !== undefined) {
        setFee(prev => ({
          ...prev,
          totalFee: selectedStudent.feePerMonth.toString() // Ensure it's a string for input value
        }));
      } else {
        // If student not found or feePerMonth is missing, clear totalFee
        setFee(prev => ({ ...prev, totalFee: '' }));
      }
    } else if (!fee.studentId && !editingFee) { // Clear totalFee if no student selected for new record
      setFee(prev => ({ ...prev, totalFee: '' }));
    }
  }, [fee.studentId, studentsForForm, editingFee]);

  // Calculate due amount whenever totalFee or receivedAmount changes
  useEffect(() => {
    const total = parseFloat(fee.totalFee);
    const received = parseFloat(fee.receivedAmount);
    if (!isNaN(total) && !isNaN(received)) {
      setFee(prev => ({
        ...prev,
        dueAmount: Math.max(0, total - received)
      }));
    } else {
      setFee(prev => ({ ...prev, dueAmount: 0 }));
    }
  }, [fee.totalFee, fee.receivedAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFee(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFee(prev => ({ ...prev, billScreenshotUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

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
    if (parseFloat(fee.receivedAmount) > parseFloat(fee.totalFee)) {
      setFormError('Received Amount cannot be greater than Total Fee.');
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
      if (editingFee) {
        await api.put(`/fees/${editingFee._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/fees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchFees(); // Refresh the list of fees after successful operation
      onClose();
    } catch (err) {
      console.error('Failed to save fee record:', err.response?.data || err.message);
      setFormError('Failed to save fee record: ' + (err.response?.data?.message || err.message));
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'Fee Details (Receipt)';
    if (editingFee) return 'Edit Fee Record';
    return 'Add New Fee Record';
  };

const handleDownloadReceiptPdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    const studentName = selectedStudent ? selectedStudent.name : 'N/A';
    const studentCnic = selectedStudent ? selectedStudent.cnic : 'N/A';
    const studentClassOrDegree = selectedStudent ? (selectedStudent.class === 'Class' ? `${selectedStudent.classNumber} Class` : `${selectedStudent.degreeName} (Semester ${selectedStudent.semester})`) : 'N/A';

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 167, 69); // Green color
    doc.text('Fee Receipt', 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, yPos);
    yPos += 10;
    doc.line(10, yPos, 200, yPos); // Horizontal Line
    yPos += 15;

    // Student Information Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text('Student Information:', 10, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${studentName}`, 20, yPos);
    yPos += 7;
    doc.text(`CNIC: ${studentCnic}`, 20, yPos);
    yPos += 7;
    doc.text(`Class/Degree: ${studentClassOrDegree}`, 20, yPos);
    yPos += 15;

    // Fee Details Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Fee Details:', 10, yPos);
    yPos += 8;

    const tableData = [
      ['Total Fee (Per Month):', `PKR ${parseFloat(fee.totalFee).toFixed(2)}`],
      ['Received Amount:', `PKR ${parseFloat(fee.receivedAmount).toFixed(2)}`],
      ['Due Amount:', `PKR ${parseFloat(fee.dueAmount).toFixed(2)}`],
      ['Paid For Month:', fee.month],
      ['Paid For Year:', fee.year],
      ['Received Date:', new Date(fee.receivedDate).toLocaleDateString()],
      ['Paid By:', fee.paidBy],
      ['Received By:', fee.receivedBy],
      ['Payment Method:', fee.paymentMethod],
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Amount/Detail']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [40, 167, 69], // Green header
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 }, // Description column bold
        1: { cellWidth: 100 }
      },
      didDrawPage: function (data) {
        // Footer for each page
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('This is an auto-generated fee receipt. No signature is required.', data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    yPos = doc.autoTable.previous.finalY + 10;

    // --- Critical change: Handle image loading synchronously before saving ---
    if (fee.billScreenshotUrl) {
      const img = new Image();
      img.src = `${backendBaseUrl}${fee.billScreenshotUrl}`;
      img.onload = () => {
        const imgWidth = 80; // Fixed width for image
        const imgHeight = (img.height * imgWidth) / img.width; // Maintain aspect ratio

        // Check if image fits on current page, if not, add new page
        if (yPos + imgHeight > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = 20; // Reset yPos for new page
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Bill Screenshot:', 10, yPos);
        yPos += 8;
        doc.addImage(img, 'JPEG', 10, yPos, imgWidth, imgHeight);
        doc.save(`${studentName.replace(/\s/g, '_')}_Fee_Receipt_${fee.month}_${fee.year}.pdf`);
      };
      img.onerror = () => {
        console.warn('Failed to load bill screenshot for PDF. Saving PDF without image.');
        doc.save(`${studentName.replace(/\s/g, '_')}_Fee_Receipt_${fee.month}_${fee.year}.pdf`);
      };
    } else {
      // If no screenshot, save immediately
      doc.save(`${studentName.replace(/\s/g, '_')}_Fee_Receipt_${fee.month}_${fee.year}.pdf`);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Fee Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
      .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      h1 { text-align: center; color: #28a745; margin-bottom: 20px; }
      .header-info { text-align: right; font-size: 10px; color: #777; margin-bottom: 15px; }
      .section-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #555; }
      .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
      .info-item strong { display: block; margin-bottom: 2px; color: #444; }
      .info-item span { display: block; padding-left: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; color: #555; }
      .screenshot-section { margin-top: 20px; text-align: center; }
      .screenshot-section img { max-width: 100%; height: auto; border: 1px solid #ddd; padding: 5px; background-color: #fff; }
      .footer-note { margin-top: 30px; font-size: 0.8em; text-align: center; color: #777; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    const selectedStudent = studentsForForm.find(s => s._id === fee.studentId);
    const studentName = selectedStudent ? selectedStudent.name : 'N/A';
    const studentCnic = selectedStudent ? selectedStudent.cnic : 'N/A';
    const studentClassOrDegree = selectedStudent ? (selectedStudent.class === 'Class' ? `${selectedStudent.classNumber} Class` : `${selectedStudent.degreeName} (Semester ${selectedStudent.semester})`) : 'N/A';

    printWindow.document.write('<div class="container">');
    printWindow.document.write('<h1>Fee Receipt</h1>');
    printWindow.document.write(`<div class="header-info">Date Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>`);

    printWindow.document.write('<div class="section-title">Student Information</div>');
    printWindow.document.write('<div class="info-grid">');
    printWindow.document.write(`<div><strong>Name:</strong> <span>${studentName}</span></div>`);
    printWindow.document.write(`<div><strong>CNIC:</strong> <span>${studentCnic}</span></div>`);
    printWindow.document.write(`<div><strong>Class/Degree:</strong> <span>${studentClassOrDegree}</span></div>`);
    printWindow.document.write('</div>');

    printWindow.document.write('<div class="section-title">Fee Details</div>');
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr><th>Description</th><th>Amount/Detail</th></tr></thead>');
    printWindow.document.write('<tbody>');
    printWindow.document.write(`<tr><td><strong>Total Fee (Per Month):</strong></td><td>PKR ${parseFloat(fee.totalFee).toFixed(2)}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Received Amount:</strong></td><td>PKR ${parseFloat(fee.receivedAmount).toFixed(2)}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Due Amount:</strong></td><td>PKR ${parseFloat(fee.dueAmount).toFixed(2)}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Paid For Month:</strong></td><td>${fee.month}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Paid For Year:</strong></td><td>${fee.year}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Received Date:</strong></td><td>${new Date(fee.receivedDate).toLocaleDateString()}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Paid By:</strong></td><td>${fee.paidBy}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Received By:</strong></td><td>${fee.receivedBy}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Payment Method:</strong></td><td>${fee.paymentMethod}</td></tr>`);
    printWindow.document.write('</tbody></table>');

    if (fee.billScreenshotUrl) {
      printWindow.document.write('<div class="screenshot-section">');
      printWindow.document.write('<div class="section-title">Bill Screenshot</div>');
      printWindow.document.write(`<img src="${backendBaseUrl}${fee.billScreenshotUrl}" alt="Bill Screenshot" />`);
      printWindow.document.write('</div>');
    }

    printWindow.document.write('<div class="footer-note">This is an auto-generated fee receipt. No signature is required.</div>');
    printWindow.document.write('</div>'); // .container
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
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
            <input type="text" id="paidBy" name="paidBy" value={fee.paidBy} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
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
          {/* Received Amount */}
          <div>
            <label htmlFor="receivedAmount" className="block text-sm font-medium text-gray-700 mb-1">Received Amount<span className="text-red-500">*</span></label>
            <input type="number" id="receivedAmount" name="receivedAmount" value={fee.receivedAmount} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
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
            <input type="text" id="receivedBy" name="receivedBy" value={fee.receivedBy} onChange={handleChange} disabled={isViewMode} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out" />
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
            </select>
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