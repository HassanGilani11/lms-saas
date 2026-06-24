
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/lib/prisma";

async function main() {
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            price: true,
            isPublished: true,
        }
    });
    console.log("Courses found:", courses.length);
    console.log(JSON.stringify(courses, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
