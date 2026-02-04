
import { db } from "./src/lib/db";

async function main() {
    try {
        const course = await db.course.findFirst();
        console.log("Course keys:", course ? Object.keys(course) : "No course found");
    } catch (e: any) {
        console.error("Course fetch error:", e.message);
    } finally {
        process.exit(0);
    }
}

main();
