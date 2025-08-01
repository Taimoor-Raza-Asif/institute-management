// // src/pages/MyStudents.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../api';
// import api from 'api';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const MyStudents = ({ currentUser }) => {
//   const [assignedClasses, setAssignedClasses] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchTeacherAndStudents = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };

//         // 1. Fetch the current teacher's profile to get assignedClasses
//         const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`, config);
//         const teacherAssignedClasses = teacherProfileResponse.data.assignClasses || [];
//         setAssignedClasses(teacherAssignedClasses);

//         // 2. Fetch all students
//         // In a production app with many students, you'd ideally have a backend endpoint
//         // that filters students by class/semester to avoid fetching all students.
//         const studentsResponse = await api.get('/students', config);
//         setStudents(studentsResponse.data);

//         // 3. Filter students based on assignedClasses using student.classNumber and student.semester
//         const matchedStudents = studentsResponse.data.filter(student =>
//           teacherAssignedClasses.some(assignedClass => {
//             const normalizedAssignedClass = assignedClass.trim().toLowerCase();

//             // Case 1: Matching "Class X" format (e.g., "Class 7", "Class 10")
//             // This assumes student.classNumber is a string like "7" or "10"
//             if (normalizedAssignedClass.startsWith('class ')) {
//               const classNumberFromAssigned = normalizedAssignedClass.substring(6).trim();
//               return student.classNumber === classNumberFromAssigned;
//             }

//             // Case 2: Matching "Degree Semester Y" format (e.g., "BS Semester 3", "BS Semester 7")
//             // This assumes student.class is a string like "BS" and student.semester is a number like 3
//             if (normalizedAssignedClass.includes('semester ')) {
//               const parts = normalizedAssignedClass.split('semester ');
//               const degreePart = parts[0].trim(); // e.g., "bs"
//               const semesterPart = parseInt(parts[1].trim(), 10); // e.g., 3

//               // Match both degree part (if specified) and semester number
//               // If degreePart is empty (e.g., "Semester 3"), it will match any degree with that semester.
//               // This logic assumes `student.class` will match the degree prefix (e.g., "BS").
//               const degreeMatch = degreePart === '' || student.class.toLowerCase() === degreePart;
//               const semesterMatch = student.semester === semesterPart;

//               return degreeMatch && semesterMatch;
//             }

//             // Fallback: Direct match if assignedClass is neither "Class X" nor "Degree Semester Y"
//             // This might catch cases where assignedClass is simply "Grade 5" and student.class is "Grade 5"
//             return student.class.toLowerCase() === normalizedAssignedClass;
//           })
//         );
//         setFilteredStudents(matchedStudents);

//       } catch (err) {
//         console.error('Error fetching data for My Students:', err);
//         setError('Failed to load students. Please check your network or try again.');
//         toast.error('Failed to load students: ' + (err.response?.data?.message || err.message));
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (currentUser && currentUser.profileId) {
//       fetchTeacherAndStudents();
//     } else {
//       setLoading(false);
//       setError('User profile not found. Please log in again.');
//     }
//   }, [currentUser]); // Re-run when currentUser changes

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6 text-center text-blue-500 mt-6">
//         Loading students...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto p-6 text-center text-red-500 mt-6">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Assigned Students</h2>

//       {assignedClasses.length > 0 ? (
//         <div className="mb-6">
//           <h3 className="text-xl font-semibold text-gray-700 mb-3">
//             Classes/Semesters Assigned to You:
//           </h3>
//           <ul className="list-disc list-inside text-gray-600">
//             {assignedClasses.map((cls, index) => (
//               <li key={index} className="py-1">{cls}</li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <p className="text-lg text-gray-600 text-center mb-6">
//           No classes or semesters are currently assigned to you.
//         </p>
//       )}

//       <h3 className="text-xl font-semibold text-gray-700 mb-4">Students in Your Assigned Classes:</h3>
//       {filteredStudents.length > 0 ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead>
//               <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
//                 <th className="py-3 px-4 border-b">Name</th>
//                 <th className="py-3 px-4 border-b">Roll No</th>
//                 <th className="py-3 px-4 border-b">Class/Semester</th>
//                 <th className="py-3 px-4 border-b">Contact</th>
//                 <th className="py-3 px-4 border-b">Email</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStudents.map((student) => (
//                 <tr key={student._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
//                   <td className="py-3 px-4 border-b text-gray-800">{student.name}</td>
//                   <td className="py-3 px-4 border-b text-gray-600">{student.cnic}</td> {/* Assuming cnic is roll number for display */}
//                   {/* Display class and semester, prioritize semester if available */}
//                   <td className="py-3 px-4 border-b text-gray-600">
//                     {student.semester ? `Semester ${student.semester} (${student.class})` : `Class ${student.classNumber || student.class}`}
//                   </td>
//                   <td className="py-3 px-4 border-b text-gray-600">{student.guardianContact}</td>
//                   <td className="py-3 px-4 border-b text-gray-600">{student.email}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-lg text-gray-600 text-center">
//           No students found for your assigned classes/semesters.
//         </p>
//       )}
//     </div>
//   );
// };

// export default MyStudents;


// src/pages/MyStudents.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo for optimized filtering
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AcademicCapIcon, UserGroupIcon } from '@heroicons/react/24/outline'; // Added icons for design

