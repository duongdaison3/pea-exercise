'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, Search } from "lucide-react"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import * as XLSX from 'xlsx'

export type ReportAttempt = {
  id: string
  studentId: string
  studentName: string
  className: string
  classId: string
  moduleTitle: string
  totalScore: number
  isPassed: boolean
  endTime: string
}

export type ReportClass = {
  id: string
  name: string
}

interface ReportsClientProps {
  attempts: ReportAttempt[]
  classes: ReportClass[]
  title: string
  description: string
}

export function ReportsClient({ attempts, classes, title, description }: ReportsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Filtering logic
  const filteredAttempts = attempts.filter((a: any) => {
    // Search filter
    const matchesSearch = 
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase())
      
    // Class filter
    const matchesClass = classFilter === 'ALL' || a.classId === classFilter
    
    // Status filter
    let matchesStatus = true
    if (statusFilter === 'PASSED') matchesStatus = a.isPassed
    if (statusFilter === 'FAILED') matchesStatus = !a.isPassed
    
    return matchesSearch && matchesClass && matchesStatus
  })

  const exportExcel = () => {
    // Create data array for Excel
    const data = filteredAttempts.map((a: any) => ({
      'Mã Học viên': a.studentId,
      'Tên Học viên': a.studentName,
      'Lớp': a.className,
      'Tên Bài Thi': a.moduleTitle,
      'Điểm': a.totalScore,
      'Trạng thái': a.isPassed ? 'Đạt' : 'Không đạt',
      'Ngày Nộp': format(new Date(a.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })
    }))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo")

    // Generate buffer and download
    XLSX.writeFile(workbook, `bao_cao_ket_qua_${format(new Date(), 'dd_MM_yyyy')}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
        <Button onClick={exportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
          <FileDown className="w-4 h-4 mr-2" /> Xuất Excel
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-slate-500">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tên, mã HV, bài thi..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64 space-y-1">
              <Label className="text-slate-500">Lớp học</Label>
              <Select value={classFilter} onValueChange={(val) => setClassFilter(val || 'ALL')}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tất cả lớp">
                    {(val: any) => {
                      if (!val || val === 'ALL') return "Tất cả lớp"
                      const selected = classes.find((c: any) => c.id === val)
                      return selected ? selected.name : "Tất cả lớp"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả lớp</SelectItem>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48 space-y-1">
              <Label className="text-slate-500">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tất cả trạng thái">
                    {(val: any) => {
                      if (val === 'PASSED') return "Đạt"
                      if (val === 'FAILED') return "Không đạt"
                      return "Tất cả trạng thái"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="PASSED">Đạt</SelectItem>
                  <SelectItem value="FAILED">Không đạt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Mã HV</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tên Học viên</TableHead>
                  <TableHead className="font-semibold text-slate-700">Lớp</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tên Bài Thi</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Điểm</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ngày Nộp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      Không có dữ liệu phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.map((a: any) => (
                    <TableRow key={a.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-600">{a.studentId.substring(0, 8)}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{a.studentName}</TableCell>
                      <TableCell>{a.className}</TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate" title={a.moduleTitle}>
                        {a.moduleTitle}
                      </TableCell>
                      <TableCell className="text-center font-semibold">{a.totalScore}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${a.isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {a.isPassed ? 'Đạt' : 'Không đạt'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-sm">
                        {format(new Date(a.endTime), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-slate-500 text-right">
        Đang hiển thị {filteredAttempts.length} bản ghi
      </div>
    </div>
  )
}
