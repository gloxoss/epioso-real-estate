'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from './SidebarContext'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { usePermissions } from '@/lib/rbac'
import type { AuthSession } from '@/lib/rbac'
import { FullLanguageSwitcher } from '@/components/i18n/SimpleLanguageSwitcher'
import type { Dictionary } from '@/lib/i18n/config'
import {
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  UserCheck,
  Calendar,
} from 'lucide-react'

interface AppSidebarProps {
  session: AuthSession
  dictionary?: Dictionary
  locale?: string
}

function getNavigation(dictionary?: Dictionary, locale: string = 'en') {
  return [
    {
      name: dictionary?.navigation?.dashboard || 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: BarChart3,
      permission: null, // Always visible
    },
    {
      name: 'Leads',
      href: `/${locale}/leads`,
      icon: Target,
      permission: 'leads:read' as const,
      children: [
        { name: 'All Leads', href: `/${locale}/leads` },
        { name: 'New Leads', href: `/${locale}/leads?status=new` },
        { name: 'Qualified', href: `/${locale}/leads?status=qualified` },
      ],
    },
    {
      name: 'Sales',
      href: `/${locale}/sales`,
      icon: TrendingUp,
      permission: 'sales:read' as const,
      children: [
        { name: 'All Deals', href: `/${locale}/sales` },
        { name: 'Active Deals', href: `/${locale}/sales?status=active` },
        { name: 'Completed Sales', href: `/${locale}/sales?status=completed` },
        { name: 'Payment Plans', href: `/${locale}/sales/payment-plans` },
      ],
    },
    {
      name: 'Sales Agents',
      href: `/${locale}/agents`,
      icon: UserCheck,
      permission: 'agents:read' as const,
    },
    {
      name: dictionary?.navigation?.properties || 'Properties',
      href: `/${locale}/properties`,
      icon: Building2,
      permission: 'properties:read' as const,
    },
    {
      name: dictionary?.navigation?.units || 'Units',
      href: `/${locale}/units`,
      icon: Home,
      permission: 'units:read' as const,
      children: [
        { name: 'For Sale', href: `/${locale}/units?forSale=true` },
        { name: 'For Rent', href: `/${locale}/units?forRent=true` },
        { name: dictionary?.navigation?.boardView || 'Board View', href: `/${locale}/units/board` },
      ],
    },
    {
      name: dictionary?.navigation?.contacts || 'Contacts',
      href: `/${locale}/contacts`,
      icon: Users,
      permission: 'contacts:read' as const,
    },
    {
      name: dictionary?.navigation?.billing || 'Billing',
      href: `/${locale}/billing`,
      icon: CreditCard,
      permission: 'billing:read' as const,
      children: [
        { name: dictionary?.navigation?.invoices || 'Invoices', href: `/${locale}/billing/invoices` },
        { name: dictionary?.navigation?.payments || 'Payments', href: `/${locale}/billing/payments` },
      ],
    },
    {
      name: dictionary?.navigation?.documents || 'Documents',
      href: `/${locale}/documents`,
      icon: FileText,
      permission: 'documents:read' as const,
    },
    {
      name: dictionary?.navigation?.maintenance || 'Maintenance',
      href: `/${locale}/maintenance`,
      icon: Wrench,
      permission: 'maintenance:read' as const,
    },
    {
      name: dictionary?.navigation?.reports || 'Reports',
      href: `/${locale}/reports`,
      icon: BarChart3,
      permission: 'reports:read' as const,
    },
    {
      name: dictionary?.navigation?.settings || 'Settings',
      href: `/${locale}/settings`,
      icon: Settings,
      permission: null, // Always visible
      children: [
        { name: dictionary?.navigation?.profile || 'Profile', href: `/${locale}/settings/profile` },
        { name: dictionary?.navigation?.organization || 'Organization', href: `/${locale}/settings/organization` },
        { name: dictionary?.navigation?.billingSettings || 'Billing', href: `/${locale}/settings/billing` },
      ],
    },
  ]
}

function SidebarContent({
  session,
  onNavigate,
  collapsed,
  setCollapsed,
  dictionary,
  locale = 'en'
}: {
  session: AuthSession;
  onNavigate?: () => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  dictionary?: Dictionary;
  locale?: string;
}) {
  const pathname = usePathname()
  const permissions = usePermissions(session)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const navigation = getNavigation(dictionary, locale)
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand items that contain the current path
    return navigation
      .filter(item => item.children && (pathname === item.href || pathname.startsWith(item.href + '/')))
      .map(item => item.name)
  })

  // Use external collapsed state if provided, otherwise use internal state
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
  const toggleCollapsed = setCollapsed || setInternalCollapsed

  const filteredNavigation = navigation.filter(item =>
    !item.permission || permissions.can(item.permission)
  )

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo and collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-semibold">Epioso Sales</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleCollapsed(!isCollapsed)}
          className="hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedItems.includes(item.name)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.name}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="flex-1">{item.name}</span>}
                  </Link>

                  {/* Dropdown arrow for items with children */}
                  {!isCollapsed && hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleExpanded(item.name)
                      }}
                      className="h-8 w-8 p-0 hover:bg-accent/50"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Sub-navigation */}
                {!isCollapsed && item.children && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          'block rounded-md px-3 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                          pathname === child.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Language switcher */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <FullLanguageSwitcher className="w-full justify-start" />
        </div>
      )}

      {/* User info */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {session.user.name?.[0] || session.user.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AppSidebar({ session, dictionary, locale = 'en' }: AppSidebarProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background transition-all duration-300",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent
          session={session}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          dictionary={dictionary}
          locale={locale}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            session={session}
            dictionary={dictionary}
            locale={locale}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
