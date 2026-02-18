
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // Check recent purchases
    const purchases = await prisma.purchase.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            course: { select: { title: true } },
            user: { select: { email: true } }
        }
    });

    console.log("Recent Purchases:");
    console.log(JSON.stringify(purchases, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
