'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Sparkles, Save, CheckCircle2, Loader2, Bot, User, BookOpen } from "lucide-react"

type AnswerData = {
  id: string
  studentName: string
  studentEmail: string
  moduleTitle: string
  questionType: string
  instruction: string
  content: any
  audioUrl: string | null
  textResponse: string | null
  parsedResponse: any
  aiScore: number | null
  aiFeedback: string | null
  teacherScore?: number | null
  teacherFeedback?: string | null
  maxScore: number
  status: string
}

export function GradingDetailClient({ answerData }: { answerData: AnswerData }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      teacherScore: answerData.teacherScore !== null && answerData.teacherScore !== undefined ? answerData.teacherScore : (answerData.aiScore || 0),
      teacherFeedback: answerData.teacherFeedback || answerData.aiFeedback || ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/grade/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswerId: answerData.id,
          ...data
        })
      })
      if (!res.ok) throw new Error('Failed to finalize grade')
      
      router.push('/teacher/grading')
      router.refresh()
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
      alert("Có lỗi xảy ra khi lưu điểm.")
    }
  }

  const copyAiScore = () => {
    setValue('teacherScore', answerData.aiScore || 0)
    // Optional: Also append AI feedback to teacher feedback if desired
  }

  // Render format for raw text or array answers
  const renderStudentResponse = () => {
    if (answerData.audioUrl) {
      return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4 flex flex-col items-center">
          <audio controls className="w-full max-w-md">
            <source src={answerData.audioUrl} type="audio/webm" />
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        </div>
      )
    }

    if (Array.isArray(answerData.parsedResponse)) {
      return (
        <div className="mt-4 flex flex-wrap gap-2">
          {answerData.parsedResponse.map((item: string, idx: number) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      )
    }

    if (typeof answerData.parsedResponse === 'object' && answerData.parsedResponse !== null) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Object.entries(answerData.parsedResponse).map(([key, val]: any) => (
            <div key={key} className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">{key}</span>
              <span className="text-slate-800 font-medium">{val}</span>
            </div>
          ))}
        </div>
      )
    }

    const wordCount = answerData.textResponse ? answerData.textResponse.trim().split(/\s+/).length : 0

    return (
      <div className="mt-4 space-y-2">
        <div className="bg-yellow-50/50 p-5 rounded-xl border border-yellow-200 whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
          {answerData.textResponse || <span className="text-slate-400 italic">Không có nội dung trả lời.</span>}
        </div>
        <div className="text-right text-xs text-slate-400 font-medium">
          Số lượng từ: <span className="text-slate-600 font-bold">{wordCount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* CỘT TRÁI: Đề bài & Bài làm */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 bg-slate-50 border-b flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{answerData.moduleTitle}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{answerData.questionType.replace(/_/g, ' ')}</h2>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <User className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{answerData.studentName}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Đề bài (Instruction)</h3>
            <div className="prose prose-slate max-w-none mb-6" dangerouslySetInnerHTML={{ __html: answerData.instruction }} />
            
            {answerData.content.text && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 font-mono text-sm leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: answerData.content.text }} />
            )}

            <div className="border-t border-dashed border-slate-200 my-6"></div>

            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Bài làm của học viên</h3>
            {renderStudentResponse()}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: AI Assistant & Chốt điểm */}
      <div className="lg:col-span-5 space-y-6 sticky top-6">
        
        {/* Thẻ AI Assistant */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-purple-100/50 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center text-purple-900">
                <Bot className="w-5 h-5 mr-2 text-purple-600" />
                AI Assistant
              </CardTitle>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-purple-100 flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-500">Điểm:</span>
                <span className="text-lg font-black text-purple-700">{answerData.aiScore !== null ? answerData.aiScore : '-'}</span>
                <span className="text-sm font-bold text-slate-400">/ {answerData.maxScore}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium bg-white/60 p-4 rounded-xl border border-purple-100/50">
              {answerData.aiFeedback || <span className="italic text-slate-400">Không có nhận xét từ AI cho câu hỏi này.</span>}
            </div>
          </CardContent>
        </Card>

        {/* Form Giáo viên chốt điểm */}
        <Card className="shadow-md border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">
              {answerData.status === 'COMPLETED' ? 'Chỉnh sửa điểm' : 'Quyết định của Giáo viên'}
            </CardTitle>
            <CardDescription>
              {answerData.status === 'COMPLETED' ? 'Bạn đang xem lại và có thể cập nhật lại điểm số này.' : 'Điểm số này sẽ được lưu làm kết quả chính thức của học viên.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <Label htmlFor="teacherScore" className="text-sm font-bold text-slate-700">Điểm số (Max: {answerData.maxScore})</Label>
                  <Button type="button" variant="outline" size="sm" onClick={copyAiScore} className="h-7 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                    <Sparkles className="w-3 h-3 mr-1" /> Dùng điểm AI
                  </Button>
                </div>
                <Input 
                  id="teacherScore" 
                  type="number" 
                  step="0.5"
                  min={0}
                  max={answerData.maxScore}
                  {...register('teacherScore', { required: true, min: 0, max: answerData.maxScore })}
                  className="text-lg font-bold w-full max-w-[200px]"
                />
                {errors.teacherScore && <span className="text-xs text-red-500 font-medium">Vui lòng nhập điểm hợp lệ.</span>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="teacherFeedback" className="text-sm font-bold text-slate-700">Nhận xét chuyên môn (Optional)</Label>
                <Textarea 
                  id="teacherFeedback" 
                  placeholder="Nhập phản hồi chi tiết cho học viên..."
                  className="min-h-[120px] resize-none leading-relaxed"
                  {...register('teacherFeedback')}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-md h-12">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                  )}
                  {answerData.status === 'COMPLETED' ? 'Cập nhật điểm' : 'Lưu & Hoàn thành'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
