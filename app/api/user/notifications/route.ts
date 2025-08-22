import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    maintenanceUpdates: z.boolean(),
    paymentReminders: z.boolean(),
    leaseExpirations: z.boolean(),
    systemUpdates: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    urgentMaintenance: z.boolean(),
    paymentOverdue: z.boolean(),
    newMessages: z.boolean(),
    systemAlerts: z.boolean(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    emergencyOnly: z.boolean(),
    paymentOverdue: z.boolean(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Get user's notification settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        notificationSettings: true,
      }
    })

    // Return default settings if none exist
    const defaultSettings = {
      email: {
        enabled: true,
        maintenanceUpdates: true,
        paymentReminders: true,
        leaseExpirations: true,
        systemUpdates: true,
        marketingEmails: false,
      },
      push: {
        enabled: true,
        urgentMaintenance: true,
        paymentOverdue: true,
        newMessages: true,
        systemAlerts: true,
      },
      sms: {
        enabled: false,
        emergencyOnly: true,
        paymentOverdue: false,
      },
    }

    const settings = userSettings?.notificationSettings || defaultSettings

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Validate the request body
    const validatedData = notificationSettingsSchema.parse(body)

    // Upsert user settings
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        notificationSettings: validatedData,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        notificationSettings: validatedData,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Notification preferences updated successfully' 
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}
