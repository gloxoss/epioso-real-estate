import { Metadata } from 'next'
import { OccupancyReports } from '@/components/reports/OccupancyReports'

export const metadata: Metadata = {
  title: 'Occupancy Reports | Property Management',
  description: 'Track occupancy rates and trends across your portfolio',
}

export default function OccupancyReportsPage() {
  return (
    <div className="space-y-6">
      <OccupancyReports />
    </div>
  )
}
