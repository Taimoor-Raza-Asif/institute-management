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
    });

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
            setError('Failed to load data for the marking form. Please try again.');
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
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
                marksObtained: '',
                totalMarks: '',
            });
        } catch (err) {
            console.error('Failed to add marks:', err);
            toast.error(err.response?.data?.message || 'Failed to add marks.');
        }
    };

    const getAssignedStudents = () => {
        if (!teacherData || !students.length) return [];
        const teacherClasses = teacherData.assignClasses;
        const assignedStudentIds = students.filter(student =>
            teacherClasses.some(tc =>
                (tc.type === 'Class' && student.class === 'Class' && student.classNumber === tc.classNumber) ||
                (tc.type === 'BS' && student.class === 'BS' && student.degreeName === tc.degreeName && student.semester === tc.semester)
            )
        ).map(student => student._id);
        return students.filter(student => assignedStudentIds.includes(student._id));
    };

    const getAssignedSubjects = () => {
        if (!teacherData) return [];
        return Array.from(new Set(teacherData.assignClasses.flatMap(ac => ac.subjects)));
    };

    if (loading) return <Loader />;
    if (error) return <Message type="error">{error}</Message>;

    const assignedStudents = getAssignedStudents();
    const assignedSubjects = getAssignedSubjects();

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">
                    Add Student Marks
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            {assignedStudents.map(student => (
                                <option key={student._id} value={student._id}>{student.name} ({student.rollNumber})</option>
                            ))}
                        </select>
                    </div>

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
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Quiz 1, Midterm Exam"
                />
            </div>

                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="marksObtained" className="block text-sm font-medium text-gray-700">Marks Obtained</label>
                            <input
                                type="number"
                                id="marksObtained"
                                name="marksObtained"
                                value={formData.marksObtained}
                                onChange={handleChange}
                                required
                                min="0"
                                max={formData.totalMarks}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex-1">
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
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-md"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Marks
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MarkingForm;