'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const passwordRaw = formData.get('password') as string

  if (!name || !email || !passwordRaw) {
    return { error: 'Vui lòng điền đầy đủ thông tin.' }
  }

  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  
  if (!session) {
    return { error: 'Phiên đăng nhập hết hạn.' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'Email hoặc tên đăng nhập này đã tồn tại.' }
  }

  const password = await bcrypt.hash(passwordRaw, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: 'STUDENT',
      createdById: session.userId
    }
  })

  revalidatePath('/teacher/students')
  return { success: true }
}

export async function deleteStudent(id: string) {
  try {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie) as { userId: string } | null
    if (!session) return { error: 'Unauthorized' }

    await prisma.user.delete({
      where: { 
        id,
        createdById: session.userId // ensuring they only delete their own students
      }
    })
    revalidatePath('/teacher/students')
    return { success: true }
  } catch (error) {
    return { error: 'Không thể xoá học viên này. Có thể do tài khoản đang bị ràng buộc với dữ liệu khác.' }
  }
}
