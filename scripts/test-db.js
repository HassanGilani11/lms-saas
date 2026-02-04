
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
    console.log("Querying LearningPaths...");
    try {
        const paths = await db.learningPath.findMany({
            include: {
                category: true,
            }
        });
        console.log("Found paths:", JSON.stringify(paths, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await db.$disconnect();
    }
}

main();
