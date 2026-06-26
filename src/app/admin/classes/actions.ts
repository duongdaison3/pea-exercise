'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createClass(data: {
  name: string
  description?: string
  teacherId: string
  startDate?: string
  endDate?: string
  maxStudents?: number
  status?: string
}) {
  try {
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        description: data.description || null,
        teacherId: data.teacherId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxStudents: data.maxStudents || null,
        status: data.status || 'ACTIVE'
      }
    })
    
    revalidatePath('/admin/classes')
    revalidatePath('/teacher/classes')
    return { success: true, class: newClass }
  } catch (error: any) {
    console.error('Error creating class:', error)
    return { error: 'Lỗi khi tạo lớp học.' }
  }
}
