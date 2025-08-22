import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ensureUserExists } from '@/lib/user'

/**
 * Gets the active organization ID for the current user.
 * Currently returns the first organization membership found.
 * If none exists, redirects to onboarding with a message.
 */
export async function getActiveOrganizationId(): Promise<string> {
  try {
    // Ensure user exists in database first
    const user = await ensureUserExists()

    const member = await prisma.member.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        organizationId: true,
      },
    })

    if (!member) {
      const msg = encodeURIComponent('No organization membership found. Please create one.')
      redirect(`/dashboard/onboarding?message=${msg}`)
    }

    return member.organizationId
  } catch (error) {
    console.error('Error in getActiveOrganizationId:', error)
    const msg = encodeURIComponent('Error checking organization membership.')
    redirect(`/dashboard/onboarding?message=${msg}`)
  }
}

