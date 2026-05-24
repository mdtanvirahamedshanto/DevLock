// Database migration runner
// Run with: pnpm db:migrate

import { connectMongo, disconnectMongo } from '../connections/mongo.js';

async function migrate() {
  console.info('🔄 Running migrations...');
  await connectMongo();

  // TODO: Implement migration system
  // - Track applied migrations in a `_migrations` collection
  // - Run pending migrations in order
  // - Support rollback

  await disconnectMongo();
  console.info('✅ Migrations complete');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
