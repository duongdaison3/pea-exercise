'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalTestAttempts: number;
    passingStudents: number;
    inProgressTests: number;
    completedTests: number;
  };
  leaderboard: {
    id: string;
    name: string;
    email: string;
    score: number;
  }[];
}

const COLORS = ['#1e293b', '#e2e8f0'] // Slate-900 and Slate-200 for Donut Chart

export function DashboardClient({ stats, leaderboard }: DashboardProps) {
  const pieData = [
    { name: 'Học viên', value: stats.totalStudents },
    { name: 'Giáo viên', value: stats.totalTeachers },
  ]

  const successRate = stats.totalTestAttempts > 0 
    ? Math.round((stats.passingStudents / stats.totalTestAttempts) * 100) 
    : 0

  const totalActivity = stats.inProgressTests + stats.completedTests
  const activityProgress = totalActivity > 0
    ? Math.round((stats.completedTests / totalActivity) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Chào mừng trở lại! 👋
              </h1>
              <p className="text-slate-500 max-w-[600px]">
                Dưới đây là tình hình hoạt động của hệ thống. Theo dõi tiến độ học tập, 
                đánh giá kết quả của học viên và phân bổ tài khoản.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Col 1: Success Rate */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Tỉ lệ đạt điểm qua môn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-end justify-between">
              <div className="text-5xl font-bold tracking-tighter text-slate-900">
                {successRate}%
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={successRate} className="h-3" />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-slate-500">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Tổng lượt thi
                </div>
                <div className="font-semibold">{stats.totalTestAttempts}</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-slate-500">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Số lượt thi đạt
                </div>
                <div className="font-semibold">{stats.passingStudents}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Col 2: Most Activity / Role Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Phân bổ tài khoản (Học viên vs Giáo viên)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full justify-center gap-6 mt-4">
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                Học viên ({stats.totalStudents})
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full bg-slate-200 mr-2" />
                Giáo viên ({stats.totalTeachers})
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Col 3: Progress Statistics */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">
              Tiến độ làm bài của hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">Tỉ lệ nộp bài</p>
              <div className="text-5xl font-bold tracking-tighter text-slate-900">
                {activityProgress}%
              </div>
              <Progress value={activityProgress} className="h-2 w-3/4 mx-auto" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-1">
                <div className="text-2xl font-bold text-orange-500">{stats.inProgressTests}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  Đang làm
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-1">
                <div className="text-2xl font-bold text-green-500">{stats.completedTests}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Đã nộp
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Leaderboard */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Bảng xếp hạng hệ thống</CardTitle>
          <CardDescription>Top 5 học viên có tổng điểm thi cao nhất.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Chưa có học viên nào làm bài thi.
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-6 text-center font-bold text-slate-400">
                      {index + 1}.
                    </div>
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="font-bold text-lg text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                      {student.score} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
