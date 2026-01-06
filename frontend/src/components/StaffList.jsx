// src/components/StaffList.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api'; // Assuming you have an api.js setup for axios
import Modal from './Modal'; // Reusing your existing Modal component
import StaffForm from './StaffForm';
import AttendanceModal from './AttendanceModal';
import { useTheme } from '../context/ThemeContext';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon, QrCodeIcon, CalendarDaysIcon,
  ClipboardDocumentListIcon, EllipsisVerticalIcon, PhotoIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';


const StaffList = () => {
  const { currentTheme } = useTheme();
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
    // Load current user from storage (session first, then local)
    const raw = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('userInfo');
      }
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
  const hasStaffModuleAccess = currentUser && (currentUser.role === 'admin' || currentUser.canAccessStaff);
  const canAddStaff = hasStaffModuleAccess;
  // const canManageLeave = currentUser && currentUser.role === 'admin';
  const canEditOrDeleteStaff = hasStaffModuleAccess;

  if (loading) return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-[400px] relative">
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center text-lg text-gray-700">Loading staff records...</div>
      </div>
    </div>
  );

  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className={`mb-8 p-6 rounded-xl flex items-center justify-between ${currentTheme?.heroBg || 'bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'}`}>
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${currentTheme?.heroTitle || 'text-green-800'}`}>Staff Management</h1>
          <p className={`${currentTheme?.heroSubtitle || 'text-gray-600'} mt-1 text-sm`}>Manage staff profiles, salaries, and attendance</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-white">
          <UserCircleIcon className={`h-5 w-5 ${currentTheme?.heroIcon || 'text-white'}`} />
          <span className="font-medium">{staff.length} Staff</span>
        </div>
      </div>

      <div className={`mb-6 p-6 rounded-xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full sm:w-1/2 lg:w-2/3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, ID, or contact..."
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition ${currentTheme?.inputBg || 'border-gray-300 bg-gray-50'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`group flex items-center justify-center px-8 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>

            {canAddStaff && (
              <button
                onClick={handleAddStaff}
                className={`group flex items-center justify-center px-8 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'}`}
              >
                <PlusIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Staff
              </button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-green-50 border border-gray-100">
            <div>
              <label htmlFor="filterStaffType" className="block text-sm font-semibold text-gray-700 mb-2">Staff Type</label>
              <select
                id="filterStaffType"
                name="filterStaffType"
                className={`mt-1 block w-full p-2.5 ${currentTheme?.inputBorder || 'border border-gray-300'} rounded-md shadow-sm ${currentTheme?.inputRing || 'focus:ring-green-500'} ${currentTheme?.inputFocus || 'focus:border-green-500'} sm:text-sm`}
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
              <label htmlFor="filterEducationLevel" className="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
              <select
                id="filterEducationLevel"
                name="filterEducationLevel"
                className={`mt-1 block w-full p-2.5 ${currentTheme?.inputBorder || 'border border-gray-300'} rounded-md shadow-sm ${currentTheme?.inputRing || 'focus:ring-green-500'} ${currentTheme?.inputFocus || 'focus:border-green-500'} sm:text-sm`}
                value={filterEducationLevel}
                onChange={(e) => setFilterEducationLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="Primary">Primary</option>
                <option value="Middle">Middle</option>
                <option value="Matric">Matric</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 w-full"
              >
                <XMarkIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
        <div className="overflow-x-auto rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Salary</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
              {staff.map((person, index) => (
                <tr key={person._id} className={`transition-all duration-150 ${currentTheme.tableHover || 'hover:bg-green-50'} ${index % 2 === 0 ? (currentTheme.tbodyBg || 'bg-white') : (currentTheme.tableStripedBg || 'bg-gray-50')} hover:shadow-md`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {person.profilePictureUrl ? (
                        <img
                          src={`http://localhost:5000${person.profilePictureUrl}`}
                          alt={`${person.name}'s Profile`}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100 mr-3"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/ffffff?text=NA'; }}
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full ${currentTheme.heroPillBg || 'bg-green-100'} flex items-center justify-center mr-3 ring-2 ${currentTheme.heroPillBorder || 'ring-green-200'}`}>
                          <span className={`${currentTheme.iconText || 'text-green-700'} font-bold text-sm`}>{person.name?.[0] || 'S'}</span>
                        </div>
                      )}
                      <div>
                        <div className={`text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{person.name}</div>
                        <div className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'}`}>{person.employeeId || person.cnic || 'No ID'}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{person.staffType || 'N/A'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{person.contactNumber || 'N/A'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{person.email || 'N/A'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {person.salary ? person.salary.toLocaleString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handleViewDetails(person)} className={`p-2 ${currentTheme.iconText || 'text-green-600'} hover:${currentTheme.heroPillBg || 'bg-green-50'} ${currentTheme.heroPillBg || 'hover:bg-green-50'} rounded-lg transition-colors duration-200`} title="View Staff Details">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {canEditOrDeleteStaff && (
                        <>
                          <button onClick={() => handleEdit(person)} className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors duration-200" title="Edit Staff">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(person._id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete Staff">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={isViewMode ? 'View Staff' : editingStaff ? 'Edit Staff' : 'Add Staff'}>
        <StaffForm
          editingStaff={editingStaff}
          fetchStaff={fetchStaff}
          onClose={handleCloseModal}
          isViewMode={isViewMode}
        />
      </Modal>
    </div>
  );
};

export default StaffList;
