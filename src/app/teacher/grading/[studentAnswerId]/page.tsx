import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import { GradingDetailClient } from "./grading-detail-client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: 'Chi tiết bài làm | PTE Admin',
}

export default async function GradingDetailPage({ params }: { params: Promise<{ studentAnswerId: string }> }) {
  const { studentAnswerId } = await params
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string, role: string } | null
  if (!session || session.role === 'STUDENT') redirect('/login')

  const answer = await prisma.studentAnswer.findUnique({
    where: { id: studentAnswerId },
    include: {
      student: { select: { name: true, email: true } },
      question: {
        include: {
          module: {
            include: {
              class: true
            }
          }
        }
      }
    }
  })

  if (!answer) {
    return (
      <div className="p-10 text-center text-slate-500">
        Không tìm thấy bài làm này. <Link href="/teacher/grading" className="text-blue-600 underline">Quay lại</Link>
      </div>
    )
  }

  // Security check: Only ADMIN or the teacher of this class can view
  if (session.role === 'TEACHER' && answer.question.module.class.teacherId !== session.userId) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Bạn không có quyền truy cập bài làm của lớp học này.
      </div>
    )
  }

  // Parse JSON content securely
  const content = answer.question.content ? JSON.parse(answer.question.content) : {}
  let parsedResponse = answer.textResponse
  try {
    if (answer.textResponse && (answer.textResponse.startsWith('{') || answer.textResponse.startsWith('['))) {
      parsedResponse = JSON.parse(answer.textResponse)
    }
  } catch (e) {
    // Keep it as string
  }

  const detailData = {
    id: answer.id,
    studentName: answer.student.name,
    studentEmail: answer.student.email,
    moduleTitle: answer.question.module.title,
    questionType: answer.question.type,
    instruction: answer.question.instruction,
    content: content,
    audioUrl: answer.audioUrl,
    textResponse: answer.textResponse, // original raw string
    parsedResponse: parsedResponse,    // array/object if parsed
    aiScore: answer.aiScore,
    aiFeedback: answer.aiFeedback,
    teacherScore: answer.teacherScore,
    teacherFeedback: answer.teacherFeedback,
    maxScore: answer.question.score || 0,
    status: answer.status
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4">
      <Link href="/teacher/grading" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 font-medium mb-2 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
      </Link>
      <GradingDetailClient answerData={detailData} />
    </div>
  )
}
