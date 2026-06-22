// backend/controllers/feeStructureController.js
import asyncHandler from 'express-async-handler';
import FeeStructure from '../models/FeeStructure.js';
import AcademicStructure from '../models/AcademicStructure.js';

// @desc    Get the single fee structure configuration document
// @route   GET /api/fee-structure
// @access  Private (All Authenticated Users)
export const getFeeStructure = asyncHandler(async (req, res) => {
    // Upsert: always return a document even if none exists yet
    const feeStructure = await FeeStructure.findOneAndUpdate(
        { key: 'FEE_CONFIG' },
        { $setOnInsert: { key: 'FEE_CONFIG' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(feeStructure);
});

// @desc    Update the single fee structure document
// @route   PUT /api/fee-structure
// @access  Private/Admin
export const updateFeeStructure = asyncHandler(async (req, res) => {
    console.log('[FeeStructure] PUT request received');

    const { feeTypes } = req.body;

    if (!Array.isArray(feeTypes)) {
        res.status(400);
        throw new Error('Invalid data format. feeTypes must be an array.');
    }

    const updatedFeeStructure = await FeeStructure.findOneAndUpdate(
        { key: 'FEE_CONFIG' },
        { $set: { feeTypes, updatedAt: Date.now() } },
        { new: true, upsert: true, runValidators: true, context: 'query' }
    );

    if (!updatedFeeStructure) {
        res.status(500);
        throw new Error('Failed to update fee structure.');
    }

    console.log('[FeeStructure] Update successful, ID:', updatedFeeStructure?._id);
    res.json({ message: 'Fee structure updated successfully.', feeStructure: updatedFeeStructure });
});

// @desc    Sync fee structure types from academic structure
//          Creates/updates fee type entries to match current academic types,
//          preserving existing fee values.
// @route   POST /api/fee-structure/sync
// @access  Private/Admin
export const syncFeeStructureFromAcademic = asyncHandler(async (req, res) => {
    // Load current academic structure
    const academicConfig = await AcademicStructure.findOne({ key: 'ACADEMIC_CONFIG' });
    if (!academicConfig || !academicConfig.classTypes?.length) {
        res.status(400);
        throw new Error('No academic structure found. Please configure academic structure first.');
    }

    // Load current fee structure
    let feeConfig = await FeeStructure.findOne({ key: 'FEE_CONFIG' });
    if (!feeConfig) {
        feeConfig = await FeeStructure.create({ key: 'FEE_CONFIG', feeTypes: [] });
    }

    const existingFeeTypes = feeConfig.feeTypes || [];

    // Build updated feeTypes by merging academic types with existing fee data
    const updatedFeeTypes = academicConfig.classTypes.map(academicType => {
        const existing = existingFeeTypes.find(ft => ft.slug === academicType.slug);

        if (academicType.slug === 'BS') {
            // Degree-based fees
            const newDegreeFees = (academicType.degreeConfig || []).map(degree => {
                const existingFee = existing?.degreeFees?.find(df => df.degreeName === degree.degreeName);
                return {
                    degreeName: degree.degreeName,
                    feePerMonth: existingFee?.feePerMonth ?? 0,
                };
            });
            return {
                slug: academicType.slug,
                name: academicType.name,
                degreeFees: newDegreeFees,
            };
        } else if (academicType.slug === 'Hifaz') {
            // Flat fee
            return {
                slug: academicType.slug,
                name: academicType.name,
                flatFee: existing?.flatFee ?? 0,
            };
        } else {
            // Class / Almiya — per-class fees
            const newClassFees = (academicType.classConfig || []).map(cls => {
                const existingFee = existing?.classFees?.find(cf => cf.classIdentifier === cls.classIdentifier);
                return {
                    classIdentifier: cls.classIdentifier,
                    feePerMonth: existingFee?.feePerMonth ?? 0,
                };
            });
            return {
                slug: academicType.slug,
                name: academicType.name,
                classFees: newClassFees,
            };
        }
    });

    const syncedFeeStructure = await FeeStructure.findOneAndUpdate(
        { key: 'FEE_CONFIG' },
        { $set: { feeTypes: updatedFeeTypes } },
        { new: true, upsert: true, runValidators: true }
    );

    res.json({
        message: `Fee structure synced successfully. ${updatedFeeTypes.length} fee type(s) updated.`,
        feeStructure: syncedFeeStructure,
    });
});
