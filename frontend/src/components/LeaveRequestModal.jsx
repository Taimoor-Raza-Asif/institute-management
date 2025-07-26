// src/components/LeaveRequestModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';

const leaveTypes = ['Casual', 'Sick', 'Annual', 'Urgent Work', 'Other'];

const LeaveRequestModal = ({ staffMember, onClose, fetchStaff }) => {
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    // Reset form when staffMember changes or modal opens
    if (staffMember) {
      setLeaveType('Casual');
      setStartDate('');
      setEndDate('');
      setReason('');
      setMessage('');
      setMessageType('');
    }
  }, [staffMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!staffMember?._id) {
      setMessage('No staff member selected for leave request.');
      setMessageType('error');
      return;
    }
    if (!startDate || !endDate || !reason) {
      setMessage('Please fill in all required fields (Start Date, End Date, Reason).');
      setMessageType('error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setMessage('Start Date cannot be after End Date.');
      setMessageType('error');
      return;
    }

    try {
      const payload = {
        type: leaveType,
        startDate,
        endDate,
        reason,
      };
      const res = await api.post(`/staff/${staffMember._id}/leave-requests`, payload);
      setMessage(res.data.message || 'Leave request submitted successfully!');
      setMessageType('success');
      fetchStaff(); // Refresh staff list to potentially update leave info
      // Optionally close modal after successful submission
      // onClose();
    } catch (err) {
      console.error('Failed to submit leave request:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Failed to submit leave request.');
      setMessageType('error');
    }
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      <div className="flex-shrink-0 relative">
        <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-yellow-700">Submit Leave Request</h2>
        <hr className="mb-6 border-yellow-200" />
        {message && (
          <div className={`px-4 py-3 rounded relative mb-4 shadow-sm ${messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} role="alert">
            {message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {staffMember ? (
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-800">{staffMember.name}</h3>
            <p className="text-gray-600">Employee ID: {staffMember.employeeId || 'N/A'}</p>
          </div>
        ) : (
          <p className="text-red-500 text-center mb-4">No staff member selected. Please select a staff member from the list.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type<span className="text-red-500">*</span></label>
            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date<span className="text-red-500">*</span></label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date<span className="text-red-500">*</span></label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason<span className="text-red-500">*</span></label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            placeholder="Provide a detailed reason for your leave..."
          ></textarea>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="submit"
            className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition duration-200 shadow-md"
          >
            Submit Request
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestModal;
