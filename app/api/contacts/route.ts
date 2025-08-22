import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { contactsRepo } from '@/repositories/contacts'
import { ContactCreateSchema, ContactFiltersSchema } from '@/schemas'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filters = ContactFiltersSchema.parse({
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
    })

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '50'),
      sort: searchParams.get('sort') || 'name',
      dir: (searchParams.get('dir') || 'asc') as 'asc' | 'desc',
    }

    // Get contacts
    const result = await contactsRepo.list(
      session.organizationId,
      filters,
      pagination
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = ContactCreateSchema.parse(body)

    // Create the contact
    const contact = await contactsRepo.create(session.organizationId, validatedData)

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
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
        { error: 'Contact ID is required for updates' },
        { status: 400 }
      )
    }

    // Extract ID and validate the rest of the data
    const { id, ...updateData } = body
    const validatedData = ContactCreateSchema.partial().parse(updateData)

    // Update the contact
    const contact = await contactsRepo.update(id, session.organizationId, validatedData)

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}
