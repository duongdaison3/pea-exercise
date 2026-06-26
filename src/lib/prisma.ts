import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

if (process.env.NODE_ENV !== 'production') {
  // Clear the cache to force a new Prisma Client instance after schema changes
  globalForPrisma.prisma = undefined as any
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

