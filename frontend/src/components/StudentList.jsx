// // src/components/StudentList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import api from '../api';
// import Modal from './Modal';
// import StudentForm from './StudentForm';
// import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

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
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

//   const [filterClassType, setFilterClassType] = useState('');
//   const [filterClassNumber, setFilterClassNumber] = useState('');
//   const [filterMajorSubject, setFilterMajorSubject] = useState('');
//   const [filterDegreeName, setFilterDegreeName] = useState('');
//   const [filterSemester, setFilterSemester] = useState('');

//   const currentMonthName = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear().toString();
//   const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
//   const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

//   const generateYearOptions = () => {
//     const years = [];
//     for (let i = parseInt(currentYear) - 5; i <= parseInt(currentYear) + 1; i++) {
//       years.push(i.toString());
//     }
//     return years;
//   };

//   const buildStudentFilterQueryParams = useCallback((currentSearchTerm) => {
//     const params = new URLSearchParams();
//     if (currentSearchTerm) {
//       params.append('searchTerm', currentSearchTerm);
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
//     return params.toString();
//   }, [filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester]);

//   const fetchStudents = useCallback(async (manualSearchTerm = searchTerm) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const queryParams = buildStudentFilterQueryParams(manualSearchTerm);
//       const res = await api.get(`/students?${queryParams}`);
//       if (Array.isArray(res.data)) {
//         setStudents(res.data);
//       } else {
//         console.error("API response for students is not an array:", res.data);
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
//   }, [buildStudentFilterQueryParams, searchTerm]);

//   const fetchAllFees = useCallback(async () => {
//     try {
//       // Fetch fees with month and year as separate query params
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

//   useEffect(() => {
//     fetchStudents();
//     fetchAllFees();
//   }, []);

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     fetchStudents();
//     fetchAllFees();
//   };

//   const handleAddStudent = () => {
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
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

//   const handleResetFilters = () => {
//     setSearchTerm('');
//     setFilterClassType('');
//     setFilterClassNumber('');
//     setFilterMajorSubject('');
//     setFilterDegreeName('');
//     setFilterSemester('');
//     setFilterFeeMonth(currentMonthName);
//     setFilterFeeYear(currentYear);
//     fetchStudents('');
//   };

//   // Frontend filtering logic for students by fee status for a specific month/year
//   // UPDATED: Now uses fee.month and fee.year (separate fields) from the FeeRecord schema
//   const getFilteredStudents = () => {
//     const paidStudentIdsForMonth = new Set(
//       allFees
//         .filter(fee => fee.month === filterFeeMonth && fee.year?.toString() === filterFeeYear && fee.studentId?._id)
//         .map(fee => fee.studentId._id)
//     );

//     return students.map(student => ({
//       ...student,
//       isPaidForSelectedMonth: paidStudentIdsForMonth.has(student._id)
//     }));
//   };

//   const displayedStudents = getFilteredStudents();

//   if (loading) {
//     return <div className="p-6 text-center text-lg">Loading students...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Students</h1>
//         <button onClick={handleAddStudent} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md group overflow-hidden transition-all duration-300 ease-in-out hover:px-4" title="Add New Student">
//           <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
//           <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Student</span>
//         </button>
//       </div>

//       <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center space-x-3 mb-3">
//           <div className="relative flex-grow">
//             <input
//               type="text"
//               id="searchTerm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onKeyPress={(e) => { if (e.key === 'Enter') fetchStudents(); }}
//               className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//               placeholder="Search by Name or CNIC..."
//             />
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>

//           <button
//             onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//             className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
//             title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
//           >
//             {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
//           </button>
//         </div>

