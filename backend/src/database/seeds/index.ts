// Database seeding script
// Run with: pnpm db:seed

import { connectMongo, disconnectMongo } from '../connections/mongo.js';

async function seed() {
  console.info('🌱 Starting database seed...');
  await connectMongo();

  // TODO: Add seed data for development
  // - Default tenant
  // - Admin user
  // - Sample project
  // - Sample licenses

  await disconnectMongo();
  console.info('✅ Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
