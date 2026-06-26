'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function StudentDetailDialog({ 
  open, 
  onOpenChange, 
  student 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  student: any
}) {
  if (!student) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Đang học</Badge>
      case 'INACTIVE': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">Không hoạt động</Badge>
      case 'SUSPENDED': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Đình chỉ</Badge>
      case 'DROPPED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Nghỉ học</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-50 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-800">Hồ sơ Học viên</DialogTitle>
          <DialogDescription>
            Chi tiết thông tin đăng ký và quá trình học tập.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-100 mt-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Họ và tên</p>
              <p className="text-lg font-semibold text-slate-900">{student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="text-base text-slate-800">{student.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Mã ID Học viên</p>
              <p className="text-sm font-mono text-slate-500">{student.id}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Trạng thái</p>
              <div className="mt-1">{getStatusBadge(student.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Số điện thoại</p>
              <p className="text-base text-slate-800">{student.phone || <span className="text-slate-400 italic">Chưa cập nhật</span>}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ngày đăng ký</p>
              <p className="text-base text-slate-800">
                {student.createdAt ? format(new Date(student.createdAt), "dd MMMM, yyyy", { locale: vi }) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-5 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-3">Các lớp đang tham gia</h3>
          {student.enrollments && student.enrollments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {student.enrollments.map((e: any) => (
                <div key={e.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                  {e.class.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Chưa tham gia lớp học nào.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
