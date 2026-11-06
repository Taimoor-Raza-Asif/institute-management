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
import { resolveFileUrl } from '../utils/urlHelper.js';

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
        <div className="flex items-start gap-3 min-w-0 p-2.5 sm:p-0 rounded-xl bg-gray-50/70 sm:bg-transparent border border-gray-100/80 sm:border-0">
            <span className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl ${currentTheme.heroPillBg || 'bg-green-50'} ${currentTheme.iconText || 'text-green-700'} ring-1 ${currentTheme.heroPillBorder || 'ring-green-100'} shadow-xs`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-bold">{label}</p>
                <p className={`text-xs sm:text-sm font-semibold break-words ${currentTheme.text || 'text-gray-800'} mt-0.5`}>{value || '—'}</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${currentTheme.pageBg || 'bg-gradient-to-br from-green-50 via-white to-emerald-50'} py-4 sm:py-8`}>
            <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
                <div className={`${currentTheme.heroBg || 'bg-emerald-50'} ${currentTheme.shadow || 'shadow-2xl'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl overflow-hidden relative`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/40 via-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                    <div className="relative p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 min-w-0 flex-1 text-center sm:text-left">
                            <div className="relative flex-shrink-0">
                                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl mx-auto">
                                    <img
                                        className="h-full w-full object-cover"
                                        src={profile.profilePictureUrl ? resolveFileUrl(profile.profilePictureUrl) : '/default-avatar.png'}
                                        alt={`${profile.name}'s profile picture`}
                                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                    />
                                </div>
                                <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-3 px-3 py-0.5 text-xs font-bold rounded-full ${currentTheme.btnPrimaryBg || 'bg-green-600'} ${currentTheme.btnPrimaryText || 'text-white'} shadow-md whitespace-nowrap`}>
                                    {role === 'student' ? 'Student' : 'Staff'}
                                </span>
                            </div>
                            <div className="space-y-1.5 min-w-0 flex-1 w-full">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <UserIcon className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${currentTheme.heroIcon || 'text-gray-500'}`} />
                                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight break-words ${currentTheme.heroTitle || 'text-green-800'}`}>{profile.name}</h1>
                                </div>
                                <p className={`${currentTheme.heroSubtitle || 'text-gray-600'} text-xs sm:text-sm font-medium break-all px-2 sm:px-0`}>{profile.email || 'Email not provided'}</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 ring-1 ring-gray-200/80 text-gray-700 text-xs sm:text-sm font-semibold shadow-xs">
                                        <IdentificationIcon className={`h-4 w-4 flex-shrink-0 ${currentTheme.iconText || 'text-green-600'}`} />
                                        <span className="font-mono">{profile.cnic || 'CNIC not provided'}</span>
                                    </span>
                                    {(profile.class || profile.staffType) && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 ring-1 ring-gray-200/80 text-gray-700 text-xs sm:text-sm font-semibold shadow-xs">
                                            <AcademicCapIcon className={`h-4 w-4 flex-shrink-0 ${currentTheme.iconText || 'text-green-600'}`} />
                                            <span>{role === 'student' ? (profile.class === 'BS' ? `${profile.degreeName || 'Degree'} · Sem ${profile.semester || '-'}` : `${profile.class || ''} ${profile.classNumber || ''}`) : profile.staffType}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {canEdit && (
                            <div className="w-full sm:w-auto flex justify-center sm:justify-end flex-shrink-0 pt-1 sm:pt-0">
                                <button
                                    onClick={handleEditClick}
                                    className={`w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base ${currentTheme.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-emerald-700'} ${currentTheme.btnPrimaryText || 'text-white'} ${currentTheme.btnPrimaryBorder || 'border border-emerald-700'} ${currentTheme?.shadow || 'shadow-lg'} active:scale-95 transition-all duration-200`}
                                >
                                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-6" />
                                    Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 col-span-1 lg:col-span-2`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-base sm:text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Personal Information</h3>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Core</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                            <InfoRow icon={UserIcon} label="Father's Name" value={profile.fatherName || 'Not provided'} />
                            <InfoRow icon={ScaleIcon} label="Gender" value={profile.gender} />
                            <InfoRow icon={EnvelopeIcon} label="Email" value={profile.email || 'Not provided'} />
                            <InfoRow icon={CakeIcon} label="Date of Birth" value={(profile.dob || profile.dateOfBirth) ? new Date(profile.dob || profile.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                            <InfoRow icon={IdentificationIcon} label="CNIC" value={profile.cnic} />
                            <InfoRow icon={MapPinIcon} label="Address" value={profile.address || 'Not provided'} />
                        </div>
                    </div>

                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-4 sm:p-6 space-y-4`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-base sm:text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Contact</h3>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Reach</span>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <InfoRow icon={PhoneIcon} label="Primary Contact" value={profile.contactNumber || profile.guardianContact || 'Not provided'} />
                            <InfoRow icon={PhoneIcon} label="Additional Contact" value={profile.additionalContact} />
                        </div>
                    </div>
                </div>

                {role === 'staff' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 col-span-1 lg:col-span-2`}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`text-base sm:text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Professional Information</h3>
                                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Role</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                                <InfoRow icon={BriefcaseIcon} label="Staff Type" value={profile.staffType} />
                                <InfoRow icon={CalendarDaysIcon} label="Date of Joining" value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'Not provided'} />
                                <InfoRow icon={BanknotesIcon} label="Salary" value={profile.salary ? `PKR ${Number(profile.salary).toLocaleString()}` : 'Not provided'} />
                                <InfoRow icon={BookOpenIcon} label="Highest Education" value={profile.highestEducationLevel} />
                                {profile.staffType === 'Teacher' && (
                                    <InfoRow icon={ClipboardDocumentListIcon} label="Subjects" value={profile.subjectsTaught && profile.subjectsTaught.length ? profile.subjectsTaught.join(', ') : 'Not provided'} />
                                )}
                            </div>
                        </div>

                        {profile.bankAccountDetails && (
                            <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-4 sm:p-6 space-y-4`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`text-base sm:text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Bank Details</h3>
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Finance</span>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    <InfoRow icon={BanknotesIcon} label="Bank Name" value={profile.bankAccountDetails.bankName} />
                                    <InfoRow icon={HomeIcon} label="Account Number" value={profile.bankAccountDetails.accountNumber} />
                                    <InfoRow icon={BookOpenIcon} label="IBAN" value={profile.bankAccountDetails.iban} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {role === 'student' && (
                    <div className={`${currentTheme.cardBg || 'bg-white'} ${currentTheme.shadow || 'shadow-lg'} ${currentTheme.border || 'border border-gray-100'} rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5`}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-base sm:text-lg font-bold ${currentTheme.subtitle || 'text-gray-800'}`}>Academic Information</h3>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Studies</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
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
