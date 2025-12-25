// src/components/AddEditBillModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';
import { useTheme } from '../context/ThemeContext';
import DatePicker from 'react-datepicker';

const billCategories = ['Utilities', 'Kitchen', 'Vendor Payment', 'Repairs', 'Other'];
const billStatuses = ['Paid', 'Unpaid', 'Partial'];
const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment'];

const AddEditBillModal = ({ onAdd, onEdit, onClose, billToEdit, isViewMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: billCategories[0],
    amount: '',
    status: billStatuses[1], // Default to Unpaid
    billDate: new Date(),
    paymentDate: null,
    paymentMethod: paymentMethods[0],
    paidTo: '',
    remarks: '',
  });
  const { currentTheme } = useTheme();
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (billToEdit) {
      setFormData({
        title: billToEdit.title,
        category: billToEdit.category,
        amount: billToEdit.amount !== undefined ? String(billToEdit.amount) : '',
        status: billToEdit.status,
        billDate: new Date(billToEdit.billDate),
        paymentDate: billToEdit.paymentDate ? new Date(billToEdit.paymentDate) : null,
        paymentMethod: billToEdit.paymentMethod || paymentMethods[0],
        paidTo: billToEdit.paidTo || '',
        remarks: billToEdit.remarks || '',
      });
    } else {
      setFormData({
        title: '',
        category: billCategories[0],
        amount: '',
        status: billStatuses[1],
        billDate: new Date(),
        paymentDate: null,
        paymentMethod: paymentMethods[0],
        paidTo: '',
        remarks: '',
      });
    }
    setAttachmentFile(null); // Reset attachment file on modal open/edit
  }, [billToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // sanitize numeric fields to digits only
    const digitOnlyFields = ['amount'];
    let newVal = value;
    if (digitOnlyFields.includes(name)) {
      newVal = String(value || '').replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: newVal }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation: amount must be a non-negative integer
    if (!/^\d+$/.test(String(formData.amount || '')) || parseInt(formData.amount || '0', 10) < 0) {
      setError('Amount must be a non-negative whole number.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    // Append form data
    for (const key in formData) {
      if (formData[key] !== null) {
        if (key === 'billDate' || key === 'paymentDate') {
          data.append(key, formData[key].toISOString());
        } else {
          data.append(key, formData[key]);
        }
      }
    }
    // Append file if it exists
    if (attachmentFile) {
      data.append('attachment', attachmentFile);
    }
    
    try {
      if (billToEdit) {
        await api.put(`/billing/${billToEdit._id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        onEdit();
      } else {
        await api.post('/billing', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        onAdd();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save bill.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full rounded-lg ${currentTheme.inputBorder || 'border border-gray-200'} ${currentTheme.inputBg || 'bg-white/70'} px-3.5 py-2.5 text-sm ${currentTheme.inputText || 'text-gray-900'} ${currentTheme.shadow || 'shadow-sm'} ${currentTheme.inputRing || 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'} transition disabled:${currentTheme.inputDisabled || 'bg-gray-100'}`;
  const labelBase = `text-sm font-semibold ${currentTheme.subtitle || 'text-gray-700'} mb-1 flex items-center gap-2`;
  const sectionBase = `p-4 md:p-5 ${currentTheme.panelBg || 'bg-gray-50/70'} ${currentTheme.panelBorder || 'border border-gray-100'} rounded-xl space-y-4`;

  return (
    <form onSubmit={handleSubmit} className={`relative overflow-hidden rounded-2xl backdrop-blur p-5 sm:p-7 space-y-5 ${currentTheme.cardBg || 'bg-white/95'} ${currentTheme.cardBorder || 'border border-emerald-50'} ${currentTheme.shadow || 'shadow-2xl'}`}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/60 via-white to-teal-50/50" aria-hidden />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${currentTheme.heroIcon || 'text-emerald-600'}`}>Billing</p>
            <h2 className={`text-2xl sm:text-3xl font-bold mt-1 ${currentTheme.title || 'text-gray-900'}`}>{billToEdit ? (isViewMode ? 'Bill Details' : 'Edit Bill') : 'Add New Bill'}</h2>
            <p className={`text-sm mt-1 ${currentTheme.mutedText || 'text-gray-500'}`}>Keep your bill records tidy with payment status and attachments.</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${formData.status === 'Paid' ? `${currentTheme.badgeSuccessBg || 'bg-emerald-50'} ${currentTheme.badgeSuccessText || 'text-emerald-700'} ${currentTheme.badgeBorder || 'border-emerald-100'}` : formData.status === 'Partial' ? `${currentTheme.badgeWarningBg || 'bg-amber-50'} ${currentTheme.badgeWarningText || 'text-amber-700'} ${currentTheme.badgeBorder || 'border-amber-100'}` : `${currentTheme.badgeDangerBg || 'bg-rose-50'} ${currentTheme.badgeDangerText || 'text-rose-700'} ${currentTheme.badgeBorder || 'border-rose-100'}`}`}>
            {formData.status}
          </span>
        </div>

        {error && <Message type="error">{error}</Message>}

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Basics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1">
              <label htmlFor="title" className={labelBase}>Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                readOnly={isViewMode}
                className={inputBase}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="category" className={labelBase}>Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isViewMode}
                className={inputBase}
              >
                {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className={labelBase}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isViewMode}
                className={inputBase}
              >
                {billStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="paidTo" className={labelBase}>Paid To</label>
              <input
                type="text"
                id="paidTo"
                name="paidTo"
                value={formData.paidTo}
                onChange={handleChange}
                readOnly={isViewMode}
                className={inputBase}
                placeholder="Vendor / Payee"
              />
            </div>
          </div>
        </div>

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Amounts & Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1">
              <label htmlFor="amount" className={labelBase}>Amount (PKR)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={inputBase}
                  placeholder="Amount in PKR"
                />
            </div>
            <div className="space-y-1">
              <label htmlFor="billDate" className={labelBase}>Bill Date</label>
              <DatePicker
                selected={formData.billDate}
                onChange={(date) => handleDateChange(date, 'billDate')}
                dateFormat="dd/MM/yyyy"
                readOnly={isViewMode}
                className={inputBase}
                placeholderText="Select bill date"
                required
              />
            </div>
            {formData.status !== 'Unpaid' && (
              <div className="space-y-1">
                <label htmlFor="paymentDate" className={labelBase}>Payment Date</label>
                <DatePicker
                  selected={formData.paymentDate}
                  onChange={(date) => handleDateChange(date, 'paymentDate')}
                  dateFormat="dd/MM/yyyy"
                  readOnly={isViewMode}
                  className={inputBase}
                  placeholderText="Select payment date"
                />
              </div>
            )}
            {formData.status !== 'Unpaid' && (
              <div className="space-y-1">
                <label htmlFor="paymentMethod" className={labelBase}>Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={inputBase}
                >
                  {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Notes</h3>
          <textarea
            id="remarks"
            name="remarks"
            rows={4}
            value={formData.remarks}
            onChange={handleChange}
            readOnly={isViewMode}
            className={`${inputBase} min-h-[120px]`}
            placeholder="Add remarks or payment reference"
          ></textarea>
        </div>

        <div className={sectionBase}>
          <h3 className="text-sm font-bold text-gray-800">Attachment</h3>
          {!isViewMode && (
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleFileChange}
              className={`block w-full text-sm ${currentTheme.mutedText || 'text-gray-600'} file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
            />
          )}
          {billToEdit?.attachmentPath && (
            <p className={`mt-2 text-sm ${currentTheme.mutedText || 'text-gray-600'}`}>
              Current attachment: <a href={`${api.defaults.baseURL}${billToEdit.attachmentPath}`} target="_blank" rel="noopener noreferrer" className={`${currentTheme.linkText || 'text-emerald-600'} hover:underline`}>View File</a>
            </p>
          )}
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
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                billToEdit ? 'Save Changes' : 'Add Bill'
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddEditBillModal;