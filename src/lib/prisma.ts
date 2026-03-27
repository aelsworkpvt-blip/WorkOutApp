import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { normalizePgConnectionString } from "@/lib/pg-connection-string";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

export const hasUsableDatabaseUrl =
  Boolean(process.env.DATABASE_URL) &&
  !process.env.DATABASE_URL?.includes("johndoe:randompassword");

const normalizedDatabaseUrl = normalizePgConnectionString(process.env.DATABASE_URL);

function createPrismaClient() {
  const pool =
    global.prismaPool ??
    new Pool({
      connectionString: normalizedDatabaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    global.prismaPool = pool;
  }

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["error"],
  });
}

export const prisma = hasUsableDatabaseUrl
  ? global.prisma ?? createPrismaClient()
  : null;

export function requirePrisma() {
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured for Prisma.");
  }

  return prisma;
}

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prisma = prisma;
}
