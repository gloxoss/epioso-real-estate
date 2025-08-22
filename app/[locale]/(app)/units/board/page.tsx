import { Metadata } from 'next'
import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth'
import { unitsRepo } from '@/repositories/units'
import { propertiesRepo } from '@/repositories/properties'
import { KanbanBoard } from '@/components/units/KanbanBoard'
import { KanbanBoardSkeleton } from '@/components/units/KanbanBoardSkeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Units Board | Property Management',
  description: 'Kanban board view for managing units by status',
}

interface UnitsBoardProps {
  params: Promise<{ locale: string }>
}

export default async function UnitsBoard({ params }: UnitsBoardProps) {
  const { locale } = await params

  if (!isValidLocale(locale)) {
    notFound()
  }

  const dictionary = await getDictionary(locale as Locale)
  const session = await requireAuth()
  const orgId = (session.user as any).organizationId as string

  // Fetch units and properties data
  const [unitsResult, properties] = await Promise.all([
    unitsRepo.list(orgId, {}, { perPage: 1000 }), // Get all units with high limit
    propertiesRepo.list(orgId, {}, { perPage: 1000 }) // Get all properties with high limit
  ])

  const rawUnits = unitsResult.data

  // Convert Decimal fields to numbers for client components
  const units = rawUnits.map(unit => ({
    ...unit,
    rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
    listPrice: unit.listPrice ? Number(unit.listPrice) : null,
    invoices: unit.invoices?.map(invoice => ({
      ...invoice,
      amount: Number(invoice.amount)
    }))
  }))

  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <Suspense fallback={<KanbanBoardSkeleton />}>
          <KanbanBoard
            units={units}
            properties={properties.data}
            organizationId={orgId}
            dictionary={dictionary}
            locale={locale}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

