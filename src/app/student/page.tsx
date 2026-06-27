import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, LogIn } from "lucide-react";
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const student = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!student) redirect('/login')

  // Fetch danh sách lớp học mà học viên đã đăng ký
  const classes = await prisma.class.findMany({
    where: {
      enrollments: {
        some: {
          studentId: student.id
        }
      }
    },
    include: {
      _count: {
        select: { modules: true }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Chào mừng trở lại, {student.name}!</h2>
        <p className="text-slate-500 mt-2">Dưới đây là các lớp học bạn đang tham gia.</p>
      </div>

      {classes.length === 0 ? (
        <Card className="p-8 text-center border-dashed bg-transparent shadow-none">
          <p className="text-slate-500">Bạn chưa tham gia lớp học nào.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => (
            <Card key={c.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-slate-900 leading-tight">{c.name}</CardTitle>
                    <CardDescription className="text-slate-500 leading-relaxed line-clamp-2">{c.description || "Không có mô tả"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 flex flex-col justify-between gap-6 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {c._count.modules} Modules
                  </span>
                </div>
                <Button render={<Link href={`/student/classes/${c.id}`} />} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow">
                  <LogIn className="w-4 h-4 mr-2" />
                  Vào lớp học
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
