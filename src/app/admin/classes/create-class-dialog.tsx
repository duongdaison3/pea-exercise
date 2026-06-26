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
import { Plus, Loader2 } from "lucide-react"
import { createClass } from './actions'

export function CreateClassDialog({ teachers }: { teachers: any[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

    const res = await createClass(data)
    setIsLoading(false)

    if (res.error) {
      alert(res.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> Tạo Lớp Học
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo lớp học mới</DialogTitle>
          <DialogDescription>
            Điền các thông tin cơ bản để tạo lớp học và gán giáo viên phụ trách.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp học <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" required placeholder="VD: Lớp luyện thi IELTS K1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId">Giáo viên phụ trách <span className="text-red-500">*</span></Label>
              <Select name="teacherId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giáo viên..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea id="description" name="description" placeholder="Mô tả mục tiêu khóa học..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Số lượng tối đa (Học viên)</Label>
                <Input id="maxStudents" name="maxStudents" type="number" min="1" placeholder="VD: 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái lớp</Label>
                <Select name="status" defaultValue="ACTIVE">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo lớp học
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
