// // src/components/LeaveList.jsx
// import React, { useEffect, useState, useCallback, useRef, useContext } from 'react'; // Added useContext
// import Modal from './Modal'; // Re-use your existing Modal
// import LeaveRequestForm from './LeaveRequestForm';
// import api from '../api';
// import {
//   PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
//   MagnifyingGlassIcon, EyeIcon
// } from '@heroicons/react/24/outline';
// import { UserContext } from '../App'; // <--- Changed from AuthContext

// const LeaveList = () => {
//   const { currentUser: user } = useContext(UserContext); // <--- Changed to useContext(UserContext)
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [studentsForForm, setStudentsForForm] = useState([]); // For staff to select student
//   const [editingLeave, setEditingLeave] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [isViewMode, setIsViewMode] = useState(false);

//   // Filter States
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [filterStatus, setFilterStatus] = useState('');
//   const [filterStudentName, setFilterStudentName] = useState('');
//   const [filterClass, setFilterClass] = useState('');
//   const [filterIsReturned, setFilterIsReturned] = useState(''); // 'true', 'false', ''

//   // Debounce search term
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500);
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm]);

//   // const fetchLeaves = useCallback(async () => {
//   //   setLoading(true);
//   //   setError(null);
//   //   try {
//   //     const { data } = await api.get('/leave', {
//   //       params: {
//   //         search: debouncedSearchTerm,
//   //         status: filterStatus,
//   //         studentName: filterStudentName,
//   //         class: filterClass,
//   //         isReturned: filterIsReturned
//   //       }
//   //     });
//   //     setLeaveRequests(data);
//   //   } catch (err) {
//   //     setError(err.response?.data?.message || 'Failed to fetch leave requests.');
//   //     console.error('Error fetching leave requests:', err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [debouncedSearchTerm, filterStatus, filterStudentName, filterClass, filterIsReturned]);

//   const fetchLeaves = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = {
//         search: debouncedSearchTerm,
//         status: filterStatus,
//         studentName: filterStudentName,
//         class: filterClass,
//         isReturned: filterIsReturned,
//       };

//       // Conditionally add studentId for student role
//       if (user?.role === 'student' && user?.profileId) {
//         params.studentId = user.profileId; // Pass the student's own profileId
//       }
//       console.log(user?.profileId);
//       console.log(params.studentId);
//       const { data } = await api.get('/leave', { params }); // <--- Fixed API endpoint
//       console.log(data);
//       setLeaveRequests(data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch leave requests.');
//       console.error('Error fetching leave requests:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [debouncedSearchTerm, filterStatus, filterStudentName, filterClass, filterIsReturned, user]);

//   const fetchStudentsForDropdown = useCallback(async () => {
//     // Only fetch if user is admin or teacher, and modal is open for adding/editing
//     if ((user?.role === 'admin' || user?.role === 'teacher') && modalOpen && !isViewMode) {
//       try {
//         const { data } = await api.get('/students'); // Adjust this endpoint if needed
//         setStudentsForForm(data);
//       } catch (err) {
//         console.error('Error fetching students for dropdown:', err);
//       }
//     }
//   }, [user, modalOpen, isViewMode]); // Added modalOpen and isViewMode to dependencies

//   useEffect(() => {
//     fetchLeaves();
//   }, [fetchLeaves]);

//   useEffect(() => {
//     fetchStudentsForDropdown(); // Call this when component mounts or user/modal state changes
//   }, [fetchStudentsForDropdown]);

//   const handleAddLeave = () => {
//     setEditingLeave(null);
//     setIsViewMode(false);
//     setModalOpen(true);
//   };

//   const handleEdit = (leave) => {
//     setEditingLeave(leave);
//     setIsViewMode(false);
//     setModalOpen(true);
//   };

//   const handleView = (leave) => {
//     setEditingLeave(leave);
//     setIsViewMode(true);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this leave request?')) {
//       try {
//         await api.delete(`/leave/${id}`);
//         fetchLeaves(); // Re-fetch data after deletion
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to delete leave request.');
//         console.error('Error deleting leave request:', err);
//       }
//     }
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingLeave(null);
//     setIsViewMode(false);
//     setError(null); // Clear any form errors when closing
//   };

//   const applyFilters = () => {
//     fetchLeaves(); // Trigger re-fetch with current filter states
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setFilterStatus('');
//     setFilterStudentName('');
//     setFilterClass('');
//     setFilterIsReturned('');
//     setDebouncedSearchTerm(''); // Clear debounced term immediately too
//     setShowAdvancedFilters(false);
//   };

//   const isStaff = user?.role === 'admin' || user?.role === 'teacher';
//   const isAdmin = user?.role === 'admin';
//   const isStudent = user?.role === 'student';

//   return (
//     <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Leave Management</h1>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           {error}
//         </div>
//       )}

