// // src/components/StudentList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import api from '../api';
// import Modal from './Modal';
// import StudentForm from './StudentForm';
// import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Added FunnelIcon, XMarkIcon

// // Define degree years mapping
// const degreeYearsMap = {
//   'Islamiyat': 4,
//   'Software Engineering': 4,
//   'Honors': 2,
//   'N/A': null
// };

// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// const StudentList = () => {
//   const [students, setStudents] = useState([]);
//   const [allFees, setAllFees] = useState([]); // To filter students by fee status on frontend
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // --- Filter States ---
//   const [searchTerm, setSearchTerm] = useState(''); // General search for name/cnic
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle for advanced filters

//   const [filterClassType, setFilterClassType] = useState(''); // 'Class' or 'BS'
//   const [filterClassNumber, setFilterClassNumber] = useState(''); // e.g., '1st', '12th'
//   const [filterMajorSubject, setFilterMajorSubject] = useState(''); // 'Arts', 'Science'
//   const [filterDegreeName, setFilterDegreeName] = useState(''); // 'Islamiyat', 'Software Engineering', 'Honors'
//   const [filterSemester, setFilterSemester] = useState(''); // 1 to 8

//   // Fee Status Filter (Frontend-side)
//   const [filterFeeMonth, setFilterFeeMonth] = useState('');
//   const [filterFeeYear, setFilterFeeYear] = useState(new Date().getFullYear().toString()); // Default to current year

//   // Helper to generate available years for fee filter
//   const generateYearOptions = () => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let i = currentYear - 5; i <= currentYear + 1; i++) { // Last 5 years, current, next 1
//       years.push(i.toString());
//     }
//     return years;
//   };

//   // Function to construct query parameters for backend API call
//   const buildStudentFilterQueryParams = useCallback(() => {
//     const params = new URLSearchParams();
//     if (searchTerm) {
//       params.append('searchTerm', searchTerm);
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
//   }, [searchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester]);


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
//   }, [buildStudentFilterQueryParams]);

//   // Fetch all fees to enable frontend filtering by month/year
//   const fetchAllFees = useCallback(async () => {
//     try {
//       const res = await api.get('/fees'); // Fetch all fees without filters
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
//     fetchAllFees(); // Fetch all fees on initial load
//   }, [fetchStudents, fetchAllFees]);

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setEditingStudent(null);
//     fetchStudents(); // Re-fetch students after modal close (add/edit)
//     fetchAllFees(); // Re-fetch fees too in case status changed
//   };

