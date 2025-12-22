// src/screens/ProfileScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import {
    PencilIcon, CheckIcon, XMarkIcon, PhotoIcon, BuildingLibraryIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon, CakeIcon, UserIcon, MapPinIcon, CalendarDaysIcon, AcademicCapIcon, BriefcaseIcon, BanknotesIcon, BookOpenIcon, HomeIcon, ScaleIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import Message from '../components/Message';

import StaffForm from '../components/StaffForm';
import StudentForm from '../components/StudentForm';

const ProfileScreen = () => {
    const { currentUser: user, updateCurrentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const { role, id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const backendBaseUrl = 'http://localhost:5000';

    const canEdit = user && (
        user.role === 'admin' ||
        ((role === 'student' && user.role === 'student' && user.profileId?.toString() === id) && user.editModeEnabled) ||
        (['teacher', 'accountant', 'cook', 'cleaner'].includes(user.role) && user.profileId?.toString() === id && user.editModeEnabled)
    );

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = role === 'student' ? `/students/${id}` : `/staff/${id}`;
            const response = await api.get(endpoint);
            setProfile(response.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id, role]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        fetchProfile();
    };

    const handleFormSubmitSuccess = () => {
        setIsEditing(false);
        fetchProfile();
    };

    if (loading) return <Loader />;
    if (error) return <Message type="error">{error}</Message>;
    if (!profile) return <Message type="info">Profile not found.</Message>;

    if (isEditing) {
        if (role === 'student') {
            return <StudentForm editingStudent={profile} onClose={handleFormSubmitSuccess} fetchStudents={fetchProfile} />;
        }
        return <StaffForm editingStaff={profile} onClose={handleFormSubmitSuccess} fetchStaff={fetchProfile} />;
    }

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700 ring-1 ring-green-100">
                <Icon className="h-5 w-5" />
            </span>
            <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                <p className={`text-sm font-semibold ${currentTheme.text || 'text-gray-800'}`}>{value || '—'}</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${currentTheme.pageBg || 'bg-gradient-to-br from-green-50 via-white to-emerald-50'} py-8`}>
            <div className="max-w-6xl mx-auto px-4 space-y-6">
                <div className={`${currentTheme.heroBg || 'bg-emerald-50'} ${currentTheme.shadow || 'shadow-2xl'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl overflow-hidden`}>
                    <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                                    <img
                                        className="h-full w-full object-cover"
                                        src={profile.profilePictureUrl ? `${backendBaseUrl}${profile.profilePictureUrl}` : '/default-avatar.jpg'}
                                        alt={`${profile.name}'s profile picture`}
                                        onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                                    />
                                </div>
                                <span className="absolute -bottom-2 left-3 px-3 py-1 text-xs font-bold rounded-full bg-green-600 text-white shadow-lg">
                                    {role === 'student' ? 'Student' : 'Staff'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <UserIcon className={`h-6 w-6 ${currentTheme.heroIcon || 'text-gray-500'}`} />
                                    <h1 className={`text-3xl font-black tracking-tight ${currentTheme.heroTitle || 'text-green-800'}`}>{profile.name}</h1>
                                    {profile.studentStatus && role === 'student' && (
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{profile.studentStatus}</span>
                                    )}
                                    {profile.staffType && role === 'staff' && (
                                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{profile.staffType}</span>
                                    )}
                                </div>
                                <p className={`${currentTheme.heroSubtitle || 'text-gray-600'} text-sm font-medium`}>{profile.email || 'Email not provided'}</p>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 ring-1 ring-gray-200 text-gray-700 text-sm font-semibold">
                                        <IdentificationIcon className="h-4 w-4 text-green-600" />
                                        {profile.cnic || 'CNIC not provided'}
                                    </span>
                                    {(profile.class || profile.staffType) && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 ring-1 ring-gray-200 text-gray-700 text-sm font-semibold">
                                            <AcademicCapIcon className="h-4 w-4 text-green-600" />
                                            {role === 'student' ? (profile.class === 'BS' ? `${profile.degreeName || 'Degree'} · Sem ${profile.semester || '-'}` : `${profile.class || ''} ${profile.classNumber || ''}`) : profile.staffType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {canEdit && (
                            <button
                                onClick={handleEditClick}
                                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <PencilIcon className="h-5 w-5 transition-transform group-hover:rotate-6" />
                                Edit Details
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-6 space-y-5 col-span-1 lg:col-span-2`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Personal Information</h3>
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Core</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoRow icon={UserIcon} label="Father's Name" value={profile.fatherName || 'Not provided'} />
                            <InfoRow icon={ScaleIcon} label="Gender" value={profile.gender} />
                            <InfoRow icon={EnvelopeIcon} label="Email" value={profile.email || 'Not provided'} />
                            <InfoRow icon={CakeIcon} label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'} />
                            <InfoRow icon={IdentificationIcon} label="CNIC" value={profile.cnic} />
                            <InfoRow icon={MapPinIcon} label="Address" value={profile.address || 'Not provided'} />
                        </div>
                    </div>

                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-6 space-y-4`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Contact</h3>
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Reach</span>
                        </div>
                        <div className="space-y-4">
                            <InfoRow icon={PhoneIcon} label="Primary Contact" value={profile.contactNumber || profile.guardianContact || 'Not provided'} />
                            <InfoRow icon={PhoneIcon} label="Additional Contact" value={profile.additionalContact} />
                        </div>
                    </div>
                </div>

                {role === 'staff' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-6 space-y-5 col-span-1 lg:col-span-2`}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Professional Information</h3>
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Role</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <InfoRow icon={BriefcaseIcon} label="Staff Type" value={profile.staffType} />
                                <InfoRow icon={CalendarDaysIcon} label="Date of Joining" value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'Not provided'} />
                                <InfoRow icon={BanknotesIcon} label="Salary" value={profile.salary ? `PKR ${Number(profile.salary).toLocaleString()}` : 'Not provided'} />
                                <InfoRow icon={BookOpenIcon} label="Highest Education" value={profile.highestEducationLevel} />
                                <InfoRow icon={ClipboardDocumentListIcon} label="Subjects" value={profile.subjectsTaught && profile.subjectsTaught.length ? profile.subjectsTaught.join(', ') : 'Not provided'} />
                            </div>
                        </div>

                        {profile.bankAccountDetails && (
                            <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-6 space-y-4`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Bank Details</h3>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Finance</span>
                                </div>
                                <div className="space-y-4">
                                    <InfoRow icon={BanknotesIcon} label="Bank Name" value={profile.bankAccountDetails.bankName} />
                                    <InfoRow icon={HomeIcon} label="Account Number" value={profile.bankAccountDetails.accountNumber} />
                                    <InfoRow icon={BookOpenIcon} label="IBAN" value={profile.bankAccountDetails.iban} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {role === 'student' && (
                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-6 space-y-5`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Academic Information</h3>
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Studies</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoRow icon={AcademicCapIcon} label="Status" value={profile.studentStatus} />
                            <InfoRow icon={BuildingLibraryIcon} label="Admission Date" value={profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : 'Not provided'} />
                            <InfoRow
                                icon={BookOpenIcon}
                                label="Program"
                                value={profile.class === 'BS' ? `${profile.degreeName || 'Degree'} · Semester ${profile.semester || '-'}` : `Class ${profile.classNumber || '-'}`}
                            />
                            <InfoRow icon={BanknotesIcon} label="Fee per Month" value={profile.feePerMonth ? `PKR ${Number(profile.feePerMonth).toLocaleString()}` : 'Not provided'} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProfileScreen;