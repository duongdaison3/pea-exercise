import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StudentsClient } from './students-client'

export default async function TeacherStudentsPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  
  if (!session) redirect('/login')

  const students = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      createdById: session.userId
    },
    include: {
      enrollments: {
        include: { class: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Học viên</h2>
          <p className="text-slate-500 mt-2">Danh sách các học viên do bạn quản lý.</p>
        </div>
      </div>

      <StudentsClient initialStudents={students} />
    </div>
  )
}