const MyStudents = ({ currentUser }) => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Store all fetched students
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState(''); // New state for class/semester filter

  useEffect(() => {
    const fetchTeacherAndStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // 1. Fetch the current teacher's profile to get assignedClasses
        const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`, config);
        const teacherAssignedClasses = teacherProfileResponse.data.assignClasses || [];
        setAssignedClasses(teacherAssignedClasses);

        // 2. Fetch all students
        const studentsResponse = await api.get('/students', config);
        setAllStudents(studentsResponse.data); // Store all students

      } catch (err) {
        console.error('Error fetching data for My Students:', err);
        setError('Failed to load students. Please check your network or try again.');
        toast.error('Failed to load students: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.profileId) {
      fetchTeacherAndStudents();
    } else {
      setLoading(false);
      setError('User profile not found. Please log in again.');
    }
  }, [currentUser]); // Re-run when currentUser changes

  // Memoized filtering logic to optimize performance
  const filteredStudents = useMemo(() => {
    const studentsMatchingAssignedClasses = allStudents.filter(student =>
      assignedClasses.some(assignedClass => {
        const normalizedAssignedClass = assignedClass.trim().toLowerCase();

        // Case 1: Matching "Class X" format (e.g., "Class 7", "Class 10")
        if (normalizedAssignedClass.startsWith('class ')) {
          const classNumberFromAssigned = normalizedAssignedClass.substring(6).trim();
          return student.classNumber === classNumberFromAssigned;
        }

        // Case 2: Matching "Degree Semester Y" format (e.g., "BS Semester 3", "BS Semester 7")
        if (normalizedAssignedClass.includes('semester ')) {
          const parts = normalizedAssignedClass.split('semester ');
          const degreePart = parts[0].trim();
          const semesterPart = parseInt(parts[1].trim(), 10);

          const degreeMatch = degreePart === '' || student.class.toLowerCase() === degreePart;
          const semesterMatch = student.semester === semesterPart;

          return degreeMatch && semesterMatch;
        }

        // Fallback: Direct match if assignedClass is neither "Class X" nor "Degree Semester Y"
        return student.class.toLowerCase() === normalizedAssignedClass;
      })
    );

    // Apply the additional classFilter if it exists
    if (classFilter) {
      const normalizedFilter = classFilter.toLowerCase();
      return studentsMatchingAssignedClasses.filter(student => {
        const studentClassInfo = student.semester
          ? `semester ${student.semester} (${student.class})`
          : `class ${student.classNumber || student.class}`;
        return studentClassInfo.toLowerCase().includes(normalizedFilter);
      });
    }

    return studentsMatchingAssignedClasses;
  }, [allStudents, assignedClasses, classFilter]); // Re-run memoization when these dependencies change

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center text-blue-600 font-semibold text-lg mt-8">
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600 font-semibold text-lg mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl mt-8 mb-8 font-inter">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center">
        <UserGroupIcon className="h-10 w-10 text-indigo-600 mr-3" /> My Assigned Students
      </h2>

      {assignedClasses.length > 0 ? (
        <div className="bg-indigo-50 p-6 rounded-lg shadow-inner border border-indigo-200 mb-8">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-2" /> Classes/Semesters Assigned to You:
          </h3>
          <ul className="list-disc list-inside text-indigo-700 space-y-2">
            {assignedClasses.map((cls, index) => (
              <li key={index} className="text-lg py-1">{cls}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xl text-gray-600 text-center mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          No classes or semesters are currently assigned to you.
        </p>
      )}

      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Students in Your Assigned Classes:</h3>

      {/* Filter Input */}
      <div className="mb-6">
        <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter Students by Class/Semester:
        </label>
        <input
          type="text"
          id="classFilter"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
          placeholder="e.g., Class 7, Semester 3, BS"
        />
      </div>

      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 border-b border-gray-200 rounded-tl-lg">Name</th>
                <th className="py-3 px-4 border-b border-gray-200">CNIC / Roll No</th>
                <th className="py-3 px-4 border-b border-gray-200">Class/Semester</th>
                <th className="py-3 px-4 border-b border-gray-200">Guardian Contact</th>
                <th className="py-3 px-4 border-b border-gray-200 rounded-tr-lg">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-3 px-4 text-gray-800 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-gray-600">{student.cnic}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {student.semester ? `Semester ${student.semester} (${student.class})` : `Class ${student.classNumber || student.class}`}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{student.guardianContact}</td>
                  <td className="py-3 px-4 text-gray-600">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xl text-gray-600 text-center p-4 bg-gray-50 rounded-lg shadow-sm">
          No students found matching your assigned classes or current filter.
        </p>
      )}
    </div>
  );
};

export default MyStudents;
