import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = path.startsWith(protectedRoutes.admin) || 
                           path.startsWith(protectedRoutes.teacher) || 
                           path.startsWith(protectedRoutes.student)
  const isPublicRoute = path === '/login'

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie) as { role: string; [key: string]: unknown } | null

  // Redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Redirect to dashboard if authenticated and trying to access login
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}`, req.nextUrl))
  }

  // If root path is accessed, redirect based on role or to login
  if (path === '/') {
    if (session) {
      return NextResponse.redirect(new URL(`/${session.role.toLowerCase()}`, req.nextUrl))
    } else {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
  }

  // Role based protection
  if (isProtectedRoute && session) {
    const role = session.role.toLowerCase()
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, req.nextUrl))
    }
    if (path.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role}`, req.nextUrl))
    }
    if (path.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}`, req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
