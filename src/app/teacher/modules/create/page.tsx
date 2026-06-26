import { ModuleForm } from "@/components/forms/module-form"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateModuleTeacherPage({
  searchParams
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const { classId } = await searchParams
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'TEACHER') redirect('/login')

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    select: { id: true, name: true }
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo Bài Test (Module)</h1>
        <p className="text-slate-500 mt-2 text-lg">Thiết lập cấu hình bài kiểm tra và giao bài cho các lớp học của bạn.</p>
      </div>

      <ModuleForm classes={classes} defaultClassId={classId} />
    </div>
  )
}
