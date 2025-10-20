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
