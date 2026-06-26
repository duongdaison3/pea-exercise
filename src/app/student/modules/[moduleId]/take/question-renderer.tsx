'use client'

import { SpeakingComponent } from "./speaking-component"
import { WritingComponent } from "./writing-component"
import { ReadingComponent } from "./reading-component"
import { ListeningComponent } from "./listening-component"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QuestionRenderer({ question, value, onChange, onComplete }: { question: any, value?: any, onChange?: (val: any) => void, onComplete: (data: Blob | string) => void }) {
  
  switch (question.type) {
    case 'READ_ALOUD':
    case 'DESCRIBE_IMAGE':
    case 'REPEAT_SENTENCE':
    case 'RETELL_LECTURE':
    case 'ANSWER_SHORT_QUESTION':
      return <SpeakingComponent question={question} onComplete={onComplete as (b: Blob) => void} />
      
    case 'SUMMARIZE_WRITTEN_TEXT':
    case 'WRITE_ESSAY':
    case 'SUMMARIZE_SPOKEN_TEXT':
    case 'WRITE_FROM_DICTATION':
      return <WritingComponent question={question} value={value} onChange={onChange} onComplete={onComplete as (s: string) => void} />

    case 'MULTIPLE_CHOICE_SINGLE':
    case 'MULTIPLE_CHOICE_MULTIPLE':
    case 'REORDER_PARAGRAPHS':
    case 'FIB_READING_WRITING':
    case 'FIB_READING':
      return <ReadingComponent question={question} value={value} onChange={onChange} onComplete={onComplete as (s: string) => void} />

    case 'HIGHLIGHT_CORRECT_SUMMARY':
    case 'SELECT_MISSING_WORD':
    case 'HIGHLIGHT_INCORRECT_WORDS':
    case 'FIB_LISTENING':
      return <ListeningComponent question={question} value={value} onChange={onChange} onComplete={onComplete as (s: string) => void} />
      
    default:
      return (
        <div className="p-8 text-center text-slate-500 bg-slate-100 rounded-xl border border-dashed border-slate-300">
          Chưa hỗ trợ định dạng câu hỏi này: {question.type}
        </div>
      )
  }
}
