import React, { useState, useEffect, useCallback, useContext, useRef, memo } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';
import {
    AcademicCapIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon,
    ArrowPathIcon, BookmarkSquareIcon, BookOpenIcon, UsersIcon, SparklesIcon, MinusCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// --- Uncontrolled Input Component to prevent focus loss ---
// Uses local state and only commits to parent on blur
const UncontrolledInput = memo(({ initialValue, onCommit, className, type = 'text', placeholder, min }) => {
    const [localValue, setLocalValue] = useState(initialValue);
    const inputRef = useRef(null);

    // Sync localValue when initialValue changes from parent (e.g., new item added)
    useEffect(() => {
        setLocalValue(initialValue);
    }, [initialValue]);

    const handleBlur = () => {
        if (localValue !== initialValue) {
            onCommit(localValue);
        }
    };

    return (
        <input
            ref={inputRef}
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
            min={min}
        />
    );
});

const initialNewType = {
    name: '',
    slug: '',
    classConfig: [],
    degreeConfig: [],
    hifazConfig: [],
    defaultDocumentsRequired: []
};

// --- Default Data Factory ---
const getDefaultStructure = () => {
    // Generate 30 Juz for Hifaz (simplified Surah list for initialization)
    const hifazJuzConfig = Array.from({ length: 30 }, (_, i) => ({
        juzNumber: i + 1,
        surahs: [
            i === 0 ? "Al-Fatiha & Al-Baqarah (Part)" : `Juz ${i + 1} Checkpoint 1`,
            `Juz ${i + 1} Checkpoint 2`
        ]
    }));

    return [
        {
            name: 'Regular Class',
            slug: 'Class',
            classConfig: Array.from({ length: 8 }, (_, i) => ({
                classIdentifier: `${i + 1}th Grade`,
                classNumber: i + 1,
                subjects: i < 5 ? ['Urdu', 'Math', 'Science', 'English'] : ['Physics', 'Chemistry', 'Math', 'Urdu']
            })),
            defaultDocumentsRequired: ["B-Form"],
        },
        {
            name: 'BS / Honors / Degree',
            slug: 'BS',
            degreeConfig: [
                {
                    degreeName: 'Software Engineering',
                    years: 4,
                    maxSemester: 8,
                    // Note: Must use Map for reactivity when manipulating in the UI state
                    subjectsBySemester: new Map(Object.entries({
                        '1': ['Calculus I', 'Programming Fundamentals', 'English'],
                        '2': ['Calculus II', 'OOP', 'Data Structures']
                    }))
                },
                {
                    degreeName: 'Islamic Studies',
                    years: 4,
                    maxSemester: 8,
                    subjectsBySemester: new Map(Object.entries({
                        '1': ['Arabic Grammar', 'Fiqh Awal'],
                        '2': ['Hadith Studies', 'Tafseer Awal']
                    }))
                }
            ],
            defaultDocumentsRequired: ["Class 10 Result", "Class 12 Result"],
        },
        {
            name: 'Almiya (9-16)',
            slug: 'Almiya',
            classConfig: [
                { classIdentifier: 'Ama Awal', classNumber: 9, subjects: ['Arabic', 'Tajweed', 'Fiqh'] },
                { classIdentifier: 'Ama Doom', classNumber: 10, subjects: ['Sarf', 'Nahu', 'Usul'] },
                { classIdentifier: 'Khasa Awal', classNumber: 11, subjects: ['Hadith', 'Tafseer', 'Balaghat'] },
                { classIdentifier: 'Khasa Dom', classNumber: 12, subjects: ['Mantiq', 'Falsafa', 'Kalam'] },
                { classIdentifier: 'Almiya Awal', classNumber: 13, subjects: ['Adab', 'Qira\'at'] },
                { classIdentifier: 'Almiya Dom', classNumber: 14, subjects: ['Falsafa', 'Kalam'] },
                { classIdentifier: 'Alma Awal', classNumber: 15, subjects: ['Tafseer ul Quran', 'Hadith Nabvi'] },
                { classIdentifier: 'Alma Dom', classNumber: 16, subjects: ['Final Thesis', 'Islamic History'] },
            ],
            defaultDocumentsRequired: ["Previous Class Result"],
        },
        {
            name: 'Hifaz-ul-Quran',
            slug: 'Hifaz',
            hifazConfig: hifazJuzConfig,
            defaultDocumentsRequired: [],
        },
    ];
};
// --- End Default Data Factory ---

const AcademicStructurePanel = () => {
    const { currentUser: user } = useContext(UserContext);
    const { currentTheme } = useTheme();
    const [structure, setStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('');
    const [isAddingNewType, setIsAddingNewType] = useState(false);
    const [newType, setNewType] = useState(initialNewType);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmHandler, setConfirmHandler] = useState(null);

    // Dialog state lifted to top-level so it survives re-renders of child editors
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('success');
    const [dialogMessage, setDialogMessage] = useState('');
    const showDialog = (type, message) => {
        setDialogType(type);
        setDialogMessage(message);
        setDialogOpen(true);
    };

    const askConfirm = (message, handler) => {
        setConfirmMessage(message);
        setConfirmHandler(() => handler);
        setConfirmOpen(true);
    };

    const onConfirm = async () => {
        try {
            if (confirmHandler) {
                await confirmHandler();
            }
        } finally {
            setConfirmOpen(false);
            setConfirmMessage('');
            setConfirmHandler(null);
        }
    };

    // Helper to process data from backend to ensure Maps are correctly instantiated
    const processStructureData = (data) => {
        if (!data || !data.classTypes) return data;
        
        return {
            ...data,
            classTypes: data.classTypes.map(type => {
                if (type.slug === 'BS' && type.degreeConfig) {
                    return {
                        ...type,
                        degreeConfig: type.degreeConfig.map(degree => ({
                            ...degree,
                            // Convert plain object to Map instance for reactivity
                            subjectsBySemester: new Map(Object.entries(degree.subjectsBySemester || {}))
                        }))
                    };
                }
                return type;
            })
        };
    };

    const fetchStructure = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/academic-structure');
            
            // Handle case where backend returns null/undefined or no classTypes
            const safeData = data || { classTypes: [] };
            if (!safeData.classTypes) {
                safeData.classTypes = [];
            }
            
            const processedData = processStructureData(safeData);
            setStructure(processedData);
            
            if (processedData.classTypes.length > 0) {
                setActiveTab(processedData.classTypes[0].slug);
            }
        } catch (err) {
            console.error('Error fetching academic structure:', err);
            setError(err.response?.data?.message || 'Failed to fetch academic structure.');
            // Set empty structure so user can initialize
            setStructure({ classTypes: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchStructure();
        } else {
            setError('You are not authorized to access the Academic Structure Panel.');
            setLoading(false);
        }
    }, [user, fetchStructure]);

    // MODIFIED: handleSaveStructure now accepts an optional payload to bypass async state update
    const handleSaveStructure = async (initialPayload = null) => { 
        console.log('[DEBUG] handleSaveStructure called! initialPayload:', initialPayload ? 'provided' : 'null');
        console.log('[DEBUG] Current structure state:', structure);
        setIsSaving(true);
        setError(null);

        try {
            // If an input is focused, blur it so UncontrolledInput onBlur commits first
            try {
                if (typeof document !== 'undefined' && document.activeElement) {
                    const active = document.activeElement;
                    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.getAttribute('contenteditable') === 'true')) {
                        active.blur();
                        // wait briefly to allow onBlur handlers to run and state to update
                        await new Promise(res => setTimeout(res, 50));
                    }
                }
            } catch (e) {
                // ignore DOM errors
            }

            // Use the passed payload for initialization, or the current state for standard saving
            const structureToSave = initialPayload ? { classTypes: initialPayload } : structure;

            if (!structureToSave || !Array.isArray(structureToSave.classTypes)) {
                toast.warning('No structure to save. Click "Initialize Default Structure" first.');
                setIsSaving(false);
                return;
            }
            
            if (structureToSave.classTypes.length === 0) {
                toast.warning('Structure is empty. Click "Initialize Default Structure" to add class types.');
                setIsSaving(false);
                return;
            }

            // Prepare payload: convert Maps to plain objects and clean up transient keys
            const serializedClassTypes = structureToSave.classTypes.map(type => {
                let serializedType = { ...type, key: undefined };
                if (type.slug === 'BS' && type.degreeConfig) {
                    serializedType.degreeConfig = type.degreeConfig.map(degree => ({
                        ...degree,
                        subjectsBySemester: degree.subjectsBySemester instanceof Map 
                            ? Object.fromEntries(degree.subjectsBySemester)
                            : (degree.subjectsBySemester || {}) 
                    }));
                }
                return serializedType;
            });

            const payload = { classTypes: serializedClassTypes };
            // DEBUG: log outgoing payload so we can verify what's being sent
            try { console.log('AcademicStructure SAVE payload:', payload); } catch (e) {}
            // Show lightweight in-app debug toast so it's obvious save started
            try { toast.info(`Saving ${payload.classTypes.length} class type(s)...`, { toastId: 'academic-structure-save-debug' }); } catch (e) {}
            const { data } = await api.put('/academic-structure', payload);
            // DEBUG: log server response
            try { console.log('AcademicStructure SAVE response:', data); } catch (e) {}

            // Process saved data back into state
            const loadedStructure = processStructureData(data.structure);
            setStructure(loadedStructure);

            // Update active tab if it was an initialization
            if (initialPayload && loadedStructure.classTypes.length > 0) {
                setActiveTab(loadedStructure.classTypes[0].slug);
            }

            toast.success('Academic structure updated successfully!');
        } catch (err) {
            console.error('Error saving academic structure:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save academic structure.');
            toast.error(err.response?.data?.message || err.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    // FIXED: initializeDefaultStructure now passes the payload directly to handleSaveStructure
    const initializeDefaultStructure = async () => {
        const defaultStructure = getDefaultStructure();
        askConfirm(
            'Initialize default structure? This will overwrite existing configuration.',
            async () => {
                await handleSaveStructure(defaultStructure);
            }
        );
    };

    // --- Dynamic Type Management (Unchanged core logic) ---
    const handleNewTypeChange = (e) => {
        const { name, value } = e.target;
        setNewType(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewType = () => {
        if (!newType.name || !newType.slug) {
            toast.error('Name and Slug are required.');
            return;
        }

        const newClassType = {
            name: newType.name,
            slug: newType.slug,
            classConfig: newType.slug === 'Class' || newType.slug === 'Almiya' ? [] : undefined,
            degreeConfig: newType.slug === 'BS' ? [] : undefined,
            hifazConfig: newType.slug === 'Hifaz' ? Array.from({ length: 30 }, (_, i) => ({ juzNumber: i + 1, surahs: [] })) : undefined,
            defaultDocumentsRequired: [],
            // Initialize Almiya with default list if specified
            ... (newType.slug === 'Almiya' && {
                 classConfig: [
                    { classIdentifier: 'Ama Awal', classNumber: 9, subjects: [] },
                    { classIdentifier: 'Ama Doom', classNumber: 10, subjects: [] },
                    { classIdentifier: 'Khasa Awal', classNumber: 11, subjects: [] },
                    { classIdentifier: 'Khasa Dom', classNumber: 12, subjects: [] },
                    { classIdentifier: 'Almiya Awal', classNumber: 13, subjects: [] },
                    { classIdentifier: 'Almiya Dom', classNumber: 14, subjects: [] },
                    { classIdentifier: 'Alma Awal', classNumber: 15, subjects: [] },
                    { classIdentifier: 'Alma Dom', classNumber: 16, subjects: [] },
                ]
            }),
            ... (newType.slug === 'BS' && {
                degreeConfig: [
                    {
                        degreeName: 'New Degree',
                        years: 4,
                        maxSemester: 8,
                        subjectsBySemester: new Map().set('1', ['Intro']).set('2', ['Core'])
                    }
                ]
            }),
            ... (newType.slug === 'Class' && {
                classConfig: [
                    { classIdentifier: '1st Grade', classNumber: 1, subjects: [] }
                ]
            }),
        };

        setStructure(prev => ({
            ...prev,
            classTypes: [...(prev?.classTypes || []), newClassType]
        }));
        setNewType(initialNewType);
        setIsAddingNewType(false);
        setActiveTab(newType.slug); // Switch to the new tab
        toast.success(`Class type '${newType.name}' added. Click Save to confirm.`);
    };

    const handleRemoveType = (slug) => {
        askConfirm(
            `Remove class type '${slug}'? This will affect student data.`,
            () => {
                setStructure(prev => ({
                    ...prev,
                    classTypes: prev.classTypes.filter(type => type.slug !== slug)
                }));
                setActiveTab(prev => prev === slug ? (structure.classTypes.length > 1 ? structure.classTypes[0].slug : '') : prev);
                toast.warning('Class type removed from config. Click Save to confirm.');
            }
        );
    };

    const updateTypeConfig = (slug, configField, newValue) => {
        setStructure(prev => ({
            ...prev,
            classTypes: prev.classTypes.map(type =>
                type.slug === slug ? { ...type, [configField]: newValue } : type
            )
        }));
    };

    // --- Class/Almiya Configuration Component ---
    const ClassConfigEditor = ({ type, updateConfig, confirm, showDialog }) => {
        const isAlmiya = type.slug === 'Almiya';

        const handleAddClass = () => {
            const currentMax = type.classConfig.length > 0 ? Math.max(...type.classConfig.map(c => c.classNumber)) : 0;
            const newClassNum = currentMax + 1;
            const newClass = {
                classIdentifier: isAlmiya ? `New Almiya Class ${newClassNum}` : `${newClassNum}th Grade`,
                classNumber: newClassNum,
                subjects: []
            };
            try {
                updateConfig('classConfig', [...type.classConfig, newClass]);
                showDialog('success', `${isAlmiya ? 'Almiya' : 'Regular'} class added successfully. Click Save to persist changes.`);
            } catch (err) {
                console.error('Error adding class:', err);
                showDialog('error', 'Could not add — something went wrong.');
            }
        };

        // FIXED: Stabilized handler for class property updates (Identifier, Number)
        const handleUpdateClass = (index, field, value) => {
            
            // 1. Validate for duplicates if changing classNumber
            if (field === 'classNumber') {
                 const num = parseInt(value) || '';
                 if (num !== '' && type.classConfig.some((c, i) => i !== index && c.classNumber === num)) {
                     toast.error("Class number must be unique.");
                     return;
                 }
            }
            
            // 2. Perform the immutable update correctly
            updateConfig('classConfig', type.classConfig.map((cls, i) => {
                if (i === index) {
                    return { ...cls, [field]: value };
                }
                return cls;
            }));
        };

        // FIXED: Stabilized handler for subject input changes
        const handleUpdateSubject = (classIndex, subIndex, value) => {
            updateConfig('classConfig', type.classConfig.map((cls, i) => {
                if (i === classIndex) {
                    // Create a new subjects array for immutability
                    const newSubjects = cls.subjects.map((sub, j) => j === subIndex ? value : sub);
                    return { ...cls, subjects: newSubjects };
                }
                return cls;
            }));
        };

        const handleAddSubject = (classIndex) => {
            updateConfig('classConfig', type.classConfig.map((cls, i) => {
                if (i === classIndex) {
                    return { ...cls, subjects: [...cls.subjects, ''] };
                }
                return cls;
            }));
            // show feedback
            try {
                showDialog('success', 'Subject added. Click Save to persist changes.');
            } catch (e) {
                // no-op if showDialog isn't provided
            }
        };

        const handleRemoveClass = (classNumber) => {
            confirm(
                `Remove class with number ${classNumber}?`,
                () => updateConfig('classConfig', type.classConfig.filter(c => c.classNumber !== classNumber))
            );
        };


        return (
            <div className="space-y-6">
                <button
                    onClick={handleAddClass}
                    className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-md'}`}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add {isAlmiya ? 'Almiya' : 'Regular'} Class
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {type.classConfig.sort((a, b) => a.classNumber - b.classNumber).map((cls, classIndex) => (
                        <div key={cls.classNumber} className={`p-4 rounded-lg relative ${currentTheme.cardBg || 'bg-white'} ${currentTheme.cardBorder || 'border border-green-200'} ${currentTheme.shadow || 'shadow-md'}`}>
                            <button
                                onClick={() => handleRemoveClass(cls.classNumber)}
                                className={`absolute top-2 right-2 p-1 rounded-full transition ${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerText || 'text-white'} ${currentTheme?.btnDangerHover || 'hover:bg-red-700'}`}
                                title="Remove Class"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                            <h4 className={`text-md font-bold mb-3 pb-2 ${currentTheme.heroTitle || 'text-green-700'} ${currentTheme.divider || 'border-b border-green-100'}`}>
                                {cls.classIdentifier}
                            </h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className={`block text-xs font-medium ${currentTheme.subtitle || 'text-gray-700'}`}>Class Identifier</label>
                                    <UncontrolledInput
                                        initialValue={cls.classIdentifier}
                                        onCommit={(val) => handleUpdateClass(classIndex, 'classIdentifier', val)}
                                        className={`mt-1 block w-full px-2 py-1 text-sm rounded-md ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.shadow || 'shadow-sm'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${currentTheme.subtitle || 'text-gray-700'}`}>Class Number (Unique ID)</label>
                                    <UncontrolledInput
                                        type="number"
                                        min="1"
                                        initialValue={cls.classNumber}
                                        onCommit={(val) => handleUpdateClass(classIndex, 'classNumber', val)}
                                        className={`mt-1 block w-full px-2 py-1 text-sm rounded-md ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.shadow || 'shadow-sm'} ${currentTheme.panelBg || 'bg-green-50'}`}
                                    />
                                </div>
                            </div>
                            
                            <h5 className={`font-semibold text-sm mt-4 mb-2 border-t pt-2 ${currentTheme.subtitle || 'text-gray-800'}`}>Subjects</h5>
                            <div className="space-y-1">
                                {cls.subjects.map((subject, subIndex) => (
                                    <div key={subIndex} className="flex items-center space-x-2">
                                        <UncontrolledInput
                                            initialValue={subject}
                                            onCommit={(val) => handleUpdateSubject(classIndex, subIndex, val)}
                                            className={`block w-full px-2 py-1 text-xs rounded-md ${currentTheme.inputBorder || 'border border-gray-300'} ${currentTheme.shadow || 'shadow-sm'}`}
                                            placeholder={`Subject ${subIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateConfig('classConfig', type.classConfig.map((c, i) => {
                                                    if (i === classIndex) {
                                                        const newSubjects = c.subjects.filter((_, j) => j !== subIndex);
                                                        return { ...c, subjects: newSubjects };
                                                    }
                                                    return c;
                                                }));
                                            }}
                                            className={`p-1 ${currentTheme?.btnDangerIcon || 'text-red-600'} ${currentTheme?.btnDangerHover || 'hover:text-red-600'}`}
                                        >
                                            <MinusCircleIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => handleAddSubject(classIndex)}
                                className={`text-xs inline-flex items-center mt-2 font-medium px-2 py-1 rounded ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || ''}`}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" /> Add Subject
                            </button>
                        </div>
                    ))}
                </div>
                
            </div>
        );
    };

    // --- BS Configuration Component ---
    const DegreeConfigEditor = ({ type, updateConfig, confirm, showDialog }) => {
        const handleAddDegree = () => {
            updateConfig('degreeConfig', [...type.degreeConfig, {
                degreeName: 'New Program',
                years: 4,
                maxSemester: 8,
                subjectsBySemester: new Map().set('1', ['Intro to Core']).set('2', ['Core II'])
            }]);
            try {
                showDialog('success', 'Degree added. Click Save to persist changes.');
            } catch (e) {}
        };

        // FIXED: Stabilized handler for input changes
        const handleUpdateDegree = (index, field, value) => {
            updateConfig('degreeConfig', type.degreeConfig.map((degree, i) => {
                if (i === index) {
                    let newDegree = { ...degree, [field]: value };
                    let parsedValue = value;

                    if (field === 'years' || field === 'maxSemester') {
                        parsedValue = parseInt(value) || 0;
                        if (parsedValue < 1) parsedValue = 1;
                        newDegree[field] = parsedValue;
                    }

                    if (field === 'years' && parsedValue) {
                        newDegree.maxSemester = parsedValue * 2;
                    } else if (field === 'maxSemester' && parsedValue) {
                        newDegree.years = Math.ceil(parsedValue / 2);
                    }
                    return newDegree;
                }
                return degree;
            }));
        };

        // FIXED: Stabilized handler for subject updates inside the Map
        const handleUpdateSemesterSubject = (degreeIndex, semester, subjectIndex, value) => {
             updateConfig('degreeConfig', type.degreeConfig.map((degree, i) => {
                 if (i === degreeIndex) {
                     // Create new Map instance for immutability
                     const newSubjectsMap = new Map(degree.subjectsBySemester);
                     
                     // Get the subjects array for the specific semester
                     const subjects = [...(newSubjectsMap.get(String(semester)) || [])];
                     
                     // Update the specific subject in the array
                     subjects[subjectIndex] = value;
                     
                     // Put the new array back into the new Map
                     newSubjectsMap.set(String(semester), subjects);
                     
                     // Return the degree object with the new map instance
                     return { ...degree, subjectsBySemester: newSubjectsMap };
                 }
                 return degree;
             }));
        };

        const handleAddSemesterSubject = (degreeIndex, semester) => {
            updateConfig('degreeConfig', type.degreeConfig.map((degree, i) => {
                if (i === degreeIndex) {
                    const newSubjectsMap = new Map(degree.subjectsBySemester);
                    const subjects = [...(newSubjectsMap.get(String(semester)) || [])];
                    subjects.push('');
                    newSubjectsMap.set(String(semester), subjects);
                    return { ...degree, subjectsBySemester: newSubjectsMap };
                }
                return degree;
            }));
        };

        const handleRemoveDegree = (degreeName) => {
            confirm(
                `Remove degree: ${degreeName}?`,
                () => updateConfig('degreeConfig', type.degreeConfig.filter(d => d.degreeName !== degreeName))
            );
        };
        
        const handleRemoveSubject = (degreeIndex, semester, subIndex) => {
            updateConfig('degreeConfig', type.degreeConfig.map((degree, i) => {
                if (i === degreeIndex) {
                    const newSubjectsMap = new Map(degree.subjectsBySemester);
                    const subjects = (newSubjectsMap.get(String(semester)) || []).filter((_, j) => j !== subIndex);
                    newSubjectsMap.set(String(semester), subjects);
                    return { ...degree, subjectsBySemester: newSubjectsMap };
                }
                return degree;
            }));
        };


        return (
            <div className="space-y-6">
                <button
                    onClick={handleAddDegree}
                    className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-md'}`}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Degree/Program
                </button>

                <div className="space-y-8">
                    {type.degreeConfig.map((degree, degreeIndex) => (
                        // Use degree name/slug as key to ensure stable mounting
                        <div key={degree.degreeName} className={`p-6 rounded-lg relative ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || 'border border-gray-200'} ${currentTheme?.shadow || 'shadow-lg'}`}>
                            <button
                                onClick={() => handleRemoveDegree(degree.degreeName)}
                                className={`absolute top-2 right-2 p-1 rounded-full transition ${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerText || 'text-white'} ${currentTheme?.btnDangerHover || 'hover:bg-red-700'}`}
                                title="Remove Degree"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                            <h4 className={`text-xl font-bold mb-4 ${currentTheme?.title || 'text-gray-800'}`}>{degree.degreeName}</h4>
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 ${currentTheme?.divider || 'border-b border-gray-200'}`}>
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Degree Name</label>
                                    <UncontrolledInput
                                        initialValue={degree.degreeName}
                                        onCommit={(val) => handleUpdateDegree(degreeIndex, 'degreeName', val)}
                                        className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} ${currentTheme?.shadow || 'shadow-sm'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Total Years</label>
                                    <UncontrolledInput
                                        type="number"
                                        min="1"
                                        initialValue={degree.years}
                                        onCommit={(val) => handleUpdateDegree(degreeIndex, 'years', val)}
                                        className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} ${currentTheme?.shadow || 'shadow-sm'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Max Semester</label>
                                    <UncontrolledInput
                                        type="number"
                                        min="1"
                                        initialValue={degree.maxSemester}
                                        onCommit={(val) => handleUpdateDegree(degreeIndex, 'maxSemester', val)}
                                        className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} ${currentTheme?.shadow || 'shadow-sm'}`}
                                    />
                                </div>
                            </div>

                            <h5 className={`font-semibold mb-3 flex items-center ${currentTheme?.subtitle || 'text-gray-700'}`}><BookOpenIcon className={`h-5 w-5 mr-2 ${currentTheme?.iconText || 'text-gray-700'}`} /> Semester-wise Subjects</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: degree.maxSemester }, (_, i) => i + 1).map(semester => (
                                    // Use a stable key that includes the degree name and semester number
                                    <div key={`${degree.degreeName}-${semester}`} className={`p-3 rounded-lg shadow-sm ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || 'border border-gray-200'}`}>
                                        <h6 className={`font-bold text-sm mb-2 pb-1 ${currentTheme?.subtitle || 'text-gray-700'} ${currentTheme?.divider || 'border-b border-gray-200'}`}>Semester {semester}</h6>
                                        <div className="space-y-1">
                                            {Array.from(degree.subjectsBySemester.get(String(semester)) || []).map((subject, subIndex) => (
                                                <div key={subIndex} className="flex items-center space-x-1">
                                                    <UncontrolledInput
                                                        initialValue={subject}
                                                        onCommit={(val) => handleUpdateSemesterSubject(degreeIndex, semester, subIndex, val)}
                                                        className={`w-full px-2 py-1 text-xs rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'}`}
                                                        placeholder="Subject Name"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSubject(degreeIndex, semester, subIndex)}
                                                        className={`p-1 ${currentTheme?.btnDangerIcon || 'text-red-600'} ${currentTheme?.btnDangerHover || 'hover:text-red-700'}`}
                                                    >
                                                        <MinusCircleIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleAddSemesterSubject(degreeIndex, semester)}
                                            className={`text-xs inline-flex items-center mt-2 font-medium px-2 py-1 rounded ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'}`}
                                        >
                                            <PlusIcon className="h-3 w-3 mr-1" /> Add Subject
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    // --- Hifaz Configuration Component ---
    const HifazConfigEditor = ({ type, updateConfig, showDialog }) => {
        
        // FIXED: Stabilized handler for surah updates
        const handleUpdateSurah = (juzIndex, surahIndex, value) => {
            updateConfig('hifazConfig', type.hifazConfig.map((juz, i) => {
                if (i === juzIndex) {
                    const newSurahs = juz.surahs.map((surah, j) => j === surahIndex ? value : surah);
                    return { ...juz, surahs: newSurahs };
                }
                return juz;
            }));
        };

        const handleAddSurah = (juzIndex) => {
            updateConfig('hifazConfig', type.hifazConfig.map((juz, i) => {
                if (i === juzIndex) {
                    return { ...juz, surahs: [...juz.surahs, ''] };
                }
                return juz;
            }));
            try { showDialog('success', 'Checkpoint added. Click Save to persist changes.'); } catch (e) {}
        };
        
        const handleRemoveSurah = (juzIndex, surahIndex) => {
             updateConfig('hifazConfig', type.hifazConfig.map((juz, i) => {
                if (i === juzIndex) {
                    const newSurahs = juz.surahs.filter((_, j) => j !== surahIndex);
                    return { ...juz, surahs: newSurahs };
                }
                return juz;
            }));
        };

        return (
            <div className="space-y-6">
                <p className={`p-3 rounded-md flex items-center ${currentTheme?.alertWarningBg || 'bg-yellow-50'} ${currentTheme?.alertWarningBorder || 'border border-yellow-300'} ${currentTheme?.alertWarningText || 'text-yellow-800'}`}>
                    <BookmarkSquareIcon className={`h-5 w-5 mr-2 ${currentTheme?.alertWarningIcon || 'text-yellow-600'}`} />
                    Hifaz structure tracks the 30 Juz (Chapters). Configure the major Surahs within each Juz as checkpoints for student progress.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {type.hifazConfig.map((juz, juzIndex) => (
                        // Use juzNumber as key for stable mapping
                        <div key={juz.juzNumber} className={`p-4 rounded-lg shadow-sm ${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.cardBorder || 'border border-gray-200'}`}>
                            <h4 className={`text-lg font-bold mb-3 pb-2 ${currentTheme?.title || 'text-gray-800'} ${currentTheme?.divider || 'border-b border-gray-200'}`}>Juz (Chapter) {juz.juzNumber}</h4>

                            <h5 className={`font-semibold text-sm mt-2 mb-2 ${currentTheme?.subtitle || 'text-gray-700'} flex items-center`}>Surahs/Checkpoints</h5>
                            <div className="space-y-1">
                                {juz.surahs.map((surah, surahIndex) => (
                                    <div key={surahIndex} className="flex items-center space-x-2">
                                        <UncontrolledInput
                                            initialValue={surah}
                                            onCommit={(val) => handleUpdateSurah(juzIndex, surahIndex, val)}
                                            className={`block w-full px-2 py-1 text-xs rounded-md shadow-sm ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'}`}
                                            placeholder={`Checkpoint ${surahIndex + 1}`}
                                        />
                                        <button
                                             type="button"
                                             onClick={() => handleRemoveSurah(juzIndex, surahIndex)}
                                             className={`p-1 ${currentTheme?.btnDangerIcon || 'text-red-600'} ${currentTheme?.btnDangerHover || 'hover:text-red-700'}`}
                                         >
                                            <MinusCircleIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => handleAddSurah(juzIndex)}
                                className={`text-sm inline-flex items-center mt-2 font-medium px-2 py-1 rounded ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'}`}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" /> Add Checkpoint
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <Loader />;
    if (error) return <Message type="error">{error}</Message>;

    const activeType = structure?.classTypes.find(type => type.slug === activeTab);
    const isStructureEmpty = !structure || structure.classTypes.length === 0;

    return (
        <>
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Hero Header */}
            <div className={`relative ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} rounded-2xl p-8 mb-8 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center">
                        <AcademicCapIcon className={`h-8 w-8 mr-3 ${currentTheme?.iconText || 'text-emerald-700'}`} />
                        <div>
                            <h2 className={`text-3xl sm:text-4xl font-extrabold ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Academic Structure Panel</h2>
                            <p className={`${currentTheme?.heroSubtitle || 'text-emerald-700'} text-sm`}>Configure classes, degrees, subjects, and checkpoints for each track.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSaveStructure()}
                        disabled={isSaving || isStructureEmpty}
                        className={`flex items-center justify-center h-12 px-8 rounded-lg font-bold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-xl'} md:w-auto w-full disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0`}
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-3 ${isSaving ? 'animate-spin' : ''}`} />
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            {/* Initialization Block */}
            {isStructureEmpty && (
                <div className="mb-6 p-6 bg-red-50 border border-red-300 rounded-lg shadow-md text-center">
                    <Message type="error" className="mb-4">
                        Database is empty. You must **initialize the academic structure** before adding students.
                    </Message>
                    <button
                        onClick={initializeDefaultStructure}
                        className={`flex items-center justify-center mx-auto px-6 py-3 rounded-lg transition duration-200 font-bold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-lg'}`}
                        disabled={isSaving}
                    >
                        <SparklesIcon className={`h-6 w-6 mr-3 ${isSaving ? 'animate-bounce' : ''}`} />
                        {isSaving ? 'Initializing...' : 'Initialize Default Structure'}
                    </button>
                </div>
            )}
            
            {!isStructureEmpty && (
                <Message type="info" className="mb-6">
                    Configure the classes, degrees, subjects, and checkpoints for each academic track. Remember to **Save Configuration** after making changes.
                </Message>
            )}

            {/* FIXED: Responsive layout for Tabs/Add Button and Save Button */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 mt-2 gap-4">
                
                {/* Tabs and Add Type Button - Takes full width on mobile/tablet, then shrinks on desktop */}
                <div className="flex space-x-2 overflow-x-auto pb-2 flex-shrink md:flex-grow md:w-auto w-full">
                    {structure?.classTypes.map(type => (
                        <button
                            key={type.slug}
                            onClick={() => setActiveTab(type.slug)}
                            className={`flex-shrink-0 h-12 px-5 text-sm font-semibold rounded-lg transition duration-150 ${activeTab === type.slug ? `${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.shadow || 'shadow-md'}` : `${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'}`}`}
                        >
                            <span className="flex items-center">
                                <UsersIcon className="h-5 w-5 mr-1" /> {type.name}
                            </span>
                        </button>
                    ))}

                    <button
                        onClick={() => setIsAddingNewType(true)}
                        className={`flex-shrink-0 h-12 px-5 text-sm font-medium rounded-lg flex items-center ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-md'}`}
                    >
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Type
                    </button>
                </div>
                
                {/* Save button now in hero; keep secondary quick-save here for long pages */}
                <button
                    onClick={() => handleSaveStructure()}
                    disabled={isSaving || isStructureEmpty}
                    className={`flex items-center justify-center h-12 px-8 rounded-lg font-bold md:w-auto w-full ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} ${currentTheme?.btnSecondaryBorder || 'border border-gray-300'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-50'} ${currentTheme?.shadow || 'shadow-sm'} disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed`}
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-3 ${isSaving ? 'animate-spin' : ''}`} />
                    {isSaving ? 'Saving...' : 'Quick Save'}
                </button>
            </div>

            {isAddingNewType && (
                <div className={`p-6 mb-6 rounded-lg shadow-inner ${currentTheme?.panelBg || 'bg-emerald-50'} ${currentTheme?.panelBorder || 'border border-dashed border-emerald-300'}`}>
                    <h3 className={`text-xl font-semibold mb-4 ${currentTheme?.heroTitle || 'text-green-800'}`}>Add New Academic Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Display Name</label>
                            <input type="text" name="name" value={newType.name} onChange={handleNewTypeChange} placeholder="e.g., Vocational Training" className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} ${currentTheme?.shadow || 'shadow-sm'}`} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={`block text-sm font-medium ${currentTheme?.subtitle || 'text-gray-700'}`}>Unique Slug (e.g., Vocational, VT, must be unique)</label>
                            <input type="text" name="slug" value={newType.slug} onChange={handleNewTypeChange} placeholder="e.g., VT" className={`mt-1 block w-full px-3 py-2 rounded-md ${currentTheme?.inputBg || 'bg-white'} ${currentTheme?.inputText || 'text-gray-900'} ${currentTheme?.inputBorder || 'border border-gray-300'} ${currentTheme?.inputRing || 'focus:ring-emerald-500 focus:border-emerald-500'} ${currentTheme?.shadow || 'shadow-sm'}`} />
                        </div>
                        <div className="flex items-end space-x-3 md:col-span-1">
                            <button onClick={handleAddNewType} className={`h-12 px-4 rounded-md ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} ${currentTheme?.shadow || 'shadow-md'}`}>
                                Create Type
                            </button>
                            <button onClick={() => setIsAddingNewType(false)} className={`h-12 px-4 rounded-md ${currentTheme?.btnSecondaryBg || 'bg-gray-200'} ${currentTheme?.btnSecondaryText || 'text-gray-800'} ${currentTheme?.btnSecondaryHover || 'hover:bg-gray-300'} ${currentTheme?.shadow || 'shadow-sm'}`}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Active Tab Content */}
            <div className={`mt-2 p-6 rounded-xl min-h-[500px] ${currentTheme?.panelBg || 'bg-gray-50'} ${currentTheme?.panelBorder || 'border border-gray-200'}`}>
                {activeType ? (
                    <>
                        <div className={`flex justify-between items-center mb-6 pb-2 ${currentTheme?.divider || 'border-b border-gray-300'}`}>
                            <h3 className={`text-2xl font-bold ${currentTheme?.title || 'text-gray-800'}`}>
                                <UsersIcon className={`h-6 w-6 mr-2 inline-block ${currentTheme?.iconText || 'text-gray-700'}`}/> Configuring: {activeType.name}
                            </h3>
                            <button
                                onClick={() => handleRemoveType(activeType.slug)}
                                className={`flex items-center text-sm font-medium p-2 rounded-lg transition ${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerText || 'text-white'} ${currentTheme?.btnDangerHover || 'hover:bg-red-700'}`}
                            >
                                <TrashIcon className="h-4 w-4 mr-1" /> Remove {activeType.name} Type
                            </button>
                        </div>

                        {/* RENDER DYNAMIC CONFIGURATION EDITOR */}
                        {['Class', 'Almiya'].includes(activeType.slug) && (
                            <ClassConfigEditor
                                type={activeType}
                                updateConfig={(field, value) => updateTypeConfig(activeTab, field, value)}
                                confirm={askConfirm}
                                showDialog={showDialog}
                            />
                        )}

                        {activeType.slug === 'BS' && (
                            <DegreeConfigEditor
                                type={activeType}
                                updateConfig={(field, value) => updateTypeConfig(activeTab, field, value)}
                                confirm={askConfirm}
                                showDialog={showDialog}
                            />
                        )}

                        {activeType.slug === 'Hifaz' && (
                            <HifazConfigEditor
                                type={activeType}
                                updateConfig={(field, value) => updateTypeConfig(activeTab, field, value)}
                                showDialog={showDialog}
                            />
                        )}

                        {/* Fallback for Custom/New Types */}
                        {!(['Class', 'BS', 'Almiya', 'Hifaz'].includes(activeType.slug)) && (
                            <Message type="info">
                                No dedicated configuration editor for this type yet. You can still modify the core structure.
                            </Message>
                        )}
                    </>
                ) : (
                    <Message type="info">
                        {!isStructureEmpty ? "Select an academic type from the tabs above to configure." : "Click 'Initialize Default Structure' to begin configuration."}
                    </Message>
                )}
            </div>
        </div>
        <ConfirmationModal
            isOpen={confirmOpen}
            onClose={() => { setConfirmOpen(false); setConfirmMessage(''); setConfirmHandler(null); }}
            onConfirm={onConfirm}
            message={confirmMessage || 'Are you sure?'}
        />
            {/* Compact global dialog used by editors for success/error feedback (reuses ConfirmationModal styling) */}
            <ConfirmationModal
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={() => setDialogOpen(false)}
                message={dialogMessage || (dialogType === 'success' ? 'Success' : 'Error')}
            />
        </>
    );
};

export default AcademicStructurePanel;