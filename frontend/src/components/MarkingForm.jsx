// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import Loader from './Loader';
// import Message from './Message';
// import { UserContext } from '../App';
// import { PlusIcon } from '@heroicons/react/24/outline';

// const marksTypes = ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'];

// const MarkingForm = () => {
//     const { currentUser } = useContext(UserContext);
//     const navigate = useNavigate();
//     const [students, setStudents] = useState([]);
//     const [teacherData, setTeacherData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [formData, setFormData] = useState({
//         studentId: '',
//         subject: '',
//         marksType: '',
//         marksName: '', 
//         marksObtained: '',
//         totalMarks: '',
//     });

//     const fetchInitialData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const [studentsRes, teacherRes] = await Promise.all([
//                 api.get('/students'),
//                 api.get(`/staff/${currentUser.profileId}`),
//             ]);
//             setStudents(studentsRes.data);
//             setTeacherData(teacherRes.data);
//             setLoading(false);
//         } catch (err) {
//             console.error('Failed to fetch data:', err);
//             setError('Failed to load data for the marking form. Please try again.');
//             setLoading(false);
//         }
//     }, [currentUser]);

//     useEffect(() => {
//         fetchInitialData();
//     }, [fetchInitialData]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prevState => ({ ...prevState, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await api.post('/marks', formData);
//             toast.success('Marks added successfully!');
//             setFormData({
//                 studentId: '',
//                 subject: '',
//                 marksType: '',
//                 marksObtained: '',
//                 totalMarks: '',
//             });
//         } catch (err) {
//             console.error('Failed to add marks:', err);
//             toast.error(err.response?.data?.message || 'Failed to add marks.');
//         }
//     };

//     const getAssignedStudents = () => {
//         if (!teacherData || !students.length) return [];
//         const teacherClasses = teacherData.assignClasses;
//         const assignedStudentIds = students.filter(student =>
//             teacherClasses.some(tc =>
//                 (tc.type === 'Class' && student.class === 'Class' && student.classNumber === tc.classNumber) ||
//                 (tc.type === 'BS' && student.class === 'BS' && student.degreeName === tc.degreeName && student.semester === tc.semester)
//             )
//         ).map(student => student._id);
//         return students.filter(student => assignedStudentIds.includes(student._id));
//     };

//     const getAssignedSubjects = () => {
//         if (!teacherData) return [];
//         return Array.from(new Set(teacherData.assignClasses.flatMap(ac => ac.subjects)));
//     };

//     if (loading) return <Loader />;
//     if (error) return <Message type="error">{error}</Message>;

//     const assignedStudents = getAssignedStudents();
//     const assignedSubjects = getAssignedSubjects();

//     return (
//         <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//             <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-xl">
//                 <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">
//                     Add Student Marks
//                 </h1>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
//                         <select
//                             id="studentId"
//                             name="studentId"
//                             value={formData.studentId}
//                             onChange={handleChange}
//                             required
//                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                         >
//                             <option value="">Select Student</option>
//                             {assignedStudents.map(student => (
//                                 <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                         <select
//                             id="subject"
//                             name="subject"
//                             value={formData.subject}
//                             onChange={handleChange}
//                             required
//                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                         >
//                             <option value="">Select Subject</option>
//                             {assignedSubjects.map(subject => (
//                                 <option key={subject} value={subject}>{subject}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label htmlFor="marksType" className="block text-sm font-medium text-gray-700">Marks Type</label>
//                         <select
//                             id="marksType"
//                             name="marksType"
//                             value={formData.marksType}
//                             onChange={handleChange}
//                             required
//                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                         >
//                             <option value="">Select Type</option>
//                             {marksTypes.map(type => (
//                                 <option key={type} value={type}>{type}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                 <label htmlFor="marksName" className="block text-sm font-medium text-gray-700">Marks Name</label>
//                 <input
//                     type="text"
//                     id="marksName"
//                     name="marksName"
//                     value={formData.marksName}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="e.g., Quiz 1, Midterm Exam"
//                 />
//             </div>

