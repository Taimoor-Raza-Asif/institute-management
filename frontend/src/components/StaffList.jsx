// src/components/StaffList.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api'; // Assuming you have an api.js setup for axios
import Modal from './Modal'; // Reusing your existing Modal component
import StaffForm from './StaffForm';
import AttendanceModal from './AttendanceModal';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon, QrCodeIcon, CalendarDaysIcon,
  ClipboardDocumentListIcon, EllipsisVerticalIcon, PhotoIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';


const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedStaffForAttendanceOrLeave, setSelectedStaffForAttendanceOrLeave] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStaffType, setFilterStaffType] = useState('');
  const [filterEducationLevel, setFilterEducationLevel] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const currentPath = window.location.pathname;
  const isMyDataRoute = currentPath === '/my-data';

const inputRef = useRef(null);

  // Effect to debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/staff';
      if (isMyDataRoute && currentUser && currentUser.profileId) {
        url = `/staff/${currentUser.profileId}`;
      }

      const response = await api.get(url, {
        params: {
          searchTerm: debouncedSearchTerm,
          staffType: filterStaffType,
          highestEducationLevel: filterEducationLevel,
        }
      });
      // If it's the my-data route, the response will be a single object, wrap it in an array
      if (isMyDataRoute && response.data) {
        setStaff([response.data]);
      } else {
        setStaff(response.data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to fetch staff records.");
      setStaff([]); // Clear staff on error
    } finally {
      setLoading(false);
      // Manually set focus back to the input after fetch completes
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [debouncedSearchTerm, filterStaffType, filterEducationLevel, isMyDataRoute, currentUser]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    // Load current user from local storage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  const handleAddStaff = () => {
    setEditingStaff(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member? This will also delete their attendance and leave records.")) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff(); // Refresh the list
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError("Failed to delete staff record.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (staffMember) => {
    setEditingStaff(staffMember);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleOpenAttendanceModal = (staffMember) => {
    setSelectedStaffForAttendanceOrLeave(staffMember);
    setAttendanceModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAttendanceModalOpen(false);
    setEditingStaff(null);
    setSelectedStaffForAttendanceOrLeave(null);
    setIsViewMode(false); // Reset view mode on close
    fetchStaff(); // Refresh list after any modal action
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStaffType('');
    setFilterEducationLevel('');
  };

  // Permissions
  const canAddStaff = currentUser && (currentUser.role === 'admin' || currentUser.editModeEnabled);
  // const canManageLeave = currentUser && currentUser.role === 'admin';
  const canEditOrDeleteStaff = currentUser && currentUser.role === 'admin';

  if (loading) return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4 min-h-[400px] relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center text-lg text-gray-700">Loading staff records...</div>
      </div>
    </div>
  );
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Staff Management</h1>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, ID, or contact..."
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

            {canAddStaff && (
              <button
                onClick={handleAddStaff}
                className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Staff
              </button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md shadow-inner">
            <div>
              <label htmlFor="filterStaffType" className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select
                id="filterStaffType"
                name="filterStaffType"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={filterStaffType}
                onChange={(e) => setFilterStaffType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
                <option value="Accountant">Accountant</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterEducationLevel" className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
              <select
                id="filterEducationLevel"
                name="filterEducationLevel"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={filterEducationLevel}
                onChange={(e) => setFilterEducationLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
                <option value="None">None</option>
              </select>
            </div>
            <div className="col-span-full flex justify-end">
              <button onClick={handleResetFilters} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md">
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow md:overflow-visible lg:overflow-visible sm:overflow-auto rounded-lg">
        <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-auto">
          <thead className="bg-green-600 text-white rounded-md">
            <tr>
              <th className="p-2 border border-white">Name</th>
              <th className="p-2 border border-white">CNIC</th>
              <th className="p-2 border border-white">Type</th>
              <th className="p-2 border border-white">Contact</th>
              <th className="p-2 border border-white">Email</th>
              <th className="p-2 border border-white">Salary</th>
              <th className="p-2 border border-white">Joined Date</th>
              <th className="p-2 border border-white">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.length > 0 ? (
              staff.map((staffMember, index) => (
                <tr key={staffMember._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {staffMember.profilePictureUrl ? (
                        // If profilePictureUrl exists, render the <img> tag
                        <img
                          src={`http://localhost:5000${staffMember.profilePictureUrl}`}
                          alt={`${staffMember.name}'s Profile`}
                          className="h-8 w-8 rounded-full object-cover mr-2"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=NA'; }}
                        />
                      ) : (
                        // If not, render the placeholder icon
                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                      )}
                      <span>{staffMember.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.cnic || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.staffType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PKR {parseFloat(staffMember.salary).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(staffMember.dateOfJoining).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                    <button onClick={() => handleViewDetails(staffMember)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Staff Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {canEditOrDeleteStaff && (
                      <Menu as="div" className="relative inline-block text-left ml-2">
                        <div>
                          <MenuButton className="flex items-center text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                          </MenuButton>
                        </div>
                        <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleEdit(staffMember)}
                                  className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  <PencilIcon className="mr-3 h-5 w-5 text-yellow-600 group-hover:text-yellow-900" aria-hidden="true" />
                                  Edit Staff
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleDelete(staffMember._id)}
                                  className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  <TrashIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
                                  Delete Staff
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleOpenAttendanceModal(staffMember)}
                                  className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  <QrCodeIcon className="mr-3 h-5 w-5 text-green-600 group-hover:text-green-900" aria-hidden="true" />
                                  Mark Attendance
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => { }}
                                  className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  <CalendarDaysIcon className="mr-3 h-5 w-5 text-indigo-600 group-hover:text-indigo-900" aria-hidden="true" />
                                  Request Leave
                                </button>
                              )}
                            </MenuItem>
                          </div>
                        </MenuItems>
                      </Menu>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">No staff records found. Add a new staff member!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Staff Form Modal (Add/Edit/View) */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <StaffForm
          editingStaff={editingStaff}
          fetchStaff={fetchStaff}
          onClose={handleCloseModal}
          isViewMode={isViewMode}
        />
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={attendanceModalOpen} onClose={handleCloseModal}>
        <AttendanceModal
          staffMember={selectedStaffForAttendanceOrLeave}
          onClose={handleCloseModal}
          fetchStaff={fetchStaff} // To refresh list after attendance update
        />
      </Modal>
    </div>
  );
};

export default StaffList;