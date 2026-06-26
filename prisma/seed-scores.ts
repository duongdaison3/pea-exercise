import { prisma } from '../src/lib/prisma'

async function main() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  })
  
  if (!student) {
    console.log("No student found")
    return
  }

  const question = await prisma.question.findFirst()

  if (!question) {
    console.log("No question found")
    return
  }

  // Xóa các answer cũ nếu có
  await prisma.studentAnswer.deleteMany()

  // Thêm mock data
  await prisma.studentAnswer.create({
    data: {
      studentId: student.id,
      questionId: question.id,
      status: 'COMPLETED',
      textResponse: 'This is my answer for the reading test.',
      aiScore: 8.5,
      aiFeedback: 'Bài làm khá tốt, phát âm chuẩn, tuy nhiên cần chú ý nối âm.',
      teacherScore: 9.0,
      teacherFeedback: 'Tuyệt vời! Em đã hoàn thành xuất sắc yêu cầu bài thi.\nTiếp tục phát huy nhé!',
      finalScore: 9.0
    }
  })

  await prisma.studentAnswer.create({
    data: {
      studentId: student.id,
      questionId: question.id,
      status: 'PENDING_TEACHER_REVIEW',
      textResponse: 'Another response',
      aiScore: 7.0,
      aiFeedback: 'Từ vựng ổn, cấu trúc ngữ pháp còn một số lỗi nhỏ.',
    }
  })

  await prisma.studentAnswer.create({
    data: {
      studentId: student.id,
      questionId: question.id,
      status: 'SUBMITTED',
      textResponse: 'Just submitted',
    }
  })

  console.log("Seeded mock scores successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
