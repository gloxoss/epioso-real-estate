'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, List, Kanban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddUnit } from '@/components/units/AddUnit'

interface UnitsLayoutProps {
  children: React.ReactNode
}

export default function UnitsLayout({ children }: UnitsLayoutProps) {
  const pathname = usePathname()
  
  // Determine current view
  const isBoardView = pathname.includes('/board')
  const isListView = pathname === '/units' || (!isBoardView && pathname.startsWith('/units'))

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Units', href: '/units' },
  ]

  // Tab navigation
  const tabs = [
    { 
      label: 'List View', 
      href: '/units', 
      icon: List,
      active: isListView && !pathname.includes('/board')
    },
    { 
      label: 'Board View', 
      href: '/units/board', 
      icon: Kanban,
      active: isBoardView
    },
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
          <h1 className="text-2xl font-semibold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage your property units and their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddUnit>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </AddUnit>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors",
                  tab.active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      {children}
    </div>
  )
}
