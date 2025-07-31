// // src/components/AttendanceMarking.jsx
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import {
//   CalendarDaysIcon, UserGroupIcon, FunnelIcon, CheckIcon, XMarkIcon, ClipboardDocumentCheckIcon
// } from '@heroicons/react/24/outline';

// const AttendanceMarking = () => {
//   const { currentUser: user } = useContext(UserContext);

//   const [attendanceType, setAttendanceType] = useState('Student'); // 'Student' or 'Staff'
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [members, setMembers] = useState([]); // Students or Staff members to mark attendance for
//   const [attendanceStatuses, setAttendanceStatuses] = useState({}); // { userId: 'Present'/'Absent'/'Leave' }
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');

//   // Teacher-specific filters
//   const [filterClassType, setFilterClassType] = useState('');
//   const [filterClassNumber, setFilterClassNumber] = useState('');
//   const [filterDegreeName, setFilterDegreeName] = useState('');
//   const [filterSemester, setFilterSemester] = useState('');
//   const [filterMajorSubject, setFilterMajorSubject] = useState('');

//   const isTeacher = user?.role === 'teacher';
//   const isAdmin = user?.role === 'admin';

//   const fetchMembers = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       let endpoint = '';
//       const params = {};

//       if (attendanceType === 'Student') {
//         endpoint = '/attendance/students';
//         if (isTeacher) {
//           // Apply teacher-specific filters
//           if (filterClassType) params.classType = filterClassType;
//           if (filterClassNumber) params.classNumber = filterClassNumber;
//           if (filterDegreeName) params.degreeName = filterDegreeName;
//           if (filterSemester) params.semester = filterSemester;
//           if (filterMajorSubject) params.majorSubject = filterMajorSubject;
//         }
//       } else { // Staff
//         endpoint = '/attendance/staff';
//       }

//       const { data } = await api.get(endpoint, { params });
//        // FIX: Log the received data to help with debugging
//       console.log('API Response data:', data);
//       console.log('Type of API Response data:', typeof data);
      
//       // FIX: Ensure data is an array before processing
//       if (Array.isArray(data)) {
//         setMembers(data);

//         // Initialize attendance statuses for all fetched members to 'Present' by default
//         const initialStatuses = {};
//         data.forEach(member => {
//           initialStatuses[member._id] = 'Present';
//         });
//         setAttendanceStatuses(initialStatuses);
//       } else {
//         // If data is not an array, something is wrong, handle gracefully
//         setMembers([]);
//         setAttendanceStatuses({});
//         setError('Received invalid data from the server.');
//       }

//     } catch (err) {
//       console.error('Error fetching members:', err);
//       setError(err.response?.data?.message || 'Failed to fetch members.');
//       setMembers([]); // Ensure members is an empty array on error
//     } finally {
//       setLoading(false);
//     }
//   }, [attendanceType, isTeacher, filterClassType, filterClassNumber, filterDegreeName, filterSemester, filterMajorSubject]);

//   useEffect(() => {
//     if (user) {
//       fetchMembers();
//     }
//   }, [user, attendanceType, fetchMembers]);

//   const handleStatusChange = (userId, status) => {
//     setAttendanceStatuses(prev => ({ ...prev, [userId]: status }));
//   };

//   const handleSubmitAttendance = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccessMessage('');

//     // FIX: Ensure members is an array before mapping
//     if (!Array.isArray(members)) {
//         setError('No members to submit attendance for.');
//         setLoading(false);
//         return;
//     }

//     const recordsToSubmit = members.map(member => ({
//       userId: member._id,
//       status: attendanceStatuses[member._id],
//       reason: attendanceStatuses[member._id] === 'Leave' || attendanceStatuses[member._id] === 'Absent' ? '' : undefined,
//       ...(attendanceType === 'Student' && {
//         studentClass: member.class,
//         studentClassNumber: member.classNumber,
//         studentSemester: member.semester,
//         studentDegreeName: member.degreeName,
//         studentMajorSubject: member.majorSubject,
//       }),
//     }));

//     try {
//       const { data } = await api.post('/attendance/mark', {
//         date: selectedDate,
//         attendanceRecords: recordsToSubmit,
//         type: attendanceType,
//       });
//       setSuccessMessage(data.message || 'Attendance marked successfully!');
//       fetchMembers();
//     } catch (err) {
//       console.error('Error marking attendance:', err);
//       setError(err.response?.data?.message || 'Failed to mark attendance.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
//         <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-indigo-600" /> Mark Attendance
//       </h2>

//       {successMessage && <Message type="success">{successMessage}</Message>}
//       {error && <Message type="error">{error}</Message>}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="flex flex-col">
//           <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-700 mb-1">
//             <CalendarDaysIcon className="h-4 w-4 inline-block mr-2 text-indigo-500" /> Select Date
//           </label>
//           <input
//             type="date"
//             id="attendanceDate"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label htmlFor="attendanceType" className="block text-sm font-medium text-gray-700 mb-1">
//             <UserGroupIcon className="h-4 w-4 inline-block mr-2 text-indigo-500" /> Select Type
//           </label>
//           <select
//             id="attendanceType"
//             value={attendanceType}
//             onChange={(e) => setAttendanceType(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             disabled={isTeacher && attendanceType === 'Staff'}
//           >
//             <option value="Student">Students</option>
//             {isAdmin && <option value="Staff">Staff</option>}
//           </select>
//         </div>
//       </div>

//       {isTeacher && attendanceType === 'Student' && (
//         <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
//             <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filter Students
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             <div>
//               <label htmlFor="filterClassType" className="block text-sm font-medium text-gray-700">Class Type</label>
//               <select
//                 id="filterClassType"
//                 value={filterClassType}
//                 onChange={(e) => setFilterClassType(e.target.value)}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               >
//                 <option value="">All</option>
//                 <option value="Class">Class</option>
//                 <option value="BS">BS</option>
//               </select>
//             </div>
//             {filterClassType === 'Class' && (
//               <div>
//                 <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                 <input
//                   type="text"
//                   id="filterClassNumber"
//                   value={filterClassNumber}
//                   onChange={(e) => setFilterClassNumber(e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 />
//               </div>
//             )}
//             {filterClassType === 'BS' && (
//               <>
//                 <div>
//                   <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                   <input
//                     type="text"
//                     id="filterDegreeName"
//                     value={filterDegreeName}
//                     onChange={(e) => setFilterDegreeName(e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
//                   <input
//                     type="number"
//                     id="filterSemester"
//                     value={filterSemester}
//                     onChange={(e) => setFilterSemester(e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="filterMajorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
//                   <input
//                     type="text"
//                     id="filterMajorSubject"
//                     value={filterMajorSubject}
//                     onChange={(e) => setFilterMajorSubject(e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </>
//             )}
//             <div className="md:col-span-full lg:col-span-1 flex items-end">
//               <button
//                 onClick={fetchMembers}
//                 className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 shadow-sm flex items-center justify-center"
//               >
//                 <FunnelIcon className="h-5 w-5 mr-2" /> Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <Loader />
//       ) : members.length === 0 ? (
//         <Message type="info">No {attendanceType.toLowerCase()} members found for attendance marking.</Message>
//       ) : (
//         <form onSubmit={handleSubmitAttendance} className="mt-8">
//           <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     CNIC
//                   </th>
//                   {attendanceType === 'Student' && (
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Class/Degree
//                     </th>
//                   )}
//                   {attendanceType === 'Staff' && (
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Designation
//                     </th>
//                   )}
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {members.map(member => (
//                   <tr key={member._id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {member.name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {member.cnic}
//                     </td>
//                     {attendanceType === 'Student' && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {member.class === 'Class' ? `Class ${member.classNumber}` : `${member.degreeName} Sem ${member.semester}`}
//                       </td>
//                     )}
//                     {attendanceType === 'Staff' && (
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {member.designation}
//                       </td>
//                     )}
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       <select
//                         value={attendanceStatuses[member._id]}
//                         onChange={(e) => handleStatusChange(member._id, e.target.value)}
//                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                       >
//                         <option value="Present">Present</option>
//                         <option value="Absent">Absent</option>
//                         <option value="Leave">Leave</option>
//                         <option value="Holiday">Holiday</option>
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-8 flex justify-end">
//             <button
//               type="submit"
//               className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-md flex items-center"
//               disabled={loading}
//             >
//               <CheckIcon className="h-5 w-5 mr-2" /> Mark Attendance
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };

// export default AttendanceMarking;



// src/screens/AttendanceMarkingScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  CalendarDaysIcon, UserGroupIcon, FunnelIcon, CheckIcon, XMarkIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const AttendanceMarking = () => {
  const { currentUser: user } = useContext(UserContext);

  const [attendanceType, setAttendanceType] = useState('Student'); // 'Student' or 'Staff'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState([]); // Students or Staff members to mark attendance for
  const [attendanceStatuses, setAttendanceStatuses] = useState({}); // { userId: 'Present'/'Absent'/'Leave' }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Student-specific filters
  const [filterClassType, setFilterClassType] = useState('');
  const [filterClassNumber, setFilterClassNumber] = useState('');
  const [filterDegreeName, setFilterDegreeName] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterMajorSubject, setFilterMajorSubject] = useState('');

  // Staff-specific filter
  const [filterRole, setFilterRole] = useState('');

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      const params = {};

      if (attendanceType === 'Student') {
        endpoint = '/attendance/students';
        if (isTeacher || isAdmin) {
          if (filterClassType) params.classType = filterClassType;
          if (filterClassNumber) params.classNumber = filterClassNumber;
          if (filterDegreeName) params.degreeName = filterDegreeName;
          if (filterSemester) params.semester = filterSemester;
          if (filterMajorSubject) params.majorSubject = filterMajorSubject;
        }
      } else { // Staff
        endpoint = '/attendance/staff';
        if (isAdmin && filterRole) {
          params.role = filterRole;
        }
      }

      console.log('Fetching members with params:', params);

      const { data } = await api.get(endpoint, { params });
      
      console.log('API Response data:', data);

      let fetchedMembers = [];
      if (Array.isArray(data)) {
        fetchedMembers = data;
      } else if (data && Array.isArray(data.records)) {
        console.warn("Received an object with 'records' instead of an array. Please check your backend routing.");
        fetchedMembers = data.records;
      } else {
        setError('Received invalid data from the server.');
      }

      if (fetchedMembers.length > 0) {
        setMembers(fetchedMembers);
        const initialStatuses = {};
        fetchedMembers.forEach(member => {
          initialStatuses[member._id] = 'Present';
        });
        setAttendanceStatuses(initialStatuses);
      } else {
        setMembers([]);
        setAttendanceStatuses({});
      }

    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.response?.data?.message || 'Failed to fetch members.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [attendanceType, isTeacher, isAdmin, filterClassType, filterClassNumber, filterDegreeName, filterSemester, filterMajorSubject, filterRole]);

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user, attendanceType, fetchMembers]);

  const handleStatusChange = (userId, status) => {
    setAttendanceStatuses(prev => ({ ...prev, [userId]: status }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    if (!Array.isArray(members)) {
        setError('No members to submit attendance for.');
        setLoading(false);
        return;
    }

    const recordsToSubmit = members.map(member => ({
      userId: member._id,
      status: attendanceStatuses[member._id],
      reason: attendanceStatuses[member._id] === 'Leave' || attendanceStatuses[member._id] === 'Absent' ? '' : undefined,
      ...(attendanceType === 'Student' && {
        studentClass: member.class,
        studentClassNumber: member.classNumber,
        studentSemester: member.semester,
        studentDegreeName: member.degreeName,
        studentMajorSubject: member.majorSubject,
      }),
    }));

    try {
      const { data } = await api.post('/attendance/mark', {
        date: selectedDate,
        attendanceRecords: recordsToSubmit,
        type: attendanceType,
      });
      setSuccessMessage(data.message || 'Attendance marked successfully!');
      fetchMembers();
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceTypeChange = (e) => {
    setAttendanceType(e.target.value);
    setFilterClassType('');
    setFilterClassNumber('');
    setFilterDegreeName('');
    setFilterSemester('');
    setFilterMajorSubject('');
    setFilterRole('');
    setMembers([]);
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
        <ClipboardDocumentCheckIcon className="h-8 w-8 mr-3 text-indigo-600" /> Mark Attendance
      </h2>

      {successMessage && <Message type="success">{successMessage}</Message>}
      {error && <Message type="error">{error}</Message>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col">
          <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-700 mb-1">
            <CalendarDaysIcon className="h-4 w-4 inline-block mr-2 text-indigo-500" /> Select Date
          </label>
          <input
            type="date"
            id="attendanceDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="attendanceType" className="block text-sm font-medium text-gray-700 mb-1">
            <UserGroupIcon className="h-4 w-4 inline-block mr-2 text-indigo-500" /> Select Type
          </label>
          <select
            id="attendanceType"
            value={attendanceType}
            onChange={handleAttendanceTypeChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isTeacher && attendanceType === 'Staff'}
          >
            <option value="Student">Students</option>
            {isAdmin && <option value="Staff">Staff</option>}
          </select>
        </div>
      </div>

      {/* Conditional Filtering for Students */}
      {attendanceType === 'Student' && (isTeacher || isAdmin) && (
        <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filter Students
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterClassType" className="block text-sm font-medium text-gray-700">Class Type</label>
              <select
                id="filterClassType"
                value={filterClassType}
                onChange={(e) => setFilterClassType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="Class">Class</option>
                <option value="BS">BS</option>
              </select>
            </div>
            {filterClassType === 'Class' && (
              <div>
                <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
                <select
                  id="filterClassNumber"
                  value={filterClassNumber}
                  onChange={(e) => setFilterClassNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All</option>
                  {[...Array(12).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}
            {filterClassType === 'BS' && (
              <>
                <div>
                  <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                  <input
                    type="text"
                    id="filterDegreeName"
                    value={filterDegreeName}
                    onChange={(e) => setFilterDegreeName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    id="filterSemester"
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">All</option>
                    {[...Array(7).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filterMajorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
                  <input
                    type="text"
                    id="filterMajorSubject"
                    value={filterMajorSubject}
                    onChange={(e) => setFilterMajorSubject(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-full lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={fetchMembers}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 shadow-sm flex items-center justify-center"
              >
                <FunnelIcon className="h-5 w-5 mr-2" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Filtering for Staff */}
      {attendanceType === 'Staff' && isAdmin && (
        <div className="bg-gray-50 p-4 rounded-md shadow-inner mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" /> Filter Staff
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterRole" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="md:col-span-full lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={fetchMembers}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-200 shadow-sm flex items-center justify-center"
              >
                <FunnelIcon className="h-5 w-5 mr-2" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : members.length === 0 ? (
        <Message type="info">No {attendanceType.toLowerCase()} members found for attendance marking.</Message>
      ) : (
        <form onSubmit={handleSubmitAttendance} className="mt-8">
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNIC
                  </th>
                  {attendanceType === 'Student' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class/Degree
                    </th>
                  )}
                  {attendanceType === 'Staff' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.cnic}
                    </td>
                    {attendanceType === 'Student' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.class === 'Class' ? `Class ${member.classNumber}` : `${member.degreeName} Sem ${member.semester}`}
                      </td>
                    )}
                    {attendanceType === 'Staff' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.designation}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={attendanceStatuses[member._id] || 'Present'}
                        onChange={(e) => handleStatusChange(member._id, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                        <option value="Holiday">Holiday</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-md flex items-center"
              disabled={loading}
            >
              <CheckIcon className="h-5 w-5 mr-2" /> Mark Attendance
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AttendanceMarking;