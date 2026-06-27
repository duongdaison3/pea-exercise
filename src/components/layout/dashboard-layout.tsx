'use client'

import { useState } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChevronLeft, ChevronRight, LogOut, LayoutDashboard, Users, FileBarChart, BookOpen, PenTool, PieChart, FilePlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { logout } from '@/app/actions/user'
import { ProfileDialog } from './profile-dialog'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, FileBarChart, BookOpen, PenTool, PieChart, FilePlus
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { id: string; name: string; email: string; role: string; actualRole?: string };
  sidebarLinks: { href: string; iconName: string; label: string }[];
  portalName: string;
}

const SidebarContent = ({ 
  isCollapsed, 
  setIsCollapsed, 
  portalName, 
  sidebarLinks, 
  pathname 
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  portalName: string;
  sidebarLinks: { href: string; iconName: string; label: string }[];
  pathname: string;
}) => (
  <div className="flex flex-col h-full bg-slate-900 text-slate-300">
    <div className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all duration-300 min-h-[73px]`}>
      {!isCollapsed && (
        <div className="flex flex-col w-full px-2 mt-2">
          <img src="/pea-logo.png" alt="Logo" className="h-10 mb-3 brightness-0 invert object-contain object-left" />
          <span className="text-sm font-bold text-white tracking-wider">{portalName}</span>
        </div>
      )}
      {isCollapsed && <img src="/pea-logo.png" alt="Logo" className="h-8 brightness-0 invert object-contain" />}
    </div>
    
    <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
      {sidebarLinks.map((link: any) => {
        const isActive = pathname === link.href || 
          (link.href !== '/admin' && link.href !== '/teacher' && link.href !== '/student' && pathname.startsWith(link.href))
          
        const Icon = iconMap[link.iconName] || LayoutDashboard
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? link.label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">{link.label}</span>}
          </Link>
        )
      })}
    </nav>
    
    <div className="p-4 border-t border-slate-800">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : (
          <>
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium text-sm">Thu gọn menu</span>
          </>
        )}
      </button>
    </div>
  </div>
)

export function DashboardLayout({ children, user, sidebarLinks, portalName }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const handleSwitchRole = async (targetRole: string) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole })
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = data.redirect
      } else {
        alert(data.error || 'Failed to switch role')
      }
    } catch (e) {
      console.error(e)
      alert('Network error')
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-50">
      <aside className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} portalName={portalName} sidebarLinks={sidebarLinks} pathname={pathname} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="h-[73px] bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger className="p-2 -ml-2 rounded-md hover:bg-slate-100 transition-colors">
                <Menu className="h-6 w-6 text-slate-700" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent isCollapsed={false} setIsCollapsed={() => {}} portalName={portalName} sidebarLinks={sidebarLinks} pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:block"></div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-11 w-11 rounded-full border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-100 transition-all outline-none">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                      <p className="text-xs leading-none text-slate-500 mt-1">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                {user.actualRole === 'ADMIN' && (
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase">Đổi góc nhìn</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer py-2 px-3" onClick={() => handleSwitchRole('ADMIN')}>
                      <Users className="mr-2 h-4 w-4" /> Góc nhìn Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2 px-3" onClick={() => handleSwitchRole('TEACHER')}>
                      <BookOpen className="mr-2 h-4 w-4" /> Góc nhìn Giáo viên
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2 px-3" onClick={() => handleSwitchRole('STUDENT')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Góc nhìn Học viên
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}

                {user.actualRole === 'TEACHER' && (
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase">Đổi góc nhìn</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer py-2 px-3" onClick={() => handleSwitchRole('TEACHER')}>
                      <BookOpen className="mr-2 h-4 w-4" /> Góc nhìn Giáo viên
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer py-2 px-3" onClick={() => handleSwitchRole('STUDENT')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Góc nhìn Học viên
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}

                {(user.actualRole === 'ADMIN' || user.actualRole === 'TEACHER') && (
                  <DropdownMenuSeparator />
                )}

                <ProfileDialog user={user} />
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5 px-3"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
