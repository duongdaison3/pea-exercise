import { prisma } from '@/lib/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { StudentsTab } from './students-tab'
import { ClassModulesList } from './class-modules-list'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  
  const classInfo = await prisma.class.findUnique({
    where: { id, teacherId: session?.userId },
    include: {
      enrollments: {
        include: { student: true }
      },
      modules: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  })

  if (!classInfo) notFound()

  // Lấy các học viên do giáo viên này tạo nhưng CHƯA tham gia lớp này
  const availableStudents = await prisma.user.findMany({
    where: { 
      role: 'STUDENT', 
      createdById: session?.userId,
      enrollments: { none: { classId: id } }
    }
  })

  const totalStudents = classInfo.enrollments.length

  // Build module stats
  const moduleStatsPromises = classInfo.modules.map(async (mod) => {
    // Unique students who have submitted at least one answer in this module
    const uniqueStudentsSubmitted = await prisma.studentAnswer.findMany({
      where: {
        question: { moduleId: mod.id }
      },
      distinct: ['studentId'],
      select: { studentId: true }
    })

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      timeLimit: mod.timeLimit,
      deadline: mod.deadline ? mod.deadline.toISOString() : null,
      isPublished: mod.isPublished,
      totalStudents,
      submittedStudents: uniqueStudentsSubmitted.length
    }
  })

  const moduleStats = await Promise.all(moduleStatsPromises)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/teacher/classes" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại Lớp học
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{classInfo.name}</h2>
        <p className="text-slate-500 mt-2">{classInfo.description}</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students">Học viên ({classInfo.enrollments.length})</TabsTrigger>
          <TabsTrigger value="modules">Chương trình học ({classInfo.modules.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="pt-4">
          <StudentsTab classId={id} enrollments={classInfo.enrollments} availableStudents={availableStudents} />
        </TabsContent>
        <TabsContent value="modules" className="pt-4">
          <ClassModulesList classId={id} modules={moduleStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
