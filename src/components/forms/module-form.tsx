/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, Send, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { QuestionCard } from "./question-card"

const questionSchema = z.object({
  id: z.string().optional(),
  type: z.string({ required_error: "Vui lòng chọn loại câu hỏi" }),
  instruction: z.string().min(1, "Vui lòng nhập hướng dẫn (instruction)"),
  audioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  transcript: z.string().optional(),
  minWords: z.coerce.number().optional(),
  maxWords: z.coerce.number().optional(),
  text: z.string().optional(),
  incorrectWords: z.array(z.any()).optional(),
  options: z.array(z.object({ 
    value: z.string(), 
    isCorrect: z.boolean().optional() 
  })).optional(),
  paragraphs: z.array(z.object({ value: z.string() })).optional(),
  score: z.coerce.number().min(0).optional(),
})

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Vui lòng nhập tên phần thi"),
  timeLimit: z.coerce.number().min(0).optional(),
  questions: z.array(questionSchema).optional()
})

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Tên bài test phải có ít nhất 2 ký tự.",
  }),
  description: z.string().optional(),
  classId: z.string({
    required_error: "Vui lòng chọn một lớp học.",
  }),
  timeLimit: z.coerce.number().min(1, {
    message: "Thời gian làm bài phải lớn hơn 0.",
  }),
  passingScore: z.coerce.number().min(0, {
    message: "Điểm đạt tối thiểu không được âm.",
  }),
  deadlineDate: z.date({
    required_error: "Vui lòng chọn ngày hạn chót.",
  }),
  deadlineTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Định dạng giờ không hợp lệ (HH:mm).",
  }),
  scoringMode: z.string().default("TOTAL_DIVIDED"),
  totalScore: z.coerce.number().min(0).optional(),
  sections: z.array(sectionSchema).optional()
}).superRefine((data, ctx) => {
  let total = data.totalScore || 0;
  if (data.scoringMode === 'PER_QUESTION') {
    total = data.sections?.reduce((sum, sec) => sum + (sec.questions?.reduce((qSum, q) => qSum + (Number(q.score) || 0), 0) || 0), 0) || 0;
  }
  if (data.passingScore > total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Điểm đạt (${data.passingScore}) không được lớn hơn Tổng điểm (${total}).`,
      path: ["passingScore"]
    });
  }
})

export function ModuleForm({ 
  classes, 
  defaultClassId = "",
  initialData 
}: { 
  classes: { id: string, name: string }[]
  defaultClassId?: string
  initialData?: any
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = initialData || {
    title: "",
    description: "",
    classId: defaultClassId,
    timeLimit: 60,
    passingScore: 50,
    deadlineTime: "23:59",
    scoringMode: "TOTAL_DIVIDED",
    totalScore: 100,
    sections: [{ title: "Phần 1: Reading", timeLimit: 0, questions: [] }]
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control: form.control,
    name: "sections"
  })

  const scoringMode = form.watch("scoringMode")
  const sectionsWatch = form.watch("sections")
  const calculatedTotal = useMemo(() => {
    return sectionsWatch?.reduce((sum, sec) => sum + (sec.questions?.reduce((qSum, q) => qSum + (Number(q.score) || 0), 0) || 0), 0) || 0;
  }, [sectionsWatch])

  async function onSubmit(values: z.infer<typeof formSchema>, isPublished: boolean) {
    setIsSubmitting(true)
    
    const deadlineStr = format(values.deadlineDate, 'yyyy-MM-dd')
    const deadlineISO = new Date(`${deadlineStr}T${values.deadlineTime}:00`).toISOString()

    const processedSections = values.sections?.map(sec => ({
      ...sec,
      questions: sec.questions?.map(q => {
        const { id, type, instruction, score, ...contentObj } = q
        Object.keys(contentObj).forEach(key => contentObj[key] === undefined && delete contentObj[key])
        
        if (contentObj.paragraphs) {
          contentObj.paragraphs = contentObj.paragraphs.map((p: any) => p.value)
        }
        
        return {
          id,
          type,
          instruction,
          score,
          content: JSON.stringify(contentObj)
        }
      }) || []
    })) || []

    const submitData = {
      title: values.title,
      description: values.description,
      classId: values.classId,
      timeLimit: values.timeLimit * 60,
      passingScore: values.passingScore,
      scoringMode: values.scoringMode,
      totalScore: values.scoringMode === 'PER_QUESTION' ? calculatedTotal : values.totalScore,
      deadline: deadlineISO,
      isPublished: isPublished,
      sections: processedSections
    }

    try {
      const url = initialData?.id ? `/api/modules/${initialData.id}` : '/api/modules'
      const method = initialData?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save module')
      }
      
      alert(`Đã ${isPublished ? 'Phát hành' : 'Lưu nháp'} thành công!`)
      window.history.back() // Chuyển hướng về trang trước (VD: chi tiết lớp)
    } catch (error) {
      console.error(error)
      alert("Có lỗi xảy ra khi lưu bài test.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">Tên bài test <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: PTE Mock Test 1..." className="focus-visible:ring-blue-500 text-base" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">Mô tả chi tiết</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Mô tả các lưu ý cho học viên khi làm bài (nếu có)..." 
                    className="resize-y focus-visible:ring-blue-500 text-base min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">Giao bài cho Lớp <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-blue-500 text-base">
                      <span data-slot="select-value" className={cn("line-clamp-1 flex items-center", !field.value && "text-muted-foreground")}>
                        {field.value ? classes.find(c => c.id === field.value)?.name : "Chọn lớp học..."}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-amber-200 bg-amber-50/30 rounded-xl">
            <FormField
              control={form.control}
              name="scoringMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-amber-900 font-semibold">Phương thức Tính điểm</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" value="TOTAL_DIVIDED" checked={field.value === "TOTAL_DIVIDED"} onChange={field.onChange} className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300" />
                        <span className="text-slate-700 font-medium">Nhập Tổng điểm (tự chia đều)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="radio" value="PER_QUESTION" checked={field.value === "PER_QUESTION"} onChange={field.onChange} className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300" />
                        <span className="text-slate-700 font-medium">Nhập điểm cho Từng câu (cộng dồn)</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900 font-semibold">Tổng điểm Bài test</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      className={cn("text-base font-bold", scoringMode === 'PER_QUESTION' ? "bg-slate-100 text-slate-500" : "bg-white focus-visible:ring-amber-500")}
                      readOnly={scoringMode === 'PER_QUESTION'}
                      value={scoringMode === 'PER_QUESTION' ? calculatedTotal : field.value}
                      onChange={scoringMode === 'PER_QUESTION' ? undefined : field.onChange} 
                    />
                  </FormControl>
                  <FormDescription className="text-amber-700/80 text-xs">
                    {scoringMode === 'PER_QUESTION' ? "Hệ thống tự cộng dồn điểm các câu hỏi bên dưới." : "Hệ thống sẽ chia đều điểm cho tất cả câu hỏi."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="deadlineDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-semibold">Ngày nộp bài <span className="text-red-500">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger render={<FormControl />}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal text-base hover:bg-slate-50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadlineTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Giờ nộp bài <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="time" className="focus-visible:ring-blue-500 text-base w-full flex items-center justify-center cursor-pointer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Thời gian làm bài (Phút) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" min={1} className="focus-visible:ring-blue-500 text-base" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tổng thời gian làm bài đếm ngược.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Điểm đạt tối thiểu <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className="focus-visible:ring-blue-500 text-base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Cấu trúc Bài test</h2>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => appendSection({ title: `Phần ${sections.length + 1}`, timeLimit: 0, questions: [] })}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Phần thi
            </Button>
          </div>
          
          <div className="space-y-6">
            {sections.map((field, index) => (
              <SectionBuilder 
                key={field.id} 
                sectionIndex={index} 
                form={form} 
                removeSection={() => removeSection(index)} 
                moveSection={moveSection} 
                isFirst={index === 0} 
                isLast={index === sections.length - 1}
                sectionsCount={sections.length}
              />
            ))}
            {sections.length === 0 && (
              <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500">Chưa có phần thi nào. Bấm nút &quot;Thêm Phần thi&quot; để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full sm:w-auto h-11 px-6 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200"
            onClick={form.handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu nháp
          </Button>
          <Button 
            type="button" 
            className="w-full sm:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={form.handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            Lưu & Phát hành
          </Button>
        </div>
      </form>
    </Form>
  )
}

function SectionBuilder({ form, sectionIndex, removeSection, moveSection, isFirst, isLast, sectionsCount }: any) {
  const { fields: questions, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.questions`
  })

  return (
    <div className="border border-indigo-100 bg-slate-50 rounded-2xl p-6 relative shadow-sm">
      <div className="absolute top-4 right-4 flex space-x-1">
        <Button type="button" variant="ghost" size="icon" disabled={isFirst} onClick={() => moveSection(sectionIndex, sectionIndex - 1)}>
          <span className="sr-only">Move Up</span>
          ↑
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isLast} onClick={() => moveSection(sectionIndex, sectionIndex + 1)}>
          <span className="sr-only">Move Down</span>
          ↓
        </Button>
        <Button type="button" variant="destructive" size="icon" onClick={removeSection}>
          <span className="sr-only">Delete Section</span>
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pr-24">
        <FormField
          control={form.control}
          name={`sections.${sectionIndex}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-900 font-semibold">Tên phần thi <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="VD: Part 1: Reading..." className="bg-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`sections.${sectionIndex}.timeLimit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-900 font-semibold">Thời gian tối đa (Phút)</FormLabel>
              <FormControl>
                <Input type="number" min={0} className="bg-white" {...field} />
              </FormControl>
              <FormDescription className="text-xs">Để 0 nếu muốn dùng chung thời gian Bài Test.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-700">Các câu hỏi trong phần này</h3>
          <Button 
            type="button" 
            size="sm"
            onClick={() => appendQuestion({ type: 'READ_ALOUD', instruction: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
          </Button>
        </div>

        {questions.map((field, index) => (
          <QuestionCard 
            key={field.id} 
            sectionIndex={sectionIndex}
            questionIndex={index} 
            remove={removeQuestion} 
            move={moveQuestion} 
            form={form} 
            isFirst={index === 0} 
            isLast={index === questions.length - 1} 
            sectionsCount={sectionsCount}
          />
        ))}

        {questions.length === 0 && (
          <div className="text-center p-6 bg-white border border-dashed border-slate-300 rounded-xl">
            <p className="text-slate-500 text-sm">Phần thi này chưa có câu hỏi. Bấm &quot;Thêm câu hỏi&quot; để thiết kế đề.</p>
          </div>
        )}
      </div>
    </div>
  )
}
