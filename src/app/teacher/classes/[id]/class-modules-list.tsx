'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format, isPast } from "date-fns"
import { vi } from "date-fns/locale"
import Link from 'next/link'
import {
  Plus,
  FileText,
  Clock,
  Users,
  MoreVertical,
  Settings,
  Eye,
  FolderOpen,
  Trash2,
  ArrowDownUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteModule } from "./actions"
import { useRouter } from "next/navigation"

type ModuleStat = {
  id: string
  title: string
  description: string | null
  timeLimit: number
  deadline: string | null
  isPublished: boolean
  totalStudents: number
  submittedStudents: number
}

export function ClassModulesList({ classId, modules }: { classId: string, modules: ModuleStat[] }) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'deadline'>('newest')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const res = await deleteModule(deletingId, classId)
    setIsDeleting(false)
    if (res.error) {
      alert(res.error)
    } else {
      setDeletingId(null)
      router.refresh()
    }
  }

  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      // Assuming modules array initially is sorted by some default or we can just use ID as proxy for newest
      if (sortBy === 'newest') return b.id.localeCompare(a.id)
      if (sortBy === 'oldest') return a.id.localeCompare(b.id)
      return 0
    })
  }, [modules, sortBy])

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Không giới hạn'
    const m = Math.floor(seconds / 60)
    return `${m} phút`
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header / Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
          <FolderOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold">Danh sách Bài Test</h2>
          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">{modules.length}</Badge>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-slate-400" />
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <span data-slot="select-value" className="line-clamp-1 flex items-center">
                  {sortBy === 'newest' ? 'Mới nhất' : sortBy === 'oldest' ? 'Cũ nhất' : 'Hạn chót gần nhất'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="deadline">Hạn chót gần nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
            <Link href={`/teacher/modules/create?classId=${classId}`}>
              <Plus className="w-4 h-4 mr-1.5" />
              Tạo bài Test
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      {sortedModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedModules.map((mod: any) => {
            const isDeadlinePassed = mod.deadline ? isPast(new Date(mod.deadline)) : false
            const progressPct = mod.totalStudents > 0
              ? Math.round((mod.submittedStudents / mod.totalStudents) * 100)
              : 0

            return (
              <Card key={mod.id} className="group hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${mod.isPublished ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <Link href={`/teacher/modules/${mod.id}/edit`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                          {mod.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-transparent ${mod.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {mod.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem render={<Link href={`/student/modules/${mod.id}/take`} target="_blank" className="cursor-pointer" />}>
                          <Eye className="w-4 h-4 mr-2" /> Xem thử
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`/teacher/modules/${mod.id}/edit`} className="cursor-pointer" />}>
                          <Settings className="w-4 h-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          onSelect={() => setDeletingId(mod.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa bài thi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-5 pb-4 space-y-4 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                      {formatDuration(mod.timeLimit)}
                    </div>
                    {mod.deadline && (
                      <div className={`flex items-center font-medium ${isDeadlinePassed ? 'text-red-500' : 'text-amber-600'}`}>
                        {isDeadlinePassed ? 'Hết hạn: ' : 'Hạn chót: '}
                        {format(new Date(mod.deadline), "dd/MM/yyyy", { locale: vi })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center text-slate-600 font-medium">
                        <Users className="w-4 h-4 mr-1.5 text-slate-400" /> Đã nộp bài
                      </span>
                      <span className="font-bold text-slate-800">
                        {mod.submittedStudents} <span className="text-slate-400 font-normal">/ {mod.totalStudents}</span>
                      </span>
                    </div>
                    <Progress value={progressPct} className="h-2 w-full bg-slate-200" />
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-4 px-5">
                  <Button asChild variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Link href={`/teacher/grading?search=${encodeURIComponent(mod.title)}`}>
                      Chấm bài thi này
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600 mb-1">Chưa có bài test nào</h3>
          <p className="text-slate-500 mb-6 text-sm">Bấm nút Tạo bài Test để bắt đầu giao bài tập cho lớp.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/teacher/modules/create?classId=${classId}`}>
              <Plus className="w-4 h-4 mr-2" /> Tạo bài Test ngay
            </Link>
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Xóa bài thi này?"
        description="Bài thi này sẽ bị xóa vĩnh viễn khỏi lớp học. Dữ liệu nộp bài của học viên liên quan đến bài thi này cũng có thể bị ảnh hưởng. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa bài thi"
        cancelText="Hủy"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
