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
    <div className="p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">{editingLeave ? (isViewMode ? 'View Staff Leave Request' : 'Edit Staff Leave Request') : (isStaffMode ? 'Add Staff Leave' : 'Apply for Leave')}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(isStaffMode && !isViewMode) ? ( // For admin adding/editing, they pick staff
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member <span className="text-red-500">*</span>
            </label>
            <select
              id="staffId"
              name="staffId"
              value={leave.staffId}
              onChange={handleChange}
              disabled={isViewMode} // Staff cannot change for existing, admin can't change staff ID either
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.staffId ? 'border-red-500' : ''} ${isViewMode || editingLeave ? 'bg-gray-50' : ''}`}
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
        ) : ( // Staff applying for self, or view mode
          <input type="hidden" name="staffId" value={leave.staffId} /> // Keep staffId in payload
        )}

        {isViewMode && editingLeave?.staff && ( // Display staff details in view mode
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Staff Details</h3>
            <p><span className="font-medium">Name:</span> {editingLeave.staffName}</p>
            <p><span className="font-medium">Staff Type:</span> {editingLeave.staffType}</p>
            <p><span className="font-medium">CNIC:</span> {editingLeave.staff.cnic}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              disabled={isViewMode || (!isStaffMode && editingLeave)} // Staff can't edit dates after creation if not admin
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.startDate ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
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
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.endDate ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              required
            />
            {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.endDate}</p>}
          </div>
          <div>
            {/* <label htmlFor="leaveTime" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Time (Optional, if specific time)
            </label>
            <input
              type="datetime-local"
              id="leaveTime"
              name="leaveTime"
              value={leave.leaveTime}
              onChange={handleChange}
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
            /> */}
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
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              />
          </div>
          <div>
            {/* <label htmlFor="expectedReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Return Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="expectedReturnTime"
              name="expectedReturnTime"
              value={leave.expectedReturnTime}
              onChange={handleChange}
              disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.expectedReturnTime ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              required
            /> */}
            <label htmlFor="expectedReturnTime" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return Time (on End Date)
              </label>
              <input
                type="time"
                id="expectedReturnTime"
                name="expectedReturnTime"
                value={leave.expectedReturnTime}
                onChange={handleChange}
               disabled={isViewMode || (!isStaffMode && editingLeave)}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              />
            {fieldErrors.expectedReturnTime && <p className="text-red-500 text-xs mt-1">{fieldErrors.expectedReturnTime}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="addressGoingTo" className="block text-sm font-medium text-gray-700 mb-1">
            Address (where staff is going - Optional)
          </label>
          <textarea
            id="addressGoingTo"
            name="addressGoingTo"
            value={leave.addressGoingTo}
            onChange={handleChange}
            disabled={isViewMode || (!isStaffMode && editingLeave)}
            rows="2"
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
          ></textarea>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={leave.reason}
            onChange={handleChange}
            disabled={isViewMode || (!isStaffMode && editingLeave)}
            rows="3"
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.reason ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
            required
          ></textarea>
          {fieldErrors.reason && <p className="text-red-500 text-xs mt-1">{fieldErrors.reason}</p>}
        </div>

        <div className="space-y-4 border p-4 rounded-md bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-800">Person Picking Up Staff (Optional)</h3>
          <p className="text-sm text-gray-600">Only fill if someone is picking up the staff member for leave (e.g., sick leave).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickerName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="pickerName"
                name="pickerName"
                value={leave.pickerName}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="pickerRelation" className="block text-sm font-medium text-gray-700 mb-1">
                Relation with Staff
              </label>
              <input
                type="text"
                id="pickerRelation"
                name="pickerRelation"
                value={leave.pickerRelation}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="pickerPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="pickerPhoneNumber"
                name="pickerPhoneNumber"
                value={leave.pickerPhoneNumber}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerPhoneNumber ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
                maxLength="11"
                pattern="^\d{11}$"
                title="Please enter a valid 11-digit phone number"
              />
              {fieldErrors.pickerPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerPhoneNumber}</p>}
            </div>
            <div>
              <label htmlFor="pickerCnicNumber" className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number
              </label>
              <input
                type="text"
                id="pickerCnicNumber"
                name="pickerCnicNumber"
                value={leave.pickerCnicNumber}
                onChange={handleChange}
                disabled={isViewMode || (!isStaffMode && editingLeave)}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${fieldErrors.pickerCnicNumber ? 'border-red-500' : ''} ${isViewMode || (!isStaffMode && editingLeave) ? 'bg-gray-50' : ''}`}
                maxLength="13"
                pattern="^\d{13}$"
                title="Please enter a valid 13-digit CNIC number"
              />
              {fieldErrors.pickerCnicNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickerCnicNumber}</p>}
            </div>
          </div>
        </div>

        {isStaffMode && ( // Admin can change status and set actual return time
          <>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={leave.status}
                onChange={handleChange}
                disabled={isViewMode}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
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
                disabled={isViewMode}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
              />
               {!isViewMode && leave.actualReturnTime && (
                <button
                  type="button"
                  onClick={() => setLeave(prev => ({ ...prev, actualReturnTime: '' }))}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Clear Actual Return Time
                </button>
              )}
            </div>
            {isViewMode && (
              <>
                {editingLeave?.approvedBy && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Approved/Rejected By:</span> {editingLeave.approvedBy.name} ({editingLeave.approvedBy.role})
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requested By:</span> {editingLeave?.requestedBy?.name} ({editingLeave.requestedBy?.role})
                </p>
              </>
            )}
          </>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          {!isViewMode && (
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md"
            >
              {editingLeave ? 'Update Leave' : 'Submit Leave Request'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffLeaveRequestForm;
