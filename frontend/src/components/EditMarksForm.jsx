import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';
import { UserContext } from '../App';

const EditMarksForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        marksType: '',
        marksName: '',
        marksObtained: '',
        totalMarks: '',
    });

    useEffect(() => {
        const fetchMark = async () => {
            try {
                const response = await api.get(`/marks/${id}`);
                const mark = response.data;
                setFormData({
                    subject: mark.subject,
                    marksType: mark.marksType,
                    marksName: mark.marksName,
                    marksObtained: mark.marksObtained,
                    totalMarks: mark.totalMarks,
                });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch mark:', err);
                setError('Failed to load marks. Please check the ID and try again.');
                setLoading(false);
                toast.error('Failed to load marks for editing.');
            }
        };
        fetchMark();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.put(`/marks/${id}`, formData);
            setLoading(false);
            toast.success('Marks updated successfully!');
            navigate('/marks/teacher/' + currentUser.profileId); // Redirect to teacher's marks list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update marks.');
            setLoading(false);
            toast.error(err.response?.data?.message || 'Failed to update marks.');
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <Message type="error">{error}</Message>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-center text-green-800 mb-6">Edit Marks</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="subject" className="block text-gray-700 font-bold mb-2">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                readOnly // Subject should not be editable to maintain data integrity
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="marksType" className="block text-gray-700 font-bold mb-2">Marks Type</label>
                            <input
                                type="text"
                                id="marksType"
                                name="marksType"
                                value={formData.marksType}
                                onChange={handleChange}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="marksName" className="block text-gray-700 font-bold mb-2">Marks Name</label>
                            <input
                                type="text"
                                id="marksName"
                                name="marksName"
                                value={formData.marksName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="totalMarks" className="block text-gray-700 font-bold mb-2">Total Marks</label>
                            <input
                                type="number"
                                id="totalMarks"
                                name="totalMarks"
                                value={formData.totalMarks}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="marksObtained" className="block text-gray-700 font-bold mb-2">Obtained Marks</label>
                            <input
                                type="number"
                                id="marksObtained"
                                name="marksObtained"
                                value={formData.marksObtained}
                                onChange={handleChange}
                                required
                                min="0"
                                max={formData.totalMarks}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Update Marks
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMarksForm;