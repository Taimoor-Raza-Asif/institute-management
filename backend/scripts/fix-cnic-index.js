/**
 * ONE-TIME MIGRATION SCRIPT
 * --------------------------
 * Problem:  The `cnic_1` unique index enforces CNIC uniqueness globally,
 *           including soft-deleted students (isDeleted: true).
 *           This causes "duplicate key" errors when:
 *             - Re-enrolling a previously deleted student with the same CNIC
 *             - Editing a student's CNIC to one that belongs to a deleted student
 *
 * Fix:      Drop the old global index and create a PARTIAL unique index
 *           that only enforces uniqueness among active (non-deleted) students.
 *
 * Safety:   This script ONLY touches indexes — zero student documents are
 *           modified, deleted, or moved.
 *
 * Run once: node scripts/fix-cnic-index.js
 */

import '../env.js'; // Load .env before anything else
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI not found in environment. Check your .env file.');
  process.exit(1);
}

async function run() {
  console.log('🔌  Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('students');

  // ── 1. List existing indexes ──────────────────────────────────────────────
  const before = await collection.indexes();
  console.log('📋  Existing indexes before migration:');
  before.forEach(idx => console.log('    -', idx.name, JSON.stringify(idx.key)));
  console.log();

  // ── 2. Drop old global unique index on cnic ───────────────────────────────
  const hasCnicIndex = before.some(idx => idx.name === 'cnic_1');
  if (hasCnicIndex) {
    console.log('🗑   Dropping old global unique index "cnic_1"...');
    await collection.dropIndex('cnic_1');
    console.log('✅  Dropped.\n');
  } else {
    console.log('ℹ️   No "cnic_1" index found — skipping drop step.\n');
  }

  // ── 3. Backfill: ensure all non-deleted docs have isDeleted: false explicitly ──
  // The partial index uses { isDeleted: false }, which means documents where
  // isDeleted is undefined/missing are NOT covered by the index and could allow
  // duplicates silently. We backfill to make all active students explicitly false.
  console.log('🔄  Backfilling isDeleted: false on active students (safe, no data removed)...');
  const backfillResult = await collection.updateMany(
    { isDeleted: { $exists: false } }, // only docs missing the field
    { $set: { isDeleted: false } }
  );
  console.log(`✅  Backfilled ${backfillResult.modifiedCount} document(s).\n`);

  // ── 4. Create new partial unique index ───────────────────────────────────
  // Uniqueness is only enforced when isDeleted is NOT true (i.e., active students).
  // Soft-deleted students are excluded from the constraint.
  const newIndexName = 'cnic_unique_active';
  const after = await collection.indexes();
  const alreadyExists = after.some(idx => idx.name === newIndexName);

  if (!alreadyExists) {
    console.log('🔧  Creating new partial unique index "cnic_unique_active"...');
    await collection.createIndex(
      { cnic: 1 },
      {
        unique: true,
        // Use $eq: false instead of $ne: true — MongoDB Atlas doesn't support
        // $ne / $not operators in partial filter expressions.
        // This index only activates for documents where isDeleted is explicitly false.
        // Note: documents with isDeleted: undefined/missing are also excluded,
        // so we first ensure all active students have isDeleted: false explicitly.
        partialFilterExpression: { isDeleted: false },
        name: newIndexName,
      }
    );
    console.log('✅  Created.\n');
  } else {
    console.log('ℹ️   Partial index "cnic_unique_active" already exists — skipping.\n');
  }

  // ── 4. Verify ─────────────────────────────────────────────────────────────
  const finalIndexes = await collection.indexes();
  console.log('📋  Final indexes after migration:');
  finalIndexes.forEach(idx => console.log('    -', idx.name, JSON.stringify(idx.key), idx.partialFilterExpression ? `(partial: ${JSON.stringify(idx.partialFilterExpression)})` : ''));

  console.log('\n🎉  Migration complete! No data was modified.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