//       {/* Action buttons and Search */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
//         <div className="flex space-x-3 w-full sm:w-auto">
//           {/* Only staff/admin can add leave for any student. Student adds for self */}
//           {(isStaff || isStudent) && (
//             <button
//               onClick={handleAddLeave}
//               className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center shadow-sm"
//             >
//               <PlusIcon className="h-5 w-5 mr-1" /> {isStaff ? 'Add Student Leave' : 'Apply for Leave'}
//             </button>
//           )}
//           <button
//             onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//             className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200 flex items-center shadow-sm"
//           >
//             <FunnelIcon className="h-5 w-5 mr-1" /> {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
//           </button>
//         </div>

//         <div className="relative w-full sm:w-64">
//           <input
//             type="text"
//             placeholder="Search by student name or CNIC..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pl-10"
//           />
//           <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           {searchTerm && (
//             <XMarkIcon
//               className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
//               onClick={() => setSearchTerm('')}
//             />
//           )}
//         </div>
//       </div>

//       {/* Advanced Filters */}
//       {showAdvancedFilters && (
//         <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           <div>
//             <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               id="filterStatus"
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="">All</option>
//               <option value="Pending">Pending</option>
//               <option value="Approved">Approved</option>
//               <option value="Rejected">Rejected</option>
//             </select>
//           </div>
//           <div>
//             <label htmlFor="filterIsReturned" className="block text-sm font-medium text-gray-700">Returned Status</label>
//             <select
//               id="filterIsReturned"
//               value={filterIsReturned}
//               onChange={(e) => setFilterIsReturned(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="">All</option>
//               <option value="false">Not Returned</option>
//               <option value="true">Returned</option>
//             </select>
//           </div>
//           {/* Add more filter fields as needed, e.g., filter by class, by class incharge etc. */}
//           {/* <button onClick={applyFilters} className="col-span-full sm:col-span-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200">Apply Filters</button> */}
//           <button onClick={clearFilters} className="col-span-full sm:col-span-1 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition duration-200">Clear Filters</button>
//         </div>
//       )}