//         {showAdvancedFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-300">
//             <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
//                         <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
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
//               <button onClick={() => fetchStudents(searchTerm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Apply Filters</button>
//               <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border border-white">Student Name</th>
//               <th className="p-2 border border-white">Father Name</th>
//               <th className="p-2 border border-white">CNIC</th> {/* NEW */}
//               <th className="p-2 border border-white">Address</th> {/* NEW */}
//               <th className="p-2 border border-white">Guardian Contact</th>
//               <th className="p-2 border border-white">Class</th>
//               <th className="p-2 border border-white">Major/Degree</th>
//               <th className="p-2 border border-white">Semester</th>
//               <th className="p-2 border border-white">Fee Per Month</th> {/* NEW */}
//               <th className="p-2 border border-white">Student Status</th>
//               <th className="p-2 border border-white">Fee Status ({filterFeeMonth || 'Selected'} {filterFeeYear || 'Year'})</th>
//               <th className="p-2 border border-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
//               displayedStudents.map((s, index) => (
//                 <tr
//                   key={s._id}
//                   className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}
//                 >
//                   <td className="border border-white p-2">{s.name}</td>
//                   <td className="border border-white p-2">{s.fatherName}</td>
//                   <td className="border border-white p-2">{s.cnic || '-'}</td> {/* NEW */}
//                   <td className="border border-white p-2 overflow-hidden">{s.address || '-'}</td> {/* NEW */}
//                   <td className="border border-white p-2">{s.guardianContact}</td>
//                    <td className="border border-white p-2">
//                     {s.class === 'Class' ? s.classNumber || '-' : s.class}
//                   </td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}
//                   </td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.semester || '-' : '-'}
//                   </td>
//                   <td className="border border-white p-2">{s.feePerMonth || '-'}</td> {/* NEW */}
//                       <td className={`border border-white p-2 font-semibold
//                       ${s.studentStatus === 'Regular' ? 'text-black' :
//                       s.studentStatus === 'Withdrawn' ? 'text-orange-600' :
//                         s.studentStatus === 'Expelled' ? 'text-red-600' : // Added Expelled
//                           'text-gray-600'}
//                   `}>
//                     {s.studentStatus}
//                   </td>
//                   <td className={`border border-white p-2 font-semibold
//                       ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' :
//                       s.feeStatus === 'Partial Paid' ? 'bg-orange-500 text-white' : // New style for Partial Paid
//                         'bg-red-500 text-white'}
//                   `}>
//                     {s.feeStatus}
//                   </td>
//                   <td className="border border-white p-2 space-x-2 flex justify-center items-center">
//                     <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Student Details">
//                       <EyeIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Student">
//                       <PencilIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Student">
//                       <TrashIcon className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="17" className="text-center p-4 text-gray-500">No students found. Add a new student!</td> {/* Adjusted colspan */}
//               </tr>
//             )}
//           </tbody>
//         </table>
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




// // src/components/StudentList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import api from '../api';
// import Modal from './Modal';
// import StudentForm from './StudentForm';
// import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

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
//   // NEW: Student Status Filter State
//   const [filterStudentStatus, setFilterStudentStatus] = useState('Regular'); // Default to 'Regular'

//   const currentMonthName = months[new Date().getMonth()];
//   const currentYear = new Date().getFullYear().toString();
//   const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
//   const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

//   const generateYearOptions = () => {
//     const years = [];
//     for (let i = parseInt(currentYear) - 5; i <= parseInt(currentYear) + 1; i++) {
//       years.push(i.toString());
//     }
//     return years;
//   };

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
//     // NEW: Append studentStatus filter
//     if (filterStudentStatus && filterStudentStatus !== 'All Students') {
//       params.append('studentStatus', filterStudentStatus);
//     }
//     return params.toString();
//   }, [debouncedSearchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester, filterStudentStatus]);

//   // Fetch students based on current filters
//   const fetchStudents = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const queryParams = buildStudentFilterQueryParams();
//       const res = await api.get(`/students?${queryParams}`);
//       if (Array.isArray(res.data)) {
//         setStudents(res.data);
//       } else {
//         console.error("API response for students is not an array:", res.data);
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
//   }, [buildStudentFilterQueryParams]); // Dependency on buildStudentFilterQueryParams ensures re-fetch when filters change

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
//   useEffect(() => {
//     fetchStudents();
//   }, [fetchStudents]); // fetchStudents itself has buildStudentFilterQueryParams as dependency, which covers all filters

//   // Effect to fetch all fees on initial load
//   useEffect(() => {
//     fetchAllFees();
//   }, [fetchAllFees]);

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     // No need to call fetchStudents/fetchAllFees here, as the useEffects will trigger based on filter changes (if any)
//     // or when a student is added/updated/deleted via the form's onClose callback.
//   };

