import { ModuleForm } from "@/components/forms/module-form"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export default async function EditModuleTeacherPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: moduleId } = await params
  
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'TEACHER') redirect('/login')

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    select: { id: true, name: true }
  })

  const moduleData = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          questions: {
            orderBy: { id: 'asc' } // Questions don't have orderIndex currently, fallback to id
          }
        }
      }
    }
  })

  if (!moduleData) notFound()

  // Verify ownership
  const classData = await prisma.class.findUnique({ where: { id: moduleData.classId } })
  if (classData?.teacherId !== user.id) redirect('/teacher/classes')

  // Map data to form format
  const mappedData = {
    id: moduleData.id,
    title: moduleData.title,
    description: moduleData.description || "",
    classId: moduleData.classId,
    timeLimit: moduleData.timeLimit ? moduleData.timeLimit / 60 : 60, // convert seconds to minutes
    passingScore: moduleData.passingScore,
    scoringMode: moduleData.scoringMode,
    totalScore: moduleData.totalScore,
    deadlineDate: moduleData.deadline ? new Date(moduleData.deadline) : new Date(),
    deadlineTime: moduleData.deadline ? new Date(moduleData.deadline).toISOString().substring(11, 16) : "23:59",
    sections: moduleData.sections.map(sec => ({
      id: sec.id,
      title: sec.title,
      timeLimit: sec.timeLimit,
      questions: sec.questions.map(q => {
        let contentObj = {}
        try {
          contentObj = JSON.parse(q.content)
        } catch (e) {
          console.error("Error parsing question content", e)
        }

        // Handle paragraphs for specific question types if they were stored as flat array of strings
        if (contentObj && Array.isArray((contentObj as any).paragraphs)) {
            (contentObj as any).paragraphs = (contentObj as any).paragraphs.map((p: string) => ({ value: p }))
        }

        return {
          id: q.id,
          type: q.type,
          instruction: q.instruction,
          score: q.score || 0,
          ...contentObj
        }
      })
    }))
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chỉnh sửa Bài Test</h1>
        <p className="text-slate-500 mt-2 text-lg">Bạn đang chỉnh sửa cấu trúc của bài kiểm tra "{moduleData.title}".</p>
      </div>

      <ModuleForm classes={classes} initialData={mappedData} />
    </div>
  )
}
