// src/components/AddEditBillModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';
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
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (billToEdit) {
      setFormData({
        title: billToEdit.title,
        category: billToEdit.category,
        amount: billToEdit.amount,
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
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && <Message type="error">{error}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            readOnly={isViewMode}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={isViewMode}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            readOnly={isViewMode}
            min="0"
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={isViewMode}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            {billStatuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        {/* Bill Date */}
        <div>
          <label htmlFor="billDate" className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
          <DatePicker
            selected={formData.billDate}
            onChange={(date) => handleDateChange(date, 'billDate')}
            dateFormat="dd/MM/yyyy"
            readOnly={isViewMode}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        
        {/* Paid To */}
        <div>
          <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700 mb-1">Paid To</label>
          <input
            type="text"
            id="paidTo"
            name="paidTo"
            value={formData.paidTo}
            onChange={handleChange}
            readOnly={isViewMode}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Payment Date (Conditional) */}
        {formData.status !== 'Unpaid' && (
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <DatePicker
                selected={formData.paymentDate}
                onChange={(date) => handleDateChange(date, 'paymentDate')}
                dateFormat="dd/MM/yyyy"
                readOnly={isViewMode}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
        )}

        {/* Payment Method (Conditional) */}
        {formData.status !== 'Unpaid' && (
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={isViewMode}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
        )}
      </div>

      {/* Remarks */}
      <div className="mt-4">
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          id="remarks"
          name="remarks"
          rows="3"
          value={formData.remarks}
          onChange={handleChange}
          readOnly={isViewMode}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        ></textarea>
      </div>

      {/* Attachment */}
      <div className="mt-4">
        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
        {!isViewMode && (
          <input
            type="file"
            id="attachment"
            name="attachment"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        )}
        {billToEdit?.attachmentPath && (
          <p className="mt-2 text-sm text-gray-500">
            Current attachment: <a href={`${api.defaults.baseURL}${billToEdit.attachmentPath}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View File</a>
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 disabled:bg-green-400 transition duration-150"
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
    </form>
  );
};

export default AddEditBillModal;