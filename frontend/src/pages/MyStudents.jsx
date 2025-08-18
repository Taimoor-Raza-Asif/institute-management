// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import api from '../api';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { UserContext } from '../App';
// import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

//   const filteredStudents = students.filter(student => {
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch =
//       student.name.toLowerCase().includes(searchLower) ||
//       student.cnic.toLowerCase().includes(searchLower) ||
//       (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));

//     const matchesClassFilter =
//       filterClass === '' || student.class?.toString().toLowerCase().includes(filterClass.toLowerCase());
//     const matchesSemesterFilter =
//       filterSemester === '' || student.semester?.toString().toLowerCase().includes(filterSemester.toLowerCase());

//     const isAssigned = assignedClasses.some(assignedClass => {
//       const studentClass = student.class || '';
//       const studentClassNumber = student.classNumber || '';
//       const studentDegree = student.degreeName || '';
//       const studentSemester = student.semester || '';

//       if (assignedClass.type === 'Class') {
//         return assignedClass.type === studentClass && assignedClass.classNumber === studentClassNumber;
//       } else if (assignedClass.type === 'BS') {
//         return assignedClass.degreeName === studentDegree && assignedClass.semester === studentSemester;
//       }
//       return false;
//     });

//     return matchesSearch && matchesClassFilter && matchesSemesterFilter && isAssigned;
//   });

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-4">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">My Students</h1>

//       {assignedClasses.length > 0 ? (
//         <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//             <div className="relative w-full sm:w-1/2 lg:w-2/3">
//               <input
//                 type="text"
//                 placeholder="Search by name, CNIC, or roll no..."
//                 className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             </div>
//             <button
//               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//               className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full sm:w-auto"
//             >
//               <FunnelIcon className="h-5 w-5 mr-2" />
//               {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
//               {showAdvancedFilters ? <XMarkIcon className="h-4 w-4 ml-2" /> : null}
//             </button>
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
//         <div className="text-center py-10">Loading students...</div>
//       ) : error ? (
//         <div className="text-center py-10 text-red-500">{error}</div>
//       ) : filteredStudents.length > 0 ? (
//         <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
                // <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                // <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC / Roll No</th>
                // <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class / Semester</th>
                // <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Contact</th>
//                 {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th> */}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredStudents.map((student) => (
//                 <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{student.cnic}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {student.semester ? `Semester ${student.semester} (${student.degreeName})` : `Class ${student.classNumber || student.class}`}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{student.guardianContact}</td>
//                   {/* <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td> */}
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
//     </div>
//   );
// };

// export default MyStudents;



import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import { FunnelIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import Modal from  '../components/Modal';
import StudentForm from '../components/StudentForm';

const MyStudents = () => {
  const { currentUser } = useContext(UserContext);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeacherAndStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`);
      const teacherAssignedClasses = teacherProfileResponse.data.assignClasses || [];
      setAssignedClasses(teacherAssignedClasses);

      const studentsResponse = await api.get('/students');
      setStudents(studentsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load students. Please try again.');
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.profileId) {
      fetchTeacherAndStudents();
    }
  }, [currentUser, fetchTeacherAndStudents]);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(searchLower) ||
                          student.cnic.toLowerCase().includes(searchLower) ||
                          (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));

    const matchesClassFilter = filterClass === '' || (student.class && student.class.toString().toLowerCase().includes(filterClass.toLowerCase()));
    const matchesSemesterFilter = filterSemester === '' || (student.semester && student.semester.toString().toLowerCase().includes(filterSemester.toLowerCase()));

    const isAssigned = assignedClasses.some(assignedClass => {
      const studentClass = student.class || '';
      const studentClassNumber = student.classNumber || '';
      const studentDegree = student.degreeName || '';
      const studentSemester = student.semester || '';

      if (assignedClass.type === 'Class') {
        return assignedClass.type === studentClass && assignedClass.classNumber === studentClassNumber;
      } else if (assignedClass.type === 'BS') {
        return assignedClass.degreeName === studentDegree &&
               assignedClass.semester === studentSemester;
      }
      return false;
    });

    return matchesSearch && matchesClassFilter && matchesSemesterFilter && isAssigned;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-800 mb-8">My Students</h1>
      
      {assignedClasses.length > 0 ? (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="relative w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Search by name, CNIC, or roll no..."
                className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md w-full"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            </div>
          </div>
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md shadow-inner">
              <div>
                <label htmlFor="filterClass" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  id="filterClass"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="text"
                  id="filterSemester"
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xl text-gray-600 text-center p-4">You have not been assigned any classes yet.</p>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading students...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredStudents.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative mt-6">
          <table className="w-full whitespace-nowrap table-auto">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                {/* <th className="py-3 px-4 border-b border-gray-200">Name</th>
                <th className="py-3 px-4 border-b border-gray-200">CNIC / Roll No</th>
                <th className="py-3 px-4 border-b border-gray-200">Class/Semester</th>
                <th className="py-3 px-4 border-b border-gray-200">Guardian Contact</th> */}
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC / Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class / Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Contact</th>
                {/* <th className="py-3 px-4 border-b border-gray-200 rounded-tr-lg">Email</th> */}
                <th className="py-3 px-4 border-b border-gray-200 text-center rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-3 px-4 text-gray-800 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-gray-600">{student.cnic}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {student.semester ? `Semester ${student.semester} (${student.degreeName})` : `Class ${student.classNumber || student.class}`}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{student.guardianContact}</td>
                  {/* <td className="py-3 px-4 text-gray-600">{student.email}</td> */}
                  <td className="py-3 px-4 text-gray-600 text-center">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100"
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
        <p className="text-xl text-gray-600 text-center p-4 bg-gray-100 rounded-lg shadow-sm">
          No students found matching your assigned classes or filters.
        </p>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <StudentForm
          editingStudent={selectedStudent}
          onClose={handleCloseModal}
          isViewMode={true}
        />
      </Modal>

    </div>
  );
};

export default MyStudents;