//   const handleAddStudent = () => {
//     setEditingStudent(null);
//     setIsStudentFormViewMode(false);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm('Are you sure you want to delete this student?');
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/students/${id}`);
//       fetchStudents(); // Re-fetch students after deletion
//       fetchAllFees(); // Re-fetch fees as student deletion might affect fee status logic
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
//     setFilterStudentStatus('Regular'); // Reset to default 'Regular'
//     setFilterFeeMonth(currentMonthName);
//     setFilterFeeYear(currentYear);
//     // The useEffects will automatically trigger fetchStudents after state updates
//   };

//   // Frontend filtering logic for students by fee status for a specific month/year
//   const getFilteredStudents = () => {
//     const paidStudentIdsForMonth = new Set(
//       allFees
//         .filter(fee => fee.month === filterFeeMonth && fee.year?.toString() === filterFeeYear && fee.studentId?._id)
//         .map(fee => fee.studentId._id)
//     );

//     return students.map(student => ({
//       ...student,
//       isPaidForSelectedMonth: paidStudentIdsForMonth.has(student._id)
//     }));
//   };

//   const displayedStudents = getFilteredStudents();

//   if (loading) {
//     return <div className="p-6 text-center text-lg">Loading students...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Students</h1>
//         <button onClick={handleAddStudent} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md group overflow-hidden transition-all duration-300 ease-in-out hover:px-4" title="Add New Student">
//           <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
//           <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Student</span>
//         </button>
//       </div>

//       <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center space-x-3 mb-3">
//           <div className="relative flex-grow">
//             <input
//               type="text"
//               id="searchTerm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//               placeholder="Search by Name or CNIC..."
//             />
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>

//           <button
//             onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//             className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
//             title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
//           >
//             {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
//           </button>
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
//                         <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
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
//               {/* Removed Apply Filters button */}
//               <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="overflow-x-auto"> {/* This div makes the table horizontally scrollable */}
//         <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border border-white">Student Name</th>
//               <th className="p-2 border border-white">Father Name</th>
//               <th className="p-2 border border-white">CNIC</th>
//               <th className="p-2 border border-white">DOB</th>
//               <th className="p-2 border border-white">Gender</th>
//               <th className="p-2 border border-white">Email</th>
//               <th className="p-2 border border-white w-40">Address</th> {/* Added w-40 for fixed width */}
//               <th className="p-2 border border-white">Guardian Contact</th>
//               <th className="p-2 border border-white">Additional Contact</th>
//               <th className="p-2 border border-white">Admission Date</th>
//               <th className="p-2 border border-white">Class</th>
//               <th className="p-2 border border-white">Major/Degree</th>
//               <th className="p-2 border border-white">Semester</th>
//               <th className="p-2 border border-white">Fee Per Month</th>
//               <th className="p-2 border border-white">Fee Status ({filterFeeMonth || 'Selected'} {filterFeeYear || 'Year'})</th>
//               <th className="p-2 border border-white">Student Status</th>
//               <th className="p-2 border border-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
//               displayedStudents.map((s, index) => (
//                 <tr
//                   key={s._id}
//                   className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}
//                 >
//                   <td className="border border-white p-2">{s.name}</td>
//                   <td className="border border-white p-2">{s.fatherName}</td>
//                   <td className="border border-white p-2">{s.cnic || '-'}</td>
//                   <td className="border border-white p-2">{s.dob ? new Date(s.dob).toLocaleDateString() : '-'}</td>
//                   <td className="border border-white p-2">{s.gender || '-'}</td>
//                   <td className="border border-white p-2">{s.email || '-'}</td>
//                   <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis" title={s.address}>{s.address || '-'}</td> {/* Address styling */}
//                   <td className="border border-white p-2">{s.guardianContact}</td>
//                   <td className="border border-white p-2">{s.additionalContact || '-'}</td>
//                   <td className="border border-white p-2">{s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '-'}</td>
//                   <td className="border border-white p-2">
//                     {s.class === 'Class' ? s.classNumber || '-' : s.class}
//                   </td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}
//                   </td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.semester || '-' : '-'}
//                   </td>
//                   <td className="border border-white p-2">{s.feePerMonth || '-'}</td>
//                   <td className={`border border-white p-2 font-semibold
//                       ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' :
//                       s.feeStatus === 'Partial Paid' ? 'bg-orange-500 text-white' :
//                         'bg-red-500 text-white'}
//                   `}>
//                     {s.feeStatus}
//                   </td>
//                   <td className={`border border-white p-2 font-semibold
//                       ${s.studentStatus === 'Regular' ? 'text-blue-600' :
//                       s.studentStatus === 'Withdrawn' ? 'text-orange-600' :
//                         s.studentStatus === 'Expelled' ? 'text-red-600' :
//                         s.studentStatus === 'Graduated' ? 'text-purple-600' : // Added Graduated style
//                         'text-gray-600'}
//                   `}>
//                     {s.studentStatus}
//                   </td>
//                   <td className="border border-white p-2 space-x-2 flex justify-center items-center">
//                     <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Student Details">
//                       <EyeIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Student">
//                       <PencilIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Student">
//                       <TrashIcon className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="17" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
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
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Modal from './Modal';
import StudentForm from './StudentForm';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

