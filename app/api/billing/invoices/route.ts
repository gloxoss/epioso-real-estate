import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { InvoiceCreateSchema } from '@/schemas'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = InvoiceCreateSchema.parse(body)

    // Create the invoice
    const invoice = await billingRepo.createInvoice(
      session.organizationId,
      validatedData
    )

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      unitId: searchParams.get('unitId') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '20'),
      sort: searchParams.get('sort') || 'createdAt',
      dir: (searchParams.get('dir') || 'desc') as 'asc' | 'desc',
    }

    // Get invoices
    const result = await billingRepo.listInvoices(
      session.organizationId,
      filters,
      pagination
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
