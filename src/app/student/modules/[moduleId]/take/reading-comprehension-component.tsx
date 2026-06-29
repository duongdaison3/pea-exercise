'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReadingComprehensionComponent({ question, value, onChange }: { question: any, value?: any, onChange?: (val: any) => void }) {
  const content = JSON.parse(question.content)
  
  // Use parent's onChange if provided, otherwise fallback to local state (for standalone usage)
  const [localAnswer, setLocalAnswer] = useState<any>({})
  
  const currentAnswers = value !== undefined ? value : localAnswer
  const handleChange = (subIdx: string, selectedVal: string) => {
    const newAnswers = { ...currentAnswers, [subIdx]: selectedVal }
    if (onChange) {
      onChange(newAnswers)
    } else {
      setLocalAnswer(newAnswers)
    }
  }

  const subQuestions = content.subQuestions || []

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full mx-auto h-[600px]">
      
      {/* Cột trái: Đoạn văn (Cuộn độc lập) */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-4 bg-slate-50 border-b">
          <h3 className="font-bold text-slate-800">Reading Passage</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
          <div 
            className="prose prose-slate max-w-none prose-p:my-2 prose-headings:my-3 text-lg leading-relaxed text-slate-800"
            dangerouslySetInnerHTML={{ __html: content.text || '' }}
          />
        </div>
      </div>

      {/* Cột phải: Danh sách câu hỏi con (Cuộn độc lập) */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-4 bg-slate-50 border-b">
          <h3 className="font-bold text-slate-800">Questions ({subQuestions.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 space-y-8">
          {subQuestions.map((subQ: any, qIdx: number) => (
            <div key={qIdx} className="space-y-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
              <h4 className="font-semibold text-lg text-slate-800">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm mr-2">{qIdx + 1}</span>
                {subQ.questionText}
              </h4>
              <RadioGroup 
                value={currentAnswers[qIdx.toString()] || ''} 
                onValueChange={(val) => handleChange(qIdx.toString(), val)} 
                className="space-y-3 pl-8"
              >
                {Array.isArray(subQ.options) && subQ.options.map((opt: any, oIdx: number) => {
                  const optValue = typeof opt === 'object' ? opt.value : opt;
                  return (
                    <div key={oIdx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value={optValue} id={`q${qIdx}-opt${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-opt${oIdx}`} className="flex-1 cursor-pointer text-base font-normal leading-relaxed">{optValue}</Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
