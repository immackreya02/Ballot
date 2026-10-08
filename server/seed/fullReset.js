require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDemoData } = require('./demoSeeder');

async function fullDatabaseReset() {
  console.log('==================================================');
  console.log('FULL BALLOT DATABASE RESET & DEMO SEEDING');
  console.log('==================================================\n');

  await connectDB();

  console.log('[Database] Wiping all existing collections in ballot_db...');
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
    console.log(`  ✓ Cleared collection: ${collectionName}`);
  }

  console.log('\n==================================================');
  console.log('RE-SEEDING CLEAN DEMO SCENARIO');
  console.log('==================================================\n');

  await disconnectDB();

  // Run demo seeder to recreate the clean demo organizer & poll
  await seedDemoData();

  console.log('==================================================');
  console.log('FULL RESET COMPLETE — ALL TEST DATA ERASED');
  console.log('==================================================\n');
}

if (require.main === module) {
  fullDatabaseReset()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Full Database Reset Failed:', err);
      process.exit(1);
    });
}

module.exports = { fullDatabaseReset };
