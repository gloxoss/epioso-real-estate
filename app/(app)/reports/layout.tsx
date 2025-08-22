'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronRight, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportsLayoutProps {
  children: React.ReactNode
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  const pathname = usePathname()

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
  ]

  // Tab navigation
  const tabs = [
    { label: 'Overview', href: '/reports', active: pathname === '/reports' },
    { label: 'Financial', href: '/reports/financial', active: pathname.includes('/financial') },
    { label: 'Occupancy', href: '/reports/occupancy', active: pathname.includes('/occupancy') },
    { label: 'Operations', href: '/reports/operations', active: pathname.includes('/operations') },
    { label: 'Custom', href: '/reports/custom', active: pathname.includes('/custom') },
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

      {/* Section Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate insights and track performance across your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "py-3 px-1 border-b-2 text-sm font-medium transition-colors",
                tab.active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {children}
    </div>
  )
}
