// // src/components/StaffList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import api from '../api'; // Assuming you have an api.js setup for axios
// import Modal from './Modal'; // Reusing your existing Modal component
// import StaffForm from './StaffForm';
// import AttendanceModal from './AttendanceModal';
// import LeaveRequestModal from './LeaveRequestModal';
// import ManageLeaveModal from './ManageLeaveModal';
// import {
//   PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
//   MagnifyingGlassIcon, EyeIcon, QrCodeIcon, CalendarDaysIcon,
//   ClipboardDocumentListIcon // For managing leave requests
// } from '@heroicons/react/24/outline';


// const StaffList = () => {
//   const [staff, setStaff] = useState([]);
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isViewMode, setIsViewMode] = useState(false);

//   // Modals for specific actions
//   const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
//   const [leaveRequestModalOpen, setLeaveRequestModalOpen] = useState(false);
//   const [manageLeaveModalOpen, setManageLeaveModalOpen] = useState(false);
//   const [selectedStaffForAttendanceOrLeave, setSelectedStaffForAttendanceOrLeave] = useState(null);

//   // --- Filter States ---
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [filterStaffType, setFilterStaffType] = useState('');
//   const [filterEducationLevel, setFilterEducationLevel] = useState('');
//   const [filterSubject, setFilterSubject] = useState(''); // For teachers

//   const staffTypes = ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'];
//   const educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'Other', 'None'];

//   const fetchStaff = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       if (debouncedSearchTerm) params.append('searchTerm', debouncedSearchTerm);
//       if (filterStaffType) params.append('staffType', filterStaffType);
//       if (filterEducationLevel) params.append('highestEducationLevel', filterEducationLevel);
//       if (filterSubject) params.append('subject', filterSubject);

//       const res = await api.get(`/staff?${params.toString()}`);
      
//       if (Array.isArray(res.data)) {
//         setStaff(res.data);
//       } else {
//         console.error("API response for staff is not an array:", res.data);
//         setStaff([]);
//         setError("Received unexpected data format from server.");
//       }
//     } catch (err) {
//       console.error('Failed to fetch staff:', err);
//       setStaff([]);
//       setError('Failed to load staff records. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [debouncedSearchTerm, filterStaffType, filterEducationLevel, filterSubject]);

//   useEffect(() => {
//     fetchStaff();
//   }, [fetchStaff]);

//   // Debounce search term
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500);
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm]);

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingStaff(null);
//     setIsViewMode(false);
//     setAttendanceModalOpen(false);
//     setLeaveRequestModalOpen(false);
//     setManageLeaveModalOpen(false);
//     setSelectedStaffForAttendanceOrLeave(null);
//     fetchStaff(); // Re-fetch staff after any modal closes
//   };

//   const handleAddStaff = () => {
//     setEditingStaff(null);
//     setIsViewMode(false);
//     setModalOpen(true);
//   };

//   const handleEdit = (staffMember) => {
//     setEditingStaff(staffMember);
//     setIsViewMode(false);
//     setModalOpen(true);
//   };

//   const handleView = (staffMember) => {
//     setEditingStaff(staffMember);
//     setIsViewMode(true);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this staff member?')) {
//       try {
//         await api.delete(`/staff/${id}`);
//         fetchStaff();
//       } catch (err) {
//         console.error('Failed to delete staff member:', err);
//         alert('Failed to delete staff member. Please try again.');
//       }
//     }
//   };

//   const handleRecordAttendance = (staffMember) => {
//     setSelectedStaffForAttendanceOrLeave(staffMember);
//     setAttendanceModalOpen(true);
//   };

//   const handleRequestLeave = (staffMember) => {
//     setSelectedStaffForAttendanceOrLeave(staffMember);
//     setLeaveRequestModalOpen(true);
//   };

//   const handleManageLeave = () => {
//     setManageLeaveModalOpen(true);
//   };

//   const handleResetFilters = () => {
//     setSearchTerm('');
//     setFilterStaffType('');
//     setFilterEducationLevel('');
//     setFilterSubject('');
//     // fetchStaff will be triggered by useEffect due to filter state changes
//   };


//   if (loading) {
//     return <div className="text-center py-4">Loading staff records...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-4 text-red-600">Error: {error}</div>;
//   }

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-purple-800 mb-8">Staff Management</h1>

//       {/* Action Buttons and Filters */}
//       <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//           {/* Search Bar */}
//           <div className="relative w-full sm:w-1/2 lg:w-1/3">
//             <input
//               type="text"
//               placeholder="Search by name, email, contact, ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             {/* Add New Staff Button */}
//             <button
//               onClick={handleAddStaff}
//               className="flex items-center justify-center bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
//             >
//               <PlusIcon className="h-5 w-5 mr-2" /> Add New Staff
//             </button>

