// src/components/FeeForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getCurrentMonthYear = () => {
  const date = new Date();
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const FeeForm = ({ editingFee, fetchFees, onClose, students }) => {
  const initialState = {
    studentId: '',
    month: getCurrentMonthYear(),
    receivedDate: new Date().toISOString().slice(0, 10),
    receivedBy: '',
    paymentMethod: 'Cash',
    // billScreenshotUrl: '' // No need to include this in initial state if handled by file input
  };

  const [fee, setFee] = useState(initialState);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalStudentId, setOriginalStudentId] = useState(null); // To track student before edit

  useEffect(() => {
    if (editingFee) {
      // Populate form with existing fee details
      setFee({
        studentId: editingFee.studentId?._id || '', // Use _id if populated, otherwise empty
        month: editingFee.month || getCurrentMonthYear(),
        receivedDate: editingFee.receivedDate ? new Date(editingFee.receivedDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        receivedBy: editingFee.receivedBy || '',
        paymentMethod: editingFee.paymentMethod || 'Cash',
        // billScreenshotUrl is not directly bound to form input, handled separately
      });
      // Store the original student ID for comparison later
      setOriginalStudentId(editingFee.studentId?._id || null);
    } else {
      setFee(initialState); // Reset for adding new fee
      setOriginalStudentId(null); // No original student for new fee
    }
    setError('');
    setSelectedFile(null);
  }, [editingFee]); // Re-run effect when editingFee changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFee({ ...fee, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const validate = () => {
    if (!fee.studentId || !fee.month || !fee.receivedDate || !fee.receivedBy || !fee.paymentMethod) {
      return 'All fields are required';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    const formData = new FormData();
    for (const key in fee) {
      formData.append(key, fee[key]);
    }

    if (selectedFile) {
      formData.append('billScreenshot', selectedFile);
    }
    // If no new file is selected during an edit, and there was an existing URL,
    // ensure the existing URL is sent back to prevent it from being cleared on backend
    else if (editingFee && editingFee.billScreenshotUrl) {
        formData.append('billScreenshotUrl', editingFee.billScreenshotUrl);
    }


    // Combine selected date with current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    let finalReceivedDate = new Date(fee.receivedDate);
    finalReceivedDate.setHours(hours);
    finalReceivedDate.setMinutes(minutes);
    finalReceivedDate.setSeconds(seconds);
    finalReceivedDate.setMilliseconds(milliseconds);

    formData.set('receivedDate', finalReceivedDate.toISOString());

    try {
      let response;
      if (editingFee) {
        response = await api.put(`/fees/${editingFee._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/fees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // --- FEE STATUS UPDATE LOGIC ---
      const currentSelectedStudentId = fee.studentId;

      if (editingFee && originalStudentId && originalStudentId !== currentSelectedStudentId) {
        // Scenario 1: Editing an existing fee and student has changed
        console.log(`Student changed from ${originalStudentId} to ${currentSelectedStudentId}`);
        // 1. Set original student's fee status to 'Unpaid'
        await api.patch(`/students/${originalStudentId}/fee-status`, { feeStatus: 'Unpaid' });
        // 2. Set new student's fee status to 'Paid'
        await api.patch(`/students/${currentSelectedStudentId}/fee-status`, { feeStatus: 'Paid' });
      } else {
        // Scenario 2: New fee record OR editing fee for the same student
        console.log(`Setting current student ${currentSelectedStudentId} to Paid`);
        await api.patch(`/students/${currentSelectedStudentId}/fee-status`, { feeStatus: 'Paid' });
      }
      // --- END FEE STATUS UPDATE LOGIC ---

      fetchFees(); // Refresh the fee list in FeeList component
      onClose();   // Close the modal
    } catch (err) {
      console.error("Submission error:", err.response ? err.response.data : err.message);
      setError('Failed to submit fee record. Please check your input and try again.');
    }
  };

  const generateMonthOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
      for (let i = 0; i < 12; i++) {
        options.push(`${months[i]} ${y}`);
      }
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{editingFee ? 'Edit Fee Record' : 'Add New Fee Record'}</h2>
      {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
          <select
            name="studentId"
            id="studentId"
            value={fee.studentId}
            onChange={handleChange}
            className="input p-2 border rounded w-full"
            required
          >
            <option value="">Select a Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.cnic})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
          <select
            name="month"
            id="month"
            value={fee.month}
            onChange={handleChange}
            className="input p-2 border rounded w-full"
            required
          >
            {generateMonthOptions().map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700">Date Received</label>
          <input
            type="date"
            name="receivedDate"
            id="receivedDate"
            value={fee.receivedDate}
            onChange={handleChange}
            className="input p-2 border rounded w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-700">Received By</label>
          <input
            type="text"
            name="receivedBy"
            id="receivedBy"
            placeholder="Received By"
            value={fee.receivedBy}
            onChange={handleChange}
            className="input p-2 border rounded w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            name="paymentMethod"
            id="paymentMethod"
            value={fee.paymentMethod}
            onChange={handleChange}
            className="input p-2 border rounded w-full"
            required
          >
            <option value="Cash">Cash</option>
            <option value="Online Wallet">Online Wallet</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label htmlFor="billScreenshot" className="block text-sm font-medium text-gray-700">Bill Screenshot</label>
          <input
            type="file"
            name="billScreenshot"
            id="billScreenshot"
            onChange={handleFileChange}
            className="input p-2 border rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {editingFee?.billScreenshotUrl && !selectedFile && (
            <p className="text-sm text-gray-500 mt-1">Current: <a href={editingFee.billScreenshotUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">View</a></p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200">
          {editingFee ? 'Update Fee Record' : 'Add Fee Record'}
        </button>
      </div>
    </form>
  );
};

export default FeeForm;