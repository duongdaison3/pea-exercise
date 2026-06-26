import { prisma } from '@/lib/prisma'
import { AdminUsersClient } from './users-client'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      enrollments: {
        include: { class: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Tài khoản</h2>
          <p className="text-slate-500 mt-2">Xem danh sách và thêm mới người dùng trong hệ thống.</p>
        </div>
      </div>

      <AdminUsersClient initialUsers={users} />
    </div>
  )
}
