// // // frontend/src/pages/MarksList.jsx


// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import { toast } from 'react-toastify';
// import { TrashIcon, PencilIcon, MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
// import ConfirmationModal from '../components/ConfirmationModal';
// import { useNavigate } from 'react-router-dom';

// const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const marksTypes = ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'];

// // Function to generate a range of years
// const generateYears = () => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let i = currentYear - 5; i <= currentYear + 1; i++) {
//         years.push(i);
//     }
//     return years;
// };

// // Custom hook for debouncing a value
// const useDebounce = (value, delay) => {
//     const [debouncedValue, setDebouncedValue] = useState(value);

//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);

//         return () => {
//             clearTimeout(handler);
//         };
//     }, [value, delay]);

//     return debouncedValue;
// };

// const MarksList = () => {
//     const { currentUser } = useContext(UserContext);
//     const navigate = useNavigate();
//     const [marks, setMarks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//     const [markToDelete, setMarkToDelete] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce
//     const [filter, setFilter] = useState({
//         subject: '',
//         marksType: '',
//         studentClass: '',
//         classNumber: '',
//         degree: '',
//         semester: '',
//         month: '',
//         year: '',
//     });
//     const [teacherSubjects, setTeacherSubjects] = useState([]);
//     const [teacherAssignedClasses, setTeacherAssignedClasses] = useState([]);
//     const [yearRange, setYearRange] = useState(generateYears());
//     const [showFilters, setShowFilters] = useState(false);

//     const fetchInitialData = useCallback(async () => {
//         setLoading(true);
//         try {
//             if (currentUser.role === 'teacher') {
//                 const res = await api.get(`/staff/${currentUser.profileId}`);
//                 const subjects = res.data.assignClasses.flatMap(ac => ac.subjects);
//                 setTeacherSubjects(subjects);
//                 setTeacherAssignedClasses(res.data.assignClasses);
//             }

//             let marksResponse;
//             if (currentUser.role === 'admin') {
//                 marksResponse = await api.get('/marks');
//             } else if (currentUser.role === 'teacher') {
//                 marksResponse = await api.get(`/marks/teacher/${currentUser.profileId}`);
//             } else if (currentUser.role === 'student') {
//                 marksResponse = await api.get(`/marks/student/${currentUser.profileId}`);
//             }
//             setMarks(marksResponse.data);

//         } catch (err) {
//             console.error('Failed to fetch initial data:', err);
//             setError('Failed to load initial data. Please try again.');
//             toast.error('Failed to load initial data.');
//         } finally {
//             setLoading(false);
//         }
//     }, [currentUser]);

//     const fetchMarks = useCallback(async () => {
//         setLoading(true);
//         try {
//             const queryParams = new URLSearchParams({ ...filter, searchQuery: debouncedSearchQuery }).toString();
//             let response;
//             if (currentUser.role === 'admin') {
//                 response = await api.get(`/marks?${queryParams}`);
//             } else if (currentUser.role === 'teacher') {
//                 response = await api.get(`/marks/teacher/${currentUser.profileId}?${queryParams}`);
//             } else if (currentUser.role === 'student') {
//                 response = await api.get(`/marks/student/${currentUser.profileId}?${queryParams}`);
//             }
//             setMarks(response.data);
//         } catch (err) {
//             console.error('Failed to fetch marks:', err);
//             setError('Failed to load marks. Please try again.');
//             toast.error('Failed to load marks.');
//         } finally {
//             setLoading(false);
//         }
//     }, [currentUser, filter, debouncedSearchQuery]);

//     useEffect(() => {
//         if (currentUser) {
//             fetchInitialData();
//         }
//     }, [currentUser, fetchInitialData]);

//     useEffect(() => {
//         if (currentUser) {
//             fetchMarks();
//         }
//     }, [filter, debouncedSearchQuery, currentUser, fetchMarks]);

//     const handleFilterChange = (e) => {
//         const { name, value } = e.target;
//         setFilter(prev => ({ ...prev, [name]: value }));
//     };

//     const handleClearFilters = () => {
//         setFilter({
//             subject: '',
//             marksType: '',
//             studentClass: '',
//             classNumber: '',
//             degree: '',
//             semester: '',
//             month: '',
//             year: '',
//         });
//         setSearchQuery('');
//     };