//                     <div className="flex space-x-4">
//                         <div className="flex-1">
//                             <label htmlFor="marksObtained" className="block text-sm font-medium text-gray-700">Marks Obtained</label>
//                             <input
//                                 type="number"
//                                 id="marksObtained"
//                                 name="marksObtained"
//                                 value={formData.marksObtained}
//                                 onChange={handleChange}
//                                 required
//                                 min="0"
//                                 max={formData.totalMarks}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                         </div>
//                         <div className="flex-1">
//                             <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">Total Marks</label>
//                             <input
//                                 type="number"
//                                 id="totalMarks"
//                                 name="totalMarks"
//                                 value={formData.totalMarks}
//                                 onChange={handleChange}
//                                 required
//                                 min="1"
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                         </div>
//                     </div>

//                     <div className="pt-4 flex justify-end">
//                         <button
//                             type="submit"
//                             className="flex items-center justify-center bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md"
//                         >
//                             <PlusIcon className="h-5 w-5 mr-2" />
//                             Add Marks
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default MarkingForm;



// import React, { useState, useEffect, useContext } from 'react';
// import api from '../api';
// import { UserContext } from '../App';
// import Loader from '../components/Loader';
// import Message from '../components/Message';
// import { toast } from 'react-toastify';

// const MarkingForm = () => {
//     const { currentUser } = useContext(UserContext);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [assignedSubjects, setAssignedSubjects] = useState([]);
//     const [assignedClasses, setAssignedClasses] = useState([]);
//     const [students, setStudents] = useState([]);

//     const [selectedSubject, setSelectedSubject] = useState('');
//     const [selectedClass, setSelectedClass] = useState('');
//     const [selectedMarksType, setSelectedMarksType] = useState('');
//     const [marksName, setMarksName] = useState('');
//     const [totalMarks, setTotalMarks] = useState('');

//     const [marksData, setMarksData] = useState({});

//     // Fetch teacher's assigned subjects and classes
//     useEffect(() => {
//         const fetchTeacherData = async () => {
//             if (currentUser && currentUser.profileId) {
//                 setLoading(true);
//                 try {
//                     const response = await api.get(`/staff/profile/${currentUser.profileId}`);
//                     const teacherData = response.data;
//                     setAssignedSubjects(teacherData.assignClasses.flatMap(ac => ac.subjects));
//                     setAssignedClasses(teacherData.assignClasses);
//                 } catch (err) {
//                     setError('Failed to load teacher data.');
//                     toast.error('Failed to load teacher data.');
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };
//         fetchTeacherData();
//     }, [currentUser]);

//     // Fetch students based on selected class
//     const fetchStudents = async () => {
//         if (!selectedClass) return;
//         setLoading(true);
//         setError('');
//         try {
//             const classParams = assignedClasses.find(c => c._id === selectedClass);
//             const response = await api.get('/students', {
//                 params: {
//                     type: classParams.type,
//                     classNumber: classParams.classNumber,
//                     degreeName: classParams.degreeName,
//                     semester: classParams.semester,
//                 }
//             });

//             setStudents(response.data);

//             // Fetch existing marks to pre-populate form
//             const existingMarksResponse = await api.get('/marks', {
//                 params: {
//                     subject: selectedSubject,
//                     marksType: selectedMarksType,
//                     marksName: marksName,
//                     assignedClass: selectedClass,
//                 }
//             });

//             const initialMarks = {};
//             existingMarksResponse.data.forEach(mark => {
//                 initialMarks[mark.student._id] = mark.marksObtained;
//             });
//             setMarksData(initialMarks);

