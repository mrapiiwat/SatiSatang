// Ensure NODE_ENV=test before anything else loads env vars
process.env.NODE_ENV = 'test';

// Load .env.test if present, otherwise .env
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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