//   const handleAddStudent = () => {
//     setEditingStudent(null);
//     setModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm('Are you sure you want to delete this student?');
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/students/${id}`);
//       fetchStudents();
//       fetchAllFees(); // Refresh fees as well
//     } catch (err) {
//       console.error('Failed to delete student:', err);
//       alert('Failed to delete student. Please try again.');
//     }
//   };

//   const handleEdit = (student) => {
//     setEditingStudent(student);
//     setModalOpen(true);
//   };

//   const handleResetFilters = () => {
//     setSearchTerm('');
//     setFilterClassType('');
//     setFilterClassNumber('');
//     setFilterMajorSubject('');
//     setFilterDegreeName('');
//     setFilterSemester('');
//     setFilterFeeMonth('');
//     setFilterFeeYear(new Date().getFullYear().toString());
//     // fetchStudents will be triggered by dependency array, no need to call directly
//   };

//   // Frontend filtering logic for students by fee status for a specific month/year
//   const getFilteredStudents = () => {
//     if (!filterFeeMonth || !filterFeeYear) {
//       return students; // If no month/year selected, return all students from backend filter
//     }

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

//       {/* --- Search and Filter Toggle --- */}
//       <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center space-x-3 mb-3">
//           <input
//             type="text"
//             id="searchTerm"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onBlur={fetchStudents} // Trigger fetch on blur
//             onKeyPress={(e) => { if (e.key === 'Enter') fetchStudents(); }}
//             className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
//             placeholder="Search by Name or CNIC..."
//           />
//           <button
//             onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//             className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
//             title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
//           >
//             {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
//           </button>
//         </div>

//         {/* --- Advanced Filters Section (Conditional Display) --- */}
//         {showAdvancedFilters && (
//           <div className="mt-4 pt-4 border-t border-gray-300">
//             <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               {/* Filter by Class Type */}
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

//               {/* Conditional Filters based on Class Type */}
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
//                       <p className="mt-1 p-2 text-gray-900 font-bold">{degreeYearsMap[filterDegreeName] || 'N/A'} years</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Filter by Month (Frontend-side) */}
//               <div>
//                 <label htmlFor="filterFeeYear" className="block text-sm font-medium text-gray-700">Fee Year</label>
//                 <select
//                   id="filterFeeYear"
//                   value={filterFeeYear}
//                   onChange={(e) => setFilterFeeYear(e.target.value)}
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
//                 <button onClick={fetchStudents} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Apply Filters</button>
//                 <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* --- End Student Filters Section --- */}

//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto border border-white shadow-lg rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border border-white">Name</th>
//               <th className="p-2 border border-white">Father</th>
//               <th className="p-2 border border-white">Contact</th>
//               <th className="p-2 border border-white">Class</th>
//               <th className="p-2 border border-white">Major/Degree</th>
//               <th className="p-2 border border-white">Semester</th>
//               <th className="p-2 border border-white">Fee Status (Overall)</th>
//               <th className="p-2 border border-white">Fee Status ({filterFeeMonth || 'Selected'} {filterFeeYear || 'Year'})</th> {/* Dynamic header */}
//               <th className="p-2 border border-white">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
//               displayedStudents.map((s, index) => (
//                 <tr key={s._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
//                   <td className="border border-white p-2">{s.name}</td>
//                   <td className="border border-white p-2">{s.fatherName}</td>
//                   <td className="border border-white p-2">{s.guardianContact}</td>
//                   <td className="border border-white p-2">{s.class}</td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.degreeName || 'N/A' : s.majorSubject || 'N/A'}
//                   </td>
//                   <td className="border border-white p-2">
//                     {s.class === 'BS' ? s.semester || 'N/A' : 'N/A'}
//                   </td>
//                   <td className={`border border-white p-2 font-semibold ${s.feeStatus === 'Unpaid' ? 'bg-red-500 text-white' : ''} ${s.feeStatus === 'Paid' ? 'bg-green-300 text-black' : ''}`}>
//                     {s.feeStatus}
//                   </td>
//                   {/* New column for fee status for selected month/year */}
//                   <td className={`border border-white p-2 font-semibold
//                       ${s.isPaidForSelectedMonth ? 'bg-green-300 text-black' : 'bg-red-500 text-white'}
//                   `}>
//                     {s.isPaidForSelectedMonth ? 'Paid' : 'Unpaid'}
//                   </td>
//                   <td className="border border-white p-2 space-x-2 flex justify-center items-center">
//                     <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Student">
//                       <PencilIcon className="h-5 w-5" />
//                     </button>
//                     <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Student">
//                       <TrashIcon className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
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
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Added FunnelIcon, XMarkIcon

