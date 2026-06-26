import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FeedbackDialog } from "./feedback-dialog"

export default async function StudentScoresPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const answers = await prisma.studentAnswer.findMany({
    where: { studentId: session.userId },
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
    },
    orderBy: { id: 'desc' }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bảng điểm & Kết quả</h2>
        <p className="text-slate-500 mt-2">Theo dõi tiến độ làm bài và xem nhận xét từ Giáo viên.</p>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Lớp học / Module</TableHead>
              <TableHead>Dạng bài</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Điểm số</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-slate-500">
                  Bạn chưa có kết quả bài làm nào.
                </TableCell>
              </TableRow>
            ) : answers.map((ans) => {
              const statusMap: Record<string, { label: string, color: string }> = {
                SUBMITTED: { label: 'Đã nộp', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                AI_GRADED: { label: 'AI đã chấm', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                PENDING_TEACHER_REVIEW: { label: 'Chờ GV chấm', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
                COMPLETED: { label: 'Đã có điểm', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
              }
              const st = statusMap[ans.status] || { label: ans.status, color: 'bg-slate-100 text-slate-700' }

              return (
                <TableRow key={ans.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{ans.question.module.class.name}</div>
                    <div className="text-sm text-slate-500">{ans.question.module.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{ans.question.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${st.color} border-none shadow-none`}>{st.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {ans.finalScore !== null ? <span className="text-lg">{ans.finalScore} / 10</span> : <span className="text-slate-400">--</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {ans.status === 'COMPLETED' ? (
                      <FeedbackDialog 
                        teacherScore={ans.teacherScore} 
                        teacherFeedback={ans.teacherFeedback} 
                        aiScore={ans.aiScore}
                        aiFeedback={ans.aiFeedback}
                      />
                    ) : (
                      <span className="text-sm text-slate-400 italic">Chưa có nhận xét</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
