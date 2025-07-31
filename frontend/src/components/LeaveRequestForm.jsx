// // src/components/LeaveRequestForm.jsx
// import React, { useState, useEffect, useContext } from 'react'; // Added useContext
// import api from '../api'; // Your axios instance
// import { XMarkIcon } from '@heroicons/react/24/outline';
// import { UserContext } from '../App'; // <--- Changed from AuthContext

// const LeaveRequestForm = ({ editingLeave, fetchLeaves, studentsForForm, onClose, isViewMode = false, isStaffMode = false }) => {
//   const { currentUser: user } = useContext(UserContext); // <--- Changed to useContext(UserContext)
//   const initialState = {
//     studentId: '',
//     startDate: '',
//     endDate: '',
//     addressGoingTo: '',
//     reason: '',
//     pickerName: '',
//     pickerRelation: '',
//     pickerPhoneNumber: '',
//     pickerCnicNumber: '',
//     leaveTime: '', // Time of leaving on start date
//     expectedReturnTime: '', // Time of returning on end date
//     classInchargeName: '', // Staff can optionally add this
//     // For staff/admin only (not shown to student by default)
//     status: 'Pending', // Default for student, staff can set 'Approved' directly
//     actualReturnTime: '', // Staff can set this later
//   };

//   const [leave, setLeave] = useState(initialState);
//   const [formError, setFormError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});

//   useEffect(() => {
//     if (editingLeave) {
//       // Format dates for input type="date" and "datetime-local"
//       setLeave({
//         ...editingLeave,
//         studentId: editingLeave.student?._id || '',
//         startDate: editingLeave.startDate ? new Date(editingLeave.startDate).toISOString().split('T')[0] : '',
//         endDate: editingLeave.endDate ? new Date(editingLeave.endDate).toISOString().split('T')[0] : '',
//         leaveTime: editingLeave.leaveTime ? new Date(editingLeave.leaveTime).toISOString().slice(0, 16) : '', // YYYY-MM-DDTHH:MM
//         expectedReturnTime: editingLeave.expectedReturnTime ? new Date(editingLeave.expectedReturnTime).toISOString().slice(0, 16) : '',
//         actualReturnTime: editingLeave.actualReturnTime ? new Date(editingLeave.actualReturnTime).toISOString().slice(0, 16) : '',
//         // Ensure status is handled for staff view
//         status: editingLeave.status || 'Pending',
//         classInchargeName: editingLeave.classInchargeName || '',
//       });
//     } else {
//       // If adding, and it's a student applying for themselves, pre-fill studentId
//       if (user?.role === 'student' && user?.profileId) {
//         setLeave({ ...initialState, studentId: user.profileId });
//       } else {
//         setLeave(initialState);
//       }
//     }
//   }, [editingLeave, user]); // Added user to dependencies

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setLeave(prev => ({ ...prev, [name]: value }));
//     setFieldErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!leave.studentId && isStaffMode) errors.studentId = 'Student is required.'; // Only required for staff adding
//     if (!leave.startDate) errors.startDate = 'Start Date is required.';
//     if (!leave.endDate) errors.endDate = 'End Date is required.';
//     if (leave.startDate && leave.endDate && new Date(leave.startDate) > new Date(leave.endDate)) {
//       errors.endDate = 'End Date must be on or after Start Date.';
//     }
//     if (!leave.addressGoingTo) errors.addressGoingTo = 'Address is required.';
//     if (!leave.reason) errors.reason = 'Reason is required.';
//     if (!leave.expectedReturnTime) errors.expectedReturnTime = 'Expected Return Time is required.';

//     // Picker details are required if leave time is specified (i.e. not a full day absence)
//     if (leave.leaveTime) {
//         if (!leave.pickerName) errors.pickerName = 'Picker Name is required.';
//         if (!leave.pickerRelation) errors.pickerRelation = 'Picker Relation is required.';
//         if (!leave.pickerPhoneNumber || !/^\d{11}$/.test(leave.pickerPhoneNumber)) errors.pickerPhoneNumber = 'Valid 11-digit Picker Phone Number is required.';
//         if (!leave.pickerCnicNumber || !/^\d{13}$/.test(leave.pickerCnicNumber)) errors.pickerCnicNumber = 'Valid 13-digit Picker CNIC is required.';
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError('');

