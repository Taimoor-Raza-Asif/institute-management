import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';
import { UserContext } from '../App';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EditMarksForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();

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
        const digitOnlyFields = ['marksObtained', 'totalMarks'];
        let newVal = value;
        if (digitOnlyFields.includes(name)) {
            newVal = String(value || '').replace(/\D/g, '');
        }
        setFormData({
            ...formData,
            [name]: newVal,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        // Basic validation
        const obtained = Number(formData.marksObtained);
        const total = Number(formData.totalMarks);
        if (Number.isFinite(obtained) && Number.isFinite(total)) {
            if (obtained > total) {
                setLoading(false);
                toast.error('Obtained marks cannot exceed total marks.');
                return;
            }
            if (obtained < 0 || total <= 0) {
                setLoading(false);
                toast.error('Marks must be positive, and total must be greater than zero.');
                return;
            }
        }
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
        <div className={`min-h-screen ${currentTheme.pageBg || 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero */}
                <div className={`relative overflow-hidden rounded-3xl px-6 sm:px-10 py-8 mb-8 ${currentTheme.dashHeroBg || currentTheme.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme.dashHeroShadow || currentTheme.heroShadow || 'shadow-2xl'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_25%),radial-gradient(circle_at_80%_0%,white,transparent_25%)]" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-extrabold leading-tight ${currentTheme.dashHeroTitle || currentTheme.heroTitle || 'text-white'}`}>Edit Marks</h1>
                            <p className={`${currentTheme.dashHeroSubtitle || currentTheme.heroSubtitle || 'text-emerald-50/90'} mt-1 text-sm sm:text-base max-w-2xl`}>Update the marks details below. Your changes save instantly.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className={`inline-flex items-center justify-center rounded-full p-2 ${currentTheme.dashHeroPillBg || currentTheme.heroPillBg || 'bg-white/10'} hover:opacity-90 ${currentTheme.dashHeroPillText || currentTheme.heroPillText || 'text-white'} transition`}
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-emerald-100 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 w-full rounded-lg bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="marksType" className="block text-sm font-medium text-gray-700">Marks Type</label>
                                <input
                                    type="text"
                                    id="marksType"
                                    name="marksType"
                                    value={formData.marksType}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 w-full rounded-lg bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 cursor-not-allowed"
                                />
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
                                    className="mt-1 w-full rounded-lg bg-white text-gray-700 border border-emerald-200 ring-1 ring-emerald-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                            <div>
                                <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">Total Marks</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    id="totalMarks"
                                    name="totalMarks"
                                    value={formData.totalMarks}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full rounded-lg bg-white text-gray-700 border border-emerald-200 ring-1 ring-emerald-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                            <div>
                                <label htmlFor="marksObtained" className="block text-sm font-medium text-gray-700">Obtained Marks</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    id="marksObtained"
                                    name="marksObtained"
                                    value={formData.marksObtained}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full rounded-lg bg-white text-gray-700 border border-emerald-200 ring-1 ring-emerald-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-5 py-2 rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-50 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            >
                                Update Marks
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMarksForm;