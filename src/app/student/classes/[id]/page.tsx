import { Prisma } from '@prisma/client'
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayCircle, ChevronLeft } from "lucide-react";
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { notFound, redirect } from "next/navigation";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default async function StudentClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  // Kiểm tra học viên có thuộc lớp này không
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: session.userId, classId: id } }
  })
  if (!enrollment) notFound()

  const classInfo: Prisma.ClassGetPayload<{
    include: {
      modules: true
    }
  }> | null = await prisma.class.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!classInfo) notFound()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/student" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{classInfo.name}</h2>
        <p className="text-slate-500 mt-2">{classInfo.description || "Lớp học chưa có mô tả."}</p>
      </div>

      <Card className="shadow-sm border-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl">Chương trình học</CardTitle>
          <CardDescription>Các module bài tập và bài kiểm tra của lớp</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {classInfo.modules.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">Lớp học này chưa có module nào.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {classInfo.modules.map((module: any) => (
                <li key={module.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                        Module {module.orderIndex}
                      </Badge>
                      <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{module.title}</span>
                    </div>
                  </div>
                  <Button render={<Link href={`/student/modules/${module.id}`} />} size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
