import { Metadata } from 'next'
import { CreateTicket } from '@/components/maintenance/CreateTicket'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'New Maintenance Ticket | Property Management',
  description: 'Create a new maintenance ticket',
}

export default function NewMaintenanceTicketPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Maintenance Ticket"
        description="Report a new maintenance issue or request"
      />
      <div className="max-w-2xl">
        <CreateTicket />
      </div>
    </div>
  )
}