//         } catch (err) {
//             setError('Failed to load students or existing marks.');
//             toast.error('Failed to load students.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleMarksChange = (studentId, value) => {
//         setMarksData(prev => ({
//             ...prev,
//             [studentId]: value,
//         }));
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             const marksPayload = students.map(student => ({
//                 studentId: student._id,
//                 subject: selectedSubject,
//                 marksType: selectedMarksType,
//                 marksName,
//                 totalMarks: Number(totalMarks),
//                 marksObtained: Number(marksData[student._id] || 0)
//             }));
            
//             await api.post('/marks/bulk', { marks: marksPayload });
//             toast.success('Marks updated successfully!');
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to submit marks.');
//             toast.error(err.response?.data?.message || 'Failed to submit marks.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getClassName = (classObj) => {
//         if (classObj.type === 'Class') {
//             return `Class ${classObj.classNumber}`;
//         }
//         return `${classObj.degreeName} Semester ${classObj.semester}`;
//     };

//     if (loading) return <Loader />;
//     if (error) return <Message type="error">{error}</Message>;

//     return (
//         <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//             <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Enter Student Marks</h1>
//             <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
//                 <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div>
//                             <label htmlFor="subject" className="block text-gray-700 font-bold mb-2">Subject</label>
//                             <select
//                                 id="subject"
//                                 value={selectedSubject}
//                                 onChange={(e) => setSelectedSubject(e.target.value)}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                                 required
//                             >
//                                 <option value="">Select Subject</option>
//                                 {assignedSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label htmlFor="class" className="block text-gray-700 font-bold mb-2">Class</label>
//                             <select
//                                 id="class"
//                                 value={selectedClass}
//                                 onChange={(e) => setSelectedClass(e.target.value)}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                                 required
//                             >
//                                 <option value="">Select Class</option>
//                                 {assignedClasses.map(cls => <option key={cls._id} value={cls._id}>{getClassName(cls)}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label htmlFor="marksType" className="block text-gray-700 font-bold mb-2">Marks Type</label>
//                             <select
//                                 id="marksType"
//                                 value={selectedMarksType}
//                                 onChange={(e) => setSelectedMarksType(e.target.value)}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                                 required
//                             >
//                                 <option value="">Select Type</option>
//                                 {['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'].map(type => (
//                                     <option key={type} value={type}>{type}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <label htmlFor="marksName" className="block text-gray-700 font-bold mb-2">Marks Name</label>
//                             <input
//                                 type="text"
//                                 id="marksName"
//                                 value={marksName}
//                                 onChange={(e) => setMarksName(e.target.value)}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                                 placeholder="e.g., Quiz 1, Project"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="totalMarks" className="block text-gray-700 font-bold mb-2">Total Marks</label>
//                             <input
//                                 type="number"
//                                 id="totalMarks"
//                                 value={totalMarks}
//                                 onChange={(e) => setTotalMarks(e.target.value)}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                                 required
//                             />
//                         </div>
//                     </div>
//                     <div className="flex justify-end mt-4">
//                         <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
//                             Load Students
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {students.length > 0 && (
//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                     <form onSubmit={handleFormSubmit}>
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obtained Marks</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {students.map(student => (
//                                         <tr key={student._id}>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <input
//                                                     type="number"
//                                                     value={marksData[student._id] || ''}
//                                                     onChange={(e) => handleMarksChange(student._id, e.target.value)}
//                                                     className="w-24 p-2 border border-gray-300 rounded-md"
//                                                     min="0"
//                                                     max={totalMarks}
//                                                 />
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="flex justify-end mt-4">
//                             <button
//                                 type="submit"
//                                 className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
//                             >
//                                 Save All Marks
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MarkingForm;






import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from './Loader';
import Message from './Message';
import { UserContext } from '../App';
import { PlusIcon } from '@heroicons/react/24/outline';

const marksTypes = ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'];

const MarkingForm = () => {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        subject: '',
        marksType: '',
        marksName: '',
        marksObtained: '',
        totalMarks: '',
        conductedDate: '', // Add the new date field
    });
    const [marksData, setMarksData] = useState({}); // State for bulk marking
    const [isBulkMode, setIsBulkMode] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, teacherRes] = await Promise.all([
                api.get('/students'),
                api.get(`/staff/${currentUser.profileId}`),
            ]);
            setStudents(studentsRes.data);
            setTeacherData(teacherRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load initial data. Please try again.');
            toast.error('Failed to load initial data.');
            setLoading(false);
        }
    }, [currentUser.profileId]);

    useEffect(() => {
        if (currentUser && currentUser.role === 'teacher') {
            fetchInitialData();
        }
    }, [currentUser, fetchInitialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMarksChange = (studentId, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/marks', formData);
            toast.success('Marks added successfully!');
            setFormData({
                studentId: '',
                subject: '',
                marksType: '',
                marksName: '',
                marksObtained: '',
                totalMarks: '',
                conductedDate: '',
            });
            navigate('/marks-list');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            toast.error(errorMessage);
            console.error(err);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        const { subject, marksType, marksName, totalMarks, conductedDate } = formData;
        const bulkMarks = Object.entries(marksData).map(([studentId, marksObtained]) => ({
            studentId,
            subject,
            marksType,
            marksName,
            marksObtained: Number(marksObtained),
            totalMarks: Number(totalMarks),
            conductedDate, // Include the conductedDate in the bulk payload
        }));

        try {
            await api.post('/marks/bulk', { marks: bulkMarks });
            toast.success('Marks added in bulk successfully!');
            navigate('/marks-list');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            toast.error(errorMessage);
            console.error(err);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    const assignedSubjects = teacherData?.assignClasses?.flatMap(ac => ac.subjects) || [];
    const filteredStudents = students.filter(student =>
        teacherData?.assignClasses.some(ac =>
            (ac.type === 'Class' && student.class === 'Class' && student.classNumber === ac.classNumber) ||
            (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && student.semester === ac.semester)
        )
    );

    const isFormDisabled = !formData.subject || !formData.marksType || !formData.marksName || !formData.totalMarks || !formData.conductedDate;
    const totalMarks = Number(formData.totalMarks);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Marks</h1>

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
                >
                    Switch to {isBulkMode ? 'Single Entry' : 'Bulk Entry'}
                </button>
            </div>

            <div className="space-y-4">
                {/* Common fields for both modes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Subject</option>
                            {assignedSubjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="marksType" className="block text-sm font-medium text-gray-700">Marks Type</label>
                        <select
                            id="marksType"
                            name="marksType"
                            value={formData.marksType}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Type</option>
                            {marksTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="marksName" className="block text-sm font-medium text-gray-700">Marks Name</label>
                        <input
                            type="text"
                            id="marksName"
                            name="marksName"
                            value={formData.marksName}
                            onChange={handleChange}
                            placeholder="e.g., Quiz 1, Lab 3"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">Total Marks</label>
                        <input
                            type="number"
                            id="totalMarks"
                            name="totalMarks"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            required
                            min="1"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {/* New field for conducted date */}
                    <div>
                        <label htmlFor="conductedDate" className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            id="conductedDate"
                            name="conductedDate"
                            value={formData.conductedDate}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {isBulkMode ? (
                // Bulk Entry Form
                <div className="bg-gray-50 p-6 rounded-lg mt-6">
                    <form onSubmit={handleBulkSubmit}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <tr key={student._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={marksData[student._id] || ''}
                                                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                        className="w-24 p-2 border border-gray-300 rounded-md"
                                                        min="0"
                                                        max={totalMarks}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                                                No students found in your assigned classes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className={`bg-green-600 text-white px-6 py-2 rounded-md transition-colors ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                                disabled={isFormDisabled}
                            >
                                Save All Marks
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // Single Entry Form
                <div className="bg-gray-50 p-6 rounded-lg mt-6">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
                            <select
                                id="studentId"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select Student</option>
                                {filteredStudents.map(student => (
                                    <option key={student._id} value={student._id}>{student.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* The missing marksObtained input field for single entry */}
                        <div className="mt-4">
                            <label htmlFor="marksObtained" className="block text-sm font-medium text-gray-700">Marks Obtained</label>
                            <input
                                type="number"
                                id="marksObtained"
                                name="marksObtained"
                                value={formData.marksObtained}
                                onChange={handleChange}
                                required
                                min="0"
                                max={totalMarks}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className={`bg-indigo-600 text-white px-6 py-2 rounded-md transition-colors ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                                disabled={isFormDisabled}
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Marks
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MarkingForm;
