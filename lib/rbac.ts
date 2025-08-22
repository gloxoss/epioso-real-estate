import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export type Permission = 
  // Properties
  | 'properties:read'
  | 'properties:create'
  | 'properties:update'
  | 'properties:delete'
  // Units
  | 'units:read'
  | 'units:create'
  | 'units:update'
  | 'units:delete'
  | 'units:move_status'
  // Contacts
  | 'contacts:read'
  | 'contacts:create'
  | 'contacts:update'
  | 'contacts:delete'
  // Billing
  | 'billing:read'
  | 'billing:create'
  | 'billing:update'
  | 'billing:delete'
  | 'billing:process_payments'
  // Documents
  | 'documents:read'
  | 'documents:upload'
  | 'documents:delete'
  // Maintenance
  | 'maintenance:read'
  | 'maintenance:create'
  | 'maintenance:update'
  | 'maintenance:delete'
  | 'maintenance:assign'
  // Reports
  | 'reports:read'
  | 'reports:export'
  // Admin
  | 'admin:manage_users'
  | 'admin:manage_organization'
  | 'admin:view_logs'

export type Role = 'owner' | 'manager' | 'accountant' | 'maintainer' | 'viewer'

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    // All permissions
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'units:read', 'units:create', 'units:update', 'units:delete', 'units:move_status',
    'contacts:read', 'contacts:create', 'contacts:update', 'contacts:delete',
    'billing:read', 'billing:create', 'billing:update', 'billing:delete', 'billing:process_payments',
    'documents:read', 'documents:upload', 'documents:delete',
    'maintenance:read', 'maintenance:create', 'maintenance:update', 'maintenance:delete', 'maintenance:assign',
    'reports:read', 'reports:export',
    'admin:manage_users', 'admin:manage_organization', 'admin:view_logs',
  ],
  manager: [
    // CRUD except destructive global settings
    'properties:read', 'properties:create', 'properties:update',
    'units:read', 'units:create', 'units:update', 'units:move_status',
    'contacts:read', 'contacts:create', 'contacts:update', 'contacts:delete',
    'billing:read', 'billing:create', 'billing:update', 'billing:process_payments',
    'documents:read', 'documents:upload',
    'maintenance:read', 'maintenance:create', 'maintenance:update', 'maintenance:assign',
    'reports:read', 'reports:export',
  ],
  accountant: [
    // Financial focus
    'properties:read',
    'units:read',
    'contacts:read', 'contacts:create', 'contacts:update',
    'billing:read', 'billing:create', 'billing:update', 'billing:process_payments',
    'documents:read', 'documents:upload',
    'reports:read', 'reports:export',
  ],
  maintainer: [
    // Maintenance focus
    'properties:read',
    'units:read',
    'contacts:read',
    'documents:read', 'documents:upload',
    'maintenance:read', 'maintenance:create', 'maintenance:update',
  ],
  viewer: [
    // Read-only access
    'properties:read',
    'units:read',
    'contacts:read',
    'billing:read',
    'documents:read',
    'maintenance:read',
    'reports:read',
  ],
}

export interface AuthSession {
  user: {
    id: string
    email: string | null
    name: string | null
  }
  role: Role
  organizationId: string
}

/**
 * Get the current authenticated session with role information
 */
export async function requireAuthWithRole(): Promise<AuthSession> {
  const session = await requireAuth()

  // Get user's role in their active organization
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!membership) {
    throw new Error('No organization membership found')
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    role: membership.role as Role,
    organizationId: membership.organizationId,
  }
}

/**
 * Check if a session has a specific permission
 */
export function can(session: AuthSession, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[session.role]
  if (!rolePermissions) {
    console.warn(`Unknown role: ${session.role}`)
    return false
  }
  return rolePermissions.includes(permission)
}

/**
 * Guard function that throws if user doesn't have permission
 */
export function guard(session: AuthSession, permission: Permission): void {
  if (!can(session, permission)) {
    throw new Error(`Access denied: Missing permission '${permission}'`)
  }
}

/**
 * Higher-order function to protect server actions
 */
export function withAuth<T extends any[], R>(
  permission: Permission,
  handler: (session: AuthSession, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await requireAuthWithRole()
    guard(session, permission)
    return handler(session, ...args)
  }
}

/**
 * Higher-order function to protect route handlers
 */
export function withApiAuth<T extends any[], R>(
  permission: Permission,
  handler: (session: AuthSession, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      const session = await requireAuthWithRole()
      guard(session, permission)
      return handler(session, ...args)
    } catch (error) {
      throw new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

/**
 * Check if user has any of the specified permissions
 */
export function canAny(session: AuthSession, permissions: Permission[]): boolean {
  return permissions.some(permission => can(session, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function canAll(session: AuthSession, permissions: Permission[]): boolean {
  return permissions.every(permission => can(session, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role]
  if (!rolePermissions) {
    console.warn(`Unknown role: ${role}`)
    return false
  }
  return rolePermissions.includes(permission)
}

/**
 * Utility to check permissions in React components
 */
export function usePermissions(session: AuthSession) {
  return {
    can: (permission: Permission) => can(session, permission),
    canAny: (permissions: Permission[]) => canAny(session, permissions),
    canAll: (permissions: Permission[]) => canAll(session, permissions),
    role: session.role,
    permissions: getRolePermissions(session.role),
  }
}
