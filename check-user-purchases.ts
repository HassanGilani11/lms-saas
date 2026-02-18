
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const email = "johnwhick@gmail.com";
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            purchases: {
                include: { course: true }
            },
            stripeCustomer: true
        }
    });

    console.log("User Context:");
    console.log(JSON.stringify(user, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