//     if (!validateForm()) {
//       setFormError('Please correct the highlighted errors.');
//       return;
//     }

//     try {
//       const payload = {
//         ...leave,
//         // Convert dates to ISO strings for backend
//         startDate: leave.startDate ? new Date(leave.startDate).toISOString() : '',
//         endDate: leave.endDate ? new Date(leave.endDate).toISOString() : '',
//         leaveTime: leave.leaveTime ? new Date(leave.leaveTime).toISOString() : null,
//         expectedReturnTime: leave.expectedReturnTime ? new Date(leave.expectedReturnTime).toISOString() : '',
//         actualReturnTime: isStaffMode && leave.actualReturnTime ? new Date(leave.actualReturnTime).toISOString() : null,
//       };

//       if (editingLeave) {
//         // Only staff/admin can update existing leaves, including status and return time
//         await api.put(`/leave/${editingLeave._id}`, {
//             status: payload.status,
//             actualReturnTime: payload.actualReturnTime // This can be null to unset
//         });
//       } else {
//         await api.post('/leave', payload);
//       }
//       fetchLeaves(); // Refresh the list
//       onClose();
//     } catch (err) {
//       console.error('Failed to save leave request:', err.response?.data?.message || err.message);
//       setFormError(err.response?.data?.message || 'Failed to save leave request.');
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-indigo-700">{editingLeave ? (isViewMode ? 'View Leave Request' : 'Edit Leave Request') : (isStaffMode ? 'Add Student Leave' : 'Apply for Leave')}</h2>
//         <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//           <XMarkIcon className="h-6 w-6" />
//         </button>
//       </div>

