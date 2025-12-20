// src/components/StaffLeaveRequestForm.jsx
import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import api from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../App'; // <--- Changed from AuthContext

const StaffLeaveRequestForm = ({ editingLeave, fetchLeaves, staffMembersForForm, onClose, isViewMode = false, isStaffMode = false }) => {
  const { currentUser: user } = useContext(UserContext); // <--- Changed to useContext(UserContext)
  const initialState = {
    staffId: '',
    startDate: '',
    endDate: '',
    addressGoingTo: '',
    reason: '',
    pickerName: '',
    pickerRelation: '',
    pickerPhoneNumber: '',
    pickerCnicNumber: '',
    leaveTime: '',
    expectedReturnTime: '',
    status: 'Pending', 
    actualReturnTime: '',
  };

  const [leave, setLeave] = useState(initialState);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (editingLeave) {
      setLeave({
        ...editingLeave,
        staffId: editingLeave.staff?._id || '',
        startDate: editingLeave.startDate ? new Date(editingLeave.startDate).toISOString().split('T')[0] : '',
        endDate: editingLeave.endDate ? new Date(editingLeave.endDate).toISOString().split('T')[0] : '',
        leaveTime: editingLeave.leaveTime || '',
        expectedReturnTime: editingLeave.expectedReturnTime || '',
        actualReturnTime: editingLeave.actualReturnTime ? new Date(editingLeave.actualReturnTime).toISOString().slice(0, 16) : '',
        status: editingLeave.status || 'Pending',
        staffName: editingLeave.staffName || '',
        staffType: editingLeave.staffType || '',
        
      });
    } else {
      // If adding, and it's a staff member applying for themselves, pre-fill staffId
      if (!isStaffMode && user?.profileId) { // If not admin adding for someone else
        setLeave({ ...initialState, staffId: user.profileId });
      } else {
        setLeave(initialState);
      }
    }
  }, [editingLeave, isStaffMode, user]); // Added user to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!leave.staffId) errors.staffId = 'Staff member is required.';
    if (!leave.startDate) errors.startDate = 'Start Date is required.';
    if (!leave.endDate) errors.endDate = 'End Date is required.';
    if (leave.startDate && leave.endDate && new Date(leave.startDate) > new Date(leave.endDate)) {
      errors.endDate = 'End Date must be on or after Start Date.';
    }
    if (!leave.reason) errors.reason = 'Reason for Leave is required.';
    if (!leave.expectedReturnTime) errors.expectedReturnTime = 'Expected Return Time is required.';

    // Picker details are optional for staff, but validate if provided
    // if (leave.pickerPhoneNumber && !/^\d{11}$/.test(leave.pickerPhoneNumber)) errors.pickerPhoneNumber = 'Valid 11-digit Phone Number is required.';
    // if (leave.pickerCnicNumber && !/^\d{13}$/.test(leave.pickerCnicNumber)) errors.pickerCnicNumber = 'Valid 13-digit CNIC is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      setFormError('Please correct the highlighted errors.');
      return;
    }

    try {
      const payload = {
        ...leave,
        startDate: leave.startDate ? new Date(leave.startDate).toISOString() : '',
        endDate: leave.endDate ? new Date(leave.endDate).toISOString() : '',
        leaveTime: leave.leaveTime || '',
        expectedReturnTime: leave.expectedReturnTime || '',
        actualReturnTime: isStaffMode && leave.actualReturnTime ? new Date(leave.actualReturnTime).toISOString() : null,
      };

      if (editingLeave) {
        // Only admin can update existing staff leaves, including status and return time
        await api.put(`/staff-leave/${editingLeave._id}`, {
            // status: payload.status,
            // actualReturnTime: payload.actualReturnTime // This can be null to unset
            ...payload,
        });
      } else {
        await api.post('/staff-leave', payload);
      }
      fetchLeaves();
      onClose();
    } catch (err) {
      console.error('Failed to save staff leave request:', err.response?.data?.message || err.message);
      setFormError(err.response?.data?.message || 'Failed to save staff leave request.');
    }
  };

  return (
    <div className="relative p-6 sm:p-8 lg:p-10 rounded-2xl max-w-full mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar bg-gradient-to-br from-white via-gray-50 to-white shadow-2xl border border-gray-100">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100">
        <XMarkIcon className="h-7 w-7" />
      </button>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
        {editingLeave ? (isViewMode ? 'View Staff Leave Request' : 'Edit Staff Leave Request') : (isStaffMode ? 'Add Staff Leave' : 'Apply for Leave')}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">Manage staff leave requests efficiently</p>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 shadow-sm" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {(isStaffMode && !isViewMode) ? (
          <div>
            <label htmlFor="staffId" className="block text-sm font-bold text-gray-700 mb-2">
              Staff Member <span className="text-red-500">*</span>
            </label>
            <select
              id="staffId"
              name="staffId"
              value={leave.staffId}
              onChange={handleChange}
              disabled={isViewMode}
              className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.staffId ? 'border-red-500' : ''} ${isViewMode || editingLeave ? 'bg-gray-50' : 'bg-white'}`}
              required
            >
              <option value="">Select Staff</option>
              {staffMembersForForm.map(staffMember => (
                <option key={staffMember._id} value={staffMember._id}>
                  {staffMember.name} ({staffMember.cnic})
                </option>
              ))}
            </select>
            {fieldErrors.staffId && <p className="text-red-500 text-xs mt-1">{fieldErrors.staffId}</p>}
          </div>
        ) : (
          <input type="hidden" name="staffId" value={leave.staffId} />
        )}

        {isViewMode && editingLeave?.staff && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-300 pb-2">Staff Details</h3>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{editingLeave.staffName}</span></p>
              <p><span className="font-semibold text-gray-700">Staff Type:</span> <span className="text-gray-600">{editingLeave.staffType}</span></p>
              <p><span className="font-semibold text-gray-700">CNIC:</span> <span className="text-gray-600">{editingLeave.staff.cnic}</span></p>
            </div>
          </div>
        )}

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
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.startDate ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
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
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.endDate ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
              required
            />
            {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>}
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
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
            />
             <label htmlFor="leaveTime" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Time (on Start Date)
              </label>
              <input
                type="time"
                id="leaveTime"
                name="leaveTime"
                value={leave.leaveTime}
                onChange={handleChange}
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
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
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
            />
            {fieldErrors.expectedReturnTime && <p className="text-red-500 text-xs mt-1">{fieldErrors.expectedReturnTime}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="addressGoingTo" className="block text-sm font-bold text-gray-700 mb-2">
            Address (where staff is going - Optional)
          </label>
          <textarea
            id="addressGoingTo"
            name="addressGoingTo"
            value={leave.addressGoingTo}
            onChange={handleChange}
            disabled={isViewMode || (!isStaffMode && editingLeave)}
            rows="2"
            className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
          ></textarea>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-2">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={leave.reason}
            onChange={handleChange}
            disabled={isViewMode || (!isStaffMode && editingLeave)}
            rows="3"
            className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.reason ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
            required
          ></textarea>
          {fieldErrors.reason && <p className="text-red-500 text-xs mt-1">{fieldErrors.reason}</p>}
        </div>

        <div className="border-2 border-purple-200 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm">
          <h3 className="text-xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">Person Picking Up Staff (Optional)</h3>
          <p className="text-sm text-gray-600 mb-6">Only fill if someone is picking up the staff member for leave (e.g., sick leave).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pickerName" className="block text-sm font-bold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="pickerName"
                name="pickerName"
                value={leave.pickerName}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>
            <div>
              <label htmlFor="pickerRelation" className="block text-sm font-bold text-gray-700 mb-2">
                Relation with Staff
              </label>
              <input
                type="text"
                id="pickerRelation"
                name="pickerRelation"
                value={leave.pickerRelation}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
              />
            </div>
            <div>
              <label htmlFor="pickerPhoneNumber" className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="pickerPhoneNumber"
                name="pickerPhoneNumber"
                value={leave.pickerPhoneNumber}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerPhoneNumber ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
                maxLength="11"
                pattern="^\d{11}$"
                title="Please enter a valid 11-digit phone number"
              />
              {fieldErrors.pickerPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerPhoneNumber}</p>}
            </div>
            <div>
              <label htmlFor="pickerCnicNumber" className="block text-sm font-bold text-gray-700 mb-2">
                CNIC Number
              </label>
              <input
                type="text"
                id="pickerCnicNumber"
                name="pickerCnicNumber"
                value={leave.pickerCnicNumber}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${fieldErrors.pickerCnicNumber ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : 'bg-white'}`}
                maxLength="13"
                pattern="^\d{13}$"
                title="Please enter a valid 13-digit CNIC number"
              />
              {fieldErrors.pickerCnicNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerCnicNumber}</p>}
            </div>
          </div>
        </div>

        {isStaffMode && (
          <div className="border-2 border-blue-200 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
            <h3 className="text-xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2">Status & Admin Notes</h3>
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
                  disabled={isViewMode}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                  disabled={isViewMode}
                  className={`block w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-500 hover:border-gray-300 transition shadow-sm ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                />
                {!isViewMode && leave.actualReturnTime && (
                  <button
                    type="button"
                    onClick={() => setLeave(prev => ({ ...prev, actualReturnTime: '' }))}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Clear Actual Return Time
                  </button>
                )}
              </div>
            </div>
            {isViewMode && (
              <div className="mt-6 pt-6 border-t-2 border-blue-300 space-y-3">
                {editingLeave?.approvedBy && (
                  <p className="text-sm">
                    <span className="font-bold text-blue-800">Approved/Rejected By:</span>{' '}
                    <span className="text-gray-700">{editingLeave.approvedBy.name} ({editingLeave.approvedBy.role})</span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-bold text-blue-800">Requested By:</span>{' '}
                  <span className="text-gray-700">{editingLeave?.requestedBy?.name} ({editingLeave.requestedBy?.role})</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
          {!isViewMode && (
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-800 transition shadow-md hover:shadow-lg active:scale-95 font-semibold"
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

export default StaffLeaveRequestForm;
