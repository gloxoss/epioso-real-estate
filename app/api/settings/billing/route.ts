import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const billingSettingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  taxRate: z.number().min(0).max(100),
  paymentTerms: z.number().min(1),
  lateFeesEnabled: z.boolean(),
  lateFeeAmount: z.number().min(0),
  lateFeeType: z.enum(['fixed', 'percentage']),
  autoRemindersEnabled: z.boolean(),
  reminderDays: z.array(z.number()),
  invoicePrefix: z.string().min(1),
  invoiceNumbering: z.enum(['sequential', 'monthly', 'yearly']),
  paymentMethods: z.object({
    cash: z.boolean(),
    check: z.boolean(),
    bankTransfer: z.boolean(),
    creditCard: z.boolean(),
    onlinePayment: z.boolean(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    
    // Get organization's billing settings
    const orgSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: session.organizationId },
      select: {
        billingSettings: true,
      }
    })

    // Return default settings if none exist
    const defaultSettings = {
      currency: 'MAD',
      taxRate: 20,
      paymentTerms: 30,
      lateFeesEnabled: true,
      lateFeeAmount: 50,
      lateFeeType: 'fixed',
      autoRemindersEnabled: true,
      reminderDays: [7, 3, 1],
      invoicePrefix: 'INV',
      invoiceNumbering: 'sequential',
      paymentMethods: {
        cash: true,
        check: true,
        bankTransfer: true,
        creditCard: false,
        onlinePayment: false,
      },
    }

    const settings = orgSettings?.billingSettings || defaultSettings

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching billing settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = billingSettingsSchema.parse(body)

    // Upsert organization settings
    await prisma.organizationSettings.upsert({
      where: { organizationId: session.organizationId },
      update: {
        billingSettings: validatedData,
        updatedAt: new Date(),
      },
      create: {
        organizationId: session.organizationId,
        billingSettings: validatedData,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Billing settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating billing settings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update billing settings' },
      { status: 500 }
    )
  }
}
