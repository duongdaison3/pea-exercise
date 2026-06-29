import 'dotenv/config'
import { prisma } from './src/lib/prisma'

async function main() {
  const moduleData = await prisma.module.findUnique({
    where: { id: 'cmqvrwllm000004js4et069n1' },
    include: { sections: { include: { questions: { orderBy: { id: 'asc' } } } } }
  });
  console.log(JSON.stringify(moduleData, null, 2));
}
main().catch(console.error).finally(() => process.exit(0));
