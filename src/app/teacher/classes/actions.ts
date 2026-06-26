'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export async function createTeacherClass(data: {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  maxStudents?: number
  status?: string
}) {
  try {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie) as { userId: string } | null
    if (!session?.userId) return { error: 'Unauthorized' }

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description || null,
        teacherId: session.userId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxStudents: data.maxStudents || null,
        status: data.status || 'ACTIVE'
      }
    })
    
    revalidatePath('/teacher/classes')
    revalidatePath('/admin/classes')
    return { success: true, class: newClass }
  } catch (error: any) {
    console.error('Error creating class:', error)
    return { error: 'Lỗi khi tạo lớp học.' }
  }
}
