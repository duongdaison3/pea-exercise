'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { StudentDetailDialog } from '@/components/students/student-detail-dialog'
import { EditStudentDialog } from '@/components/students/edit-student-dialog'
import { CreateStudentDialog } from './create-student-dialog'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { deleteStudent } from './actions'

export function StudentsClient({ initialStudents, classes }: { initialStudents: any[], classes?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedStudent) return
    setIsDeleting(true)
    const res = await deleteStudent(selectedStudent.id)
    setIsDeleting(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setIsDeleteModalOpen(false)
    }
  }

  // Filtering
  const filteredStudents = initialStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.phone && student.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">Đang học</Badge>
      case 'INACTIVE': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-none">Không hoạt động</Badge>
      case 'SUSPENDED': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 shadow-none">Đình chỉ</Badge>
      case 'DROPPED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">Nghỉ học</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleExport = () => {
    window.location.href = '/api/export/students';
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Quick Search */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
            <Search className="w-4 h-4 mr-2 text-slate-500" />
            Tìm kiếm nhanh
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Từ khóa</label>
              <Input 
                placeholder="Tên, Email, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Trạng thái</h3>
          <div className="space-y-2 flex flex-col">
            <Button variant={statusFilter === 'ALL' ? 'secondary' : 'ghost'} className="justify-start font-medium" onClick={() => setStatusFilter('ALL')}>
              Tất cả trạng thái
            </Button>
            <Button variant={statusFilter === 'ACTIVE' ? 'secondary' : 'ghost'} className="justify-start text-green-700 font-medium hover:text-green-800 hover:bg-green-50" onClick={() => setStatusFilter('ACTIVE')}>
              Đang học
            </Button>
            <Button variant={statusFilter === 'SUSPENDED' ? 'secondary' : 'ghost'} className="justify-start text-orange-700 font-medium hover:text-orange-800 hover:bg-orange-50" onClick={() => setStatusFilter('SUSPENDED')}>
              Đình chỉ
            </Button>
            <Button variant={statusFilter === 'DROPPED' ? 'secondary' : 'ghost'} className="justify-start text-red-700 font-medium hover:text-red-800 hover:bg-red-50" onClick={() => setStatusFilter('DROPPED')}>
              Nghỉ học
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng học viên</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialStudents.length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đang học</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialStudents.filter(s => s.status === 'ACTIVE').length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đình chỉ</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialStudents.filter(s => s.status === 'SUSPENDED').length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Nghỉ học</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialStudents.filter(s => s.status === 'DROPPED').length}</h4>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-500">
              Tổng số: <strong className="text-slate-900">{filteredStudents.length}</strong> học viên
            </span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto text-slate-600 border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Xuất danh sách (CSV)
            </Button>
            <CreateStudentDialog />
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Họ và tên</TableHead>
                <TableHead className="font-semibold text-slate-600">Số điện thoại</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày đăng ký</TableHead>
                <TableHead className="font-semibold text-slate-600">Lớp đang học</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Không tìm thấy học viên nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : filteredStudents.map((student, idx) => (
                <TableRow key={student.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{student.name}</span>
                      <span className="text-xs text-slate-500">{student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{student.phone || '-'}</TableCell>
                  <TableCell className="text-slate-600">
                    {student.createdAt ? format(new Date(student.createdAt), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {student.enrollments?.length > 0 ? (
                      <span className="text-sm text-slate-700 line-clamp-1" title={student.enrollments.map((e:any) => e.class.name).join(', ')}>
                        {student.enrollments[0].class.name} {student.enrollments.length > 1 && `(+${student.enrollments.length - 1})`}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Chưa xếp lớp</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsDetailOpen(true); }} className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2 text-slate-500" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsEditOpen(true); }} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-blue-500" /> Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsDeleteModalOpen(true); }} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" /> Xoá học viên
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentDetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} student={selectedStudent} />
      <EditStudentDialog open={isEditOpen} onOpenChange={setIsEditOpen} student={selectedStudent} />
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá học viên"
        description={`Bạn có chắc chắn muốn xoá học viên ${selectedStudent?.name} không? Thao tác này không thể hoàn tác.`}
        confirmText="Xoá"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
