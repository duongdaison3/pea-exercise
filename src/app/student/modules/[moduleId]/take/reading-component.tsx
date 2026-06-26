/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReadingComponent({ question, value, onChange, onComplete }: { question: any, value?: any, onChange?: (val: any) => void, onComplete: (data: string) => void }) {
  const content = JSON.parse(question.content)
  
  // Use parent's onChange if provided, otherwise fallback to local state (for standalone usage)
  const [localAnswer, setLocalAnswer] = useState<any>(null)
  
  const currentValue = value !== undefined ? value : localAnswer
  const handleChange = onChange || setLocalAnswer

  const renderContent = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE_SINGLE':
        return <MultipleChoiceSingle content={content} value={currentValue} onChange={handleChange} />
      case 'MULTIPLE_CHOICE_MULTIPLE':
        return <MultipleChoiceMultiple content={content} value={currentValue} onChange={handleChange} />
      case 'REORDER_PARAGRAPHS':
        return <ReorderParagraphs content={content} value={currentValue} onChange={handleChange} />
      case 'FIB_READING_WRITING':
        return <FIBDropdown content={content} value={currentValue} onChange={handleChange} />
      case 'FIB_READING':
        return <FIBDragDrop content={content} value={currentValue} onChange={handleChange} />
      default:
        return <div>Unsupported reading type</div>
    }
  }

  return (
    <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        {renderContent()}
      </div>
      {/* We removed the individual Nộp bài button because the global wrapper handles it now */}
    </div>
  )
}

// -------------------------------------------------------------
// Sub-components for each type
// -------------------------------------------------------------

