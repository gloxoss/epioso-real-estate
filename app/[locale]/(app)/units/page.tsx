import { notFound } from 'next/navigation'
import { requireAuthWithRole } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { UnitFiltersSchema } from '@/schemas'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { UnitGrid } from '@/components/units/UnitGrid'
import { EmptyState } from '@/components/layout/EmptyState'
import { Home, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'
import { UnitGridSkeleton } from '@/components/units/UnitGridSkeleton'

interface UnitsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UnitsContent({
  organizationId,
  filters,
  dictionary,
  locale
}: {
  organizationId: string
  filters: any
  dictionary?: any
  locale: string
}) {
  const result = await unitsRepo.list(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  // Convert Decimal fields to numbers for client components
  const processedResult = {
    ...result,
    data: result.data.map(unit => ({
      ...unit,
      rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
      listPrice: unit.listPrice ? Number(unit.listPrice) : null,
    }))
  }

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="Home"
        title={dictionary?.units?.noUnitsYet || "No units yet"}
        description={dictionary?.units?.unitsWillAppear || "Units will appear here once you add them to your properties."}
        action={
          <Button asChild>
            <Link href={`/${locale}/properties`}>
              <Plus className="h-4 w-4 mr-2" />
              {dictionary?.units?.goToProperties || "Go to Properties"}
            </Link>
          </Button>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="Home"
        title={dictionary?.units?.noUnitsFound || "No units found"}
        description={dictionary?.units?.noUnitsMatch ? `${dictionary.units.noUnitsMatch} "${filters.search}".` : `No units match your search for "${filters.search}".`}
      />
    )
  }

  return <UnitGrid units={processedResult.data} pagination={processedResult.pagination} dictionary={dictionary} locale={locale} />
}

export default async function UnitsPage({ params, searchParams }: UnitsPageProps) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  const session = await requireAuthWithRole()
  const searchParamsData = await searchParams
  const dictionary = await getDictionary(locale as Locale)

  // Parse and validate filters
  const filters = UnitFiltersSchema.parse({
    search: searchParamsData.search || '',
    status: searchParamsData.status || undefined,
    propertyId: searchParamsData.propertyId || undefined,
    page: Number(searchParamsData.page) || 1,
    perPage: Number(searchParamsData.perPage) || 20,
    sort: searchParamsData.sort || 'createdAt',
    dir: searchParamsData.dir || 'desc',
  })

  return (
    <div className="space-y-6">
      <DataToolbar
        searchPlaceholder={dictionary?.units?.searchUnits || "Search units..."}
        filters={[
          {
            key: 'status',
            label: dictionary?.units?.status || 'Status',
            options: [
              { label: dictionary?.units?.allStatuses || 'All Statuses', value: 'all' },
              { label: dictionary?.units?.available || 'Available', value: 'available' },
              { label: dictionary?.units?.occupied || 'Occupied', value: 'occupied' },
              { label: dictionary?.units?.maintenance || 'Maintenance', value: 'maintenance' },
              { label: dictionary?.units?.unavailable || 'Unavailable', value: 'unavailable' },
            ],
          },
        ]}
      />

      <Suspense fallback={<UnitGridSkeleton />}>
        <UnitsContent
          organizationId={session.organizationId}
          filters={filters}
          dictionary={dictionary}
          locale={locale}
        />
      </Suspense>
    </div>
  )
}
