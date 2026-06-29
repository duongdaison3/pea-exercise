/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import * as React from "react"
import { useFieldArray } from "react-hook-form"
import { Trash2, ArrowUp, ArrowDown, Plus, X, Edit2, Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const QUESTION_TYPES: Record<string, string> = {
  READ_ALOUD: "Read Aloud",
  REPEAT_SENTENCE: "Repeat Sentence",
  DESCRIBE_IMAGE: "Describe Image",
  RETELL_LECTURE: "Retell Lecture",
  ANSWER_SHORT_QUESTION: "Answer Short Question",
  SUMMARIZE_WRITTEN_TEXT: "Summarize Written Text",
  WRITE_ESSAY: "Write Essay",
  SUMMARIZE_SPOKEN_TEXT: "Summarize Spoken Text",
  WRITE_FROM_DICTATION: "Write From Dictation",
  MULTIPLE_CHOICE_SINGLE: "Multiple Choice (Single)",
  MULTIPLE_CHOICE_MULTIPLE: "Multiple Choice (Multiple)",
  REORDER_PARAGRAPHS: "Reorder Paragraphs",
  FIB_READING_WRITING: "FIB (Reading & Writing)",
  FIB_READING: "FIB (Reading)",
  HIGHLIGHT_CORRECT_SUMMARY: "Highlight Correct Summary",
  SELECT_MISSING_WORD: "Select Missing Word",
  HIGHLIGHT_INCORRECT_WORDS: "Highlight Incorrect Words",
  FIB_LISTENING: "FIB (Listening)"
}

export const QUESTION_DEFAULTS: Record<string, any> = {
  READ_ALOUD: { instruction: '<p><strong>Text appears on the screen. Read the text aloud.</strong></p>', prepTime: 40, recordTime: 40 },
  REPEAT_SENTENCE: { instruction: '<p><strong>After listening to a recording of a sentence, repeat the sentence.</strong></p>', prepTime: 3, recordTime: 15 },
  DESCRIBE_IMAGE: { instruction: '<p><strong>An image appears on the screen. Describe the image in detail.</strong></p>', prepTime: 25, recordTime: 40 },
  RETELL_LECTURE: { instruction: '<p><strong>After listening to or watching a lecture, retell the lecture in your own words.</strong></p>', prepTime: 10, recordTime: 40 },
  ANSWER_SHORT_QUESTION: { instruction: '<p><strong>After listening to a question, answer with a single word or a few words.</strong></p>', prepTime: 3, recordTime: 10 },
  SUMMARIZE_WRITTEN_TEXT: { instruction: '<p><strong>After reading the text, write a one-sentence summary of the passage.</strong></p>', timeLimit: 600, minWords: 5, maxWords: 75 },
  WRITE_ESSAY: { instruction: '<p><strong>Write a 200–300 word essay on a given topic.</strong></p>', timeLimit: 1200, minWords: 200, maxWords: 300 },
  SUMMARIZE_SPOKEN_TEXT: { instruction: '<p><strong>After listening to a recording, write a 50–70 word summary.</strong></p>', timeLimit: 600, minWords: 50, maxWords: 70 },
  WRITE_FROM_DICTATION: { instruction: '<p><strong>You will hear a sentence. Type the sentence in the box below exactly as you hear it. You will hear the sentence only once.</strong></p>' },
  MULTIPLE_CHOICE_SINGLE: { instruction: '<p><strong>After reading the text, answer a multiple-choice question by selecting one response.</strong></p>' },
  MULTIPLE_CHOICE_MULTIPLE: { instruction: '<p><strong>After reading the text, answer a multiple-choice question by selecting more than one response.</strong></p>' },
  REORDER_PARAGRAPHS: { instruction: '<p><strong>Several text boxes appear on the screen in a random order. Put the text boxes in the correct order.</strong></p>' },
  FIB_READING_WRITING: { instruction: '<p><strong>You will see some text with several gaps. Choose the correct words from the drop-down menu to fill in the gaps.</strong></p>' },
  FIB_READING: { instruction: '<p><strong>The text appears on a screen with several gaps in it. Drag words from the box below to fill the gaps.</strong></p>' },
  FIB_LISTENING: { instruction: '<p><strong>A transcript of a recording appears on the screen, with several gaps. After listening to the recording, type the missing word in each gap.</strong></p>' },
  HIGHLIGHT_CORRECT_SUMMARY: { instruction: '<p><strong>After listening to a recording, select the paragraph that best summarizes the recording.</strong></p>' },
  SELECT_MISSING_WORD: { instruction: '<p><strong>After listening to a recording, select the missing word that completes the recording from a list of options.</strong></p>' },
  HIGHLIGHT_INCORRECT_WORDS: { instruction: '<p><strong>The transcript of a recording appears on the screen. While listening to the recording, identify the words in the transcript that differ from what is said.</strong></p>' }
}

export function QuestionCard({ sectionIndex, questionIndex, remove, move, form, isFirst, isLast, sectionsCount }: any) {
  const questionPath = `sections.${sectionIndex}.questions.${questionIndex}`;
  const [isUploading, setIsUploading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const questionType = form.watch(`${questionPath}.type`)
  const instruction = form.watch(`${questionPath}.instruction`) || ""

  const handleUpload = async (file: File, fieldName: string) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        form.setValue(`${questionPath}.${fieldName}`, data.url)
      }
    } catch (e) {
      console.error(e)
    }
    setIsUploading(false)
  }

  const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `${questionPath}.options`
  })

  const showAudio = ['REPEAT_SENTENCE', 'RETELL_LECTURE', 'ANSWER_SHORT_QUESTION', 'SUMMARIZE_SPOKEN_TEXT', 'WRITE_FROM_DICTATION', 'HIGHLIGHT_CORRECT_SUMMARY', 'SELECT_MISSING_WORD', 'HIGHLIGHT_INCORRECT_WORDS', 'FIB_LISTENING'].includes(questionType)
  const showImage = ['DESCRIBE_IMAGE'].includes(questionType)
  const showTranscript = ['RETELL_LECTURE', 'HIGHLIGHT_INCORRECT_WORDS'].includes(questionType)
  const showWordLimits = ['SUMMARIZE_WRITTEN_TEXT', 'WRITE_ESSAY', 'SUMMARIZE_SPOKEN_TEXT'].includes(questionType)
  const showOptions = ['MULTIPLE_CHOICE_SINGLE', 'MULTIPLE_CHOICE_MULTIPLE', 'HIGHLIGHT_CORRECT_SUMMARY', 'SELECT_MISSING_WORD'].includes(questionType)
  const showText = ['FIB_READING_WRITING', 'FIB_READING', 'FIB_LISTENING', 'MULTIPLE_CHOICE_SINGLE', 'MULTIPLE_CHOICE_MULTIPLE'].includes(questionType)
  const showReorderParagraphs = ['REORDER_PARAGRAPHS'].includes(questionType)
  const showSpeakingTimes = ['READ_ALOUD', 'REPEAT_SENTENCE', 'DESCRIBE_IMAGE', 'RETELL_LECTURE', 'ANSWER_SHORT_QUESTION'].includes(questionType)
  const showWritingTime = ['SUMMARIZE_WRITTEN_TEXT', 'WRITE_ESSAY', 'SUMMARIZE_SPOKEN_TEXT'].includes(questionType)

  if (isCollapsed) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-blue-300">
        <div className="flex flex-col gap-1 flex-1 mr-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Câu {questionIndex + 1}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">{QUESTION_TYPES[questionType] || questionType || "Chưa chọn loại"}</span>
          </div>
          <div className="text-sm text-slate-500 line-clamp-1 max-w-[500px]" dangerouslySetInnerHTML={{ __html: instruction || "(Chưa có đề bài)" }} />
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsCollapsed(false)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <Edit2 className="w-4 h-4 mr-2" /> Sửa câu hỏi
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(questionIndex)} className="text-slate-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
      <div className="absolute top-4 left-4 flex space-x-2 items-center">
        <span className="text-sm text-slate-500 font-medium">Câu {questionIndex + 1}</span>
        {sectionsCount > 1 && (
          <Select
            value={sectionIndex.toString()}
            onValueChange={(val) => {
              const targetSection = parseInt(val);
              if (targetSection !== sectionIndex) {
                const currentQuestion = form.getValues(questionPath);
                remove(questionIndex);
                const targetQuestions = form.getValues(`sections.${targetSection}.questions`) || [];
                form.setValue(`sections.${targetSection}.questions`, [...targetQuestions, currentQuestion]);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs w-auto border-dashed">
              <span data-slot="select-value" className="line-clamp-1 flex items-center">
                {sectionIndex !== undefined ? `Phần ${sectionIndex + 1}` : "Chuyển phần..."}
              </span>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: sectionsCount }).map((_: any, i: number) => (
                <SelectItem key={i} value={i.toString()}>Phần {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="absolute top-4 right-4 flex space-x-1">
        <Button type="button" variant="ghost" size="icon" disabled={isFirst} onClick={() => move(questionIndex, questionIndex - 1)}>
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isLast} onClick={() => move(questionIndex, questionIndex + 1)}>
          <ArrowDown className="w-4 h-4" />
        </Button>
        <Button type="button" variant="destructive" size="icon" onClick={() => remove(questionIndex)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6 mt-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <FormField
            control={form.control}
            name={`${questionPath}.type`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Loại câu hỏi (Question Type)</FormLabel>
                <Select 
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    const defaults = QUESTION_DEFAULTS[val]
                    if (defaults) {
                      const currentInst = form.getValues(`${questionPath}.instruction`)
                      const isDefaultInst = !currentInst || currentInst === '<p></p>' || Object.values(QUESTION_DEFAULTS).some(d => d.instruction === currentInst)
                      if (isDefaultInst) {
                        form.setValue(`${questionPath}.instruction`, defaults.instruction)
                      }
                      if (defaults.prepTime !== undefined) form.setValue(`${questionPath}.prepTime`, defaults.prepTime)
                      if (defaults.recordTime !== undefined) form.setValue(`${questionPath}.recordTime`, defaults.recordTime)
                      if (defaults.timeLimit !== undefined) form.setValue(`${questionPath}.timeLimit`, defaults.timeLimit)
                      if (defaults.minWords !== undefined) form.setValue(`${questionPath}.minWords`, defaults.minWords)
                      if (defaults.maxWords !== undefined) form.setValue(`${questionPath}.maxWords`, defaults.maxWords)
                    }
                  }} 
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-white">
                      <span data-slot="select-value" className={cn("line-clamp-1 flex items-center", !field.value && "text-muted-foreground")}>
                        {field.value ? QUESTION_TYPES[field.value] || field.value : "Chọn loại bài..."}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Speaking</SelectLabel>
                      <SelectItem value="READ_ALOUD">Read Aloud</SelectItem>
                      <SelectItem value="REPEAT_SENTENCE">Repeat Sentence</SelectItem>
                      <SelectItem value="DESCRIBE_IMAGE">Describe Image</SelectItem>
                      <SelectItem value="RETELL_LECTURE">Retell Lecture</SelectItem>
                      <SelectItem value="ANSWER_SHORT_QUESTION">Answer Short Question</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Writing</SelectLabel>
                      <SelectItem value="SUMMARIZE_WRITTEN_TEXT">Summarize Written Text</SelectItem>
                      <SelectItem value="WRITE_ESSAY">Write Essay</SelectItem>
                      <SelectItem value="SUMMARIZE_SPOKEN_TEXT">Summarize Spoken Text</SelectItem>
                      <SelectItem value="WRITE_FROM_DICTATION">Write From Dictation</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Reading</SelectLabel>
                      <SelectItem value="MULTIPLE_CHOICE_SINGLE">Multiple Choice (Single)</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE_MULTIPLE">Multiple Choice (Multiple)</SelectItem>
                      <SelectItem value="REORDER_PARAGRAPHS">Reorder Paragraphs</SelectItem>
                      <SelectItem value="FIB_READING_WRITING">FIB (Reading & Writing)</SelectItem>
                      <SelectItem value="FIB_READING">FIB (Reading)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Listening</SelectLabel>
                      <SelectItem value="HIGHLIGHT_CORRECT_SUMMARY">Highlight Correct Summary</SelectItem>
                      <SelectItem value="SELECT_MISSING_WORD">Select Missing Word</SelectItem>
                      <SelectItem value="HIGHLIGHT_INCORRECT_WORDS">Highlight Incorrect Words</SelectItem>
                      <SelectItem value="FIB_LISTENING">FIB (Listening)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {form.watch("scoringMode") === "PER_QUESTION" && (
            <FormField
              control={form.control}
              name={`${questionPath}.score`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-700 font-semibold">Điểm số</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.5" className="w-32 bg-amber-50 focus-visible:ring-amber-500 font-bold" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name={`${questionPath}.instruction`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đề bài / Hướng dẫn (Instruction)</FormLabel>
              <FormControl>
                <RichTextEditor placeholder="VD: Look at the text below..." value={field.value || ''} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {showSpeakingTimes && (
          <div className="flex space-x-6">
            <FormField
              control={form.control}
              name={`${questionPath}.prepTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TG Chuẩn bị (giây)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="w-32 bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${questionPath}.recordTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TG Ghi âm (giây)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="w-32 bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {showWritingTime && (
          <div className="flex space-x-6">
            <FormField
              control={form.control}
              name={`${questionPath}.timeLimit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới hạn TG làm bài (giây)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="w-48 bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {showText && (
          ['FIB_READING_WRITING', 'FIB_READING', 'FIB_LISTENING'].includes(questionType) ? (
            <FIBBuilder questionPath={questionPath} form={form} />
          ) : (
            <FormField
              control={form.control}
              name={`${questionPath}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung đoạn văn</FormLabel>
                  <FormControl>
                    <RichTextEditor placeholder="Nhập đoạn văn của bạn..." value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        )}

        {showAudio && (
          <FormField
            control={form.control}
            name={`${questionPath}.audioUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Audio</FormLabel>
                <div className="flex items-center space-x-4">
                  <Input 
                    type="file" 
                    accept="audio/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0], 'audioUrl')
                      }
                    }} 
                    className="max-w-[250px] bg-white cursor-pointer"
                  />
                  {isUploading && <span className="text-sm text-blue-500 animate-pulse">Đang tải...</span>}
                  {field.value && <audio controls src={field.value} className="h-10" />}
                </div>
              </FormItem>
            )}
          />
        )}

        {showImage && (
          <FormField
            control={form.control}
            name={`${questionPath}.imageUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Hình ảnh</FormLabel>
                <div className="flex items-center space-x-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0], 'imageUrl')
                      }
                    }} 
                    className="max-w-[250px] bg-white cursor-pointer"
                  />
                  {isUploading && <span className="text-sm text-blue-500 animate-pulse">Đang tải...</span>}
                  {field.value && <img src={field.value} alt="Preview" className="h-20 rounded shadow-sm border" />}
                </div>
              </FormItem>
            )}
          />
        )}

        {showTranscript && (
          questionType === 'HIGHLIGHT_INCORRECT_WORDS' ? (
            <HighlightIncorrectBuilder questionPath={questionPath} form={form} />
          ) : (
            <FormField
              control={form.control}
              name={`${questionPath}.transcript`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcript (Nội dung của Audio)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Văn bản gốc để đối chiếu..." className="bg-white min-h-[80px]" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        )}

        {showWordLimits && (
          <div className="flex space-x-6">
            <FormField
              control={form.control}
              name={`${questionPath}.minWords`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ tối thiểu</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="w-32 bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${questionPath}.maxWords`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ tối đa</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="w-32 bg-white" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {showOptions && (
          <div className="space-y-4 border border-slate-200 p-5 rounded-lg bg-white">
            <Label className="text-slate-700 font-semibold block mb-2">Các lựa chọn đáp án</Label>
            {options.map((option: any, optIndex: number) => (
              <div key={option.id} className="flex items-center space-x-3">
                <FormField
                  control={form.control}
                  name={`${questionPath}.options.${optIndex}.isCorrect`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${questionPath}.options.${optIndex}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Lựa chọn ${optIndex + 1}`} className="w-full" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optIndex)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ value: '', isCorrect: false })}>
              <Plus className="w-4 h-4 mr-2" /> Thêm đáp án
            </Button>
          </div>
        )}

        {showReorderParagraphs && (
          <ReorderParagraphsBuilder questionPath={questionPath} form={form} />
        )}

      </div>
      
      <div className="mt-6 flex justify-end pt-4 border-t border-slate-200">
        <Button type="button" onClick={() => setIsCollapsed(true)} className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm">
          <Save className="w-4 h-4 mr-2" /> Lưu câu hỏi (Thu gọn)
        </Button>
      </div>
    </div>
  )
}

import { UseFormReturn } from "react-hook-form"

function FIBBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
  
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: `${questionPath}.options`
  })

  const handleCreateBlank = () => {
    const el = textAreaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) {
      alert("Vui lòng bôi đen một từ để tạo chỗ trống!")
      return
    }
    const text = form.getValues(`${questionPath}.text`) || ""
    const selectedWord = text.substring(start, end).trim()
    
    // Tìm index mới nhất dựa trên độ dài hiện tại của mảng options
    const currentOptions = form.getValues(`${questionPath}.options`) || []
    const blankCount = currentOptions.length
    const blankTag = `[BLANK_${blankCount}]`
    
    const newText = text.substring(0, start) + blankTag + text.substring(end)
    form.setValue(`${questionPath}.text`, newText)
    
    form.setValue(`${questionPath}.options`, [...currentOptions, { value: selectedWord, isCorrect: true }])
  }

  return (
    <div className="space-y-3 p-4 border border-blue-200 bg-blue-50/30 rounded-lg">
      <div className="flex justify-between items-end">
        <Label className="text-blue-900 font-semibold">Đoạn văn (Tạo chỗ trống)</Label>
        <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateBlank}>
          Tạo chỗ trống từ đoạn bôi đen
        </Button>
      </div>
      <FormField
        control={form.control}
        name={`${questionPath}.text`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                {...field} 
                ref={(e) => {
                  field.ref(e)
                  textAreaRef.current = e
                }}
                placeholder="Dán đoạn văn vào đây, bôi đen từ và bấm 'Tạo chỗ trống'..." 
                className="min-h-[150px] font-mono text-base leading-relaxed bg-white border-blue-200"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <p className="text-xs text-blue-600">Bôi đen một từ trong Textarea trên rồi bấm nút, hệ thống sẽ tự sinh thẻ [BLANK_X] và chèn đáp án vào bên dưới.</p>

      {fields.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-blue-900 font-semibold text-sm">Các ô trống đã tạo:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border border-blue-100 shadow-sm">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded w-[85px] text-center shrink-0">[BLANK_{idx}]</span>
                <FormField
                  control={form.control}
                  name={`${questionPath}.options.${idx}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input className="h-8 text-sm border-blue-200" placeholder="Đáp án đúng..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 shrink-0" onClick={() => remove(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HighlightIncorrectBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {
  const transcript = form.watch(`${questionPath}.transcript`) || ""
  const words = transcript.split(/\s+/)
  const incorrectWords = form.watch(`${questionPath}.incorrectWords`) || []

  const toggleIncorrectWord = (wordIndex: number, original: string) => {
    const exists = incorrectWords.find((w: { index: number }) => w.index === wordIndex)
    if (exists) {
      form.setValue(`${questionPath}.incorrectWords`, incorrectWords.filter((w: { index: number }) => w.index !== wordIndex))
    } else {
      form.setValue(`${questionPath}.incorrectWords`, [...incorrectWords, { index: wordIndex, original, wrong: "" }])
    }
  }

  const updateWrongWord = (wordIndex: number, wrong: string) => {
    const updated = incorrectWords.map((w: { index: number }) => w.index === wordIndex ? { ...w, wrong } : w)
    form.setValue(`${questionPath}.incorrectWords`, updated)
  }

  return (
    <div className="space-y-4 border border-orange-200 p-5 bg-orange-50/30 rounded-xl shadow-sm">
      <FormField
        control={form.control}
        name={`${questionPath}.transcript`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-orange-900 font-semibold">Transcript Gốc (Chưa có từ sai)</FormLabel>
            <FormControl>
              <Textarea {...field} className="min-h-[100px] text-base bg-white border-orange-200" placeholder="Nhập văn bản chuẩn của Audio..." />
            </FormControl>
          </FormItem>
        )}
      />
      
      {transcript && (
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm font-semibold mb-3 text-slate-700">Click vào từ bên dưới để đánh dấu là từ sai:</p>
          <div className="leading-loose text-lg">
            {words.map((word: string, wIdx: number) => {
               const inc = incorrectWords.find((w: any) => w.index === wIdx)
               return (
                 <span key={wIdx} className="relative inline-block mx-1 group">
                   <span 
                     onClick={() => toggleIncorrectWord(wIdx, word)}
                     className={`cursor-pointer px-1 rounded transition-colors ${inc ? 'bg-red-200 text-red-900 font-medium shadow-sm' : 'hover:bg-slate-200 text-slate-800'}`}
                   >
                     {word}
                   </span>
                   {inc && (
                     <div className="absolute top-full left-0 z-10 mt-1 w-32 shadow-lg rounded border border-slate-200">
                       <Input 
                         className="h-8 text-sm bg-white border-red-300 focus-visible:ring-red-500" 
                         placeholder="Từ sai..."
                         value={inc.wrong}
                         onChange={(e) => updateWrongWord(wIdx, e.target.value)}
                       />
                     </div>
                   )}
                 </span>
               )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ReorderParagraphsBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `${questionPath}.paragraphs`
  })

  return (
    <div className="space-y-4 border border-indigo-200 p-5 bg-indigo-50/30 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Label className="text-indigo-900 font-semibold">Danh sách đoạn văn (Theo thứ tự đúng)</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
          <Plus className="w-4 h-4 mr-2" /> Thêm đoạn văn
        </Button>
      </div>
      
      <div className="space-y-3">
        {fields.map((field: any, pIdx: number) => (
          <div key={field.id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex flex-col gap-1 mt-1">
              <Button type="button" variant="ghost" size="icon" disabled={pIdx === 0} onClick={() => move(pIdx, pIdx - 1)} className="h-6 w-6">
                <ArrowUp className="w-4 h-4 text-slate-400" />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={pIdx === fields.length - 1} onClick={() => move(pIdx, pIdx + 1)} className="h-6 w-6">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`${questionPath}.paragraphs.${pIdx}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor placeholder={`Nội dung đoạn ${pIdx + 1}...`} value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(pIdx)} className="mt-1 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-slate-500 italic text-center py-4">Chưa có đoạn văn nào. Bấm nút &quot;Thêm đoạn văn&quot; để bắt đầu.</p>
        )}
      </div>
      <p className="text-xs text-indigo-600 mt-2">Lưu ý: Bạn cần nhập các đoạn văn theo thứ tự đúng. Hệ thống sẽ tự động xáo trộn ngẫu nhiên khi học viên làm bài.</p>
    </div>
  )
}
