import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { NewInvoiceForm } from '@/components/billing/NewInvoiceForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface NewInvoicePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams

  // Get pre-filled data from query params
  const contactId = typeof params.contactId === 'string' ? params.contactId : undefined
  const unitId = typeof params.unitId === 'string' ? params.unitId : undefined
  const propertyId = typeof params.propertyId === 'string' ? params.propertyId : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Invoice"
        description="Generate a new invoice for your customers"
        action={
          <Button variant="outline" asChild>
            <Link href="/billing/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        }
      />

      <NewInvoiceForm 
        organizationId={session.organizationId}
        initialContactId={contactId}
        initialUnitId={unitId}
        initialPropertyId={propertyId}
      />
    </div>
  )
}
