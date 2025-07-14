// // backend/controllers/feeController.js
// import FeeRecord from '../models/FeeRecord.js';
// import Student from '../models/Student.js';



// export const getAllFees = async (req, res) => {
//   try {
//     const { month, receivedBy, paymentMethod, studentSearchTerm } = req.query;

//     const pipeline = [];

//     // Stage 1: Lookup student details if studentSearchTerm is provided OR if we need student info for display
//     pipeline.push({
//       $lookup: {
//         from: Student.collection.name, // The actual collection name (e.g., 'students')
//         localField: 'studentId',
//         foreignField: '_id',
//         as: 'studentInfo'
//       }
//     });
//     pipeline.push({
//       $unwind: {
//         path: '$studentInfo',
//         preserveNullAndEmptyArrays: true // Keep fee records even if studentInfo is missing (e.g., deleted student)
//       }
//     });

//     // Stage 2: Apply filters
//     const matchConditions = {};

//     if (studentSearchTerm) {
//       matchConditions.$or = [
//         { 'studentInfo.name': { $regex: studentSearchTerm, $options: 'i' } },
//         { 'studentInfo.cnic': { $regex: studentSearchTerm, $options: 'i' } }
//       ];
//     }
//     if (month) {
//       matchConditions.month = month;
//     }
//     if (receivedBy) {
//       matchConditions.receivedBy = receivedBy;
//     }
//     if (paymentMethod) {
//       matchConditions.paymentMethod = paymentMethod;
//     }

//     if (Object.keys(matchConditions).length > 0) {
//       pipeline.push({ $match: matchConditions });
//     }

//     // Stage 3: Project the final output to reshape the data as needed
//     pipeline.push({
//       $project: {
//         _id: 1,
//         studentId: '$studentInfo', // This will now be the populated student object
//         month: 1,
//         receivedDate: 1,
//         receivedBy: 1,
//         paymentMethod: 1,
//         billScreenshotUrl: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         // Add other fields from FeeRecord if needed
//       }
//     });

//     const fees = await FeeRecord.aggregate(pipeline);
//     res.json(fees);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// export const getFeesByStudent = async (req, res) => {
//   try {
//     const fees = await FeeRecord.find({ studentId: req.params.studentId });
//     res.json(fees);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const createFeeRecord = async (req, res) => {
//   try {
//     const data = req.body;
//     if (req.file) {
//       data.billScreenshotUrl = `/uploads/${req.file.filename}`;
//     }
//     const fee = new FeeRecord(data);
//     await fee.save();
//     res.status(201).json(fee);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const updateFeeRecord = async (req, res) => {
//   try {
//     const data = req.body;
//     if (req.file) {
//       data.billScreenshotUrl = `/uploads/${req.file.filename}`;
//     }
//     const updated = await FeeRecord.findByIdAndUpdate(req.params.id, data, { new: true });
//     if (!updated) return res.status(404).json({ message: 'Fee record not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const deleteFeeRecord = async (req, res) => {
//   try {
//     const deleted = await FeeRecord.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: 'Fee record not found' });
//     res.json({ message: 'Fee record deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




// backend/controllers/feeController.js
import FeeRecord from '../models/FeeRecord.js';
import Student from '../models/Student.js'; // Make sure Student model is imported

// Helper function to update student fee status
const updateStudentFeeStatus = async (studentId) => {
  try {
    const feeRecordsCount = await FeeRecord.countDocuments({ studentId: studentId });
    const newStatus = feeRecordsCount > 0 ? 'Paid' : 'Unpaid';
    await Student.findByIdAndUpdate(studentId, { feeStatus: newStatus });
  } catch (err) {
    console.error(`Error updating fee status for student ${studentId}:`, err);
  }
};

export const getAllFees = async (req, res) => {
  // ... (No changes here from previous response)
  try {
    const { month, receivedBy, paymentMethod, studentSearchTerm } = req.query;

    const pipeline = [];

    // Stage 1: Lookup student details if studentSearchTerm is provided OR if we need student info for display
    pipeline.push({
      $lookup: {
        from: Student.collection.name, // The actual collection name (e.g., 'students')
        localField: 'studentId',
        foreignField: '_id',
        as: 'studentInfo'
      }
    });
    pipeline.push({
      $unwind: {
        path: '$studentInfo',
        preserveNullAndEmptyArrays: true // Keep fee records even if studentInfo is missing (e.g., deleted student)
      }
    });

    // Stage 2: Apply filters
    const matchConditions = {};

    if (studentSearchTerm) {
      matchConditions.$or = [
        { 'studentInfo.name': { $regex: studentSearchTerm, $options: 'i' } },
        { 'studentInfo.cnic': { $regex: studentSearchTerm, $options: 'i' } }
      ];
    }
    if (month) {
      matchConditions.month = month;
    }
    if (receivedBy) {
      matchConditions.receivedBy = receivedBy;
    }
    if (paymentMethod) {
      matchConditions.paymentMethod = paymentMethod;
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Stage 3: Project the final output to reshape the data as needed
    pipeline.push({
      $project: {
        _id: 1,
        studentId: '$studentInfo', // This will now be the populated student object
        month: 1,
        receivedDate: 1,
        receivedBy: 1,
        paymentMethod: 1,
        billScreenshotUrl: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    });

    const fees = await FeeRecord.aggregate(pipeline);
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createFeeRecord = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.billScreenshotUrl = `/uploads/${req.file.filename}`;
    }
    const fee = new FeeRecord(data);
    await fee.save();

    // Update student's overall feeStatus to 'Paid'
    await updateStudentFeeStatus(fee.studentId);

    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateFeeRecord = async (req, res) => {
  try {
    const data = req.body;
    const feeId = req.params.id;

    // Fetch existing fee record to get studentId before update
    const existingFee = await FeeRecord.findById(feeId);
    if (!existingFee) return res.status(404).json({ message: 'Fee record not found' });

    if (req.file) {
      data.billScreenshotUrl = `/uploads/${req.file.filename}`;
    } else if (data.billScreenshotUrl === '') { // Handle clearing screenshot
        data.billScreenshotUrl = null;
    }

    const updated = await FeeRecord.findByIdAndUpdate(feeId, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Fee record not found' });

    // Update student's overall feeStatus
    await updateStudentFeeStatus(existingFee.studentId); // Use existingFee.studentId

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFeeRecord = async (req, res) => {
  try {
    const feeId = req.params.id;
    const feeToDelete = await FeeRecord.findById(feeId);
    if (!feeToDelete) return res.status(404).json({ message: 'Fee record not found' });

    await FeeRecord.findByIdAndDelete(feeId);

    // Update student's overall feeStatus after deletion
    await updateStudentFeeStatus(feeToDelete.studentId);

    res.json({ message: 'Fee record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getFeesByStudent = async (req, res) => {
  try {
    const fees = await FeeRecord.find({ studentId: req.params.studentId });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
