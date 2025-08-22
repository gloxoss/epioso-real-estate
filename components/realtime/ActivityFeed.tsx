'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Activity, 
  User, 
  DollarSign, 
  Home, 
  Wrench, 
  FileText, 
  Calendar,
  MessageSquare,
  Upload,
  Download,
  Settings,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
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

interface ActivityFeedProps {
  activities: ActivityItem[]
  onRefresh?: () => void
  showFilters?: boolean
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
  dictionary?: Dictionary
  locale?: string
}

export function ActivityFeed({
  activities,
  onRefresh,
  showFilters = true,
  maxItems = 50,
  autoRefresh = false,
  refreshInterval = 30000,
  dictionary,
  locale = 'fr'
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'user' | 'system' | 'payment' | 'maintenance' | 'property'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [refreshing, setRefreshing] = useState(false)

  // Function to translate activity actions
  const translateAction = (action: string) => {
    switch (action) {
      case 'Payment Received':
        return dictionary?.dashboard?.activity?.paymentReceived || action
      case 'Maintenance Request Created':
        return dictionary?.dashboard?.activity?.maintenanceRequestCreated || action
      case 'Lease Renewal Request':
        return dictionary?.dashboard?.activity?.leaseRenewalRequest || action
      case 'Document Uploaded':
        return dictionary?.dashboard?.activity?.documentUploaded || action
      default:
        return action
    }
  }

  // Function to translate activity descriptions
  const translateDescription = (description: string) => {
    // Rent payment pattern
    if (description.includes('Rent payment of') && description.includes('received from')) {
      const match = description.match(/Rent payment of (.+) received from (.+) for (.+)/)
      if (match) {
        const [, amount, tenant, unit] = match
        return `${dictionary?.dashboard?.activity?.rentPaymentOf || 'Rent payment of'} ${amount} ${dictionary?.dashboard?.activity?.receivedFrom || 'received from'} ${tenant} ${dictionary?.dashboard?.activity?.for || 'for'} ${unit}`
      }
    }

    // Plumbing issue pattern
    if (description.includes('New plumbing issue reported in')) {
      const match = description.match(/New plumbing issue reported in (.+)/)
      if (match) {
        const [, property] = match
        return `${dictionary?.dashboard?.activity?.newPlumbingIssue || 'New plumbing issue reported in'} ${property}`
      }
    }

    // Lease renewal pattern
    if (description.includes('Lease renewal submitted for')) {
      const match = description.match(/Lease renewal submitted for (.+)/)
      if (match) {
        const [, property] = match
        return `${dictionary?.dashboard?.activity?.leaseRenewalSubmitted || 'Lease renewal submitted for'} ${property}`
      }
    }

    // Insurance certificate pattern
    if (description.includes('Insurance certificate uploaded for')) {
      const match = description.match(/Insurance certificate uploaded for (.+)/)
      if (match) {
        const [, property] = match
        return `${dictionary?.dashboard?.activity?.insuranceCertificate || 'Insurance certificate uploaded for'} ${property}`
      }
    }

    return description
  }

  // Function to translate user roles
  const translateRole = (role: string) => {
    switch (role) {
      case 'System':
        return dictionary?.dashboard?.activity?.system || role
      case 'Tenant':
        return dictionary?.dashboard?.activity?.tenant || role
      case 'Administrator':
        return dictionary?.dashboard?.activity?.administrator || role
      default:
        return role
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(() => {
      onRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh, refreshInterval])

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh?.()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const filteredActivities = activities
    .filter(activity => {
      // Type filter
      if (filter !== 'all' && activity.type !== filter) return false
      
      // Time filter
      if (timeFilter !== 'all') {
        const now = new Date()
        const activityDate = new Date(activity.timestamp)
        
        switch (timeFilter) {
          case 'today':
            return activityDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return activityDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return activityDate >= monthAgo
        }
      }
      
      return true
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems)

  const getActivityIcon = (type: ActivityItem['type'], action: string) => {
    switch (type) {
      case 'user':
        if (action.includes('login')) return User
        if (action.includes('created')) return UserPlus
        if (action.includes('deleted')) return UserMinus
        return User
      case 'payment':
        return DollarSign
      case 'maintenance':
        return Wrench
      case 'property':
        return Home
      case 'document':
        if (action.includes('upload')) return Upload
        if (action.includes('download')) return Download
        return FileText
      case 'tenant':
        return User
      case 'system':
        return Settings
      default:
        return Activity
    }
  }

  const getActivityColor = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    if (status) {
      switch (status) {
        case 'success':
          return 'text-green-600 bg-green-100'
        case 'warning':
          return 'text-yellow-600 bg-yellow-100'
        case 'error':
          return 'text-red-600 bg-red-100'
        case 'info':
          return 'text-blue-600 bg-blue-100'
      }
    }

    switch (type) {
      case 'payment':
        return 'text-green-600 bg-green-100'
      case 'maintenance':
        return 'text-orange-600 bg-orange-100'
      case 'property':
        return 'text-blue-600 bg-blue-100'
      case 'document':
        return 'text-purple-600 bg-purple-100'
      case 'tenant':
        return 'text-indigo-600 bg-indigo-100'
      case 'system':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusIcon = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'error':
        return AlertTriangle
      default:
        return null
    }
  }

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDate(timestamp.toISOString())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {dictionary?.dashboard?.activity?.title || "Activity Feed"}
            {autoRefresh && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {dictionary?.dashboard?.activity?.live || "Live"}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-2 mt-4">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dictionary?.dashboard?.activity?.allTypes || "All Types"}</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dictionary?.dashboard?.activity?.allTime || "All Time"}</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type, activity.action)
                  const colorClass = getActivityColor(activity.type, activity.status)
                  const StatusIcon = getStatusIcon(activity.status)
                  const isRecent = new Date().getTime() - activity.timestamp.getTime() < 300000 // 5 minutes

                  return (
                    <div key={activity.id} className="flex items-start gap-3 relative">
                      {/* Timeline line */}
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-8 bg-border" />
                      )}

                      {/* Activity icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        colorClass,
                        isRecent && "ring-2 ring-blue-200 ring-offset-2"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Activity content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{translateAction(activity.action)}</p>
                            {StatusIcon && (
                              <StatusIcon className={cn(
                                "h-3 w-3",
                                activity.status === 'success' && "text-green-600",
                                activity.status === 'warning' && "text-yellow-600",
                                activity.status === 'error' && "text-red-600"
                              )} />
                            )}
                            {isRecent && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(activity.timestamp)}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {translateDescription(activity.description)}
                        </p>

                        {/* Metadata */}
                        {activity.metadata && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {activity.metadata.propertyName && (
                              <Badge variant="outline" className="text-xs">
                                <Home className="h-3 w-3 mr-1" />
                                {activity.metadata.propertyName}
                              </Badge>
                            )}
                            {activity.metadata.unitNumber && (
                              <Badge variant="outline" className="text-xs">
                                Unit {activity.metadata.unitNumber}
                              </Badge>
                            )}
                            {activity.metadata.tenantName && (
                              <Badge variant="outline" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {activity.metadata.tenantName}
                              </Badge>
                            )}
                            {activity.metadata.amount && (
                              <Badge variant="outline" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {activity.metadata.amount.toLocaleString()} MAD
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* User info */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs text-muted-foreground">
                            {activity.user.name} • {translateRole(activity.user.role)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {filteredActivities.length >= maxItems && (
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Showing latest {maxItems} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Real-time activity hook
export function useRealTimeActivity(initialActivities: ActivityItem[] = []) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true)

    // Simulate receiving new activities
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'system',
        action: 'System Update',
        description: 'Automated system maintenance completed',
        user: {
          id: 'system',
          name: 'System',
          role: 'System'
        },
        timestamp: new Date(),
        priority: 'low',
        status: 'success'
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 49)])
    }, 60000) // Add new activity every minute

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  const addActivity = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev.slice(0, 49)])
  }

  const refreshActivities = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real implementation, this would fetch fresh data
  }

  return {
    activities,
    isConnected,
    addActivity,
    refreshActivities
  }
}
