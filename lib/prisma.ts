import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Extend the global object to cache BOTH the client and the pool
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pgPool: Pool;
};

const connectionString = process.env.DATABASE_URL!;

// 2. Only create a new Pool if one doesn't already exist in the global cache
const pool = globalForPrisma.pgPool || new Pool({ 
  connectionString,
  max: 10, // Prevent local connection flooding
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

// 3. Initialize Prisma using the cached adapter/pool
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;