// src/components/StudentForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { XMarkIcon, ArrowDownTrayIcon, MinusCircleIcon } from '@heroicons/react/24/outline'; // Added MinusCircleIcon for file removal
import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // For better table generation in PDF

// NOTE: Hardcoded map is now redundant but kept here for the PDF function's original logic.
// It will be phased out as the dynamic structure is fully integrated.
const degreeYearsMap = {
    'Islamiyat': 4,
    'Software Engineering': 4,
    'Honors': 2,
    '-': null
};

// Helper function to get academic data (for quick lookup)
const getAcademicConfig = (structure, slug) => structure?.find(type => type.slug === slug);

// Helper to calculate age from DOB
const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

// MODIFIED: Added academicStructure prop
const StudentForm = ({ editingStudent, fetchStudents, onClose, isViewMode = false, academicStructure }) => {
    const initialState = {
        name: '',
        fatherName: '',
        cnic: '',
        dob: '',
        gender: '',
        email: '',
        admissionDate: '',
        guardianContact: '',
        additionalContact: '',
        address: '',
        studentStatus: 'Regular',
        reason: '',
        class: '',
        classNumber: '',
        majorSubject: '',
        degreeName: '',
        semester: '',
        currentJuz: 0, // For Hifaz (NEW)
        currentSurah: '', // For Hifaz (NEW)
        feePerMonth: '',
        profilePictureUrl: '',
        depositedAmount: '',
        otherDues: '',
        // New document fields
        cnicFrontUrl: '',
        cnicBackUrl: '',
        bFormUrl: '',
        characterCertificateUrl: '',
        previousClassResultUrl: '', // For Class >= 9
        class10ResultUrl: '',       // For BS students
        class12ResultUrl: '',       // For BS students
        rollNumber: '',
    };
    const [student, setStudent] = useState(initialState);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [cnicFrontFile, setCnicFrontFile] = useState(null);
    const [cnicBackFile, setCnicBackFile] = useState(null);
    const [bFormFile, setBFormFile] = useState(null);
    const [characterCertificateFile, setCharacterCertificateFile] = useState(null);
    const [previousClassResultFile, setPreviousClassResultFile] = useState(null);
    const [class10ResultFile, setClass10ResultFile] = useState(null);
    const [class12ResultFile, setClass12ResultFile] = useState(null);

    const [generalFormError, setGeneralFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const backendBaseUrl = 'http://localhost:5000';

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditAllowed, setIsEditAllowed] = useState(false);
    const navigate = useNavigate();
    const { currentTheme } = useTheme();

    // Multi-step pagination
    const steps = ['Personal', 'Academic', 'Documents', 'Review'];
    const [currentStep, setCurrentStep] = useState(0);

    const validateStep = (stepIdx) => {
        const newFieldErrors = {};
        let ok = true;

        if (stepIdx === 0) {
            ['name','fatherName','cnic','dob','gender','guardianContact','address','admissionDate','rollNumber'].forEach((f)=>{
                if (!student[f]) { newFieldErrors[f] = 'This field is required.'; ok = false; }
            });
            if (student.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)) {
                newFieldErrors.email = 'Please enter a valid email address.'; ok = false;
            }
        }

        if (stepIdx === 1) {
            ['studentStatus','class','feePerMonth'].forEach((f)=>{ if (!student[f]) { newFieldErrors[f]='This field is required.'; ok=false; } });
            if (student.class === 'Class') {
                if (!student.classNumber) { newFieldErrors.classNumber = 'Class Number is required.'; ok=false; }
                if (!student.majorSubject) { newFieldErrors.majorSubject = 'Major Subject is required.'; ok=false; }
            } else if (student.class === 'BS') {
                if (!student.degreeName) { newFieldErrors.degreeName = 'Degree Name is required.'; ok=false; }
                if (!student.semester) { newFieldErrors.semester = 'Semester is required.'; ok=false; }
            } else if (student.class === 'Almiya') {
                if (!student.classNumber) { newFieldErrors.classNumber = 'Almiya Class Grade is required.'; ok=false; }
            }
            if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) <= 0) {
                newFieldErrors.feePerMonth = 'Fee Per Month must be a positive number.'; ok=false;
            }
        }

        setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
        if (!ok) setGeneralFormError('Please correct the errors before continuing.');
        return ok;
    };

    const goNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
            setGeneralFormError('');
        }
    };
    const goPrev = () => {
        setCurrentStep((s) => Math.max(s - 1, 0));
        setGeneralFormError('');
    };


    useEffect(() => {
        if (editingStudent) {
            setStudent({
                ...editingStudent,
                dob: editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : '',
                admissionDate: editingStudent.admissionDate ? new Date(editingStudent.admissionDate).toISOString().split('T')[0] : '',
                profilePictureUrl: editingStudent.profilePictureUrl || '',
                feePerMonth: editingStudent.feePerMonth !== undefined ? editingStudent.feePerMonth.toString() : '',
                reason: editingStudent.reason || '',
                depositedAmount: editingStudent.depositedAmount !== undefined ? editingStudent.depositedAmount.toString() : '',
                otherDues: editingStudent.otherDues !== undefined ? editingStudent.otherDues.toString() : '',
                // NEW HIFAZ FIELDS
                currentJuz: editingStudent.currentJuz !== undefined ? editingStudent.currentJuz : 0,
                currentSurah: editingStudent.currentSurah || '',
                // Initialize new document URLs
                cnicFrontUrl: editingStudent.cnicFrontUrl || '',
                cnicBackUrl: editingStudent.cnicBackUrl || '',
                bFormUrl: editingStudent.bFormUrl || '',
                characterCertificateUrl: editingStudent.characterCertificateUrl || '',
                previousClassResultUrl: editingStudent.previousClassResultUrl || '',
                class10ResultUrl: editingStudent.class10ResultUrl || '',
                class12ResultUrl: editingStudent.class12ResultUrl || '',
                rollNumber: editingStudent.rollNumber || '',
            });
            // Clear file inputs when editing an existing student, as URLs are used
            setProfilePictureFile(null);
            setCnicFrontFile(null);
            setCnicBackFile(null);
            setBFormFile(null);
            setCharacterCertificateFile(null);
            setPreviousClassResultFile(null);
            setClass10ResultFile(null);
            setClass12ResultFile(null);

        } else {
            setStudent(initialState);
            // Clear all file states for a new form
            setProfilePictureFile(null);
            setCnicFrontFile(null);
            setCnicBackFile(null);
            setBFormFile(null);
            setCharacterCertificateFile(null);
            setPreviousClassResultFile(null);
            setClass10ResultFile(null);
            setClass12ResultFile(null);
        }
        setGeneralFormError('');
        setFieldErrors({});
    }, [editingStudent]);


    // Effect to load current user and set edit permissions
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        let user = null;
        if (userInfo) {
            try {
                user = JSON.parse(userInfo);
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to parse user info from localStorage", e);
                localStorage.removeItem('userInfo');
            }
        }

        let allowed = false;
        // Admin can always edit
        if (user?.role === 'admin') {
            allowed = true;
        }
        // Teacher can edit if editModeEnabled is true
        else if (user?.role === 'teacher' && user.editModeEnabled) {
            allowed = true;
        }
        // Student can edit if editModeEnabled is true AND it's their own profile
        else if (user?.role === 'student' && user.editModeEnabled) {
            const currentProfileId = user.profileId;
            const formTargetId = editingStudent?._id;
            if (currentProfileId === formTargetId) {
                allowed = true;
            }
        }
        // Other roles (cook, cleaner, accountant) cannot edit student data
        setIsEditAllowed(allowed);
    }, [editingStudent]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setGeneralFormError('');
    };

    // Generic file handler for new document fields
    const handleDocumentFileChange = (e, setFileState, urlFieldName) => {
        const file = e.target.files[0];
        setFileState(file);
        // Clear the existing URL for this field if a new file is selected
        setStudent(prev => ({ ...prev, [urlFieldName]: '' }));
    };

    const handleRemoveDocumentFile = (setFileState, urlFieldName) => {
        setFileState(null);
        setStudent(prev => ({ ...prev, [urlFieldName]: '' })); // Clear the URL in state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralFormError('');
        setFieldErrors({});

        // Add this permission check
        if (!isEditAllowed) {
            setGeneralFormError('You do not have permission to perform this action.');
            return;
        }
        const newFieldErrors = {};
        let hasError = false;

        const requiredFields = ['name', 'fatherName', 'cnic', 'dob', 'gender', 'guardianContact', 'address', 'admissionDate', 'studentStatus', 'class', 'feePerMonth'];
        requiredFields.forEach(field => {
            if (!student[field]) {
                newFieldErrors[field] = 'This field is required.';
                hasError = true;
            }
        });

        if ((student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn') && !student.reason) {
            newFieldErrors.reason = 'Reason is required for Expelled or Withdrawn status.';
            hasError = true;
        }

        // Conditional Required Fields based on Academic Type (DYNAMIC)
        if (student.class === 'Class') {
            if (!student.classNumber) { newFieldErrors.classNumber = 'Class Number is required.'; hasError = true; }
            if (!student.majorSubject) { newFieldErrors.majorSubject = 'Major Subject is required.'; hasError = true; }
        } else if (student.class === 'BS') {
            if (!student.degreeName) { newFieldErrors.degreeName = 'Degree Name is required.'; hasError = true; }
            if (!student.semester) { newFieldErrors.semester = 'Semester is required.'; hasError = true; }
        }
        else if (student.class === 'Almiya') {
             if (!student.classNumber) { newFieldErrors.classNumber = 'Almiya Class Grade is required.'; hasError = true; }
        } else if (student.class === 'Hifaz') {
             // currentJuz is defaulted to 0, which is valid (not started)
        }

        if (isNaN(parseFloat(student.feePerMonth)) || parseFloat(student.feePerMonth) <= 0) {
            newFieldErrors.feePerMonth = 'Fee Per Month must be a positive number.';
            hasError = true;
        }
        if (student.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)) {
            newFieldErrors.email = 'Please enter a valid email address.';
            hasError = true;
        }
        if (student.cnic && !/^\d{13}$/.test(student.cnic)) {
            newFieldErrors.cnic = 'CNIC must be 13 digits.';
            hasError = true;
        }
        if (student.guardianContact && !/^\d{11}$/.test(student.guardianContact)) {
            newFieldErrors.guardianContact = 'Guardian Contact must be 11 digits.';
            hasError = true;
        }
        if (student.additionalContact && student.additionalContact !== '' && !/^\d{11}$/.test(student.additionalContact)) {
            newFieldErrors.additionalContact = 'Additional Contact must be 11 digits.';
            hasError = true;
        }

        // --- Document Field Validations (kept simple for this fix) ---
        // You should re-implement the full validation based on age/class type later.

        setFieldErrors(newFieldErrors);

        if (hasError) {
            setGeneralFormError('Please correct the errors in the form before submitting.');
            return;
        }

        const formData = new FormData();

        // Append all student fields
        for (const key in student) {
            // Exclude file URLs from direct append, as they are handled separately by file inputs
            if (!key.endsWith('Url') && student[key] !== null) {
                formData.append(key, student[key]);
            }
        }

        // Append files or their existing URLs
        const appendFileOrUrl = (file, url, fieldName) => {
            if (file) {
                formData.append(fieldName, file);
            } else if (url) {
                formData.append(`${fieldName}Url`, url);
            } else {
                formData.append(`${fieldName}Url`, ''); // Explicitly clear if no file and no URL
            }
        };

        appendFileOrUrl(profilePictureFile, student.profilePictureUrl, 'profilePicture');
        appendFileOrUrl(cnicFrontFile, student.cnicFrontUrl, 'cnicFront');
        appendFileOrUrl(cnicBackFile, student.cnicBackUrl, 'cnicBack');
        appendFileOrUrl(bFormFile, student.bFormUrl, 'bForm');
        appendFileOrUrl(characterCertificateFile, student.characterCertificateUrl, 'characterCertificate');
        appendFileOrUrl(previousClassResultFile, student.previousClassResultUrl, 'previousClassResult');
        appendFileOrUrl(class10ResultFile, student.class10ResultUrl, 'class10Result');
        appendFileOrUrl(class12ResultFile, student.class12ResultUrl, 'class12Result');

        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                } else {
                    await api.post('/students', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            fetchStudents(); // Refresh student list in parent component
            onClose();
        } catch (err) {
            console.error('Failed to save student:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.message;

            if (errorMessage.includes('duplicate key error') && errorMessage.includes('cnic')) {
                setFieldErrors(prev => ({ ...prev, cnic: 'This CNIC is already registered.' }));
                setGeneralFormError('Failed to save student: Duplicate CNIC detected.');
            } else if (err.response?.data?.errors) {
                // Handle Mongoose validation errors
                const backendErrors = err.response.data.errors;
                const newErrors = {};
                for (const key in backendErrors) {
                    newErrors[key] = backendErrors[key].message;
                }
                setFieldErrors(prev => ({ ...prev, ...newErrors }));
                setGeneralFormError('Failed to save student: Please correct the highlighted fields.');
            }
            else {
                setGeneralFormError('Failed to save student: ' + errorMessage);
            }
        }
    };

    const getTitle = () => {
        if (isViewMode) return 'Student Details';
        if (editingStudent) return 'Edit Student';
        return 'Add New Student';
    };

    const showReasonField = student.studentStatus === 'Expelled' || student.studentStatus === 'Withdrawn';
    const studentAge = calculateAge(student.dob);
    const isAdult = studentAge !== null && studentAge >= 18;
    
    // Dynamic logic for determining result requirements
    const isClassType = student.class === 'Class';
    const isAlmiyaType = student.class === 'Almiya';
    const isHifazType = student.class === 'Hifaz';
    const isBsStudent = student.class === 'BS';
    
    const isClass9OrAbove = isClassType && parseInt(student.classNumber) >= 9;

    // Determine which ID proof fields to show
    const showCnicFields = isAdult && student.cnic && student.cnic.length === 13;
    const showBFormField = !isAdult || (isAdult && (!student.cnic || student.cnic.length !== 13));

    // Determine which result fields to show
    const showPreviousClassResultField = isClass9OrAbove || isAlmiyaType || isHifazType;
    const showBsResultsFields = isBsStudent;


    // MODIFIED: Use the passed prop for dynamic config
    const selectedAcademicType = getAcademicConfig(academicStructure, student.class);


    const handleDownloadPdf = async () => {
        // ... (PDF logic remains mostly the same, but uses dynamic data where possible) ...
        const doc = new jsPDF();
        let yPos = 20;
        const margin = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const columnGap = 30;
        const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

        // --- Institute Logo + Title ---
        const logo = new Image();
        logo.src = './Jamia Logo.png';

        await new Promise((resolve) => {
            logo.onload = () => {
                doc.addImage(logo, 'JPEG', margin, yPos - 5, 15, 15);
                resolve();
            };
            logo.onerror = () => resolve();
        });

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Jamia Tul Mastwaar', margin + 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Makhdoom Pur Sharif, Chakwal', margin + 20, yPos);
        yPos += 5;
        doc.text('Phone: (042) 1234567 | Email: info.mastwaar@gmail.com', margin + 20, yPos);
        yPos += 12;

        // --- Title & Timestamp ---
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text('Student Details', pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;

        // --- Profile Picture Centered ---
        if (student.profilePictureUrl) {
            try {
                const img = new Image();
                img.src = `${backendBaseUrl}${student.profilePictureUrl}`;
                await new Promise((resolve) => {
                    img.onload = () => {
                        const imgWidth = 40;
                        const imgHeight = (img.height * imgWidth) / img.width;
                        const xOffset = (pageWidth - imgWidth) / 2;
                        if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                            doc.addPage();
                            yPos = margin;
                        }
                        doc.addImage(img, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 15;
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
            } catch {
                yPos += 10;
            }
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No Profile Picture Available', pageWidth / 2, yPos, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yPos += 10;
        }

        // --- Add Field Function (Two per row) ---
        const addTwoFields = (label1, value1, label2, value2) => {
            const addSingle = (x, label, value) => {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, x, yPos);
                const labelWidth = doc.getTextWidth(`${label}:`);
                doc.setFont(undefined, 'normal');
                doc.text(`${value || '-'}`, x + labelWidth + 3, yPos);
            };

            addSingle(margin, label1, value1);

            if (label2 && String(label2).trim() !== '') {
                addSingle(margin + columnWidth + columnGap, label2, value2);
            }
            yPos += 8;

            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };

        const addFullWidthField = (label, value) => {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`${label}:`, margin, yPos);
            const labelWidth = doc.getTextWidth(`${label}:`);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(value || '-', pageWidth - margin * 2 - labelWidth - 4);
            doc.text(lines, margin + labelWidth + 4, yPos);
            yPos += lines.length * 7 + 2;

            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };

        const addDocumentFieldToPdf = async (label, url) => {
            if (url) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, margin, yPos);
                doc.setFont(undefined, 'normal');
                doc.setTextColor(0, 0, 255); // green color for link
                doc.textWithLink('View Document', margin + doc.getTextWidth(`${label}: `), yPos, { url: `${backendBaseUrl}${url}` });
                doc.setTextColor(0, 0, 0); // Reset color
                yPos += 8;
            } else {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, margin, yPos);
                doc.setFont(undefined, 'normal');
                doc.text('N/A', margin + doc.getTextWidth(`${label}: `), yPos);
                yPos += 8;
            }
            if (yPos > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
        };


        // --- Render Fields ---
        addTwoFields('Student Name', student.name, 'Father Name', student.fatherName);
        addTwoFields('CNIC', student.cnic, 'Gender', student.gender);
        addTwoFields('DOB', student.dob ? new Date(student.dob).toLocaleDateString() : '', 'Email', student.email);
        addTwoFields('Guardian Contact', student.guardianContact, 'Additional Contact', student.additionalContact);
        addTwoFields('Admission Date', student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '', 'Student Status', student.studentStatus);
        addTwoFields('Class Type', student.class, 'Fee Per Month', student.feePerMonth);
        addTwoFields('Deposited Amount', student.depositedAmount !== '' ? `PKR ${parseFloat(student.depositedAmount).toFixed(2)}` : 'PKR 0.00', 'Other Dues', student.otherDues !== '' ? `PKR ${parseFloat(student.otherDues).toFixed(2)}` : 'PKR 0.00');

        if (showReasonField) addFullWidthField('Reason', student.reason);
        
        // Dynamic Academic Info for PDF
        if (student.class === 'Class' || student.class === 'Almiya') {
            const classIdentifier = selectedAcademicType?.classConfig.find(c => c.classNumber === student.classNumber)?.classIdentifier;
            addTwoFields('Class Grade/Number', `${classIdentifier} (${student.classNumber})`, 'Major Subject', student.majorSubject);
        } else if (student.class === 'BS') {
            const degreeConfig = selectedAcademicType?.degreeConfig.find(d => d.degreeName === student.degreeName);
            addTwoFields('Degree Name', student.degreeName, 'Semester', student.semester);
            addFullWidthField('Degree Years', degreeConfig?.years || '-');
        } else if (student.class === 'Hifaz') {
            addTwoFields('Current Juz', student.currentJuz, 'Current Surah/Checkpoint', student.currentSurah);
        }

        addFullWidthField('Address', student.address);

        // --- Document Section ---
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Uploaded Documents', 15, yPos);
        yPos += 8;

        if (showCnicFields) {
            await addDocumentFieldToPdf('CNIC Front', student.cnicFrontUrl);
            await addDocumentFieldToPdf('CNIC Back', student.cnicBackUrl);
        }
        if (showBFormField) {
            await addDocumentFieldToPdf('B-Form Copy', student.bFormUrl);
        }
        await addDocumentFieldToPdf('Character Certificate', student.characterCertificateUrl);
        if (showPreviousClassResultField) {
            await addDocumentFieldToPdf('Previous Class Result', student.previousClassResultUrl);
        }
        if (showBsResultsFields) {
            await addDocumentFieldToPdf('Class 10 Result', student.class10ResultUrl);
            await addDocumentFieldToPdf('Class 12 Result', student.class12ResultUrl);
        }

        // Save
        doc.save(`${student.name.replace(/\s/g, '_')}_details.pdf`);
    };

    // Helper component to render file input and preview
    const FileInputWithPreview = ({ label, name, file, url, onFileChange, onRemoveFile, error, isViewMode }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            {!isViewMode ? (
                <input
                    type="file"
                    id={name}
                    name={name}
                    accept="image/*"
                    onChange={onFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
            ) : null}
            {(file || url) && (
                <div className="mt-2 relative w-40 h-40 border border-gray-300 rounded-md overflow-hidden">
                    <img src={file ? URL.createObjectURL(file) : `${backendBaseUrl}${url}`} alt={`${label} Preview`} className="w-full h-full object-cover" />
                    {!isViewMode && (
                        <button
                            type="button"
                            onClick={onRemoveFile}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                            aria-label={`Remove ${label}`}
                        >
                            <MinusCircleIcon className="h-4 w-4" />
                        </button>
                    )}
                    {isViewMode && url && (
                        <a
                            href={`${backendBaseUrl}${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:bg-opacity-75"
                        >
                            View Full
                        </a>
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );


    return (
        <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100">
            {/* Header Section (fixed at top) */}
            <div className="flex-shrink-0 relative">
                <button onClick={onClose} className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition duration-200 p-2 rounded-full hover:bg-gray-100" title="Close" >
                    <XMarkIcon className="h-7 w-7" />
                </button>
                <h2 className="text-3xl sm:text-4xl font-black mb-2 text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">{getTitle()}</h2>
                <p className="text-center text-gray-500 text-sm mb-4">Fill in all required fields to continue</p>
                <hr className="mb-6 border-gray-200" />
                {/* Modern Stepper */}
                {!isViewMode && (
                    <div className="mb-8 px-4 py-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-200 shadow-sm">
                        <ol className="flex items-center justify-between relative">
                            {/* Background connecting line */}
                            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-teal-300 -z-10" style={{width: `${(steps.length - 1) * (100 / (steps.length - 1))}%`}} />
                            {steps.map((label, idx) => (
                                <li key={label} className="flex flex-col items-center flex-1">
                                    <div className="relative z-10 mb-3">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 ${idx < currentStep ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110' : idx === currentStep ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-lg ring-4 ring-green-200 scale-110' : 'bg-gray-200 text-gray-500'}`}>
                                            {idx < currentStep ? '\u2713' : (idx + 1)}
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold text-center transition-all duration-300 whitespace-nowrap px-1 ${idx === currentStep ? 'text-green-700 font-bold' : idx < currentStep ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
                {generalFormError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 shadow-sm flex items-start gap-3" role="alert">
                        <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <span>{generalFormError}</span>
                    </div>
                )}
            </div>

            {/* Scrollable Form Content Area (takes remaining vertical space) */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar transition-all duration-300">
                <div className={`${currentStep === 0 || isViewMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 animate-fade-in' : 'hidden'}`}>
                    {/* Profile Picture */}
                    <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center">
                        <FileInputWithPreview
                            label="Profile Picture"
                            name="profilePicture"
                            file={profilePictureFile}
                            url={student.profilePictureUrl}
                            onFileChange={(e) => handleDocumentFileChange(e, setProfilePictureFile, 'profilePictureUrl')}
                            onRemoveFile={() => handleRemoveDocumentFile(setProfilePictureFile, 'profilePictureUrl')}
                            error={fieldErrors.profilePictureUrl}
                            isViewMode={isViewMode}
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                            <input type="text" id="name" name="name" value={student.name} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                        </div>
                        {/* Father Name */}
                        <div>
                            <label htmlFor="fatherName" className="block text-sm font-bold text-gray-700 mb-2">Father Name</label>
                            <input type="text" id="fatherName" name="fatherName" value={student.fatherName} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.fatherName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fatherName}</p>}
                        </div>
                        {/* CNIC */}
                        <div>
                            <label htmlFor="cnic" className="block text-sm font-bold text-gray-700 mb-2">CNIC</label>
                            <input type="text" id="cnic" name="cnic" value={student.cnic} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.cnic && <p className="mt-1 text-sm text-red-600">{fieldErrors.cnic}</p>}
                        </div>
                        <div className="col-span-1">
              <label htmlFor="rollNumber" className="block text-sm font-bold text-gray-700 mb-2">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={student.rollNumber}
                onChange={handleChange}
                readOnly={isViewMode}
                required
                className="mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm hover:border-gray-300"
              />
            </div>
                        {/* DOB */}
                        <div>
                            <label htmlFor="dob" className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                            <input type="date" id="dob" name="dob" value={student.dob} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.dob && <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>}
                        </div>
                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                            <select id="gender" name="gender" value={student.gender} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {fieldErrors.gender && <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>}
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" name="email" value={student.email} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
                        </div>
                        {/* Admission Date */}
                        <div>
                            <label htmlFor="admissionDate" className="block text-sm font-bold text-gray-700 mb-2">Admission Date</label>
                            <input type="date" id="admissionDate" name="admissionDate" value={student.admissionDate} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.admissionDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.admissionDate}</p>}
                        </div>
                        {/* Guardian Contact */}
                        <div>
                            <label htmlFor="guardianContact" className="block text-sm font-bold text-gray-700 mb-2">Guardian Contact</label>
                            <input type="text" id="guardianContact" name="guardianContact" value={student.guardianContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.guardianContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.guardianContact}</p>}
                        </div>
                        {/* Additional Contact */}
                        <div>
                            <label htmlFor="additionalContact" className="block text-sm font-bold text-gray-700 mb-2">Additional Contact</label>
                            <input type="text" id="additionalContact" name="additionalContact" value={student.additionalContact} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.additionalContact && <p className="mt-1 text-sm text-red-600">{fieldErrors.additionalContact}</p>}
                        </div>
                        {/* Address */}
                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                            <textarea id="address" name="address" value={student.address} onChange={handleChange} readOnly={isViewMode} rows="2" className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`}></textarea>
                            {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div className={`${currentStep === 1 || isViewMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 animate-fade-in' : 'hidden'}`}>
                        {/* Student Status */}
                        <div>
                            <label htmlFor="studentStatus" className="block text-sm font-bold text-gray-700 mb-2">Student Status</label>
                            <select id="studentStatus" name="studentStatus" value={student.studentStatus} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`}>
                                <option value="Regular">Regular</option>
                                <option value="Expelled">Expelled</option>
                                <option value="Withdrawn">Withdrawn</option>
                                <option value="Graduated">Graduated</option>
                            </select>
                            {fieldErrors.studentStatus && <p className="mt-1 text-sm text-red-600">{fieldErrors.studentStatus}</p>}
                        </div>
                        {/* Reason (Conditional) */}
                        {showReasonField && (
                            <div className="sm:col-span-1">
                                <label htmlFor="reason" className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                                <textarea id="reason" name="reason" value={student.reason} onChange={handleChange} readOnly={isViewMode} rows="1" className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`}></textarea>
                                {fieldErrors.reason && <p className="mt-1 text-sm text-red-600">{fieldErrors.reason}</p>}
                            </div>
                        )}
                        {/* Class Type (DYNAMIC) */}
                        <div>
                            <label htmlFor="class" className="block text-sm font-bold text-gray-700 mb-2">Class Type</label>
                            <select id="class" name="class" value={student.class} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`}>
                                <option value="">Select Class Type</option>
                                {/* CRITICAL: academicStructure must be available here */}
                                {academicStructure?.map(type => (
                                    <option key={type.slug} value={type.slug}>{type.name}</option>
                                ))}
                            </select>
                            {fieldErrors.class && <p className="mt-1 text-sm text-red-600">{fieldErrors.class}</p>}
                        </div>

                        {/* Conditional Class/Almiya Fields (DYNAMIC) */}
                        {selectedAcademicType && ['Class', 'Almiya'].includes(student.class) && (
                            <>
                                <div>
                                    <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-1">{selectedAcademicType.name} Grade/Number<span className="text-red-500">*</span></label>
                                    <select id="classNumber" name="classNumber" value={student.classNumber} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.classNumber ? 'border-red-500' : ''}`}>
                                        <option value="">Select Class</option>
                                        {selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map((cls) => (
                                            <option key={cls.classNumber} value={cls.classNumber}>
                                                {cls.classIdentifier} ({cls.classNumber})
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.classNumber && <p className="text-red-500 text-sm mt-1">{fieldErrors.classNumber}</p>}
                                </div>
                                {student.class === 'Class' && ( // Major Subject only for 'Class' slug
                                    <div>
                                        <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700 mb-1">Major Subject<span className="text-red-500">*</span></label>
                                        <select id="majorSubject" name="majorSubject" value={student.majorSubject} onChange={handleChange} disabled={isViewMode} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2.5 transition duration-150 ease-in-out ${fieldErrors.majorSubject ? 'border-red-500' : ''}`}>
                                            <option value="">Select Subject</option>
                                            <option value="Arts">Arts</option>
                                            <option value="Science">Science</option>
                                        </select>
                                        {fieldErrors.majorSubject && <p className="text-red-500 text-sm mt-1">{fieldErrors.majorSubject}</p>}
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Conditional BS Fields (DYNAMIC) */}
                        {student.class === 'BS' && selectedAcademicType && (
                            <>
                                <div>
                                    <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                                    <select id="degreeName" name="degreeName" value={student.degreeName} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                        <option value="">Select Degree</option>
                                        {selectedAcademicType.degreeConfig?.map(degree => (
                                            <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.degreeName && <p className="mt-1 text-sm text-red-600">{fieldErrors.degreeName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                                    <input type="number" id="semester" name="semester" value={student.semester} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                                    {fieldErrors.semester && <p className="mt-1 text-sm text-red-600">{fieldErrors.semester}</p>}
                                </div>
                                {student.degreeName && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Max Semesters</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedAcademicType.degreeConfig.find(d => d.degreeName === student.degreeName)?.maxSemester || '-'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Conditional Hifaz Fields (NEW) */}
                        {student.class === 'Hifaz' && selectedAcademicType && (
                            <>
                                <div>
                                    <label htmlFor="currentJuz" className="block text-sm font-medium text-gray-700">Current Juz (Chapter)</label>
                                    <input type="number" id="currentJuz" name="currentJuz" min="0" max="30" value={student.currentJuz} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`} />
                                    {fieldErrors.currentJuz && <p className="mt-1 text-sm text-red-600">{fieldErrors.currentJuz}</p>}
                                </div>
                                <div>
                                    <label htmlFor="currentSurah" className="block text-sm font-medium text-gray-700">Current Surah/Checkpoint</label>
                                    <select id="currentSurah" name="currentSurah" value={student.currentSurah} onChange={handleChange} disabled={isViewMode} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}>
                                        <option value="">Select Surah</option>
                                        {selectedAcademicType.hifazConfig?.find(j => j.juzNumber === parseInt(student.currentJuz))?.surahs.map(surah => (
                                            <option key={surah} value={surah}>{surah}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.currentSurah && <p className="mt-1 text-sm text-red-600">{fieldErrors.currentSurah}</p>}
                                </div>
                            </>
                        )}
                        {/* Fee Per Month */}
                        <div>
                            <label htmlFor="feePerMonth" className="block text-sm font-bold text-gray-700 mb-2">Fee Per Month (PKR)</label>
                            <input type="number" id="feePerMonth" name="feePerMonth" value={student.feePerMonth} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.feePerMonth && <p className="mt-1 text-sm text-red-600">{fieldErrors.feePerMonth}</p>}
                        </div>
                        {/* Deposited Amount */}
                        <div>
                            <label htmlFor="depositedAmount" className="block text-sm font-bold text-gray-700 mb-2">Deposited Amount (PKR)</label>
                            <input type="number" id="depositedAmount" name="depositedAmount" value={student.depositedAmount} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.depositedAmount && <p className="mt-1 text-sm text-red-600">{fieldErrors.depositedAmount}</p>}
                        </div>
                        {/* Other Dues */}
                        <div>
                            <label htmlFor="otherDues" className="block text-sm font-bold text-gray-700 mb-2">Other Dues (PKR)</label>
                            <input type="number" id="otherDues" name="otherDues" value={student.otherDues} onChange={handleChange} readOnly={isViewMode} className={`mt-1 block w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition duration-200 sm:text-sm ${isViewMode ? 'bg-gray-50' : 'hover:border-gray-300'}`} />
                            {fieldErrors.otherDues && <p className="mt-1 text-sm text-red-600">{fieldErrors.otherDues}</p>}
                        </div>
                </div>

                {/* New Document Upload Fields */}
                <div className={`${currentStep === 2 || isViewMode ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 animate-fade-in' : 'hidden'}`}>
                        <h3 className="col-span-full text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-4">Required Documents</h3>

                        {/* CNIC Front & Back (Conditional) */}
                        {showCnicFields && (
                            <>
                                <FileInputWithPreview
                                    label="CNIC Front Photo"
                                    name="cnicFront"
                                    file={cnicFrontFile}
                                    url={student.cnicFrontUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setCnicFrontFile, 'cnicFrontUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setCnicFrontFile, 'cnicFrontUrl')}
                                    error={fieldErrors.cnicFrontUrl}
                                    isViewMode={isViewMode}
                                />
                                <FileInputWithPreview
                                    label="CNIC Back Photo"
                                    name="cnicBack"
                                    file={cnicBackFile}
                                    url={student.cnicBackUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setCnicBackFile, 'cnicBackUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setCnicBackFile, 'cnicBackUrl')}
                                    error={fieldErrors.cnicBackUrl}
                                    isViewMode={isViewMode}
                                />
                            </>
                        )}

                        {/* B-Form Copy (Conditional) */}
                        {showBFormField && (
                            <FileInputWithPreview
                                label="B-Form Copy"
                                name="bForm"
                                file={bFormFile}
                                url={student.bFormUrl}
                                onFileChange={(e) => handleDocumentFileChange(e, setBFormFile, 'bFormUrl')}
                                onRemoveFile={() => handleRemoveDocumentFile(setBFormFile, 'bFormUrl')}
                                error={fieldErrors.bFormUrl}
                                isViewMode={isViewMode}
                            />
                        )}

                        {/* Character Certificate */}
                        <FileInputWithPreview
                            label="Character Certificate"
                            name="characterCertificate"
                            file={characterCertificateFile}
                            url={student.characterCertificateUrl}
                            onFileChange={(e) => handleDocumentFileChange(e, setCharacterCertificateFile, 'characterCertificateUrl')}
                            onRemoveFile={() => handleRemoveDocumentFile(setCharacterCertificateFile, 'characterCertificateUrl')}
                            error={fieldErrors.characterCertificateUrl}
                            isViewMode={isViewMode}
                        />

                        {/* Previous Class Result (Conditional for Class >= 9) */}
                        {showPreviousClassResultField && (
                            <FileInputWithPreview
                                label="Previous Class Result"
                                name="previousClassResult"
                                file={previousClassResultFile}
                                url={student.previousClassResultUrl}
                                onFileChange={(e) => handleDocumentFileChange(e, setPreviousClassResultFile, 'previousClassResultUrl')}
                                onRemoveFile={() => handleRemoveDocumentFile(setPreviousClassResultFile, 'previousClassResultUrl')}
                                error={fieldErrors.previousClassResultUrl}
                                isViewMode={isViewMode}
                            />
                        )}

                        {/* Class 10 & 12 Results (Conditional for BS Students) */}
                        {showBsResultsFields && (
                            <>
                                <FileInputWithPreview
                                    label="Class 10 Result"
                                    name="class10Result"
                                    file={class10ResultFile}
                                    url={student.class10ResultUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setClass10ResultFile, 'class10ResultUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setClass10ResultFile, 'class10ResultUrl')}
                                    error={fieldErrors.class10ResultUrl}
                                    isViewMode={isViewMode}
                                />
                                <FileInputWithPreview
                                    label="Class 12 Result"
                                    name="class12Result"
                                    file={class12ResultFile}
                                    url={student.class12ResultUrl}
                                    onFileChange={(e) => handleDocumentFileChange(e, setClass12ResultFile, 'class12ResultUrl')}
                                    onRemoveFile={() => handleRemoveDocumentFile(setClass12ResultFile, 'class12ResultUrl')}
                                    error={fieldErrors.class12ResultUrl}
                                    isViewMode={isViewMode}
                                />
                            </>
                        )}
                </div>

                {/* Review step content */}
                {!isViewMode && (
                    <div className={`${currentStep === 3 ? 'grid grid-cols-1 gap-4 md:gap-6 border-t pt-6 mt-4 border-gray-200 animate-fade-in' : 'hidden'}`}>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-4">Review Your Details</h3>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 grid sm:grid-cols-2 gap-4 shadow-sm">
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Name:</span> <span className="font-semibold text-gray-900">{student.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Father Name:</span> <span className="font-semibold text-gray-900">{student.fatherName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">CNIC:</span> <span className="font-semibold text-gray-900">{student.cnic}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Gender:</span> <span className="font-semibold text-gray-900">{student.gender}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Guardian Contact:</span> <span className="font-semibold text-gray-900">{student.guardianContact}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Address:</span> <span className="font-semibold text-gray-900">{student.address}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Class Type:</span> <span className="font-semibold text-green-700">{student.class}</span></div>
                            {student.class === 'Class' && <div className="flex justify-between"><span className="text-gray-600 font-medium">Class Number:</span> <span className="font-semibold text-gray-900">{student.classNumber}</span></div>}
                            {student.class === 'BS' && <div className="flex justify-between"><span className="text-gray-600 font-medium">Degree/Semester:</span> <span className="font-semibold text-gray-900">{student.degreeName} · {student.semester}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-600 font-medium">Fee/Month:</span> <span className="font-semibold text-green-700">PKR {student.feePerMonth}</span></div>
                        </div>
                        <p className="text-gray-600 text-sm italic">Please verify all information above before submitting.</p>
                    </div>
                )}
            </form>

            {/* Footer Section (fixed at bottom) */}
            <div className="mt-auto pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0 bg-gradient-to-r from-white via-gray-50 to-white px-4 -mx-4 -mb-4 rounded-b-2xl py-4">
                {isViewMode ? (
                    <>
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center px-8 py-2 rounded-lg bg-gradient-to-r from-green-800 to-green-600 text-white font-semibold hover:shadow-lg transition duration-300 shadow-md active:scale-95"
                            title="Download Student Details as PDF"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Download PDF
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition duration-300 shadow-sm hover:shadow-md active:scale-95"
                        >
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex gap-3 items-center">
                            {currentStep > 0 && (
                                <button type="button" onClick={goPrev} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition duration-300 shadow-sm hover:shadow-md active:scale-95">
                                    Back
                                </button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <button type="button" onClick={goNext} className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition duration-300 shadow-md active:scale-95">
                                    Next
                                </button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <button type="submit" onClick={handleSubmit} className="px-8 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold hover:shadow-xl transition duration-300 shadow-md active:scale-95">
                                    {editingStudent ? 'Update Student' : 'Add Student'}
                                </button>
                            )}
                        </div>
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition duration-300 shadow-sm hover:shadow-md active:scale-95">
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentForm;