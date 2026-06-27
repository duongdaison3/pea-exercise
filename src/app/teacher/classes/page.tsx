import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Settings } from "lucide-react"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { CreateClassDialog } from './create-class-dialog'

export default async function TeacherClassesPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const classes = await prisma.class.findMany({
    where: { teacherId: session.userId },
    include: {
      _count: {
        select: { enrollments: true, modules: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lớp học của tôi</h2>
          <p className="text-slate-500 mt-2">Quản lý các lớp học do bạn phụ trách.</p>
        </div>
        <CreateClassDialog />
      </div>

      {classes.length === 0 ? (
        <Card className="p-8 text-center border-dashed bg-transparent shadow-none">
          <p className="text-slate-500">Bạn chưa có lớp học nào.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => (
            <Card key={c.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-slate-900 leading-tight">{c.name}</CardTitle>
                    <CardDescription className="line-clamp-2 leading-relaxed">{c.description || "Không có mô tả"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 flex flex-col justify-between gap-6">
                <div className="flex justify-between text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-md">
                  <span>{c._count.enrollments} Học viên</span>
                  <span>{c._count.modules} Modules</span>
                </div>
                <Button render={<Link href={`/teacher/classes/${c.id}`} />} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Quản lý lớp học
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
