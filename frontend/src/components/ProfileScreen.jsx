// src/screens/ProfileScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import {
    PencilIcon, CheckIcon, XMarkIcon, PhotoIcon, BuildingLibraryIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon, CakeIcon, UserIcon, MapPinIcon, CalendarDaysIcon, AcademicCapIcon, BriefcaseIcon, BanknotesIcon, BookOpenIcon, HomeIcon, ScaleIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import Message from '../components/Message';

import StaffForm from '../components/StaffForm';
import StudentForm from '../components/StudentForm';

const ProfileScreen = () => {
    const { currentUser: user, updateCurrentUser } = useContext(UserContext);
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
        fetchProfile(); // Re-fetch to discard any unsaved changes
    };

    const handleFormSubmitSuccess = () => {
        setIsEditing(false);
        fetchProfile(); // Re-fetch to show the updated data
    };

    if (loading) return <Loader />;
    if (error) return <Message type="error">{error}</Message>;
    if (!profile) return <Message type="info">Profile not found.</Message>;

    // Conditionally render the form for editing
    if (isEditing) {
        if (role === 'student') {
            return <StudentForm editingStudent={profile} onClose={handleFormSubmitSuccess} fetchStudents={fetchProfile} />;
        } else {
            return <StaffForm editingStaff={profile} onClose={handleFormSubmitSuccess} fetchStaff={fetchProfile} />;
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold font-serif text-green-800">
                    {role === 'student' ? 'Student Profile' : 'Staff Profile'}
                </h1>
                {canEdit && (
                    <button
                        onClick={handleEditClick}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md flex items-center"
                    >
                        <PencilIcon className="h-5 w-5 mr-2" /> Edit Details
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                    <img
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                        src={profile.profilePictureUrl ? `${backendBaseUrl}${profile.profilePictureUrl}` : '/default-avatar.jpg'}
                        alt={`${profile.name}'s profile picture`}
                    />
                </div>
                <div className="flex-grow w-full">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{profile.name}</h2>
                    <p className="text-gray-600">
                        {role === 'student' ? profile.class : profile.staffType}
                    </p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Personal Information</h3>
                    <div className="flex items-center text-gray-600">
                        <UserIcon className="h-5 w-5 mr-3 text-green-500" />
                        <span>Father's Name: {profile.fatherName}</span>
                    </div>
                    {profile.cnic && (
                        <div className="flex items-center text-gray-600">
                            <IdentificationIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>CNIC: {profile.cnic}</span>
                        </div>
                    )}
                    {profile.dob && (
                        <div className="flex items-center text-gray-600">
                            <CakeIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Date of Birth: {new Date(profile.dob).toLocaleDateString()}</span>
                        </div>
                    )}
                    <div className="flex items-center text-gray-600">
                        <EnvelopeIcon className="h-5 w-5 mr-3 text-green-500" />
                        <span>Email: {profile.email || 'N/A'}</span>
                    </div>
                    {profile.gender && (
                        <div className="flex items-center text-gray-600">
                            <ScaleIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Gender: {profile.gender}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Contact & Address</h3>
                    <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-5 w-5 mr-3 text-green-500" />
                        <span>Contact: {profile.contactNumber || profile.guardianContact}</span>
                    </div>
                    {profile.additionalContact && (
                        <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Additional Contact: {profile.additionalContact}</span>
                        </div>
                    )}
                    <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-3 text-green-500" />
                        <span>Address: {profile.address}</span>
                    </div>
                </div>
                {role === 'staff' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Professional Information</h3>
                            <div className="flex items-center text-gray-600">
                                <BriefcaseIcon className="h-5 w-5 mr-3 text-green-500" />
                                <span>Type: {profile.staffType}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <CalendarDaysIcon className="h-5 w-5 mr-3 text-green-500" />
                                <span>Date of Joining: {new Date(profile.dateOfJoining).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <BanknotesIcon className="h-5 w-5 mr-3 text-green-500" />
                                <span>Salary: PKR {profile.salary.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <BookOpenIcon className="h-5 w-5 mr-3 text-green-500" />
                                <span>Highest Education: {profile.highestEducationLevel}</span>
                            </div>
                            {profile.subjectsTaught && profile.subjectsTaught.length > 0 && (
                                <div className="flex items-center text-gray-600">
                                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3 text-green-500" />
                                    <span>Subjects Taught: {profile.subjectsTaught.join(', ')}</span>
                                </div>
                            )}
                        </div>
                        {profile.bankAccountDetails && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Bank Details</h3>
                                <div className="flex items-center text-gray-600">
                                    <BanknotesIcon className="h-5 w-5 mr-3 text-green-500" />
                                    <span>Bank Name: {profile.bankAccountDetails.bankName}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <HomeIcon className="h-5 w-5 mr-3 text-green-500" />
                                    <span>Account Number: {profile.bankAccountDetails.accountNumber}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <BookOpenIcon className="h-5 w-5 mr-3 text-green-500" />
                                    <span>IBAN: {profile.bankAccountDetails.iban}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {role === 'student' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Academic Information</h3>
                        <div className="flex items-center text-gray-600">
                            <AcademicCapIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Status: {profile.studentStatus}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BuildingLibraryIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Admission Date: {new Date(profile.admissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BookOpenIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>
                                Class: {profile.class === 'BS' ? `${profile.degreeName} - Semester ${profile.semester}` : `Class ${profile.classNumber}`}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BanknotesIcon className="h-5 w-5 mr-3 text-green-500" />
                            <span>Fee per Month: PKR {profile.feePerMonth}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;