'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Loader2, Trash2 } from "lucide-react"
import { updateClass, deleteClass } from './actions'

export function EditClassDialog({ classData, teachers }: { classData: any, teachers: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      teacherId: formData.get('teacherId') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      maxStudents: formData.get('maxStudents') ? parseInt(formData.get('maxStudents') as string) : undefined,
      status: formData.get('status') as string,
    }

    const res = await updateClass(classData.id, data)
    setIsLoading(false)

    if (res.error) {
      alert(res.error)
    } else {
      setOpen(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác và sẽ thất bại nếu lớp học đang có dữ liệu.')) {
      return
    }
    
    setIsDeleting(true)
    const res = await deleteClass(classData.id)
    setIsDeleting(false)

    if (res.error) {
      alert(res.error)
    } else {
      setOpen(false)
    }
  }

  const startDateStr = classData.startDate ? new Date(classData.startDate).toISOString().split('T')[0] : ''
  const endDateStr = classData.endDate ? new Date(classData.endDate).toISOString().split('T')[0] : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2 text-slate-600 hover:text-slate-900">
          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin của lớp học.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp học <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" required defaultValue={classData.name} placeholder="VD: Lớp luyện thi IELTS K1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId">Giáo viên phụ trách <span className="text-red-500">*</span></Label>
              <Select name="teacherId" required defaultValue={classData.teacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giáo viên...">
                    {(val: any) => {
                      if (!val || val === '') return "Chọn giáo viên..."
                      const selected = teachers.find((t: any) => t.id === val)
                      return selected ? `${selected.name} (${selected.email})` : "Chọn giáo viên..."
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea id="description" name="description" defaultValue={classData.description || ''} placeholder="Mô tả mục tiêu khóa học..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={startDateStr} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={endDateStr} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Số lượng tối đa (Học viên)</Label>
                <Input id="maxStudents" name="maxStudents" type="number" min="1" defaultValue={classData.maxStudents || ''} placeholder="VD: 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái lớp</Label>
                <Select name="status" defaultValue={classData.status || 'ACTIVE'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái">
                      {(val: any) => {
                        if (val === "ACTIVE") return "Đang học (Active)"
                        if (val === "COMPLETED") return "Đã hoàn thành"
                        if (val === "CANCELLED") return "Đã hủy"
                        return "Chọn trạng thái"
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang học (Active)</SelectItem>
                    <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center w-full">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa lớp
            </Button>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
