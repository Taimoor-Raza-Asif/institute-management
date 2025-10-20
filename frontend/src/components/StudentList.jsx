// // src/components/StudentList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import api from '../api';
// import Modal from './Modal';
// import StudentForm from './StudentForm';
// import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon, EllipsisVerticalIcon, UserCircleIcon} from '@heroicons/react/24/outline';
// import {
//   ArrowPathIcon, // For Promotion
//   ArrowUturnLeftIcon, // For Demotion
//   ArrowLongRightIcon, // For Class/Semester Promotion
//   ArrowLongLeftIcon,
// } from '@heroicons/react/24/outline';
// import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

// // Define degree years mapping (used in both StudentList and StudentForm)
// const degreeYearsMap = {
//   'Islamiyat': 4,
//   'Software Engineering': 4,
//   'Honors': 2,
//   '-': null
// };

// // Define months array (used in both StudentList and FeeForm)
// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// const StudentList = () => {
//   const [students, setStudents] = useState([]);
//   const [allFees, setAllFees] = useState([]);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [isStudentFormViewMode, setIsStudentFormViewMode] = useState(false);

//   // --- Filter States ---
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // New state for debounced search
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   const [filterClassType, setFilterClassType] = useState('');
//   const [filterClassNumber, setFilterClassNumber] = useState('');
//   const [filterMajorSubject, setFilterMajorSubject] = useState('');
//   const [filterDegreeName, setFilterDegreeName] = useState('');
//   const [filterSemester, setFilterSemester] = useState('');
//   const [filterStudentStatus, setFilterStudentStatus] = useState('Regular'); // Default to 'Regular'

//   const currentMonthName = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear().toString();
//   const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
//   const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

//   const [filterGender, setFilterGender] = useState('all');
//   const [currentUser, setCurrentUser] = useState(null);

//   const generateYearOptions = useCallback(() => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let i = currentYear - 5; i <= currentYear + 5; i++) {
//       years.push(i.toString());
//     }
//     return years;
//   }, []);


//   // Helper to build query parameters for student filters
//   const buildStudentFilterQueryParams = useCallback(() => {
//     const params = new URLSearchParams();
//     if (debouncedSearchTerm) { // Use debounced search term
//       params.append('searchTerm', debouncedSearchTerm);
//     }
//     if (filterClassType) {
//       params.append('class', filterClassType);
//       if (filterClassType === 'Class') {
//         if (filterClassNumber) params.append('classNumber', filterClassNumber);
//         if (filterMajorSubject) params.append('majorSubject', filterMajorSubject);
//       } else if (filterClassType === 'BS') {
//         if (filterDegreeName) params.append('degreeName', filterDegreeName);
//         if (filterSemester) params.append('semester', filterSemester);
//       }
//     }
//     // Append studentStatus filter
//     if (filterStudentStatus && filterStudentStatus !== 'All Students') {
//       params.append('studentStatus', filterStudentStatus);
//     }
//     if (filterGender && filterGender !== 'all') {
//       params.append('gender', filterGender);
//     }
//     return params.toString();
//   }, [debouncedSearchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester, filterStudentStatus, filterGender]);

//   //   // Fetch students based on current filters
//   //   const fetchStudents = useCallback(async () => {
//   //     setLoading(true); // Set loading true at the start of fetch
//   //     setError(null);
//   //     try {
//   //       const queryParams = buildStudentFilterQueryParams();
//   //       const res = await api.get(`/students?${queryParams}`);
//   //       if (Array.isArray(res.data)) {
//   //         setStudents(res.data);
//   //       } else {
//   //         console.error("API response for students is not an array:", res.data);
//   //         setStudents([]);
//   //         setError("Received unexpected data format from server.");
//   //       }
//   //     } catch (err) {
//   //       console.error('Failed to fetch students:', err);
//   //       setStudents([]);
//   //       setError('Failed to load students. Please try again.');
//   //     } finally {
//   //       setLoading(false); // Set loading false after fetch completes (success or error)
//   //     }
//   //   }, [buildStudentFilterQueryParams]);

//   // Fetch students based on current filters and user role
//   const fetchStudents = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Students only fetch their own data
//       let endpoint = '/students';
//       if (currentUser && currentUser.role === 'student') {
//         endpoint = `/students/my-data`;
//       }

//       const queryParams = buildStudentFilterQueryParams();
//       const res = await api.get(`${endpoint}?${queryParams}`);
//       if (Array.isArray(res.data)) {
//         setStudents(res.data);
//       } else if (currentUser && currentUser.role === 'student' && res.data) {
//         // If it's a student fetching their own data, it might be a single object
//         setStudents([res.data]);
//       } else {
//         console.error("API response for students is not an array or single object:", res.data);
//         setStudents([]);
//         setError("Received unexpected data format from server.");
//       }
//     } catch (err) {
//       console.error('Failed to fetch students:', err);
//       setStudents([]);
//       setError('Failed to load students. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, [buildStudentFilterQueryParams, currentUser]); // Added currentUser to dependencies

//   // Fetch all fees (for frontend fee status calculation)
//   const fetchAllFees = useCallback(async () => {
//     try {
//       const res = await api.get('/fees');
//       if (Array.isArray(res.data)) {
//         setAllFees(res.data);
//       } else {
//         console.error("API response for all fees is not an array:", res.data);
//         setAllFees([]);
//       }
//     } catch (err) {
//       console.error('Failed to fetch all fees for filtering:', err);
//       setAllFees([]);
//     }
//   }, []);

//   // Effect to debounce the search term
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500); // 500ms debounce delay

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [searchTerm]);

//   // Effect to trigger student fetch when debounced search term or other filters change
//   //   useEffect(() => {
//   //     fetchStudents();
//   //   }, [fetchStudents]);

