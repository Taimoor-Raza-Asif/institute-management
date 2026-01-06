import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import api from '../api';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Loader from "../components/Loader";
import Message from "../components/Message";
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import { useTheme } from '../context/ThemeContext';
import { UserContext } from '../App';

const AssignClasses = () => {
    const { currentUser } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const [academicStructure, setAcademicStructure] = useState(null);
    const [structureLoading, setStructureLoading] = useState(true);

    const [staffList, setStaffList] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [assignmentsForSelectedTeacher, setAssignmentsForSelectedTeacher] = useState([]);
    const [newAssignments, setNewAssignments] = useState([]); // Array to track assignments added/modified during the session

    const [searchTermTeachers, setSearchTermTeachers] = useState("");
    const [filteredStaffList, setFilteredStaffList] = useState([]);

    const [currentAssignment, setCurrentAssignment] = useState({
        type: "", 
        classNumber: "",
        classIdentifier: "", 
        degreeName: "",
        semester: "",
        subjects: [""] // Always initialize with one empty subject input
    });
    const [formErrors, setFormErrors] = useState({});
    const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
    const [filterType, setFilterType] = useState("All");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmHandler, setConfirmHandler] = useState(null);

    const askConfirm = (message, handler) => {
        setConfirmMessage(message);
        setConfirmHandler(() => handler);
        setConfirmOpen(true);
    };

    const onConfirm = async () => {
        try {
            if (typeof confirmHandler === 'function') {
                await confirmHandler();
            }
        } finally {
            setConfirmOpen(false);
            setConfirmMessage('');
            setConfirmHandler(null);
        }
    };

    // Helper to get configuration for a slug
    const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
    const formatTypeName = (name = '') => name.replace(' (1-8)', '');
    const selectedAcademicType = getAcademicConfig(currentAssignment.type);
    const isClassOrAlmiya = ['Class', 'Almiya'].includes(currentAssignment.type);

    // --- Dynamic Subject Suggestions ---
    const getAvailableSubjects = useMemo(() => {
        let suggestedSubjects = [];
        const currentSubjects = currentAssignment.subjects.filter(s => s.trim()).map(s => s.toLowerCase());

        if (isClassOrAlmiya && currentAssignment.classNumber) {
            const classConfig = selectedAcademicType?.classConfig?.find(c => String(c.classNumber) === String(currentAssignment.classNumber));
            suggestedSubjects = classConfig?.subjects || [];
        } else if (currentAssignment.type === 'BS' && currentAssignment.degreeName && currentAssignment.semester) {
            const degreeConfig = selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName);
            // Handle both Map (frontend) and plain object (from database) formats
            const semesterKey = String(currentAssignment.semester);
            if (degreeConfig?.subjectsBySemester) {
                suggestedSubjects = degreeConfig.subjectsBySemester instanceof Map 
                    ? (degreeConfig.subjectsBySemester.get(semesterKey) || [])
                    : (degreeConfig.subjectsBySemester[semesterKey] || []);
            }
        } else if (currentAssignment.type === 'Hifaz') {
             suggestedSubjects = ['Hifaz/Quran Memorization'];
        }

        // Filter out subjects already added to the current assignment list
        return suggestedSubjects.filter(sub => !currentSubjects.includes(sub.toLowerCase()));
    }, [currentAssignment, selectedAcademicType]);

    // --- Data Fetching ---

    const fetchAcademicStructure = useCallback(async () => {
        try {
            const { data } = await api.get('/academic-structure');
            setAcademicStructure(data.classTypes);
            if (data.classTypes && data.classTypes.length > 0) {
                const defaultType = data.classTypes.find(t => t.slug)?.slug || data.classTypes[0].slug;
                setCurrentAssignment(prev => prev.type ? prev : { ...prev, type: defaultType });
            }
        } catch (err) {
            setError('Failed to load academic structure.');
        } finally {
            setStructureLoading(false);
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await api.get('/staff?staffType=Teacher');
            const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
            setStaffList(teachers);
            setFilteredStaffList(teachers);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch teacher list.');
        }
    }, []);

    const fetchAssignedTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/staff?staffType=Teacher");
            const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
            const teachersWithAssignments = teachers.filter(teacher => teacher.assignClasses && teacher.assignClasses.length > 0);
            setAllTeachers(teachersWithAssignments);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch assigned classes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcademicStructure();
    }, [fetchAcademicStructure]);
    
    useEffect(() => {
        if (!structureLoading) {
            fetchTeachers();
            fetchAssignedTeachers();
        }
    }, [structureLoading, fetchTeachers, fetchAssignedTeachers]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTermTeachers.toLowerCase();
        const filtered = staffList.filter(teacher =>
            teacher.name.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredStaffList(filtered);
    }, [searchTermTeachers, staffList]);

    // --- Assignment Handlers ---

    const handleAssignmentInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAssignment(prev => {
            const newState = { ...prev, [name]: value };

            if (name === 'type') {
                newState.classNumber = "";
                newState.classIdentifier = "";
                newState.degreeName = "";
                newState.semester = "";
                newState.subjects = [""];
            } else if (name === 'classNumber') {
                const config = getAcademicConfig(newState.type);
                const classObj = config?.classConfig?.find(c => String(c.classNumber) === String(value));
                newState.classIdentifier = classObj?.classIdentifier || "";
                newState.subjects = classObj?.subjects.length > 0 ? classObj.subjects : [""];
            } else if (name === 'degreeName') {
                newState.semester = "";
                newState.subjects = [""];
            } else if (name === 'semester' && newState.type === 'BS' && newState.degreeName) {
                // Auto-populate subjects when semester is selected for BS degrees
                const config = getAcademicConfig('BS');
                const degreeConfig = config?.degreeConfig?.find(d => d.degreeName === newState.degreeName);
                if (degreeConfig?.subjectsBySemester) {
                    const semesterKey = String(value);
                    const semesterSubjects = degreeConfig.subjectsBySemester instanceof Map 
                        ? (degreeConfig.subjectsBySemester.get(semesterKey) || [])
                        : (degreeConfig.subjectsBySemester[semesterKey] || []);
                    newState.subjects = semesterSubjects.length > 0 ? [...semesterSubjects] : [""];
                } else {
                    newState.subjects = [""];
                }
            }

            return newState;
        });
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubjectChange = (value, index) => {
        const updatedSubjects = currentAssignment.subjects.map((s, i) => i === index ? value : s);
        setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
        setFormErrors(prev => ({ ...prev, subjects: "" }));
    };

    const handleRemoveSubject = (index) => {
        const updatedSubjects = currentAssignment.subjects.filter((_, i) => i !== index);
        setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
    };

    const validateAssignmentForm = (currentAssignmentsList, currentItemIndex = null) => {
        let errors = {};
        let isValid = true;
        
        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };

        // --- Core Validation ---
        if (!assignment.type) { errors.type = "Type is required."; isValid = false; }
        if (assignment.subjects.length === 0) { errors.subjects = "At least one subject is required."; isValid = false; }

        // --- Type-Specific Validation ---
        const isClassOrAlmiya = ['Class', 'Almiya'].includes(assignment.type);
        
        if (isClassOrAlmiya) {
            if (!assignment.classNumber) {
                errors.classNumber = "Class/Grade is required.";
                isValid = false;
            } else {
                // Check for duplicate classNumber regardless of 'Class' or 'Almiya' slug
                const isDuplicate = currentAssignmentsList.some((a, i) =>
                    i !== currentItemIndex && ['Class', 'Almiya'].includes(a.type) && String(a.classNumber) === String(assignment.classNumber)
                );
                if (isDuplicate) {
                    errors.classNumber = `This class/grade is already assigned to this teacher.`;
                    isValid = false;
                }
            }
        } else if (assignment.type === "BS") {
            if (!assignment.degreeName.trim()) {
                errors.degreeName = "Degree name is required.";
                isValid = false;
            }
            if (!assignment.semester || assignment.semester <= 0) {
                errors.semester = "Semester must be a positive number.";
                isValid = false;
            } else {
                const isDuplicate = currentAssignmentsList.some((a, i) =>
                    i !== currentItemIndex && a.type === "BS" && a.degreeName === assignment.degreeName && String(a.semester) === String(assignment.semester)
                );
                if (isDuplicate) {
                    errors.degreeName = "This BS degree and semester is already assigned to this teacher.";
                    isValid = false;
                }
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleAddAssignmentToList = (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);

        const currentAssignmentsList = [...assignmentsForSelectedTeacher, ...newAssignments];

        if (!validateAssignmentForm(currentAssignmentsList)) {
            return;
        }
        
        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };

        setNewAssignments(prev => [...prev, assignment]);
        resetCurrentAssignmentForm();
    };

    const handleUpdateAssignment = (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);

        const combinedList = [...assignmentsForSelectedTeacher, ...newAssignments];
        if (!validateAssignmentForm(combinedList, editingAssignmentIndex)) {
            return;
        }

        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };
        
        if (editingAssignmentIndex < assignmentsForSelectedTeacher.length) {
            // Editing an existing assignment
            setAssignmentsForSelectedTeacher(prev => prev.map((a, i) => i === editingAssignmentIndex ? assignment : a));
        } else {
            // Editing a newly added assignment (FIXED logic needed here if newAssignments were modified)
            const newIndex = editingAssignmentIndex - assignmentsForSelectedTeacher.length;
            setNewAssignments(prev => prev.map((a, i) => i === newIndex ? assignment : a));
        }

        resetCurrentAssignmentForm();
    }

    const resetCurrentAssignmentForm = () => {
        const defaultType = academicStructure?.find(t => t.slug)?.slug || 'Class';
        setCurrentAssignment({
            type: defaultType,
            classNumber: "",
            classIdentifier: "",
            degreeName: "",
            semester: "",
            subjects: [""]
        });
        setEditingAssignmentIndex(null);
        setFormErrors({});
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSuccessMessage("");
        setError(null);

        if (!selectedStaff) {
            setError("Please select a teacher.");
            return;
        }
        
        const finalAssignments = [...assignmentsForSelectedTeacher, ...newAssignments];
        
        if (finalAssignments.length === 0) {
            setError("Please add at least one assignment to the list.");
            return;
        }

        // The issue where it re-validates and fails on submit is often solved by performing the
        // validation *just before* sending the API request, and ensuring the final payload is clean.
        // We've moved the validation checks inside handleAdd/Update. The final check here is clean.

        try {
            // CRITICAL FIX: The final list is clean. We submit this list.
            await api.put(`/staff/${selectedStaff}/assign-classes`, { assignClasses: finalAssignments });
            toast.success("Assignments updated successfully!");
            resetMainForm();
            fetchAssignedTeachers();
        } catch (err) {
            console.error(err);
            // This error is likely the backend error due to unrecognised Almiya/Hifaz type.
            setError(err.response?.data?.message || "Failed to save assignments.");
        }
    };

    const resetMainForm = () => {
        setSelectedStaff("");
        setAssignmentsForSelectedTeacher([]);
        setNewAssignments([]);
        resetCurrentAssignmentForm();
        setShowAssignmentForm(false);
    };

    const handleEditTableAssignment = (teacherId, assignmentIndex) => {
        setSuccessMessage("");
        setError(null);
        const teacher = allTeachers.find(t => t._id === teacherId);
        if (!teacher) return;
        
        setSelectedStaff(teacherId);
        const assignments = teacher.assignClasses || [];
        setAssignmentsForSelectedTeacher(assignments);
        setNewAssignments([]); // Clear new assignments list when editing an existing assignment
        
        const assignmentToEdit = assignments[assignmentIndex];
        setCurrentAssignment({
            ...assignmentToEdit,
            subjects: assignmentToEdit.subjects.length > 0 ? assignmentToEdit.subjects : [""]
        });
        setEditingAssignmentIndex(assignmentIndex); // Index of the item in assignmentsForSelectedTeacher
        
        setShowAssignmentForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleDeleteTableAssignment = async (teacherId, assignmentIndex) => {
        askConfirm(
            'Delete this assignment?',
            async () => {
                try {
                    const teacher = allTeachers.find(t => t._id === teacherId);
                    if (!teacher) throw new Error('Teacher not found.');
                    const updatedAssignments = teacher.assignClasses.filter((_, i) => i !== assignmentIndex);
                    await api.put(`/staff/${teacherId}/assign-classes`, { assignClasses: updatedAssignments });
                    toast.success('Assignment deleted successfully!');
                    fetchAssignedTeachers();
                } catch (err) {
                    console.error(err);
                    setError(err.response?.data?.message || 'Failed to delete assignment.');
                }
            }
        );
    };

    // --- Memoized Data ---
    const filteredTeachersAndAssignments = useMemo(() => {
        const allAssignments = allTeachers.flatMap(teacher =>
            (teacher.assignClasses || []).map((assignment, index) => ({
                ...assignment,
                teacherName: teacher.name,
                teacherId: teacher._id,
                assignmentIndex: index
            }))
        );

        return allAssignments.filter(item => {
            const typeMatch = filterType === "All" || item.type === filterType;
            const nameMatch = item.teacherName.toLowerCase().includes(searchTermTeachers.toLowerCase());
            return typeMatch && nameMatch;
        });
    }, [allTeachers, searchTermTeachers, filterType]);

    // Helper to render assignment details
    const renderAssignmentDetails = (assignment) => {
        switch (assignment.type) {
            case 'Class':
                const classConfig = getAcademicConfig('Class');
                const clsObj = classConfig?.classConfig?.find(c => String(c.classNumber) === String(assignment.classNumber));
                return clsObj ? `${clsObj.classIdentifier}` : `Class ${assignment.classNumber}`;
            case 'Almiya':
                // Attempt to find the identifier from the structure
                const almiyaConfig = getAcademicConfig('Almiya');
                const classObj = almiyaConfig?.classConfig?.find(c => String(c.classNumber) === String(assignment.classNumber));
                return classObj ? `${classObj.classIdentifier} (Grade ${assignment.classNumber})` : `Almiya Grade ${assignment.classNumber}`;
            case 'BS':
                return `${assignment.degreeName} (Sem ${assignment.semester})`;
            case 'Hifaz':
                return `Hifaz-ul-Quran (Full Course)`;
            default:
                return 'N/A';
        }
    };
    
    // --- Render Logic ---

    if (structureLoading || loading) return <Loader />;
    if (error) return <Message type="error" text={error} />;
    
    const semesterOptions = selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0;
    

    return (
        <div className={`container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen ${currentTheme?.mainBg || 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-50 to-teal-100'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 text-left">
                    <h1 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Assign Classes to Teachers</h1>
                    <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm`}>Find, create, and manage teaching assignments</p>
                </div>
            </div>
            {successMessage && <Message type="success" text={successMessage} />}
            {error && <Message type="error" text={error} />}

            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-xl'} rounded-xl p-6 mb-8`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <div className="relative w-full sm:w-1/2 lg:w-2/3">
                        <input
                            type="text"
                            placeholder="Search existing assignments by teacher name..."
                            value={searchTermTeachers}
                            onChange={(e) => setSearchTermTeachers(e.target.value)}
                            className={`w-full h-12 pl-10 pr-4 rounded-lg border ${currentTheme?.inputBorder || 'border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none`}
                        />
                        <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${currentTheme?.iconText || 'text-gray-400'}`} />
                    </div>
                    <div className="w-full sm:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`block w-full h-12 px-4 rounded-lg border ${currentTheme?.inputBorder || 'border-gray-300'} ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-700'} focus:outline-none`}
                        >
                            <option value="All">All Types</option>
                            {academicStructure?.map(type => (
                                <option key={type.slug} value={type.slug}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                            className={`flex items-center justify-center h-12 px-6 rounded-lg font-medium transition-all duration-200 ${currentTheme?.btnPrimaryBg || 'bg-gradient-to-r from-green-600 to-green-700'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:from-green-700 hover:to-green-800'} ${currentTheme?.shadow || 'shadow-md'} w-full sm:w-auto`}
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            {showAssignmentForm ? 'Hide' : 'Assign'}
                        </button>
                    </div>
                </div>
            </div>

            {showAssignmentForm && (
                <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl shadow-2xl p-8 mb-8 ${currentTheme?.border || 'border border-green-500'}`}>
                    <h3 className={`text-2xl font-bold ${currentTheme?.text || 'text-white'} mb-6 text-center`}>Assignment Form</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`${currentTheme?.panelBg || 'bg-green-50'} rounded-lg p-6 ${currentTheme?.border || 'border border-green-200'} shadow-inner`}>
                            <h4 className="text-lg font-semibold text-green-800 mb-4 border-b border-green-300 pb-2">Teacher Selection</h4>
                            <div>
                                <label htmlFor="teacher" className={`block text-sm font-medium ${currentTheme?.mutedText || 'text-gray-700'} mb-1`}>Select Teacher</label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${currentTheme?.mutedText || 'text-gray-400'} pointer-events-none`} />
                                    <input
                                        type="text"
                                        id="teacher"
                                        placeholder="Search and select a teacher..."
                                        value={staffList.find(s => s._id === selectedStaff)?.name || searchTermTeachers}
                                        onChange={(e) => {
                                            setSearchTermTeachers(e.target.value);
                                            // Clear selection if user is typing a new search
                                            if (selectedStaff) {
                                                const currentTeacher = staffList.find(s => s._id === selectedStaff);
                                                if (currentTeacher && e.target.value !== currentTeacher.name) {
                                                    setSelectedStaff("");
                                                    setAssignmentsForSelectedTeacher([]);
                                                    setNewAssignments([]);
                                                }
                                            }
                                            // Auto-select if exact match found
                                            const match = staffList.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                                            if (match) {
                                                setSelectedStaff(match._id);
                                                setAssignmentsForSelectedTeacher(allTeachers.find(t => t._id === match._id)?.assignClasses || []);
                                                setNewAssignments([]);
                                                resetCurrentAssignmentForm();
                                            }
                                        }}
                                        list="teacher-list"
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none transition ${currentTheme?.inputBg || "border-gray-200 bg-gray-50"} ${currentTheme?.inputText || "text-gray-800"} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                        required
                                    />
                                    <datalist id="teacher-list">
                                        {filteredStaffList.map((staff) => (
                                            <option key={staff._id} value={staff.name} />
                                        ))}
                                    </datalist>
                                </div>
                                {selectedStaff && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Teacher selected: {staffList.find(s => s._id === selectedStaff)?.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-lg p-6 ${currentTheme?.border || 'border border-gray-100'} ${currentTheme?.shadow || 'shadow-md'}`}>
                            <h4 className={`text-xl font-semibold ${currentTheme?.title || 'text-gray-800'} mb-4`}>{editingAssignmentIndex !== null ? "Edit Assignment" : "Add New Assignment"}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                    <label htmlFor="assignType" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>Academic Track</label>
                                    <select
                                        id="assignType"
                                        name="type"
                                        value={currentAssignment.type}
                                        onChange={handleAssignmentInputChange}
                                        className={`mt-1 block w-full px-4 py-2 rounded-lg border focus:outline-none transition ${currentTheme?.inputBg || 'border-gray-200 bg-gray-50'} ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                        required
                                        disabled={editingAssignmentIndex !== null}
                                    >
                                        <option value="" disabled>Select Track</option>
                                        {academicStructure?.map(type => (
                                            <option key={type.slug} value={type.slug}>{formatTypeName(type.name)}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {isClassOrAlmiya && selectedAcademicType && (
                                    <div>
                                        <label htmlFor="classNumber" className={`block text-sm font-medium ${currentTheme?.title || 'text-gray-700'}`}>{selectedAcademicType.name} Class/Grade</label>
                                        <select
                                            id="classNumber"
                                            name="classNumber"
                                            value={currentAssignment.classNumber}
                                            onChange={handleAssignmentInputChange}
                                            className={`mt-1 block w-full px-4 py-2 rounded-lg border focus:outline-none transition ${formErrors.classNumber ? 'border-red-500' : (currentTheme?.inputBg ? currentTheme?.inputBg.split(' ')[0] : 'border-gray-200')} ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            {selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map(cls => (
                                                <option key={cls.classNumber} value={cls.classNumber}>
                                                    {cls.classIdentifier}
                                                </option>
                                            ))}
                                            </select>
                                        {formErrors.classNumber && <p className="mt-1 text-sm text-red-600">{formErrors.classNumber}</p>}
                                    </div>
                                )}
                                {currentAssignment.type === "BS" && selectedAcademicType && (
                                    <>
                                        <div>
                                            <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                                            <select
                                                id="degreeName"
                                                name="degreeName"
                                                value={currentAssignment.degreeName}
                                                onChange={handleAssignmentInputChange}
                                                className={`mt-1 block w-full px-4 py-2 rounded-lg border focus:outline-none transition ${formErrors.degreeName ? 'border-red-500' : (currentTheme?.inputBg ? currentTheme?.inputBg.split(' ')[0] : 'border-gray-200')} ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                                required
                                            >
                                                <option value="">Select Degree</option>
                                                {selectedAcademicType.degreeConfig?.map(degree => (
                                                    <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                                                ))}
                                            </select>
                                            {formErrors.degreeName && <p className="mt-1 text-sm text-red-600">{formErrors.degreeName}</p>}
                                        </div>
                                        {currentAssignment.degreeName && (
                                            <div>
                                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                                                <select
                                                    id="semester"
                                                    name="semester"
                                                    type="number"
                                                    value={currentAssignment.semester}
                                                    onChange={handleAssignmentInputChange}
                                                    className={`mt-1 block w-full px-4 py-2 rounded-lg border focus:outline-none transition ${formErrors.semester ? 'border-red-500' : (currentTheme?.inputBg ? currentTheme?.inputBg.split(' ')[0] : 'border-gray-200')} ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                                    required
                                                >
                                                    <option value="">Select Semester</option>
                                                    {Array.from({ length: selectedAcademicType.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
                                                        <option key={sem} value={sem}>{sem}</option>
                                                    ))}
                                                </select>
                                                {formErrors.semester && <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>}
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {currentAssignment.type === "Hifaz" && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Hifaz Course</label>
                                        <p className={`mt-1 block w-full px-4 py-2 ${currentTheme?.inputText || 'text-gray-800'} rounded-lg border ${currentTheme?.border || 'border border-gray-100'} ${currentTheme?.inputBg || 'bg-gray-50'}`}>
                                            Assigned to teach the complete Hifaz course (30 Juz).
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    *List subjects the teacher will teach for this specific class/semester. Suggestions pulled from Academic Structure.
                                </p>
                                <div className="space-y-2">
                                    {currentAssignment.subjects.map((subject, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => handleSubjectChange(e.target.value, index)}
                                                className={`block w-full px-4 py-2 rounded-lg border focus:outline-none transition ${formErrors.subjects ? 'border-red-500' : (currentTheme?.inputBg ? currentTheme?.inputBg.split(' ')[0] : 'border-gray-200')} ${currentTheme?.inputText || 'text-gray-800'} ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'}`}
                                                placeholder={`Subject ${index + 1}`}
                                                list={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}-${currentAssignment.semester}`}
                                            />
                                            {/* Data List for Subject Suggestions (FIXED) */}
                                            <datalist id={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}-${currentAssignment.semester}`}>
                                                {getAvailableSubjects.map(sub => (
                                                    <option key={sub} value={sub} />
                                                ))}
                                            </datalist>
                                            
                                            {currentAssignment.subjects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubject(index)}
                                                    className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        ))}
                                    </div>
                                {/* <button
                                    type="button"
                                    onClick={() => setCurrentAssignment(prev => ({ ...prev, subjects: [...prev.subjects, ""] }))}
                                    className={`mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${currentTheme?.inputText || 'text-gray-700'} border-dashed ${currentTheme?.border || 'border border-gray-100'} hover:opacity-90 transition-colors`}
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" /> Add Subject
                                </button> */}
                                {formErrors.subjects && <p className="mt-1 text-sm text-red-600">{formErrors.subjects}</p>}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                {editingAssignmentIndex !== null ? (
                                    <button
                                        type="button"
                                        onClick={handleUpdateAssignment}
                                        className={`px-6 py-3 ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} font-semibold rounded-lg ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} transition duration-200 shadow-md`}
                                    >
                                        Update Assignment
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddAssignmentToList}
                                        className={`px-6 py-3 ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} font-semibold rounded-lg ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} transition duration-200 shadow-md`}
                                    >
                                        Add to List
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={resetCurrentAssignmentForm}
                                    className={`ml-4 px-6 py-3 rounded-lg font-semibold ${currentTheme?.btnSecondaryBg || 'bg-transparent'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} border ${currentTheme?.border || 'border border-gray-100'} hover:opacity-95 transition duration-200`}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        
                        {(assignmentsForSelectedTeacher.length > 0 || newAssignments.length > 0) && (
                            <div className={`${currentTheme?.cardBg || 'bg-white'} rounded-xl shadow-lg p-6 ${currentTheme?.border || 'border border-gray-300'}`}>
                                <h4 className={`text-xl font-semibold ${currentTheme?.title || 'text-gray-800'} mb-4`}>Assignments to be Saved ({assignmentsForSelectedTeacher.length + newAssignments.length})</h4>
                                <ul className={`divide-y divide-gray-200 rounded-md ${currentTheme?.border ? '' : 'border'} ${currentTheme?.border || 'border border-gray-100'}`}>
                                    {[...assignmentsForSelectedTeacher, ...newAssignments].map((assignment, index) => (
                                        <li key={`${assignment.type}-${assignment.classNumber || assignment.degreeName}-${index}`} className={`p-4 flex justify-between items-center ${currentTheme?.tbodyBg || 'bg-white'}`}>
                                            <div>
                                                <p className={`text-sm font-medium ${currentTheme?.title || 'text-gray-800'}`}>
                                                    {renderAssignmentDetails(assignment)}
                                                </p>
                                                <p className={`${currentTheme?.mutedText || 'text-gray-500'} text-xs`}>Subjects: {assignment.subjects.join(", ")}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditTableAssignment(selectedStaff, index)} // Re-use table edit logic
                                                    className="text-yellow-600 hover:text-yellow-800 p-1"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTableAssignment(selectedStaff, index)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className={`px-6 py-3 ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} font-semibold rounded-lg ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} transition duration-200 shadow-md flex items-center`}
                                    >
                                        <AcademicCapIcon className="h-5 w-5 mr-2" /> Save All Assignments
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            )}

            <div className="mt-8">
                <h2 className={`text-2xl font-bold ${currentTheme?.title || 'text-gray-800'} mb-4 px-1`}>Existing Assigned Classes</h2>
                
                {loading ? (
                    <Loader />
                ) : filteredTeachersAndAssignments.length === 0 ? (
                    <Message type="info" text="No assignments found matching the criteria." />
                ) : (
                    <>
                    <div className={`rounded-xl ${currentTheme?.shadow || 'shadow-lg'} overflow-hidden ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.border || 'border border-gray-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={`${currentTheme?.theadBg || 'bg-emerald-600'} ${currentTheme?.theadText || 'text-white'}`}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Class/Degree</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Subjects</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`${currentTheme?.tbodyBg || 'bg-white'} divide-y divide-gray-100`}>
                                {filteredTeachersAndAssignments.map((assignment, index) => (
                                    <tr key={`${assignment.teacherId}-${assignment.assignmentIndex}`} className={`transition-all duration-150 ${currentTheme?.tableHover || 'hover:bg-green-50'} hover:shadow-md ${index % 2 === 0 ? currentTheme?.tbodyBg || 'bg-white' : currentTheme?.tableStripedBg || 'bg-gray-50'}`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme?.title || 'text-gray-800'}`}>
                                            {assignment.teacherName}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-700'}`}>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.type === 'Class' ? (currentTheme?.badgeSuccessBg || 'bg-green-100') + ' ' + (currentTheme?.badgeSuccessText || 'text-green-800') : assignment.type === 'BS' ? (currentTheme?.badgeSuccessBg || 'bg-green-100') + ' ' + (currentTheme?.badgeSuccessText || 'text-green-800') : assignment.type === 'Almiya' ? (currentTheme?.badgeWarningBg || 'bg-yellow-100') + ' ' + (currentTheme?.badgeWarningText || 'text-yellow-800') : (currentTheme?.badgeSuccessBg || 'bg-green-100') + ' ' + (currentTheme?.badgeSuccessText || 'text-green-800')}`}>
                                                {assignment.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-700'}`}>
                                            {renderAssignmentDetails(assignment)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme?.text || 'text-gray-700'}`}>
                                            {assignment.subjects.join(", ")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleEditTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
                                                className={`p-2 ${currentTheme?.iconText || 'text-green-600'} hover:opacity-75 rounded-lg transition-opacity duration-200 mr-2`}
                                                title="Edit Assignment"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
                                                className="p-2 text-red-600 hover:opacity-75 rounded-lg transition-opacity duration-200"
                                                title="Delete Assignment"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                    <ConfirmationModal
                        isOpen={confirmOpen}
                        onClose={() => { setConfirmOpen(false); setConfirmMessage(''); setConfirmHandler(null); }}
                        onConfirm={onConfirm}
                        message={confirmMessage || 'Are you sure?'}
                    />
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignClasses;