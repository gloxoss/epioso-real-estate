'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BillingLayoutProps {
  children: React.ReactNode
}

export default function BillingLayout({ children }: BillingLayoutProps) {
  const pathname = usePathname()

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/billing' },
  ]

  // Tab navigation
  const tabs = [
    { label: 'Overview', href: '/billing', active: pathname === '/billing' },
    { label: 'Invoices', href: '/billing/invoices', active: pathname.includes('/invoices') },
    { label: 'Payments', href: '/billing/payments', active: pathname.includes('/payments') },
    { label: 'Reports', href: '/billing/reports', active: pathname.includes('/reports') },
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
          <h1 className="text-2xl font-semibold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and financial reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/billing/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
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