//       {formError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           {formError}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {(isStaffMode && !isViewMode) ? ( // For staff/admin adding/editing, they pick student
//           <div>
//             <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
//               Student <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="studentId"
//               name="studentId"
//               value={leave.studentId}
//               onChange={handleChange}
//               disabled={isViewMode || editingLeave} // Student cannot change for existing, admin can't change student ID either
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.studentId ? 'border-red-500' : ''} ${isViewMode || editingLeave ? 'bg-gray-50' : ''}`}
//               required
//             >
//               <option value="">Select Student</option>
//               {studentsForForm.map(student => (
//                 <option key={student._id} value={student._id}>
//                   {student.name} ({student.cnic})
//                 </option>
//               ))}
//             </select>
//             {fieldErrors.studentId && <p className="text-red-500 text-xs mt-1">{fieldErrors.studentId}</p>}
//           </div>
//         ) : ( // Student applying for self, or view mode
//           <input type="hidden" name="studentId" value={leave.studentId} /> // Keep studentId in payload
//         )}

//         {isViewMode && editingLeave?.student && ( // Display student details in view mode
//           <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Student Details</h3>
//             <p><span className="font-medium">Name:</span> {editingLeave.student.name}</p>
//             <p><span className="font-medium">Father Name:</span> {editingLeave.student.fatherName}</p>
//             <p><span className="font-medium">CNIC:</span> {editingLeave.student.cnic}</p>
//             <p><span className="font-medium">Class:</span> {editingLeave.student.class}</p>
//           </div>
//         )}

//         {isStaffMode && ( // This field is only relevant when staff is adding/editing
//           <div>
//             <label htmlFor="classInchargeName" className="block text-sm font-medium text-gray-700 mb-1">
//               Class Incharge Name
//             </label>
//             <input
//               type="text"
//               id="classInchargeName"
//               name="classInchargeName"
//               value={leave.classInchargeName}
//               onChange={handleChange}
//               disabled={isViewMode}
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
//             />
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
//               Start Date <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="date"
//               id="startDate"
//               name="startDate"
//               value={leave.startDate}
//               onChange={handleChange}
//               disabled={isViewMode || (user?.role === 'student' && editingLeave)} // Student can't edit dates after creation
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.startDate ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//               required
//             />
//             {fieldErrors.startDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.startDate}</p>}
//           </div>
//           <div>
//             <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
//               End Date <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="date"
//               id="endDate"
//               name="endDate"
//               value={leave.endDate}
//               onChange={handleChange}
//               disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.endDate ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//               required
//             />
//             {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>}
//           </div>
//           <div>
//             <label htmlFor="leaveTime" className="block text-sm font-medium text-gray-700 mb-1">
//               Leave Time (Optional, if specific time)
//             </label>
//             <input
//               type="datetime-local"
//               id="leaveTime"
//               name="leaveTime"
//               value={leave.leaveTime}
//               onChange={handleChange}
//               disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//             />
//           </div>
//           <div>
//             <label htmlFor="expectedReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
//               Expected Return Time <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="datetime-local"
//               id="expectedReturnTime"
//               name="expectedReturnTime"
//               value={leave.expectedReturnTime}
//               onChange={handleChange}
//               disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//               className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.expectedReturnTime ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//               required
//             />
//             {fieldErrors.expectedReturnTime && <p className="text-red-500 text-xs mt-1">{fieldErrors.expectedReturnTime}</p>}
//           </div>
//         </div>

//         <div>
//           <label htmlFor="addressGoingTo" className="block text-sm font-medium text-gray-700 mb-1">
//             Address (where student is going) <span className="text-red-500">*</span>
//           </label>
//           <textarea
//             id="addressGoingTo"
//             name="addressGoingTo"
//             value={leave.addressGoingTo}
//             onChange={handleChange}
//             disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//             rows="2"
//             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.addressGoingTo ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//             required
//           ></textarea>
//           {fieldErrors.addressGoingTo && <p className="text-red-500 text-xs mt-1">{fieldErrors.addressGoingTo}</p>}
//         </div>

//         <div>
//           <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
//             Reason for Leave <span className="text-red-500">*</span>
//           </label>
//           <textarea
//             id="reason"
//             name="reason"
//             value={leave.reason}
//             onChange={handleChange}
//             disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//             rows="3"
//             className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.reason ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//             required
//           ></textarea>
//           {fieldErrors.reason && <p className="text-red-500 text-xs mt-1">{fieldErrors.reason}</p>}
//         </div>

//         {leave.leaveTime && ( // Only show picker details if a specific leave time is set
//           <div className="space-y-4 border p-4 rounded-md bg-blue-50">
//             <h3 className="text-lg font-semibold text-blue-800">Person Picking Up Student</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="pickerName" className="block text-sm font-medium text-gray-700 mb-1">
//                   Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="pickerName"
//                   name="pickerName"
//                   value={leave.pickerName}
//                   onChange={handleChange}
//                   disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//                   className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerName ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//                   required={!!leave.leaveTime}
//                 />
//                 {fieldErrors.pickerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerName}</p>}
//               </div>
//               <div>
//                 <label htmlFor="pickerRelation" className="block text-sm font-medium text-gray-700 mb-1">
//                   Relation with Student <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="pickerRelation"
//                   name="pickerRelation"
//                   value={leave.pickerRelation}
//                   onChange={handleChange}
//                   disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//                   className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerRelation ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//                   required={!!leave.leaveTime}
//                 />
//                 {fieldErrors.pickerRelation && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerRelation}</p>}
//               </div>
//               <div>
//                 <label htmlFor="pickerPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="pickerPhoneNumber"
//                   name="pickerPhoneNumber"
//                   value={leave.pickerPhoneNumber}
//                   onChange={handleChange}
//                   disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//                   className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerPhoneNumber ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//                   required={!!leave.leaveTime}
//                   maxLength="11"
//                   pattern="^\d{11}$"
//                   title="Please enter a valid 11-digit phone number"
//                 />
//                 {fieldErrors.pickerPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerPhoneNumber}</p>}
//               </div>
//               <div>
//                 <label htmlFor="pickerCnicNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                   CNIC Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="pickerCnicNumber"
//                   name="pickerCnicNumber"
//                   value={leave.pickerCnicNumber}
//                   onChange={handleChange}
//                   disabled={isViewMode || (user?.role === 'student' && editingLeave)}
//                   className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerCnicNumber ? 'border-red-500' : ''} ${isViewMode || (user?.role === 'student' && editingLeave) ? 'bg-gray-50' : ''}`}
//                   required={!!leave.leaveTime}
//                   maxLength="13"
//                   pattern="^\d{13}$"
//                   title="Please enter a valid 13-digit CNIC number"
//                 />
//                 {fieldErrors.pickerCnicNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerCnicNumber}</p>}
//               </div>
//             </div>
//           </div>
//         )}

