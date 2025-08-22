import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ticketsRepo } from '@/repositories/tickets'
import { TicketStatus } from '@prisma/client'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled', 'on_hold'])
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
    const ticketId = resolvedParams.id

    // Parse and validate request body
    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    // Check if ticket exists and belongs to the organization
    const existingTicket = await ticketsRepo.findById(ticketId, orgId)
    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Update ticket status
    const updatedTicket = await ticketsRepo.updateStatus(ticketId, orgId, status as TicketStatus)

    // Log the status change for audit purposes
    console.log(`Ticket ${ticketId} status changed from ${existingTicket.status} to ${status} by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: `Ticket status updated to ${status}`
    })

  } catch (error) {
    console.error('Error updating ticket status:', error)
    const resolvedParams = await params
    console.error('Ticket ID:', resolvedParams.id)
    console.error('Session:', session)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    )
  }
}