// Define degree years mapping
const degreeYearsMap = {
  'Islamiyat': 4,
  'Software Engineering': 4,
  'Honors': 2,
  'N/A': null
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [allFees, setAllFees] = useState([]); // To filter students by fee status on frontend
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState(''); // General search for name/cnic
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle for advanced filters

  const [filterClassType, setFilterClassType] = useState(''); // 'Class' or 'BS'
  const [filterClassNumber, setFilterClassNumber] = useState(''); // e.g., '1st', '12th'
  const [filterMajorSubject, setFilterMajorSubject] = useState(''); // 'Arts', 'Science'
  const [filterDegreeName, setFilterDegreeName] = useState(''); // 'Islamiyat', 'Software Engineering', 'Honors'
  const [filterSemester, setFilterSemester] = useState(''); // 1 to 8

  // Fee Status Filter (Frontend-side)
  // Default to current month and year for initial display
  const currentMonthName = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const [filterFeeMonth, setFilterFeeMonth] = useState(currentMonthName);
  const [filterFeeYear, setFilterFeeYear] = useState(currentYear);

  // Helper to generate available years for fee filter
  const generateYearOptions = () => {
    const years = [];
    for (let i = parseInt(currentYear) - 5; i <= parseInt(currentYear) + 1; i++) { // Last 5 years, current, next 1
      years.push(i.toString());
    }
    return years;
  };

  // Function to construct query parameters for backend API call
  const buildStudentFilterQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
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
    return params.toString();
  }, [searchTerm, filterClassType, filterClassNumber, filterMajorSubject, filterDegreeName, filterSemester]);


  const fetchStudents = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [buildStudentFilterQueryParams]);

  // Fetch all fees to enable frontend filtering by month/year
  const fetchAllFees = useCallback(async () => {
    try {
      const res = await api.get('/fees'); // Fetch all fees without filters
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

  useEffect(() => {
    fetchStudents();
    fetchAllFees(); // Fetch all fees on initial load
  }, [fetchStudents, fetchAllFees]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    fetchStudents(); // Re-fetch students after modal close (add/edit)
    fetchAllFees(); // Re-fetch fees too in case status changed
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
      fetchAllFees(); // Refresh fees as well
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterClassType('');
    setFilterClassNumber('');
    setFilterMajorSubject('');
    setFilterDegreeName('');
    setFilterSemester('');
    setFilterFeeMonth(currentMonthName); // Reset to current month
    setFilterFeeYear(currentYear); // Reset to current year
    // fetchStudents will be triggered by dependency array, no need to call directly
  };

  // Frontend filtering logic for students by fee status for a specific month/year
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

  const displayedStudents = getFilteredStudents();


  if (loading) {
    return <div className="p-6 text-center text-lg">Loading students...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 text-lg">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Students</h1>
        <button onClick={handleAddStudent} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md group overflow-hidden transition-all duration-300 ease-in-out hover:px-4" title="Add New Student">
          <PlusIcon className="h-5 w-5 flex-shrink-0 group-hover:mr-2 transition-all duration-300 ease-in-out" />
          <span className="text-white opacity-0 w-0 overflow-hidden whitespace-nowrap group-hover:opacity-100 group-hover:w-auto transition-all duration-300 ease-in-out text-base">Add Student</span>
        </button>
      </div>

      {/* --- Search and Filter Toggle --- */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={fetchStudents} // Trigger fetch on blur
            onKeyPress={(e) => { if (e.key === 'Enter') fetchStudents(); }}
            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            placeholder="Search by Name or CNIC..."
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            title={showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
          >
            {showAdvancedFilters ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <FunnelIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* --- Advanced Filters Section (Conditional Display) --- */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="text-md font-semibold mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Filter by Class Type */}
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

              {/* Conditional Filters based on Class Type */}
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
                      <p className="mt-1 p-2 text-gray-900 font-bold">{degreeYearsMap[filterDegreeName] || 'N/A'} years</p>
                    </div>
                  )}
                </>
              )}

              {/* Filter by Month (Frontend-side) */}
              <div>
                <label htmlFor="filterFeeYear" className="block text-sm font-medium text-gray-700">Fee Year</label>
                <select
                  id="filterFeeYear"
                  value={filterFeeYear}
                  onChange={(e) => setFilterFeeYear(e.target.value)}
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
                <button onClick={fetchStudents} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Apply Filters</button>
                <button onClick={handleResetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Reset Filters</button>
            </div>
          </div>
        )}
      </div>
      {/* --- End Student Filters Section --- */}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-white">Name</th>
              <th className="p-2 border border-white">Father</th>
              <th className="p-2 border border-white">Contact</th>
              <th className="p-2 border border-white">Class</th>
              <th className="p-2 border border-white">Major/Degree</th>
              <th className="p-2 border border-white">Semester</th>
              {/* Removed "Fee Status (Overall)" column */}
              <th className="p-2 border border-white">Fee Status ({filterFeeMonth || 'Selected'} {filterFeeYear || 'Year'})</th> {/* Dynamic header */}
              <th className="p-2 border border-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
              displayedStudents.map((s, index) => (
                <tr key={s._id} className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="border border-white p-2">{s.name}</td>
                  <td className="border border-white p-2">{s.fatherName}</td>
                  <td className="border border-white p-2">{s.guardianContact}</td>
                  <td className="border border-white p-2">{s.class}</td>
                  <td className="border border-white p-2">
                    {s.class === 'BS' ? s.degreeName || 'N/A' : s.majorSubject || 'N/A'}
                  </td>
                  <td className="border border-white p-2">
                    {s.class === 'BS' ? s.semester || 'N/A' : 'N/A'}
                  </td>
                  {/* The single fee status column */}
                  <td className={`border border-white p-2 font-semibold
                      ${s.isPaidForSelectedMonth ? 'bg-green-300 text-black' : 'bg-red-500 text-white'}
                  `}>
                    {s.isPaidForSelectedMonth ? 'Paid' : 'Unpaid'}
                  </td>
                  <td className="border border-white p-2 space-x-2 flex justify-center items-center">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit Student">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete Student">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">No students found. Add a new student!</td>
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
        />
      </Modal>
    </div>
  );
};

export default StudentList;