'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Settings, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { CreateClassDialog } from './create-class-dialog'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ClassesClient({ initialClasses, teachers }: { initialClasses: any[], teachers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClasses = initialClasses.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Lớp học</h2>
          <p className="text-slate-500 mt-1">Quản lý và theo dõi toàn bộ lớp học trên hệ thống.</p>
        </div>
        <CreateClassDialog teachers={teachers} />
      </div>

      <div className="flex items-center space-x-2 max-w-md">
        <Search className="w-5 h-5 text-slate-400" />
        <Input 
          placeholder="Tìm kiếm lớp học hoặc giáo viên..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {filteredClasses.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-transparent shadow-none">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Không tìm thấy lớp học nào.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c: any) => (
            <Card key={c.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b pb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {c.status === 'ACTIVE' ? 'Đang học' : c.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 pr-16">
                    <CardTitle className="text-lg text-slate-900 leading-tight">{c.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{c.description || "Không có mô tả"}</CardDescription>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-600">
                  <span className="font-medium text-slate-900 mr-2">Giáo viên:</span> 
                  {c.teacher.name}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-slate-400" /> Học viên
                    </div>
                    <span className="font-medium">{c._count.enrollments} {c.maxStudents ? `/ ${c.maxStudents}` : ''}</span>
                  </div>
                  
                  {(c.startDate || c.endDate) && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" /> Thời gian
                      </div>
                      <span className="font-medium">
                        {c.startDate ? format(new Date(c.startDate), 'dd/MM/yyyy') : '...'} - {c.endDate ? format(new Date(c.endDate), 'dd/MM/yyyy') : '...'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-slate-400" /> Bài test (Modules)
                    </div>
                    <span className="font-medium">{c._count.modules}</span>
                  </div>
                </div>
                
                {/* 
                // Currently admin doesn't have a class management page. They just see the list.
                // We could add an edit button, but for now we just list them.
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" /> Cấu hình lớp
                </Button>
                */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
