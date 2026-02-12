import { db } from "./src/lib/db";

async function fix() {
    console.log("Starting fix...");

    const lessons = await db.lesson.updateMany({
        where: { isPublished: false },
        data: { isPublished: true }
    });
    console.log(`Updated ${lessons.count} lessons to published.`);

    const topics = await db.topic.updateMany({
        where: { isPublished: false },
        data: { isPublished: true }
    });
    console.log(`Updated ${topics.count} topics to published.`);

    console.log("Fix completed.");
}

fix()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
