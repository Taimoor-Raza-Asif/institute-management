import mongoose from 'mongoose';

const cohortCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('CohortCounter', cohortCounterSchema);
