'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Clock, Volume2, AlertCircle, CheckCircle } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WritingComponent({ question, value, onChange, onComplete }: { question: any, value?: any, onChange?: (val: any) => void, onComplete: (data: string) => void }) {
  const content = JSON.parse(question.content)
  const timeLimit = content.timeLimit || 600
  
  // Provide local fallback if onChange is not provided
  const [localText, setLocalText] = useState('')
  const text = value !== undefined ? value : localText
  const setText = onChange || setLocalText

  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const textRef = useRef(text)
  useEffect(() => { textRef.current = text }, [text])

  const requiresAudio = ['SUMMARIZE_SPOKEN_TEXT', 'WRITE_FROM_DICTATION'].includes(question.type)

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const minWords = content.minWords || 0
  const maxWords = content.maxWords || Infinity
  const isWordCountValid = wordCount >= minWords && wordCount <= maxWords

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          clearInterval(timer)
          onComplete(textRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playAudio = () => {
    if (audioRef.current && !hasPlayed) {
      setIsPlaying(true)
      audioRef.current.play()
    }
  }

  useEffect(() => {
    if (content.audioUrl) {
      audioRef.current = new Audio(content.audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setHasPlayed(true)
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [content.audioUrl])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border shadow-sm">
        <div className="flex items-center text-slate-600 font-medium">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          Thời gian còn lại:
        </div>
        <div className={`text-xl font-bold font-mono ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {requiresAudio && content.audioUrl && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 text-lg">Audio Player</h3>
            <p className="text-sm text-slate-500">
              Bạn chỉ được nghe đoạn audio này duy nhất 1 lần. Không thể tua.
            </p>
          </div>
          
          <Button 
            onClick={playAudio} 
            disabled={hasPlayed || isPlaying}
            size="lg"
            className={`w-48 rounded-full ${hasPlayed ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isPlaying ? (
              <><Volume2 className="w-5 h-5 mr-2 animate-pulse" /> Đang phát...</>
            ) : hasPlayed ? (
              <><CheckCircle className="w-5 h-5 mr-2" /> Đã nghe xong</>
            ) : (
              <><PlayCircle className="w-5 h-5 mr-2" /> Phát Audio</>
            )}
          </Button>
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onCopy={handleCopyPaste}
            onCut={handleCopyPaste}
            onPaste={handleCopyPaste}
            placeholder="Viết câu trả lời của bạn vào đây..."
            className="min-h-[300px] text-lg leading-relaxed p-6 resize-y bg-white focus-visible:ring-blue-500"
            spellCheck={false}
          />
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${isWordCountValid ? 'text-green-600' : 'text-red-500'}`}>
              Số từ: {wordCount}
            </span>
            <span className="text-sm text-slate-500">
              (Yêu cầu: {minWords} - {maxWords === Infinity ? 'Không giới hạn' : maxWords} từ)
            </span>
          </div>

          {!isWordCountValid && wordCount > 0 && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Độ dài bài viết chưa đạt yêu cầu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
