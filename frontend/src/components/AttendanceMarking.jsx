import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDaysIcon, UserGroupIcon, FunnelIcon, CheckIcon, XMarkIcon, ClipboardDocumentCheckIcon, BookOpenIcon, UserIcon
} from '@heroicons/react/24/outline';

const AttendanceMarking = () => {
  const { currentUser: user } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [academicStructure, setAcademicStructure] = useState(null);
  const [structureLoading, setStructureLoading] = useState(true);
  const [assignedClasses, setAssignedClasses] = useState([]); // teacher assignments

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
  const [filterMajorSubject, setFilterMajorSubject] = useState(''); // Only applicable to 'Class' type
  
  // Staff-specific filter
  const [filterRole, setFilterRole] = useState('');

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  
  // Helper to get selected academic type config
  const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
  const selectedAcademicType = getAcademicConfig(filterClassType);


  // --- New: Fetch Academic Structure ---
  const fetchAcademicStructure = useCallback(async () => {
    setStructureLoading(true);
    try {
      const { data } = await api.get('/academic-structure');
      setAcademicStructure(data.classTypes);
      // Keep `filterClassType` empty so the UI shows "Select Type" / "All Assigned Types".
      setFilterClassType('');
      if (isTeacher) {
        setAttendanceType('Student'); // Teachers only mark students
        // fetch teacher assigned classes so we can populate teacher-only options
        try {
          if (user?.profileId) {
            const resp = await api.get(`/staff/${user.profileId}`);
            setAssignedClasses(resp.data.assignClasses || []);
          }
        } catch (err) {
          console.error('Failed to fetch teacher assigned classes:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic structure:', err);
      setError('Failed to load academic structure for filters.');
    } finally {
      setStructureLoading(false);
    }
  }, [isTeacher, user?.profileId]);

  useEffect(() => {
    if (user) {
      fetchAcademicStructure();
    }
  }, [user, fetchAcademicStructure]);


  const fetchAttendanceForDate = useCallback(async (date) => {
    try {
      const { data } = await api.get(`/attendance/${date}`);
      const statuses = {};
      data.forEach(record => {
        if (record.onModel === attendanceType) {
          statuses[record.user._id] = record.status;
        }
      });
      setAttendanceStatuses(statuses);
    } catch (err) {
      console.error('Error fetching attendance for date:', err);
      setError('Failed to fetch existing attendance for this date.');
      setAttendanceStatuses({});
    }
  }, [attendanceType]);


  const fetchMembers = useCallback(async () => {
    if (structureLoading) return;
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    // Admin must select a student type filter before fetching students
    if (!isTeacher && attendanceType === 'Student' && !filterClassType) {
      setLoading(false);
      return;
    }
    
    // Teachers skip filters and fetch assigned students
    if (isTeacher && attendanceType === 'Staff') {
        setError('Access denied. Teachers are not authorized to mark staff attendance.');
        setMembers([]);
        setLoading(false);
        return;
    }

    try {
      let endpoint = '';
      const params = {};

      if (attendanceType === 'Student') {
        if (isTeacher) {
          endpoint = '/attendance/students/assigned';
        } else { // Admin (uses filters)
          endpoint = '/attendance/students';
          if (filterClassType) params.classType = filterClassType;

          if (['Class', 'Almiya'].includes(filterClassType)) {
             if (filterClassNumber) params.classNumber = filterClassNumber;
             if (filterMajorSubject) params.majorSubject = filterMajorSubject;
          } else if (filterClassType === 'BS') {
             if (filterDegreeName) params.degreeName = filterDegreeName;
             if (filterSemester) params.semester = filterSemester;
          }
          // Hifaz requires no further filters (only type filter)
        }
      } else { // Staff (Admin only)
        endpoint = '/attendance/staff';
        if (filterRole) params.role = filterRole;
      }

      const { data } = await api.get(endpoint, { params });

      let fetchedMembers = [];
      if (Array.isArray(data)) {
        fetchedMembers = data;
      } else {
        setError('Received unexpected data format from the server.');
      }

      if (fetchedMembers.length > 0) {
        // If teacher fetched assigned members, allow client-side filtering
        if (isTeacher && attendanceType === 'Student') {
          let filtered = fetchedMembers;
          if (filterClassType) filtered = filtered.filter(m => m.class === filterClassType);
          if (['Class', 'Almiya'].includes(filterClassType) && filterClassNumber) {
            filtered = filtered.filter(m => String(m.classNumber) === String(filterClassNumber));
          }
          if (filterClassType === 'BS') {
            if (filterDegreeName) filtered = filtered.filter(m => m.degreeName === filterDegreeName);
            if (filterSemester) filtered = filtered.filter(m => String(m.semester) === String(filterSemester));
          }
          if (filterMajorSubject) filtered = filtered.filter(m => (m.majorSubject || '').toLowerCase().includes(filterMajorSubject.toLowerCase()));
          setMembers(filtered);
        } else {
          setMembers(fetchedMembers);
        }
        await fetchAttendanceForDate(selectedDate);
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
  }, [attendanceType, isTeacher, isAdmin, filterClassType, filterClassNumber, filterDegreeName, filterSemester, filterMajorSubject, filterRole, fetchAttendanceForDate, selectedDate, structureLoading]);

  useEffect(() => {
    if (user && !structureLoading) {
      fetchMembers();
    }
  }, [user, attendanceType, selectedDate, fetchMembers, structureLoading]);

  const handleStatusChange = (userId, status) => {
    setAttendanceStatuses(prev => ({ ...prev, [userId]: status }));
  };

  const handleFilterChange = () => {
    if (!filterClassType && attendanceType === 'Student' && isAdmin) {
      setError('Please select a Class Type before applying filters.');
      return;
    }
    fetchMembers();
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    if (members.length === 0) {
      setError('No members selected for attendance submission.');
      setLoading(false);
      return;
    }

    const recordsToSubmit = members.map(member => ({
      userId: member._id,
      status: attendanceStatuses[member._id] || 'Present', // Default to present if not set
      // Only include specific student details if marking students
      ...(attendanceType === 'Student' && {
        studentClass: member.class,
        studentClassNumber: member.classNumber,
        studentSemester: member.semester,
        studentDegreeName: member.degreeName,
        studentMajorSubject: member.majorSubject,
        currentJuz: member.currentJuz, // NEW HIFAZ FIELD
        currentSurah: member.currentSurah, // NEW HIFAZ FIELD
      }),
    }));

    try {
      const { data } = await api.post('/attendance/mark', {
        date: selectedDate,
        attendanceRecords: recordsToSubmit,
        type: attendanceType,
      });
      setSuccessMessage(data.message || 'Attendance marked successfully!');
      await fetchAttendanceForDate(selectedDate);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceTypeChange = (e) => {
    const newType = e.target.value;
    setAttendanceType(newType);
    setFilterClassType('');
    setFilterClassNumber('');
    setFilterDegreeName('');
    setFilterSemester('');
    setFilterMajorSubject('');
    setFilterRole('');
    setMembers([]);
    // Keep filters cleared when switching types so the user explicitly chooses them.
    // Teachers will fetch assigned students without requiring manual filter selection.
  };

  // Helper to display class info dynamically
  const getClassInfo = (member) => {
      switch (member.class) {
          case 'Class':
              return `Class ${member.classNumber} (${member.majorSubject})`;
          case 'Almiya':
              // Find the class identifier using classNumber
              const almiyaConfig = getAcademicConfig('Almiya');
              const classIdentifier = almiyaConfig?.classConfig.find(c => c.classNumber === member.classNumber)?.classIdentifier;
              return `${classIdentifier} (Grade ${member.classNumber})`;
          case 'BS':
              return `${member.degreeName} (Sem ${member.semester})`;
          case 'Hifaz':
              return `Hifaz (Juz ${member.currentJuz} - ${member.currentSurah || 'N/A'})`;
          default:
              return member.class || 'N/A';
      }
  };


  if (structureLoading) return <Loader />;
  if (error && !structureLoading) return <Message type="error">{error}</Message>;


  return (
    <div className={`container mx-auto p-4 sm:p-6 lg:p-8 ${currentTheme?.mainBg || 'bg-gray-50'}`}>
      {/* Hero Header */}
      <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 text-left">
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>
            <ClipboardDocumentCheckIcon className="h-9 w-9 inline-block mr-3" /> Mark Attendance
          </h1>
          <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm`}>Track daily attendance for students and staff members</p>
        </div>
      </div>

      {successMessage && <Message type="success">{successMessage}</Message>}
      {error && <Message type="error">{error}</Message>}

      {/* Date and Type Selection Card */}
      <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-xl p-6 mb-6 ${currentTheme?.border || 'border border-gray-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="attendanceDate" className={`block text-sm font-medium ${currentTheme?.mutedText || 'text-gray-700'} mb-2`}>
              <CalendarDaysIcon className={`h-5 w-5 inline-block mr-2 ${currentTheme?.iconText || 'text-green-600'}`} /> Select Date
            </label>
            <input
              type="date"
              id="attendanceDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="attendanceType" className={`block text-sm font-medium ${currentTheme?.mutedText || 'text-gray-700'} mb-2`}>
              <UserGroupIcon className={`h-5 w-5 inline-block mr-2 ${currentTheme?.iconText || 'text-green-600'}`} /> Select Type
            </label>
            <select
              id="attendanceType"
              value={attendanceType}
              onChange={handleAttendanceTypeChange}
              className={`block w-full h-12 px-4 rounded-lg ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
              disabled={isTeacher}
            >
              <option value="Student">Students</option>
              {isAdmin && <option value="Staff">Staff</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl ${currentTheme?.shadow || 'shadow-xl'} p-6 mb-6 ${currentTheme?.border || 'border border-gray-100'}`}>
        <h3 className={`text-xl font-bold ${currentTheme?.title || currentTheme?.text || 'text-gray-900'} mb-6 flex items-center border-b pb-3`}>
          <FunnelIcon className={`h-6 w-6 mr-2 ${currentTheme?.iconText || 'text-green-600'}`} /> Filters
        </h3>

        {attendanceType === 'Student' && (isAdmin || isTeacher) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Class Type Filter (Dynamic for admin or teacher) */}
            <div>
              <label htmlFor="filterClassType" className="block text-sm font-medium text-gray-700">Class Type</label>
              <select
                id="filterClassType"
                value={filterClassType}
                onChange={(e) => {
                  setFilterClassType(e.target.value);
                  setFilterClassNumber('');
                  setFilterDegreeName('');
                  setFilterSemester('');
                  setFilterMajorSubject('');
                }}
                className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-green-500'} sm:text-sm`}
              >
                <option value="">{isTeacher ? 'All Assigned Types' : 'Select Type'}</option>
                {isTeacher ? (
                  // show only types assigned to this teacher
                  [...new Set(assignedClasses.map(a => a.type))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))
                ) : (
                  academicStructure?.map(type => (
                    <option key={type.slug} value={type.slug}>{type.name}</option>
                  ))
                )}
              </select>
            </div>
            
            {/* Conditional Filters based on selected type */}
            {selectedAcademicType && ['Class', 'Almiya'].includes(filterClassType) && (
              <div>
                <label htmlFor="filterClassNumber" className="block text-sm font-medium text-gray-700">Grade/Number</label>
                <select
                  id="filterClassNumber"
                  value={filterClassNumber}
                  onChange={(e) => setFilterClassNumber(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-green-500'} sm:text-sm`}
                >
                  <option value="">All Grades</option>
                  {isTeacher ? (
                    // derive unique class assignments for this teacher & type
                    Array.from(new Map(assignedClasses.filter(a => a.type === filterClassType).map(a => [String(a.classNumber), a])).values()).map((assignment) => (
                      <option key={assignment.classNumber} value={assignment.classNumber}>
                        {assignment.classIdentifier} (ID: {assignment.classNumber})
                      </option>
                    ))
                  ) : (
                    selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map((cls) => (
                      <option key={cls.classNumber} value={cls.classNumber}>
                          {cls.classIdentifier} (ID: {cls.classNumber})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
            
            {selectedAcademicType && filterClassType === 'BS' && (
              <>
                <div>
                  <label htmlFor="filterDegreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                  <select
                    id="filterDegreeName"
                    value={filterDegreeName}
                    onChange={(e) => { setFilterDegreeName(e.target.value); setFilterSemester(''); }}
                    className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-green-500'} sm:text-sm`}
                  >
                    <option value="">All Degrees</option>
                    {isTeacher ? (
                      [...new Set(assignedClasses.filter(a => a.type === 'BS').map(a => a.degreeName))].map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))
                    ) : (
                      selectedAcademicType.degreeConfig?.map(degree => (
                        <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                      ))
                    )}
                  </select>
                </div>
                {filterDegreeName && (
                  <div>
                    <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                      id="filterSemester"
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none ${currentTheme?.inputRing || 'focus:ring-green-500'} sm:text-sm`}
                    >
                      <option value="">All Semesters</option>
                      {isTeacher ? (
                        // collect semesters available for this teacher+degree
                        [...new Set(assignedClasses.filter(a => a.type === 'BS' && a.degreeName === filterDegreeName).map(a => a.semester))].map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))
                      ) : (
                        Array.from({ length: selectedAcademicType.degreeConfig?.find(d => d.degreeName === filterDegreeName)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </>
            )}

            {isTeacher && attendanceType === 'Student' && (
              <p className="text-gray-600 italic lg:col-span-4">
                You are a teacher. Use the filters above to narrow your assigned students by type/grade/degree.
              </p>
            )}
            
            {attendanceType === 'Student' && (
              <div className="flex items-end lg:col-span-1 md:col-span-2">
                <button 
                  onClick={handleFilterChange} 
                  className={`w-full h-12 flex items-center justify-center px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:from-green-700 hover:to-green-800'} ${currentTheme?.shadow || 'shadow-md'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isAdmin && !filterClassType}
                >
                  <FunnelIcon className="h-5 w-5 mr-2" /> Load Members
                </button>
              </div>
            )}
            
          </div>
        )}

        {attendanceType === 'Staff' && isAdmin && (
          <div className="flex gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select 
                id="role" 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                 <option value="">All Staff</option>
                 <option value="Teacher">Teacher</option>
                 <option value="Admin">Admin</option>
                 <option value="Accountant">Accountant</option>
                 <option value="Cook">Cook</option>
                 <option value="Cleaner">Cleaner</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleFilterChange} className={`w-full h-12 flex items-center justify-center px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryBorder || 'border border-emerald-700'} shadow-md`}>
                <FunnelIcon className="h-5 w-5 mr-2" /> Load Staff
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="mt-8">
        <h3 className={`text-2xl font-bold ${currentTheme?.title || currentTheme?.text || 'text-gray-900'} mb-4 px-1 flex items-center`}>
            <UserIcon className={`h-6 w-6 mr-2 ${currentTheme?.iconText || 'text-gray-700'}`}/> {attendanceType === 'Student' ? 'Student List' : 'Staff List'}
        </h3>

        {loading ? (
          <Loader />
        ) : members.length === 0 ? (
          <Message type="info">
            {isTeacher ? "No students found in your assigned classes." : "No members found for this criteria."}
          </Message>
        ) : (
          <form onSubmit={handleSubmitAttendance}>
            <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl ${currentTheme?.shadow || 'shadow-lg'} overflow-hidden ${currentTheme?.border || 'border border-gray-100'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Class Info</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
                  {members.map((member) => (
                    <tr key={member._id} className={`transition-all duration-150 ${currentTheme?.tableHover || 'hover:bg-emerald-50'} ${currentTheme?.tableStripedBg || currentTheme?.tableStripe || 'odd:bg-gray-50'} ${currentTheme?.tbodyBg || 'bg-white'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${currentTheme?.text || 'text-gray-900'}`}>{member.name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>{member.cnic}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.mutedText || 'text-gray-600'}`}>
                        {attendanceType === 'Student' ? getClassInfo(member) : member.staffType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Present')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Present' ? `${currentTheme?.badgeSuccessBg || 'bg-green-100'} ${currentTheme?.badgeSuccessText || 'text-green-800'} ring-2 ring-green-600` : `${currentTheme?.iconText || 'text-gray-400'} hover:${currentTheme?.linkText || 'text-green-600'}`}`}
                            title="Present"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Absent')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Absent' ? `${currentTheme?.badgeDangerBg || 'bg-red-100'} ${currentTheme?.badgeDangerText || 'text-red-800'} ring-2 ring-red-600` : `${currentTheme?.iconText || 'text-gray-400'} hover:${currentTheme?.linkText || 'text-red-600'}`}`}
                            title="Absent"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Leave')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Leave' ? `${currentTheme?.badgeWarningBg || 'bg-yellow-100'} ${currentTheme?.badgeWarningText || 'text-yellow-800'} ring-2 ring-yellow-600` : `${currentTheme?.iconText || 'text-gray-400'} hover:${currentTheme?.linkText || 'text-yellow-600'}`}`}
                            title="Leave"
                          >
                            <UserGroupIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className={`flex items-center justify-center h-12 px-8 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryBorder || 'border border-emerald-700'}`}
                disabled={loading}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                {loading ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarking;