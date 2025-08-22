'use client'

import { ActivityFeed } from '@/components/realtime/ActivityFeed'
import type { Dictionary } from '@/lib/i18n/config'

interface ActivityItem {
  id: string
  type: 'user' | 'system' | 'payment' | 'maintenance' | 'property' | 'document' | 'tenant'
  action: string
  description: string
  user: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  timestamp: Date
  metadata?: {
    propertyId?: string
    propertyName?: string
    unitId?: string
    unitNumber?: string
    tenantId?: string
    tenantName?: string
    amount?: number
    documentName?: string
    ticketId?: string
  }
  priority: 'low' | 'medium' | 'high'
  status?: 'success' | 'warning' | 'error' | 'info'
}

interface ActivityFeedWrapperProps {
  activities: ActivityItem[]
  autoRefresh?: boolean
  refreshInterval?: number
  maxItems?: number
  dictionary?: Dictionary
  locale?: string
}

export function ActivityFeedWrapper({
  activities,
  autoRefresh = true,
  refreshInterval = 30000,
  maxItems = 10,
  dictionary,
  locale = 'fr'
}: ActivityFeedWrapperProps) {
  const handleRefresh = async () => {
    console.log('Refreshing activity feed...')
    // In a real implementation, this would trigger a router.refresh() or fetch new data
  }

  return (
    <ActivityFeed
      activities={activities}
      onRefresh={handleRefresh}
      autoRefresh={autoRefresh}
      refreshInterval={refreshInterval}
      maxItems={maxItems}
      dictionary={dictionary}
      locale={locale}
    />
  )
}
