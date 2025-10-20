// src/components/AddEditBillModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Gateway'];

const donationPurposes = [
  'Zakat',
  'Sadaqah',
  'Education Support',
  'Medical Aid',
  'Building Fund',
  'Orphan Support',
  'General Donation'
];


const AddDonationModal = ({ onAdd, onEdit, onClose, donationToEdit, isViewMode = false }) => {
  const [formData, setFormData] = useState({
    donationAmount: '',
    donationPurpose: '',
    donationDate: new Date().toISOString().split('T')[0],
    donorName: '',
    contactNumber: '',
    emailAddress: '',
    cnic: '',
    organizationName: '',
    paymentMethod: paymentMethods[0],
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (donationToEdit) {
      setFormData({
        donationAmount: donationToEdit.donationAmount,
        donationPurpose: donationToEdit.donationPurpose,
        donationDate: new Date(donationToEdit.donationDate).toISOString().split('T')[0],
        donorName: donationToEdit.donorName || '',
        contactNumber: donationToEdit.contactNumber || '',
        emailAddress: donationToEdit.emailAddress || '',
        cnic: donationToEdit.cnic || '',
        organizationName: donationToEdit.organizationName || '',
        paymentMethod: donationToEdit.paymentMethod,
      });
      setReceiptFile(null);
    }
  }, [donationToEdit]);

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (isViewMode) return;
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    setLoading(true);
    setError(null);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    if (receiptFile) {
      data.append('receipt', receiptFile);
    }

    try {
      if (donationToEdit) {
        const res = await api.put(`/donations/${donationToEdit._id}`, formData);
        onEdit(res.data);
      } else {
        const res = await api.post('/donations', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onAdd(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Error submitting donation:', err);
      setError(err.response?.data?.message || 'Failed to save donation.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (readOnly) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm transition duration-150 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:border-indigo-500 focus:ring-indigo-500"}`;

  return (
   <form
  onSubmit={handleSubmit}
  className="space-y-6 p-6 rounded-xl bg-white shadow-lg border border-gray-200"
>
  {error && <Message type="error">{error}</Message>}

  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
    {isViewMode ? 'View Donation' : donationToEdit ? 'Edit Donation' : 'Add New Donation'}
  </h2>

  {/* Group 1: Donation Info */}
 <div className="border border-gray-200 p-4 rounded-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">Donation Details</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Donation Amount */}
    <div>
      <label htmlFor="donationAmount" className="block mb-1 text-sm font-medium text-gray-700">
        Donation Amount<span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        id="donationAmount"
        name="donationAmount"
        value={formData.donationAmount}
        onChange={handleChange}
        readOnly={isViewMode}
        required={!isViewMode}
        min="0"
        className={inputClasses(isViewMode) + " h-12 px-4"}
      />
    </div>

    {/* Donation Purpose - Now a Dropdown */}
    <div>
      <label htmlFor="donationPurpose" className="block mb-1 text-sm font-medium text-gray-700">
        Donation Purpose<span className="text-red-500">*</span>
      </label>
      <select
        id="donationPurpose"
        name="donationPurpose"
        value={formData.donationPurpose}
        onChange={handleChange}
        disabled={isViewMode}
        required={!isViewMode}
        className={inputClasses(isViewMode) + " h-12 px-4"}
      >
        <option value="">Select a purpose</option>
        {donationPurposes.map((purpose) => (
          <option key={purpose} value={purpose}>
            {purpose}
          </option>
        ))}
      </select>
    </div>

    {/* Donation Date */}
    <div>
      <label htmlFor="donationDate" className="block mb-1 text-sm font-medium text-gray-700">
        Donation Date<span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        id="donationDate"
        name="donationDate"
        value={formData.donationDate}
        onChange={handleChange}
        readOnly={isViewMode}
        required={!isViewMode}
        className={inputClasses(isViewMode) + " h-12 px-4"}
      />
    </div>
  </div>
  </div>

  {/* Group 2: Donor Info */}
  <div className="border border-gray-200 p-4 rounded-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">Donor Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="donorName" className="block mb-1 text-sm font-medium text-gray-700">Donor Name</label>
        <input
          type="text"
          id="donorName"
          name="donorName"
          value={formData.donorName}
          onChange={handleChange}
          readOnly={isViewMode}
          placeholder="Anonymous"
          className={inputClasses(isViewMode) + " h-12 px-4"}
        />
      </div>

      <div>
        <label htmlFor="contactNumber" className="block mb-1 text-sm font-medium text-gray-700">Contact Number</label>
        <input
          type="text"
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          readOnly={isViewMode}
          className={inputClasses(isViewMode) + " h-12 px-4"}
        />
      </div>

      <div>
        <label htmlFor="emailAddress" className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="emailAddress"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
          readOnly={isViewMode}
          className={inputClasses(isViewMode) + " h-12 px-4"}
        />
      </div>

      <div>
        <label htmlFor="cnic" className="block mb-1 text-sm font-medium text-gray-700">CNIC/ID</label>
        <input
          type="text"
          id="cnic"
          name="cnic"
          value={formData.cnic}
          onChange={handleChange}
          readOnly={isViewMode}
          className={inputClasses(isViewMode) + " h-12 px-4"}
        />
      </div>

      <div>
        <label htmlFor="organizationName" className="block mb-1 text-sm font-medium text-gray-700">Organization Name</label>
        <input
          type="text"
          id="organizationName"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          readOnly={isViewMode}
          className={inputClasses(isViewMode) + " h-12 px-4"}
        />
      </div>
    </div>
  </div>

  {/* Group 3: Payment */}
 <div className="border border-gray-200 p-4 rounded-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="paymentMethod" className="block mb-1 text-sm font-medium text-gray-700">
          Payment Method<span className="text-red-500">*</span>
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          disabled={isViewMode}
          required={!isViewMode}
          className={inputClasses(isViewMode) + " h-12 px-4"}
        >
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {!donationToEdit && !isViewMode && (
        <div>
          <label htmlFor="receipt" className="block mb-1 text-sm font-medium text-gray-700">Upload Receipt</label>
          <input
            type="file"
            id="receipt"
            name="receipt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
          />
        </div>
      )}
    </div>
  </div>

  {/* Buttons */}
  <div className="flex justify-end gap-4 pt-4 border-t mt-6">
    <button
      type="button"
      onClick={onClose}
      className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
    >
      {isViewMode ? 'Close' : 'Cancel'}
    </button>

    {!isViewMode && (
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center"
      >
        {loading && (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
        )}
        {donationToEdit ? 'Update Donation' : 'Add Donation'}
      </button>
    )}
  </div>
</form>

  );
};

export default AddDonationModal;
