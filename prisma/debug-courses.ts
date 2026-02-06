import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function check() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log("Users:", JSON.stringify(users, null, 2));

        const courses = await prisma.course.findMany({
            include: {
                user: { select: { name: true } },
                _count: { select: { lessons: true } }
            }
        });
        console.log("Courses:", JSON.stringify(courses, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
