import asyncHandler from 'express-async-handler';
import AcademicStructure from '../models/AcademicStructure.js';

// @desc    Get the single academic structure document
// @route   GET /api/academic-structure
// @access  Private (All Authenticated Users)
export const getAcademicStructure = asyncHandler(async (req, res) => {
    // Upsert to ensure the document always exists
    const structure = await AcademicStructure.findOneAndUpdate(
        { key: 'ACADEMIC_CONFIG' },
        { $setOnInsert: { key: 'ACADEMIC_CONFIG' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(structure);
});

// @desc    Update the single academic structure document
// @route   PUT /api/academic-structure
// @access  Private/Admin
export const updateAcademicStructure = asyncHandler(async (req, res) => {
    const { classTypes } = req.body;

    if (!Array.isArray(classTypes)) {
        res.status(400);
        throw new Error('Invalid data format. classTypes must be an array.');
    }

    const updatedStructure = await AcademicStructure.findOneAndUpdate(
        { key: 'ACADEMIC_CONFIG' },
        { $set: { classTypes: classTypes, updatedAt: Date.now() } },
        { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedStructure) {
        // This should not happen since we upsert in the GET
        res.status(500);
        throw new Error('Failed to update academic structure.');
    }
    
    res.json({ message: 'Academic structure updated successfully.', structure: updatedStructure });
});