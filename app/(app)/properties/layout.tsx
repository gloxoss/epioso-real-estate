'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertiesLayoutProps {
  children: React.ReactNode
}

export default function PropertiesLayout({ children }: PropertiesLayoutProps) {
  const pathname = usePathname()
  
  // Extract property ID from path if viewing specific property
  const propertyId = pathname.match(/\/properties\/([^\/]+)(?:\/|$)/)?.[1]
  const isPropertyDetail = propertyId && propertyId !== 'new'
  const isNewProperty = pathname.includes('/properties/new')
  const isEditProperty = pathname.includes('/edit')

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Properties', href: '/properties' },
  ]

  if (isNewProperty) {
    breadcrumbs.push({ label: 'New Property', href: '/properties/new' })
  } else if (isPropertyDetail) {
    breadcrumbs.push({ label: `Property ${propertyId}`, href: `/properties/${propertyId}` })
    if (isEditProperty) {
      breadcrumbs.push({ label: 'Edit', href: `/properties/${propertyId}/edit` })
    }
  }

  // Tab navigation for property details
  const propertyTabs = isPropertyDetail ? [
    { label: 'Overview', href: `/properties/${propertyId}`, active: pathname === `/properties/${propertyId}` },
    { label: 'Units', href: `/properties/${propertyId}/units`, active: pathname.includes('/units') },
    { label: 'Financials', href: `/properties/${propertyId}/financials`, active: pathname.includes('/financials') },
    { label: 'Documents', href: `/properties/${propertyId}/documents`, active: pathname.includes('/documents') },
    { label: 'Maintenance', href: `/properties/${propertyId}/maintenance`, active: pathname.includes('/maintenance') },
  ] : []

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
      {!isPropertyDetail && !isNewProperty && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">
              Manage your property portfolio
            </p>
          </div>
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>
      )}

      {/* Property Detail Tabs */}
      {propertyTabs.length > 0 && !isEditProperty && (
        <div className="border-b">
          <nav className="flex gap-6">
            {propertyTabs.map((tab) => (
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
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}
