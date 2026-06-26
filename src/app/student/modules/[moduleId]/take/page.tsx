import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation"
import { TestEngineClient } from "./test-engine-client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function TakeModulePage(props: { params: Promise<{ moduleId: string }> }) {
  const params = await props.params;
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const moduleData = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      class: true,
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          questions: {
            orderBy: { id: 'asc' }
          }
        }
      }
    }
  })

  if (!moduleData) redirect('/student')

  // Nếu bài test không chia section (câu hỏi được gán thẳng vào module mà không có sectionId)
  // Thực tế kiến trúc hiện tại luôn tạo section (mặc định là Phần 1).
  
  // Sanitize questions: strip correctAnswer
  const sanitizedSections = moduleData.sections.map((section: any) => ({
    ...section,
    questions: section.questions.map((q: any) => {
      let contentObj = {}
      try {
        contentObj = JSON.parse(q.content)
        // Remove correct answer if exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((contentObj as any).correctAnswer !== undefined) delete (contentObj as any).correctAnswer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((contentObj as any).answers !== undefined) {
           // For FIB, answers might contain the correct texts. If they do, we must strip the correct text but keep the blanks length or id.
           // However, removing it might break the QuestionRenderer if it expects them. We'll strip what we can.
           // Actually, `correctAnswer` is usually the one containing the correct response.
        }
      } catch (e) {
        // invalid JSON
      }
      return {
        ...q,
        content: JSON.stringify(contentObj)
      }
    })
  }))

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 sm:px-8">
        <Link 
          href={`/student/modules/${params.moduleId}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Quay lại trang thông tin
        </Link>
      </div>
      
      <div className="flex-1">
        <TestEngineClient moduleData={moduleData} sections={sanitizedSections} />
      </div>
    </div>
  )
}
