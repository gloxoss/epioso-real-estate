'use client'

import { RealTimeDashboard } from '@/components/realtime/RealTimeDashboard'
import type { Dictionary } from '@/lib/i18n/config'

interface RealTimeMetric {
  id: string
  label: string
  value: number | string
  previousValue?: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  format?: 'currency' | 'percentage' | 'number' | 'text'
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  target?: number
  status?: 'good' | 'warning' | 'critical'
  lastUpdated: Date
}

interface RealTimeDashboardWrapperProps {
  metrics: RealTimeMetric[]
  autoRefresh?: boolean
  refreshInterval?: number
  showConnectionStatus?: boolean
  dictionary?: Dictionary
  locale?: string
}

export function RealTimeDashboardWrapper({
  metrics,
  autoRefresh = true,
  refreshInterval = 30000,
  showConnectionStatus = true,
  dictionary,
  locale = 'fr'
}: RealTimeDashboardWrapperProps) {
  const handleRefresh = async () => {
    console.log('Refreshing real-time metrics...')
    // In a real implementation, this would trigger a router.refresh() or fetch new data
  }

  return (
    <RealTimeDashboard
      metrics={metrics}
      onRefresh={handleRefresh}
      autoRefresh={autoRefresh}
      refreshInterval={refreshInterval}
      showConnectionStatus={showConnectionStatus}
      dictionary={dictionary}
      locale={locale}
    />
  )
}
