import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie) as { userId: string } | null;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, phone, status } = await request.json();

    // Verification: Teacher can only edit students they created or students in their classes
    if (user.role === 'TEACHER') {
      const student = await prisma.user.findUnique({
        where: { id },
        include: { enrollments: { include: { class: true } } }
      });
      if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      const isCreator = student.createdById === user.id;
      const isInClass = student.enrollments.some(e => e.class.teacherId === user.id);
      
      if (!isCreator && !isInClass) {
        return NextResponse.json({ error: 'Không có quyền chỉnh sửa học viên này' }, { status: 403 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        status
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
