import { Metadata } from 'next'
import { OperationsReports } from '@/components/reports/OperationsReports'

export const metadata: Metadata = {
  title: 'Operations Reports | Property Management',
  description: 'Operational metrics and maintenance analytics',
}

export default function OperationsReportsPage() {
  return (
    <div className="space-y-6">
      <OperationsReports />
    </div>
  )
}
