import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { targetRole } = await req.json()
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    
    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await decrypt(cookie) as { userId: string, role: string, actualRole?: string } | null
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const actualRole = session.actualRole || session.role

    // Determine what roles the actualRole can switch to
    let allowedRoles: string[] = []
    if (actualRole === 'ADMIN') {
      allowedRoles = ['ADMIN', 'TEACHER', 'STUDENT']
    } else if (actualRole === 'TEACHER') {
      allowedRoles = ['TEACHER', 'STUDENT']
    } else if (actualRole === 'STUDENT') {
      allowedRoles = ['STUDENT']
    }

    if (!allowedRoles.includes(targetRole)) {
      return NextResponse.json({ error: 'Forbidden to switch to this role' }, { status: 403 })
    }

    // Create a new session with the new target role, but keep actualRole
    await createSession(session.userId, targetRole, actualRole)

    return NextResponse.json({ success: true, redirect: `/${targetRole.toLowerCase()}` })
  } catch (error) {
    console.error('Error switching role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
