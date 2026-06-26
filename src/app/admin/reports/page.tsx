import { prisma } from '@/lib/prisma'
import { ReportsClient, ReportAttempt } from '@/components/reports/reports-client'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminReportsPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string, role: string } | null
  
  if (!session || session.role !== 'ADMIN') redirect('/login')

  // Fetch all completed test attempts
  const attemptsData = await prisma.testAttempt.findMany({
    where: { status: 'COMPLETED' },
    include: {
      student: { select: { id: true, name: true } },
      module: { 
        select: { 
          title: true,
          class: { select: { id: true, name: true } }
        } 
      }
    },
    orderBy: { endTime: 'desc' }
  })

  // Format data for client
  const attempts: ReportAttempt[] = attemptsData.map(a => ({
    id: a.id,
    studentId: a.student.id,
    studentName: a.student.name,
    className: a.module.class.name,
    classId: a.module.class.id,
    moduleTitle: a.module.title,
    totalScore: a.totalScore ?? 0,
    isPassed: a.isPassed,
    endTime: a.endTime?.toISOString() || new Date().toISOString()
  }))

  // Extract unique classes for filter dropdown
  const classesMap = new Map()
  attemptsData.forEach(a => {
    if (!classesMap.has(a.module.class.id)) {
      classesMap.set(a.module.class.id, {
        id: a.module.class.id,
        name: a.module.class.name
      })
    }
  })
  const classes = Array.from(classesMap.values())

  return (
    <ReportsClient 
      attempts={attempts} 
      classes={classes} 
      title="Báo cáo Hệ thống"
      description="Xem điểm số và xuất báo cáo học tập của toàn bộ hệ thống."
    />
  )
}
