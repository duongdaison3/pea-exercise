/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, PlayCircle, Loader2 } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SpeakingComponent({ question, onComplete }: { question: any, onComplete: (blob: Blob) => void }) {
  const content = JSON.parse(question.content)
  const prepTime = content.prepTime || 10
  const recordTime = content.recordTime || 40
  
  const [status, setStatus] = useState<'idle' | 'playing_audio' | 'preparing' | 'recording' | 'finished'>('idle')
  const [timeLeft, setTimeLeft] = useState(prepTime)
  const [progress, setProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startPreparation = useCallback(() => {
    setStatus('preparing')
    setTimeLeft(prepTime)
    setProgress(0)
  }, [prepTime])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        setStatus('finished')
        onComplete(audioBlob)
      }

      mediaRecorder.start()
      setStatus('recording')
      setTimeLeft(recordTime)
      setProgress(0)
    } catch (err) {
      console.error("Could not start recording", err)
      setStatus('finished')
      onComplete(new Blob()) 
    }
  }, [recordTime, onComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  useEffect(() => {
    if (content.audioUrl) {
      setStatus('playing_audio')
      audioRef.current = new Audio(content.audioUrl)
      audioRef.current.onended = () => {
        startPreparation()
      }
      audioRef.current.play().catch(e => {
        console.error("Auto-play blocked", e)
        startPreparation()
      })
    } else {
      startPreparation()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (status === 'preparing') {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((t: number) => t - 1)
          setProgress(((prepTime - (timeLeft - 1)) / prepTime) * 100)
        }, 1000)
      } else {
        startRecording()
      }
    } else if (status === 'recording') {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((t: number) => t - 1)
          setProgress(((recordTime - (timeLeft - 1)) / recordTime) * 100)
        }, 1000)
      } else {
        stopRecording()
      }
    }

    return () => clearTimeout(timer)
  }, [timeLeft, status, prepTime, recordTime, startRecording, stopRecording])


  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl mx-auto">
      
      {content.imageUrl && (
        <div className="w-full bg-slate-100 rounded-xl overflow-hidden border p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.imageUrl} alt="Describe Image" className="w-full h-auto object-contain max-h-[300px]" />
        </div>
      )}

      {content.text && (
        <div className="w-full bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-lg leading-relaxed text-slate-800 shadow-sm">
          {content.text}
        </div>
      )}

      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        {status === 'playing_audio' && (
          <div className="flex flex-col items-center space-y-4 text-blue-600">
            <PlayCircle className="h-12 w-12 animate-pulse" />
            <p className="font-semibold text-lg animate-pulse">Đang phát Audio bài nghe...</p>
          </div>
        )}

        {status === 'preparing' && (
          <div className="flex flex-col items-center space-y-4 text-amber-600">
            <Loader2 className="h-12 w-12 animate-spin" />
            <h3 className="font-bold text-xl">Chuẩn bị: {timeLeft}s</h3>
            <Progress value={progress} className="h-2 w-full bg-amber-100" />
            <p className="text-sm text-slate-500">Microphone sẽ tự động bật khi hết giờ.</p>
          </div>
        )}

        {status === 'recording' && (
          <div className="flex flex-col items-center space-y-4 text-red-600">
            <Mic className="h-12 w-12 animate-pulse" />
            <h3 className="font-bold text-xl">Đang ghi âm: {timeLeft}s</h3>
            <Progress value={progress} className="h-2 w-full bg-red-100" />
            <Button onClick={stopRecording} variant="destructive" className="mt-4 px-8 rounded-full shadow-md hover:shadow-lg transition-all">
              <Square className="h-4 w-4 mr-2" />
              Nộp bài sớm
            </Button>
          </div>
        )}

        {status === 'finished' && (
          <div className="flex flex-col items-center space-y-4 text-green-600">
            <Mic className="h-12 w-12" />
            <h3 className="font-bold text-xl">Đã ghi âm xong</h3>
            <p className="text-sm text-slate-500">Đang lưu kết quả...</p>
          </div>
        )}
      </div>

    </div>
  )
}
