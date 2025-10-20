import React, { useEffect, useState, useCallback, useContext } from 'react';
import Modal from './Modal';
import StaffLeaveRequestForm from './StaffLeaveRequestForm';
import api from '../api';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { UserContext } from '../App';

const StaffLeaveList = () => {
  const { currentUser: user } = useContext(UserContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [staffMembersForForm, setStaffMembersForForm] = useState([]);
  const [editingLeave, setEditingLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isViewMode, setIsViewMode] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStaffType, setFilterStaffType] = useState('');
  const [filterIsReturned, setFilterIsReturned] = useState('');

  const isAdmin = user?.role === 'admin';
  const isStaff = ['teacher', 'accountant', 'cook', 'cleaner'].includes(user?.role);
  const canApproveReject = isAdmin; // Only admin can approve/reject staff leave
  const canCreate = isAdmin || isStaff;

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/staff-leave', {
        params: {
          status: filterStatus,
          staffType: filterStaffType,
          isReturned: filterIsReturned,
        },
      });
      const allLeaves = response.data;
      
      let filteredLeaves = allLeaves;
      // Client-side filtering for search term
      if (debouncedSearchTerm) {
        filteredLeaves = filteredLeaves.filter(leave =>
          leave.staffName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          leave.staffType.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          leave.reason.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      // Filter for non-admin staff to only see their own requests
      if (isStaff && !isAdmin) {
        filteredLeaves = filteredLeaves.filter(leave => leave.staff === user.profileId);
      }

      setLeaveRequests(filteredLeaves);
    } catch (err) {
      console.error("Error fetching staff leave requests:", err);
      setError("Failed to fetch staff leave requests.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterStatus, filterStaffType, filterIsReturned, isStaff, isAdmin, user]);

  const fetchStaffMembersForForm = useCallback(async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/staff?isDeleted=false');
        setStaffMembersForForm(res.data);
      } catch (err) {
        console.error("Failed to fetch staff members:", err);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user, fetchLeaves]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (modalOpen && isAdmin) {
      fetchStaffMembersForForm();
    }
  }, [modalOpen, isAdmin, fetchStaffMembersForForm]);

  const handleAdd = () => {
    setEditingLeave(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleView = (leave) => {
    setEditingLeave(leave);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff leave request?')) {
      try {
        await api.delete(`/staff-leave/${id}`);
        fetchLeaves();
      } catch (err) {
        console.error("Error deleting staff leave request:", err);
        setError("Failed to delete staff leave request.");
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      try {
        const response = await api.patch(`/staff-leave/${id}/status`, { status });
        console.log("Status update response:", response.data);
        fetchLeaves();
      } catch (err) {
        console.error(`Error updating leave status to ${status}:`, err);
        setError(`Failed to update status to ${status}.`);
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLeave(null);
    setIsViewMode(false);
  };

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Please log in to view this page.</div>;
  }

  if (!isAdmin && !isStaff) {
    return <div className="text-center py-10 text-red-500">You are not authorized to view this page.</div>;
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Staff Leave Requests</h1>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              placeholder="Search by name, type, or reason..."
              className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            {canCreate && (
              <button
                onClick={handleAdd}
                className="flex items-center justify-center bg-green-600 text-white rounded-md px-5 py-2 hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Request
              </button>
            )}
          </div>
        </div>
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-md shadow-inner">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm  focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="staffType" className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select
                id="staffType"
                value={filterStaffType}
                onChange={(e) => setFilterStaffType(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Teacher">Teacher</option>
                <option value="Accountant">Accountant</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
            <div>
              <label htmlFor="isReturned" className="block text-sm font-medium text-gray-700 mb-1">Return Status</label>
              <select
                id="isReturned"
                value={filterIsReturned}
                onChange={(e) => setFilterIsReturned(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="true">Returned</option>
                <option value="false">Not Returned</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {leaveRequests.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returned
                </th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.staffName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.staffType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.isReturned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {leave.isReturned ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                           <button onClick={(e) => { e.stopPropagation(); handleView(leave); }} className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-1 rounded-md hover:bg-indigo-100" title="View Details">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                        {leave.status === 'Pending' && canApproveReject && (
                          <>
                         
                            <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(leave._id, 'Approved'); }}
                                className="text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 px-3 py-1 rounded-md text-sm"
                            >
                                Approve
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(leave._id, 'Rejected'); }}
                                className="text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 px-3 py-1 rounded-md text-sm"
                            >
                                Reject
                            </button>
                          </>
                        )}
                        {leave.status !== 'Pending' && isAdmin && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(leave); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Leave">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(leave._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Leave">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? "10" : "9"} className="text-center p-4 text-gray-500">No staff leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <StaffLeaveRequestForm
          editingLeave={editingLeave}
          fetchLeaves={fetchLeaves}
          staffMembersForForm={staffMembersForForm}
          onClose={handleCloseModal}
          isViewMode={isViewMode}
          isStaffMode={isAdmin}
        />
      </Modal>
    </div>
  );
};

export default StaffLeaveList;