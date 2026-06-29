const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const qs = await prisma.question.findMany({
    where: { type: 'DESCRIBE_IMAGE' },
    orderBy: { id: 'desc' },
    take: 1
  })
  console.log("DESCRIBE_IMAGE:")
  qs.forEach(q => console.log(q.content))

  const qs2 = await prisma.question.findMany({
    where: { type: 'REPEAT_SENTENCE' },
    orderBy: { id: 'desc' },
    take: 1
  })
  console.log("REPEAT_SENTENCE:")
  qs2.forEach(q => console.log(q.content))
}

main().catch(console.error).finally(() => prisma.$disconnect())
