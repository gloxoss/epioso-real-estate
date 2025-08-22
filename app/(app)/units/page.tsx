import { requireAuthWithRole } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { UnitFiltersSchema } from '@/schemas'
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
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UnitsContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
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
        title="No units yet"
        description="Units will appear here once you add them to your properties."
        action={
          <Button asChild>
            <Link href="/properties">
              <Plus className="h-4 w-4 mr-2" />
              Go to Properties
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
        title="No units found"
        description={`No units match your search for "${filters.search}".`}
      />
    )
  }

  return <UnitGrid units={processedResult.data} pagination={processedResult.pagination} />
}

export default async function UnitsPage({ searchParams }: UnitsPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Parse and validate filters
  const filters = UnitFiltersSchema.parse({
    search: params.search || '',
    status: params.status || undefined,
    propertyId: params.propertyId || undefined,
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 20,
    sort: params.sort || 'createdAt',
    dir: params.dir || 'desc',
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Manage all units across your properties"
        action={
          <Button asChild>
            <Link href="/properties">
              <Plus className="h-4 w-4 mr-2" />
              Add Unit to Property
            </Link>
          </Button>
        }
      />

      <DataToolbar
        searchPlaceholder="Search units..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Available', value: 'available' },
              { label: 'Occupied', value: 'occupied' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Unavailable', value: 'unavailable' },
            ],
          },
        ]}
      />

      <Suspense fallback={<UnitGridSkeleton />}>
        <UnitsContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
