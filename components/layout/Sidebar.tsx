'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, Users, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/properties', label: 'Properties', icon: Building2 },
    { href: '/dashboard/tenants', label: 'Tenants', icon: Users },
    { href: '/dashboard/maintenance', label: 'Maintenance', icon: Settings },
  ]

  return (
    <div className="hidden border-r bg-card lg:block">
      <div className="flex h-full max-h-screen flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg">Property Pilot</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-3 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            Property Management System
          </div>
        </div>
      </div>
    </div>
  )
}

