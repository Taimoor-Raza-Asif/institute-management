// src/components/ManageLeaveModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { XMarkIcon, CheckIcon, NoSymbolIcon } from '@heroicons/react/24/outline'; // Icons for approve/reject

const ManageLeaveModal = ({ onClose, fetchStaff }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Pending'); // Default to show pending requests

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'All') {
        params.append('status', filterStatus);
      }
      const res = await api.get(`/staff/leave-requests?${params.toString()}`);
      if (Array.isArray(res.data)) {
        setLeaveRequests(res.data);
      } else {
        console.error("API response for leave requests is not an array:", res.data);
        setLeaveRequests([]);
        setError("Received unexpected data format from server for leave requests.");
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      setLeaveRequests([]);
      setError('Failed to load leave requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleUpdateLeaveStatus = async (staffId, requestId, status) => {
    const confirmation = window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`);
    if (!confirmation) return;

    try {
      // You might want to get the admin's name from context/auth here
      const approvedRejectedBy = 'Admin User'; // Replace with actual admin name/ID
      await api.patch(`/staff/${staffId}/leave-requests/${requestId}`, { status, approvedRejectedBy });
      alert(`Leave request ${status.toLowerCase()} successfully.`);
      fetchLeaveRequests(); // Re-fetch requests to update list
      fetchStaff(); // Re-fetch main staff list to update their leave records
    } catch (err) {
      console.error(`Failed to ${status.toLowerCase()} leave request:`, err.response?.data || err.message);
      alert(`Failed to ${status.toLowerCase()} leave request: ` + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-xl">
      <div className="flex-shrink-0 relative">
        <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
          <XMarkIcon className="h-7 w-7" />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-blue-700">Manage Leave Requests</h2>
        <hr className="mb-6 border-blue-200" />
      </div>

      <div className="mb-4">
        <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {leaveRequests.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.requestId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{request.staffName} ({request.employeeId || 'N/A'})</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={request.reason}>{request.reason}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'}`
                    }>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {request.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateLeaveStatus(request.staffId, request.requestId, 'Approved')}
                          className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-md hover:bg-green-100"
                          title="Approve Leave"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateLeaveStatus(request.staffId, request.requestId, 'Rejected')}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100"
                          title="Reject Leave"
                        >
                          <NoSymbolIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 p-4">No leave requests found with current filters.</p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 flex justify-end">
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

export default ManageLeaveModal;
