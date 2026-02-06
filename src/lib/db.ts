import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/prisma";

declare global {
  var prismaDb: PrismaClient | undefined;
}

const getPrisma = () => {
  if (process.env.NODE_ENV === "production") {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  if (!globalThis.prismaDb) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalThis.prismaDb = new PrismaClient({ adapter });
  }

  return globalThis.prismaDb;
};

export const db = getPrisma();
