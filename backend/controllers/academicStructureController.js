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
    console.log('[AcademicStructure] PUT request received');
    console.log('[AcademicStructure] Request body:', JSON.stringify(req.body, null, 2));
    
    const { classTypes } = req.body;

    if (!Array.isArray(classTypes)) {
        console.log('[AcademicStructure] ERROR: classTypes is not an array');
        res.status(400);
        throw new Error('Invalid data format. classTypes must be an array.');
    }

    console.log('[AcademicStructure] classTypes count:', classTypes.length);

    try {
        const updatedStructure = await AcademicStructure.findOneAndUpdate(
            { key: 'ACADEMIC_CONFIG' },
            { $set: { classTypes: classTypes, updatedAt: Date.now() } },
            { new: true, upsert: true, runValidators: true, context: 'query' }
        );

        console.log('[AcademicStructure] Update successful, ID:', updatedStructure?._id);

        if (!updatedStructure) {
            console.log('[AcademicStructure] ERROR: No document returned after update');
            res.status(500);
            throw new Error('Failed to update academic structure.');
        }
        
        res.json({ message: 'Academic structure updated successfully.', structure: updatedStructure });
    } catch (error) {
        console.log('[AcademicStructure] Database error:', error.message);
        throw error;
    }
});