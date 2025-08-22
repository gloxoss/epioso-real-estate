import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { ticketsRepo } from '@/repositories/tickets'
import { TicketCreateSchema, TicketFiltersSchema } from '@/schemas'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filters = TicketFiltersSchema.parse({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      propertyId: searchParams.get('propertyId') || '',
      unitId: searchParams.get('unitId') || '',
      assignedToUserId: searchParams.get('assignedToUserId') || '',
    })

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '50'),
      sort: searchParams.get('sort') || 'createdAt',
      dir: (searchParams.get('dir') || 'desc') as 'asc' | 'desc',
    }

    // Get tickets
    const result = await ticketsRepo.list(
      session.organizationId,
      filters,
      pagination
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = TicketCreateSchema.parse(body)

    // Create the ticket
    const ticket = await ticketsRepo.create(session.organizationId, validatedData)

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Ticket ID is required for updates' },
        { status: 400 }
      )
    }

    // Extract ID and validate the rest of the data
    const { id, ...updateData } = body
    const validatedData = TicketCreateSchema.partial().parse(updateData)

    // Update the ticket
    const ticket = await ticketsRepo.update(id, session.organizationId, validatedData)

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error updating ticket:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
