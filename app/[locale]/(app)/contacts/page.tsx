import { requireAuthWithRole } from '@/lib/rbac'
import { contactsRepo } from '@/repositories/contacts'
import { ContactFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { CreateContact } from '@/components/contacts/CreateContact'
import { EmptyState } from '@/components/layout/EmptyState'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { ContactsTableSkeleton } from '@/components/contacts/ContactsTableSkeleton'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'

interface ContactsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ContactsContent({
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
  const result = await contactsRepo.list(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="Users"
        title="No contacts yet"
        description="Add your first contact to start managing relationships with tenants, vendors, and other stakeholders."
        action={
          <CreateContact>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CreateContact>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="Users"
        title="No contacts found"
        description={`No contacts match your search for "${filters.search}".`}
        action={
          <Button variant="outline" onClick={() => window.location.href = '/contacts'}>
            Clear Search
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Contacts Table */}
      <ContactsTable contacts={result.data} pagination={result.pagination} />


    </div>
  )
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Validate and parse search parameters
  const filters = ContactFiltersSchema.parse(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage relationships with tenants, vendors, and other stakeholders"
        action={
          <CreateContact>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CreateContact>
        }
      />

      <DataToolbar
        searchPlaceholder="Search contacts..."
        filters={[
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Tenant', value: 'tenant' },
              { label: 'Owner', value: 'owner' },
              { label: 'Vendor', value: 'vendor' },
              { label: 'Agent', value: 'agent' },
              { label: 'Emergency', value: 'emergency' },
              { label: 'Buyer', value: 'buyer' },
              { label: 'Other', value: 'other' },
            ],
          },
        ]}
        sortOptions={[
          { label: 'Name', value: 'name' },
          { label: 'Type', value: 'type' },
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Updated Date', value: 'updatedAt' },
        ]}
      />

      <Suspense 
        fallback={<ContactsTableSkeleton />}
      >
        <ContactsContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
