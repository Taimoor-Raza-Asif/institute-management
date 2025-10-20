// src/components/LeaveList.jsx

import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import Modal from './Modal';
import LeaveRequestForm from './LeaveRequestForm';
import api from '../api';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { UserContext } from '../App';
import ConfirmationModal from './ConfirmationModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LeaveList = () => {
  const { currentUser: user } = useContext(UserContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [studentsForForm, setStudentsForForm] = useState([]);
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
  const [filterStudentName, setFilterStudentName] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterIsReturned, setFilterIsReturned] = useState('');

  // New states for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => { });

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/leave', {
        params: {
          search: debouncedSearchTerm,
          status: filterStatus,
          studentName: filterStudentName,
          studentClass: filterClass,
          startDate: filterStartDate ? filterStartDate.toISOString() : null,
          endDate: filterEndDate ? filterEndDate.toISOString() : null,
          isReturned: filterIsReturned
        },
      });
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterStatus, filterStudentName, filterClass, filterStartDate, filterEndDate, filterIsReturned]);

  const fetchStudentsForForm = useCallback(async () => {
    if (isTeacher || isAdmin) {
      try {
        const { data } = await api.get('/students?select=name,cnic');
        setStudentsForForm(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    }
  }, [isTeacher, isAdmin]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (isAdmin || isTeacher || isStudent) {
      fetchLeaves();
      fetchStudentsForForm();
    }
  }, [isAdmin, isTeacher, isStudent, fetchLeaves, fetchStudentsForForm]);

  const handleDelete = async (id) => {
    setConfirmMessage("Are you sure you want to delete this leave request?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/leave/${id}`);
        fetchLeaves();
      } catch (err) {
        console.error("Error deleting leave request:", err);
        setError("Failed to delete leave request.");
      } finally {
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleView = (leave) => {
    setEditingLeave(leave);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLeave(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLeave(null);
    setIsViewMode(false);
  };

  const handleUpdateStatus = (id, status) => {
    setConfirmMessage(`Are you sure you want to ${status.toLowerCase()} this leave request?`);
    setConfirmAction(() => async () => {
      try {
        await api.patch(`/leave/${id}/status`, { status });
        fetchLeaves();
      } catch (err) {
        console.error(`Error updating leave status to ${status}:`, err);
        setError(`Failed to update leave request status to ${status}.`);
      } finally {
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Student Leave Requests</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              placeholder="Search by student name or reason..."
              className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:outline-none focus:rblue focus:ring-green-500 focus:border-green-500"
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
            {(isAdmin || isTeacher) && (
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-md shadow-inner">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input
                type="text"
                id="studentName"
                value={filterStudentName}
                onChange={(e) => setFilterStudentName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                id="class"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
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

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.studentClass}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
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
                        <button onClick={(e) => { e.stopPropagation(); handleView(leave); }} className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {leave.status === 'Pending' && (isAdmin || isTeacher) && (
                          <>
                            <button onClick={() => handleUpdateStatus(leave._id, 'Approved')} className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition duration-200 shadow-sm" title="Approve Leave">
                              Approve
                            </button>
                            <button onClick={() => handleUpdateStatus(leave._id, 'Rejected')} className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200 shadow-sm" title="Reject Leave">
                              Reject
                            </button>
                          </>
                        )}
                        {leave.status !== 'Pending' && (isAdmin || isTeacher) && (
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
                  <td colSpan={6} className="text-center p-4 text-gray-500">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <LeaveRequestForm
          editingLeave={editingLeave}
          fetchLeaves={fetchLeaves}
          studentsForForm={studentsForForm}
          onClose={handleCloseModal}
          isViewMode={isViewMode}
          isStaffMode={isTeacher || isAdmin}
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

export default LeaveList;