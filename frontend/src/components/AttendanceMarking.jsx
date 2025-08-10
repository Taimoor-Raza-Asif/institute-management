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
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      const params = {};

      if (attendanceType === 'Student') {
        if (isTeacher) {
          // Teachers fetch their assigned students from a new endpoint
          endpoint = '/attendance/students/assigned';
        } else { // Admin
          endpoint = '/attendance/students';
          if (filterClassType) params.classType = filterClassType;
          if (filterClassNumber) params.classNumber = filterClassNumber;
          if (filterDegreeName) params.degreeName = filterDegreeName;
          if (filterSemester) params.semester = filterSemester;
          if (filterMajorSubject) params.majorSubject = filterMajorSubject;
        }
      } else { // Staff
        if (!isAdmin) {
          // Teachers are not allowed to view staff attendance
          setError('Access denied.');
          setMembers([]);
          setLoading(false);
          return;
        }
        endpoint = '/attendance/staff';
        if (filterRole) {
          params.role = filterRole;
        }
      }

      console.log('Fetching members from endpoint:', endpoint, 'with params:', params);

      const { data } = await api.get(endpoint, { params });

      console.log('API Response data:', data);

      let fetchedMembers = [];
      if (Array.isArray(data)) {
        fetchedMembers = data;
      } else {
        setError('Received invalid data from the server.');
      }

      if (fetchedMembers.length > 0) {
        setMembers(fetchedMembers);
        // After fetching members, fetch their attendance for the selected date
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
  }, [attendanceType, isTeacher, isAdmin, filterClassType, filterClassNumber, filterDegreeName, filterSemester, filterMajorSubject, filterRole, fetchAttendanceForDate, selectedDate]);

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user, attendanceType, selectedDate, fetchMembers]);

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
      status: attendanceStatuses[member._id] || 'Present', // Default to present if not set
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
      // After submission, re-fetch attendance to update UI
      await fetchAttendanceForDate(selectedDate);
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
            disabled={isTeacher} // Teachers can't change type, always student
          >
            <option value="Student">Students</option>
            {isAdmin && <option value="Staff">Staff</option>}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FunnelIcon className="h-6 w-6 mr-2 text-gray-600" /> Filters
        </h3>

        {attendanceType === 'Student' && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Admin-only student filters */}
            {/* <div>
              <label htmlFor="classType" className="block text-sm font-medium text-gray-700">Class Type</label>
              <input type="text" id="classType" value={filterClassType} onChange={(e) => setFilterClassType(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div> */}

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
            <div>
              <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
              <input type="text" id="classNumber" value={filterClassNumber} onChange={(e) => setFilterClassNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
              <input type="text" id="degreeName" value={filterDegreeName} onChange={(e) => setFilterDegreeName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
              <input type="number" id="semester" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
              <input type="text" id="majorSubject" value={filterMajorSubject} onChange={(e) => setFilterMajorSubject(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchMembers} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {attendanceType === 'Staff' && isAdmin && (
          <div className="flex gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <input type="text" id="role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchMembers} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {isTeacher && attendanceType === 'Student' && (
          <p className="text-gray-600 italic">
            You are a teacher. The list below contains only students from your assigned classes.
          </p>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Students to Mark
        </h3>

        {loading ? (
          <Loader />
        ) : members.length === 0 ? (
          <Message type="info">No members found for this criteria.</Message>
        ) : (
          <form onSubmit={handleSubmitAttendance}>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Info</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.cnic}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.class === 'Class' ? `Class ${member.classNumber}` : `BS ${member.degreeName} (Sem ${member.semester})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Present')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Present' ? 'bg-green-100 text-green-800 ring-2 ring-green-600' : 'text-gray-400 hover:text-green-600'}`}
                            title="Present"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Absent')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Absent' ? 'bg-red-100 text-red-800 ring-2 ring-red-600' : 'text-gray-400 hover:text-red-600'}`}
                            title="Absent"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(member._id, 'Leave')}
                            className={`p-2 rounded-full ${attendanceStatuses[member._id] === 'Leave' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
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
            <div className="mt-6 text-right">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
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