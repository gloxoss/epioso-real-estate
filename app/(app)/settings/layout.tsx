'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
  ]

  // Side navigation
  const navigation = [
    { label: 'General', href: '/settings', active: pathname === '/settings' },
    { label: 'Profile', href: '/settings/profile', active: pathname.includes('/profile') },
    { label: 'Team', href: '/settings/team', active: pathname.includes('/team') },
    { label: 'Roles & Permissions', href: '/settings/roles', active: pathname.includes('/roles') },
    { label: 'Billing', href: '/settings/billing', active: pathname.includes('/billing') },
    { label: 'Integrations', href: '/settings/integrations', active: pathname.includes('/integrations') },
    { label: 'Security', href: '/settings/security', active: pathname.includes('/security') },
    { label: 'Notifications', href: '/settings/notifications', active: pathname.includes('/notifications') },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link 
                href={crumb.href} 
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex gap-8">
        {/* Side Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
