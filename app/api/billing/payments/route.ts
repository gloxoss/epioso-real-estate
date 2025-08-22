import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { PaymentCreateSchema } from '@/schemas'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const body = await request.json()

    // Validate the request body
    const validatedData = PaymentCreateSchema.parse(body)

    // Create the payment
    const payment = await billingRepo.createPayment(
      session.organizationId,
      validatedData
    )

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
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
      method: searchParams.get('method') || undefined,
      invoiceId: searchParams.get('invoiceId') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '20'),
      sort: searchParams.get('sort') || 'paidAt',
      dir: (searchParams.get('dir') || 'desc') as 'asc' | 'desc',
    }

    // Get payments
    const result = await billingRepo.listPayments(
      session.organizationId,
      filters,
      pagination
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
