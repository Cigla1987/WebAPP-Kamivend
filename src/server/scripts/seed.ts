#!/usr/bin/env node
import seedDb, { seedProdDb } from '../utils/seed.server';

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  console.log(`Running ${isProduction ? 'production' : 'development'} seed...`);

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
