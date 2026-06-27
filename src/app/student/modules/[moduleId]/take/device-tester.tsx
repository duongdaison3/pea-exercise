'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Mic, Volume2, AlertCircle, CheckCircle2, Play } from "lucide-react"

interface DeviceTesterProps {
  onComplete: () => void;
}

export function DeviceTester({ onComplete }: DeviceTesterProps) {
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [speakerStatus, setSpeakerStatus] = useState<'idle' | 'playing' | 'success'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const testSpeaker = () => {
    setSpeakerStatus('playing')
    // A simple beep sound
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = 440; // A4 note
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    
    osc.start();
    osc.stop(ctx.currentTime + 1); // Play for 1 second

    setTimeout(() => {
      setSpeakerStatus('success')
    }, 1000)
  }

  const testMicrophone = async () => {
    setMicStatus('testing')
    setErrorMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setMicStatus('success')
    } catch (err) {
      console.error(err)
      setMicStatus('error')
      setErrorMessage('Không thể truy cập Microphone. Vui lòng cấp quyền trong trình duyệt.')
    }
  }

  const isReady = micStatus === 'success' && speakerStatus === 'success'

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-blue-100">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-2xl text-blue-900">Kiểm tra Thiết bị</CardTitle>
          <CardDescription>
            Trước khi bắt đầu phần thi nói, vui lòng đảm bảo Loa và Microphone của bạn hoạt động tốt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Speaker Test */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${speakerStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                {speakerStatus === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Kiểm tra Loa</h3>
                <p className="text-sm text-slate-500">Nghe thử âm thanh hệ thống</p>
              </div>
            </div>
            <Button 
              variant={speakerStatus === 'success' ? "outline" : "default"}
              onClick={testSpeaker}
              disabled={speakerStatus === 'playing'}
            >
              <Play className="h-4 w-4 mr-2" />
              {speakerStatus === 'playing' ? 'Đang phát...' : 'Phát thử'}
            </Button>
          </div>

          {/* Microphone Test */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${micStatus === 'success' ? 'bg-green-100 text-green-600' : micStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                {micStatus === 'success' ? <CheckCircle2 className="h-6 w-6" /> : micStatus === 'error' ? <AlertCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Kiểm tra Microphone</h3>
                <p className="text-sm text-slate-500">Cho phép trình duyệt truy cập Mic</p>
              </div>
            </div>
            <Button 
              variant={micStatus === 'success' ? "outline" : "default"}
              onClick={testMicrophone}
              disabled={micStatus === 'testing' || micStatus === 'success'}
            >
              {micStatus === 'testing' ? 'Đang kiểm tra...' : micStatus === 'success' ? 'Đã kết nối' : 'Cấp quyền'}
            </Button>
          </div>
          
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button 
            size="lg" 
            onClick={onComplete}
            disabled={!isReady}
            className="w-full sm:w-auto font-semibold"
          >
            Sẵn sàng làm bài
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
