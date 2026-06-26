'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createUser } from './actions'
import { useRouter } from 'next/navigation'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("STUDENT")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const res = await createUser(formData)
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
        Tạo tài khoản mới
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo người dùng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin bên dưới để tạo tài khoản Giáo viên hoặc Học viên.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" name="name" required placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email / Tên đăng nhập</Label>
            <Input id="email" name="email" required placeholder="nguyenvana@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select name="role" required value={role} onValueChange={(val) => setRole(val || 'STUDENT')}>
              <SelectTrigger>
                <span data-slot="select-value" className="line-clamp-1 flex items-center">
                  {role === 'STUDENT' ? 'Học viên (STUDENT)' : 
                   role === 'TEACHER' ? 'Giáo viên (TEACHER)' : 
                   'Quản trị viên (ADMIN)'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Học viên (STUDENT)</SelectItem>
                <SelectItem value="TEACHER">Giáo viên (TEACHER)</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên (ADMIN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{error}</div>}

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu tài khoản'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