//     const handleSearchChange = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     const handleDelete = (id) => {
//         setMarkToDelete(id);
//         setIsConfirmModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         setIsConfirmModalOpen(false);
//         try {
//             await api.delete(`/marks/${markToDelete}`);
//             toast.success('Marks deleted successfully!');
//             fetchMarks();
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || err.message;
//             toast.error(errorMessage);
//             console.error(err);
//         }
//     };

//     const handleEdit = (id) => {
//         navigate(`/marks/edit/${id}`);
//     };

//     if (loading) return <Loader />;
//     if (error) return <Message variant="danger">{error}</Message>;

//     const filteredMarks = marks.filter(mark => {
//         // Basic client-side filtering (server-side is better but this works as a fallback)
//         const studentName = mark.student?.name?.toLowerCase() || '';
//         const rollNumber = mark.student?.rollNumber?.toLowerCase() || '';
//         const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || rollNumber.includes(searchQuery.toLowerCase());

//         const conductedDate = new Date(mark.conductedDate);
//         const matchesMonth = filter.month ? conductedDate.getMonth() + 1 === parseInt(filter.month) : true;
//         const matchesYear = filter.year ? conductedDate.getFullYear() === parseInt(filter.year) : true;
//         const matchesMarksType = filter.marksType ? mark.marksType === filter.marksType : true;
//         const matchesSubject = filter.subject ? mark.subject === filter.subject : true;

//         return matchesSearch && matchesMonth && matchesYear && matchesMarksType && matchesSubject;
//     });

//     const getAssignedClassNumbers = () => {
//         const classType = teacherAssignedClasses.find(ac => ac.type === 'Class');
//         return classType ? classType.classNumbers : [];
//     };

//     const adminClassNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h1 className="text-2xl font-bold text-gray-800 mb-6">Marks List</h1>

//             {/* Header with Search and Filter Toggle */}
//             <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
//                 <div className="relative w-full md:w-1/3">
//                     <input
//                         type="text"
//                         placeholder="Search by student name or roll number..."
//                         value={searchQuery}
//                         onChange={handleSearchChange}
//                         className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
//                     />
//                     <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                     {searchQuery && (
//                         <button
//                             onClick={() => setSearchQuery('')}
//                             className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full"
//                             title="Clear search"
//                         >
//                             <XMarkIcon className="h-4 w-4" />
//                         </button>
//                     )}
//                 </div>
//                 <div className="flex space-x-2">
//                     <button
//                         onClick={() => setShowFilters(!showFilters)}
//                         className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
//                     >
//                         <FunnelIcon className="h-5 w-5" />
//                         <span>Filters</span>
//                     </button>
//                     {(Object.values(filter).some(val => val !== '') || searchQuery !== '') && (
//                         <button
//                             onClick={handleClearFilters}
//                             className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg shadow-sm hover:bg-red-200 transition-colors"
//                         >
//                             <XMarkIcon className="h-5 w-5" />
//                             <span>Clear</span>
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Filter Section */}
//             {showFilters && (
//                 <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm transition-all duration-300 ease-in-out">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Marks</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                         {currentUser.role === 'teacher' && (
//                             <div>
//                                 <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                                 <select
//                                     id="subject"
//                                     name="subject"
//                                     value={filter.subject}
//                                     onChange={handleFilterChange}
//                                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                                 >
//                                     <option value="">All Subjects</option>
//                                     {teacherSubjects.map(sub => (
//                                         <option key={sub} value={sub}>{sub}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                         <div>
//                             <label htmlFor="marksType" className="block text-sm font-medium text-gray-700">Marks Type</label>
//                             <select
//                                 id="marksType"
//                                 name="marksType"
//                                 value={filter.marksType}
//                                 onChange={handleFilterChange}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                             >
//                                 <option value="">All Types</option>
//                                 {marksTypes.map(type => (
//                                     <option key={type} value={type}>{type}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700">Class</label>
//                             <select
//                                 id="studentClass"
//                                 name="studentClass"
//                                 value={filter.studentClass}
//                                 onChange={handleFilterChange}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                             >
//                                 <option value="">All Classes</option>
//                                 <option value="Class">Class</option>
//                                 <option value="BS">BS</option>
//                             </select>
//                         </div>

