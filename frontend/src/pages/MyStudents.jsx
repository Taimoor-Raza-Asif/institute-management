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
        <div className={`min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50`}> 
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-8 mb-8">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Assigned Students</h1>
                            <p className="text-emerald-50/90 mt-1 text-sm sm:text-base max-w-2xl">Search, filter, and review students in your assigned classes.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/20">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">Total</p>
                                <p className="text-lg font-semibold">{students.length}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/20">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">Filtered</p>
                                <p className="text-lg font-semibold">{filteredStudents.length}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/20">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">Classes</p>
                                <p className="text-lg font-semibold">{assignedClasses.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className={`mb-6 p-4 rounded-2xl bg-white shadow-lg border border-emerald-100`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
                        <div className="relative w-full sm:w-2/3">
                            <input
                                type="text"
                                placeholder="Search by name, CNIC, or roll no..."
                                className={`h-11 p-2 pl-10 rounded-xl w-full bg-emerald-50/60 border border-emerald-200 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <MagnifyingGlassIcon className={`h-5 w-5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2`} />
                        </div>
                        <div className="w-full sm:w-auto">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl transition duration-200 w-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-md`}
                            >
                                <FunnelIcon className="h-5 w-5 mr-2" />
                                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                            </button>
                        </div>
                    </div>
      
            {showAdvancedFilters && (
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 p-4 rounded-xl bg-emerald-50/60 ring-1 ring-emerald-100`}>
          
                    {/* Filter by Assignment Type */}
                    {/* <div>
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
                                    className={`mt-1 block w-full p-2 rounded-xl shadow-sm sm:text-sm bg-white border border-emerald-200 text-gray-700`}
                            >
                                    <option value="">All Assigned Types</option>
                                    {/* Only show types assigned to the teacher */}
                                    {/* {[...new Set(assignedClasses.map(a => a.type))].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                    ))}
                            </select>
                    </div>  */}
          
                    {/* Conditional Class/Almiya Filter */}
                    {isClassOrAlmiya && selectedAcademicType && (
                            <div>
                                    <label htmlFor="filterClassNumber" className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>{selectedAcademicType.name} Grade</label>
                                    <select
                                            id="filterClassNumber"
                                            value={filterClassNumber}
                                            onChange={(e) => setFilterClassNumber(e.target.value)}
                                            className={`mt-1 block w-full p-2 rounded-xl shadow-sm sm:text-sm bg-white border border-emerald-200 text-gray-700`}
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
                                                    className={`mt-1 block w-full p-2 rounded-xl shadow-sm sm:text-sm bg-white border border-emerald-200 text-gray-700`}
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
                                                            className={`mt-1 block w-full p-2 rounded-xl shadow-sm sm:text-sm bg-white border border-emerald-200 text-gray-700`}
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
            <div className={`overflow-x-auto rounded-2xl bg-white shadow-lg overflow-y-auto relative mt-6 border border-emerald-100`}>
                <table className="w-full whitespace-nowrap table-auto">
                    <thead className={`bg-emerald-600 text-white uppercase text-xs leading-normal sticky top-0`}>
                        <tr>
                             <th className="px-6 py-3 text-left font-semibold tracking-wide">Name</th>
                            <th className="px-6 py-3 text-left font-semibold tracking-wide">CNIC / Roll No</th>
                            <th className="px-6 py-3 text-left font-semibold tracking-wide">Academic Details</th>
                            <th className="px-6 py-3 text-left font-semibold tracking-wide">Guardian Contact</th>
                            <th className="py-3 px-4 text-center font-semibold rounded-tr-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-emerald-50`}> 
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className={`hover:bg-emerald-50 transition duration-150 ease-in-out`}>
                                <td className={`py-3 px-4 text-gray-800 font-medium`}>{student.name}</td>
                                <td className={`py-3 px-4 text-gray-600`}>
                                    <p>{student.cnic}</p>
                                    <p className={`text-[11px] text-gray-500`}>{student.rollNumber && `Roll: ${student.rollNumber}`}</p>
                                </td>
                                <td className={`py-3 px-4 text-gray-600`}>
                                    {renderClassInfo(student)}
                                </td>
                                <td className={`py-3 px-4 text-gray-600`}>{student.guardianContact}</td>
                                <td className={`py-3 px-4 text-gray-600 text-center`}>
                                    <button
                                        onClick={() => handleViewStudent(student)}
                                        className={`text-emerald-600 hover:text-emerald-800 transition-colors duration-200 p-2 rounded-full hover:bg-emerald-100`}
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
        </div>
 );
};

export default MyStudents;