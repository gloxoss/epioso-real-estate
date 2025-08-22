import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { unitsRepo } from '@/repositories/units'

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
    console.log('Fetching unit:', resolvedParams.id, 'for org:', organizationId)

    const unit = await unitsRepo.findById(resolvedParams.id, organizationId)

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error fetching unit:', error)
    const resolvedParams = await params
    console.error('Unit ID:', resolvedParams.id)
    console.error('Session:', session)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
