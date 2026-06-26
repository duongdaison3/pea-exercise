import { prisma } from '@/lib/prisma'
import { ClassesClient } from './classes-client'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminClassesPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string, role: string } | null
  
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const classes = await prisma.class.findMany({
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: {
        select: { enrollments: true, modules: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  })

  return <ClassesClient initialClasses={classes} teachers={teachers} />
}
