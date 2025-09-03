// // src/screens/ProfileScreen.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../api'; // Your axios instance
// import { UserContext } from '../App';
// import {
//     PencilIcon, CheckIcon, XMarkIcon, PhotoIcon, BuildingLibraryIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon, CakeIcon, UserIcon, MapPinIcon, CalendarDaysIcon, AcademicCapIcon, BriefcaseIcon, BanknotesIcon, BookOpenIcon, HomeIcon, ScaleIcon, ClipboardDocumentListIcon
// } from '@heroicons/react/24/outline';
// import Loader from '../components/Loader';
// import Message from '../components/Message';

// const ProfileScreen = () => {
//     const { currentUser: user, updateCurrentUser } = useContext(UserContext);
//     const { role, id } = useParams();
//     const navigate = useNavigate();

//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({});
//     const [file, setFile] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');
//     const backendBaseUrl = 'http://localhost:5000';
//     const canEdit = user && (
//         user.role === 'admin' ||
//         ((role === 'student' && user.role === 'student' && user.profileId?.toString() === id) && user.editModeEnabled) ||
//         (['teacher', 'accountant', 'cook', 'cleaner'].includes(user.role) && user.profileId?.toString() === id && user.editModeEnabled)
//     );

//     const fetchProfile = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const endpoint = role === 'student' ? `/students/profile/${id}` : `/staff/profile/${id}`;
//             const { data } = await api.get(endpoint);
//             setProfile(data);
//             setFormData(data);
//             setLoading(false);
//         } catch (err) {
//             console.error('Error fetching profile:', err);
//             setError(err.response?.data?.message || 'Failed to fetch profile.');
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (!user) {
//             navigate('/login');
//             return;
//         }
//         fetchProfile();
//     }, [user, role, id, navigate]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (name.includes('.')) {
//             const [parent, child] = name.split('.');
//             setFormData(prev => ({
//                 ...prev,
//                 [parent]: {
//                     ...prev[parent],
//                     [child]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);
//         setSuccessMessage('');

//         const config = {
//             headers: {
//                 'Content-Type': 'multipart/form-data',
//             },
//         };

//         const formDataToSend = new FormData();
//         for (const key in formData) {
//             if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
//                 for (const nestedKey in formData[key]) {
//                     formDataToSend.append(`${key}[${nestedKey}]`, formData[key][nestedKey]);
//                 }
//             } else if (key === 'dob' || key === 'admissionDate' || key === 'dateOfJoining') {
//                 if (formData[key]) {
//                     // Ensure date is formatted as YYYY-MM-DD
//                     const dateValue = new Date(formData[key]);
//                     if (!isNaN(dateValue.getTime())) { // Check if it's a valid date
//                         formDataToSend.append(key, dateValue.toISOString().split('T')[0]);
//                     }
//                 }
//             } else {
//                 formDataToSend.append(key, formData[key]);
//             }
//         }
//         if (file) {
//             formDataToSend.append('profilePicture', file);
//         } else if (formData.profilePictureUrl === '') {
//             formDataToSend.append('profilePictureUrl', '');
//         }

//         try {
//             const endpoint = role === 'student' ? `/students/${id}` : `/staff/${id}`;
//             const { data } = await api.put(endpoint, formDataToSend, config);
//             setProfile(data);
//             setFormData(data);
//             setIsEditing(false);
//             setSuccessMessage('Profile updated successfully!');
//             if (user.profileId?.toString() === id) {
//                 // You might trigger a refetch of currentUser from UserContext or manually update relevant fields
//                 // For now, if the name is part of the user context, update it:
//                 if (data.name && user.name !== data.name) {
//                     updateCurrentUser({ ...user, name: data.name });
//                 }
//             }
//             setLoading(false);
//         } catch (err) {
//             console.error('Error updating profile:', err);
//             setError(err.response?.data?.message || 'Failed to update profile.');
//             setLoading(false);
//         }
//     };

//     const handleCancelEdit = () => {
//         setIsEditing(false);
//         setFormData(profile);
//         setFile(null);
//     };

//     if (loading) {
//         return <Loader />;
//     }

//     if (error) {
//         return <Message type="error">{error}</Message>;
//     }

//     if (!profile) {
//         return <Message type="info">No profile data found.</Message>;
//     }

//     // Helper to render a field conditionally with icon
//     const renderField = (Icon, label, value) => (
//         value ? (
//             <p className="mb-3 flex items-center text-gray-700 text-base">
//                 <Icon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0" />
//                 <span className="font-semibold">{label}:</span> <span className="ml-2">{value}</span>
//             </p>
//         ) : null
//     );

//     // Helper to render an editable input field with icon
//     const renderEditField = (Icon, label, name, type = 'text', value) => (
//         <div className="mb-4">
//             <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
//                 <Icon className="h-4 w-4 mr-2 text-indigo-500" /> {label}
//             </label>
//             {type === 'select' ? (
//                 <select
//                     id={name}
//                     name={name}
//                     value={value || ''}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none pr-8"
//                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
//                 >
//                     {name === 'gender' && (
//                         <>
//                             <option value="">Select Gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                             <option value="Other">Other</option>
//                         </>
//                     )}
//                     {name === 'class' && role === 'student' && (
//                         <>
//                             <option value="">Select Class</option>
//                             <option value="Class">Class</option>
//                             <option value="BS">BS</option>
//                         </>
//                     )}
//                 </select>
//             ) : (
//                 <input
//                     type={type}
//                     id={name}
//                     name={name}
//                     value={value || ''}
//                     onChange={handleChange}
//                     readOnly={name === 'cnic' && user.role !== 'admin'} // CNIC read-only for non-admins
//                     className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${name === 'cnic' && user.role !== 'admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                 />
//             )}
//         </div>
//     );

//     const renderSectionTitle = (Icon, title) => (
//         <h3 className="text-xl font-semibold text-gray-800 mb-5 mt-8 border-b-2 border-indigo-100 pb-3 flex items-center">
//             <Icon className="h-6 w-6 mr-3 text-indigo-600" /> {title}
//         </h3>
//     );

//     const getDocFileName = (url) => {
//         if (!url) return 'N/A';
//         try {
//             const parts = url.split('/');
//             return parts[parts.length - 1].split('?')[0]; // Remove query params
//         } catch (e) {
//             return url;
//         }
//     };


//     return (
//         <div className="container mx-auto p-8 bg-gray-50 shadow-2xl rounded-xl my-12 max-w-5xl animate-fade-in">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200">
//                 <h2 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
//                     {isEditing ? `Edit ${profile.name}'s Profile` : `${profile.name}'s Profile`}
//                 </h2>
//             </div>

//             {successMessage && <Message type="success">{successMessage}</Message>}
//             {error && <Message type="error">{error}</Message>}

//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//                 {/* Profile Picture & Basic Info Card */}
//                 <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-start border border-gray-100">
//                     <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-300 mb-6 flex items-center justify-center bg-gray-100 relative group">
//                         {profile.profilePictureUrl ? (
//                             <img src={`${backendBaseUrl}${profile.profilePictureUrl}`} alt="Profile" className="w-full h-full object-cover" />
//                         ) : (
//                             <PhotoIcon className="h-24 w-24 text-gray-400" />
//                         )}
//                         {isEditing && (
//                             <label htmlFor="profilePicture" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full">
//                                 <PhotoIcon className="h-6 w-6 mr-2" /> Change Photo
//                                 <input
//                                     type="file"
//                                     id="profilePicture"
//                                     name="profilePicture"
//                                     accept="image/*"
//                                     onChange={handleFileChange}
//                                     className="hidden"
//                                 />
//                             </label>
//                         )}
//                     </div>
//                     <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h3>
//                     <p className="text-lg text-indigo-600 font-medium">{profile.designation || profile.class}</p> {/* Dynamic designation/class */}
//                     <p className="text-gray-500 text-sm mt-1">{profile.cnic}</p>
//                     {isEditing && profile.profilePictureUrl && (
//                         <button
//                             type="button"
//                             onClick={() => { setFile(null); setFormData(prev => ({ ...prev, profilePictureUrl: '' })); }}
//                             className="mt-4 text-sm text-red-600 hover:text-red-800 flex items-center"
//                         >
//                             <XMarkIcon className="h-4 w-4 mr-1" /> Remove Picture
//                         </button>
//                     )}
//                 </div>

//                 {/* Profile Details Sections */}
//                 <div className="lg:col-span-3">
//                     {isEditing ? (
//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                 {renderSectionTitle(UserIcon, 'Personal Information')}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {renderEditField(UserIcon, 'Name', 'name', 'text', formData.name)}
//                                     {renderEditField(UserIcon, 'Father Name', 'fatherName', 'text', formData.fatherName)}
//                                     {renderEditField(IdentificationIcon, 'CNIC', 'cnic', 'text', formData.cnic)}
//                                     {renderEditField(MapPinIcon, 'Address', 'address', 'text', formData.address)}
//                                     {renderEditField(PhoneIcon, 'Guardian Contact', 'guardianContact', 'text', formData.guardianContact)}
//                                     {renderEditField(PhoneIcon, 'Additional Contact', 'additionalContact', 'text', formData.additionalContact)}
//                                     {renderEditField(EnvelopeIcon, 'Email', 'email', 'email', formData.email)}
//                                     {renderEditField(CakeIcon, 'Date of Birth', 'dob', 'date', formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : '')}
//                                     {renderEditField(UserIcon, 'Gender', 'gender', 'select', formData.gender)}
//                                 </div>
//                             </div>

//                             {/* Student specific fields */}
//                             {role === 'student' && (
//                                 <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                     {renderSectionTitle(AcademicCapIcon, 'Academic Information')}
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         {renderEditField(CalendarDaysIcon, 'Admission Date', 'admissionDate', 'date', formData.admissionDate ? new Date(formData.admissionDate).toISOString().split('T')[0] : '')}
//                                         {renderEditField(HomeIcon, 'Class Type', 'class', 'select', formData.class)}
//                                         {formData.class === 'Class' && renderEditField(HomeIcon, 'Class Number', 'classNumber', 'text', formData.classNumber)}
//                                         {formData.class === 'BS' && renderEditField(AcademicCapIcon, 'Semester', 'semester', 'number', formData.semester)}
//                                         {renderEditField(BookOpenIcon, 'Major Subject', 'majorSubject', 'text', formData.majorSubject)}
//                                         {renderEditField(AcademicCapIcon, 'Degree Name', 'degreeName', 'text', formData.degreeName)}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Staff specific fields */}
//                             {role === 'staff' && (
//                                 <>
//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(BriefcaseIcon, 'Employment Information')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                             {renderEditField(CalendarDaysIcon, 'Date of Joining', 'dateOfJoining', 'date', formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : '')}
//                                             {renderEditField(BriefcaseIcon, 'Designation', 'designation', 'text', formData.designation)}
//                                             {renderEditField(AcademicCapIcon, 'Highest Education Level', 'highestEducationLevel', 'text', formData.highestEducationLevel)}
//                                             {renderEditField(PhoneIcon, 'Emergency Contact', 'emergencyContact', 'text', formData.emergencyContact)}
//                                         </div>
//                                     </div>

//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(BuildingLibraryIcon, 'Bank Account Details')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                             {renderEditField(BuildingLibraryIcon, 'Bank Name', 'bankAccountDetails.bankName', 'text', formData.bankAccountDetails?.bankName)}
//                                             {renderEditField(BanknotesIcon, 'Account Number', 'bankAccountDetails.accountNumber', 'text', formData.bankAccountDetails?.accountNumber)}
//                                             {renderEditField(ScaleIcon, 'IBAN', 'bankAccountDetails.iban', 'text', formData.bankAccountDetails?.iban)}
//                                         </div>
//                                     </div>
//                                 </>
//                             )}

//                             <div className="mt-8 flex justify-end space-x-4">
//                                 <button
//                                     type="button"
//                                     onClick={handleCancelEdit}
//                                     className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 shadow-sm flex items-center"
//                                 >
//                                     <XMarkIcon className="h-5 w-5 inline-block mr-2" /> Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md flex items-center"
//                                 >
//                                     <CheckIcon className="h-5 w-5 inline-block mr-2" /> Save Changes
//                                 </button>
//                             </div>
//                         </form>
//                     ) : (
//                         // Read-only view
//                         <div className="space-y-6">
//                             <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                 {renderSectionTitle(UserIcon, 'Personal Information')}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {renderField(UserIcon, 'Name', profile.name)}
//                                     {renderField(UserIcon, 'Father Name', profile.fatherName)}
//                                     {renderField(IdentificationIcon, 'CNIC', profile.cnic)}
//                                     {renderField(MapPinIcon, 'Address', profile.address)}
//                                     {renderField(PhoneIcon, 'Guardian Contact', profile.guardianContact)}
//                                     {renderField(PhoneIcon, 'Additional Contact', profile.additionalContact)}
//                                     {renderField(EnvelopeIcon, 'Email', profile.email)}
//                                     {profile.dob && renderField(CakeIcon, 'Date of Birth', new Date(profile.dob).toLocaleDateString())}
//                                     {renderField(UserIcon, 'Gender', profile.gender)}
//                                 </div>
//                             </div>

//                             {role === 'student' && (
//                                 <>
//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(AcademicCapIcon, 'Academic Information')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {profile.admissionDate && renderField(CalendarDaysIcon, 'Admission Date', new Date(profile.admissionDate).toLocaleDateString())}
//                                             {renderField(HomeIcon, 'Class Type', profile.class)}
//                                             {profile.class === 'Class' && renderField(HomeIcon, 'Class Number', profile.classNumber)}
//                                             {profile.class === 'BS' && renderField(AcademicCapIcon, 'Semester', profile.semester)}
//                                             {renderField(BookOpenIcon, 'Major Subject', profile.majorSubject)}
//                                             {renderField(AcademicCapIcon, 'Degree Name', profile.degreeName)}
//                                             {renderField(BanknotesIcon, 'Fee Per Month', `${profile.feePerMonth}`)}
//                                             {renderField(CheckIcon, 'Fee Status', profile.feeStatus)}
//                                             {renderField(BanknotesIcon, 'Deposited Amount', `${profile.depositedAmount}`)}
//                                             {renderField(BanknotesIcon, 'Other Dues', `${profile.otherDues}`)}
//                                             {renderField(UserIcon, 'Student Status', profile.studentStatus)}
//                                             {renderField(UserIcon, 'Reason (for status)', profile.reason)}
//                                         </div>
//                                     </div>

//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(ClipboardDocumentListIcon, 'Documents')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {profile.cnicFrontUrl && renderField(IdentificationIcon, 'CNIC Front', <a href={profile.cnicFrontUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.cnicFrontUrl)}</a>)}
//                                             {profile.cnicBackUrl && renderField(IdentificationIcon, 'CNIC Back', <a href={profile.cnicBackUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.cnicBackUrl)}</a>)}
//                                             {profile.bFormUrl && renderField(UserIcon, 'B-Form', <a href={profile.bFormUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.bFormUrl)}</a>)}
//                                             {profile.domicileUrl && renderField(MapPinIcon, 'Domicile', <a href={profile.domicileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.domicileUrl)}</a>)}
//                                             {profile.prevAcademicRecordUrl && renderField(BookOpenIcon, 'Prev Academic Record', <a href={profile.prevAcademicRecordUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.prevAcademicRecordUrl)}</a>)}
//                                             {profile.characterCertificateUrl && renderField(AcademicCapIcon, 'Character Certificate', <a href={profile.characterCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.characterCertificateUrl)}</a>)}
//                                         </div>
//                                     </div>
//                                 </>
//                             )}

//                             {role === 'staff' && (
//                                 <>
//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(BriefcaseIcon, 'Employment Information')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {profile.dateOfJoining && renderField(CalendarDaysIcon, 'Date of Joining', new Date(profile.dateOfJoining).toLocaleDateString())}
//                                             {renderField(BriefcaseIcon, 'Staff Type', profile.staffType)}
//                                             {renderField(BriefcaseIcon, 'Designation', profile.designation)}
//                                             {renderField(BanknotesIcon, 'Salary', `${profile.salary}`)}
//                                             {renderField(AcademicCapIcon, 'Highest Education Level', profile.highestEducationLevel)}
//                                             {profile.subjectsTaught && profile.subjectsTaught.length > 0 && renderField(BookOpenIcon, 'Subjects Taught', profile.subjectsTaught.join(', '))}
//                                             {renderField(PhoneIcon, 'Emergency Contact', profile.emergencyContact)}
//                                         </div>
//                                     </div>

//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(BuildingLibraryIcon, 'Bank Account Details')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {renderField(BuildingLibraryIcon, 'Bank Name', profile.bankAccountDetails?.bankName)}
//                                             {renderField(BanknotesIcon, 'Account Number', profile.bankAccountDetails?.accountNumber)}
//                                             {renderField(ScaleIcon, 'IBAN', profile.bankAccountDetails?.iban)}
//                                         </div>
//                                     </div>

//                                     <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
//                                         {renderSectionTitle(ClipboardDocumentListIcon, 'Documents')}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {profile.cnicFrontUrl && renderField(IdentificationIcon, 'CNIC Front', <a href={profile.cnicFrontUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.cnicFrontUrl)}</a>)}
//                                             {profile.cnicBackUrl && renderField(IdentificationIcon, 'CNIC Back', <a href={profile.cnicBackUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.cnicBackUrl)}</a>)}
//                                             {profile.resumeUrl && renderField(UserIcon, 'Resume', <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.resumeUrl)}</a>)}
//                                             {profile.experienceLettersUrl && renderField(BriefcaseIcon, 'Experience Letters', <a href={profile.experienceLettersUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.experienceLettersUrl)}</a>)}
//                                             {profile.educationCertificatesUrl && renderField(AcademicCapIcon, 'Education Certificates', <a href={profile.educationCertificatesUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{getDocFileName(profile.educationCertificatesUrl)}</a>)}
//                                         </div>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//             {isEditing && (
//                 <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
//                     <button
//                         type="button"
//                         onClick={handleCancelEdit}
//                         className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 shadow-sm flex items-center"
//                     >
//                         <XMarkIcon className="h-5 w-5 inline-block mr-2" /> Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         form="profile-form"
//                         className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md flex items-center"
//                     >
//                         <CheckIcon className="h-5 w-5 inline-block mr-2" /> Save Changes
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProfileScreen;


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
                <h1 className="text-3xl font-bold text-gray-800">
                    {role === 'student' ? 'Student Profile' : 'Staff Profile'}
                </h1>
                {canEdit && (
                    <button
                        onClick={handleEditClick}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md flex items-center"
                    >
                        <PencilIcon className="h-5 w-5 mr-2" /> Edit Details
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0">
                    <img
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
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
                        <UserIcon className="h-5 w-5 mr-3 text-indigo-500" />
                        <span>Father's Name: {profile.fatherName}</span>
                    </div>
                    {profile.cnic && (
                        <div className="flex items-center text-gray-600">
                            <IdentificationIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>CNIC: {profile.cnic}</span>
                        </div>
                    )}
                    {profile.dob && (
                        <div className="flex items-center text-gray-600">
                            <CakeIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Date of Birth: {new Date(profile.dob).toLocaleDateString()}</span>
                        </div>
                    )}
                    <div className="flex items-center text-gray-600">
                        <EnvelopeIcon className="h-5 w-5 mr-3 text-indigo-500" />
                        <span>Email: {profile.email || 'N/A'}</span>
                    </div>
                    {profile.gender && (
                        <div className="flex items-center text-gray-600">
                            <ScaleIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Gender: {profile.gender}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Contact & Address</h3>
                    <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-5 w-5 mr-3 text-indigo-500" />
                        <span>Contact: {profile.contactNumber || profile.guardianContact}</span>
                    </div>
                    {profile.additionalContact && (
                        <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Additional Contact: {profile.additionalContact}</span>
                        </div>
                    )}
                    <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-3 text-indigo-500" />
                        <span>Address: {profile.address}</span>
                    </div>
                </div>
                {role === 'staff' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Professional Information</h3>
                            <div className="flex items-center text-gray-600">
                                <BriefcaseIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <span>Type: {profile.staffType}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <CalendarDaysIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <span>Date of Joining: {new Date(profile.dateOfJoining).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <BanknotesIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <span>Salary: PKR {profile.salary.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <BookOpenIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <span>Highest Education: {profile.highestEducationLevel}</span>
                            </div>
                            {profile.subjectsTaught && profile.subjectsTaught.length > 0 && (
                                <div className="flex items-center text-gray-600">
                                    <ClipboardDocumentListIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                    <span>Subjects Taught: {profile.subjectsTaught.join(', ')}</span>
                                </div>
                            )}
                        </div>
                        {profile.bankAccountDetails && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Bank Details</h3>
                                <div className="flex items-center text-gray-600">
                                    <BanknotesIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                    <span>Bank Name: {profile.bankAccountDetails.bankName}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <HomeIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                    <span>Account Number: {profile.bankAccountDetails.accountNumber}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <BookOpenIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                    <span>IBAN: {profile.bankAccountDetails.iban}</span>
                                </div>
                            </div>
                        )}
                        {profile.qrCodeSecret && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Attendance QR Code</h3>
                                {/* Assuming QR code is already generated and available */}
                                {/* <img src={`${backendBaseUrl}/api/staff/${profile._id}/qr-code`} alt="QR Code for Attendance" className="h-32 w-32" /> */}
                            </div>
                        )}
                    </>
                )}
                {role === 'student' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">Academic Information</h3>
                        <div className="flex items-center text-gray-600">
                            <AcademicCapIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Status: {profile.studentStatus}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BuildingLibraryIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Admission Date: {new Date(profile.admissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BookOpenIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>
                                Class: {profile.class === 'BS' ? `${profile.degreeName} - Semester ${profile.semester}` : `Class ${profile.classNumber}`}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <BanknotesIcon className="h-5 w-5 mr-3 text-indigo-500" />
                            <span>Fee per Month: PKR {profile.feePerMonth}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScreen;