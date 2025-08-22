'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from './SidebarContext'
import { AppHeader } from './AppHeader'
import { Breadcrumbs } from './Breadcrumbs'
import type { AuthSession } from '@/lib/rbac'

interface AppLayoutContentProps {
  session: AuthSession
  children: React.ReactNode
}

export function AppLayoutContent({ session, children }: AppLayoutContentProps) {
  const { collapsed } = useSidebar()

  return (
    <div className={cn(
      "transition-all duration-300",
      collapsed ? "lg:ml-16" : "lg:ml-64"
    )}>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <AppHeader session={session} />

        {/* Breadcrumbs */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-2">
            <Breadcrumbs />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
