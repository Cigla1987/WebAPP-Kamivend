#!/usr/bin/env node
import seedDb, { seedProdDb, resetDatabase } from '../utils/seed.server';

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceReseed = process.env.FORCE_RESEED === 'true';

  console.log(`Running ${isProduction ? 'production' : 'development'} seed...`);

  if (forceReseed && !isProduction) {
    console.log('FORCE_RESEED is set, resetting database...');
    const resetResult = await resetDatabase();
    if (!resetResult) {
      console.error('Database reset failed!');
      process.exit(1);
    }
  }

  try {
    const result = isProduction ? await seedProdDb() : await seedDb();

    if (result) {
      console.log('Seeding completed successfully!');
      process.exit(0);
    } else {
      console.error('Seeding failed!');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Seeding error:', error?.message || error);
    process.exit(1);
  }
}

main();
