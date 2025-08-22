import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Validate the request body
    const validatedData = updatePasswordSchema.parse(body)

    // Get the current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Cannot change password for OAuth accounts' },
        { status: 400 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(validatedData.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = await hash(validatedData.newPassword, 12)

    // Update the password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('Error updating password:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
