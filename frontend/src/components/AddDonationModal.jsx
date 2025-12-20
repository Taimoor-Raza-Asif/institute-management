// src/components/AddEditBillModal.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  const { currentTheme } = useTheme();

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

  const inputBase = 'w-full rounded-lg border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
  const labelBase = 'text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2';
  const sectionBase = 'p-4 md:p-5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-4';

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur border border-emerald-50 shadow-2xl p-5 sm:p-7 space-y-5">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/60 via-white to-teal-50/50" aria-hidden />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Donations</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{isViewMode ? 'View Donation' : donationToEdit ? 'Edit Donation' : 'Add New Donation'}</h2>
            <p className="text-sm text-gray-500 mt-1">Capture donation details, donor info, and payment in one flow.</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border bg-emerald-50 text-emerald-700 border-emerald-100">Secure</span>
        </div>

        {error && <Message type="error">{error}</Message>}

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Donation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1">
              <label htmlFor="donationAmount" className={labelBase}>Donation Amount<span className="text-red-500">*</span></label>
              <input
                type="number"
                id="donationAmount"
                name="donationAmount"
                value={formData.donationAmount}
                onChange={handleChange}
                readOnly={isViewMode}
                required={!isViewMode}
                min="0"
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="donationPurpose" className={labelBase}>Donation Purpose<span className="text-red-500">*</span></label>
              <select
                id="donationPurpose"
                name="donationPurpose"
                value={formData.donationPurpose}
                onChange={handleChange}
                disabled={isViewMode}
                required={!isViewMode}
                className={inputBase}
              >
                <option value="">Select a purpose</option>
                {donationPurposes.map((purpose) => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="donationDate" className={labelBase}>Donation Date<span className="text-red-500">*</span></label>
              <input
                type="date"
                id="donationDate"
                name="donationDate"
                value={formData.donationDate}
                onChange={handleChange}
                readOnly={isViewMode}
                required={!isViewMode}
                className={inputBase}
              />
            </div>
          </div>
        </div>

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Donor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1">
              <label htmlFor="donorName" className={labelBase}>Donor Name</label>
              <input
                type="text"
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                readOnly={isViewMode}
                placeholder="Anonymous"
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contactNumber" className={labelBase}>Contact Number</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                readOnly={isViewMode}
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="emailAddress" className={labelBase}>Email Address</label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                readOnly={isViewMode}
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="cnic" className={labelBase}>CNIC/ID</label>
              <input
                type="text"
                id="cnic"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                readOnly={isViewMode}
                className={inputBase}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="organizationName" className={labelBase}>Organization Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                readOnly={isViewMode}
                className={inputBase}
              />
            </div>
          </div>
        </div>

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
            <div className="space-y-1">
              <label htmlFor="paymentMethod" className={labelBase}>Payment Method<span className="text-red-500">*</span></label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={isViewMode}
                required={!isViewMode}
                className={inputBase}
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {!donationToEdit && !isViewMode && (
              <div className="space-y-2">
                <label htmlFor="receipt" className={labelBase}>Upload Receipt</label>
                <input
                  type="file"
                  id="receipt"
                  name="receipt"
                  onChange={handleFileChange}
                  className={`block w-full text-sm ${currentTheme.mutedText || 'text-gray-600'} file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>

          {!isViewMode && (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition disabled:from-emerald-400 disabled:to-emerald-400"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
              {donationToEdit ? 'Update Donation' : 'Add Donation'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddDonationModal;