//       {loading ? (
//         <div className="text-center py-8">Loading leave requests...</div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
//                 {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>}
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {leaveRequests.length > 0 ? (
//                 leaveRequests.map((leave) => (
//                   <tr key={leave._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {leave.student?.name || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {leave.studentClass || leave.student?.class || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
//                       {leave.reason}
//                     </td>
//                     <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${leave.status === 'Approved' ? 'text-green-600' :
//                         leave.status === 'Rejected' ? 'text-red-600' :
//                           'text-yellow-600'
//                       }`}>
//                       {leave.status}
//                     </td>
//                     <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${leave.isReturned ? 'text-green-600' :
//                         (leave.status === 'Approved' && leave.isPastDue) ? 'text-red-600' :
//                           'text-orange-600'
//                       }`}>
//                       {leave.isReturned ? 'Returned' : (leave.status === 'Approved' && leave.isPastDue ? 'Past Due' : 'Not Returned')}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {leave.requestedBy?.name || 'N/A'} ({leave.requestedByType})
//                     </td>
//                     {isAdmin && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {leave.approvedBy?.name || 'N/A'}
//                       </td>
//                     )}
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex items-center space-x-2">
//                         <button onClick={(e) => { e.stopPropagation(); handleView(leave); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Details">
//                           <EyeIcon className="h-5 w-5" />
//                         </button>
//                         {(isStaff && leave.status !== 'Returned') && ( // Staff can edit if not returned
//                           <button onClick={(e) => { e.stopPropagation(); handleEdit(leave); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Leave">
//                             <PencilIcon className="h-5 w-5" />
//                           </button>
//                         )}
//                         {(isAdmin || (isStudent && leave.status === 'Pending' && leave.requestedBy?._id === user.id)) && (
//                           <button onClick={(e) => { e.stopPropagation(); handleDelete(leave._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Leave">
//                             <TrashIcon className="h-5 w-5" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={isAdmin ? "9" : "8"} className="text-center p-4 text-gray-500">No leave requests found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <Modal isOpen={modalOpen} onClose={handleCloseModal}>
//         <LeaveRequestForm
//           editingLeave={editingLeave}
//           fetchLeaves={fetchLeaves}
//           studentsForForm={studentsForForm}
//           onClose={handleCloseModal}
//           isViewMode={isViewMode}
//           isStaffMode={isStaff} // Pass prop to control form fields for staff
//         />
//       </Modal>
//     </div>
//   );
// };

// export default LeaveList;



// src/components/LeaveList.jsx
import React, { useEffect, useState, useCallback, useRef, useContext } from 'react'; // Added useContext
import Modal from './Modal'; // Re-use your existing Modal
import LeaveRequestForm from './LeaveRequestForm';
import api from '../api';
import {
  PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon,
  MagnifyingGlassIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { UserContext } from '../App'; // <--- Changed from AuthContext

const LeaveList = () => {
  const { currentUser: user } = useContext(UserContext); // <--- Changed to useContext(UserContext)
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [studentsForForm, setStudentsForForm] = useState([]); // For staff to select student
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
  const [filterIsReturned, setFilterIsReturned] = useState(''); //

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  const isAdmin = user && user.role === 'admin';
  const isTeacher = user && user.role === 'teacher';
  const isStudent = user && user.role === 'student';


  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Only apply studentId filter if the current user is a student
      if (isStudent && user?.profileId) {
        queryParams.append('studentId', user.profileId);
      }

      // Add other filters if they are not empty
      if (debouncedSearchTerm) {
        queryParams.append('searchTerm', debouncedSearchTerm);
      }
      if (filterStatus) {
        queryParams.append('status', filterStatus);
      }
      if (filterStudentName) {
        queryParams.append('studentName', filterStudentName);
      }
      if (filterClass) {
        queryParams.append('studentClass', filterClass);
      }
      if (filterIsReturned !== '') { // Use !== '' to distinguish from 'false'
        queryParams.append('isReturned', filterIsReturned);
      }

      // Construct the URL with query parameters
      const url = `/leave?${queryParams.toString()}`;

      const response = await api.get(url);
      setLeaveRequests(response.data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError("Failed to fetch leave requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, isStudent, debouncedSearchTerm, filterStatus, filterStudentName, filterClass, filterIsReturned]);



  // Fetch students for the form (only if admin or teacher)
  const fetchStudentsForForm = useCallback(async () => {
    if ((isAdmin || isTeacher)) {
      try {
        const response = await api.get('/students'); // Fetch all students for admin/teacher to select
        setStudentsForForm(response.data);
      } catch (err) {
        console.error("Error fetching students for form:", err);
        // Handle error, maybe set an error state
      }
    }
  }, [isAdmin, isTeacher]);


  useEffect(() => {
    fetchLeaves();
    fetchStudentsForForm(); // Fetch students when component mounts or user role changes
  }, [fetchLeaves, fetchStudentsForForm]);

  const handleAdd = () => {
    setEditingLeave(null); // Clear any previous editing data
    setIsViewMode(false);
    setModalOpen(true);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await api.delete(`/leave/${id}`);
        fetchLeaves(); // Refresh the list
      } catch (err) {
        console.error("Error deleting leave request:", err);
        setError("Failed to delete leave request.");
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLeave(null);
    setIsViewMode(false);
  };

  if (loading) return <div className="text-center py-4">Loading leave requests...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Leave Requests</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by student name or CNIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full max-w-sm"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center"
          >
            {showAdvancedFilters ? <XMarkIcon className="h-5 w-5 mr-1" /> : <FunnelIcon className="h-5 w-5 mr-1" />}
            Filters
          </button>
          {(isAdmin || isTeacher || isStudent) && ( // Only Admin and Teacher can add student leaves
            <button
              onClick={handleAdd}
              className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" /> {(isAdmin || isTeacher) ? 'Add Student Leave' : 'Apply for Leave'}
            </button>
          )}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterStudentName" className="block text-sm font-medium text-gray-700">Student Name</label>
            <input
              type="text"
              id="filterStudentName"
              value={filterStudentName}
              onChange={(e) => setFilterStudentName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="filterClass" className="block text-sm font-medium text-gray-700">Class</label>
            <input
              type="text"
              id="filterClass"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="filterIsReturned" className="block text-sm font-medium text-gray-700">Returned Status</label>
            <select
              id="filterIsReturned"
              value={filterIsReturned}
              onChange={(e) => setFilterIsReturned(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="true">Returned</option>
              <option value="false">Not Returned</option>
            </select>
          </div>
        </div>
      )}

      {leaveRequests.length === 0 && !loading && (
        <p className="text-center text-gray-500 mt-8">No leave requests found {isStudent ? "for you." : "."}</p>
      )}

      {leaveRequests.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Father Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returned
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                {(isAdmin || isTeacher || isStudent) && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leave.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.fatherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.studentClass}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.isReturned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {leave.isReturned ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.requestedBy?.role ? `${leave.requestedBy.role.charAt(0).toUpperCase() + leave.requestedBy.role.slice(1)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); handleView(leave); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Leave Details">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {(isAdmin || isTeacher || (isTeacher && leave.status === 'Pending') || (isStudent && leave.status === 'Pending' && leave.student._id === user.profileId)) && (
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(leave); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Leave">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                        {(isAdmin || (isStudent && leave.status === 'Pending' && leave.student._id === user.profileId)) && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(leave._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Leave">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? "10" : "9"} className="text-center p-4 text-gray-500">No leave requests found.</td>
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
          isStaffMode={isTeacher} // Pass prop to control form fields for staff
        />
      </Modal>
    </div>
  );
};

export default LeaveList;