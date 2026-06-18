import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/matchundo?schema=public";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

if (!globalForPrisma.prisma) {
  const pool = new Pool({
    connectionString,
  });
  const adapter = new PrismaPg(pool);
  
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma!;
export { PrismaClient };
