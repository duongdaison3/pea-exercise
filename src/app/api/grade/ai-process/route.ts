import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'

function getAvailableKeys(): string[] {
  const keys: string[] = []
  const parseKeys = (envVar: string | undefined) => {
    if (!envVar) return
    // Tách bằng dấu phẩy, loại bỏ khoảng trắng và dấu ngoặc kép thừa
    const parts = envVar.split(',').map(s => s.replace(/"/g, '').trim())
    keys.push(...parts.filter(k => k.length > 0))
  }
  parseKeys(process.env.GEMINI_API_KEY_MAIN)
  parseKeys(process.env.GEMINI_API_KEY_SECONDARY)
  
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY)
  }
  return keys
}
// Hàm Helper Adapter: Chuyển đổi file Audio (local hoặc remote) thành Base64 để truyền cho Gemini
// HƯỚNG DẪN DÀNH CHO BẠN: Khi đưa lên Production (AWS S3, Vercel Blob, Cloudinary),
// Bạn chỉ cần viết lại hàm này để fetch data từ public URL thay vì fs.readFile.
async function fetchAudioAsBase64(audioUrl: string) {
  try {
    // Hiện tại: Xử lý file local trong thư mục /public/uploads/
    const isLocal = audioUrl.startsWith('/uploads/')
    if (isLocal) {
      const filePath = path.join(process.cwd(), 'public', audioUrl)
      const fileBuffer = await fs.readFile(filePath)
      return {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "audio/webm" // MediaRecorder của trình duyệt thường lưu file webm
        }
      }
    } else {
      // Tương lai: Xử lý URL từ Cloudinary, S3, Vercel Blob
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      return {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: response.headers.get('content-type') || "audio/webm"
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi đọc file Audio:", error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie) as { userId: string } | null
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { moduleId } = await req.json()
    if (!moduleId) return NextResponse.json({ error: "Missing moduleId" }, { status: 400 })

    // Lấy tất cả câu trả lời của học viên trong module này chưa được chấm
    const answers = await prisma.studentAnswer.findMany({
      where: {
        studentId: session.userId,
        question: { moduleId },
        status: 'SUBMITTED' // Chỉ lấy bài mới nộp
      },
      include: {
        question: true
      }
    })

    if (answers.length === 0) {
      return NextResponse.json({ success: true, message: "No un-graded answers found." })
    }

    const keys = getAvailableKeys()
    if (keys.length === 0) {
      console.warn("WARNING: No GEMINI API KEYS found! Skipping LLM tasks...")
    }

    for (const answer of answers) {
      const { question } = answer
      const content = JSON.parse(question.content)
      const maxScore = question.score || 0
      
      let finalScore: number | null = null
      let aiFeedback = ""

      // Helper function to get a random model for each AI question
      const getRandomModel = () => {
        if (keys.length === 0) return null
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        const genAI = new GoogleGenerativeAI(randomKey)
        return genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
      }

      // 1. NHÓM ĐỌC / NGHE (TRẮC NGHIỆM, KÉO THẢ, ĐIỀN TỪ) -> KHÔNG CẦN AI, CODE LOGIC
      if (['MULTIPLE_CHOICE_SINGLE', 'MULTIPLE_CHOICE_MULTIPLE', 'SELECT_MISSING_WORD', 'HIGHLIGHT_CORRECT_SUMMARY'].includes(question.type)) {
        const studentChoices = answer.textResponse ? JSON.parse(answer.textResponse) : ""
        let correctCount = 0
        let totalCorrect = 0
        
        content.options?.forEach((opt: any) => {
          if (opt.isCorrect) totalCorrect++
          if (opt.isCorrect && (Array.isArray(studentChoices) ? studentChoices.includes(opt.value) : studentChoices === opt.value)) {
            correctCount++
          } else if (!opt.isCorrect && Array.isArray(studentChoices) && studentChoices.includes(opt.value)) {
             // Trừ điểm nếu chọn sai (luật PTE cho Multiple choice multiple answers)
             if (['MULTIPLE_CHOICE_MULTIPLE', 'HIGHLIGHT_INCORRECT_WORDS'].includes(question.type)) {
                correctCount--
             }
          }
        })
        
        if (correctCount < 0) correctCount = 0
        finalScore = totalCorrect > 0 ? (correctCount / totalCorrect) * maxScore : 0
        aiFeedback = `Bạn trả lời đúng ${correctCount}/${totalCorrect} ý.`
      }
      else if (question.type === 'REORDER_PARAGRAPHS') {
        const studentOrder = answer.textResponse ? JSON.parse(answer.textResponse) : []
        const correctOrder = content.paragraphs?.map((p: any) => p.value) || []
        
        let correctPairs = 0
        for (let i = 0; i < studentOrder.length - 1; i++) {
          const currentItem = studentOrder[i]
          const nextItem = studentOrder[i + 1]
          const correctCurrentIndex = correctOrder.indexOf(currentItem)
          if (correctCurrentIndex !== -1 && correctOrder[correctCurrentIndex + 1] === nextItem) {
            correctPairs++
          }
        }
        const totalPairs = Math.max(0, correctOrder.length - 1)
        finalScore = totalPairs > 0 ? (correctPairs / totalPairs) * maxScore : 0
        aiFeedback = `Bạn có ${correctPairs}/${totalPairs} cặp đoạn văn đúng thứ tự kề nhau.`
      }
      else if (['FIB_READING_WRITING', 'FIB_READING', 'FIB_LISTENING'].includes(question.type)) {
        const studentBlanks = answer.textResponse ? JSON.parse(answer.textResponse) : {}
        let correctCount = 0
        
        // Option index is typically used for FIB
        const totalBlanks = content.options?.length || 0
        content.options?.forEach((opt: any, index: number) => {
           const blankId = `BLANK_${index}`
           const studentAns = studentBlanks[blankId]
           if (studentAns && studentAns.trim().toLowerCase() === opt.value.trim().toLowerCase()) {
             correctCount++
           }
        })
        
        finalScore = totalBlanks > 0 ? (correctCount / totalBlanks) * maxScore : 0
        aiFeedback = `Bạn điền đúng ${correctCount}/${totalBlanks} ô trống.`
      }
      else if (question.type === 'HIGHLIGHT_INCORRECT_WORDS') {
        const studentSelected = answer.textResponse ? JSON.parse(answer.textResponse) : []
        const correctWords = content.incorrectWords || []
        const correctIds = correctWords.map((w: any) => `${w.index}_${w.original}`)
        
        let correctCount = 0
        studentSelected.forEach((s: string) => {
          if (correctIds.includes(s)) correctCount++
          else correctCount-- // Chọn sai bị trừ điểm
        })
        if (correctCount < 0) correctCount = 0
        finalScore = correctWords.length > 0 ? (correctCount / correctWords.length) * maxScore : 0
        aiFeedback = `Bạn chọn đúng ${correctCount}/${correctWords.length} từ sai.`
      }

      // 2. NHÓM NÓI VÀ VIẾT -> GỌI GEMINI AI
      else if (keys.length > 0) {
        
        if (['WRITE_ESSAY', 'SUMMARIZE_WRITTEN_TEXT', 'SUMMARIZE_SPOKEN_TEXT', 'WRITE_FROM_DICTATION'].includes(question.type)) {
          const model = getRandomModel()
          if (!model) continue

          const prompt = `
            Bạn là giám khảo kỳ thi tiếng Anh PTE. Hãy chấm điểm bài làm của học viên.
            Yêu cầu đề bài (Instruction): ${question.instruction}
            Nội dung câu hỏi: ${JSON.stringify(content)}
            Câu trả lời của học viên: ${answer.textResponse || "(Không có nội dung)"}
            
            Hãy chấm theo thang điểm tối đa là ${maxScore}.
            Trả về CHỈ MỘT chuỗi JSON hợp lệ với cấu trúc sau (KHÔNG thêm markdown hay text nào khác):
            {
              "score": number,
              "feedback": "Nhận xét chi tiết bằng tiếng Việt về ngữ pháp, từ vựng, độ bám sát đề tài..."
            }
          `
          try {
            const result = await model.generateContent(prompt)
            const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const aiData = JSON.parse(responseText)
            finalScore = aiData.score
            aiFeedback = aiData.feedback
          } catch (e) {
            console.error("Lỗi khi gọi AI chấm Writing:", e)
            aiFeedback = "Lỗi hệ thống AI khi chấm điểm tự luận."
          }
        }
        else if (['READ_ALOUD', 'REPEAT_SENTENCE', 'DESCRIBE_IMAGE', 'RETELL_LECTURE', 'ANSWER_SHORT_QUESTION'].includes(question.type)) {
          if (!answer.audioUrl) {
            finalScore = 0
            aiFeedback = "Không tìm thấy file ghi âm của học viên."
          } else {
            const audioPart = await fetchAudioAsBase64(answer.audioUrl)
            
            if (audioPart) {
              const prompt = `
                Bạn là giám khảo kỳ thi tiếng Anh PTE.
                Hãy nghe đoạn ghi âm sau của học viên và chấm điểm dựa trên đề bài:
                Yêu cầu đề bài: ${question.instruction}
                Dữ liệu tham khảo (Nếu có text/transcript): ${JSON.stringify(content)}
                
                Hãy chấm theo thang điểm tối đa là ${maxScore}.
                Đánh giá mức độ trôi chảy (Fluency) và phát âm (Pronunciation).
                
                Trả về CHỈ MỘT chuỗi JSON hợp lệ với cấu trúc (KHÔNG có markdown):
                {
                  "score": number,
                  "pronunciation": "nhận xét phát âm",
                  "fluency": "nhận xét độ trôi chảy",
                  "feedback": "Nhận xét tổng quan bằng tiếng Việt"
                }
              `
              try {
                const model = getRandomModel()
                if (!model) continue
                // @ts-ignore
                const result = await model.generateContent([audioPart, prompt])
                const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
                const aiData = JSON.parse(responseText)
                finalScore = aiData.score
                aiFeedback = `Phát âm: ${aiData.pronunciation}\nTrôi chảy: ${aiData.fluency}\nTổng quan: ${aiData.feedback}`
              } catch (e) {
                console.error("Lỗi khi gọi AI chấm Speaking:", e)
                aiFeedback = "Lỗi phân tích Audio AI. File ghi âm có thể không tương thích hoặc bị nhiễu."
              }
            } else {
               aiFeedback = "Lỗi không đọc được file Audio từ hệ thống lưu trữ."
            }
          }
        }
      }

      // 3. CẬP NHẬT DATABASE
      await prisma.studentAnswer.update({
        where: { id: answer.id },
        data: {
          aiScore: finalScore,
          aiFeedback: aiFeedback || null,
          status: 'PENDING_TEACHER_REVIEW'
        }
      })
    }

    return NextResponse.json({ success: true, message: "Graded successfully." })

  } catch (error) {
    console.error("AI Grading API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
