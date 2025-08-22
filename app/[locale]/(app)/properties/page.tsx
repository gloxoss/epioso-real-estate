import { notFound } from 'next/navigation'
import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { PropertyFiltersSchema } from '@/schemas'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
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
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function PropertiesContent({
  organizationId,
  filters,
  dictionary,
  locale
}: {
  organizationId: string
  filters: any
  dictionary: any
  locale: string
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
        title={dictionary.properties.noPropertiesYet}
        description={dictionary.properties.getStartedDescription}
        action={
          <AddProperty dictionary={dictionary}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {dictionary.properties.addProperty}
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
        title={dictionary.properties.noResultsFound}
        description={dictionary.properties.noResultsDescription}
        action={
          <Button variant="outline" asChild>
            <Link href={`/${locale}/properties`}>
              {dictionary.common.clear || "Clear Search"}
            </Link>
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
          <PropertyCard key={property.id} property={property} dictionary={dictionary} locale={locale} />
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

export default async function PropertiesPage({ params, searchParams }: PropertiesPageProps) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  const session = await requireAuthWithRole()
  const searchParamsData = await searchParams
  const dictionary = await getDictionary(locale as Locale)

  // Validate and parse search parameters
  const filters = PropertyFiltersSchema.parse(searchParamsData)

  return (
    <div className="space-y-6">
      <PageHeader
        title={dictionary.navigation.properties}
        description={dictionary.properties.description || "Manage your property portfolio"}
        action={
          <div className="flex gap-2">
            <AddProperty dictionary={dictionary}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.properties.addProperty || "Add Property"}
              </Button>
            </AddProperty>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/properties/new`}>
                <Plus className="h-4 w-4 mr-2" />
                New Property Page
              </Link>
            </Button>
          </div>
        }
      />

      <DataToolbar
        searchPlaceholder={dictionary.properties.searchPlaceholder}
        filters={[
          {
            key: 'hasUnits',
            label: dictionary.properties.filters.hasUnits,
            type: 'select',
            options: [
              { label: dictionary.properties.filters.all, value: 'all' },
              { label: dictionary.properties.filters.withUnits, value: 'true' },
              { label: dictionary.properties.filters.withoutUnits, value: 'false' },
            ],
          },
        ]}
        sortOptions={[
          { label: dictionary.properties.sort.name, value: 'name' },
          { label: dictionary.properties.sort.createdDate, value: 'createdAt' },
          { label: dictionary.properties.sort.updatedDate, value: 'updatedAt' },
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
          dictionary={dictionary}
          locale={locale}
        />
      </Suspense>
    </div>
  )
}
