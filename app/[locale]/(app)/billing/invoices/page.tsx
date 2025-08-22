import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { InvoiceFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { InvoicesTable } from '@/components/billing/InvoicesTable'
import { CreateInvoice } from '@/components/billing/CreateInvoice'
import { EmptyState } from '@/components/layout/EmptyState'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { InvoicesTableSkeleton } from '@/components/billing/InvoicesTableSkeleton'

interface InvoicesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function InvoicesContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const result = await billingRepo.listInvoices(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="CreditCard"
        title="No invoices yet"
        description="Create your first invoice to start billing your customers."
        action={
          <CreateInvoice>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </CreateInvoice>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="CreditCard"
        title="No invoices found"
        description={`No invoices match your search for "${filters.search}".`}
        action={
          <Button variant="outline" onClick={() => window.location.href = '/billing/invoices'}>
            Clear Search
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Invoices Table */}
      <InvoicesTable invoices={result.data} />

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((result.pagination.page - 1) * result.pagination.perPage) + 1} to{' '}
            {Math.min(result.pagination.page * result.pagination.perPage, result.pagination.total)} of{' '}
            {result.pagination.total} invoices
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!result.pagination.hasPrev}
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('page', String(result.pagination.page - 1))
                window.location.href = url.toString()
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!result.pagination.hasNext}
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('page', String(result.pagination.page + 1))
                window.location.href = url.toString()
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Validate and parse search parameters
  const filters = InvoiceFiltersSchema.parse(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage billing and invoices for your properties"
        action={
          <CreateInvoice>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </CreateInvoice>
        }
      />

      <DataToolbar
        searchPlaceholder="Search invoices..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Open', value: 'open' },
              { label: 'Paid', value: 'paid' },
              { label: 'Overdue', value: 'overdue' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'Refunded', value: 'refunded' },
            ],
          },
        ]}
        sortOptions={[
          { label: 'Issue Date', value: 'issueDate' },
          { label: 'Due Date', value: 'dueDate' },
          { label: 'Amount', value: 'total' },
          { label: 'Invoice Number', value: 'number' },
        ]}
      />

      <Suspense 
        fallback={<InvoicesTableSkeleton />}
      >
        <InvoicesContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
