import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MySubjects = () => {
    const { currentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [academicStructure, setAcademicStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper to get configuration for a slug
    const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);

    const fetchTeacherSubjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch structure first
            const structureResponse = await api.get('/academic-structure');
            setAcademicStructure(structureResponse.data.classTypes);
            
            // Then fetch teacher profile
            const teacherProfileResponse = await api.get(`/staff/${currentUser.profileId}`);
            setAssignedClasses(teacherProfileResponse.data.assignClasses || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load subjects. Please try again.');
            toast.error('Failed to load subjects.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.profileId) {
            fetchTeacherSubjects();
        }
    }, [currentUser, fetchTeacherSubjects]);

    // Helper to render assignment details
    const renderAssignmentDetails = (assignment) => {
        switch (assignment.type) {
            case 'Class':
                return `Class ${assignment.classNumber}`;
            case 'Almiya':
                // Attempt to find the identifier from the structure
                const almiyaConfig = getAcademicConfig('Almiya');
                const classObj = almiyaConfig?.classConfig?.find(c => String(c.classNumber) === String(assignment.classNumber));
                return classObj ? `${classObj.classIdentifier} (Grade ${assignment.classNumber})` : `Almiya Grade ${assignment.classNumber}`;
            case 'BS':
                return `Semester ${assignment.semester} (${assignment.degreeName})`;
            case 'Hifaz':
                return `Hifaz-ul-Quran Course`;
            default:
                return assignment.type || 'N/A';
        }
    };


    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <Message type="error">{error}</Message>;
    }

    const totalAssignments = assignedClasses.length;
    const totalSubjects = assignedClasses.reduce((sum, a) => sum + (a.subjects?.length || 0), 0);
    const uniqueTracks = new Set(assignedClasses.map(a => a.type)).size;

    return (
        <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className={`relative overflow-hidden rounded-3xl ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-2xl'} ${currentTheme?.title || 'text-white'} px-6 sm:px-10 py-8 mb-8`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold leading-tight ${currentTheme?.heroTitle || 'text-white'}`}>Assigned Classes & Subjects</h1>
                            <p className={`mt-1 text-sm sm:text-base max-w-2xl ${currentTheme?.heroSubtitle || 'text-emerald-50/90'}`}>Overview of tracks you handle and subjects you teach.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className={`rounded-2xl px-4 py-3 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} ${currentTheme?.border || 'border border-emerald-100'}`}>
                                <p className={`text-[11px] uppercase tracking-wide ${currentTheme?.mutedText || 'text-gray-500'}`}>Assignments</p>
                                <p className={`text-lg font-semibold ${currentTheme?.statCardValue || 'text-gray-900'}`}>{totalAssignments}</p>
                            </div>
                            <div className={`rounded-2xl px-4 py-3 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} ${currentTheme?.border || 'border border-emerald-100'}`}>
                                <p className={`text-[11px] uppercase tracking-wide ${currentTheme?.mutedText || 'text-gray-500'}`}>Tracks</p>
                                <p className={`text-lg font-semibold ${currentTheme?.statCardValue || 'text-gray-900'}`}>{uniqueTracks}</p>
                            </div>
                            <div className={`rounded-2xl px-4 py-3 ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} ${currentTheme?.border || 'border border-emerald-100'}`}>
                                <p className={`text-[11px] uppercase tracking-wide ${currentTheme?.mutedText || 'text-gray-500'}`}>Subjects</p>
                                <p className={`text-lg font-semibold ${currentTheme?.statCardValue || 'text-gray-900'}`}>{totalSubjects}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {assignedClasses.length > 0 ? (
                    <div className={`overflow-x-auto rounded-2xl ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-lg'} overflow-y-auto relative mt-6 ${currentTheme?.border || 'border border-emerald-100'}`}>
                        <table className="w-full whitespace-nowrap table-auto">
                            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'} uppercase text-xs leading-normal`}>
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold tracking-wide">Academic Track</th>
                                    <th className="py-3 px-4 text-left font-semibold tracking-wide">Class / Degree / Course</th>
                                    <th className="py-3 px-4 text-center font-semibold tracking-wide">Subjects Taught</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${currentTheme?.border || 'divide-emerald-50'}`}>
                                {assignedClasses.map((assignment, index) => (
                                    <tr key={index} className={`transition duration-150 ease-in-out ${currentTheme?.tableHover || 'hover:bg-emerald-50'} ${currentTheme?.tableStripedBg || 'odd:bg-gray-50'} ${currentTheme?.tbodyBg || 'bg-white'}`}>
                                        <td className={`py-3 px-4 font-medium`}>
                                            <span className={`px-2 py-1 inline-flex text-[11px] leading-5 font-semibold rounded-full ${currentTheme?.pillBg || 'bg-gray-100'} ${currentTheme?.pillText || 'text-gray-800'} ${currentTheme?.pillBorder || 'border border-gray-200'}`}>
                                                {assignment.type}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 ${currentTheme?.text || 'text-gray-700'}`}>{renderAssignmentDetails(assignment)}</td>
                                        <td className={`py-3 px-4 text-center ${currentTheme?.text || 'text-gray-600'}`}>
                                            {assignment.subjects && assignment.subjects.length > 0 ? (
                                                <span className="text-sm">{assignment.subjects.join(', ')}</span>
                                            ) : (
                                                <span className={`text-sm ${currentTheme?.mutedText || 'text-gray-400'}`}>No subjects specified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={`text-xl ${currentTheme?.mutedText || 'text-gray-600'} text-center p-4 ${currentTheme?.panelBg || 'bg-gray-100'} rounded-lg ${currentTheme?.shadow || 'shadow-sm'}`}>
                        No classes or subjects have been assigned to you yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default MySubjects;