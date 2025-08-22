import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { UnitCreateSchema, UnitFiltersSchema } from '@/schemas'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filters = UnitFiltersSchema.parse({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      propertyId: searchParams.get('propertyId') || '',
    })

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '50'),
      sort: searchParams.get('sort') || 'unitNumber',
      dir: (searchParams.get('dir') || 'asc') as 'asc' | 'desc',
    }

    // Get units
    const result = await unitsRepo.list(
      session.organizationId,
      filters,
      pagination
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = UnitCreateSchema.parse(body)

    // Create the unit
    const unit = await unitsRepo.create(session.organizationId, validatedData)

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create unit' },
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
        { error: 'Unit ID is required for updates' },
        { status: 400 }
      )
    }

    // Extract ID and validate the rest of the data
    const { id, ...updateData } = body
    const validatedData = UnitCreateSchema.partial().parse(updateData)

    // Update the unit
    const unit = await unitsRepo.update(id, session.organizationId, validatedData)

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 }
    )
  }
}