//   // Effect to trigger student fetch when debounced search term or other filters change
//   useEffect(() => {
//     if (currentUser) { // Only fetch if currentUser is loaded
//       fetchStudents();
//     }
//   }, [fetchStudents, currentUser]);

//   // Effect to fetch all fees on initial load
//   //   useEffect(() => {
//   //     fetchAllFees();
//   //   }, [fetchAllFees]);

//   // Effect to fetch all fees on initial load
//   useEffect(() => {
//     if (currentUser) { // Only fetch if currentUser is loaded
//       fetchAllFees();
//     }
//   }, [fetchAllFees, currentUser]);

//   useEffect(() => {
//     // Load current user from local storage
//     const userInfo = localStorage.getItem('userInfo');
//     if (userInfo) {
//       setCurrentUser(JSON.parse(userInfo));
//     }
//   }, []);

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     fetchStudents(); // Re-fetch students after any form interaction (add/edit/delete)
//     fetchAllFees(); // Re-fetch fees as student changes might affect fee status logic
//   };

//   const handleAddStudent = () => {
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (currentUser?.role !== 'admin') {
//       alert("You are not authorized to delete student records.");
//       return;
//     }

//     const confirmDelete = window.confirm('Are you sure you want to delete this student?');
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/students/${id}`);
//       fetchStudents();
//       fetchAllFees();
//     } catch (err) {
//       console.error('Failed to delete student:', err);
//       alert('Failed to delete student. Please try again.');
//     }
//   };

//   const handleEdit = (student) => {
//     setEditingStudent(student);
//     setIsStudentFormViewMode(false);
//     setModalOpen(true);
//   };

//   const handleViewStudentDetails = (student) => {
//     setEditingStudent(student);
//     setIsStudentFormViewMode(true);
//     setModalOpen(true);
//   };

//   // Reset all filters
//   const handleResetFilters = () => {
//     setSearchTerm('');
//     setFilterClassType('');
//     setFilterClassNumber('');
//     setFilterMajorSubject('');
//     setFilterDegreeName('');
//     setFilterSemester('');
//     setFilterGender('all');
//     setFilterStudentStatus('Regular');
//     setFilterFeeMonth(currentMonthName);
//     setFilterFeeYear(currentYear);
//   };


//   const getFilteredStudents = () => {
//     const targetMonthYear = `${filterFeeMonth} ${filterFeeYear}`;
//     const paidStudentIdsForMonth = new Set(
//       allFees
//         .filter(fee => fee.month === targetMonthYear && fee.studentId?._id)
//         .map(fee => fee.studentId._id)
//     );
//     return students.map(student => ({
//       ...student,
//       // Add a temporary property to indicate if paid for the selected month
//       isPaidForSelectedMonth: paidStudentIdsForMonth.has(student._id)
//     }));
//   };


//   const handlePromoteStudent = async (studentId) => {
//     if (!window.confirm('Are you sure you want to promote this student?')) return;
//     try {
//       await api.put(`/students/${studentId}/promote`);
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to promote student:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to promote student.');
//     }
//   };

//   const handleDemoteStudent = async (studentId) => {
//     if (!window.confirm('Are you sure you want to demote this student?')) return;
//     try {
//       await api.put(`/students/${studentId}/demote`);
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to demote student:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to demote student.');
//     }
//   };

//   const handlePromoteClass = async () => {
//     if (!filterClassNumber || !window.confirm(`Are you sure you want to promote all students from Class ${filterClassNumber}?`)) return;
//     try {
//       await api.put(`/students/promote-class`, { classNumber: filterClassNumber });
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to promote class:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to promote class.');
//     }
//   };

//   const handleDemoteClass = async () => {
//     if (!filterClassNumber || !window.confirm(`Are you sure you want to demote all students from Class ${filterClassNumber}?`)) return;
//     try {
//       await api.put(`/students/demote-class`, { classNumber: filterClassNumber });
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to demote class:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to demote class.');
//     }
//   };



//   const handlePromoteStudentSemester = async (studentId) => {
//     if (!window.confirm('Are you sure you want to promote this student to the next semester?')) return;
//     try {
//       await api.put(`/students/${studentId}/promote-semester`);
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to promote student semester:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to promote student semester.');
//     }
//   };

//   const handleDemoteStudentSemester = async (studentId) => {
//     if (!window.confirm('Are you sure you want to demote this student to the previous semester?')) return;
//     try {
//       await api.put(`/students/${studentId}/demote-semester`);
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to demote student semester:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to demote student semester.');
//     }
//   };

//   const handlePromoteSemester = async () => {
//     if (!filterDegreeName || !filterSemester || !window.confirm(`Are you sure you want to promote all students from semester ${filterSemester} in ${filterDegreeName}?`)) return;
//     try {
//       await api.put(`/students/promote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) });
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to promote semester:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to promote semester.');
//     }
//   };

//   const handleDemoteSemester = async () => {
//     if (!filterDegreeName || !filterSemester || !window.confirm(`Are you sure you want to demote all students from semester ${filterSemester} in ${filterDegreeName}?`)) return;
//     try {
//       await api.put(`/students/demote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) });
//       fetchStudents();
//     } catch (err) {
//       console.error('Failed to demote semester:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Failed to demote semester.');
//     }
//   };



//   const displayedStudents = getFilteredStudents();

//   // Skeleton Row Component for loading state
//   const SkeletonRow = ({ columns }) => (
//     <tr className="text-center bg-gray-100 animate-pulse">
//       {[...Array(columns)].map((_, i) => (
//         <td key={i} className="p-2 border border-white">
//           <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
//         </td>
//       ))}
//     </tr>
//   );

