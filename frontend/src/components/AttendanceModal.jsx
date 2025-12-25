// src/components/AttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline'; // Reusing icons
import { useTheme } from '../context/ThemeContext';

const AttendanceModal = ({ staffMember, onClose, fetchStaff }) => {
  const { currentTheme } = useTheme();
  const [employeeId, setEmployeeId] = useState(staffMember?.employeeId || '');
  const [qrCodeSecret, setQrCodeSecret] = useState(staffMember?.qrCodeSecret || '');
  const [status, setStatus] = useState('Present'); // Default status
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (staffMember) {
      setEmployeeId(staffMember.employeeId || '');
      setQrCodeSecret(staffMember.qrCodeSecret || '');
      setMessage(''); // Clear message on new staff member selection
      setMessageType('');
    }
  }, [staffMember]);

  const handleSubmitAttendance = async (actionType) => {
    setMessage('');
    setMessageType('');

    if (!employeeId && !qrCodeSecret) {
      setMessage('Please enter Employee ID or ensure QR code is available.');
      setMessageType('error');
      return;
    }

    const payload = {
      employeeId: employeeId,
      qrCodeSecret: qrCodeSecret, // Send if available, backend will prioritize
      date: new Date().toISOString().split('T')[0], // Today's date
      status: status,
      note: note,
    };

    // Add check-in/out times based on actionType
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (actionType === 'checkIn') {
      payload.checkInTime = currentTime;
    } else if (actionType === 'checkOut') {
      payload.checkOutTime = currentTime;
    }

    try {
      const res = await api.post('/staff/attendance', payload);
      setMessage(res.data.message || 'Attendance recorded successfully!');
      setMessageType('success');
      fetchStaff(); // Refresh staff list to update attendance records
    } catch (err) {
      console.error('Failed to record attendance:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Failed to record attendance.');
      setMessageType('error');
    }
  };

  return (
    <div className={`flex flex-col h-full p-4 sm:p-6 lg:p-8 rounded-lg ${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-xl'}`}>
      <div className="flex-shrink-0 relative">
        <button onClick={onClose} className={`absolute top-0 right-0 transition duration-200 p-2 rounded-full ${currentTheme.iconText || 'text-gray-500'} ${currentTheme.iconHover || 'hover:text-gray-700'} ${currentTheme.btnGhostHover || 'hover:bg-gray-100'}`} title="Close" >
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className={`text-2xl sm:text-3xl font-bold mb-4 text-center ${currentTheme.heroTitle || 'text-green-700'}`}>Record Attendance</h2>
        <hr className={`mb-6 ${currentTheme.divider || 'border-green-200'}`} />
        {message && (
          <div className={`px-4 py-3 rounded relative mb-4 shadow-sm ${messageType === 'success' ? `${currentTheme.alertSuccessBg || 'bg-green-100'} ${currentTheme.alertSuccessBorder || 'border border-green-400'} ${currentTheme.alertSuccessText || 'text-green-700'}` : `${currentTheme.alertErrorBg || 'bg-red-100'} ${currentTheme.alertErrorBorder || 'border border-red-400'} ${currentTheme.alertErrorText || 'text-red-700'}`}`} role="alert">
            {message}
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {staffMember ? (
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-800">{staffMember.name}</h3>
            <p className="text-gray-600">Employee ID: {staffMember.employeeId || 'N/A'}</p>
            {staffMember.qrCodeSecret && (
              <p className="text-gray-600">QR Secret: {staffMember.qrCodeSecret}</p>
            )}
            <div className="mt-4 p-3 bg-green-50 rounded-md text-green-800">
              <p className="font-medium">Current Date: {new Date().toLocaleDateString()}</p>
              <p className="font-medium">Current Time: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID (or QR Scan)</label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter Employee ID"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note (Optional)</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="e.g., Late due to traffic, Sick leave"
          ></textarea>
        </div>

        {/* QR Code Scanner Placeholder */}
        <div className="text-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 mb-4">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            QR Code Scanning functionality would be integrated here.
            <br /> (e.g., using `html5-qrcode` library)
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={() => handleSubmitAttendance('checkIn')}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-md"
        >
          Check In
        </button>
        <button
          onClick={() => handleSubmitAttendance('checkOut')}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-md"
        >
          Check Out
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200 shadow-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AttendanceModal;
