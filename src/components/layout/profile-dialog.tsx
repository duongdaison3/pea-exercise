'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/user'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

export function ProfileDialog({ user }: { user: { id: string, name: string, email: string } }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const name = formData.get('name') as string
    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string
    
    const result = await updateProfile(user.id, { name, oldPassword, newPassword })
    
    setIsLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900">
        <User className="mr-2 h-4 w-4" />
        <span>Thông tin tài khoản</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tài khoản cá nhân</DialogTitle>
          <DialogDescription>
            Cập nhật tên hiển thị và đổi mật khẩu. Địa chỉ Email không thể thay đổi.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email / Tên đăng nhập</Label>
            <Input id="email" value={user.email} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Họ và Tên</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-3">Đổi mật khẩu (không bắt buộc)</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                <Input id="oldPassword" name="oldPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" name="newPassword" type="password" />
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
