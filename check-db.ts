import { db } from "./src/lib/db";

async function main() {
    try {
        const groupCount = await db.group.count();
        const groups = await db.group.findMany({
            include: {
                category: true,
                parent: {
                    select: { name: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });

        console.log("Total groups:", groupCount);
        console.log("Groups:", JSON.stringify(groups, null, 2));

        const userCount = await db.user.count();
        console.log("Total users:", userCount);
    } catch (err) {
        console.error("Error querying database:", err);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
