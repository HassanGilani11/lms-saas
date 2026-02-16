import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const result = await prisma.$queryRaw`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enum_typid = pg_type.oid WHERE typname = 'QuestionType'`
    console.log('QuestionType enum values in DB:', result)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
