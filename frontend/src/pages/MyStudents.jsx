// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import api from '../api';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { UserContext } from '../App';
// import { FunnelIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
// import Modal from  '../components/Modal';
// import StudentForm from '../components/StudentForm';

// const MyStudents = () => {
//   const { currentUser } = useContext(UserContext);
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [filterClass, setFilterClass] = useState('');
//   const [filterSemester, setFilterSemester] = useState('');

//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const fetchTeacherAndStudents = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`);
//       const teacherAssignedClasses = teacherProfileResponse.data.assignClasses || [];
//       setAssignedClasses(teacherAssignedClasses);

//       const studentsResponse = await api.get('/students');
//       setStudents(studentsResponse.data);
//     } catch (err) {
//       console.error('Failed to fetch data:', err);
//       setError('Failed to load students. Please try again.');
//       toast.error('Failed to load students.');
//     } finally {
//       setLoading(false);
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     if (currentUser?.profileId) {
//       fetchTeacherAndStudents();
//     }
//   }, [currentUser, fetchTeacherAndStudents]);

//   const handleViewStudent = (student) => {
//     setSelectedStudent(student);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedStudent(null);
//     setIsModalOpen(false);
//   };

//   const filteredStudents = students.filter(student => {
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch = student.name.toLowerCase().includes(searchLower) ||
//                           student.cnic.toLowerCase().includes(searchLower) ||
//                           (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));

//     const matchesClassFilter = filterClass === '' || (student.class && student.class.toString().toLowerCase().includes(filterClass.toLowerCase()));
//     const matchesSemesterFilter = filterSemester === '' || (student.semester && student.semester.toString().toLowerCase().includes(filterSemester.toLowerCase()));

//     const isAssigned = assignedClasses.some(assignedClass => {
//       const studentClass = student.class || '';
//       const studentClassNumber = student.classNumber || '';
//       const studentDegree = student.degreeName || '';
//       const studentSemester = student.semester || '';

//       if (assignedClass.type === 'Class') {
//         return assignedClass.type === studentClass && assignedClass.classNumber === studentClassNumber;
//       } else if (assignedClass.type === 'BS') {
//         return assignedClass.degreeName === studentDegree &&
//                assignedClass.semester === studentSemester;
//       }
//       return false;
//     });

//     return matchesSearch && matchesClassFilter && matchesSemesterFilter && isAssigned;
//   });

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-4">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8">My Students</h1>
      
//       {assignedClasses.length > 0 ? (
//         <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
//           <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//             <div className="relative w-full sm:w-1/2">
//               <input
//                 type="text"
//                 placeholder="Search by name, CNIC, or roll no..."
//                 className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-green-500 focus:border-green-500"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             </div>
//             <div className="w-full sm:w-auto">
//               <button
//                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                 className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full"
//               >
//                 <FunnelIcon className="h-5 w-5 mr-2" />
//                 {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
//               </button>
//             </div>
//           </div>
//           {showAdvancedFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md shadow-inner">
//               <div>
//                 <label htmlFor="filterClass" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
//                 <input
//                   type="text"
//                   id="filterClass"
//                   value={filterClass}
//                   onChange={(e) => setFilterClass(e.target.value)}
//                   className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
//                 <input
//                   type="text"
//                   id="filterSemester"
//                   value={filterSemester}
//                   onChange={(e) => setFilterSemester(e.target.value)}
//                   className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <p className="text-xl text-gray-600 text-center p-4">You have not been assigned any classes yet.</p>
//       )}

//       {loading ? (
//         <p className="text-center text-gray-500">Loading students...</p>
//       ) : error ? (
//         <p className="text-center text-red-500">{error}</p>
//       ) : filteredStudents.length > 0 ? (
//         <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative mt-6">
//           <table className="w-full whitespace-nowrap table-auto">
//             <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
//               <tr>
//                 {/* <th className="py-3 px-4 border-b border-gray-200">Name</th>
//                 <th className="py-3 px-4 border-b border-gray-200">CNIC / Roll No</th>
//                 <th className="py-3 px-4 border-b border-gray-200">Class/Semester</th>
//                 <th className="py-3 px-4 border-b border-gray-200">Guardian Contact</th> */}
//                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC / Roll No</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class / Semester</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Contact</th>
//                 {/* <th className="py-3 px-4 border-b border-gray-200 rounded-tr-lg">Email</th> */}
//                 <th className="py-3 px-4 border-b border-gray-200 text-center rounded-tr-lg">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStudents.map((student) => (
//                 <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out">
//                   <td className="py-3 px-4 text-gray-800 font-medium">{student.name}</td>
//                   <td className="py-3 px-4 text-gray-600">{student.cnic}</td>
//                   <td className="py-3 px-4 text-gray-600">
//                     {student.semester ? `Semester ${student.semester} (${student.degreeName})` : `Class ${student.classNumber || student.class}`}
//                   </td>
//                   <td className="py-3 px-4 text-gray-600">{student.guardianContact}</td>
//                   {/* <td className="py-3 px-4 text-gray-600">{student.email}</td> */}
//                   <td className="py-3 px-4 text-gray-600 text-center">
//                     <button
//                       onClick={() => handleViewStudent(student)}
//                       className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-md hover:bg-green-100"
//                       title="View Student Details"
//                     >
//                       <EyeIcon className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-xl text-gray-600 text-center p-4 bg-gray-100 rounded-lg shadow-sm">
//           No students found matching your assigned classes or filters.
//         </p>
//       )}

//       <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
//         <StudentForm
//           editingStudent={selectedStudent}
//           onClose={handleCloseModal}
//           isViewMode={true}
//         />
//       </Modal>

//     </div>
//   );
// };

// export default MyStudents;




import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import { FunnelIcon, MagnifyingGlassIcon, EyeIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Modal from  '../components/Modal';
import StudentForm from '../components/StudentForm';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useTheme } from '../context/ThemeContext';


const MyStudents = () => {
  const { currentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicStructure, setAcademicStructure] = useState(null); // Keep structure here
  const [loading, setLoading] = useState(true);
  const [structureLoading, setStructureLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Use generic filter fields
  const [filterType, setFilterType] = useState(''); 
  const [filterClassNumber, setFilterClassNumber] = useState('');
  const [filterDegreeName, setFilterDegreeName] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to get configuration for a slug
  const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);


  // --- Step 1: Fetch Academic Structure and Teacher Assignments ---
  const fetchInitialData = useCallback(async () => {
    setStructureLoading(true);
    setError('');
    try {
        // 1. Fetch Academic Structure (This fetches the configuration necessary for StudentForm)
        const structureResponse = await api.get('/academic-structure');
        // Process structure data if necessary (e.g., converting Maps for BS subjects)
        const processedStructure = structureResponse.data.classTypes.map(type => {
            if (type.slug === 'BS' && type.degreeConfig) {
                return {
                    ...type,
                    degreeConfig: type.degreeConfig.map(degree => ({
                        ...degree,
                        subjectsBySemester: new Map(Object.entries(degree.subjectsBySemester || {}))
                    }))
                };
            }
            return type;
        });
        setAcademicStructure(processedStructure); // <-- Store processed structure

        // 2. Fetch Teacher's Assigned Classes
        const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`);
        const teacherAssignedClasses = teacherProfileResponse.data.assignClasses || [];
        setAssignedClasses(teacherAssignedClasses);
        
        // 3. Automatically set the initial filter type
        if (teacherAssignedClasses.length > 0 && !filterType) {
            setFilterType(teacherAssignedClasses[0].type);
        }

    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load initial configuration. Please try again.');
      toast.error('Failed to load configuration.');
    } finally {
      setStructureLoading(false);
    }
  }, [currentUser, filterType]);


  // --- Step 2: Fetch Students Assigned to Teacher (Unchanged) ---
  const fetchStudents = useCallback(async () => {
    if (structureLoading || assignedClasses.length === 0) return;
    setLoading(true);
    setError('');
    try {
      // Use the assigned students endpoint (backend filters by teacher's assignments)
      const studentsResponse = await api.get('/students');
      setStudents(studentsResponse.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students assigned to you.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [structureLoading, assignedClasses.length]);


  useEffect(() => {
    if (currentUser?.profileId) {
      fetchInitialData();
    }
  }, [currentUser, fetchInitialData]);

  useEffect(() => {
    if (!structureLoading && assignedClasses.length > 0) {
        fetchStudents();
    }
  }, [fetchStudents, structureLoading, assignedClasses.length]);


  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  // --- Filter Logic (Client-side filtering of already assigned students - Unchanged) ---
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(searchLower) ||
                          student.cnic.toLowerCase().includes(searchLower) ||
                          (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));

    // Filter by Type
    const matchesTypeFilter = filterType === '' || (student.class && student.class === filterType);
    
    // Filter by specific details
    let matchesDetailFilter = true;
    if (filterType === 'Class' || filterType === 'Almiya') {
        if (filterClassNumber) {
            matchesDetailFilter = matchesDetailFilter && (student.classNumber === filterClassNumber);
        }
    } else if (filterType === 'BS') {
        if (filterSemester) {
            matchesDetailFilter = matchesDetailFilter && (student.semester === parseInt(filterSemester));
        }
        if (filterDegreeName) {
            matchesDetailFilter = matchesDetailFilter && (student.degreeName === filterDegreeName);
        }
    }

    return matchesSearch && matchesTypeFilter && matchesDetailFilter;
  });

  // --- Helper to Render Class Info (Unchanged) ---
  const renderClassInfo = (student) => {
    switch (student.class) {
      case 'Class':
        return `Class ${student.classNumber} (${student.majorSubject || 'N/A'})`;
      case 'Almiya':
        const almiyaConfig = getAcademicConfig('Almiya');
        const classObj = almiyaConfig?.classConfig?.find(c => String(c.classNumber) === String(student.classNumber));
        return classObj ? `${classObj.classIdentifier} (Grade ${student.classNumber})` : `Almiya Grade ${student.classNumber}`;
      case 'BS':
        return `${student.degreeName} (Sem ${student.semester})`;
      case 'Hifaz':
        return `Hifaz (Juz ${student.currentJuz || 0})`;
      default:
        return student.class || 'N/A';
    }
  };


  const selectedAcademicType = getAcademicConfig(filterType);
  const isClassOrAlmiya = ['Class', 'Almiya'].includes(filterType);

    if (structureLoading || loading) {
        return <Loader />;
    }

  if (error) {
    return <Message type="error">{error}</Message>;
  }

    if (assignedClasses.length === 0) {
        return <p className={`text-xl ${currentTheme?.mutedText || 'text-gray-600'} text-center p-4`}>You have not been assigned any classes yet.</p>;
    }


    return (
        <div className={`container mx-auto p-4 sm:p-6 lg:p-4 ${currentTheme?.mainBg || ''}`}>
            <h1 className={`text-3xl sm:text-4xl font-bold text-center ${currentTheme?.title || 'text-green-800'} mb-8`}>My Assigned Students</h1>
      
        <div className={`mb-6 p-4 rounded-lg ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} ${currentTheme?.border || 'border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <div className="relative w-full sm:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by name, CNIC, or roll no..."
                        className={`p-2 pl-10 rounded-md w-full ${currentTheme?.inputBg || ''} ${currentTheme?.border || 'border border-gray-300'} ${currentTheme?.inputText || 'text-gray-700'} focus:ring-green-500 focus:border-green-500`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className={`h-5 w-5 ${currentTheme?.mutedText || 'text-gray-400'} absolute left-3 top-1/2 -translate-y-1/2`} />
                </div>
                <div className="w-full sm:w-auto">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center justify-center px-5 py-2 rounded-lg transition duration-200 w-full ${currentTheme?.panelBg || 'bg-gray-200'} ${currentTheme?.text || 'text-gray-800'} hover:bg-gray-300 ${currentTheme?.shadow || 'shadow-md'}`}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                    </button>
                </div>
            </div>
      
            {showAdvancedFilters && (
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 rounded-md ${currentTheme?.panelBg || 'bg-gray-50'} shadow-inner`}>
          
                    {/* Filter by Assignment Type */}
                    <div>
                            <label htmlFor="filterType" className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Filter by Type</label>
                            <select
                                    id="filterType"
                                    value={filterType}
                                    onChange={(e) => {
                                            setFilterType(e.target.value);
                                            setFilterClassNumber('');
                                            setFilterDegreeName('');
                                            setFilterSemester('');
                                    }}
                                    className={`mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm ${currentTheme?.inputBg || ''} ${currentTheme?.border || 'border border-gray-300'} ${currentTheme?.inputText || ''}`}
                            >
                                    <option value="">All Assigned Types</option>
                                    {/* Only show types assigned to the teacher */}
                                    {[...new Set(assignedClasses.map(a => a.type))].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                    ))}
                            </select>
                    </div>
          
                    {/* Conditional Class/Almiya Filter */}
                    {isClassOrAlmiya && selectedAcademicType && (
                            <div>
                                    <label htmlFor="filterClassNumber" className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>{selectedAcademicType.name} Grade</label>
                                    <select
                                            id="filterClassNumber"
                                            value={filterClassNumber}
                                            onChange={(e) => setFilterClassNumber(e.target.value)}
                                            className={`mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm ${currentTheme?.inputBg || ''} ${currentTheme?.border || 'border border-gray-300'} ${currentTheme?.inputText || ''}`}
                                    >
                                            <option value="">All Grades</option>
                                            {assignedClasses.filter(a => a.type === filterType).map(assignment => (
                                                    <option key={assignment.classNumber} value={assignment.classNumber}>
                                                            {assignment.classIdentifier} ({assignment.classNumber})
                                                    </option>
                                            ))}
                                    </select>
                            </div>
                    )}
          
                    {/* Conditional BS Filters */}
                    {filterType === 'BS' && (
                            <>
                                    <div>
                                            <label htmlFor="filterDegreeName" className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Degree</label>
                                            <select
                                                    id="filterDegreeName"
                                                    value={filterDegreeName}
                                                    onChange={(e) => { setFilterDegreeName(e.target.value); setFilterSemester(''); }}
                                                    className={`mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm ${currentTheme?.inputBg || ''} ${currentTheme?.border || 'border border-gray-300'} ${currentTheme?.inputText || ''}`}
                                            >
                                                    <option value="">All Degrees</option>
                                                    {[...new Set(assignedClasses.filter(a => a.type === 'BS').map(a => a.degreeName))].map(degree => (
                                                            <option key={degree} value={degree}>{degree}</option>
                                                    ))}
                                            </select>
                                    </div>
                                    {filterDegreeName && (
                                            <div>
                                                    <label htmlFor="filterSemester" className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Semester</label>
                                                    <select
                                                            id="filterSemester"
                                                            value={filterSemester}
                                                            onChange={(e) => setFilterSemester(e.target.value)}
                                                            className={`mt-1 block w-full p-2 rounded-md shadow-sm sm:text-sm ${currentTheme?.inputBg || ''} ${currentTheme?.border || 'border border-gray-300'} ${currentTheme?.inputText || ''}`}
                                                    >
                                                            <option value="">All Semesters</option>
                                                            {[...new Set(assignedClasses.filter(a => a.type === 'BS' && a.degreeName === filterDegreeName).map(a => a.semester))].map(sem => (
                                                                    <option key={sem} value={sem}>{sem}</option>
                                                            ))}
                                                    </select>
                                            </div>
                                    )}
                            </>
                    )}

                    {/* Hifaz filter requires no extra fields */}
                    {filterType === 'Hifaz' && (
                            <div className="md:col-span-3">
                                    <Message type="info">Filtering by Hifaz course.</Message>
                            </div>
                    )}
                </div>
            )}
        </div>


        {filteredStudents.length > 0 ? (
            <div className={`overflow-x-auto rounded-lg ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} overflow-y-auto relative mt-6 ${currentTheme?.border || 'border border-gray-100'}`}>
                <table className="w-full whitespace-nowrap table-auto">
                    <thead className={`${currentTheme?.theadBg || 'bg-green-600'} ${currentTheme?.theadText || 'text-white'} uppercase text-sm leading-normal`}>
                        <tr>
                             <th className="px-6 py-3 text-left font-medium tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left font-medium tracking-wider">CNIC / Roll No</th>
                            <th className="px-6 py-3 text-left font-medium tracking-wider">Academic Details</th>
                            <th className="px-6 py-3 text-left font-medium tracking-wider">Guardian Contact</th>
                            <th className="py-3 px-4 text-center font-medium rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`${currentTheme?.divide || 'divide-y divide-gray-200'}`}>
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className={`${currentTheme?.rowBorder || 'border-b border-gray-100'} hover:bg-green-50 transition duration-150 ease-in-out`}>
                                <td className={`py-3 px-4 ${currentTheme?.text || 'text-gray-800'} font-medium`}>{student.name}</td>
                                <td className={`py-3 px-4 ${currentTheme?.mutedText || 'text-gray-600'}`}>
                                    <p>{student.cnic}</p>
                                    <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'}`}>{student.rollNumber && `Roll: ${student.rollNumber}`}</p>
                                </td>
                                <td className={`py-3 px-4 ${currentTheme?.mutedText || 'text-gray-600'}`}>
                                    {renderClassInfo(student)}
                                </td>
                                <td className={`py-3 px-4 ${currentTheme?.mutedText || 'text-gray-600'}`}>{student.guardianContact}</td>
                                <td className={`py-3 px-4 ${currentTheme?.mutedText || 'text-gray-600'} text-center`}>
                                    <button
                                        onClick={() => handleViewStudent(student)}
                                        className={`${currentTheme?.linkText || 'text-green-600'} hover:text-green-800 transition-colors duration-200 p-2 rounded-full hover:bg-green-100`}
                                        title="View Student Details"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className={`text-xl ${currentTheme?.mutedText || 'text-gray-600'} text-center p-4 ${currentTheme?.panelBg || 'bg-gray-100'} rounded-lg shadow-sm`}>
                No students found matching your filters.
            </p>
        )}

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
            <StudentForm
                editingStudent={selectedStudent}
                onClose={handleCloseModal}
                isViewMode={true}
                academicStructure={academicStructure} // <-- PASS THE STRUCTURE HERE
            />
        </Modal>

    </div>
 );
};

export default MyStudents;