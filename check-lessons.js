const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
    const courseId = "cml8z83yj000cosuq1yicx45e";
    const lessons = await db.lesson.findMany({
        where: { courseId },
        select: { id: true, title: true, isPublished: true, position: true }
    });
    console.log(JSON.stringify(lessons, null, 2));
    process.exit(0);
}

check();
