
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const courseId = "cml8z83yj000cosuq1yicx45e";
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            purchases: {
                include: { user: true }
            }
        }
    });

    console.log("Course Status for cml8z83yj000cosuq1yicx45e:");
    console.log(JSON.stringify(course, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
