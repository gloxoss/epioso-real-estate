import { User } from '@supabase/supabase-js'
import { signOut } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, User as UserIcon, LogOut, Settings } from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { RealTimeStatusIndicator } from '@/components/realtime/RealTimeStatusIndicator'
import { CompactLanguageSwitcher } from '@/components/i18n/SimpleLanguageSwitcher'
import Link from 'next/link'

export default function Header({ user }: { user: User }) {
  const email = user.email ?? ''
  const initials = email.substring(0, 2).toUpperCase() || '??'

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      type: 'payment' as const,
      title: 'Payment Received',
      message: 'Rent payment of 2,500 MAD received from John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      isArchived: false,
      priority: 'medium' as const,
      metadata: { amount: 2500, tenantName: 'John Doe' }
    },
    {
      id: '2',
      type: 'maintenance' as const,
      title: 'Maintenance Request',
      message: 'New maintenance request for plumbing issue in Unit 3A',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      isArchived: false,
      priority: 'high' as const,
      actionUrl: '/maintenance/tickets/123',
      actionLabel: 'View Ticket'
    },
    {
      id: '3',
      type: 'tenant' as const,
      title: 'Lease Renewal',
      message: 'Lease renewal request from Sarah Johnson for Unit 2B',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      isArchived: false,
      priority: 'medium' as const
    }
  ]

  // Mock connection status
  const mockConnectionStatus = {
    isConnected: true,
    lastPing: new Date(),
    latency: 45,
    reconnectAttempts: 0,
    uptime: 3600,
    messagesReceived: 127,
    messagesSent: 43,
    quality: 'excellent' as const
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-6 shadow-sm">
      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Real-time Status */}
        <RealTimeStatusIndicator
          status={mockConnectionStatus}
          onReconnect={() => console.log('Reconnecting...')}
          compact={true}
        />

        {/* Language Switcher */}
        <CompactLanguageSwitcher />

        {/* Notifications */}
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={(id) => console.log('Mark as read:', id)}
          onMarkAllAsRead={() => console.log('Mark all as read')}
          onArchive={(id) => console.log('Archive:', id)}
          onAction={(notification) => console.log('Action:', notification)}
        />

        <Button asChild size="sm">
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{email}</p>
                <p className="text-xs text-muted-foreground">
                  Property Manager
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex w-full items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

