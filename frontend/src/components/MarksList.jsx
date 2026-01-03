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
    const [studentSubjects, setStudentSubjects] = useState([]);
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
            // Build student subjects list from returned marks for student role
            if (currentUser.role === 'student') {
                const subs = Array.isArray(marksResponse.data)
                    ? [...new Set(marksResponse.data.map(m => m.subject).filter(Boolean))]
                    : [];
                setStudentSubjects(subs);
            }

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
            if (currentUser.role === 'student') {
                const subs = Array.isArray(response.data)
                    ? [...new Set(response.data.map(m => m.subject).filter(Boolean))]
                    : [];
                setStudentSubjects(subs);
            }
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
        const studentName = (mark.student?.name || mark.studentName || (isStudent ? currentUser?.name : '')).toLowerCase();
        const rollNumber = (mark.student?.rollNumber || mark.rollNumber || '').toLowerCase();
        const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || rollNumber.includes(searchQuery.toLowerCase());
        const matchesSubject = !filter.subject || (String(mark.subject || '').toLowerCase() === String(filter.subject || '').toLowerCase());
        const matchesMarksType = !filter.marksType || (String(mark.marksType || '') === String(filter.marksType || ''));
        return matchesSearch && matchesSubject && matchesMarksType;
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

    // Return class config entries that the current user may see for a given academic type
    const getAllowedClassConfigs = (typeSlug) => {
        const typeConfig = academicStructure?.find(t => t.slug === typeSlug);
        if (!typeConfig) return [];
        const configs = typeConfig.classConfig || [];
        if (isAdmin) return configs;

        // For teachers, include only configs that match their assigned classes by common fields
        return configs.filter(cfg => {
            return teacherAssignedClasses.some(ac => {
                if (ac.type !== typeSlug) return false;
                if (ac.classNumber && cfg.classNumber && String(ac.classNumber) === String(cfg.classNumber)) return true;
                if (ac.classIdentifier && cfg.classIdentifier && ac.classIdentifier === cfg.classIdentifier) return true;
                if (ac.className && cfg.className && ac.className === cfg.className) return true;
                return false;
            });
        });
    };


    return (
        <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className={`relative overflow-hidden rounded-3xl ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-2xl'} ${currentTheme?.title || 'text-white'} px-6 sm:px-10 py-8 mb-8`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold leading-tight ${currentTheme?.heroTitle || 'text-white'}`}>Marks List</h1>
                            <p className={`mt-1 text-sm sm:text-base max-w-2xl ${currentTheme?.heroSubtitle || 'text-emerald-50/90'}`}>Search, filter and manage marks you have recorded.</p>
                        </div>
                    </div>
                </div>

                <div className={`p-5 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-emerald-100'}`}>

            {/* Header with Search and Filter Toggle */}
            {(isAdmin || isTeacher) && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by student name or roll number..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={`w-full px-4 py-2 pl-12 rounded-2xl ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} ${currentTheme?.inputBorder || 'border border-gray-300'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} transition`}
                    />
                    <Search className={`h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-emerald-600'}`} />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${currentTheme?.iconText || 'text-gray-500'} hover:opacity-75 transition`}
                            title="Clear search"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {/* Compact Subject filter for students (visible without toggling Filters) */}
                {isStudent && studentSubjects.length > 0 && (
                    <div className="mt-3 md:mt-0 md:ml-4 w-full md:w-48">
                        <label htmlFor="subject-student" className="sr-only">Subject</label>
                        <select
                            id="subject-student"
                            name="subject"
                            value={filter.subject}
                            onChange={handleFilterChange}
                            className={`w-full px-3 py-2 rounded-2xl ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} ${currentTheme?.inputBorder || 'border border-gray-300'} shadow-sm focus:outline-none`}
                        >
                            <option value="">All Subjects</option>
                            {studentSubjects.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition shadow-sm ring-1 ${showFilters ? `${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ring-emerald-600 ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.border || 'ring-1 ring-gray-200'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
                    >
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </button>
                    {(Object.values(filter).some(val => val !== '') || searchQuery !== '') && (
                        <button
                            onClick={handleClearFilters}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl transition shadow-sm ring-1 ${currentTheme?.btnDangerBg || 'bg-red-50'} ${currentTheme?.btnDangerText || 'text-red-700'} ring-red-100 ${currentTheme?.btnDangerHover || 'hover:bg-red-100'}`}
                        >
                            <XMarkIcon className="h-5 w-5" />
                            <span>Clear</span>
                        </button>
                    )}
                </div>
            </div>

            )}
            {/* Student header: search + compact subject filter (visible to students) */}
            {isStudent && (
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/2">
                        <input
                            type="text"
                            placeholder="Search by student name or roll number..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`w-full px-4 py-2 pl-12 rounded-2xl ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} ${currentTheme?.inputBorder || 'border border-gray-300'} shadow-sm focus:outline-none focus:ring-2 ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} transition`}
                        />
                        <Search className={`h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 ${currentTheme?.iconText || 'text-emerald-600'}`} />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${currentTheme?.iconText || 'text-gray-500'} hover:opacity-75 transition`}
                                title="Clear search"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {studentSubjects.length > 0 && (
                        <div className="w-full md:w-48 md:ml-4">
                            <label htmlFor="subject-student" className="sr-only">Subject</label>
                            <select
                                id="subject-student"
                                name="subject"
                                value={filter.subject}
                                onChange={handleFilterChange}
                                className={`w-full px-3 py-2 rounded-2xl ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} ${currentTheme?.inputBorder || 'border border-gray-300'} shadow-sm focus:outline-none`}
                            >
                                <option value="">All Subjects</option>
                                {studentSubjects.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
            {/* Filter Section (MODIFIED FOR DYNAMIC STRUCTURE) */}
            {(isAdmin || isTeacher) && showFilters && (
                <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ease-in-out ${currentTheme?.panelBg || 'bg-emerald-50/60'} ${currentTheme?.panelBorder || 'ring-1 ring-emerald-100'}`}>
                    <h2 className={`text-lg font-semibold mb-4 ${currentTheme?.title || 'text-gray-800'}`}>Filter Marks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        
                        {/* Subject Filter (Teacher only, dynamically filtered by assignment) */}
                        {currentUser.role === 'teacher' && (
                            <div>
                                <label htmlFor="subject" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Subject</label>
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
                            <label htmlFor="marksType" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Marks Type</label>
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
                                {(
                                    (isAdmin)
                                    ? academicStructure?.map(type => (
                                        <option key={type.slug} value={type.slug}>{type.name}</option>
                                    ))
                                    : academicStructure
                                        ?.filter(type => teacherAssignedClasses.some(ac => ac.type === type.slug))
                                        .map(type => (
                                            <option key={type.slug} value={type.slug}>{type.name}</option>
                                        ))
                                )}
                            </select>
                        </div>
                        
                        {/* Conditional Filters for Class/Almiya */}
                        {selectedAcademicType && ['Class', 'Almiya'].includes(filter.studentClass) && (
                            <div>
                                <label htmlFor="classNumber" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>{selectedAcademicType.name}</label>
                                <select
                                    id="classNumber"
                                    name="classNumber"
                                    value={filter.classNumber}
                                    onChange={handleFilterChange}
                                    className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
                                >
                                    <option value="">All Grades</option>
                                    {/* Filter options based on user role/assignments */}
                                    {getAllowedClassConfigs(filter.studentClass)
                                        .sort((a, b) => (a.classNumber || 0) - (b.classNumber || 0))
                                        .map(cfg => (
                                            <option key={cfg.classIdentifier || cfg.classNumber || cfg.className} value={cfg.classNumber ?? cfg.classIdentifier ?? cfg.className}>
                                                {cfg.classIdentifier || cfg.className || String(cfg.classNumber)}{cfg.classNumber ? ` (${cfg.classNumber})` : ''}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        {/* Conditional Filters for BS */}
                        {selectedAcademicType && filter.studentClass === 'BS' && (
                            <>
                                <div>
                                    <label htmlFor="degree" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Degree</label>
                                    <select
                                        id="degree"
                                        name="degree"
                                        value={filter.degree}
                                        onChange={handleFilterChange}
                                        className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
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
                                        <label htmlFor="semester" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Semester</label>
                                        <select
                                            id="semester"
                                            name="semester"
                                            value={filter.semester}
                                            onChange={handleFilterChange}
                                            className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
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
                            <label htmlFor="year" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Year</label>
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
                            <label htmlFor="month" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Month</label>
                            <select
                                id="month"
                                name="month"
                                value={filter.month}
                                onChange={handleFilterChange}
                                className={`mt-1 block w-full rounded-md py-2 px-3 ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} border ${currentTheme?.inputBorder || 'border-gray-300'} focus:outline-none`}
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

                <div className={`mt-6 overflow-x-auto rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-200'}`}>
                {filteredMarks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="overflow-hidden">
                        <table className={`min-w-full divide-y ${currentTheme?.border || 'divide-gray-200'}`}>
                            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                                <tr>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Student Name</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Subject</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Marks Type</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Name</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Date</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Obtained</th>
                                    <th className={`py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide`}>Total</th>
                                    {currentUser.role === 'teacher' && (
                                        <th className={`py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide`}>Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${currentTheme?.border || 'divide-emerald-50'}`}>
                                {filteredMarks.map((mark) => (
                                    <tr key={mark._id} className={`transition-all duration-150 ${currentTheme?.tbodyBg || 'bg-white'} ${currentTheme?.tableHover || 'hover:bg-emerald-50'} ${currentTheme?.tableStripedBg || 'odd:bg-gray-50'}`}>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.student?.name || mark.studentName || (isStudent ? currentUser?.name : 'N/A')}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.subject}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.marksType}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.marksName}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{new Date(mark.conductedDate).toLocaleDateString()}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.marksObtained}</td>
                                        <td className={`py-3 px-4 whitespace-nowrap ${currentTheme?.text || 'text-gray-700'}`}>{mark.totalMarks}</td>
                                        {currentUser.role === 'teacher' && (
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(mark._id)}
                                                    className={`p-1 rounded-md mr-2 transition-colors duration-200 ${currentTheme?.iconText || 'text-emerald-600'} hover:opacity-75`}
                                                    title="Edit Marks"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(mark._id)}
                                                    className={`p-1 rounded-md transition-colors duration-200 ${currentTheme?.iconText || 'text-red-600'} hover:opacity-75`}
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