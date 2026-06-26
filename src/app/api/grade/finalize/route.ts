import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie) as { userId: string, role: string } | null
    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentAnswerId, teacherScore, teacherFeedback } = await req.json()
    if (!studentAnswerId) return NextResponse.json({ error: "Missing studentAnswerId" }, { status: 400 })

    const answer = await prisma.studentAnswer.findUnique({
      where: { id: studentAnswerId },
      include: {
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

    if (!answer) return NextResponse.json({ error: "Answer not found" }, { status: 404 })

    // If teacher, check if this answer belongs to a class they teach
    if (session.role === 'TEACHER' && answer.question.module.class.teacherId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.studentAnswer.update({
      where: { id: studentAnswerId },
      data: {
        teacherScore: Number(teacherScore),
        teacherFeedback: teacherFeedback || null,
        finalScore: Number(teacherScore), // Final score is always determined by teacher
        status: 'COMPLETED'
      }
    })

    // Mở rộng: Kiểm tra xem học viên này đã được duyệt hết tất cả câu hỏi trong Module chưa
    const allModuleAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentId: answer.studentId,
        question: { moduleId: answer.question.moduleId }
      }
    })

    const allCompleted = allModuleAnswers.every(ans => ans.status === 'COMPLETED')
    let totalScore = 0

    if (allCompleted) {
      totalScore = allModuleAnswers.reduce((sum, ans) => sum + (ans.finalScore || 0), 0)
      console.log(`Học viên ${answer.studentId} đã hoàn thành toàn bộ bài thi ${answer.question.moduleId}. Tổng điểm: ${totalScore}`)
      // Trong tương lai nếu có bảng StudentModuleResult thì sẽ lưu vào đây
    }

    return NextResponse.json({ 
      success: true, 
      message: "Graded successfully.", 
      allCompleted, 
      totalScore: allCompleted ? totalScore : null 
    })

  } catch (error) {
    console.error("Finalize Grade API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
