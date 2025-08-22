import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ticketsRepo } from '@/repositories/tickets'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: any
  try {
    session = await requireAuth()
    const organizationId = (session?.user as any)?.organizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not found in session' },
        { status: 400 }
      )
    }

    const resolvedParams = await params
    console.log('Fetching ticket:', resolvedParams.id, 'for org:', organizationId)

    const ticket = await ticketsRepo.findById(resolvedParams.id, organizationId)

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching ticket:', error)
    const resolvedParams = await params
    console.error('Ticket ID:', resolvedParams.id)
    console.error('Session:', session)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const organizationId = (session?.user as any)?.organizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not found in session' },
        { status: 400 }
      )
    }

    const resolvedParams = await params
    await ticketsRepo.delete(resolvedParams.id, organizationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