function MultipleChoiceSingle({ content, value, onChange }: any) {
  return (
    <div className="space-y-6">
      {content.text && <div className="text-lg leading-relaxed text-slate-800 bg-slate-50 p-6 rounded-xl border mb-6">{content.text}</div>}
      <RadioGroup value={value || ''} onValueChange={onChange} className="space-y-3">
        {content.options?.map((opt: string, idx: number) => (
          <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value={opt} id={`radio-${idx}`} />
            <Label htmlFor={`radio-${idx}`} className="flex-1 cursor-pointer text-base font-normal leading-relaxed">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

function MultipleChoiceMultiple({ content, value, onChange }: any) {
  const selected = value || []
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((x: string) => x !== opt))
    else onChange([...selected, opt])
  }
  return (
    <div className="space-y-6">
      {content.text && <div className="text-lg leading-relaxed text-slate-800 bg-slate-50 p-6 rounded-xl border mb-6">{content.text}</div>}
      <div className="space-y-3">
        {content.options?.map((opt: string, idx: number) => (
          <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
            <Checkbox 
              id={`chk-${idx}`} 
              checked={selected.includes(opt)}
              onCheckedChange={() => toggle(opt)}
            />
            <Label htmlFor={`chk-${idx}`} className="flex-1 cursor-pointer text-base font-normal leading-relaxed">{opt}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function SortableItem({ id, text }: { id: string, text: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`p-4 bg-white border rounded-lg mb-3 shadow-sm cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : 'hover:border-blue-300'}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0 text-slate-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>
        <p className="text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function ReorderParagraphs({ content, value, onChange }: any) {
  // Initialize value on first render
  useMemo(() => {
    if (!value && content.paragraphs) {
      // Create initial order array based on the original index
      const initial = content.paragraphs.map((_: any, idx: number) => `p-${idx}`)
      onChange(initial)
    }
  }, [content.paragraphs, value, onChange])

  const items = value || content.paragraphs?.map((_: any, idx: number) => `p-${idx}`) || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)
      onChange(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id: string) => {
            const idx = parseInt(id.replace('p-', ''))
            return <SortableItem key={id} id={id} text={content.paragraphs[idx]} />
          })}
        </SortableContext>
      </DndContext>
    </div>
  )
}

function FIBDropdown({ content, value, onChange }: any) {
  const parts = content.text.split(/(\[BLANK_\d+\])/g)
  const answers = value || {}

  const handleSelect = (blankId: string, val: string) => {
    onChange({ ...answers, [blankId]: val })
  }

  return (
    <div className="text-lg leading-loose text-slate-800 bg-white p-6 rounded-xl border">
      {parts.map((part: string, idx: number) => {
        const match = part.match(/\[(BLANK_\d+)\]/)
        if (match) {
          const blankId = match[1]
          const options = content.options[blankId] || []
          return (
            <select 
              key={idx} 
              className="mx-2 p-1.5 min-w-[120px] bg-slate-50 border border-slate-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={answers[blankId] || ''}
              onChange={(e) => handleSelect(blankId, e.target.value)}
            >
              <option value="" disabled></option>
              {options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          )
        }
        return <span key={idx}>{part}</span>
      })}
    </div>
  )
}

function FIBDragDrop({ content, value, onChange }: any) {
  // Simplification for DragDrop: rendering it as a dropdown for now if dnd isn't fully set up for inline text
  // PTE Drag and drop reading fills are essentially inline drop zones.
  // We'll use a simple select fallback if dnd is too complex inline, but the user requested drag drop.
  // Wait, the user specifically said: "Với 'FIB_READING' (Drag Drop)".
  // For now, I will use a simple Select fallback as creating inline droppable zones with @dnd-kit that reflow with text is notoriously tricky (requires measuring and absolute positioning or native HTML5 drag and drop).
  // I will just use native HTML5 drag and drop! It's much easier for inline text!
  
  const parts = content.text.split(/(\[BLANK_\d+\])/g)
  const answers = value || {} // { BLANK_0: "word" }
  const wordBank = content.words || [] // List of words to drag

  // Words still available in bank
  const usedWords = Object.values(answers)
  const availableWords = wordBank.filter((w: string) => !usedWords.includes(w))

  const handleDrop = (e: React.DragEvent, blankId: string) => {
    e.preventDefault()
    const word = e.dataTransfer.getData('text/plain')
    if (wordBank.includes(word)) {
      onChange({ ...answers, [blankId]: word })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word)
  }

  const handleRemove = (blankId: string) => {
    const newAnswers = { ...answers }
    delete newAnswers[blankId]
    onChange(newAnswers)
  }

  return (
    <div className="space-y-8">
      <div className="text-lg leading-loose text-slate-800 bg-white p-8 rounded-xl border shadow-sm">
        {parts.map((part: string, idx: number) => {
          const match = part.match(/\[(BLANK_\d+)\]/)
          if (match) {
            const blankId = match[1]
            const filledWord = answers[blankId]
            return (
              <span 
                key={idx} 
                onDrop={(e) => handleDrop(e, blankId)}
                onDragOver={handleDragOver}
                className={`inline-flex items-center justify-center mx-2 min-w-[100px] h-[34px] px-3 align-middle rounded border-2 border-dashed ${filledWord ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium border-solid' : 'border-slate-300 bg-slate-50'}`}
              >
                {filledWord ? (
                  <span className="flex items-center gap-2">
                    {filledWord}
                    <button onClick={() => handleRemove(blankId)} className="text-blue-400 hover:text-red-500 text-sm ml-1">&times;</button>
                  </span>
                ) : (
                  <span className="text-slate-300 text-sm">Kéo thả...</span>
                )}
              </span>
            )
          }
          return <span key={idx}>{part}</span>
        })}
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Từ vựng (Word Bank)</h4>
        <div className="flex flex-wrap gap-3">
          {availableWords.map((word: string, idx: number) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, word)}
              className="px-4 py-2 bg-white border shadow-sm rounded-lg text-slate-700 font-medium cursor-grab active:cursor-grabbing hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {word}
            </div>
          ))}
          {availableWords.length === 0 && <span className="text-slate-400 italic">Đã dùng hết từ</span>}
        </div>
      </div>
    </div>
  )
}
