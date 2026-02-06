import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Seeding started with pg adapter...");
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined.");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const hashedPassword = await bcrypt.hash("password123", 10);

    try {
        // 1. Categories
        console.log("Seeding categories...");
        const categoryNames = [
            "Computer Science",
            "Marketing",
            "Design",
            "Business",
            "Personal Development",
        ];

        for (const name of categoryNames) {
            await prisma.category.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        const categories = await prisma.category.findMany();
        const csCategory = categories.find((c: any) => c.name === "Computer Science");

        // 2. Users
        console.log("Seeding users...");
        const admin = await prisma.user.upsert({
            where: { email: "admin@test.com" },
            update: {},
            create: {
                email: "admin@test.com",
                name: "Admin User",
                username: "admin_user",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        const instructor = await prisma.user.upsert({
            where: { email: "instructor@test.com" },
            update: {},
            create: {
                email: "instructor@test.com",
                name: "Instructor User",
                username: "instructor_user",
                password: hashedPassword,
                role: "INSTRUCTOR",
            },
        });

        // 3. Course Tags
        console.log("Seeding tags...");
        const tags = ["Next.js", "React", "TypeScript", "Prisma", "Tailwind"];
        for (const name of tags) {
            await prisma.courseTag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }

        // 4. Course with Hierarchy
        console.log("Seeding course...");
        await prisma.course.create({
            data: {
                userId: admin.id,
                title: "Ultimate Next.js Course",
                description: "Learn everything about Next.js from scratch to advanced topics using the latest App Router.",
                price: 49.99,
                categoryId: csCategory?.id,
                isPublished: true,
                isActive: true,
                level: "Beginner",
                lessons: {
                    create: [
                        {
                            title: "Introduction",
                            position: 1,
                            isPublished: true,
                            progressionRules: ["COMPLETED_PREVIOUS"],
                            topics: {
                                create: [
                                    {
                                        title: "Overview",
                                        position: 1,
                                        type: "VIDEO",
                                        isPublished: true,
                                        content: "What is Next.js?",
                                        videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
                                    },
                                    {
                                        title: "Installation",
                                        position: 2,
                                        type: "TEXT",
                                        isPublished: true,
                                        content: "Run `npx create-next-app@latest` to get started.",
                                    }
                                ]
                            }
                        },
                        {
                            title: "Foundations",
                            position: 2,
                            isPublished: true,
                            topics: {
                                create: [
                                    {
                                        title: "Routing",
                                        position: 1,
                                        type: "VIDEO",
                                        isPublished: true,
                                        content: "How app router works.",
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        });

        console.log("Seeding finished successfully!");
        console.log(`Test Admin: admin@test.com / password123`);
    } catch (error) {
        console.error("Error during seeding:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    });
