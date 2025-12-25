import React, { useEffect, useState, useCallback, useContext } from 'react';
import Modal from './Modal';
import StaffLeaveRequestForm from './StaffLeaveRequestForm';
import ConfirmationModal from './ConfirmationModal';
import api from '../api';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';

const StaffLeaveList = () => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [staffMembersForForm, setStaffMembersForForm] = useState([]);
  const [editingLeave, setEditingLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStaffType, setFilterStaffType] = useState('');
  const [filterIsReturned, setFilterIsReturned] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const isAdmin = user?.role === 'admin';
  const isStaff = ['teacher', 'accountant', 'cook', 'cleaner'].includes(user?.role);
  const canApproveReject = isAdmin;
  const canCreate = isAdmin || isStaff;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/staff-leave', {
        params: {
          status: filterStatus,
          staffType: filterStaffType,
          isReturned: filterIsReturned
        }
      });

      let filtered = data || [];
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        filtered = filtered.filter((leave) =>
          leave.staffName?.toLowerCase().includes(term) ||
          leave.staffType?.toLowerCase().includes(term) ||
          leave.reason?.toLowerCase().includes(term)
        );
      }

      if (isStaff && !isAdmin) {
        filtered = filtered.filter((leave) => leave.staff === user?.profileId);
      }

      setLeaveRequests(filtered);
    } catch (err) {
      console.error('Error fetching staff leave requests:', err);
      setError('Failed to fetch staff leave requests.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterStatus, filterStaffType, filterIsReturned, isStaff, isAdmin, user]);

  const fetchStaffMembersForForm = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/staff?isDeleted=false');
      setStaffMembersForForm(res.data || []);
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user, fetchLeaves]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400);
    return () => clearTimeout(handler);
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

  const handleDelete = (id) => {
    setConfirmMessage('Are you sure you want to delete this staff leave request?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/staff-leave/${id}`);
        fetchLeaves();
      } catch (err) {
        console.error('Error deleting staff leave request:', err);
        setError('Failed to delete staff leave request.');
      } finally {
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = (id, status) => {
    setConfirmMessage(`Are you sure you want to ${status.toLowerCase()} this leave request?`);
    setConfirmAction(() => async () => {
      try {
        await api.patch(`/staff-leave/${id}/status`, { status });
        fetchLeaves();
      } catch (err) {
        console.error(`Error updating leave status to ${status}:`, err);
        setError(`Failed to update status to ${status}.`);
      } finally {
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 ">
      <div className={`mb-8 rounded-2xl p-8 ${currentTheme.heroBg || 'bg-emerald-50'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <ClockIcon className={`h-9 w-9 ${currentTheme.heroIcon || 'text-gray-500'}`} />
          <div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${currentTheme.heroTitle || 'text-green-800'}`}>Staff Leave Requests</h1>
            <p className={`${currentTheme.heroSubtitle || 'text-gray-600'} text-sm`}>Manage and track staff leave applications</p>
          </div>
        </div>
      </div>

      <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} ${currentTheme?.border || 'border border-gray-100'} rounded-xl p-6 mb-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              placeholder="Search by name, type, or reason..."
              className={`block w-full h-12 pl-10 pr-4 rounded-lg ${currentTheme.inputBg || 'bg-white'} ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.inputText || 'text-gray-900'} ${currentTheme.inputPlaceholder || 'placeholder:text-gray-400'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'} ${currentTheme.inputFocus || 'focus:border-emerald-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`group flex items-center justify-center h-12 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
            {canCreate && (
              <button
                onClick={handleAdd}
                className={`group flex items-center justify-center h-12 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'}`}
              >
                <PlusIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Request
              </button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`block w-full h-12 px-4 rounded-lg ${currentTheme.inputBg || 'bg-white'} ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.inputText || 'text-gray-900'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'} ${currentTheme.inputFocus || 'focus:border-emerald-500'}`}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="staffType" className="block text-sm font-medium text-gray-700 mb-2">Staff Type</label>
              <select
                id="staffType"
                value={filterStaffType}
                onChange={(e) => setFilterStaffType(e.target.value)}
                className={`block w-full h-12 px-4 rounded-lg ${currentTheme.inputBg || 'bg-white'} ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.inputText || 'text-gray-900'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'} ${currentTheme.inputFocus || 'focus:border-emerald-500'}`}
              >
                <option value="">All</option>
                <option value="Teacher">Teacher</option>
                <option value="Accountant">Accountant</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
            <div>
              <label htmlFor="isReturned" className="block text-sm font-medium text-gray-700 mb-2">Return Status</label>
              <select
                id="isReturned"
                value={filterIsReturned}
                onChange={(e) => setFilterIsReturned(e.target.value)}
                className={`block w-full h-12 px-4 rounded-lg ${currentTheme.inputBg || 'bg-white'} ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.inputText || 'text-gray-900'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'} ${currentTheme.inputFocus || 'focus:border-emerald-500'}`}
              >
                <option value="">All</option>
                <option value="true">Returned</option>
                <option value="false">Not Returned</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className={`text-center ${currentTheme?.text || 'text-gray-600'} py-8`}>Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : (
        <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
          <div className="overflow-x-auto rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">Staff Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Staff Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Reason</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Period</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Returned</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave, index) => (
                    <tr
                      key={leave._id}
                      className={`transition-all duration-150 ${currentTheme.tableHover || 'hover:bg-green-50'} ${index % 2 === 0 ? (currentTheme.tbodyBg || 'bg-white') : (currentTheme.tableStripedBg || 'bg-gray-50')} hover:shadow-md`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme?.text || 'text-gray-900'}`}>{leave.staffName}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-700'}`}>{leave.staffType}</td>
                      <td className={`px-6 py-4 text-sm ${currentTheme?.text || 'text-gray-700'} max-w-xs truncate`} title={leave.reason}>{leave.reason}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-700'}`}>
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${currentTheme?.badgeBorder || 'border-gray-200'} ${
                          leave.status === 'Approved'
                            ? `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}`
                            : leave.status === 'Rejected'
                            ? `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}`
                            : `${currentTheme.badgeWarningBg || 'bg-amber-100'} ${currentTheme.badgeWarningText || 'text-amber-800'}`
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${currentTheme?.badgeBorder || 'border-gray-200'} ${leave.isReturned ? `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}` : `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}`}`}>
                          {leave.isReturned ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleView(leave); }}
                            className={`p-1 rounded-md transition-all duration-200 ${currentTheme?.iconText || 'text-blue-600'} hover:opacity-80`}
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {leave.status === 'Pending' && canApproveReject && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-lg ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'}`}
                                title="Approve Leave"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                className={`group flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${currentTheme.btnDangerBg || 'bg-red-600'} ${currentTheme.btnDangerHover || 'hover:bg-red-700'} ${currentTheme.btnDangerText || 'text-white'} ${currentTheme.btnDangerBorder || 'border border-red-700'}`}
                                title="Reject Leave"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {leave.status !== 'Pending' && isAdmin && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(leave); }}
                                className="group p-1 rounded-md transition-all duration-200 text-green-600 hover:bg-green-100 hover:shadow-md transform hover:scale-110"
                                title="Edit Leave"
                              >
                                <PencilIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(leave._id); }}
                                className="group p-1 rounded-md transition-all duration-200 text-red-600 hover:bg-red-100 hover:shadow-md transform hover:scale-110"
                                title="Delete Leave"
                              >
                                <TrashIcon className="h-5 w-5 transition-transform group-hover:scale-125" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">No staff leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        message={confirmMessage}
      />
    </div>
  );
};

export default StaffLeaveList;