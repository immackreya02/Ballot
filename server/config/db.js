const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ballot_db';
    
    // Set strictQuery to true or false explicitly
    mongoose.set('strictQuery', false);

    // Try connecting to configured MongoDB (Atlas or local)
    try {
      const isAtlas = mongoUri.includes('mongodb+srv') || mongoUri.includes('@');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: isAtlas ? 10000 : 2500
      });
      const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Connected to MongoDB at ${maskedUri}`);
      return;
    } catch (localErr) {
      if (process.env.MONGODB_URI) {
        console.error('[Database] Failed connecting to MONGODB_URI:', localErr.message);
      }
      console.log('[Database] MongoDB not reachable. Falling back to MongoMemoryServer for zero-setup execution...');
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
