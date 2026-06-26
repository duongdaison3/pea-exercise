import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export default async function AdminDashboard() {
  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } })
  const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } })
  
  const totalTestAttempts = await prisma.testAttempt.count()
  const passingAttempts = await prisma.testAttempt.count({ where: { isPassed: true } })
  const inProgressTests = await prisma.testAttempt.count({ where: { status: 'IN_PROGRESS' } })
  const completedTests = await prisma.testAttempt.count({ where: { status: 'COMPLETED' } })

  const topStudents = await prisma.testAttempt.groupBy({
    by: ['studentId'],
    _sum: {
      totalScore: true,
    },
    orderBy: {
      _sum: {
        totalScore: 'desc',
      },
    },
    take: 5,
  })

  const studentIds = topStudents.map((t: any) => t.studentId as string)
  const users = await prisma.user.findMany({
    where: { id: { in: studentIds } },
  })

  const leaderboard = topStudents.map((t: any) => {
    const user = users.find((u: any) => u.id === t.studentId)
    return {
      id: user?.id || t.studentId,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      score: t._sum.totalScore || 0,
    }
  })

  const stats = {
    totalStudents: totalTestAttempts, // using this for "Tổng lượt thi" in UI
    totalTeachers,
    passingStudents: passingAttempts, // using this for "Lượt thi đạt"
    inProgressTests,
    completedTests,
  }

  // To display the actual user count in the donut chart, we override these back to real users 
  // Wait, the UI uses stats.totalStudents for both "Tổng lượt thi" and "Học viên (số lượng)"
  // Let's pass a separate object to dashboard-client so we don't mix concepts.
  // Wait, I will just fix dashboard-client.tsx to accept `totalUsers`, `totalTestAttempts` etc.
  
  return (
    <DashboardClient 
      stats={{
        totalStudents,
        totalTeachers,
        passingStudents: passingAttempts,
        inProgressTests,
        completedTests,
        totalTestAttempts
      }} 
      leaderboard={leaderboard} 
    />
  )
}
