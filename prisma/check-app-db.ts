import "dotenv/config";
import { db } from "../src/lib/db";

async function check() {
    try {
        console.log("Checking courses with app db client...");
        const users = await db.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log("Users in DB:", JSON.stringify(users, null, 2));

        const courses = await db.course.findMany({
            include: {
                user: { select: { name: true } },
                category: { select: { name: true } },
                _count: { select: { lessons: true } }
            }
        });
        console.log("Found courses:", courses.length);
        courses.forEach(c => {
            console.log(`Course: ${c.title}, Category: ${c.category?.name || "NULL"}`);
        });
    } catch (e) {
        console.error("Error checking courses:", e);
    } finally {
        // Since src/lib/db.ts might have a global instance, we might not need to disconnect 
        // but for a script it's better.
        // However, src/lib/db might not export the prisma instance directly if it's hidden in a function.
        // Let's check src/lib/db.ts export.
    }
}
check();
