// backend/models/FeeStructure.js
import mongoose from 'mongoose';

// Fee entry for a specific class (Class / Almiya types)
const classFeeSchema = new mongoose.Schema({
    classIdentifier: { type: String, required: true, trim: true }, // e.g. '9th Science', 'Ama Awal'
    feePerMonth: { type: Number, default: 0, min: 0 },
}, { _id: false });

// Fee entry for a specific degree (BS type)
const degreeFeeSchema = new mongoose.Schema({
    degreeName: { type: String, required: true, trim: true }, // e.g. 'Software Engineering'
    feePerMonth: { type: Number, default: 0, min: 0 },
}, { _id: false });

// Fee type block — one per academic type (Class, BS, Almiya, Hifaz)
const feeTypeSchema = new mongoose.Schema({
    slug: { type: String, required: true, trim: true },   // Matches AcademicStructure type slug
    name: { type: String, required: true, trim: true },   // Display name

    // For Class / Almiya types: per-class fees
    classFees: { type: [classFeeSchema], default: undefined },

    // For BS type: per-degree fees
    degreeFees: { type: [degreeFeeSchema], default: undefined },

    // For Hifaz type: single flat fee
    flatFee: { type: Number, default: 0, min: 0 },
}, { _id: false });

// Singleton document schema
const feeStructureSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'FEE_CONFIG' },
    feeTypes: { type: [feeTypeSchema], default: [] },
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