//                         {(filter.studentClass === 'BS') && (
//                             <>
//                                 <div>
//                                     <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
//                                     <input
//                                         type="text"
//                                         id="degree"
//                                         name="degree"
//                                         value={filter.degree}
//                                         onChange={handleFilterChange}
//                                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                                         placeholder="e.g., Software Engineering"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
//                                     <input
//                                         type="number"
//                                         id="semester"
//                                         name="semester"
//                                         value={filter.semester}
//                                         onChange={handleFilterChange}
//                                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                                         placeholder="e.g., 5"
//                                     />
//                                 </div>
//                             </>
//                         )}
//                         {/* {filter.studentClass === 'Class' && (
//                             <div>
//                                 <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                                 <select
//                                     id="classNumber"
//                                     name="classNumber"
//                                     value={filter.classNumber}
//                                     onChange={handleFilterChange}
//                                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                                 >
//                                     <option value="">All Class Numbers</option>
//                                     {currentUser.role === 'admin' ? (
//                                         adminClassNumbers.map(num => (
//                                             <option key={num} value={num}>{num}</option>
//                                         ))
//                                     ) : (
//                                         teacherAssignedClasses.find(ac => ac.type === 'Class')?.classNumbers?.map(num => (
//                                             <option key={num} value={num}>{num}</option>
//                                         ))
//                                     )}
//                                 </select>
//                             </div>
//                         )} */}

//                         {filter.studentClass === 'Class' && (
//                             <div>
//                                 <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                                 <select
//                                     id="classNumber"
//                                     name="classNumber"
//                                     value={filter.classNumber}
//                                     onChange={handleFilterChange}
//                                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                                 >
//                                     <option value="">All Class Numbers</option>
//                                     {currentUser.role === 'admin' ? (
//                                         Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
//                                             <option key={num} value={num}>{num}</option>
//                                         ))
//                                     ) : (
//                                         teacherAssignedClasses
//                                             .filter(ac => ac.type === 'Class')
//                                             .map(ac => (
//                                                 <option key={ac.classNumber} value={ac.classNumber}>{ac.classNumber}</option>
//                                             ))
//                                     )}
//                                 </select>
//                             </div>
//                         )}

//                         <div>
//                             <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
//                             <select
//                                 id="year"
//                                 name="year"
//                                 value={filter.year}
//                                 onChange={handleFilterChange}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                             >
//                                 <option value="">All Years</option>
//                                 {yearRange.map(year => (
//                                     <option key={year} value={year}>{year}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
//                             <select
//                                 id="month"
//                                 name="month"
//                                 value={filter.month}
//                                 onChange={handleFilterChange}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
//                             >
//                                 <option value="">All Months</option>
//                                 {months.map((month, index) => (
//                                     <option key={month} value={index + 1}>{month}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="mt-6 overflow-x-auto">
//                 {marks.length > 0 ? (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-100">
//                                 <tr>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Type</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obtained</th>
//                                     <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//                                     {currentUser.role === 'teacher' && (
//                                         <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                                     )}
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {marks.map((mark) => (
//                                     <tr key={mark._id}>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.student?.name || 'N/A'}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.subject}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.marksType}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.marksName}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{new Date(mark.conductedDate).toLocaleDateString()}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.marksObtained}</td>
//                                         <td className="py-3 px-4 whitespace-nowrap">{mark.totalMarks}</td>
//                                         {currentUser.role === 'teacher' && (
//                                             <td className="py-3 px-4 text-center">
//                                                 <button
//                                                     onClick={() => handleEdit(mark._id)}
//                                                     className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-md hover:bg-green-100 mr-2"
//                                                     title="Edit Marks"
//                                                 >
//                                                     <PencilIcon className="h-5 w-5" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDelete(mark._id)}
//                                                     className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100"
//                                                     title="Delete Marks"
//                                                 >
//                                                     <TrashIcon className="h-5 w-5" />
//                                                 </button>
//                                             </td>
//                                         )}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 ) : (
//                     <p className="text-xl text-gray-600 text-center p-4 bg-gray-100 rounded-lg shadow-sm">
//                         No marks found.
//                     </p>
//                 )}
//             </div>

//             <ConfirmationModal
//                 isOpen={isConfirmModalOpen}
//                 onClose={() => setIsConfirmModalOpen(false)}
//                 onConfirm={confirmDelete}
//                 message="Are you sure you want to delete this marks entry? This action cannot be undone."
//             />
//         </div>
//     );
// };

// export default MarksList;





// frontend/src/pages/MarksList.jsx


import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Search, Filter } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const marksTypes = ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'];

// Function to generate a range of years
const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
        years.push(i);
    }
    return years;
};

