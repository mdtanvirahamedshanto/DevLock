import mongoose from 'mongoose';

const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/devlock?replicaSet=rs0';

export async function connectDatabase(): Promise<typeof mongoose> {
  const connection = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected from MongoDB');
  });

  console.info('[DB] Connected to MongoDB');
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.info('[DB] Disconnected from MongoDB');
}
