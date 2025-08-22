import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * Ensures the current authenticated user exists in the database.
 * Creates the user if they don't exist, updates if they do.
 * Returns the user record from the database.
 */
export async function ensureUserExists(): Promise<{ id: string; email: string | null; name: string | null }> {
  const session = await requireAuth()
  const authUser = session.user
  
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email,
      name: authUser.name,
      image: authUser.image,
    },
    create: {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      image: authUser.image,
    },
    select: {
      id: true,
      email: true,
      name: true,
    }
  })

  return user
}

/**
 * Gets the current user from the database, ensuring they exist first.
 */
export async function getCurrentDatabaseUser() {
  return ensureUserExists()
}
