'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Home,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
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

interface RealTimeDashboardProps {
  metrics: RealTimeMetric[]
  onRefresh?: () => Promise<void>
  autoRefresh?: boolean
  refreshInterval?: number
  showConnectionStatus?: boolean
  dictionary?: Dictionary
  locale?: string
}

export function RealTimeDashboard({
  metrics,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30000,
  showConnectionStatus = true,
  dictionary,
  locale = 'fr'
}: RealTimeDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshCount, setRefreshCount] = useState(0)

  // Translation functions
  const translateLabel = (label: string) => {
    switch (label) {
      case 'Total Revenue':
        return dictionary?.dashboard?.realtime?.totalRevenue || label
      case 'Occupancy Rate':
        return dictionary?.dashboard?.realtime?.occupancyRate || label
      case 'Active Tenants':
        return dictionary?.dashboard?.realtime?.activeTenants || label
      case 'Open Tickets':
        return dictionary?.dashboard?.realtime?.openTickets || label
      default:
        return label
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(async () => {
      await handleRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh, refreshInterval])

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional connection issues
      setIsConnected(Math.random() > 0.05) // 95% uptime
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh?.()
      setLastRefresh(new Date())
      setRefreshCount(prev => prev + 1)
    } catch (error) {
      console.error('Failed to refresh data:', error)
      setIsConnected(false)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, onRefresh])

  const formatValue = (value: number | string, format?: RealTimeMetric['format']) => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'currency':
        return formatCurrency(value, 'MAD')
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const getTrendIcon = (changeType?: RealTimeMetric['changeType']) => {
    switch (changeType) {
      case 'increase':
        return TrendingUp
      case 'decrease':
        return TrendingDown
      default:
        return null
    }
  }

  const getTrendColor = (changeType?: RealTimeMetric['changeType'], change?: number) => {
    if (!changeType || change === undefined) return 'text-muted-foreground'
    
    switch (changeType) {
      case 'increase':
        return change > 0 ? 'text-green-600' : 'text-red-600'
      case 'decrease':
        return change > 0 ? 'text-red-600' : 'text-green-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusColor = (status?: RealTimeMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTimeSinceUpdate = (lastUpdated: Date) => {
    const now = new Date()
    const diff = now.getTime() - lastUpdated.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return lastUpdated.toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">{dictionary?.dashboard?.realtime?.title || "Real-Time Dashboard"}</h2>
          {showConnectionStatus && (
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  {dictionary?.dashboard?.realtime?.connected || "Connected"}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
              {autoRefresh && (
                <Badge variant="outline" className="text-blue-600">
                  <Zap className="h-3 w-3 mr-1" />
                  {dictionary?.dashboard?.realtime?.liveUpdates || "Live Updates"}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {dictionary?.dashboard?.realtime?.lastUpdated || "Last updated"}: {getTimeSinceUpdate(lastRefresh)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || !isConnected}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : dictionary?.dashboard?.realtime?.refresh || 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon || Activity
          const TrendIcon = getTrendIcon(metric.changeType)
          const trendColor = getTrendColor(metric.changeType, metric.change)
          const statusColor = getStatusColor(metric.status)
          const isStale = new Date().getTime() - metric.lastUpdated.getTime() > refreshInterval * 2

          return (
            <Card 
              key={metric.id} 
              className={cn(
                "relative transition-all duration-300 hover:shadow-md",
                statusColor,
                isStale && "opacity-60"
              )}
            >
              {/* Live indicator */}
              {!isStale && isConnected && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {metric.status && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", statusColor)}
                    >
                      {metric.status}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {translateLabel(metric.label)}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format)}
                  </p>
                </div>

                {/* Trend and Change */}
                {metric.change !== undefined && TrendIcon && (
                  <div className="flex items-center mt-2">
                    <TrendIcon className={cn("h-3 w-3 mr-1", trendColor)} />
                    <span className={cn("text-xs font-medium", trendColor)}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {dictionary?.dashboard?.realtime?.vsPrevious || "vs previous"}
                    </span>
                  </div>
                )}

                {/* Progress bar for metrics with targets */}
                {metric.target && typeof metric.value === 'number' && (
                  <div className="mt-3">
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {dictionary?.dashboard?.realtime?.target || "Target"}: {formatValue(metric.target, metric.format)}
                    </p>
                  </div>
                )}

                {/* Last updated timestamp */}
                <p className="text-xs text-muted-foreground mt-2">
                  {dictionary?.dashboard?.realtime?.updated || "Updated"} {getTimeSinceUpdate(metric.lastUpdated)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Connection Status Details */}
      {!isConnected && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Connection Lost</p>
                <p className="text-sm text-red-700">
                  Unable to fetch real-time updates. Data may be outdated.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-auto"
              >
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Statistics */}
      {refreshCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{dictionary?.dashboard?.realtime?.refreshes || "Refreshes"}: {refreshCount}</span>
                <span>{dictionary?.dashboard?.realtime?.interval || "Interval"}: {refreshInterval / 1000}s</span>
                <span>{dictionary?.dashboard?.realtime?.autoRefresh || "Auto-refresh"}: {autoRefresh ? dictionary?.dashboard?.realtime?.on || 'On' : dictionary?.dashboard?.realtime?.off || 'Off'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{dictionary?.dashboard?.realtime?.systemOperational || "System operational"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for managing real-time metrics
export function useRealTimeMetrics(initialMetrics: RealTimeMetric[] = []) {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(initialMetrics)
  const [isLoading, setIsLoading] = useState(false)

  const updateMetric = useCallback((id: string, updates: Partial<RealTimeMetric>) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id 
        ? { ...metric, ...updates, lastUpdated: new Date() }
        : metric
    ))
  }, [])

  const refreshMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use the provided onRefresh function if available, otherwise just update timestamps
      if (onRefresh) {
        await onRefresh()
      } else {
        // If no refresh function provided, just update the lastUpdated timestamp
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          lastUpdated: new Date()
        })))
      }
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onRefresh])

  const addMetric = useCallback((metric: RealTimeMetric) => {
    setMetrics(prev => [...prev, metric])
  }, [])

  const removeMetric = useCallback((id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id))
  }, [])

  return {
    metrics,
    isLoading,
    updateMetric,
    refreshMetrics,
    addMetric,
    removeMetric
  }
}
