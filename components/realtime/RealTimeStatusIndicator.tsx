'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionStatus {
  isConnected: boolean
  lastPing?: Date
  latency?: number
  reconnectAttempts: number
  uptime: number
  messagesReceived: number
  messagesSent: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface RealTimeStatusIndicatorProps {
  status: ConnectionStatus
  onReconnect?: () => void
  showDetails?: boolean
  compact?: boolean
}

export function RealTimeStatusIndicator({
  status,
  onReconnect,
  showDetails = true,
  compact = false
}: RealTimeStatusIndicatorProps) {
  const [showPopover, setShowPopover] = useState(false)

  const getStatusColor = () => {
    if (!status.isConnected) return 'text-red-600 bg-red-50 border-red-200'
    
    switch (status.quality) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    if (!status.isConnected) return WifiOff
    
    switch (status.quality) {
      case 'excellent':
        return SignalHigh
      case 'good':
        return SignalMedium
      case 'fair':
        return SignalLow
      case 'poor':
        return Signal
      default:
        return Wifi
    }
  }

  const getStatusText = () => {
    if (!status.isConnected) return 'Disconnected'
    
    switch (status.quality) {
      case 'excellent':
        return 'Excellent'
      case 'good':
        return 'Good'
      case 'fair':
        return 'Fair'
      case 'poor':
        return 'Poor'
      default:
        return 'Connected'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const formatLatency = (latency?: number) => {
    if (!latency) return 'N/A'
    if (latency < 50) return `${latency}ms (Excellent)`
    if (latency < 100) return `${latency}ms (Good)`
    if (latency < 200) return `${latency}ms (Fair)`
    return `${latency}ms (Poor)`
  }

  const StatusIcon = getStatusIcon()
  const statusColor = getStatusColor()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", status.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")}>
        </div>
        <span className="text-xs text-muted-foreground">
          {status.isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    )
  }

  if (!showDetails) {
    return (
      <Badge variant="outline" className={statusColor}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {getStatusText()}
      </Badge>
    )
  }

  return (
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", statusColor)}>
          <StatusIcon className="h-4 w-4" />
          {getStatusText()}
          {status.isConnected && (
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Real-Time Connection</h3>
            <Badge variant="outline" className={statusColor}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {getStatusText()}
            </Badge>
          </div>

          {/* Connection Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {status.isConnected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {status.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Quality</p>
                <p className="font-medium capitalize">{status.quality}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Latency</p>
                <p className="font-medium">{formatLatency(status.latency)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Uptime</p>
                <p className="font-medium">{formatUptime(status.uptime)}</p>
              </div>
            </div>

            {/* Last Ping */}
            {status.lastPing && (
              <div className="text-sm">
                <p className="text-muted-foreground">Last Ping</p>
                <p className="font-medium">
                  {status.lastPing.toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Message Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Messages Received</p>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{status.messagesReceived.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Messages Sent</p>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{status.messagesSent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Reconnection Info */}
            {status.reconnectAttempts > 0 && (
              <div className="text-sm">
                <p className="text-muted-foreground">Reconnect Attempts</p>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{status.reconnectAttempts}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            {!status.isConnected && onReconnect && (
              <Button size="sm" onClick={onReconnect} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPopover(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={cn(
                "w-2 h-2 rounded-full",
                status.isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )} />
              <span>Real-time Updates</span>
            </div>
            
            {status.isConnected && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Live Data</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hook for managing connection status
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    reconnectAttempts: 0,
    uptime: 0,
    messagesReceived: 0,
    messagesSent: 0,
    quality: 'poor'
  })

  useEffect(() => {
    // Simulate connection status updates
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        uptime: prev.isConnected ? prev.uptime + 1 : 0,
        lastPing: prev.isConnected ? new Date() : prev.lastPing,
        latency: prev.isConnected ? Math.floor(Math.random() * 100) + 20 : undefined,
        quality: prev.isConnected ? 
          (Math.random() > 0.8 ? 'excellent' : 
           Math.random() > 0.6 ? 'good' : 
           Math.random() > 0.4 ? 'fair' : 'poor') : 'poor'
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const connect = () => {
    setStatus(prev => ({
      ...prev,
      isConnected: true,
      reconnectAttempts: 0,
      lastPing: new Date()
    }))
  }

  const disconnect = () => {
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      uptime: 0
    }))
  }

  const incrementReconnectAttempts = () => {
    setStatus(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))
  }

  const incrementMessagesReceived = () => {
    setStatus(prev => ({
      ...prev,
      messagesReceived: prev.messagesReceived + 1
    }))
  }

  const incrementMessagesSent = () => {
    setStatus(prev => ({
      ...prev,
      messagesSent: prev.messagesSent + 1
    }))
  }

  return {
    status,
    connect,
    disconnect,
    incrementReconnectAttempts,
    incrementMessagesReceived,
    incrementMessagesSent
  }
}
