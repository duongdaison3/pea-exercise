'use client'

import { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from 'next/link'
import { Search, ChevronRight, MessageSquare, Mic, PenTool, Type, FileText, CheckCircle2, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type GradingRow = {
  id: string
  studentName: string
  studentEmail: string
  moduleTitle: string
  questionType: string
  aiScore: number | null
  teacherScore?: number | null
  maxScore: number
  status: string
  createdAt: string
}

export function GradingDataTable({ data }: { data: GradingRow[] }) {
  const [searchModule, setSearchModule] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState('pending')

  const uniqueTypes = useMemo(() => {
    const types = new Set(data.map((d: any) => d.questionType))
    return Array.from(types)
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      const matchModule = row.moduleTitle.toLowerCase().includes(searchModule.toLowerCase())
      const matchType = typeFilter === 'ALL' || row.questionType === typeFilter
      const matchTab = activeTab === 'pending' 
        ? row.status !== 'COMPLETED' 
        : row.status === 'COMPLETED'
      
      return matchModule && matchType && matchTab
    })
  }, [data, searchModule, typeFilter, activeTab])

  const getQuestionTypeInfo = (type: string) => {
    if (['READ_ALOUD', 'REPEAT_SENTENCE', 'DESCRIBE_IMAGE', 'RETELL_LECTURE', 'ANSWER_SHORT_QUESTION'].includes(type)) {
      return { icon: <Mic className="w-4 h-4 text-orange-500" />, label: 'Speaking', color: 'bg-orange-50 text-orange-700 border-orange-200' }
    }
    if (['WRITE_ESSAY', 'SUMMARIZE_WRITTEN_TEXT', 'SUMMARIZE_SPOKEN_TEXT', 'WRITE_FROM_DICTATION'].includes(type)) {
      return { icon: <PenTool className="w-4 h-4 text-blue-500" />, label: 'Writing', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (type.includes('FIB') || type.includes('MULTIPLE_CHOICE') || type === 'REORDER_PARAGRAPHS') {
      return { icon: <Type className="w-4 h-4 text-emerald-500" />, label: 'Reading', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    return { icon: <FileText className="w-4 h-4 text-slate-500" />, label: 'Listening', color: 'bg-slate-50 text-slate-700 border-slate-200' }
  }

  return (
    <div className="space-y-4">
      {/* Lọc dữ liệu */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm theo tên bài thi..." 
              value={searchModule}
              onChange={(e) => setSearchModule(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'ALL')}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
              <span data-slot="select-value" className="line-clamp-1 flex items-center">
                {typeFilter === 'ALL' ? 'Tất cả kỹ năng' : typeFilter.replace(/_/g, ' ')}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả kỹ năng</SelectItem>
              {uniqueTypes.map((t: any) => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Cần chấm
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Đã chấm
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Hiển thị <span className="text-slate-900">{filteredData.length}</span> câu trả lời
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-sm text-slate-600">Học viên</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600">Bài thi (Module)</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600">Dạng câu hỏi</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600">Thời gian nộp</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                  {activeTab === 'pending' ? 'Điểm AI dự kiến' : 'Điểm đã chốt'}
                </th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const typeInfo = getQuestionTypeInfo(row.questionType)
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{row.studentName}</span>
                          <span className="text-xs text-slate-500">{row.studentEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">{row.moduleTitle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${typeInfo.color} gap-1.5`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                            {row.questionType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {format(new Date(row.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'pending' ? (
                          row.aiScore !== null ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-blue-600">{row.aiScore}</span>
                              <span className="text-sm text-slate-400">/ {row.maxScore}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Chưa có</span>
                          )
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-green-600">{row.teacherScore}</span>
                            <span className="text-sm text-slate-400">/ {row.maxScore}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild size="sm" className={activeTab === 'pending' ? "bg-blue-600 hover:bg-blue-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" : "bg-white text-slate-700 border hover:bg-slate-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"}>
                          <Link href={`/teacher/grading/${row.id}`}>
                            {activeTab === 'pending' ? 'Duyệt bài' : 'Xem lại'} <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-3 text-slate-200" />
                      <p className="text-lg font-medium text-slate-600">
                        {activeTab === 'pending' ? 'Không có bài nào cần chấm' : 'Chưa có bài nào đã chấm'}
                      </p>
                      <p className="text-sm">
                        {activeTab === 'pending' 
                          ? 'Bạn đã duyệt hết tất cả các bài hoặc chưa có học viên nào nộp bài.' 
                          : 'Bạn chưa duyệt bài nào.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
