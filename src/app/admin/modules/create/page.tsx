import { ModuleForm } from "@/components/forms/module-form"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateModuleAdminPage() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const classesRaw = await prisma.class.findMany({
    include: { teacher: true }
  })

  const classes = classesRaw.map((c: { id: string; name: string; teacher: { name: string } }) => ({
    id: c.id,
    name: `${c.name} (GV: ${c.teacher.name})`
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo Bài Test - Toàn Hệ Thống</h1>
        <p className="text-slate-500 mt-2 text-lg">Quản trị viên có thể tạo bài test và giao cho bất kỳ lớp học nào.</p>
      </div>

      <ModuleForm classes={classes} />
    </div>
  )
}
