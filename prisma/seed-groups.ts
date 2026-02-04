import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding groups...");
    await prisma.group.createMany({
        data: [
            { name: "Engineering Department" },
            { name: "Marketing Team" },
            { name: "Business Analysts" },
            { name: "Essential Business Skills Package" },
        ],
        skipDuplicates: true,
    });
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