//         {isStaffMode && ( // Staff/Admin can change status and set actual return time
//           <>
//             <div>
//               <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
//                 Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="status"
//                 name="status"
//                 value={leave.status}
//                 onChange={handleChange}
//                 disabled={isViewMode}
//                 className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="Approved">Approved</option>
//                 <option value="Rejected">Rejected</option>
//               </select>
//             </div>
//             <div>
//               <label htmlFor="actualReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
//                 Actual Return Time
//               </label>
//               <input
//                 type="datetime-local"
//                 id="actualReturnTime"
//                 name="actualReturnTime"
//                 value={leave.actualReturnTime}
//                 onChange={handleChange}
//                 disabled={isViewMode}
//                 className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
//               />
//                {/* Button to clear actualReturnTime */}
//                {!isViewMode && leave.actualReturnTime && (
//                 <button
//                   type="button"
//                   onClick={() => setLeave(prev => ({ ...prev, actualReturnTime: '' }))}
//                   className="mt-2 text-red-600 hover:text-red-800 text-sm"
//                 >
//                   Clear Actual Return Time
//                 </button>
//               )}
//             </div>
//             {isViewMode && (
//               <>
//                 {editingLeave?.approvedBy && (
//                   <p className="text-sm text-gray-600">
//                     <span className="font-medium">Approved/Rejected By:</span> {editingLeave.approvedBy.name} ({editingLeave.approvedBy.role})
//                   </p>
//                 )}
//                 <p className="text-sm text-gray-600">
//                   <span className="font-medium">Requested By:</span> {editingLeave?.requestedBy?.name} ({editingLeave.requestedByType})
//                 </p>
//               </>
//             )}
//           </>
//         )}

//         <div className="flex justify-end space-x-3 mt-6">
//           {!isViewMode && (
//             <button
//               type="submit"
//               className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md"
//             >
//               {editingLeave ? 'Update Leave' : 'Submit Leave Request'}
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200"
//           >
//             {isViewMode ? 'Close' : 'Cancel'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LeaveRequestForm;




import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../App';

