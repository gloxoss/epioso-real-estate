import { requireAuthWithRole } from '@/lib/rbac'
import { ticketsRepo } from '@/repositories/tickets'
import { TicketFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { TicketsTable } from '@/components/maintenance/TicketsTable'
import { CreateTicket } from '@/components/maintenance/CreateTicket'
import { EmptyState } from '@/components/layout/EmptyState'
import { Wrench, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { TicketsTableSkeleton } from '@/components/maintenance/TicketsTableSkeleton'

interface MaintenancePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function TicketsContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const result = await ticketsRepo.list(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="Wrench"
        title="No maintenance tickets yet"
        description="Create your first maintenance ticket to track property issues and repairs."
        action={
          <CreateTicket>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </CreateTicket>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="Wrench"
        title="No tickets found"
        description={`No tickets match your search for "${filters.search}".`}
        action={
          <Button variant="outline" onClick={() => window.location.href = '/maintenance'}>
            Clear Search
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Tickets Table */}
      <TicketsTable tickets={result.data} />

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((result.pagination.page - 1) * result.pagination.perPage) + 1} to{' '}
            {Math.min(result.pagination.page * result.pagination.perPage, result.pagination.total)} of{' '}
            {result.pagination.total} tickets
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

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Validate and parse search parameters
  const filters = TicketFiltersSchema.parse(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track and manage maintenance requests and repairs"
        action={
          <CreateTicket>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </CreateTicket>
        }
      />

      <DataToolbar
        searchPlaceholder="Search tickets..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Open', value: 'open' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Resolved', value: 'resolved' },
              { label: 'Closed', value: 'closed' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
          {
            key: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
              { label: 'All Priorities', value: 'all' },
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ],
          },
        ]}
        sortOptions={[
          { label: 'Created Date', value: 'createdAt' },
          { label: 'Priority', value: 'priority' },
          { label: 'Status', value: 'status' },
          { label: 'Cost', value: 'cost' },
        ]}
      />

      <Suspense 
        fallback={<TicketsTableSkeleton />}
      >
        <TicketsContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
