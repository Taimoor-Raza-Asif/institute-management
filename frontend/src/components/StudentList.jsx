// src/components/StudentList.jsx
import React, { useEffect, useState, useCallback, useContext } from 'react';
import api from '../api';
import Modal from './Modal';
import StudentForm from './StudentForm';
import { PencilIcon, TrashIcon, PlusIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon, EyeIcon, EllipsisVerticalIcon, UserCircleIcon,UsersIcon} from '@heroicons/react/24/outline';
import {
  ArrowPathIcon, // For Promotion
  ArrowUturnLeftIcon, // For Demotion
  ArrowLongRightIcon, // For Class/Semester Promotion
  ArrowLongLeftIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
// Assuming you have a Loader component available, otherwise uncomment the note below
// import Loader from './Loader'; // <-- UNCOMMENT IF YOU HAVE THIS COMPONENT

// Define months array (used in both StudentList and FeeForm)
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StudentList = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme(); // Use context
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

  const displayedStudents = students;

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
          <div className="text-xl text-green-600 animate-pulse">Loading Academic Structure...</div>
      </div>
  );


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className={`mb-8 p-6 rounded-xl flex items-center justify-between ${currentTheme?.heroBg || 'bg-emerald-50'} ${currentTheme?.shadow || 'shadow-md'}`}>
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${currentTheme?.heroTitle || 'text-green-800'}`}>Students Management</h1>
          <p className={`${currentTheme?.heroSubtitle || 'text-gray-600'} mt-1 text-sm`}>Manage student records, fees, and academic progress</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-white">
          <UsersIcon className={`h-5 w-5 ${currentTheme?.heroIcon || 'text-white'}`} />
          <span className="font-medium">{displayedStudents.length} Students</span>
        </div>
      </div>

      {/* Enhanced Search and Filter Card */}
      <div className={`mb-6 p-6 rounded-xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          {!isStudentRole && (
            <div className="relative w-full sm:w-1/2 lg:w-2/3">
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition ${currentTheme?.inputBg || 'border-gray-300 bg-gray-50'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                placeholder="Search by Name or CNIC..."
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`group flex items-center justify-center px-8 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnSecondaryBg || 'bg-white'} ${currentTheme.btnSecondaryText || 'text-emerald-700'} ${currentTheme.btnSecondaryBorder || 'border border-emerald-200'} ${currentTheme.btnSecondaryHover || 'hover:bg-emerald-50'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
              {canAddStudent && (
              <button onClick={handleAddStudent} className={`group flex items-center justify-center px-8 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 w-full sm:w-auto ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'}`}>
                <PlusIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />Student
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters (MODIFIED) */}
        {showAdvancedFilters && (
          <div className={`mt-6 pt-6 border-t ${currentTheme?.border || 'border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${currentTheme?.title || 'text-gray-800'}`}>Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* Student Status Filter (Unchanged) */}
              <div>
                <label htmlFor="filterStudentStatus" className="block text-sm font-semibold text-gray-700 mb-2">Student Status</label>
                <select
                  id="filterStudentStatus"
                  value={filterStudentStatus}
                  onChange={(e) => setFilterStudentStatus(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-200'} ${currentTheme?.inputFocus || 'focus:border-green-500'}`}
                >
                  <option value="All Students">All Students</option>
                  <option value="Regular">Regular</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Expelled">Expelled</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label htmlFor="filterGender" className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  id="filterGender"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className={`block w-full rounded-lg border shadow-sm p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-200'} ${currentTheme?.inputFocus || 'focus:border-green-500'}`}
                >
                  <option value="all">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Class Type Filter (Dynamic) */}
              <div>
                <label htmlFor="filterClassType" className="block text-sm font-semibold text-gray-700 mb-2">Class Type</label>
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
                  className={`block w-full rounded-lg border shadow-sm p-2.5 transition ${currentTheme?.inputBg || 'border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-200'} ${currentTheme?.inputFocus || 'focus:border-green-500'}`}
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
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

            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {/* Bulk Promotion/Demotion Buttons */}
              {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && filterClassType && ['Class', 'Almiya'].includes(filterClassType) && filterClassNumber && (
                <>
                  <button
                    onClick={() => handlePromoteClass(`/students/promote-class`, { classNumber: filterClassNumber, classType: filterClassType }, `from ${filterClassType} Class ${filterClassNumber}`)}
                    className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    Promote {filterClassType} {filterClassNumber}
                  </button>
                  <button
                    onClick={() => handleDemoteClass(`/students/demote-class`, { classNumber: filterClassNumber, classType: filterClassType }, `from ${filterClassType} Class ${filterClassNumber}`)}
                    className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Demote {filterClassType} {filterClassNumber}
                  </button>
                </>
              )}
              {((currentUser?.role === 'admin') || (currentUser?.role === 'teacher')) && (filterClassType === 'BS' && filterDegreeName && filterSemester) && (
                <>
                  <button
                    onClick={() => handlePromoteClass(`/students/promote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) }, `from ${filterDegreeName} Semester ${filterSemester}`)}
                    className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ArrowLongLeftIcon className="-ml-1 mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    Promote Semester {filterSemester}
                  </button>
                  <button
                    onClick={() => handleDemoteClass(`/students/demote-semester`, { degreeName: filterDegreeName, semester: parseInt(filterSemester) }, `from ${filterDegreeName} Semester ${filterSemester}`)}
                    className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ArrowLongRightIcon className="-ml-1 mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Demote Semester {filterSemester}
                  </button>
                </>
              )}
              <button onClick={handleResetFilters} className="group inline-flex items-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <XMarkIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Enhanced Table Container */}
      <div className="min-h-[400px] relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${currentTheme?.btnPrimaryBg || 'border-green-600'} mx-auto mb-3`}></div>
              <p className="text-lg font-medium text-gray-700">Loading students...</p>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex items-center justify-center z-10 border-2 border-red-300 rounded-xl">
            <div className="text-center p-6">
              <p className="text-lg font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} ${currentTheme?.border || 'border border-gray-100'}`}>
          <div className="overflow-x-auto rounded-xl overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${currentTheme?.theadBg || 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">F.Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">CNIC</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Grade/Juz</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Major/Degree</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Semester</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fee/month</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                  {(canEditStudent || canDeleteStudent) && (
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} columns={10} />)
                ) : Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
                  displayedStudents.map((s, index) => (
                    <tr
                      key={s._id}
                      className={`transition-all duration-150 ${currentTheme.tableHover || 'hover:bg-green-50'} ${index % 2 === 0 ? (currentTheme.tbodyBg || 'bg-white') : (currentTheme.tableStripedBg || 'bg-gray-50')} hover:shadow-md`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {s.profilePictureUrl ? (
                            <img
                              src={`http://localhost:5000${s.profilePictureUrl}`}
                              alt={`${s.name}'s Profile`}
                              className={`h-10 w-10 rounded-full object-cover ring-2 ${currentTheme.heroPillBorder || 'ring-green-100'} mr-3`}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/10b981/ffffff?text=' + s.name[0]; }}
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-full ${currentTheme.heroPillBg || 'bg-green-100'} flex items-center justify-center mr-3 ring-2 ${currentTheme.heroPillBorder || 'ring-green-200'}`}>
                              <span className={`${currentTheme.iconText || 'text-green-700'} font-bold text-sm`}>{s.name[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className={`text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{s.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{s.fatherName}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'} font-mono`}>{s.cnic || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${currentTheme.pillBg || 'bg-gray-100'} ${currentTheme.pillText || 'text-gray-800'} ${currentTheme.pillBorder || 'border border-gray-200'}`}>{s.class}</span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'} font-medium`}>
                        {s.class === 'Class' || s.class === 'Almiya' ? s.classNumber || '-' : s.class === 'Hifaz' ? `Juz ${s.currentJuz || 0}` : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{s.class === 'BS' ? s.degreeName || '-' : s.majorSubject || '-'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-600'}`}>{s.class === 'BS' ? s.semester || '-' : '-'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>PKR {s.feePerMonth || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${s.feeStatus === 'Paid' ? `${currentTheme.badgeSuccessBg || 'bg-green-100'} ${currentTheme.badgeSuccessText || 'text-green-800'}` : s.feeStatus === 'Partial Paid' ? `${currentTheme.badgeWarningBg || 'bg-amber-100'} ${currentTheme.badgeWarningText || 'text-amber-800'}` : `${currentTheme.badgeDangerBg || 'bg-red-100'} ${currentTheme.badgeDangerText || 'text-red-800'}`}`}>
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); handleViewStudentDetails(s); }} className={`p-2 ${currentTheme.iconText || 'text-green-600'} hover:${currentTheme.heroPillBg || 'bg-green-50'} ${currentTheme.heroPillBg || 'hover:bg-green-50'} rounded-lg transition-colors duration-200`} title="View Student Details">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* Action Dropdown Menu */}
                          <Menu as="div" className="relative inline-block text-left">
                            <div>
                              <MenuButton className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                              </MenuButton>
                            </div>
                            <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <UsersIcon className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-500">No students found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new student</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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