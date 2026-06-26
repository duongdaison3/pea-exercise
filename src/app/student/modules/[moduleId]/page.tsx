import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, CheckCircle2, AlertCircle, FileText, Target } from "lucide-react"

export default async function StudentModuleIntroPage(props: { params: Promise<{ moduleId: string }> }) {
  const params = await props.params;
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  
  if (!session) redirect('/login')

  const moduleData = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })

  if (!moduleData) redirect('/student')

  // Check if student has already completed or submitted answers for this module
  const existingAnswer = await prisma.studentAnswer.findFirst({
    where: {
      studentId: session.userId,
      question: {
        moduleId: params.moduleId
      },
      status: {
        in: ['SUBMITTED', 'AI_GRADED', 'COMPLETED', 'PENDING_TEACHER_REVIEW']
      }
    }
  })

  const isCompleted = !!existingAnswer
  const isExpired = moduleData.deadline ? new Date() > new Date(moduleData.deadline) : false

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/student/classes/${moduleData.classId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-6 inline-block">
          &larr; Quay lại danh sách lớp
        </Link>
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
             <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <CardHeader className="relative -mt-16 bg-white mx-6 rounded-t-xl px-8 pt-8 pb-4 shadow-sm border-b">
            <div className="flex items-center space-x-3 text-sm text-blue-600 font-medium mb-3">
              <span className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Bài Kiểm Tra / Luyện Tập</span>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800 leading-tight">{moduleData.title}</CardTitle>
            {moduleData.description && (
              <CardDescription className="text-slate-500 mt-4 text-base whitespace-pre-wrap leading-relaxed">
                {moduleData.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                <div className="bg-blue-100 p-3 rounded-lg mr-4 shrink-0">
                  <Clock className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Thời gian</p>
                  <p className="text-base font-bold text-slate-800">{moduleData.timeLimit > 0 ? `${Math.floor(moduleData.timeLimit / 60)} phút` : "Không giới hạn"}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4 shrink-0">
                  <FileText className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Số câu hỏi</p>
                  <p className="text-base font-bold text-slate-800">{moduleData._count.questions} câu</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                <div className="bg-emerald-100 p-3 rounded-lg mr-4 shrink-0">
                  <Target className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Điểm đạt</p>
                  <p className="text-base font-bold text-slate-800">{moduleData.passingScore} / {moduleData.totalScore}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                <div className="bg-rose-100 p-3 rounded-lg mr-4 shrink-0">
                  <Calendar className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Hạn nộp</p>
                  <p className="text-base font-bold text-slate-800">{moduleData.deadline ? new Date(moduleData.deadline).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : "Không giới hạn"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/80 p-8 border-t flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="text-center w-full max-w-md">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-full mb-5 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Bạn đã hoàn thành bài thi này</h3>
                <p className="text-slate-500 mb-8 text-sm">Kết quả của bạn đã được ghi nhận vào hệ thống. Bạn có thể xem lại đáp án và nhận xét từ giáo viên.</p>
                <Link href={`/student/modules/${params.moduleId}/results`} className="w-full inline-flex justify-center items-center px-8 py-3.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 rounded-xl font-bold transition-all shadow-sm">
                  Xem kết quả chi tiết
                </Link>
              </div>
            ) : isExpired ? (
              <div className="text-center w-full max-w-md">
                <div className="inline-flex items-center justify-center p-4 bg-rose-100 text-rose-600 rounded-full mb-5 shadow-inner">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Bài tập đã quá hạn</h3>
                <p className="text-slate-500 mb-8 text-sm">Bạn không thể bắt đầu làm bài vì đã vượt quá thời gian cho phép. Vui lòng liên hệ giáo viên nếu cần hỗ trợ.</p>
                <Link href={`/student/classes/${moduleData.classId}`} className="w-full inline-flex justify-center items-center px-8 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-all">
                  Quay lại lớp học
                </Link>
              </div>
            ) : (
              <div className="text-center w-full max-w-md">
                <p className="text-slate-500 mb-6 text-sm">Đảm bảo kết nối mạng ổn định và không gian yên tĩnh trước khi bắt đầu.</p>
                <Link href={`/student/modules/${params.moduleId}/take`} className="w-full inline-flex justify-center items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  Bắt đầu làm bài
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
