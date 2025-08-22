'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  DollarSign,
  Home,
  Wrench,
  Users,
  Calendar,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'maintenance' | 'tenant' | 'system'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  isArchived: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    propertyId?: string
    unitId?: string
    tenantId?: string
    amount?: number
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onArchive?: (notificationId: string) => void
  onAction?: (notification: Notification) => void
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onAction
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length

  const filteredNotifications = notifications
    .filter(n => !n.isArchived)
    .filter(n => {
      switch (filter) {
        case 'unread':
          return !n.isRead
        case 'urgent':
          return n.priority === 'urgent'
        default:
          return true
      }
    })
    .sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'error':
        return AlertTriangle
      case 'payment':
        return DollarSign
      case 'maintenance':
        return Wrench
      case 'tenant':
        return Users
      case 'system':
        return Settings
      default:
        return Info
    }
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200'
    
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'payment':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'maintenance':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'tenant':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'system':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs text-gray-600">Low</Badge>
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead?.(notification.id)
    }
    if (notification.actionUrl) {
      onAction?.(notification)
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>All Notifications</DialogTitle>
                      <DialogDescription>
                        Manage all your notifications and settings
                      </DialogDescription>
                    </DialogHeader>
                    <NotificationManagement 
                      notifications={notifications}
                      onMarkAsRead={onMarkAsRead}
                      onArchive={onArchive}
                      onAction={onAction}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs"
              >
                All ({notifications.filter(n => !n.isArchived).length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="text-xs"
              >
                Unread ({unreadCount})
              </Button>
              {urgentCount > 0 && (
                <Button
                  variant={filter === 'urgent' ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('urgent')}
                  className="text-xs"
                >
                  Urgent ({urgentCount})
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.slice(0, 10).map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const colorClass = getNotificationColor(notification.type, notification.priority)
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                          !notification.isRead && "bg-muted/20",
                          colorClass
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(notification.timestamp.toISOString())}
                              </p>
                              <div className="flex items-center gap-1">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onMarkAsRead?.(notification.id)
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onArchive?.(notification.id)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>

          {filteredNotifications.length > 10 && (
            <div className="p-3 border-t">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full text-xs">
                    View All Notifications ({filteredNotifications.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Notifications</DialogTitle>
                  </DialogHeader>
                  <NotificationManagement 
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                    onArchive={onArchive}
                    onAction={onAction}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

function NotificationManagement({
  notifications,
  onMarkAsRead,
  onArchive,
  onAction
}: {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  onArchive?: (id: string) => void
  onAction?: (notification: Notification) => void
}) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const filteredNotifications = notifications.filter(n => {
    switch (filter) {
      case 'unread':
        return !n.isRead && !n.isArchived
      case 'archived':
        return n.isArchived
      default:
        return !n.isArchived
    }
  })

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread
        </Button>
        <Button
          variant={filter === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('archived')}
        >
          Archived
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            
            return (
              <Card key={notification.id} className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                !notification.isRead && "bg-muted/20"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notification.timestamp.toISOString())}
                        </p>
                        <div className="flex items-center gap-2">
                          {notification.actionLabel && (
                            <Button
                              size="sm"
                              onClick={() => onAction?.(notification)}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkAsRead?.(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onArchive?.(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// Helper functions moved outside components
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertTriangle
    case 'payment':
      return DollarSign
    case 'maintenance':
      return Wrench
    case 'tenant':
      return Users
    case 'system':
      return Settings
    default:
      return Info
  }
}

function getNotificationColor(type: Notification['type'], priority: Notification['priority']) {
  if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200'
  
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'payment':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'maintenance':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'tenant':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'system':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

function getPriorityBadge(priority: Notification['priority']) {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>
    case 'high':
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
    case 'medium':
      return <Badge variant="outline" className="text-xs">Medium</Badge>
    case 'low':
      return <Badge variant="outline" className="text-xs text-gray-600">Low</Badge>
  }
}
