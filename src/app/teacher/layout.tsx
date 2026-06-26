import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, BookOpen, PenTool, FileBarChart } from "lucide-react";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie) as { userId: string } | null
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) redirect('/login')

  const sidebarLinks = [
    { href: '/teacher/classes', iconName: 'BookOpen', label: 'Lớp học của tôi' },
    { href: '/teacher/modules/create', iconName: 'FilePlus', label: 'Tạo Bài Test' },
    { href: '/teacher/students', iconName: 'Users', label: 'Quản lý Học viên' },
    { href: '/teacher/grading', iconName: 'PenTool', label: 'Chấm bài' },
    { href: '/teacher/reports', iconName: 'FileBarChart', label: 'Báo cáo' },
  ];

  return (
    <DashboardLayout 
      user={{ id: user.id, name: user.name, email: user.email, role: 'Giáo viên', actualRole: (session as any).actualRole || user.role }}
      sidebarLinks={sidebarLinks}
      portalName="Cổng Giáo Viên"
    >
      {children}
    </DashboardLayout>
  );
}