// Custom hook for debouncing a value
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const MarksList = () => {
    const { currentTheme } = useTheme();
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [marks, setMarks] = useState([]);
    
    // Role checks
    const isAdmin = currentUser?.role === 'admin';
    const isTeacher = currentUser?.role === 'teacher';
    const isStudent = currentUser?.role === 'student';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [markToDelete, setMarkToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce
    
    // --- Dynamic Academic Structure State ---
    const [academicStructure, setAcademicStructure] = useState(null);
    const [structureLoading, setStructureLoading] = useState(true);

    const [filter, setFilter] = useState({
        subject: '',
        marksType: '',
        studentClass: '', // Maps to 'class' in student model ('Class', 'BS', 'Almiya', 'Hifaz')
        classNumber: '', // For Class/Almiya
        degree: '',      // For BS
        semester: '',    // For BS
        month: '',
        year: '',
    });
    
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [teacherAssignedClasses, setTeacherAssignedClasses] = useState([]);
    const [yearRange] = useState(generateYears());
    const [showFilters, setShowFilters] = useState(false);

    // Helper to get selected academic type config
    const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
    const selectedAcademicType = getAcademicConfig(filter.studentClass);
    
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

    const fetchInitialData = useCallback(async () => {
        if (structureLoading) return; // Wait for structure
        setLoading(true);
        try {
            if (currentUser.role === 'teacher') {
                const res = await api.get(`/staff/${currentUser.profileId}`);
                const subjects = res.data.assignClasses.flatMap(ac => ac.subjects);
                setTeacherSubjects(subjects);
                setTeacherAssignedClasses(res.data.assignClasses);
            }

            let marksResponse;
            if (currentUser.role === 'admin') {
                marksResponse = await api.get('/marks');
            } else if (currentUser.role === 'teacher') {
                marksResponse = await api.get(`/marks/teacher/${currentUser.profileId}`);
            } else if (currentUser.role === 'student') {
                marksResponse = await api.get(`/marks/student/${currentUser.profileId}`);
            }
            setMarks(marksResponse.data);

        } catch (err) {
            console.error('Failed to fetch initial data:', err);
            setError('Failed to load initial data. Please try again.');
            toast.error('Failed to load initial data.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, structureLoading]);

    const fetchMarks = useCallback(async () => {
        if (structureLoading) return; // Wait for structure
        setLoading(true);
        try {
            // Build query params dynamically
            const queryParams = new URLSearchParams({ ...filter, searchQuery: debouncedSearchQuery }).toString();
            
            let response;
            if (currentUser.role === 'admin') {
                response = await api.get(`/marks?${queryParams}`);
            } else if (currentUser.role === 'teacher') {
                response = await api.get(`/marks/teacher/${currentUser.profileId}?${queryParams}`);
            } else if (currentUser.role === 'student') {
                response = await api.get(`/marks/student/${currentUser.profileId}?${queryParams}`);
            }
            setMarks(response.data);
        } catch (err) {
            console.error('Failed to fetch marks:', err);
            setError('Failed to load marks. Please try again.');
            toast.error('Failed to load marks.');
        } finally {
            setLoading(false);
        }
    }, [currentUser, filter, debouncedSearchQuery, structureLoading]);

    useEffect(() => {
        if (currentUser) {
            fetchAcademicStructure();
        }
    }, [currentUser, fetchAcademicStructure]);

    useEffect(() => {
        if (currentUser && !structureLoading) {
            fetchInitialData();
        }
    }, [currentUser, structureLoading, fetchInitialData]);

    useEffect(() => {
        if (currentUser && !structureLoading) {
            fetchMarks();
        }
    }, [filter, debouncedSearchQuery, currentUser, structureLoading, fetchMarks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => {
            const newState = { ...prev, [name]: value };
            
            // Reset other academic filters if studentClass changes
            if (name === 'studentClass') {
                newState.classNumber = '';
                newState.degree = '';
                newState.semester = '';
            }
            // Reset semester if degree changes
            if (name === 'degree') {
                newState.semester = '';
            }
            return newState;
        });
    };

    const handleClearFilters = () => {
        setFilter({
            subject: '',
            marksType: '',
            studentClass: '',
            classNumber: '',
            degree: '',
            semester: '',
            month: '',
            year: '',
        });
        setSearchQuery('');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDelete = (id) => {
        setMarkToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsConfirmModalOpen(false);
        try {
            await api.delete(`/marks/${markToDelete}`);
            toast.success('Marks deleted successfully!');
            fetchMarks();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            toast.error(errorMessage);
            console.error(err);
        }
    };

    const handleEdit = (id) => {
        navigate(`/marks/edit/${id}`);
    };

    // Global loading check (including structure)
    if (structureLoading || loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    // Filter logic is largely managed by the backend using query params
    // This local filter is a minimal sanity check/fallback.
    const filteredMarks = marks.filter(mark => {
        const studentName = mark.student?.name?.toLowerCase() || '';
        const rollNumber = mark.student?.rollNumber?.toLowerCase() || '';
        const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || rollNumber.includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getTeacherAssignedClassesForFilter = () => {
        const classes = {};
        teacherAssignedClasses.forEach(ac => {
            if (!classes[ac.type]) {
                classes[ac.type] = [];
            }
            // Use classNumber for Class/Almiya, degreeName for BS to create unique list
            if (['Class', 'Almiya'].includes(ac.type) && ac.classNumber) {
                if (!classes[ac.type].includes(ac.classNumber)) {
                    classes[ac.type].push(ac.classNumber);
                }
            } else if (ac.type === 'BS' && ac.degreeName) {
                if (!classes[ac.type].includes(ac.degreeName)) {
                    classes[ac.type].push(ac.degreeName);
                }
            }
        });
        return classes;
    };
    const assignedClasses = getTeacherAssignedClassesForFilter();


    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-8 mb-8">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Marks List</h1>
                            <p className="text-emerald-50/90 mt-1 text-sm sm:text-base max-w-2xl">Search, filter and manage marks you have recorded.</p>
                        </div>
                    </div>
                </div>

                <div className={`p-5 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} border border-emerald-100`}>

            {/* Header with Search and Filter Toggle */}
            {(isAdmin || isTeacher) && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by student name or roll number..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 pl-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200 ring-1 ring-emerald-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 hover:shadow-md transition"
                    />
                    <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-gray-700"
                            title="Clear search"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition shadow-sm ring-1 ${showFilters ? 'bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-700' : 'bg-white/80 text-emerald-700 ring-emerald-100 hover:bg-white'} `}
                    >
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </button>
                    {(Object.values(filter).some(val => val !== '') || searchQuery !== '') && (
                        <button
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition shadow-sm bg-rose-50 text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                        >
                            <XMarkIcon className="h-5 w-5" />
                            <span>Clear</span>
                        </button>
                    )}
                </div>
            </div>

            )}
            {/* Filter Section (MODIFIED FOR DYNAMIC STRUCTURE) */}
            {(isAdmin || isTeacher) && showFilters && (
                <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ease-in-out bg-emerald-50/60 ring-1 ring-emerald-100`}>
                    <h2 className={`text-lg font-semibold mb-4 ${currentTheme?.title || 'text-gray-800'}`}>Filter Marks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        
                        {/* Subject Filter (Teacher only, dynamically filtered by assignment) */}
                        {currentUser.role === 'teacher' && (
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={filter.subject}
                                    onChange={handleFilterChange}
                                    className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                                >
                                    <option value="">All Subjects</option>
                                    {[...new Set(teacherSubjects)].map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {/* Marks Type Filter (Unchanged) */}
                        <div>
                            <label htmlFor="marksType" className="block text-sm font-medium text-gray-700">Marks Type</label>
                            <select
                                id="marksType"
                                name="marksType"
                                value={filter.marksType}
                                onChange={handleFilterChange}
                                className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                            >
                                <option value="">All Types</option>
                                {marksTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Student Class Type Filter (Dynamic) */}
                        <div>
                            <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700">Class Type</label>
                            <select
                                id="studentClass"
                                name="studentClass"
                                value={filter.studentClass}
                                onChange={handleFilterChange}
                                className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                            >
                                <option value="">All Types</option>
                                {academicStructure?.map(type => (
                                    <option key={type.slug} value={type.slug}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Conditional Filters for Class/Almiya */}
                        {selectedAcademicType && ['Class', 'Almiya'].includes(filter.studentClass) && (
                            <div>
                                <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">{selectedAcademicType.name} Grade/Number</label>
                                <select
                                    id="classNumber"
                                    name="classNumber"
                                    value={filter.classNumber}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">All Grades</option>
                                    {/* Filter options based on user role/assignments */}
                                    {currentUser.role === 'admin' ? (
                                        selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map(cls => (
                                            <option key={cls.classNumber} value={cls.classNumber}>{cls.classIdentifier} ({cls.classNumber})</option>
                                        ))
                                    ) : (
                                        assignedClasses[filter.studentClass]?.map(num => {
                                            const cls = selectedAcademicType.classConfig.find(c => c.classNumber === num);
                                            return cls ? <option key={num} value={num}>{cls.classIdentifier} ({num})</option> : null;
                                        })
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Conditional Filters for BS */}
                        {selectedAcademicType && filter.studentClass === 'BS' && (
                            <>
                                <div>
                                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
                                    <select
                                        id="degree"
                                        name="degree"
                                        value={filter.degree}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">All Degrees</option>
                                        {currentUser.role === 'admin' ? (
                                            selectedAcademicType.degreeConfig?.map(deg => (
                                                <option key={deg.degreeName} value={deg.degreeName}>{deg.degreeName}</option>
                                            ))
                                        ) : (
                                            assignedClasses[filter.studentClass]?.map(degName => (
                                                <option key={degName} value={degName}>{degName}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                {filter.degree && (
                                    <div>
                                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                                        <select
                                            id="semester"
                                            name="semester"
                                            value={filter.semester}
                                            onChange={handleFilterChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">All Semesters</option>
                                            {/* Get max semester for selected degree from structure */}
                                            {Array.from({ length: selectedAcademicType.degreeConfig?.find(d => d.degreeName === filter.degree)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
                                                <option key={sem} value={sem}>{sem}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Year Filter (Unchanged) */}
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                            <select
                                id="year"
                                name="year"
                                value={filter.year}
                                onChange={handleFilterChange}
                                className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                            >
                                <option value="">All Years</option>
                                {yearRange.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Month Filter (Unchanged) */}
                        <div>
                            <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
                            <select
                                id="month"
                                name="month"
                                value={filter.month}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="">All Months</option>
                                {months.map((month, index) => (
                                    <option key={month} value={index + 1}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

                <div className="mt-6 overflow-x-auto">
                {filteredMarks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="overflow-hidden rounded-t-2xl">
                        <table className="min-w-full divide-y" >
                            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                                <tr>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Student Name</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Subject</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Marks Type</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Name</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Date</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Obtained</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-white`}>Total</th>
                                    {currentUser.role === 'teacher' && (
                                        <th className={`py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide text-white`}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={`bg-white divide-y divide-emerald-50`}>
                                {filteredMarks.map((mark) => (
                                    <tr key={mark._id}>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.student?.name || 'N/A'}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.subject}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.marksType}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.marksName}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{new Date(mark.conductedDate).toLocaleDateString()}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.marksObtained}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap text-gray-700`}>{mark.totalMarks}</td>
                                        {currentUser.role === 'teacher' && (
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(mark._id)}
                                                    className={`p-1 rounded-md mr-2 transition-colors duration-200 text-emerald-600 hover:text-emerald-800`}
                                                    title="Edit Marks"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(mark._id)}
                                                    className={`p-1 rounded-md transition-colors duration-200 text-red-600 hover:text-red-800`}
                                                    title="Delete Marks"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ) : (
                    <p className={`text-xl text-center p-4 rounded-lg ${currentTheme?.panelBg || 'bg-gray-100'} ${currentTheme?.mutedText || 'text-gray-600'} ${currentTheme?.shadow || 'shadow-sm'}`}>
                        No marks found.
                    </p>
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this marks entry? This action cannot be undone."
            />
                </div>
            </div>
        </div>
    );
};

export default MarksList;