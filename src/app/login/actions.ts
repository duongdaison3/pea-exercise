'use server'

import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' }
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Email hoặc mật khẩu không chính xác.' }
  }

  await createSession(user.id, user.role)

  return { success: true, role: user.role }
}
