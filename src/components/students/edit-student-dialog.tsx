'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'

export function EditStudentDialog({ 
  open, 
  onOpenChange, 
  student 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  student: any
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  
  const router = useRouter()

  useEffect(() => {
    if (student) {
      setName(student.name || '')
      setPhone(student.phone || '')
      setStatus(student.status || 'ACTIVE')
    }
  }, [student])

  if (!student) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, status })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Cập nhật thất bại')
      }

      setOpenChange(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const setOpenChange = (val: boolean) => {
    if (!isLoading) onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={setOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Học viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin liên lạc hoặc trạng thái hoạt động.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={student.email} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">Không thể thay đổi email sau khi tạo.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="VD: 0987654321" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select required value={status} onValueChange={(val) => setStatus(val || 'ACTIVE')}>
              <SelectTrigger>
                <span data-slot="select-value" className="line-clamp-1 flex items-center">
                  {status === 'ACTIVE' ? 'Đang học' : 
                   status === 'INACTIVE' ? 'Không hoạt động' : 
                   status === 'SUSPENDED' ? 'Đình chỉ' : 'Nghỉ học'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Đang học</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                <SelectItem value="SUSPENDED">Đình chỉ</SelectItem>
                <SelectItem value="DROPPED">Nghỉ học</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{error}</div>}

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
