import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie) as { userId: string } | null;
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let students = [];

    if (user.role === 'ADMIN') {
      students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
          enrollments: {
            include: { class: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Teacher
      if (classId) {
        // Only students in this specific class
        const enrollments = await prisma.enrollment.findMany({
          where: { classId, class: { teacherId: user.id } },
          include: { student: { include: { enrollments: { include: { class: true } } } } }
        });
        students = enrollments.map((e: any) => e.student);
      } else {
        // All students created by this teacher
        students = await prisma.user.findMany({
          where: { role: 'STUDENT', createdById: user.id },
          include: {
            enrollments: {
              include: { class: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    // Prepare CSV data
    const headers = ['Mã ID', 'Họ và tên', 'Email', 'Số điện thoại', 'Ngày đăng ký', 'Trạng thái', 'Các lớp đang học'];
    const rows = students.map((s: any) => {
      const classNames = s.enrollments.map((e: any) => e.class.name).join('; ');
      const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '';
      
      let statusStr = 'Đang học';
      if (s.status === 'INACTIVE') statusStr = 'Không hoạt động';
      if (s.status === 'SUSPENDED') statusStr = 'Đình chỉ';
      if (s.status === 'DROPPED') statusStr = 'Nghỉ học';

      return [
        s.id,
        s.name,
        s.email,
        s.phone || '',
        dateStr,
        statusStr,
        classNames
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add UTF-8 BOM so Excel opens it correctly with Vietnamese characters
    const bom = '\uFEFF';

    return new NextResponse(bom + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="danh-sach-hoc-vien-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
