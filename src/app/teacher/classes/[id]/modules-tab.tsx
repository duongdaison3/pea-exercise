'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createModule } from "./actions"

export function ModulesTab({ classId, modules }: { classId: string, modules: { id: string, title: string, orderIndex: number }[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    formData.append('classId', classId)
    const res = await createModule(formData)
    setIsLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-slate-900 hover:bg-slate-800 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Tạo Module mới
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Module mới</DialogTitle>
              <DialogDescription>Thêm bài giảng / chương trình học cho lớp này.</DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên Module</Label>
                <Input id="title" name="title" required placeholder="Ví dụ: Module 2 - Luyện nghe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderIndex">Số thứ tự</Label>
                <Input id="orderIndex" name="orderIndex" type="number" required defaultValue={modules.length + 1} />
              </div>
              {error && <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{error}</div>}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Đang tạo...' : 'Lưu Module'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-24">Thứ tự</TableHead>
              <TableHead>Tên Module</TableHead>
              <TableHead>Mã ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-slate-500">Chưa có Module nào trong lớp.</TableCell>
              </TableRow>
            ) : modules.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium text-slate-500">#{m.orderIndex}</TableCell>
                <TableCell className="font-medium">{m.title}</TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">{m.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
