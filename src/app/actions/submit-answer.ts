'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function submitAnswer(formData: FormData) {
  try {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie) as { userId: string } | null
    if (!session) return { error: "Vui lòng đăng nhập" }

    const questionId = formData.get('questionId') as string
    const audioBlob = formData.get('audioBlob') as Blob | null
    const textResponse = formData.get('textResponse') as string | null
    
    let audioUrl = null

    if (audioBlob && audioBlob.size > 0) {
      const buffer = Buffer.from(await audioBlob.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mimeType = audioBlob.type || 'audio/webm'
      audioUrl = `data:${mimeType};base64,${base64}`
    }

    const existingAnswer = await prisma.studentAnswer.findFirst({
      where: {
        questionId,
        studentId: session.userId
      }
    })

    if (existingAnswer) {
      await prisma.studentAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          audioUrl: audioUrl || existingAnswer.audioUrl,
          textResponse: textResponse !== null ? textResponse : existingAnswer.textResponse,
          status: 'SUBMITTED',
          aiScore: null,
          teacherScore: null
        }
      })
    } else {
      await prisma.studentAnswer.create({
        data: {
          questionId,
          studentId: session.userId,
          audioUrl,
          textResponse,
          status: 'SUBMITTED'
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Submit Answer Error:", error)
    return { error: "Có lỗi xảy ra khi nộp bài" }
  }
}
