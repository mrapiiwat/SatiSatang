// Ensure NODE_ENV=test before anything else loads env vars
process.env.NODE_ENV = 'test';

// Load .env.test if present, otherwise .env
// We use dotenv/config via ts-node runtime of the app, but load here for safety
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootDir = process.cwd();
const envTestPath = path.join(rootDir, '.env.test');
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
} else {
  dotenv.config();
}

// Force Prisma to use test database if provided
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
