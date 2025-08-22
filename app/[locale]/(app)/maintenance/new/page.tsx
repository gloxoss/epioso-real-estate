import { Metadata } from 'next'
import { CreateTicket } from '@/components/maintenance/CreateTicket'
import { PageHeader } from '@/components/layout/PageHeader'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const metadata: Metadata = {
  title: 'New Maintenance Ticket | Property Management',
  description: 'Create a new maintenance ticket',
}

interface NewMaintenanceTicketPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewMaintenanceTicketPage({ params }: NewMaintenanceTicketPageProps) {
  const { locale } = await params
  const dictionary = await getDictionary(locale)
  return (
    <div className="space-y-6">
      <PageHeader
        title={dictionary?.maintenance?.createMaintenanceTicket || "Create Maintenance Ticket"}
        description={dictionary?.maintenance?.reportNewIssue || "Report a new maintenance issue or request"}
      />
      <div className="max-w-2xl">
        <CreateTicket dictionary={dictionary} locale={locale} />
      </div>
    </div>
  )
}
