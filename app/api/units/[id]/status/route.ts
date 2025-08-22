import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { unitsRepo } from '@/repositories/units'
import { UnitStatus } from '@prisma/client'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved', 'sold', 'blocked'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: any
  try {
    session = await requireAuth()
    const orgId = (session.user as any).organizationId as string
    const resolvedParams = await params
    const unitId = resolvedParams.id

    // Parse and validate request body
    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    // Check if unit exists and belongs to the organization
    const existingUnit = await unitsRepo.findById(unitId, orgId)
    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    // Update unit status
    const updatedUnit = await unitsRepo.updateStatus(unitId, orgId, status as UnitStatus)

    // Log the status change for audit purposes
    console.log(`Unit ${unitId} status changed from ${existingUnit.status} to ${status} by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      unit: updatedUnit,
      message: `Unit status updated to ${status}`
    })

  } catch (error) {
    console.error('Error updating unit status:', error)
    const resolvedParams = await params
    console.error('Unit ID:', resolvedParams.id)
    console.error('Organization ID:', session?.user ? (session.user as any).organizationId : 'No session')

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
