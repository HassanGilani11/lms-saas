require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./src/lib/prisma");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
