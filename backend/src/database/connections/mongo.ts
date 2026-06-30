import mongoose from 'mongoose';
import { createLogger } from '@/logger';

const logger = createLogger({ service: 'database' });

export async function connectMongo(uri?: string): Promise<typeof mongoose> {
  const mongoUri = uri ?? process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/devlock';

  const connection = await mongoose.connect(mongoUri, {
    maxPoolSize: Number(process.env['MONGODB_MAX_POOL_SIZE'] ?? 50),
    minPoolSize: Number(process.env['MONGODB_MIN_POOL_SIZE'] ?? 5),
    socketTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
    heartbeatFrequencyMS: 10_000,
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  logger.info('Connected to MongoDB');
  return connection;
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}