const LeaveRequestForm = ({ editingLeave, fetchLeaves, studentsForForm, onClose, isViewMode = false }) => {
  const { currentUser: user } = useContext(UserContext);
  const initialState = {
    studentId: '',
    startDate: '',
    endDate: '',
    addressGoingTo: '',
    reason: '',
    pickerName: '',
    pickerRelation: '',
    pickerPhoneNumber: '',
    pickerCnicNumber: '',
    leaveTime: '', // Time of leaving on start date
    expectedReturnTime: '', // Time of returning on end date
    classInchargeName: '', // Staff can optionally add this
    status: 'Pending', // Default for student, staff can set 'Approved' directly
    actualReturnTime: '', // Staff can set this later
  };

  const [leave, setLeave] = useState(initialState);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Determine if the current user is an admin or teacher
  const isAdminOrTeacher = (user?.role === 'admin') || (user?.role === 'teacher');
  // Determine if the current user is a student
  const isStudentUser = user?.role === 'student';

  const [viewStudentDetails, setViewStudentDetails] = useState(null);

  useEffect(() => {
    if (editingLeave) {

      const foundStudent = studentsForForm.find(
        (s) => s._id === (editingLeave.student?._id || editingLeave.studentId)
      );
      setViewStudentDetails(foundStudent); // Set the full student details

      // Format dates for input type="date" and "datetime-local"
      setLeave({
        ...editingLeave,
        studentId: editingLeave.student?._id || '',
        startDate: editingLeave.startDate ? new Date(editingLeave.startDate).toISOString().split('T')[0] : '',
        endDate: editingLeave.endDate ? new Date(editingLeave.endDate).toISOString().split('T')[0] : '',
        leaveTime: editingLeave.leaveTime || '',
        expectedReturnTime: editingLeave.expectedReturnTime || '',
        actualReturnTime: editingLeave.actualReturnTime ? new Date(editingLeave.actualReturnTime).toISOString().slice(0, 16) : '',
        pickerName: editingLeave.pickerName || '',
        pickerRelation: editingLeave.pickerRelation || '',
        pickerPhoneNumber: editingLeave.pickerPhoneNumber || '',
        pickerCnicNumber: editingLeave.pickerCnicNumber || '',
        classInchargeName: editingLeave.classInchargeName || '',
        studentName: editingLeave.studentName || '',
        fatherName: editingLeave.fatherName || '',
        studentClass: editingLeave.studentClass || '',
      });
    } else {
      // Reset form for new entry
      setLeave(initialState);
      // If student, pre-fill studentId and disable selection
      if (isStudentUser && user?.profileId) {
        setLeave(prev => ({ ...prev, studentId: user.profileId }));
      }
      setViewStudentDetails(null);
    }
    setFormError('');
    setFieldErrors({});
  }, [editingLeave, user, isStudentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!leave.studentId) { errors.studentId = 'Student is required.'; isValid = false; }
    if (!leave.startDate) { errors.startDate = 'Start Date is required.'; isValid = false; }
    if (!leave.endDate) { errors.endDate = 'End Date is required.'; isValid = false; }
    if (!leave.reason) { errors.reason = 'Reason for leave is required.'; isValid = false; }
    if (!leave.addressGoingTo) { errors.addressGoingTo = 'Address is required.'; isValid = false; }

    // Picker details are conditionally required if leaveTime is set
    if (leave.leaveTime) {
      if (!leave.pickerName) { errors.pickerName = 'Picker Name is required.'; isValid = false; }
      if (!leave.pickerRelation) { errors.pickerRelation = 'Picker Relation is required.'; isValid = false; }
      if (!leave.pickerPhoneNumber) { errors.pickerPhoneNumber = 'Picker Phone Number is required.'; isValid = false; }
      if (!leave.pickerCnicNumber) { errors.pickerCnicNumber = 'Picker CNIC Number is required.'; isValid = false; }
    }

    if (leave.pickerPhoneNumber && !/^\d{11}$/.test(leave.pickerPhoneNumber)) {
      errors.pickerPhoneNumber = 'Phone number must be 11 digits.';
      isValid = false;
    }
    if (leave.pickerCnicNumber && !/^\d{13}$/.test(leave.pickerCnicNumber)) {
      errors.pickerCnicNumber = 'CNIC number must be 13 digits.';
      isValid = false;
    }

    // Date validation
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    if (leave.startDate && leave.endDate && start > end) {
      errors.endDate = 'End Date cannot be before Start Date.';
      isValid = false;
    }


    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (!validateForm()) {
      setFormError('Please correct the errors in the form.');
      return;
    }

    try {
      if (editingLeave) {
        await api.put(`/leave/${editingLeave._id}`, leave);
        console.log('Leave request updated successfully!');
      } else {
        await api.post('/leave', leave);
        console.log('Leave request submitted successfully!');
      }
      onClose();
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave request:', err.response?.data?.message || err.message);
      setFormError(err.response?.data?.message || 'Failed to submit leave request. Please try again.');
    }
  };

  // Determine if a field is disabled for the current user
  const isFieldDisabled = (field) => {
    if (isViewMode) return true; // Always disabled in view mode

    if (isStudentUser && editingLeave) {
      // Student can only edit if it's their own pending leave
      if (editingLeave.student?._id !== user.profileId || editingLeave.status !== 'Pending') {
        return true; // Disable if not their pending leave
      }
      // Specific fields a student cannot edit even if pending (e.g., status, actualReturnTime, classInchargeName)
      if (['status', 'actualReturnTime', 'classInchargeName'].includes(field)) {
        return true;
      }
    }
    // If not in view mode and not a student editing their own pending, fields are enabled
    return false;
  };


  return (
    <div className="relative p-6 bg-white rounded-lg shadow-xl max-w-full mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        {isViewMode ? 'Leave Request Details' : (editingLeave ? 'Edit Student Leave Request' : 'New Student Leave Request')}
      </h2>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isViewMode && editingLeave && ( // Changed editingLeave.student to just editingLeave as top-level fields are used
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Student Details</h3>
            {/* Use the top-level properties directly from editingLeave */}
            <p><span className="font-medium">Name:</span> {editingLeave.studentName}</p>
            <p><span className="font-medium">Father Name:</span> {editingLeave.fatherName}</p>
            <p><span className="font-medium">CNIC:</span> {editingLeave.student?.cnic}</p> {/* Keep student?.cnic as CNIC is in the nested student object */}
            <p><span className="font-medium">Class:</span>
              {viewStudentDetails
                ? (viewStudentDetails.class === 'Class'
                  ? `Class ${viewStudentDetails.classNumber}`
                  : `BS Sem ${viewStudentDetails.semester}`)
                : editingLeave.studentClass // Fallback to editingLeave.studentClass if full details not found
              }
            </p>
          </div>
        )}
        {/* Student Selection (for Admin/Teacher) or Display (for Student) */}
        <div className="border border-gray-200 p-4 rounded-md bg-gray-50 mb-6">
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          {isAdminOrTeacher && !isViewMode ? ( // Show dropdown for Admin/Teacher in add/edit mode
            <select
              id="studentId"
              name="studentId"
              value={leave.studentId}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.studentId ? 'border-red-500' : ''}`}
              required
            >
              <option value="">-- Select Student --</option>
              {studentsForForm.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.cnic}) - {student.class === 'Class' ? `Class ${student.classNumber}` : `BS Sem ${student.semester}`}
                </option>
              ))}
            </select>
          ) : ( // Show pre-filled student details for Student user or in view mode
            // <p className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100`}>
            //   {editingLeave?.student?.name || user?.name || 'N/A'} (CNIC: {editingLeave?.student?.cnic || user?.cnic || 'N/A'})
            // </p>
            <p className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100`}>
              {editingLeave?.studentName || user?.name || 'N/A'} (CNIC: {editingLeave?.student?.cnic || user?.cnic || 'N/A'})
            </p>
          )}
          {fieldErrors.studentId && <p className="text-red-500 text-xs mt-1">{fieldErrors.studentId}</p>}
        </div>

        {/* Leave Details Section */}
        <div className="border border-indigo-200 p-4 rounded-md bg-indigo-50 mb-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">Leave Period & Reason</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={leave.startDate}
                onChange={handleChange}
                disabled={isFieldDisabled('startDate')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.startDate ? 'border-red-500' : ''} ${isFieldDisabled('startDate') ? 'bg-gray-100' : ''}`}
                required
              />
              {fieldErrors.startDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={leave.endDate}
                onChange={handleChange}
                disabled={isFieldDisabled('endDate')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.endDate ? 'border-red-500' : ''} ${isFieldDisabled('endDate') ? 'bg-gray-100' : ''}`}
                required
              />
              {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressGoingTo" className="block text-sm font-medium text-gray-700 mb-1">
                Address Going To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressGoingTo"
                name="addressGoingTo"
                value={leave.addressGoingTo}
                onChange={handleChange}
                disabled={isFieldDisabled('addressGoingTo')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.addressGoingTo ? 'border-red-500' : ''} ${isFieldDisabled('addressGoingTo') ? 'bg-gray-100' : ''}`}
                required
              />
              {fieldErrors.addressGoingTo && <p className="text-red-500 text-xs mt-1">{fieldErrors.addressGoingTo}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={leave.reason}
                onChange={handleChange}
                disabled={isFieldDisabled('reason')}
                rows="3"
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.reason ? 'border-red-500' : ''} ${isFieldDisabled('reason') ? 'bg-gray-100' : ''}`}
                required
              ></textarea>
              {fieldErrors.reason && <p className="text-red-500 text-xs mt-1">{fieldErrors.reason}</p>}
            </div>
            <div>
              <label htmlFor="leaveTime" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Time (on Start Date)
              </label>
              <input
                type="time"
                id="leaveTime"
                name="leaveTime"
                value={leave.leaveTime}
                onChange={handleChange}
                disabled={isFieldDisabled('leaveTime')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isFieldDisabled('leaveTime') ? 'bg-gray-100' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="expectedReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return Time (on End Date)
              </label>
              <input
                type="time"
                id="expectedReturnTime"
                name="expectedReturnTime"
                value={leave.expectedReturnTime}
                onChange={handleChange}
                disabled={isFieldDisabled('expectedReturnTime')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isFieldDisabled('expectedReturnTime') ? 'bg-gray-100' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Person Picking Up Student Section - Conditionally required fields */}
        <div className="border border-blue-200 p-4 rounded-md bg-blue-50 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Person Picking Up Student (Optional unless Leave Time is Set)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="pickerName" className="block text-sm font-medium text-gray-700 mb-1">
                Name {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerName"
                name="pickerName"
                value={leave.pickerName}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerName')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerName ? 'border-red-500' : ''} ${isFieldDisabled('pickerName') ? 'bg-gray-100' : ''}`}
                required={!!leave.leaveTime}
              />
              {fieldErrors.pickerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerName}</p>}
            </div>
            <div>
              <label htmlFor="pickerRelation" className="block text-sm font-medium text-gray-700 mb-1">
                Relation with Student {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerRelation"
                name="pickerRelation"
                value={leave.pickerRelation}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerRelation')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerRelation ? 'border-red-500' : ''} ${isFieldDisabled('pickerRelation') ? 'bg-gray-100' : ''}`}
                required={!!leave.leaveTime}
              />
              {fieldErrors.pickerRelation && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerRelation}</p>}
            </div>
            <div>
              <label htmlFor="pickerPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerPhoneNumber"
                name="pickerPhoneNumber"
                value={leave.pickerPhoneNumber}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerPhoneNumber')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerPhoneNumber ? 'border-red-500' : ''} ${isFieldDisabled('pickerPhoneNumber') ? 'bg-gray-100' : ''}`}
                required={!!leave.leaveTime}
                maxLength="11"
                pattern="^\d{11}$"
                title="Please enter a valid 11-digit phone number"
              />
              {fieldErrors.pickerPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerPhoneNumber}</p>}
            </div>
            <div>
              <label htmlFor="pickerCnicNumber" className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerCnicNumber"
                name="pickerCnicNumber"
                value={leave.pickerCnicNumber}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerCnicNumber')}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerCnicNumber ? 'border-red-500' : ''} ${isFieldDisabled('pickerCnicNumber') ? 'bg-gray-100' : ''}`}
                required={!!leave.leaveTime}
                maxLength="13"
                pattern="^\d{13}$"
                title="Please enter a valid 13-digit CNIC number"
              />
              {fieldErrors.pickerCnicNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerCnicNumber}</p>}
            </div>
          </div>
        </div>

        {/* Status and Admin/Teacher Specific Fields */}
        {(isAdminOrTeacher || isViewMode) && ( // Show these fields to Admin/Teacher, or in View Mode for any user
          <div className="border border-green-200 p-4 rounded-md bg-green-50 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Status & Staff Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={leave.status}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher} // Disabled if in view mode OR if not Admin/Teacher
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-100' : ''}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label htmlFor="classInchargeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Class Incharge Name (Optional)
                </label>
                <input
                  type="text"
                  id="classInchargeName"
                  name="classInchargeName"
                  value={leave.classInchargeName}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher} // Disabled if in view mode OR if not Admin/Teacher
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-100' : ''}`}
                />
              </div>

              <div>
                <label htmlFor="actualReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Return Time
                </label>
                <input
                  type="datetime-local"
                  id="actualReturnTime"
                  name="actualReturnTime"
                  value={leave.actualReturnTime}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher} // Disabled if in view mode OR if not Admin/Teacher
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-100' : ''}`}
                />
                {leave.actualReturnTime && !isViewMode && isAdminOrTeacher && (
                  <button
                    type="button"
                    onClick={() => setLeave(prev => ({ ...prev, actualReturnTime: '' }))}
                    className="text-red-600 mt-2 text-sm hover:underline"
                  >
                    Clear Actual Return Time
                  </button>
                )}
              </div>
            </div>
            {isViewMode && (
              <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                {editingLeave?.requestedBy && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-green-800">Requested By:</span>{' '}
                    {editingLeave.requestedBy.name} ({editingLeave.requestedBy.role})
                  </p>
                )}
                {editingLeave?.approvedBy && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-green-800">Approved/Rejected By:</span>{' '}
                    {editingLeave.approvedBy.name} ({editingLeave.approvedBy.role})
                  </p>
                )}
                {editingLeave?.requestedAt && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-green-800">Requested At:</span>{' '}
                    {new Date(editingLeave.requestedAt).toLocaleString()}
                  </p>
                )}
                {editingLeave?.approvedRejectedAt && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-green-800">Status Updated At:</span>{' '}
                    {new Date(editingLeave.approvedRejectedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-8">
          {!isViewMode && (
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingLeave ? 'Update Leave' : 'Submit Leave Request'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;