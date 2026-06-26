'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, AlertCircle, Clock, ChevronRight } from "lucide-react"
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ClassProgress {
  id: string;
  name: string;
  totalModules: number;
  publishedModules: number;
}

interface RecentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  moduleTitle: string;
  className: string;
  endTime: string;
  score: number | null;
}

interface TeacherDashboardProps {
  totalStudents: number;
  totalClasses: number;
  pendingGrading: number;
  classesProgress: ClassProgress[];
  recentSubmissions: RecentSubmission[];
}

export function TeacherDashboardClient({ 
  totalStudents, 
  totalClasses, 
  pendingGrading, 
  classesProgress, 
  recentSubmissions 
}: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
      </div>

      {/* Row 1: Fast Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng Học Viên</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Thuộc tất cả các lớp</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Lớp Đang Phụ Trách</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalClasses}</div>
            <p className="text-xs text-slate-500 mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500 opacity-5 rounded-full -mr-8 -mt-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Bài Cần Chấm</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{pendingGrading}</div>
                <p className="text-xs text-orange-700/70 mt-1">Học viên đang chờ kết quả</p>
              </div>
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/teacher/grading">
                  Chấm bài ngay <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Row 2: Learning Path / Class Progress (Span 4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tiến độ Lớp học</h2>
          {classesProgress.length === 0 ? (
            <Card className="border-dashed bg-slate-50 text-center py-12">
              <p className="text-slate-500 text-sm">Chưa có lớp học nào.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {classesProgress.map((cls) => {
                const progressVal = cls.totalModules > 0 
                  ? Math.round((cls.publishedModules / cls.totalModules) * 100) 
                  : 0
                return (
                  <Card key={cls.id} className="shadow-sm hover:border-slate-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-slate-900">{cls.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Progress value={progressVal} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Đã phát hành</span>
                          <span className="font-medium text-slate-900">{cls.publishedModules} / {cls.totalModules} modules</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Row 3: Recent Activity (Span 3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Hoạt động gần đây (24h)</h2>
          <Card className="shadow-sm border-slate-200 h-full">
            <CardContent className="p-0">
              {recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Không có học viên nào nộp bài trong 24 giờ qua.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {recentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                      <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold text-sm">
                          {sub.studentName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {sub.studentName}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Đã nộp <span className="font-medium text-slate-700">{sub.moduleTitle}</span>
                        </p>
                        <div className="flex items-center mt-2 text-xs text-slate-400">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mr-2 line-clamp-1 truncate max-w-[100px]">
                            {sub.className}
                          </span>
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(sub.endTime), { addSuffix: true, locale: vi })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
