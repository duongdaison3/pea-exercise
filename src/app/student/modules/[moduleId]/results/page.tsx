import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, Clock, Bot, UserCheck, Star, BrainCircuit } from "lucide-react"

export const metadata = {
  title: 'Kết quả bài thi | PTE Student',
}

export default async function StudentResultsPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string, role: string } | null
  if (!session || session.role !== 'STUDENT') redirect('/login')

  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
  })

  if (!moduleData) {
    return (
      <div className="p-10 text-center text-slate-500">
        Không tìm thấy bài thi này.
      </div>
    )
  }

  const answers = await prisma.studentAnswer.findMany({
    where: {
      studentId: session.userId,
      question: { moduleId: moduleId }
    },
    include: {
      question: true
    },
    orderBy: {
      createdAt: 'asc' // Hoặc order theo index nếu có
    }
  })

  if (answers.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        Bạn chưa hoàn thành bài thi này hoặc chưa có kết quả.
      </div>
    )
  }

  // Determine overall status
  const hasPendingReview = answers.some((ans: any) => ans.status === 'PENDING_TEACHER_REVIEW' || ans.status === 'AI_GRADED' || ans.status === 'SUBMITTED')
  const overallStatus = hasPendingReview ? 'PENDING' : 'COMPLETED'

  // Calculate scores
  let totalAchievedScore = 0
  let totalMaxScore = 0

  const detailedResults = answers.map((ans: any, index: number) => {
    const maxScore = ans.question.score || 0
    totalMaxScore += maxScore
    
    // Nếu giáo viên đã chấm (COMPLETED), lấy finalScore hoặc teacherScore. Nếu chưa, lấy aiScore làm điểm tạm.
    const achievedScore = (ans.status === 'COMPLETED' ? ans.finalScore : ans.aiScore) || 0
    totalAchievedScore += achievedScore

    const content = ans.question.content ? JSON.parse(ans.question.content) : {}

    return {
      index: index + 1,
      type: ans.question.type,
      instruction: ans.question.instruction,
      content,
      studentResponse: ans.textResponse || (ans.audioUrl ? '[Đã gửi file ghi âm]' : '[Không có câu trả lời]'),
      achievedScore,
      maxScore,
      aiFeedback: ans.aiFeedback,
      teacherFeedback: ans.teacherFeedback,
      status: ans.status
    }
  })

  const scorePercentage = totalMaxScore > 0 ? Math.round((totalAchievedScore / totalMaxScore) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1000px] mx-auto p-6 lg:p-10">
          <Link href="/student" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Về trang chủ
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{moduleData.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                {overallStatus === 'COMPLETED' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Giáo viên đã duyệt điểm
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200">
                    <Clock className="w-4 h-4 mr-1.5 animate-pulse" /> Điểm dự kiến (Chờ duyệt)
                  </span>
                )}
                <span className="text-sm font-medium text-slate-500">Gồm {answers.length} câu hỏi</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center gap-6 shadow-sm min-w-[200px]">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={overallStatus === 'COMPLETED' ? "text-green-500" : "text-blue-500"}
                    strokeDasharray={`${scorePercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-slate-800">{scorePercentage}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Tổng điểm</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black ${overallStatus === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>
                    {totalAchievedScore}
                  </span>
                  <span className="text-lg font-bold text-slate-400">/ {totalMaxScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="max-w-[1000px] mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">Chi tiết bài làm & Nhận xét</h2>
        </div>

        <div className="space-y-6">
          {detailedResults.map((res: any) => {
            const isCompleted = res.status === 'COMPLETED'
            
            return (
              <div key={res.index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header câu hỏi */}
                <div className="p-5 bg-slate-50/50 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                      {res.index}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{res.type.replace(/_/g, ' ')}</h3>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border flex items-baseline gap-1 shadow-sm font-bold ${isCompleted ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <span className="text-sm">Điểm:</span>
                    <span className="text-lg">{res.achievedScore}</span>
                    <span className="text-sm text-slate-400">/ {res.maxScore}</span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cột trái: Đề bài & Bài làm */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yêu cầu đề</h4>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{res.instruction}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Câu trả lời của bạn</h4>
                      <div className="text-sm font-medium text-slate-800 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 whitespace-pre-wrap">
                        {res.studentResponse}
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Feedback */}
                  <div className="space-y-4">
                    {/* Luôn hiển thị AI Feedback nếu có */}
                    {res.aiFeedback && (
                      <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 h-full flex flex-col relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
                          <BrainCircuit className="w-24 h-24 text-purple-900" />
                        </div>
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <Bot className="w-4 h-4 text-purple-600" />
                          <h4 className="text-sm font-bold text-purple-800">AI Assistant nhận xét</h4>
                        </div>
                        <p className="text-sm text-purple-900/80 leading-relaxed font-medium relative z-10 whitespace-pre-wrap">
                          {res.aiFeedback}
                        </p>
                      </div>
                    )}

                    {/* Hiển thị Teacher Feedback nếu có */}
                    {res.teacherFeedback && (
                      <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 mt-4 h-full flex flex-col relative overflow-hidden">
                         <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
                          <UserCheck className="w-24 h-24 text-emerald-900" />
                        </div>
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-sm font-bold text-emerald-800">Giáo viên nhận xét</h4>
                        </div>
                        <p className="text-sm text-emerald-900/80 leading-relaxed font-medium relative z-10 whitespace-pre-wrap">
                          {res.teacherFeedback}
                        </p>
                      </div>
                    )}

                    {/* Nếu chưa có teacher feedback nhưng AI đã chấm */}
                    {!isCompleted && !res.teacherFeedback && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed text-center mt-4">
                        <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" /> Giáo viên chưa duyệt câu này
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
