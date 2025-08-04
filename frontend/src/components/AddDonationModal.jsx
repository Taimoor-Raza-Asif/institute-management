// import React, { useState, useEffect } from 'react';
// import api from '../api';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Gateway'];

// const AddDonationModal = ({ onAdd, onEdit, onClose, donationToEdit }) => {
//   const [formData, setFormData] = useState({
//     donationAmount: '',
//     donationPurpose: '',
//     donationDate: new Date().toISOString().split('T')[0],
//     donorName: '',
//     contactNumber: '',
//     emailAddress: '',
//     cnic: '',
//     organizationName: '',
//     paymentMethod: paymentMethods[0],
//   });
//   const [receiptFile, setReceiptFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (donationToEdit) {
//       setFormData({
//         donationAmount: donationToEdit.donationAmount,
//         donationPurpose: donationToEdit.donationPurpose,
//         donationDate: new Date(donationToEdit.donationDate).toISOString().split('T')[0],
//         donorName: donationToEdit.donorName || '',
//         contactNumber: donationToEdit.contactNumber || '',
//         emailAddress: donationToEdit.emailAddress || '',
//         cnic: donationToEdit.cnic || '',
//         organizationName: donationToEdit.organizationName || '',
//         paymentMethod: donationToEdit.paymentMethod,
//       });
//       setReceiptFile(null); // Clear file input for edit
//     }
//   }, [donationToEdit]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     setReceiptFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const data = new FormData();
//     for (const key in formData) {
//       data.append(key, formData[key]);
//     }
//     if (receiptFile) {
//       data.append('receipt', receiptFile);
//     }

//     try {
//       if (donationToEdit) {
//         // Update existing donation
//         const res = await api.put(`/donations/${donationToEdit._id}`, formData);
//         onEdit(res.data);
//       } else {
//         // Add new donation
//         const res = await api.post('/donations', data, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         onAdd(res.data);
//       }
//       onClose();
//     } catch (err) {
//       console.error('Error submitting donation:', err);
//       setError(err.response?.data?.message || 'Failed to save donation.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && <Message type="error">{error}</Message>}

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Donation Amount*</label>
//         <input
//           type="number"
//           name="donationAmount"
//           value={formData.donationAmount}
//           onChange={handleChange}
//           required
//           min="0"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Donation Purpose*</label>
//         <input
//           type="text"
//           name="donationPurpose"
//           value={formData.donationPurpose}
//           onChange={handleChange}
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Donation Date*</label>
//         <input
//           type="date"
//           name="donationDate"
//           value={formData.donationDate}
//           onChange={handleChange}
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Donor Name</label>
//         <input
//           type="text"
//           name="donorName"
//           value={formData.donorName}
//           onChange={handleChange}
//           placeholder="Anonymous"
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Contact Number</label>
//         <input
//           type="text"
//           name="contactNumber"
//           value={formData.contactNumber}
//           onChange={handleChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Email Address</label>
//         <input
//           type="email"
//           name="emailAddress"
//           value={formData.emailAddress}
//           onChange={handleChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">CNIC/ID</label>
//         <input
//           type="text"
//           name="cnic"
//           value={formData.cnic}
//           onChange={handleChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Organization Name</label>
//         <input
//           type="text"
//           name="organizationName"
//           value={formData.organizationName}
//           onChange={handleChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Payment Method*</label>
//         <select
//           name="paymentMethod"
//           value={formData.paymentMethod}
//           onChange={handleChange}
//           required
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         >
//           {paymentMethods.map(method => (
//             <option key={method} value={method}>{method}</option>
//           ))}
//         </select>
//       </div>

//       {!donationToEdit && (
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Upload Receipt / Screenshot</label>
//           <input
//             type="file"
//             name="receipt"
//             onChange={handleFileChange}
//             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
//           />
//         </div>
//       )}

//       <div className="flex justify-end space-x-2">
//         <button
//           type="button"
//           onClick={onClose}
//           className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
//         >
//           {loading ? (
//             <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
//           ) : donationToEdit ? (
//             'Update Donation'
//           ) : (
//             'Add Donation'
//           )}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default AddDonationModal;




import React, { useState, useEffect } from 'react';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Message from './Message'; // Assuming you have a Message component

const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online Gateway'];

const AddDonationModal = ({ onAdd, onEdit, onClose, donationToEdit }) => {
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
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
    if (receiptFile) {
      data.append('receipt', receiptFile);
    }

    try {
      if (donationToEdit) {
        // Update existing donation
        const res = await api.put(`/donations/${donationToEdit._id}`, formData);
        onEdit(res.data);
      } else {
        // Add new donation
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {error && <Message type="error">{error}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Donation Amount */}
        <div>
          <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-700">Donation Amount*</label>
          <input
            type="number"
            id="donationAmount"
            name="donationAmount"
            value={formData.donationAmount}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Donation Purpose */}
        <div>
          <label htmlFor="donationPurpose" className="block text-sm font-medium text-gray-700">Donation Purpose*</label>
          <input
            type="text"
            id="donationPurpose"
            name="donationPurpose"
            value={formData.donationPurpose}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Donation Date */}
        <div>
          <label htmlFor="donationDate" className="block text-sm font-medium text-gray-700">Donation Date*</label>
          <input
            type="date"
            id="donationDate"
            name="donationDate"
            value={formData.donationDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Donor Name */}
        <div>
          <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">Donor Name</label>
          <input
            type="text"
            id="donorName"
            name="donorName"
            value={formData.donorName}
            onChange={handleChange}
            placeholder="Anonymous"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            id="emailAddress"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* CNIC/ID */}
        <div>
          <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC/ID</label>
          <input
            type="text"
            id="cnic"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Organization Name */}
        <div>
          <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">Organization Name</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Payment Method */}
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
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        {!donationToEdit && (
          <div>
            <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">Upload Receipt / Screenshot</label>
            <input
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
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
          ) : donationToEdit ? (
            'Update Donation'
          ) : (
            'Add Donation'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDonationModal;