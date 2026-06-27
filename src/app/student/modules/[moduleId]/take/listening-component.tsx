/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PlayCircle, Volume2, CheckCircle, Clock } from "lucide-react"

export function ListeningComponent({ question, value, onChange, onComplete }: { question: any, value?: any, onChange?: (val: any) => void, onComplete: (data: string) => void }) {
  const content = JSON.parse(question.content)
  
  const [localAnswer, setLocalAnswer] = useState<any>(null)
  const answer = value !== undefined ? value : localAnswer
  const setAnswer = onChange || setLocalAnswer

  const [hasPlayed, setHasPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const answerRef = useRef(answer)
  useEffect(() => { answerRef.current = answer }, [answer])

  useEffect(() => {
    if (content.audioUrl) {
      audioRef.current = new Audio(content.audioUrl)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setHasPlayed(true)
      }
      
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true)
        }).catch(e => {
          console.error("Auto-play blocked by browser. User must click to play.", e)
        })
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [content.audioUrl])

  const manualPlayAudio = () => {
    if (audioRef.current && !hasPlayed && !isPlaying) {
      setIsPlaying(true)
      audioRef.current.play().catch(e => console.error("Play failed", e))
    }
  }

  const renderContent = () => {
    switch (question.type) {
      case 'HIGHLIGHT_CORRECT_SUMMARY':
      case 'SELECT_MISSING_WORD':
        return <MultipleChoice content={content} value={answer} onChange={setAnswer} />
      case 'HIGHLIGHT_INCORRECT_WORDS':
        return <HighlightIncorrectWords content={content} value={answer} onChange={setAnswer} />
      case 'FIB_LISTENING':
        return <FIBListening content={content} value={answer} onChange={setAnswer} />
      default:
        return <div className="text-red-500">Unsupported listening type: {question.type}</div>
    }
  }

  return (
    <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto">
      
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h3 className="font-semibold text-slate-800 text-lg">Audio Player</h3>
          <p className="text-sm text-slate-500 mb-2">
            Audio sẽ tự động phát (nếu trình duyệt cho phép). Bạn chỉ được nghe **duy nhất 1 lần**.
          </p>
        </div>
        
        <Button 
          onClick={manualPlayAudio} 
          disabled={hasPlayed || isPlaying}
          size="lg"
          className={`w-56 rounded-full shadow-md transition-all ${hasPlayed ? 'bg-slate-300 text-slate-500' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isPlaying ? (
            <><Volume2 className="w-5 h-5 mr-2 animate-pulse" /> Đang phát audio...</>
          ) : hasPlayed ? (
            <><CheckCircle className="w-5 h-5 mr-2" /> Đã nghe xong</>
          ) : (
            <><PlayCircle className="w-5 h-5 mr-2" /> Bấm để phát Audio</>
          )}
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        {renderContent()}
      </div>

    </div>
  )
}

function MultipleChoice({ content, value, onChange }: any) {
  return (
    <div className="space-y-6">
      {content.text && <div className="text-lg leading-relaxed text-slate-800 bg-slate-50 p-6 rounded-xl border mb-6">{content.text}</div>}
      <RadioGroup value={value || ''} onValueChange={onChange} className="space-y-3">
        {Array.isArray(content.options) && content.options.map((opt: any, idx: number) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          return (
            <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <RadioGroupItem value={optValue} id={`radio-${idx}`} />
              <Label htmlFor={`radio-${idx}`} className="flex-1 cursor-pointer text-base font-normal leading-relaxed">{optValue}</Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

function HighlightIncorrectWords({ content, value, onChange }: any) {
  // Tách từ bằng khoảng trắng, nhưng cần giữ lại dấu câu dính liền hoặc tách biệt tùy logic. 
  // Cách đơn giản nhất là cắt theo khoảng trắng.
  const words = content.transcript ? content.transcript.trim().split(/\s+/) : []
  const selected = value || [] // Format: ["3_word", "7_apple"]

  const toggleWord = (idx: number, word: string) => {
    const id = `${idx}_${word}`
    if (selected.includes(id)) {
      onChange(selected.filter((x: string) => x !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 italic mb-4">Click vào những từ bạn nghe thấy sai so với Audio:</p>
      <div className="text-lg leading-loose text-slate-800 bg-slate-50 p-6 rounded-xl border">
        {words.map((word: string, idx: number) => {
          const id = `${idx}_${word}`
          const isHighlighted = selected.includes(id)
          return (
            <span 
              key={idx} 
              onClick={() => toggleWord(idx, word)}
              className={`cursor-pointer px-1 mx-[2px] rounded transition-all duration-200 ${isHighlighted ? 'bg-yellow-300 text-yellow-900 font-semibold shadow-sm' : 'hover:bg-slate-200'}`}
            >
              {word}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function FIBListening({ content, value, onChange }: any) {
  const parts = content.text ? content.text.split(/(\[BLANK_\d+\])/g) : []
  const answers = value || {}

  const handleInput = (blankId: string, val: string) => {
    onChange({ ...answers, [blankId]: val })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 italic mb-4">Gõ chính xác từ bạn nghe được vào ô trống:</p>
      <div className="text-lg leading-loose text-slate-800 bg-slate-50 p-6 rounded-xl border">
        {parts.map((part: string, idx: number) => {
          const match = part.match(/\[(BLANK_\d+)\]/)
          if (match) {
            const blankId = match[1]
            return (
              <input 
                key={idx} 
                type="text"
                className="mx-2 px-2 w-[120px] bg-white border border-slate-300 border-b-2 border-b-blue-400 rounded text-base text-center font-medium focus:ring-0 focus:outline-none focus:border-b-blue-600 transition-colors shadow-sm"
                value={answers[blankId] || ''}
                onChange={(e) => handleInput(blankId, e.target.value)}
                spellCheck={false}
              />
            )
          }
          return <span key={idx}>{part}</span>
        })}
      </div>
    </div>
  )
}
