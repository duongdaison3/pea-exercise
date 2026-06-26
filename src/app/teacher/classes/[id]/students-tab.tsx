'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { XIcon, Plus } from "lucide-react"
import { removeStudentFromClass, addStudentToClass } from "./actions"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function StudentsTab({ classId, enrollments, availableStudents }: { 
  classId: string, 
  enrollments: { id: string, studentId: string, student: { name: string, email: string } }[], 
  availableStudents: { id: string, name: string, email: string }[] 
}) {
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  async function handleRemove() {
    if (!studentToRemove) return
    setIsRemoving(studentToRemove)
    await removeStudentFromClass(classId, studentToRemove)
    setIsRemoving(null)
    setIsDeleteModalOpen(false)
    setStudentToRemove(null)
  }

  function confirmRemove(studentId: string) {
    setStudentToRemove(studentId)
    setIsDeleteModalOpen(true)
  }

  async function handleAdd() {
    if (!selectedStudent) return
    setIsAdding(true)
    await addStudentToClass(classId, selectedStudent)
    setIsAdding(false)
    setOpen(false)
    setSelectedStudent('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="w-4 h-4 mr-2" /> Thêm học viên vào lớp
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm học viên vào lớp</DialogTitle>
              <DialogDescription>Chọn học viên bạn quản lý để thêm vào lớp học này.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Chọn học viên</Label>
                <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val || '')}>
                  <SelectTrigger>
                    <span data-slot="select-value" className={`line-clamp-1 flex items-center ${!selectedStudent ? 'text-muted-foreground' : ''}`}>
                      {selectedStudent && selectedStudent !== 'none' 
                        ? availableStudents.find(s => s.id === selectedStudent)?.name 
                        : "-- Chọn một học viên --"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.length === 0 ? (
                      <SelectItem value="none" disabled>Không có học viên nào khả dụng</SelectItem>
                    ) : (
                      availableStudents.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleAdd} disabled={isAdding || !selectedStudent || selectedStudent === 'none'}>
                  {isAdding ? 'Đang thêm...' : 'Xác nhận thêm'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Tên học viên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-slate-500">Chưa có học viên nào trong lớp.</TableCell>
              </TableRow>
            ) : enrollments.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.student.name}</TableCell>
                <TableCell>{e.student.email}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => confirmRemove(e.studentId)}
                    disabled={isRemoving === e.studentId}
                  >
                    {isRemoving === e.studentId ? 'Đang xoá...' : <><XIcon className="w-4 h-4 mr-1" /> Xoá khỏi lớp</>}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setStudentToRemove(null)
        }}
        onConfirm={handleRemove}
        title="Xoá học viên khỏi lớp"
        description="Bạn có chắc chắn muốn xoá học viên này khỏi lớp học không? Toàn bộ kết quả bài test của học viên trong lớp này có thể sẽ bị ảnh hưởng."
        confirmText="Xoá khỏi lớp"
        cancelText="Hủy"
        type="danger"
        isLoading={isRemoving !== null}
      />
    </div>
  )
}
