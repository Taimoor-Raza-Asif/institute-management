import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';

const billCategories = ['Utilities', 'Salary', 'Vendor Payment', 'Repairs', 'Other'];
const billStatuses = ['Paid', 'Unpaid', 'Partial'];
const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment'];

const AddEditBillModal = ({ onAdd, onEdit, onClose, billToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: billCategories[0],
    amount: '',
    status: billStatuses[1], // Default to Unpaid
    billDate: new Date().toISOString().split('T')[0],
    paymentDate: '',
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
        billDate: new Date(billToEdit.billDate).toISOString().split('T')[0],
        paymentDate: billToEdit.paymentDate ? new Date(billToEdit.paymentDate).toISOString().split('T')[0] : '',
        paymentMethod: billToEdit.paymentMethod || paymentMethods[0],
        paidTo: billToEdit.paidTo || '',
        remarks: billToEdit.remarks || '',
      });
      setAttachmentFile(null);
    }
  }, [billToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    if (attachmentFile) {
      data.append('attachment', attachmentFile);
    }

    try {
      if (billToEdit) {
        // Update existing bill with FormData
        const res = await api.put(`/billing/${billToEdit._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onEdit(res.data);
      } else {
        // Add new bill with FormData
        const res = await api.post('/billing', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        onAdd(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Error submitting bill:', err);
      setError(err.response?.data?.message || 'Failed to save bill.');
    } finally {
      setLoading(false);
    }
  };

  const isPaidOrPartial = formData.status === 'Paid' || formData.status === 'Partial';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {error && <Message type="error">{error}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Bill Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {billCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount*</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Payment Status*</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {billStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
          </select>
        </div>

        {/* Bill Date */}
        <div>
          <label htmlFor="billDate" className="block text-sm font-medium text-gray-700">Bill Date*</label>
          <input
            type="date"
            id="billDate"
            name="billDate"
            value={formData.billDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Payment Date (Conditional) */}
        {isPaidOrPartial && (
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date*</label>
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Payment Method (Conditional) */}
        {isPaidOrPartial && (
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method*</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
        )}

        {/* Paid To */}
        <div>
          <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700">Paid To</label>
          <input
            type="text"
            id="paidTo"
            name="paidTo"
            value={formData.paidTo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks/Notes</label>
        <textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Attachment */}
      <div>
        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Upload Attachment (Image/PDF)</label>
        <input
          type="file"
          id="attachment"
          name="attachment"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {billToEdit?.attachmentPath && !attachmentFile && (
          <p className="mt-2 text-sm text-gray-500">
            Current attachment: <a href={`${api.defaults.baseURL}${billToEdit.attachmentPath}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View File</a>
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 transition duration-150"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : billToEdit ? (
            'Update Bill'
          ) : (
            'Add Bill'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddEditBillModal;