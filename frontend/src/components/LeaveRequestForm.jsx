import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';

const LeaveRequestForm = ({ editingLeave, fetchLeaves, studentsForForm, onClose, isViewMode = false }) => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();
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

  // Helper to render student class/semester nicely
  const formatStudentClassLabel = (student) => {
    if (!student) return 'N/A';
    const cls = student.class;
    if (cls === 'Class') return student.classNumber ? `Class ${student.classNumber}` : 'Class N/A';
    if (cls === 'Almiya') return student.classNumber ? `${student.classIdentifier || 'Almiya'} (Grade ${student.classNumber})` : 'Almiya (Grade N/A)';
    if (cls === 'BS') return student.semester ? `BS Sem ${student.semester}` : 'BS Sem N/A';
    if (cls === 'Hifaz') return `Hifaz (Juz ${student.currentJuz ?? 'N/A'})`;
    return student.class || 'N/A';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If student is selected, populate related student fields required by backend
    if (name === 'studentId') {
      const selected = studentsForForm.find(s => s._id === value);
      if (selected) {
        setViewStudentDetails(selected);
        setLeave(prev => ({
          ...prev,
          studentId: value,
          studentClass: selected.class || prev.studentClass || '',
          studentName: selected.name || prev.studentName || '',
          fatherName: selected.fatherName || prev.fatherName || '',
        }));
        setFieldErrors(prev => ({ ...prev, studentId: '' }));
        return;
      }
    }

    setLeave(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Keep leave.studentClass and viewStudentDetails in sync when studentId changes
  React.useEffect(() => {
    if (leave.studentId && studentsForForm?.length) {
      const s = studentsForForm.find(st => st._id === leave.studentId);
      if (s) {
        setViewStudentDetails(s);
        setLeave(prev => ({
          ...prev,
          studentClass: prev.studentClass || s.class || '',
          studentName: prev.studentName || s.name || '',
          fatherName: prev.fatherName || s.fatherName || '',
        }));
      }
    }
  }, [leave.studentId, studentsForForm]);

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
    <div className={`relative p-6 sm:p-8 lg:p-10 rounded-2xl max-w-full mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar ${currentTheme.cardBg || 'bg-white'} shadow-2xl ${currentTheme.border || 'border border-gray-100'}`}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
      >
        <XMarkIcon className="h-7 w-7" />
      </button>
      <h2 className={`text-3xl sm:text-4xl font-bold mb-2 text-center ${currentTheme.heroTitle || 'text-gray-800'}`}>
        {isViewMode ? 'Leave Request Details' : (editingLeave ? 'Edit Student Leave Request' : 'New Student Leave Request')}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">Manage student leave requests efficiently</p>

      {formError && (
        <div className={`${currentTheme.alertErrorBg || 'bg-red-100'} ${currentTheme.alertErrorBorder || 'border border-red-400'} ${currentTheme.alertErrorText || 'text-red-700'} px-4 py-3 rounded-lg relative mb-6 shadow-sm`} role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isViewMode && editingLeave && (
          <div className={`${currentTheme.panelBg || 'bg-blue-50'} p-6 rounded-xl border-2 ${currentTheme.border || 'border-blue-200'} shadow-sm mb-6`}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-300 pb-2">Student Details</h3>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{editingLeave.studentName}</span></p>
              <p><span className="font-semibold text-gray-700">Father Name:</span> <span className="text-gray-600">{editingLeave.fatherName}</span></p>
              <p><span className="font-semibold text-gray-700">CNIC:</span> <span className="text-gray-600">{editingLeave.student?.cnic}</span></p>
              <p><span className="font-semibold text-gray-700">Class:</span> <span className="text-gray-600">
                {viewStudentDetails
                  ? formatStudentClassLabel(viewStudentDetails)
                  : (editingLeave.studentClass || 'N/A')
                }
              </span></p>
            </div>
          </div>
        )}
        {/* Student Selection (for Admin/Teacher) or Display (for Student) */}
        <div className="mb-6">
          <label htmlFor="studentId" className="block text-sm font-bold text-gray-700 mb-2">
            Student <span className="text-red-500">*</span>
          </label>
          {isAdminOrTeacher && !isViewMode ? (
            <select
              id="studentId"
              name="studentId"
              value={leave.studentId}
              onChange={handleChange}
                className={`block w-full border-2 ${currentTheme.inputBorder || 'border-gray-200'} rounded-lg px-4 py-2 ${currentTheme.inputFocus || 'focus:ring-2 focus:ring-green-400 focus:border-green-500'} hover:border-gray-300 transition shadow-sm ${currentTheme.inputBg || 'bg-white'} ${fieldErrors.studentId ? 'border-red-500' : ''}`}
              required
            >
              <option value="">-- Select Student --</option>
              {studentsForForm.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.cnic}) - {formatStudentClassLabel(student)}
                </option>
              ))}
            </select>
          ) : (
            <p className={`block w-full border-2 ${currentTheme.inputBorder || 'border-gray-200'} rounded-lg px-4 py-2 ${currentTheme.inputBgDisabled || 'bg-gray-50'} shadow-sm`}>
              {editingLeave?.studentName || user?.name || 'N/A'} (CNIC: {editingLeave?.student?.cnic || user?.cnic || 'N/A'})
            </p>
          )}
          {fieldErrors.studentId && <p className="text-red-500 text-xs mt-1">{fieldErrors.studentId}</p>}
        </div>

        {/* Leave Details Section */}
        <div className={`p-6 rounded-xl border-2 ${currentTheme.border || 'border-green-200'} ${currentTheme.panelBg || 'bg-green-50'} shadow-sm mb-6`}>
          <h3 className="text-xl font-bold mb-6 text-green-800 border-b-2 border-green-300 pb-2">Leave Period & Reason</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={leave.startDate}
                onChange={handleChange}
                disabled={isFieldDisabled('startDate')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.startDate ? 'border-red-500' : ''} ${isFieldDisabled('startDate') ? 'bg-gray-50' : 'bg-white'}`}
                required
              />
              {fieldErrors.startDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-bold text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={leave.endDate}
                onChange={handleChange}
                disabled={isFieldDisabled('endDate')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.endDate ? 'border-red-500' : ''} ${isFieldDisabled('endDate') ? 'bg-gray-50' : 'bg-white'}`}
                required
              />
              {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressGoingTo" className="block text-sm font-bold text-gray-700 mb-2">
                Address Going To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressGoingTo"
                name="addressGoingTo"
                value={leave.addressGoingTo}
                onChange={handleChange}
                disabled={isFieldDisabled('addressGoingTo')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.addressGoingTo ? 'border-red-500' : ''} ${isFieldDisabled('addressGoingTo') ? 'bg-gray-50' : 'bg-white'}`}
                required
              />
              {fieldErrors.addressGoingTo && <p className="text-red-500 text-xs mt-1">{fieldErrors.addressGoingTo}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={leave.reason}
                onChange={handleChange}
                disabled={isFieldDisabled('reason')}
                rows="3"
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.reason ? 'border-red-500' : ''} ${isFieldDisabled('reason') ? 'bg-gray-50' : 'bg-white'}`}
                required
              ></textarea>
              {fieldErrors.reason && <p className="text-red-500 text-xs mt-1">{fieldErrors.reason}</p>}
            </div>
            <div>
              <label htmlFor="leaveTime" className="block text-sm font-bold text-gray-700 mb-2">
                Leave Time (on Start Date)
              </label>
              <input
                type="time"
                id="leaveTime"
                name="leaveTime"
                value={leave.leaveTime}
                onChange={handleChange}
                disabled={isFieldDisabled('leaveTime')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isFieldDisabled('leaveTime') ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>
            <div>
              <label htmlFor="expectedReturnTime" className="block text-sm font-bold text-gray-700 mb-2">
                Expected Return Time (on End Date)
              </label>
              <input
                type="time"
                id="expectedReturnTime"
                name="expectedReturnTime"
                value={leave.expectedReturnTime}
                onChange={handleChange}
                disabled={isFieldDisabled('expectedReturnTime')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isFieldDisabled('expectedReturnTime') ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>
          </div>
        </div>

        {/* Person Picking Up Student Section - Conditionally required fields */}
        <div className={`border-2 ${currentTheme.border || 'border-purple-200'} p-6 rounded-xl ${currentTheme.panelBg || 'bg-purple-50'} shadow-sm mb-6`}>
          <h3 className="text-xl font-bold text-purple-800 mb-6 border-b-2 border-purple-300 pb-2">Person Picking Up Student (Optional unless Leave Time is Set)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pickerName" className="block text-sm font-bold text-gray-700 mb-2">
                Name {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerName"
                name="pickerName"
                value={leave.pickerName}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerName')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerName ? 'border-red-500' : ''} ${isFieldDisabled('pickerName') ? 'bg-gray-50' : 'bg-white'}`}
                required={!!leave.leaveTime}
              />
              {fieldErrors.pickerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerName}</p>}
            </div>
            <div>
              <label htmlFor="pickerRelation" className="block text-sm font-bold text-gray-700 mb-2">
                Relation with Student {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerRelation"
                name="pickerRelation"
                value={leave.pickerRelation}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerRelation')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerRelation ? 'border-red-500' : ''} ${isFieldDisabled('pickerRelation') ? 'bg-gray-50' : 'bg-white'}`}
                required={!!leave.leaveTime}
              />
              {fieldErrors.pickerRelation && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerRelation}</p>}
            </div>
            <div>
              <label htmlFor="pickerPhoneNumber" className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerPhoneNumber"
                name="pickerPhoneNumber"
                value={leave.pickerPhoneNumber}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerPhoneNumber')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerPhoneNumber ? 'border-red-500' : ''} ${isFieldDisabled('pickerPhoneNumber') ? 'bg-gray-50' : 'bg-white'}`}
                required={!!leave.leaveTime}
                maxLength="11"
                pattern="^\d{11}$"
                title="Please enter a valid 11-digit phone number"
              />
              {fieldErrors.pickerPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerPhoneNumber}</p>}
            </div>
            <div>
              <label htmlFor="pickerCnicNumber" className="block text-sm font-bold text-gray-700 mb-2">
                CNIC Number {leave.leaveTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="pickerCnicNumber"
                name="pickerCnicNumber"
                value={leave.pickerCnicNumber}
                onChange={handleChange}
                disabled={isFieldDisabled('pickerCnicNumber')}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerCnicNumber ? 'border-red-500' : ''} ${isFieldDisabled('pickerCnicNumber') ? 'bg-gray-50' : 'bg-white'}`}
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
        {(isAdminOrTeacher || isViewMode) && (
          <div className={`border-2 ${currentTheme.border || 'border-blue-200'} p-6 rounded-xl ${currentTheme.panelBg || 'bg-blue-50'} shadow-sm mb-6`}>
            <h3 className="text-xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2">Status & Staff Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={leave.status}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label htmlFor="classInchargeName" className="block text-sm font-bold text-gray-700 mb-2">
                  Class Incharge Name (Optional)
                </label>
                <input
                  type="text"
                  id="classInchargeName"
                  name="classInchargeName"
                  value={leave.classInchargeName}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>

              <div>
                <label htmlFor="actualReturnTime" className="block text-sm font-bold text-gray-700 mb-2">
                  Actual Return Time
                </label>
                <input
                  type="datetime-local"
                  id="actualReturnTime"
                  name="actualReturnTime"
                  value={leave.actualReturnTime}
                  onChange={handleChange}
                  disabled={isViewMode || !isAdminOrTeacher}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || !isAdminOrTeacher ? 'bg-gray-50' : 'bg-white'}`}
                />
                {leave.actualReturnTime && !isViewMode && isAdminOrTeacher && (
                  <button
                    type="button"
                    onClick={() => setLeave(prev => ({ ...prev, actualReturnTime: '' }))}
                    className="text-red-600 mt-2 text-sm hover:underline font-semibold"
                  >
                    Clear Actual Return Time
                  </button>
                )}
              </div>
            </div>
            {isViewMode && (
              <div className="mt-6 pt-6 border-t-2 border-blue-300 space-y-3">
                {editingLeave?.requestedBy && (
                  <p className="text-sm">
                    <span className="font-bold text-blue-800">Requested By:</span>{' '}
                    <span className="text-gray-700">{editingLeave.requestedBy.name} ({editingLeave.requestedBy.role})</span>
                  </p>
                )}
                {editingLeave?.approvedBy && (
                  <p className="text-sm">
                    <span className="font-bold text-blue-800">Approved/Rejected By:</span>{' '}
                    <span className="text-gray-700">{editingLeave.approvedBy.name} ({editingLeave.approvedBy.role})</span>
                  </p>
                )}
                {editingLeave?.requestedAt && (
                  <p className="text-sm">
                    <span className="font-bold text-blue-800">Requested At:</span>{' '}
                    <span className="text-gray-700">{new Date(editingLeave.requestedAt).toLocaleString()}</span>
                  </p>
                )}
                {editingLeave?.approvedRejectedAt && (
                  <p className="text-sm">
                    <span className="font-bold text-blue-800">Status Updated At:</span>{' '}
                    <span className="text-gray-700">{new Date(editingLeave.approvedRejectedAt).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
          {!isViewMode && (
            <button
              type="submit"
              className={`${currentTheme.btnPrimaryBg || 'bg-green-600'} ${currentTheme.btnPrimaryText || 'text-white'} px-8 py-2.5 rounded-lg ${currentTheme.btnPrimaryHover || 'hover:bg-green-700'} transition shadow-md hover:shadow-lg active:scale-95 font-semibold`}
            >
              {editingLeave ? 'Update Leave' : 'Submit Leave Request'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-8 py-2.5 rounded-lg hover:bg-gray-400 transition shadow-md hover:shadow-lg active:scale-95 font-semibold"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;