//             {/* Manage Leave Requests Button (for Admin) */}
//             <button
//               onClick={handleManageLeave}
//               className="flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md w-full sm:w-auto"
//             >
//               <ClipboardDocumentListIcon className="h-5 w-5 mr-2" /> Manage Leave
//             </button>

//             {/* Toggle Advanced Filters */}
//             <button
//               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//               className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
//             >
//               <FunnelIcon className="h-5 w-5 mr-2" />
//               {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
//             </button>
//           </div>
//         </div>

//         {/* Advanced Filters */}
//         {showAdvancedFilters && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
//             {/* Staff Type Filter */}
//             <div>
//               <label htmlFor="filterStaffType" className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
//               <select
//                 id="filterStaffType"
//                 value={filterStaffType}
//                 onChange={(e) => setFilterStaffType(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">All Types</option>
//                 {staffTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Education Level Filter */}
//             <div>
//               <label htmlFor="filterEducationLevel" className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
//               <select
//                 id="filterEducationLevel"
//                 value={filterEducationLevel}
//                 onChange={(e) => setFilterEducationLevel(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">All Levels</option>
//                 {educationLevels.map(level => (
//                   <option key={level} value={level}>{level}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Subject Taught Filter (Conditional for Teachers) */}
//             {filterStaffType === 'Teacher' && (
//               <div>
//                 <label htmlFor="filterSubject" className="block text-sm font-medium text-gray-700 mb-1">Subject Taught</label>
//                 <input
//                   type="text"
//                   id="filterSubject"
//                   value={filterSubject}
//                   onChange={(e) => setFilterSubject(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="e.g., Math"
//                 />
//               </div>
//             )}
//             <div className="col-span-full flex justify-end">
//               <button onClick={handleResetFilters} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md">
//                 Reset Filters
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Staff Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {staff.length > 0 ? (
//               staff.map((staffMember) => (
//                 <tr key={staffMember._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {staffMember.profilePictureUrl && (
//                       <img
//                         src={`http://localhost:5000${staffMember.profilePictureUrl}`}
//                         alt="Profile"
//                         className="h-8 w-8 rounded-full inline-block mr-2 object-cover"
//                         onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=NA'; }}
//                       />
//                     )}
//                     {staffMember.name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.staffType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.employeeId || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.contactNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.email || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PKR {parseFloat(staffMember.salary).toFixed(2)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(staffMember.dateOfJoining).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
//                     <button onClick={() => handleView(staffMember)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Staff Details">
//                       <EyeIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={() => handleEdit(staffMember)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Staff">
//                       <PencilIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={() => handleDelete(staffMember._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Staff">
//                       <TrashIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={() => handleRecordAttendance(staffMember)} className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-md hover:bg-green-100" title="Record Attendance">
//                       <QrCodeIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={() => handleRequestLeave(staffMember)} className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-md hover:bg-yellow-100" title="Request Leave">
//                       <CalendarDaysIcon className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="text-center p-4 text-gray-500">No staff records found. Add a new staff member!</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Staff Form Modal (Add/Edit/View) */}
//       <Modal isOpen={modalOpen} onClose={handleCloseModal}>
//         <StaffForm
//           editingStaff={editingStaff}
//           fetchStaff={fetchStaff}
//           onClose={handleCloseModal}
//           isViewMode={isViewMode}
//         />
//       </Modal>

//       {/* Attendance Modal */}
//       <Modal isOpen={attendanceModalOpen} onClose={handleCloseModal}>
//         <AttendanceModal
//           staffMember={selectedStaffForAttendanceOrLeave}
//           onClose={handleCloseModal}
//           fetchStaff={fetchStaff} // To refresh list after attendance update
//         />
//       </Modal>

//       {/* Leave Request Modal */}
//       <Modal isOpen={leaveRequestModalOpen} onClose={handleCloseModal}>
//         <LeaveRequestModal
//           staffMember={selectedStaffForAttendanceOrLeave}
//           onClose={handleCloseModal}
//           fetchStaff={fetchStaff} // To refresh list after leave request
//         />
//       </Modal>

//       {/* Manage Leave Modal (Admin View) */}
//       <Modal isOpen={manageLeaveModalOpen} onClose={handleCloseModal}>
//         <ManageLeaveModal
//           onClose={handleCloseModal}
//           fetchStaff={fetchStaff} // To refresh staff data after leave approval/rejection
//         />
//       </Modal>
//     </div>
//   );
// };

// export default StaffList;



// src/components/StaffList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api'; // Assuming you have an api.js setup for axios
import Modal from './Modal'; // Reusing your existing Modal component
import StaffForm from './StaffForm';
import AttendanceModal from './AttendanceModal';
import LeaveRequestModal from './LeaveRequestModal';
import ManageLeaveModal from './ManageLeaveModal';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon, QrCodeIcon, CalendarDaysIcon,
  ClipboardDocumentListIcon // For managing leave requests
} from '@heroicons/react/24/outline';


const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Modals for specific actions
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [leaveRequestModalOpen, setLeaveRequestModalOpen] = useState(false);
  const [manageLeaveModalOpen, setManageLeaveModalOpen] = useState(false);
  const [selectedStaffForAttendanceOrLeave, setSelectedStaffForAttendanceOrLeave] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStaffType, setFilterStaffType] = useState('');
  const [filterEducationLevel, setFilterEducationLevel] = useState('');

  // Get current user from local storage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentPath = window.location.pathname;
  const isMyDataRoute = currentPath === '/my-data';

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
          search: debouncedSearchTerm,
          staffType: filterStaffType,
          educationLevel: filterEducationLevel,
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
    }
  }, [debouncedSearchTerm, filterStaffType, filterEducationLevel, isMyDataRoute, currentUser]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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

  const handleOpenLeaveRequestModal = (staffMember) => {
    setSelectedStaffForAttendanceOrLeave(staffMember);
    setLeaveRequestModalOpen(true);
  };

  const handleOpenManageLeaveModal = () => {
    setManageLeaveModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAttendanceModalOpen(false);
    setLeaveRequestModalOpen(false);
    setManageLeaveModalOpen(false);
    setEditingStaff(null);
    setSelectedStaffForAttendanceOrLeave(null);
    setIsViewMode(false); // Reset view mode on close
    fetchStaff(); // Refresh list after any modal action
  };


  if (loading) return <div className="text-center py-4">Loading staff records...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  // Permissions
  const canAddStaff = currentUser && (currentUser.role === 'admin' || currentUser.editModeEnabled);
  const canManageLeave = currentUser && currentUser.role === 'admin';

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Staff Management</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="w-full sm:w-1/3 relative">
          <input
            type="text"
            placeholder="Search by name, ID, or contact..."
            className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-purple-500 focus:border-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200 shadow-sm w-full sm:w-auto"
          >
            {showAdvancedFilters ? <XMarkIcon className="h-5 w-5 mr-2" /> : <FunnelIcon className="h-5 w-5 mr-2" />}
            {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
          {/* {canManageLeave &&  */}
          {(
            <button
              onClick={handleOpenManageLeaveModal}
              className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
              title="Manage All Leave Requests"
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
              Manage Leaves
            </button>
          )}

          {/* {canAddStaff &&  */}
          {(
            <button
              onClick={handleAddStaff}
              className="flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Staff
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
          {/* Add more filters as needed */}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.length > 0 ? (
              staff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.staffType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.contactNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    PKR {s.salary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); handleViewDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Staff Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {/* {((currentUser && currentUser.role === 'admin') || (currentUser && currentUser.profileId === s._id && currentUser.editModeEnabled)) &&  */}
                    {(
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Staff">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {/* {(currentUser && currentUser.role === 'admin')  */}
                    {(
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Staff">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                    {/* {((currentUser && currentUser.role === 'admin') || (currentUser && currentUser.profileId === s._id && currentUser.editModeEnabled)) &&  */}
                    {(
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenAttendanceModal(s); }} className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-md hover:bg-green-100" title="Mark Attendance">
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleOpenLeaveRequestModal(s); }} className="text-orange-600 hover:text-orange-800 transition-colors duration-200 p-1 rounded-md hover:bg-orange-100" title="Request Leave">
                          <CalendarDaysIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">No staff records found. {canAddStaff && 'Add a new staff member!'}</td>
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

      {/* Leave Request Modal */}
      <Modal isOpen={leaveRequestModalOpen} onClose={handleCloseModal}>
        <LeaveRequestModal
          staffMember={selectedStaffForAttendanceOrLeave}
          onClose={handleCloseModal}
          fetchStaff={fetchStaff} // To refresh list after leave request
        />
      </Modal>

      {/* Manage Leave Modal (Admin View) */}
      <Modal isOpen={manageLeaveModalOpen} onClose={handleCloseModal}>
        <ManageLeaveModal
          onClose={handleCloseModal}
          fetchStaff={fetchStaff} // To refresh staff data after leave approval/rejection
        />
      </Modal>
    </div>
  );
};

export default StaffList;