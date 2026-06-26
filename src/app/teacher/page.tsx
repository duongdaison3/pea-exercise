import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeacherDashboardClient } from "./teacher-dashboard-client"

export default async function TeacherPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const teacherId = session.userId

  // 1. Total Students in teacher's classes (distinct count)
  const enrollments = await prisma.enrollment.findMany({
    where: { class: { teacherId } },
    select: { studentId: true }
  })
  const totalStudents = new Set(enrollments.map(e => e.studentId)).size

  // 2. Total Classes
  const totalClasses = await prisma.class.count({
    where: { teacherId }
  })

  // 3. Pending Grading
  const pendingGrading = await prisma.studentAnswer.count({
    where: {
      question: { module: { class: { teacherId } } },
      status: 'PENDING_TEACHER_REVIEW'
    }
  })

  // 4. Classes Progress (Option 1: published modules / total modules)
  const classesData = await prisma.class.findMany({
    where: { teacherId },
    include: {
      modules: true
    }
  })

  const classesProgress = classesData.map(c => {
    const totalModules = c.modules.length
    const publishedModules = c.modules.filter(m => m.isPublished).length
    return {
      id: c.id,
      name: c.name,
      totalModules,
      publishedModules
    }
  })

  // 5. Recent Activity (students who submitted modules in last 24h)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentSubmissionsData = await prisma.testAttempt.findMany({
    where: {
      module: { class: { teacherId } },
      status: 'COMPLETED',
      endTime: { gte: yesterday }
    },
    include: {
      student: true,
      module: { include: { class: true } }
    },
    orderBy: { endTime: 'desc' },
    take: 10
  })

  const recentSubmissions = recentSubmissionsData.map(ts => ({
    id: ts.id,
    studentName: ts.student.name,
    studentEmail: ts.student.email,
    moduleTitle: ts.module.title,
    className: ts.module.class.name,
    endTime: ts.endTime?.toISOString() || ts.startTime.toISOString(),
    score: ts.totalScore
  }))

  return (
    <TeacherDashboardClient 
      totalStudents={totalStudents}
      totalClasses={totalClasses}
      pendingGrading={pendingGrading}
      classesProgress={classesProgress}
      recentSubmissions={recentSubmissions}
    />
  )
}
