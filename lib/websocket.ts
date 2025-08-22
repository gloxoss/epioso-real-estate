// WebSocket service for real-time communication
export type WebSocketEventType = 
  | 'notification'
  | 'activity'
  | 'metric_update'
  | 'payment_received'
  | 'maintenance_created'
  | 'maintenance_updated'
  | 'tenant_action'
  | 'system_alert'
  | 'dashboard_update'

export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: string
  userId?: string
  organizationId: string
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private eventListeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()
  private connectionListeners: Set<(connected: boolean) => void> = new Set()
  private isConnected = false
  private shouldReconnect = true

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || (typeof window !== 'undefined' 
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`
        : 'ws://localhost:3000/api/ws'
      ),
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000
    }
  }

  connect(organizationId: string, userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.config.url)
        url.searchParams.set('organizationId', organizationId)
        if (userId) {
          url.searchParams.set('userId', userId)
        }

        this.ws = new WebSocket(url.toString())

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.notifyConnectionListeners(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.stopHeartbeat()
          this.notifyConnectionListeners(false)

          if (this.shouldReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect(organizationId, userId)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.shouldReconnect = false
    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.isConnected = false
    this.notifyConnectionListeners(false)
  }

  send(type: WebSocketEventType, data: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, cannot send message')
      return
    }

    const message: Omit<WebSocketMessage, 'organizationId'> = {
      type,
      data,
      timestamp: new Date().toISOString()
    }

    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
    }
  }

  subscribe(eventType: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    
    this.eventListeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType)
        }
      }
    }
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    
    // Call immediately with current status
    callback(this.isConnected)

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback)
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.eventListeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          console.error('Error in WebSocket event listener:', error)
        }
      })
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send('system_alert', { type: 'heartbeat' })
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(organizationId: string, userId?: string): void {
    this.reconnectAttempts++
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(organizationId, userId).catch(error => {
        console.error('Reconnect failed:', error)
      })
    }, delay)
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }
}

// Singleton instance
let wsService: WebSocketService | null = null

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService()
  }
  return wsService
}

// React hook for WebSocket connection
export function useWebSocket(organizationId: string, userId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [service] = useState(() => getWebSocketService())

  useEffect(() => {
    const unsubscribe = service.onConnectionChange(setIsConnected)
    
    // Connect if not already connected
    if (!service.getConnectionStatus()) {
      service.connect(organizationId, userId).catch(error => {
        console.error('Failed to connect WebSocket:', error)
      })
    }

    return () => {
      unsubscribe()
    }
  }, [service, organizationId, userId])

  useEffect(() => {
    return () => {
      // Don't disconnect on unmount as other components might be using it
      // service.disconnect()
    }
  }, [service])

  const subscribe = useCallback((eventType: WebSocketEventType, callback: (data: any) => void) => {
    return service.subscribe(eventType, callback)
  }, [service])

  const send = useCallback((type: WebSocketEventType, data: any) => {
    service.send(type, data)
  }, [service])

  return {
    isConnected,
    subscribe,
    send,
    service
  }
}

// Utility functions for common WebSocket operations
export const webSocketUtils = {
  // Send notification
  sendNotification: (service: WebSocketService, notification: any) => {
    service.send('notification', notification)
  },

  // Send activity update
  sendActivity: (service: WebSocketService, activity: any) => {
    service.send('activity', activity)
  },

  // Send metric update
  sendMetricUpdate: (service: WebSocketService, metric: any) => {
    service.send('metric_update', metric)
  },

  // Send payment notification
  sendPaymentReceived: (service: WebSocketService, payment: any) => {
    service.send('payment_received', payment)
  },

  // Send maintenance update
  sendMaintenanceUpdate: (service: WebSocketService, maintenance: any) => {
    service.send('maintenance_updated', maintenance)
  },

  // Send dashboard update
  sendDashboardUpdate: (service: WebSocketService, data: any) => {
    service.send('dashboard_update', data)
  }
}

// Types for common WebSocket events
export interface NotificationEvent {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  userId?: string
  metadata?: any
}

export interface ActivityEvent {
  id: string
  type: string
  action: string
  description: string
  userId: string
  metadata?: any
}

export interface MetricUpdateEvent {
  metricId: string
  value: number | string
  change?: number
  timestamp: string
}

export interface PaymentEvent {
  paymentId: string
  amount: number
  currency: string
  propertyId: string
  tenantId: string
  status: 'completed' | 'failed' | 'pending'
}

export interface MaintenanceEvent {
  ticketId: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  propertyId: string
  assignedTo?: string
}
