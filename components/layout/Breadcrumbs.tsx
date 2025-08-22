'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  units: 'Units',
  contacts: 'Contacts',
  billing: 'Billing',
  invoices: 'Invoices',
  payments: 'Payments',
  documents: 'Documents',
  maintenance: 'Maintenance',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  organization: 'Organization',
  localization: 'Localization',
  board: 'Board View',
  new: 'New',
  edit: 'Edit',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumbs on dashboard
  if (segments.length <= 1) {
    return null
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = routeLabels[segment] || segment
    const isLast = index === segments.length - 1

    return {
      href,
      label,
      isLast,
    }
  })

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
