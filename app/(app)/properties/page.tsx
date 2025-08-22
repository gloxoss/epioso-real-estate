import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { PropertyFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { AddProperty } from '@/components/properties/AddProperty'
import { EmptyState } from '@/components/layout/EmptyState'
import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import Link from 'next/link'
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton'

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function PropertiesContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const result = await propertiesRepo.list(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="Building2"
        title="No properties yet"
        description="Get started by adding your first property to the system."
        action={
          <AddProperty>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </AddProperty>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="Building2"
        title="No properties found"
        description={`No properties match your search for "${filters.search}".`}
        action={
          <Button variant="outline" onClick={() => window.location.href = '/properties'}>
            Clear Search
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Properties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.data.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((result.pagination.page - 1) * result.pagination.perPage) + 1} to{' '}
            {Math.min(result.pagination.page * result.pagination.perPage, result.pagination.total)} of{' '}
            {result.pagination.total} properties
          </p>
          
          <div className="flex items-center space-x-2">
            {result.pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties?page=${result.pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            )}
            {result.pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties?page=${result.pagination.page + 1}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Validate and parse search parameters
  const filters = PropertyFiltersSchema.parse(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your property portfolio"
        action={
          <AddProperty>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </AddProperty>
        }
      />

      <DataToolbar
        searchPlaceholder="Search properties..."
        filters={[
          {
            key: 'hasUnits',
            label: 'Has Units',
            type: 'select',
            options: [
              { label: 'All', value: 'all' },
              { label: 'With Units', value: 'true' },
              { label: 'Without Units', value: 'false' },
            ],
          },
        ]}
        sortOptions={[
          { label: 'Name', value: 'name' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Updated Date', value: 'updatedAt' },
        ]}
      />

      <Suspense 
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <PropertiesContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
