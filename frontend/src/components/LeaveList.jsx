// src/components/LeaveList.jsx

import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  const { currentTheme } = useTheme();
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-50 to-teal-100 shadow-lg rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-emerald-800">
            <PencilIcon className="h-9 w-9 inline-block mr-3" />
            Student Leave Requests
          </h1>
          <p className="text-emerald-700 text-sm">Manage and track student leave applications</p>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              type="text"
              placeholder="Search by student name or reason..."
              className="block w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="group flex items-center justify-center h-12 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto text-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
            {(isAdmin || isTeacher) && (
              <button
                onClick={handleAdd}
                className="group flex items-center justify-center h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Request
              </button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                id="studentName"
                value={filterStudentName}
                onChange={(e) => setFilterStudentName(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <input
                type="text"
                id="class"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="isReturned" className="block text-sm font-medium text-gray-700 mb-2">Return Status</label>
              <select
                id="isReturned"
                value={filterIsReturned}
                onChange={(e) => setFilterIsReturned(e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
        <p className="text-center text-gray-600 py-8">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Dates</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Reason</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Returned</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave, index) => (
                    <tr 
                      key={leave._id} 
                      className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{leave.studentClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.isReturned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {leave.isReturned ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleView(leave); }} 
                            className="group p-1 rounded-md transition-all duration-200 text-blue-600 hover:bg-blue-100 hover:shadow-md transform hover:scale-110" 
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5 transition-transform group-hover:scale-125" />
                          </button>
                          {leave.status === 'Pending' && (isAdmin || isTeacher) && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(leave._id, 'Approved')} 
                                className="group flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                                title="Approve Leave"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(leave._id, 'Rejected')} 
                                className="group flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                                title="Reject Leave"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {leave.status !== 'Pending' && (isAdmin || isTeacher) && (
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
                    <td colSpan={7} className="text-center p-8 text-gray-500">No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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