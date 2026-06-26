'use server'

import { prisma } from "@/lib/prisma"
import { deleteSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function updateProfile(userId: string, data: { name: string, oldPassword?: string, newPassword?: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "Không tìm thấy người dùng" }

  const updateData: { name: string; password?: string } = { name: data.name }

  if (data.newPassword) {
    if (!data.oldPassword) {
      return { error: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới" }
    }
    
    const isValid = await bcrypt.compare(data.oldPassword, user.password)
    if (!isValid) {
      return { error: "Mật khẩu hiện tại không chính xác" }
    }

    updateData.password = await bcrypt.hash(data.newPassword, 10)
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  return { success: true }
}
