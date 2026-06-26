import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Bắt đầu xoá dữ liệu cũ...')
  await prisma.enrollment.deleteMany()
  await prisma.studentAnswer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.module.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()

  console.log('Bắt đầu tạo dữ liệu mẫu...')

  const hashedPassword = await bcrypt.hash('admin', 10)
  const defaultPassword = await bcrypt.hash('123456', 10)

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Quản trị viên',
      email: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // 1 Giáo viên
  const teacher = await prisma.user.create({
    data: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      password: defaultPassword,
      role: 'TEACHER',
    },
  })

  // 1 Học viên
  const student = await prisma.user.create({
    data: {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      password: defaultPassword,
      role: 'STUDENT',
      createdById: teacher.id,
    },
  })

  // 1 Lớp học
  const testClass = await prisma.class.create({
    data: {
      name: 'Lớp Luyện thi IELTS',
      description: 'Lớp luyện thi IELTS mục tiêu 6.5+',
      teacherId: teacher.id,
    },
  })

  // Đăng ký lớp học
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      classId: testClass.id,
    }
  })

  // 1 Module
  const module1 = await prisma.module.create({
    data: {
      classId: testClass.id,
      title: 'Module 1 - Giới thiệu',
      orderIndex: 1,
    },
  })

  // 2 Câu hỏi: 1 Speaking, 1 Writing
  await prisma.question.create({
    data: {
      moduleId: module1.id,
      type: 'SPEAKING',
      instruction: 'Đọc to đoạn văn sau:',
      content: JSON.stringify({
        text: 'The quick brown fox jumps over the lazy dog. This is a simple test of your reading aloud skills.'
      }),
    },
  })

  await prisma.question.create({
    data: {
      moduleId: module1.id,
      type: 'WRITING',
      instruction: 'Viết một đoạn văn ngắn (50-100 từ) về sở thích của bạn.',
      content: JSON.stringify({
        topic: 'Sở thích cá nhân'
      }),
    },
  })

  console.log('Đã tạo dữ liệu mẫu thành công:')
  console.log({ admin, teacher, student, testClass, enrollment, module1 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
