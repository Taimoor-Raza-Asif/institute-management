import mongoose from 'mongoose';

// --- Sub-schemas for Class Types ---

// 1. Class / Almiya Common Schema
const classSubSchema = new mongoose.Schema({
    // For Class: '1', '2', etc. | For Almiya: 'Ama Awal', 'Khasa Dom', etc.
    classIdentifier: { type: String, required: true, trim: true }, 
    classNumber: { type: Number, required: true, min: 1 }, // Used for ordering/promotion logic
    subjects: [{ type: String, required: true, trim: true }],
});

// 2. BS / Degree Schema
const degreeSubSchema = new mongoose.Schema({
    degreeName: { type: String, required: true, trim: true },
    years: { type: Number, required: true, min: 1 },
    maxSemester: { type: Number, required: true, min: 1 },
    // subjectsBySemester: { '1': ['Sub1', 'Sub2'], '2': ['Sub3', 'Sub4'] }
    subjectsBySemester: {
        type: Map,
        of: [String], // Map where keys are semester number (string) and values are array of subjects (string)
        required: true,
    },
});

// 3. Hifaz Schema (Chapters/Juz)
const hifazJuzSchema = new mongoose.Schema({
    juzNumber: { type: Number, required: true, min: 1, max: 30 },
    surahs: [{ type: String, required: true, trim: true }], // e.g., ['Al-Fatiha', 'Al-Baqarah (part)']
});

// --- Main Academic Type Schema ---
const academicTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // e.g., 'Class', 'BS / BA', 'Almiya', 'Hifaz'
    slug: { type: String, required: true, unique: true, trim: true }, // e.g., 'Class', 'BS', 'Almiya', 'Hifaz'
    
    // Configuration fields (only one will be relevant based on slug)
    classConfig: { type: [classSubSchema], default: undefined },
    degreeConfig: { type: [degreeSubSchema], default: undefined },
    hifazConfig: { type: [hifazJuzSchema], default: undefined },

    // Default configuration for new students of this type (e.g., documents required)
    defaultDocumentsRequired: [{ type: String, trim: true }],
}, { _id: false });


// --- Central Structure Schema ---
const academicStructureSchema = new mongoose.Schema({
    // We use a fixed ID to ensure only one configuration document exists
    key: { type: String, required: true, unique: true, default: 'ACADEMIC_CONFIG' },
    classTypes: { type: [academicTypeSchema], default: [] },
}, { timestamps: true });

const AcademicStructure = mongoose.model('AcademicStructure', academicStructureSchema);

export default AcademicStructure;