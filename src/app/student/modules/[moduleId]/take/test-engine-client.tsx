'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { DeviceTester } from './device-tester'
import { QuestionRenderer } from './question-renderer'
import { submitAnswer } from '@/app/actions/submit-answer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, ChevronRight, ChevronLeft, Clock } from "lucide-react"
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TestEngineClient({ moduleData, sections }: { moduleData: any, sections: any[] }) {
  const [status, setStatus] = useState<'testing_device' | 'taking_test' | 'finished'>('testing_device')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(moduleData.timeLimit > 0 ? moduleData.timeLimit : 3600) // seconds (default 1h if 0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const router = useRouter()

  const flatQuestions = useMemo(() => {
    return sections.flatMap((sec: any) => sec.questions.map((q: any) => ({ ...q, sectionTitle: sec.title })))
  }, [sections])

  const [currentIndex, setCurrentIndex] = useState(0)

  // Timer logic
  useEffect(() => {
    if (status !== 'taking_test' || moduleData.timeLimit === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, moduleData.timeLimit])

  const handleTimeUp = async () => {
    // If we have a pending answer that hasn't been submitted
    if (answers[currentQuestion.id] !== undefined && !isSubmitting) {
      await handleNext(answers[currentQuestion.id], true)
    }
    router.replace(`/student/modules/${moduleData.id}/success`)
  }

  if (flatQuestions.length === 0) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="max-w-md text-center p-8">
          <CardTitle>Chưa có câu hỏi</CardTitle>
          <CardDescription className="mt-2">Module này chưa có câu hỏi nào được tạo.</CardDescription>
          <Button onClick={() => router.back()} className="mt-6">Quay lại</Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = flatQuestions[currentIndex]

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleDeviceTestComplete = () => {
    setStatus('taking_test')
  }

  const handleNext = async (dataFromRenderer?: any, skipRedirect = false) => {
    const dataToSubmit = dataFromRenderer !== undefined ? dataFromRenderer : answers[currentQuestion.id]
    
    // If the child component calls onComplete with data, or we have state, we submit it
    if (dataToSubmit !== undefined) {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('questionId', currentQuestion.id)
      formData.append('moduleId', moduleData.id)
      
      if (dataToSubmit instanceof Blob) {
        formData.append('audioBlob', dataToSubmit)
      } else if (typeof dataToSubmit === 'string') {
        formData.append('textResponse', dataToSubmit)
      } else {
        formData.append('textResponse', JSON.stringify(dataToSubmit))
      }
      
      await submitAnswer(formData)
      setIsSubmitting(false)
    }

    if (currentIndex < flatQuestions.length - 1) {
      setCurrentIndex(c => c + 1)
    } else {
      if (!skipRedirect) {
        router.replace(`/student/modules/${moduleData.id}/success`)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1)
    }
  }

  const handleNextRef = useRef(handleNext)
  useEffect(() => {
    handleNextRef.current = handleNext
  })
  
  const onComplete = useCallback((data: any) => handleNextRef.current(data), [])
  const onChange = useCallback((val: any) => setAnswers(prev => ({ ...prev, [currentQuestion?.id]: val })), [currentQuestion?.id])

  if (status === 'testing_device') {
    return <DeviceTester onComplete={handleDeviceTestComplete} />
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] select-none" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Sidebar - Left Column */}
      <div className="lg:w-80 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <div className="p-4 bg-slate-50 border-b flex flex-col gap-3">
           <h3 className="font-bold text-slate-800 text-lg">Cấu trúc bài thi</h3>
           {moduleData.timeLimit > 0 && (
             <div className="flex items-center justify-center text-rose-600 font-bold bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl shadow-inner">
               <Clock className="w-5 h-5 mr-2 animate-pulse" />
               <span className="text-xl tracking-wider">{formatTime(timeLeft)}</span>
             </div>
           )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {sections.map((sec, secIdx) => {
             const startIndex = sections.slice(0, secIdx).reduce((acc: number, s: any) => acc + s.questions.length, 0)
             return (
               <div key={sec.id} className="space-y-3">
                 <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide px-1">{sec.title}</h4>
                 <div className="grid grid-cols-5 gap-2">
                   {sec.questions.map((q: any, qIdx: number) => {
                     const globalIdx = startIndex + qIdx
                     const isActive = globalIdx === currentIndex
                     const isPast = globalIdx < currentIndex || answers[q.id] !== undefined
                     return (
                       <button
                         key={q.id}
                         onClick={() => setCurrentIndex(globalIdx)}
                         className={cn(
                           "h-10 rounded-lg font-medium text-sm flex items-center justify-center transition-all border",
                           isActive ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200 ring-offset-1" : 
                           isPast ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200" :
                           "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                         )}
                       >
                         {globalIdx + 1}
                       </button>
                     )
                   })}
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* Main Content - Right Column */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
           <div>
             <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{currentQuestion.sectionTitle}</span>
             <h2 className="text-2xl font-bold text-slate-800 mt-1">Câu hỏi {currentIndex + 1} <span className="text-slate-400 text-lg font-medium">/ {flatQuestions.length}</span></h2>
           </div>
           <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm border border-blue-200">
             {currentQuestion.type.replace(/_/g, ' ')}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-slate-50/30">
          <div className="shrink-0 bg-white p-5 rounded-xl border border-slate-200 mb-6 shadow-sm relative overflow-hidden group">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
           <div 
             className="text-slate-700 font-medium text-lg leading-relaxed ml-2 prose prose-p:my-1 prose-strong:text-blue-700 max-w-none"
             dangerouslySetInnerHTML={{ __html: currentQuestion.instruction }}
           />
          </div>

          <div className="flex-1 relative">
            {isSubmitting ? (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-600 font-medium">Đang lưu kết quả...</p>
              </div>
            ) : null}
            <QuestionRenderer 
              key={currentQuestion.id}
              question={currentQuestion} 
              value={answers[currentQuestion.id]}
              onChange={onChange}
              onComplete={onComplete} 
            />
          </div>
        </div>

        <div className="p-5 bg-white border-t flex justify-between items-center shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-10">
           <Button 
             variant="outline" 
             size="lg"
             onClick={handlePrevious} 
             disabled={currentIndex === 0 || isSubmitting}
             className="px-6 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
           >
             <ChevronLeft className="w-5 h-5 mr-2" />
             Câu trước
           </Button>
           
           <Button 
             size="lg"
             onClick={() => handleNext()} 
             disabled={isSubmitting}
             className={cn("px-8 font-bold text-base shadow-md transition-all hover:-translate-y-0.5", currentIndex === flatQuestions.length - 1 ? "bg-emerald-600 hover:bg-emerald-700 ring-emerald-200 ring-offset-2 focus:ring-4" : "bg-blue-600 hover:bg-blue-700 ring-blue-200 ring-offset-2 focus:ring-4")}
           >
             {currentIndex === flatQuestions.length - 1 ? "Nộp bài toàn bộ" : "Câu tiếp theo"}
             {currentIndex !== flatQuestions.length - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
           </Button>
        </div>
      </div>
    </div>
  )
}
