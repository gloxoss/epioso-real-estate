import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { PaymentFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { PaymentsTable } from '@/components/billing/PaymentsTable'
import { RecordPayment } from '@/components/billing/RecordPayment'
import { EmptyState } from '@/components/layout/EmptyState'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { PaymentsTableSkeleton } from '@/components/billing/PaymentsTableSkeleton'

interface PaymentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function PaymentsContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const result = await billingRepo.listPayments(organizationId, filters, {
    page: 1,
    perPage: 50,
    sort: 'paidAt',
    dir: 'desc'
  })

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon="CreditCard"
        title="No payments found"
        description="No payments have been recorded yet. Record your first payment to get started."
        action={
          <RecordPayment>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </RecordPayment>
        }
      />
    )
  }

  return <PaymentsTable payments={result.data} />
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams

  // Parse and validate filters
  const filters = PaymentFiltersSchema.parse({
    search: params.search || '',
    method: params.method || '',
    invoiceId: params.invoiceId || '',
    dateFrom: params.dateFrom ? new Date(params.dateFrom as string) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo as string) : undefined,
  })

  const filterOptions = [
    {
      key: 'method',
      label: 'Payment Method',
      type: 'select' as const,
      options: [
        { label: 'All Methods', value: 'all' },
        { label: 'Cash', value: 'cash' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Check', value: 'check' },
        { label: 'Stripe', value: 'stripe' },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage all payment transactions"
        action={
          <RecordPayment>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </RecordPayment>
        }
      />

      <DataToolbar
        searchPlaceholder="Search payments..."
        filters={filterOptions}
      />

      <Suspense fallback={<PaymentsTableSkeleton />}>
        <PaymentsContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
