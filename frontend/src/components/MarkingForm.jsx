import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from './Loader';
import Message from './Message';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import { PlusIcon } from '@heroicons/react/24/outline';

const marksTypes = ['Quiz', 'Assignment', 'Midterm 1', 'Midterm 2', 'Final Exam', 'Bonus Activity'];

const MarkingForm = () => {
    const { currentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [teacherData, setTeacherData] = useState(null);
    const [academicStructure, setAcademicStructure] = useState(null);
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
    const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(-1);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, teacherRes, structureRes] = await Promise.all([
                api.get('/students'),
                api.get(`/staff/${currentUser.profileId}`),
                api.get('/academic-structure'),
            ]);
            setStudents(studentsRes.data);
            setTeacherData(teacherRes.data);
            setAcademicStructure(structureRes.data?.classTypes || null);
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

    const assignments = teacherData?.assignClasses || [];
    const selectedAssignment =
        selectedAssignmentIndex >= 0 && selectedAssignmentIndex < assignments.length
            ? assignments[selectedAssignmentIndex]
            : null;

    const getAcademicConfig = (slug) => academicStructure?.find(t => t.slug === slug);
    const renderAssignmentLabel = (ac) => {
        if (!ac) return '';
        switch (ac.type) {
            case 'Class':
                return `Class • Grade ${ac.classNumber}`;
            case 'Almiya': {
                const almiya = getAcademicConfig('Almiya');
                const cfg = almiya?.classConfig?.find(c => String(c.classNumber) === String(ac.classNumber));
                return cfg ? `Almiya • ${cfg.classIdentifier} (Grade ${ac.classNumber})` : `Almiya • Grade ${ac.classNumber}`;
            }
            case 'BS':
                return `BS • ${ac.degreeName} (Sem ${ac.semester})`;
            case 'Hifaz':
                return 'Hifaz-ul-Quran';
            default:
                return ac.type;
        }
    };

    const assignedSubjects = selectedAssignment?.subjects || [];
    const filteredStudents = students.filter(student => {
        if (!selectedAssignment) return false;
        const ac = selectedAssignment;
        return (
            (ac.type === 'Class' && student.class === 'Class' && String(student.classNumber) === String(ac.classNumber)) ||
            (ac.type === 'Almiya' && student.class === 'Almiya' && String(student.classNumber) === String(ac.classNumber)) ||
            (ac.type === 'BS' && student.class === 'BS' && student.degreeName === ac.degreeName && String(student.semester) === String(ac.semester)) ||
            (ac.type === 'Hifaz' && student.class === 'Hifaz')
        );
    });

    const isFormDisabled = !formData.subject || !formData.marksType || !formData.marksName || !formData.totalMarks || !formData.conductedDate;
    const totalMarks = Number(formData.totalMarks);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl text-white px-6 sm:px-10 py-8 mb-8">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Add Marks</h1>
                            <p className="text-emerald-50/90 mt-1 text-sm sm:text-base max-w-2xl">Record assessments for your assigned students. Use single or bulk entry.</p>
                        </div>
                        <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/20 backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setIsBulkMode(false)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${!isBulkMode ? 'bg-white text-emerald-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                Single Entry
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsBulkMode(true)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${isBulkMode ? 'bg-white text-emerald-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                Bulk Entry
                            </button>
                        </div>
                    </div>
                </div>

                {/* Common fields card */}
                <div className="rounded-2xl bg-white border border-emerald-100 shadow-lg px-5 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Assignment selection */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Class / Section</label>
                            <select
                                value={selectedAssignmentIndex}
                                onChange={(e) => {
                                    const idx = Number(e.target.value);
                                    setSelectedAssignmentIndex(idx);
                                    // Reset dependent fields
                                    setFormData(prev => ({ ...prev, subject: '', studentId: '' }));
                                    setMarksData({});
                                }}
                                className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-emerald-50/60 border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value={-1}>Select Class / Assignment</option>
                                {assignments.map((ac, idx) => (
                                    <option key={`${ac.type}-${idx}-${ac.classNumber || ac.semester || 'hz'}`} value={idx}>
                                        {renderAssignmentLabel(ac)}
                                    </option>
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
                            disabled={!selectedAssignment}
                            className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-emerald-50/60 border border-emerald-200 text-gray-700 disabled:opacity-60 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-emerald-50/60 border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-white border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-white border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-white border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    </div>
                </div>

            {isBulkMode ? (
                // Bulk Entry Form
                <div className="border border-emerald-100 bg-white p-5 rounded-2xl mt-6 shadow-lg">
                    <form onSubmit={handleBulkSubmit}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-emerald-100">
                                <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-emerald-50">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <tr key={student._id}>
                                                <td className="px-6 py-3 whitespace-nowrap text-gray-800">{student.name}</td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={marksData[student._id] || ''}
                                                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                        className="w-28 p-2 rounded-xl bg-white border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                                className={`inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow transition-colors ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
                                disabled={isFormDisabled}
                            >
                                Save All Marks
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // Single Entry Form
                <div className="border border-emerald-100 bg-white p-5 rounded-2xl mt-6 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
                            <select
                                id="studentId"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                disabled={!selectedAssignment}
                                className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-emerald-50/60 border border-emerald-200 text-gray-700 disabled:opacity-60 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                                className="mt-1 block w-full rounded-xl shadow-sm py-2.5 px-3 bg-white border border-emerald-200 text-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className={`inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow transition-colors ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
                                disabled={isFormDisabled}
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Marks
                            </button>
                        </div>
                    </form>
                </div>
            )}
            </div>
        </div>
    );
};

export default MarkingForm;
