import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

const MarksList = () => {
    const { currentUser } = useContext(UserContext);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [markToDelete, setMarkToDelete] = useState(null);

    const fetchMarks = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (currentUser.role === 'admin') {
                response = await api.get('/marks');
            } else if (currentUser.role === 'teacher') {
                response = await api.get(`/marks/teacher/${currentUser.profileId}`);
            } else if (currentUser.role === 'student') {
                response = await api.get(`/marks/student/${currentUser.profileId}`);
            }
            setMarks(response.data);
        } catch (err) {
            console.error('Failed to fetch marks:', err);
            setError('Failed to load marks. Please try again.');
            toast.error('Failed to load marks.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMarks();
    }, [fetchMarks]);

    const handleDelete = (markId) => {
        setMarkToDelete(markId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/marks/${markToDelete}`);
            toast.success('Marks deleted successfully!');
            setMarks(marks.filter(m => m._id !== markToDelete));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete marks.');
        } finally {
            setIsConfirmModalOpen(false);
            setMarkToDelete(null);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message type="error">{error}</Message>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">
                {currentUser.role === 'teacher' ? 'My Marked Subjects' :
                 currentUser.role === 'admin' ? 'All Student Marks' :
                 'My Academic Marks'}
            </h1>
            
            {marks.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative mt-6">
                    <table className="w-full whitespace-nowrap table-auto">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                            <tr>
                                <th className="py-3 px-4 text-left">Student Name</th>
                                {currentUser.role === 'admin' && <th className="py-3 px-4 text-left">Teacher Name</th>}
                                <th className="py-3 px-4 text-left">Subject</th>
                                <th className="py-3 px-4 text-left">Marks Type</th>
                                <th className="py-3 px-4 text-center">Marks</th>
                                {currentUser.role === 'teacher' && <th className="py-3 px-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {marks.map(mark => (
                                <tr key={mark._id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-4 text-left font-medium">{mark.student.name}</td>
                                    {console.log(mark.student)}
                                    {currentUser.role === 'admin' && <td className="py-3 px-4 text-left">{mark.teacher.name}</td>}
                                    <td className="py-3 px-4 text-left">{mark.subject}</td>
                                    <td className="py-3 px-4 text-left">{mark.marksType}</td>
                                    <td className="py-3 px-4 text-center">{mark.marksObtained} / {mark.totalMarks}</td>
                                    {currentUser.role === 'teacher' && (
                                        <td className="py-3 px-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(mark._id)}
                                                className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100"
                                                title="Delete Marks"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-xl text-gray-600 text-center p-4 bg-gray-100 rounded-lg shadow-sm">
                    No marks found.
                </p>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this marks entry? This action cannot be undone."
            />
        </div>
    );
};

export default MarksList;