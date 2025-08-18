import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from '../App';
import Loader from './Loader';
import Message from './Message';

const MySubjects = () => {
    const { currentUser } = useContext(UserContext);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTeacherSubjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
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

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <Message type="error">{error}</Message>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-800 mb-8">My Subjects</h1>
            
            {assignedClasses.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative mt-6">
                    <table className="w-full whitespace-nowrap table-auto">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200">Class / Semester</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-center">Subjects</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedClasses.map((assignment, index) => (
                                <tr key={index} className="border-b text-center border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <td className="py-3 px-4 text-gray-800 font-medium">
                                        {assignment.type === 'BS' ? `Semester ${assignment.semester} (${assignment.degreeName})` : `Class ${assignment.classNumber}`}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 text-center">
                                        {assignment.subjects && assignment.subjects.length > 0 ? (
                                            assignment.subjects.join(', ')
                                        ) : (
                                            'No subjects assigned'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-xl text-gray-600 text-center p-4 bg-gray-100 rounded-lg shadow-sm">
                    No subjects have been assigned to you yet.
                </p>
            )}
        </div>
    );
};

export default MySubjects;