import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BookOpen, PieChart } from "lucide-react";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({
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
    { href: '/student', iconName: 'BookOpen', label: 'Lớp học của tôi' },
    { href: '/student/scores', iconName: 'PieChart', label: 'Bảng điểm' },
  ];

  return (
    <DashboardLayout 
      user={{ id: user.id, name: user.name, email: user.email, role: 'Học viên', actualRole: (session as any).actualRole || user.role }}
      sidebarLinks={sidebarLinks}
      portalName="Cổng Học Viên"
    >
      {children}
    </DashboardLayout>
  );
}
