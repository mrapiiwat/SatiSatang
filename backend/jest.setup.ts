import { execSync } from 'child_process';
import { afterAll } from '@jest/globals';

// Safety check: Ensure we're using test database
if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set! Cannot run tests without test database.');
}

// Prepare test database schema
// Only run migrations on test database (TEST_DATABASE_URL is already set)
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (err) {
  try {
    // Use db push without force-reset to avoid data loss
    console.log('Error occurred while running migrations: ' + err);

    execSync('npx prisma db push', { stdio: 'inherit' });
  } catch (pushErr) {
    console.error('Failed to prepare test database:', pushErr);
  }
}

afterAll(async () => {
  const mod = await import('./src/common/config/prismaClient');
  await mod.prisma.$disconnect();
});
