const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ballot_db';
    
    // Set strictQuery to true or false explicitly
    mongoose.set('strictQuery', false);

    // Try connecting to local MongoDB with short timeout
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[Database] Connected to local MongoDB at ${mongoUri}`);
      return;
    } catch (localErr) {
      console.log('[Database] Local MongoDB not reachable. Falling back to MongoMemoryServer for zero-setup execution...');
    }

    // Fallback: Start MongoDB Memory Server automatically
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to In-Memory MongoDB instance at ${uri}`);
  } catch (err) {
    console.error('[Database] Connection Error:', err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
