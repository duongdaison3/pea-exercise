'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addStudentToClass(classId: string, studentId: string) {
  if (!classId || !studentId) return { error: 'Dữ liệu không hợp lệ.' }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId, classId } }
  })

  if (existing) return { error: 'Học viên đã ở trong lớp này.' }

  await prisma.enrollment.create({
    data: { classId, studentId }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  if (!classId || !studentId) return { error: 'Dữ liệu không hợp lệ.' }

  await prisma.enrollment.delete({
    where: { studentId_classId: { studentId, classId } }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function createModule(formData: FormData) {
  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const orderIndexStr = formData.get('orderIndex') as string

  if (!classId || !title || !orderIndexStr) return { error: 'Vui lòng điền đủ thông tin.' }

  const orderIndex = parseInt(orderIndexStr, 10)
  
  await prisma.module.create({
    data: { classId, title, orderIndex }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function deleteModule(moduleId: string, classId: string) {
  if (!moduleId) return { error: 'Không tìm thấy Module.' }

  try {
    // Delete related questions first (if any cascading issues, though Prisma usually handles it if onDelete: Cascade is set)
    // Wait, the schema should ideally handle cascade. We just try to delete the module.
    // Let's delete the module directly.
    await prisma.module.delete({
      where: { id: moduleId }
    })

    revalidatePath(`/teacher/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting module:", error)
    return { error: 'Không thể xóa bài test vì đã có dữ liệu liên quan (câu hỏi, bài nộp). Vui lòng xóa dữ liệu liên quan trước.' }
  }
}

