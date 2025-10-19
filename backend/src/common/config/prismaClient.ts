import { PrismaClient } from '@prisma/client';

const isTest = process.env.NODE_ENV === 'test';
const databaseUrl = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: isTest ? [] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function ensureDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    if (!isTest) {
      console.log('Connected to the database successfully!');
    }
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    if (!isTest) {
      process.exit(1);
    }
  }
}

ensureDatabaseConnection();

export default prisma;
