'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"

export function FeedbackDialog({ 
  teacherScore, teacherFeedback, aiScore, aiFeedback 
}: { 
  teacherScore: number | null, 
  teacherFeedback: string | null,
  aiScore: number | null,
  aiFeedback: string | null
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50" />}>
        <MessageSquare className="w-4 h-4 mr-2" /> Xem nhận xét
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết điểm & Nhận xét</DialogTitle>
          <DialogDescription>
            Đánh giá từ Hệ thống AI và Giáo viên phụ trách.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 border-b pb-2 flex justify-between">
              <span>Nhận xét của Giáo viên</span>
              <span className="text-blue-600">{teacherScore ? `${teacherScore} điểm` : 'Chưa có điểm'}</span>
            </h4>
            <div className="text-sm text-slate-700 bg-blue-50/50 p-4 rounded-md border border-blue-100 whitespace-pre-wrap leading-relaxed">
              {teacherFeedback || "Không có nhận xét chi tiết."}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 border-b pb-2 flex justify-between">
              <span>Đánh giá từ hệ thống AI</span>
              <span className="text-purple-600">{aiScore ? `${aiScore} điểm` : 'Chưa có điểm'}</span>
            </h4>
            <div className="text-sm text-slate-700 bg-purple-50/50 p-4 rounded-md border border-purple-100 whitespace-pre-wrap leading-relaxed">
              {aiFeedback || "Không có nhận xét chi tiết."}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
