'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const passwordRaw = formData.get('password') as string
  const role = formData.get('role') as string

  if (!name || !email || !passwordRaw || !role) {
    return { error: 'Vui lòng điền đầy đủ thông tin.' }
  }

  // Check if email exists
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
      role
    }
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return { error: 'Không thể xoá tài khoản này. Có thể do tài khoản đang bị ràng buộc với dữ liệu khác.' }
  }
}
