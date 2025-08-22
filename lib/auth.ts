import { getServerSession } from 'next-auth'
import { authOptions } from '../app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  return session
}

type Role = 'admin' | 'manager' | 'viewer'
export function can(session: Awaited<ReturnType<typeof requireAuth>>, roles: Role[] | Role) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  const userRole = (session.user as any).role as Role
  return allowed.includes(userRole)
}

