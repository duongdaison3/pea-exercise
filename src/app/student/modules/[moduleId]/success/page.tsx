'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"

export default function SuccessPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params)
  const [isGrading, setIsGrading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const startGrading = async () => {
      try {
        const res = await fetch(`/api/grade/ai-process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId })
        })
        if (res.ok && isMounted) {
          setIsGrading(false)
        }
      } catch (error) {
        console.error("Lỗi khi chấm điểm:", error)
        if (isMounted) setIsGrading(false)
      }
    }

    startGrading()
    return () => { isMounted = false }
  }, [moduleId])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-green-100 relative overflow-hidden">
        {isGrading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-100">
            <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
          </div>
        )}
        
        <CardHeader className={`${isGrading ? 'bg-blue-50/50 border-blue-100' : 'bg-green-50/50 border-green-100'} border-b rounded-t-xl py-10 flex flex-col items-center transition-colors duration-500`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${isGrading ? 'bg-blue-100' : 'bg-green-100'}`}>
            {isGrading ? (
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
          </div>
          <CardTitle className={`text-2xl font-bold ${isGrading ? 'text-blue-900' : 'text-green-900'}`}>
            {isGrading ? 'Đang chấm điểm...' : 'Nộp bài thành công!'}
          </CardTitle>
          <CardDescription className="text-base mt-3 text-slate-600 leading-relaxed px-4">
            {isGrading 
              ? 'Hệ thống AI giám khảo đang phân tích bài làm của bạn. Quá trình này có thể mất ít phút, vui lòng không đóng trang.'
              : 'Bạn đã hoàn thành bài thi. Điểm số từ AI đã được ghi nhận và Giáo viên sẽ tiến hành duyệt lại.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 pb-8 flex flex-col space-y-4">
          <Button 
            onClick={() => router.push(`/student/modules/${moduleId}/results`)}
            disabled={isGrading}
            size="lg" 
            className={`w-full transition-all ${isGrading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isGrading ? (
              <>Đang xử lý kết quả...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Xem kết quả chi tiết
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full text-slate-600">
            <Link href="/student">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  )
}
