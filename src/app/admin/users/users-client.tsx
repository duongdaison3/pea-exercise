'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, MoreVertical, Eye, Edit, ShieldAlert, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StudentDetailDialog } from '@/components/students/student-detail-dialog'
import { EditStudentDialog } from '@/components/students/edit-student-dialog'
import { CreateUserDialog } from './create-user-dialog'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { deleteUser } from './actions'

export function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedUser) return
    setIsDeleting(true)
    const res = await deleteUser(selectedUser.id)
    setIsDeleting(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setIsDeleteModalOpen(false)
    }
  }

  // Filtering
  const filteredUsers = initialUsers.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">Đang hoạt động</Badge>
      case 'INACTIVE': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-none">Ngừng HĐ</Badge>
      case 'SUSPENDED': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 shadow-none">Đình chỉ</Badge>
      case 'DROPPED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">Nghỉ học</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Badge variant="destructive">Admin</Badge>
      case 'TEACHER': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Giáo viên</Badge>
      case 'STUDENT': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200">Học viên</Badge>
      default: return <Badge variant="outline">{role}</Badge>
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
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-slate-500" /> Vai trò
          </h3>
          <div className="space-y-2 flex flex-col">
            <Button variant={roleFilter === 'ALL' ? 'secondary' : 'ghost'} className="justify-start font-medium" onClick={() => setRoleFilter('ALL')}>
              Tất cả vai trò
            </Button>
            <Button variant={roleFilter === 'STUDENT' ? 'secondary' : 'ghost'} className="justify-start text-indigo-700 font-medium hover:text-indigo-800 hover:bg-indigo-50" onClick={() => setRoleFilter('STUDENT')}>
              Học viên
            </Button>
            <Button variant={roleFilter === 'TEACHER' ? 'secondary' : 'ghost'} className="justify-start text-blue-700 font-medium hover:text-blue-800 hover:bg-blue-50" onClick={() => setRoleFilter('TEACHER')}>
              Giáo viên
            </Button>
            <Button variant={roleFilter === 'ADMIN' ? 'secondary' : 'ghost'} className="justify-start text-red-700 font-medium hover:text-red-800 hover:bg-red-50" onClick={() => setRoleFilter('ADMIN')}>
              Quản trị viên
            </Button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Trạng thái</h3>
          <div className="space-y-2 flex flex-col">
            <Button variant={statusFilter === 'ALL' ? 'secondary' : 'ghost'} className="justify-start font-medium" onClick={() => setStatusFilter('ALL')}>
              Tất cả trạng thái
            </Button>
            <Button variant={statusFilter === 'ACTIVE' ? 'secondary' : 'ghost'} className="justify-start text-green-700 font-medium hover:text-green-800 hover:bg-green-50" onClick={() => setStatusFilter('ACTIVE')}>
              Đang hoạt động
            </Button>
            <Button variant={statusFilter === 'SUSPENDED' ? 'secondary' : 'ghost'} className="justify-start text-orange-700 font-medium hover:text-orange-800 hover:bg-orange-50" onClick={() => setStatusFilter('SUSPENDED')}>
              Đình chỉ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng tài khoản</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialUsers.length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Giáo viên</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialUsers.filter((u: any) => u.role === 'TEACHER').length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Học viên</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialUsers.filter((u: any) => u.role === 'STUDENT').length}</h4>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Quản trị viên</p>
              <h4 className="text-2xl font-bold text-slate-800">{initialUsers.filter((u: any) => u.role === 'ADMIN').length}</h4>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-500">
              Tổng số: <strong className="text-slate-900">{filteredUsers.length}</strong> tài khoản
            </span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto text-slate-600 border-slate-200 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Xuất danh sách Học viên
            </Button>
            <CreateUserDialog />
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">Họ và tên</TableHead>
                <TableHead className="font-semibold text-slate-600">Số điện thoại</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày tạo</TableHead>
                <TableHead className="font-semibold text-slate-600">Vai trò</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((user: any, idx: number) => (
                <TableRow key={user.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{user.phone || '-'}</TableCell>
                  <TableCell className="text-slate-600">
                    {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {user.role === 'STUDENT' && (
                          <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2 text-slate-500" /> Xem chi tiết
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditOpen(true); }} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-blue-500" /> Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" /> Xoá tài khoản
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

      <StudentDetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} student={selectedUser} />
      <EditStudentDialog open={isEditOpen} onOpenChange={setIsEditOpen} student={selectedUser} />
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xoá tài khoản"
        description={`Bạn có chắc chắn muốn xoá tài khoản ${selectedUser?.name} không? Thao tác này không thể hoàn tác.`}
        confirmText="Xoá"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
