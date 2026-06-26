import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import { GradingDataTable } from "./data-table"


export const metadata = {
  title: 'Chấm bài | PTE Admin',
}

export default async function GradingOverviewPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string, role: string } | null
  if (!session) redirect('/login')

  if (session.role === 'STUDENT') {
    redirect('/student')
  }

  // Fetch pending and completed answers
  const whereClause: any = {
    status: {
      in: ['PENDING_TEACHER_REVIEW', 'COMPLETED', 'AI_GRADED']
    }
  }

  // If TEACHER, only see answers from their classes
  if (session.role === 'TEACHER') {
    whereClause.question = {
      module: {
        class: {
          teacherId: session.userId
        }
      }
    }
  }

  const pendingAnswers = await prisma.studentAnswer.findMany({
    where: whereClause,
    include: {
      student: {
        select: { name: true, email: true }
      },
      question: {
        include: {
          module: {
            select: { title: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for the data table
  const formattedData = pendingAnswers.map(ans => ({
    id: ans.id,
    studentName: ans.student.name,
    studentEmail: ans.student.email,
    moduleTitle: ans.question.module.title,
    questionType: ans.question.type,
    aiScore: ans.aiScore,
    teacherScore: ans.teacherScore,
    maxScore: ans.question.score || 0,
    status: ans.status,
    createdAt: ans.createdAt.toISOString()
  }))

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tổng quan Chấm bài</h1>
        <p className="text-slate-500 mt-1">Danh sách các câu hỏi tự luận và bài nói đang chờ giáo viên duyệt điểm.</p>
      </div>

      <GradingDataTable data={formattedData} />
    </div>
  )
}