// Define degree years mapping (used in both StudentList and StudentForm)
const degreeYearsMap = {
  'Islamiyat': 4,
  'Software Engineering': 4,
  'Honors': 2,
  '-': null
};

// Define months array (used in both StudentList and FeeForm)
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [allFees, setAllFees] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isStudentFormViewMode, setIsStudentFormViewMode] = useState(false);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // New state for debounced search
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filterClassType, setFilterClassType] = useState('');
  const [filterClassNumber, setFilterClassNumber] = useState('');
  const [filterMajorSubject, setFilterMajorSubject] = useState('');
  const [filterDegreeName, setFilterDegreeName] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStudentStatus, setFilterStudentStatus] = useState('Regular'); // Default to 'Regular'

  const currentMonthName = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
  const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

  const generateYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i.toString());
    }
    return years;
  }, []);

  // Helper to build query parameters for student filters
  const buildStudentFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) { // Use debounced search term
      params.append('searchTerm', debouncedSearchTerm);
    }
    if (filterClassType) {
      params.append('class', filterClassType);
      if (filterClassType === 'Class') {
        if (filterClassNumber) params.append('classNumber', filterClassNumber);
        if (filterMajorSubject) params.append('majorSubject', filterMajorSubject);
      } else if (filterClassType === 'BS') {
        if (filterDegreeName) params.append('degreeName', filterDegreeName);
        if (filterSemester) params.append('semester', filterSemester);
      }
    }
    // Append studentStatus filter
    if (filterStudentStatus && filterStudentStatus !== 'All Students') {
      params.append('studentStatus', filterStudentStatus);
    }
    return params.toString();
  }, [debouncedSearchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester, filterStudentStatus]);

  // Fetch students based on current filters
  const fetchStudents = useCallback(async () => {
    setLoading(true); // Set loading true at the start of fetch
    setError(null);
    try {
      const queryParams = buildStudentFilterQueryParams();
      const res = await api.get(`/students?${queryParams}`);
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        console.error("API response for students is not an array:", res.data);
        setStudents([]);
        setError("Received unexpected data format from server.");
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false); // Set loading false after fetch completes (success or error)
    }
  }, [buildStudentFilterQueryParams]);

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
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Effect to trigger student fetch when debounced search term or other filters change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Effect to fetch all fees on initial load
  useEffect(() => {
    fetchAllFees();
  }, [fetchAllFees]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    setIsStudentFormViewMode(false);
    fetchStudents(); // Re-fetch students after any form interaction (add/edit/delete)
    fetchAllFees(); // Re-fetch fees as student changes might affect fee status logic
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentFormViewMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
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
    setFilterMajorSubject('');
    setFilterDegreeName('');
    setFilterSemester('');
    setFilterStudentStatus('Regular');
    setFilterFeeMonth(currentMonthName);
    setFilterFeeYear(currentYear);
  };

  // Frontend filtering logic for students by fee status for a specific month/year
  const getFilteredStudents = () => {
    const paidStudentIdsForMonth = new Set(
      allFees
        .filter(fee => fee.month === filterFeeMonth && fee.year?.toString() === filterFeeYear && fee.studentId?._id)
        .map(fee => fee.studentId._id)
    );

    return students.map(student => ({
      ...student,
      isPaidForSelectedMonth: paidStudentIdsForMonth.has(student._id)
    }));
  };

  const displayedStudents = getFilteredStudents();

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Students</h1>
        <button onClick={handleAddStudent} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md group overflow-hidden transition-all duration-300 ease-in-out hover:px-4" title="Add New Student">
          <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
          <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Student</span>
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative flex-grow">
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Search by Name or CNIC..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
          >
            {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Student Status Filter */}
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
                  <option value="Class">Class (1-12)</option>
                  <option value="BS">BS Level</option>
                </select>
              </div>

              {filterClassType === 'Class' && (
                <>
                  <div>
                    <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
                    <select
                      id="filterClassNumber"
                      value={filterClassNumber}
                      onChange={(e) => setFilterClassNumber(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Classes</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filterMajorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
                    <select
                      id="filterMajorSubject"
                      value={filterMajorSubject}
                      onChange={(e) => setFilterMajorSubject(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Subjects</option>
                      <option value="Arts">Arts</option>
                      <option value="Science">Science</option>
                    </select>
                  </div>
                </>
              )}

              {filterClassType === 'BS' && (
                <>
                  <div>
                    <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                    <select
                      id="filterDegreeName"
                      value={filterDegreeName}
                      onChange={(e) => setFilterDegreeName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Degrees</option>
                      <option value="Islamiyat">Islamiyat</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Honors">Honors</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                      id="filterSemester"
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                    >
                      <option value="">All Semesters</option>
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  {filterDegreeName && (
                    <div>
                      <p className="block text-sm font-medium text-gray-700">Degree Years:</p>
                      <p className="mt-1 p-2 text-gray-900 font-bold">{degreeYearsMap[filterDegreeName] || '-'} years</p>
                    </div>
                  )}
                </>
              )}

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
              <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container with minimum height */}
      <div className="overflow-x-auto min-h-[400px] relative"> {/* Added min-h-[400px] */}
        {loading && ( // Loading overlay
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center text-lg text-gray-700">Loading students...</div>
          </div>
        )}
        {error && !loading && ( // Error message
          <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-10 border border-red-400 text-red-700">
            <div className="text-center text-lg">{error}</div>
          </div>
        )}

        <table className="min-w-full table-fixed border-separate border-spacing-y-2 shadow-lg rounded-lg overflow-hidden"> {/* Changed to table-fixed */}
          <thead className="bg-green-600 text-white rounded-md">
            <tr>
              {/* Fixed widths for all columns */}
              <th className="p-2 border border-white w-40">Student Name</th>
              <th className="p-2 border border-white w-40">Father Name</th>
              <th className="p-2 border border-white w-32">CNIC</th>
              <th className="p-2 border border-white w-48">Address</th>
              <th className="p-2 border border-white w-36">Guardian Contact</th>
              <th className="p-2 border border-white w-28">Class</th>
              <th className="p-2 border border-white w-36">Major/Degree</th>
              <th className="p-2 border border-white w-28">Semester</th>
              <th className="p-2 border border-white w-32">Fee Per Month</th>
              <th className="p-2 border border-white w-32">Fee Status</th>
              <th className="p-2 border border-white w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? ( // Show skeleton rows when loading
              [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={17} />)
            ) : Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
              displayedStudents.map((s, index) => (
                <tr
                  key={s._id}
                  className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-4 cursor-pointer hover:bg-gray-200 transition-colors duration-150`}
                >
                  <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis" title={s.name}>{s.name}</td>
                  <td className="border border-white p-2 w-40 overflow-hidden whitespace-nowrap text-ellipsis" title={s.fatherName}>{s.fatherName}</td>
                  <td className="border border-white p-2 w-32 overflow-hidden whitespace-nowrap text-ellipsis" title={s.cnic}>{s.cnic || '-'}</td>
                  {/* <td className="border border-white p-2 w-28 overflow-hidden whitespace-nowrap text-ellipsis" title={s.address}>{s.address || '-'}</td> */}
                  <td
  className="p-2 w-48 overflow-hidden break-words whitespace-nowrap ext-ellipsis line-clamp-1"
  title={s.address}
>
  {s.address || '-'}
</td>

                  <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis" title={s.guardianContact}>{s.guardianContact}</td>
                  <td className="border border-white p-2 w-28">
                    {s.class === 'Class' ? s.classNumber || '-' : s.class}
                  </td>
                  <td className="border border-white p-2 w-36 overflow-hidden whitespace-nowrap text-ellipsis" title={s.class === 'BS' ? s.degreeName : s.majorSubject}>
                    {s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}
                  </td>
                  <td className="border border-white p-2 w-28">
                    {s.class === 'BS' ? s.semester || '-' : '-'}
                  </td>
                  <td className="border border-white p-2 w-32">{s.feePerMonth || '-'}</td>
                  <td className={`border border-white p-2 w-32 font-semibold
                      ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' :
                      s.feeStatus === 'Partial Paid' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'}
                  `}>
                    {s.feeStatus}
                  </td>
                  <td className="border border-white p-2 w-36 space-x-2 flex justify-center items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View Student Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Student">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Student">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="17" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <StudentForm
          editingStudent={editingStudent}
          fetchStudents={fetchStudents}
          onClose={handleCloseModal}
          isViewMode={isStudentFormViewMode}
        />
      </Modal>
    </div>
  );
};

export default StudentList;