//   // --- Authorization Checks ---
//   const canAddStudent = currentUser?.role === 'admin';
//   const canEditStudent = (currentUser?.role === 'admin' || (currentUser?.role === 'teacher' && currentUser?.editModeEnabled));
//   const canDeleteStudent = currentUser?.role === 'admin';
//   const canViewAllStudents = (currentUser?.role === 'admin' || currentUser?.role === 'teacher');
//   const isStudentRole = currentUser?.role === 'student';

//   if (!currentUser) {
//     return <div className="p-6 text-center text-lg text-gray-600">Please log in to view student records.</div>;
//   }

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-4">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Students Management</h1>
//       <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//         {/* <div className="flex items-center space-x-3 mb-3"> */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//           {!isStudentRole && (
//             <div className="relative w-full sm:w-1/2 lg:w-2/3">
//               <input
//                 type="text"
//                 id="searchTerm"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                 placeholder="Search by Name or CNIC..."
//               />
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//             </div>
//           )}
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             {canAddStudent && (
//               <button onClick={handleAddStudent} className="flex items-center justify-center bg-green-600 font-semibold text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto">
//                 <PlusIcon className="h-5 w-5 mr-2" /> New Student
//               </button>
//             )}
//             <button
//               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//               className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
//             >
//               <FunnelIcon className="h-5 w-5 mr-2" />
//               {showAdvancedFilters ? 'Hide' : 'Filters'}
//             </button>
//           </div>

//         </div>

//         {showAdvancedFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-300">
//             <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               {/* Student Status Filter */}
//               <div>
//                 <label htmlFor="filterStudentStatus" className="block text-sm font-medium text-gray-700">Student Status</label>
//                 <select
//                   id="filterStudentStatus"
//                   value={filterStudentStatus}
//                   onChange={(e) => setFilterStudentStatus(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 >
//                   <option value="All Students">All Students</option>
//                   <option value="Regular">Regular</option>
//                   <option value="Withdrawn">Withdrawn</option>
//                   <option value="Expelled">Expelled</option>
//                   <option value="Graduated">Graduated</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="filterGender" className="block text-sm font-medium text-gray-700">Gender</label>
//                 <select
//                   id="filterGender"
//                   value={filterGender}
//                   onChange={(e) => setFilterGender(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 >
//                   <option value="all">All</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="filterClassType" className="block text-sm font-medium text-gray-700">Class Type</label>
//                 <select
//                   id="filterClassType"
//                   value={filterClassType}
//                   onChange={(e) => {
//                     setFilterClassType(e.target.value);
//                     setFilterClassNumber('');
//                     setFilterMajorSubject('');
//                     setFilterDegreeName('');
//                     setFilterSemester('');
//                   }}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 >
//                   <option value="">All Class Types</option>
//                   <option value="Class">Class (1-12)</option>
//                   <option value="BS">BS Level</option>
//                 </select>
//               </div>

//               {filterClassType === 'Class' && (
//                 <>
//                   <div>
//                     <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                     <select
//                       id="filterClassNumber"
//                       value={filterClassNumber}
//                       onChange={(e) => setFilterClassNumber(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                     >
//                       <option value="">All Classes</option>
//                       {[...Array(12)].map((_, i) => (
//                         <option key={i + 1} value={`${i + 1}`}>{`${i + 1}`}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="filterMajorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
//                     <select
//                       id="filterMajorSubject"
//                       value={filterMajorSubject}
//                       onChange={(e) => setFilterMajorSubject(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                     >
//                       <option value="">All Subjects</option>
//                       <option value="Arts">Arts</option>
//                       <option value="Science">Science</option>
//                     </select>
//                   </div>
//                 </>
//               )}

//               {filterClassType === 'BS' && (
//                 <>
//                   <div>
//                     <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                     <select
//                       id="filterDegreeName"
//                       value={filterDegreeName}
//                       onChange={(e) => setFilterDegreeName(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                     >
//                       <option value="">All Degrees</option>
//                       <option value="Islamiyat">Islamiyat</option>
//                       <option value="Software Engineering">Software Engineering</option>
//                       <option value="Honors">Honors</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
//                     <select
//                       id="filterSemester"
//                       value={filterSemester}
//                       onChange={(e) => setFilterSemester(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                     >
//                       <option value="">All Semesters</option>
//                       {[...Array(8)].map((_, i) => (
//                         <option key={i + 1} value={i + 1}>{i + 1}</option>
//                       ))}
//                     </select>
//                   </div>
//                   {filterDegreeName && (
//                     <div>
//                       <p className="block text-sm font-medium text-gray-700">Degree Years:</p>
//                       <p className="mt-1 p-2 text-gray-900 font-bold">{degreeYearsMap[filterDegreeName] || '-'} years</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               <div>
//                 <label htmlFor="filterFeeYear" className="block text-sm font-medium text-gray-700">Fee Year</label>
//                 <select
//                   id="filterFeeYear"
//                   value={filterFeeYear}
//                   onChange={(e) => { setFilterFeeYear(e.target.value); }}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 >
//                   {generateYearOptions().map(year => (
//                     <option key={year} value={year}>{year}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label htmlFor="filterFeeMonth" className="block text-sm font-medium text-gray-700">Fee Month</label>
//                 <select
//                   id="filterFeeMonth"
//                   value={filterFeeMonth}
//                   onChange={(e) => setFilterFeeMonth(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//                 >
//                   <option value="">All Months</option>
//                   {months.map(monthName => (
//                     <option key={monthName} value={monthName}>{monthName}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-2">
//               {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && filterClassNumber && filterClassType === 'Class' && (
//                 <>
//                   <button
//                     onClick={handlePromoteClass}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
//                   >
//                     <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5" />
//                     Promote Class {filterClassNumber}
//                   </button>
//                   <button
//                     onClick={handleDemoteClass}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
//                   >
//                     <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5" />
//                     Demote Class {filterClassNumber}
//                   </button>
//                 </>
//               )}
//               {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && (filterClassType === 'BS' && filterDegreeName && filterSemester) && (
//                 <>
//                   <button
//                     onClick={handlePromoteSemester}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
//                   >
//                     <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5" />
//                     Promote Semester {filterSemester} ({filterDegreeName})
//                   </button>
//                   <button
//                     onClick={handleDemoteSemester}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
//                   >
//                     <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5" />
//                     Demote Semester {filterSemester} ({filterDegreeName})
//                   </button>
//                 </>
//               )}
//               <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
//             </div>
//           </div>
//         )}
//       </div>


//       {/* Table Container with minimum height */}
//       <div className=" min-h-[400px] relative"> {/* Added min-h-[400px] */}
//         {loading && ( // Loading overlay
//           <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
//             <div className="text-center text-lg text-gray-700">Loading students...</div>
//           </div>
//         )}
//         {error && !loading && ( // Error message
//           <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-10 border border-red-400 text-red-700">
//             <div className="text-center text-lg">{error}</div>
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow-md md:overflow-visible lg:overflow-visible sm:overflow-x-auto">
//           <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-auto">
//             <thead className="bg-green-600 text-white rounded-md">
//               <tr>
//                 {/* Fixed widths for all columns */}
//                 <th className="p-2 border border-white w-44">Student Name</th>
//                 <th className="p-2 border border-white w-44">Father Name</th>
//                 <th className="p-2 border border-white w-32">CNIC</th>
//                 {/* <th className="p-2 border border-white w-48">Address</th> */}
//                 <th className="p-2 border border-white w-36">Guardian Contact</th>
//                 <th className="p-2 border border-white w-14">Class</th>
//                 <th className="p-2 border border-white w-36">Major/Degree</th>
//                 <th className="p-2 border border-white w-14">Semester</th>
//                 <th className="p-2 border border-white w-32">Fee Per Month</th>
//                 {/* <th className="p-2 border border-white w-32">Fee Status</th> */}
//                 <th className="p-2 border border-white">Fee Status ({filterFeeMonth || 'Selected'} {filterFeeYear || 'Year'})</th>
//                 {(canEditStudent || canDeleteStudent) && (
//                   <th className="p-2 border border-white w-36">Actions</th>
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? ( // Show skeleton rows when loading
//                 [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={17} />)
//               ) : Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
//                 displayedStudents.map((s, index) => (
//                   <tr
//                     key={s._id}
//                     className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}
//                   >
//                     {/* <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-black-500" title={s.name}>{s.name}</td> */}
//                     <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
//                       <div className="flex items-center">
//                         {s.profilePictureUrl ? (
//                           // If profilePictureUrl exists, render the <img> tag
//                           <img
//                             src={`http://localhost:5000${s.profilePictureUrl}`}
//                             alt={`${s.name}'s Profile`}
//                             className="h-8 w-8 rounded-full object-cover mr-2"
//                             onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=NA'; }}
//                           />
//                         ) : (
//                           // If not, render the placeholder icon
//                           <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
//                         )}
//                         <span>{s.name}</span>
//                       </div>
//                     </td>
//                     <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-gray-500" title={s.fatherName}>{s.fatherName}</td>
//                     <td className="border border-white p-2 w-32 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-gray-500" title={s.cnic}>{s.cnic || '-'}</td>
//                     {/* <td className="border border-white p-2 w-28 overflow-hidden whitespace-nowrap text-ellipsis" title={s.address}>{s.address || '-'}</td> */}
//                     {/* <td
//                     className="p-2 w-48 overflow-hidden break-words whitespace-nowrap ext-ellipsis line-clamp-1"
//                     title={s.address}
//                   >
//                     {s.address || '-'}
//                   </td> */}

//                     <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-gray-500" title={s.guardianContact}>{s.guardianContact}</td>
//                     <td className="border border-white p-2 w-28  text-base text-gray-500">
//                       {s.class === 'Class' ? s.classNumber || '-' : s.class}
//                       {/* {console.log('Student Class:', s.class, 'Class Number:', s.classNumber)} */}
//                     </td>
//                     <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-gray-500" title={s.class === 'BS' ? s.degreeName : s.majorSubject}>
//                       {s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}
//                     </td>
//                     <td className="border border-white p-2 w-28 text-base text-gray-500">
//                       {s.class === 'BS' ? s.semester || '-' : '-'}
//                     </td>
//                     <td className="border border-white p-2 w-32  text-base text-gray-500">{s.feePerMonth || '-'}</td>
//                     <td className={`border border-white p-2 w-32 font-semibold
//                       ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' :
//                         s.feeStatus === 'Partial Paid' ? 'bg-orange-500 text-white' :
//                           'bg-red-500 text-white'}
//                   `}>
//                       {s.feeStatus}
//                     </td>
//                     <td className="border border-white p-2 w-36 space-x-2 flex justify-center items-center">
//                       <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Student Details">
//                         <EyeIcon className="h-5 w-5" />
//                       </button>
//                       {/* Action Dropdown Menu */}
//                       <Menu as="div" className="relative z-50 inline-block text-left ml-2">
//                         <div>
//                           <MenuButton className="flex items-center text-gray-400 hover:text-gray-600">
//                             <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
//                           </MenuButton>
//                         </div>
//                         <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                           <div className="py-1">
//                             {/* Class Promotion/Demotion Buttons */}
//                             {currentUser?.role === 'admin' && s.class === 'Class' && s.classNumber >= 1 && s.classNumber <= 12 && (
//                               <>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handlePromoteStudent(s._id)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <ArrowPathIcon className="mr-3 h-5 w-5 text-green-600 group-hover:text-green-900" aria-hidden="true" />
//                                       Promote Class
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handleDemoteStudent(s._id)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <ArrowUturnLeftIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
//                                       Demote Class
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                               </>
//                             )}
//                             {/* Semester Promotion/Demotion Buttons */}
//                             {currentUser?.role === 'admin' && s.class === 'BS' && s.semester >= 1 && s.semester <= 8 && (
//                               <>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handlePromoteStudentSemester(s._id)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <ArrowPathIcon className="mr-3 h-5 w-5 text-green-600 group-hover:text-green-900" aria-hidden="true" />
//                                       Promote Semester
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handleDemoteStudentSemester(s._id)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <ArrowUturnLeftIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
//                                       Demote Semester
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                               </>
//                             )}
//                             {/* Edit and Delete Buttons */}
//                             {currentUser?.role === 'admin' && (
//                               <>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handleEdit(s)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <PencilIcon className="mr-3 h-5 w-5 text-yellow-600 group-hover:text-yellow-900" aria-hidden="true" />
//                                       Edit
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                                 <MenuItem>
//                                   {({ focus }) => (
//                                     <button
//                                       onClick={() => handleDelete(s._id)}
//                                       className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
//                                     >
//                                       <TrashIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
//                                       Delete
//                                     </button>
//                                   )}
//                                 </MenuItem>
//                               </>
//                             )}
//                           </div>
//                         </MenuItems>
//                       </Menu>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="17" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <Modal isOpen={modalOpen} onClose={handleCloseModal}>
//         <StudentForm
//           editingStudent={editingStudent}
//           fetchStudents={fetchStudents}
//           onClose={handleCloseModal}
//           isViewMode={isStudentFormViewMode}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default StudentList;



// src/components/StudentList.jsx
import React, { useEffect, useState, useCallback, useContext } from 'react';
import api from '../api';
import Modal from './Modal';
import StudentForm from './StudentForm';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon, EllipsisVerticalIcon, UserCircleIcon} from '@heroicons/react/24/outline';
import {
  ArrowPathIcon, // For Promotion
  ArrowUturnLeftIcon, // For Demotion
  ArrowLongRightIcon, // For Class/Semester Promotion
  ArrowLongLeftIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { UserContext } from '../App'; // Import UserContext
// Assuming you have a Loader component available, otherwise uncomment the note below
// import Loader from './Loader'; // <-- UNCOMMENT IF YOU HAVE THIS COMPONENT

// Define months array (used in both StudentList and FeeForm)
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StudentList = () => {
  const { currentUser } = useContext(UserContext); // Use context
  const [students, setStudents] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isStudentFormViewMode, setIsStudentFormViewMode] = useState(false);

  // --- Dynamic Academic Structure State ---
  const [academicStructure, setAcademicStructure] = useState(null);
  const [structureLoading, setStructureLoading] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter States - updated to use generic fields
  const [filterClassType, setFilterClassType] = useState('');
  const [filterClassIdentifier, setFilterClassIdentifier] = useState(''); // For Almiya/generic class names
  const [filterClassNumber, setFilterClassNumber] = useState('');
  const [filterMajorSubject, setFilterMajorSubject] = useState('');
  const [filterDegreeName, setFilterDegreeName] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStudentStatus, setFilterStudentStatus] = useState('Regular');

  const currentMonthName = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
  const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

  const [filterGender, setFilterGender] = useState('all');

  const generateYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i.toString());
    }
    return years;
  }, []);

  // --- NEW: Fetch Academic Structure ---
  const fetchAcademicStructure = useCallback(async () => {
    setStructureLoading(true);
    try {
      const { data } = await api.get('/academic-structure');
      setAcademicStructure(data.classTypes);
    } catch (err) {
      console.error('Failed to fetch academic structure:', err);
      setError('Failed to load academic structure for filters.');
    } finally {
      setStructureLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAcademicStructure();
    }
  }, [currentUser, fetchAcademicStructure]);


  // Helper to build query parameters for student filters
  const buildStudentFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.append('searchTerm', debouncedSearchTerm);
    }
    if (filterClassType) {
      params.append('class', filterClassType);
      
      // Dynamic Filter Logic based on Type
      if (['Class', 'Almiya'].includes(filterClassType)) {
        if (filterClassNumber) params.append('classNumber', filterClassNumber);
        if (filterMajorSubject) params.append('majorSubject', filterMajorSubject);
      } else if (filterClassType === 'BS') {
        if (filterDegreeName) params.append('degreeName', filterDegreeName);
        if (filterSemester) params.append('semester', filterSemester);
      }
      // Hifaz requires no further academic filters
    }

    if (filterStudentStatus && filterStudentStatus !== 'All Students') {
      params.append('studentStatus', filterStudentStatus);
    }
    if (filterGender && filterGender !== 'all') {
      params.append('gender', filterGender);
    }
    return params.toString();
  }, [debouncedSearchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester, filterStudentStatus, filterGender]);

  // Fetch students based on current filters and user role
  const fetchStudents = useCallback(async () => {
    if (structureLoading) return; // Wait for structure to load
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/students';
      if (currentUser && currentUser.role === 'student') {
        endpoint = `/students/my-data/${currentUser.profileId}`; // Use direct profile ID
      }

      const queryParams = buildStudentFilterQueryParams();
      const res = await api.get(`${endpoint}?${queryParams}`);
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else if (currentUser && currentUser.role === 'student' && res.data) {
        setStudents([res.data]);
      } else {
        console.error("API response for students is not an array or single object:", res.data);
        setStudents([]);
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buildStudentFilterQueryParams, currentUser, structureLoading]);

  // Fetch all fees (for frontend fee status calculation)
  const fetchAllFees = useCallback(async () => {
    try {
      const res = await api.get('/fees');
      if (Array.isArray(res.data)) {
        setAllFees(res.data);
      } else {
        console.error("API response for all fees is not an array:", res.data);
        setAllFees([]);
      }
    } catch (err) {
      console.error('Failed to fetch all fees for filtering:', err);
      setAllFees([]);
    }
  }, []);

  // Effect to debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Effect to trigger student fetch when filters/search/structure changes
  useEffect(() => {
    if (currentUser && !structureLoading) {
      fetchStudents();
      fetchAllFees(); // Also re-fetch fees when filters change to refresh fee status
    }
  }, [fetchStudents, fetchAllFees, currentUser, structureLoading]);


  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    setIsStudentFormViewMode(false);
    fetchStudents();
    fetchAllFees();
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentFormViewMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (currentUser?.role !== 'admin') {
      alert("You are not authorized to delete student records.");
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
      fetchAllFees();
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsStudentFormViewMode(false);
    setModalOpen(true);
  };

  const handleViewStudentDetails = (student) => {
    setEditingStudent(student);
    setIsStudentFormViewMode(true);
    setModalOpen(true);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterClassType('');
    setFilterClassNumber('');
    setFilterClassIdentifier('');
    setFilterMajorSubject('');
    setFilterDegreeName('');
    setFilterSemester('');
    setFilterGender('all');
    setFilterStudentStatus('Regular');
    setFilterFeeMonth(currentMonthName);
    setFilterFeeYear(currentYear);
  };

  const getFilteredStudents = () => {
    const targetMonthYear = `${filterFeeMonth} ${filterFeeYear}`;
    const paidStudentIdsForMonth = new Set(
      allFees
        .filter(fee => fee.month === targetMonthYear && fee.studentId?._id)
        .map(fee => fee.studentId._id)
    );
    return students.map(student => ({
      ...student,
      // Add a temporary property to indicate if paid for the selected month
      isPaidForSelectedMonth: paidStudentIdsForMonth.has(student._id)
    }));
  };

  const handlePromoteStudent = async (studentId, studentClass) => {
    if (!window.confirm(`Are you sure you want to promote this student to the next ${studentClass === 'BS' ? 'Semester' : 'Class/Grade'}?`)) return;
    try {
        let endpoint = '';
        if (studentClass === 'BS') {
            endpoint = `/students/${studentId}/promote-semester`;
        } else {
            endpoint = `/students/${studentId}/promote`;
        }
        await api.put(endpoint);
        fetchStudents();
    } catch (err) {
        console.error('Failed to promote student:', err.response?.data || err.message);
        alert(err.response?.data?.message || 'Failed to promote student.');
    }
  };
  
  const handleDemoteStudent = async (studentId, studentClass) => {
    if (!window.confirm(`Are you sure you want to demote this student to the previous ${studentClass === 'BS' ? 'Semester' : 'Class/Grade'}?`)) return;
    try {
        let endpoint = '';
        if (studentClass === 'BS') {
            endpoint = `/students/${studentId}/demote-semester`;
        } else {
            endpoint = `/students/${studentId}/demote`;
        }
        await api.put(endpoint);
        fetchStudents();
    } catch (err) {
        console.error('Failed to demote student:', err.response?.data || err.message);
        alert(err.response?.data?.message || 'Failed to demote student.');
    }
  };

  const handlePromoteClass = async (endpoint, payload, message) => {
    if (!window.confirm(`Are you sure you want to promote all students: ${message}?`)) return;
    try {
      await api.put(endpoint, payload);
      fetchStudents();
    } catch (err) {
      console.error('Failed to promote class/semester:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to promote class/semester.');
    }
  };

  const handleDemoteClass = async (endpoint, payload, message) => {
    if (!window.confirm(`Are you sure you want to demote all students: ${message}?`)) return;
    try {
      await api.put(endpoint, payload);
      fetchStudents();
    } catch (err) {
      console.error('Failed to demote class/semester:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to demote class/semester.');
    }
  };


  const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
  const selectedClassConfig = getAcademicConfig(filterClassType);
  const selectedDegreeConfig = filterClassType === 'BS' ? selectedClassConfig : null;

  const displayedStudents = getFilteredStudents();

  // --- Authorization Checks ---
  const canAddStudent = currentUser?.role === 'admin' || currentUser?.role === 'accountant';
  const canEditStudent = (currentUser?.role === 'admin' || (currentUser?.role === 'teacher' && currentUser?.editModeEnabled) || currentUser?.role === 'accountant');
  const canDeleteStudent = currentUser?.role === 'admin';
  const isStudentRole = currentUser?.role === 'student';

  // Skeleton Row Component for loading state
  const SkeletonRow = ({ columns }) => (
    <tr className="text-center bg-gray-100 animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-2 border border-white">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
        </td>
      ))}
    </tr>
  );

  if (!currentUser) {
    return <div className="p-6 text-center text-lg text-gray-600">Please log in to view student records.</div>;
  }
  
  // MODIFIED LOADING BLOCK: Check structure loading and show a simple message
  if (structureLoading) return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-4 min-h-[400px] relative flex justify-center items-center">
          <div className="text-xl text-indigo-600 animate-pulse">Loading Academic Structure...</div>
      </div>
  );


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-center text-green-800 mb-14">Students Management</h1>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        {/* Search and Main Buttons (Unchanged) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          {!isStudentRole && (
            <div className="relative w-full sm:w-1/2 lg:w-2/3">
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search by Name or CNIC..."
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {canAddStudent && (
              <button onClick={handleAddStudent} className="flex items-center justify-center bg-green-600 font-semibold text-white px-5 py-2 rounded-lg hover:bg-green-700 text-xs transition duration-200 shadow-md w-full sm:w-auto">
                <PlusIcon className="h-5 w-5 mr-2" /> New Student
              </button>
            )}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 text-xs rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filters (MODIFIED) */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              {/* Student Status Filter (Unchanged) */}
              <div>
                <label htmlFor="filterStudentStatus" className="block text-sm font-medium text-gray-700">Student Status</label>
                <select
                  id="filterStudentStatus"
                  value={filterStudentStatus}
                  onChange={(e) => setFilterStudentStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="All Students">All Students</option>
                  <option value="Regular">Regular</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Expelled">Expelled</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              {/* Gender Filter (Unchanged) */}
              <div>
                <label htmlFor="filterGender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  id="filterGender"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Class Type Filter (Dynamic) */}
              <div>
                <label htmlFor="filterClassType" className="block text-sm font-medium text-gray-700">Class Type</label>
                <select
                  id="filterClassType"
                  value={filterClassType}
                  onChange={(e) => {
                    setFilterClassType(e.target.value);
                    setFilterClassNumber('');
                    setFilterMajorSubject('');
                    setFilterDegreeName('');
                    setFilterSemester('');
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All Class Types</option>
                  {academicStructure?.map(type => (
                      <option key={type.slug} value={type.slug}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Filters for Class/Almiya */}
              {['Class', 'Almiya'].includes(filterClassType) && selectedClassConfig && (
                <>
                  <div>
                    <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">{selectedClassConfig.name} Class/Grade</label>
                    <select
                      id="filterClassNumber"
                      value={filterClassNumber}
                      onChange={(e) => setFilterClassNumber(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Classes</option>
                      {selectedClassConfig.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map((cls) => (
                        <option key={cls.classNumber} value={cls.classNumber}>
                            {cls.classIdentifier} ({cls.classNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  {filterClassType === 'Class' && (
                    <div>
                      <label htmlFor="filterMajorSubject" className="block text-sm font-medium text-gray-700">Major Subject (for Class)</label>
                      <select
                        id="filterMajorSubject"
                        value={filterMajorSubject}
                        onChange={(e) => setFilterMajorSubject(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                      >
                        <option value="">All Subjects</option>
                        {/* Static options for Major subject on Class type for simplicity in filter */}
                        <option value="Arts">Arts</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Conditional Filters for BS */}
              {filterClassType === 'BS' && selectedDegreeConfig && (
                <>
                  <div>
                    <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                    <select
                      id="filterDegreeName"
                      value={filterDegreeName}
                      onChange={(e) => {
                        setFilterDegreeName(e.target.value);
                        setFilterSemester('');
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Degrees</option>
                      {selectedDegreeConfig.degreeConfig?.map(degree => (
                          <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                      ))}
                    </select>
                  </div>
                  {filterDegreeName && (
                      <div>
                        <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
                        <select
                          id="filterSemester"
                          value={filterSemester}
                          onChange={(e) => setFilterSemester(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                        >
                          <option value="">All Semesters</option>
                          {Array.from({ length: selectedDegreeConfig.degreeConfig.find(d => d.degreeName === filterDegreeName)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
                              <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>
                  )}
                </>
              )}

              {/* Fee Filters (Unchanged) */}
              <div>
                <label htmlFor="filterFeeYear" className="block text-sm font-medium text-gray-700">Fee Year</label>
                <select
                  id="filterFeeYear"
                  value={filterFeeYear}
                  onChange={(e) => { setFilterFeeYear(e.target.value); }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterFeeMonth" className="block text-sm font-medium text-gray-700">Fee Month</label>
                <select
                  id="filterFeeMonth"
                  value={filterFeeMonth}
                  onChange={(e) => setFilterFeeMonth(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                >
                  <option value="">All Months</option>
                  {months.map(monthName => (
                    <option key={monthName} value={monthName}>{monthName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {/* Bulk Promotion/Demotion Buttons (MODIFIED) */}
              {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && filterClassType && ['Class', 'Almiya'].includes(filterClassType) && filterClassNumber && (
                <>
                  <button
                    onClick={() => handlePromoteClass(`/students/promote-class`, { classNumber: filterClassNumber, classType: filterClassType }, `from ${filterClassType} Class ${filterClassNumber}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out"
                  >
                    <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5" />
                    Promote {filterClassType} {filterClassNumber}
                  </button>
                  <button
                    onClick={() => handleDemoteClass(`/students/demote-class`, { classNumber: filterClassNumber, classType: filterClassType }, `from ${filterClassType} Class ${filterClassNumber}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5" />
                    Demote {filterClassType} {filterClassNumber}
                  </button>
                </>
              )}
              {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && (filterClassType === 'BS' && filterDegreeName && filterSemester) && (
                <>
                  <button
                    onClick={() => handlePromoteClass(`/students/promote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) }, `from ${filterDegreeName} Semester ${filterSemester}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out"
                  >
                    <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5" />
                    Promote Semester {filterSemester}
                  </button>
                  <button
                    onClick={() => handleDemoteClass(`/students/demote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) }, `from ${filterDegreeName} Semester ${filterSemester}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5" />
                    Demote Semester {filterSemester}
                  </button>
                </>
              )}
              <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
            </div>
          </div>
        )}
      </div>


      {/* Table Container... (Remains largely the same) */}
      <div className=" min-h-[400px] relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center text-lg text-gray-700">Loading students...</div>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-10 border border-red-400 text-red-700">
            <div className="text-center text-lg">{error}</div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md md:overflow-visible lg:overflow-visible sm:overflow-x-auto">
          <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-auto">
            <thead className="bg-green-600 text-white rounded-md">
              <tr>
                <th className="p-2 border border-white text-sm w-44">Name</th>
                <th className="p-2 border border-white text-sm w-44">F.Name</th>
                <th className="p-2 border border-white text-sm w-32">CNIC</th>
                {/* <th className="p-2 border border-white w-36">Guardian Contact</th> */}
                <th className="p-2 border border-white text-sm w-14">Type</th>
                <th className="p-2 border border-white text-sm w-14">Grade/Juz</th>
                <th className="p-2 border border-white text-sm w-36">Major/Degree</th>
                <th className="p-2 border border-white text-sm w-14">Semester</th>
                <th className="p-2 border border-white text-sm w-32">Fee/month</th>
                <th className="p-2 border border-white text-sm">Status</th>
                {(canEditStudent || canDeleteStudent) && (
                  <th className="p-2 border border-white w-36 text-sm">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={10} />) // Use the skeleton row
              ) : Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
                displayedStudents.map((s, index) => (
                  <tr
                    key={s._id}
                    className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}
                  >
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {s.profilePictureUrl ? (
                          <img
                            src={`http://localhost:5000${s.profilePictureUrl}`}
                            alt={`${s.name}'s Profile`}
                            className="h-8 w-8 rounded-full object-cover mr-2"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=NA'; }}
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                        )}
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis  text-xs text-gray-500" title={s.fatherName}>{s.fatherName}</td>
                    <td className="border border-white p-2 w-32 overflow-hidden whitespace-nowrap text-ellipsis  text-xs text-gray-500" title={s.cnic}>{s.cnic || '-'}</td>
                    {/* <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis  text-base text-gray-500" title={s.guardianContact}>{s.guardianContact}</td> */}
                    
                    {/* TYPE COLUMN */}
                    <td className="border border-white p-2 w-28  text-xs text-gray-500">
                      {s.class}
                    </td>

                    {/* GRADE/JUZ COLUMN */}
                    <td className="border border-white p-2 w-28  text-xs text-gray-500">
                      {s.class === 'Class' || s.class === 'Almiya' ? s.classNumber || '-' : s.class === 'Hifaz' ? `Juz ${s.currentJuz || 0}` : '-'}
                    </td>
                    
                    <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis  text-xs text-gray-500" title={s.class === 'BS' ? s.degreeName : s.majorSubject}>
                      {s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}
                    </td>
                    <td className="border border-white p-2 w-28 text-xs text-gray-500">
                      {s.class === 'BS' ? s.semester || '-' : '-'}
                    </td>
                    <td className="border border-white p-2 w-32  text-xs text-gray-500">PKR {s.feePerMonth || '-'}</td>
                    <td className={`border border-white p-2 w-32 font-semibold text-xs
                      ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' :
                        s.feeStatus === 'Partial Paid' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'}
                  `}>
                      {s.feeStatus}
                    </td>
                    <td className="border border-white p-2 w-30 space-x-2 flex justify-center items-center">
                      <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Student Details">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {/* Action Dropdown Menu (MODIFIED) */}
                      <Menu as="div" className="relative z-50 inline-block text-left ml-2">
                        <div>
                          <MenuButton className="flex items-center text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                          </MenuButton>
                        </div>
                        <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {/* Class/Almiya Promotion/Demotion Buttons */}
                            {currentUser?.role === 'admin' && (s.class === 'Class' || s.class === 'Almiya') && s.classNumber && s.classNumber >= 1 && (
                              <>
                                <MenuItem>
                                  {({ focus }) => (
                                    <button
                                      onClick={() => handlePromoteStudent(s._id, s.class)}
                                      className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                      <ArrowPathIcon className="mr-3 h-5 w-5 text-green-600 group-hover:text-green-900" aria-hidden="true" />
                                      Promote {s.class}
                                    </button>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ focus }) => (
                                    <button
                                      onClick={() => handleDemoteStudent(s._id, s.class)}
                                      className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                      <ArrowUturnLeftIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
                                      Demote {s.class}
                                    </button>
                                  )}
                                </MenuItem>
                              </>
                            )}
                            {/* Semester Promotion/Demotion Buttons */}
                            {currentUser?.role === 'admin' && s.class === 'BS' && s.semester >= 1 && s.semester <= 8 && (
                              <>
                                <MenuItem>
                                  {({ focus }) => (
                                    <button
                                      onClick={() => handlePromoteStudent(s._id, s.class)}
                                      className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                      <ArrowPathIcon className="mr-3 h-5 w-5 text-green-600 group-hover:text-green-900" aria-hidden="true" />
                                      Promote Semester
                                    </button>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ focus }) => (
                                    <button
                                      onClick={() => handleDemoteStudent(s._id, s.class)}
                                      className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                      <ArrowUturnLeftIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
                                      Demote Semester
                                    </button>
                                  )}
                                </MenuItem>
                              </>
                            )}
                            {/* Edit and Delete Buttons (Unchanged) */}
                            {canEditStudent && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    onClick={() => handleEdit(s)}
                                    className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    <PencilIcon className="mr-3 h-5 w-5 text-yellow-600 group-hover:text-yellow-900" aria-hidden="true" />
                                    Edit
                                  </button>
                                )}
                              </MenuItem>
                            )}
                            {canDeleteStudent && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    onClick={() => handleDelete(s._id)}
                                    className={`${focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex w-full items-center px-4 py-2 text-sm`}
                                  >
                                    <TrashIcon className="mr-3 h-5 w-5 text-red-600 group-hover:text-red-900" aria-hidden="true" />
                                    Delete
                                  </button>
                                )}
                              </MenuItem>
                            )}
                          </div>
                        </MenuItems>
                      </Menu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <StudentForm
          editingStudent={editingStudent}
          fetchStudents={fetchStudents}
          onClose={handleCloseModal}
          isViewMode={isStudentFormViewMode}
          // Pass the dynamic structure for use in the form
          academicStructure={academicStructure} 
        />
      </Modal>
    </div>
  );
};

export default StudentList;