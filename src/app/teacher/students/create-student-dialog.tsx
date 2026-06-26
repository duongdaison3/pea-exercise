'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createStudent } from './actions'
import { useRouter } from 'next/navigation'

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const res = await createStudent(formData)
    setIsLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm học viên mới
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm học viên</DialogTitle>
          <DialogDescription>
            Tạo tài khoản học viên. Học viên này sẽ do bạn quản lý.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" name="name" required placeholder="Trần Văn C" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email / Tên đăng nhập</Label>
            <Input id="email" name="email" required placeholder="hocvien@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>

          {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{error}</div>}

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
