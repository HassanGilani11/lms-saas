const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const groupCount = await prisma.group.count();
    const groups = await prisma.group.findMany({
        include: {
            category: true,
            parent: true,
            _count: {
                select: { users: true }
            }
        }
    });

    console.log("Total groups:", groupCount);
    console.log("Groups:", JSON.stringify(groups, null, 2));

    const userCount = await prisma.user.count();
    console.log("Total users:", userCount);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
