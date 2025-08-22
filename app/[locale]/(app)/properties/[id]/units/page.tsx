import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { unitsRepo } from '@/repositories/units'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft,
  Building2,
  Home,
  Plus,
  Users,
  Wrench,
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/format'
import { EnhancedUnitsTable } from '@/components/properties/EnhancedUnitsTable'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { getDictionary } from '@/lib/i18n/dictionaries'

interface PropertyUnitsPageProps {
  params: Promise<{ id: string; locale: string }>
}

async function getPropertyUnitsData(propertyId: string, organizationId: string) {
  try {
    const [property, units] = await Promise.all([
      propertiesRepo.findById(propertyId, organizationId),
      unitsRepo.getByProperty(organizationId, propertyId)
    ])

    if (!property) {
      return null
    }

    return {
      property,
      units: units.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        status: unit.status as 'occupied' | 'available' | 'maintenance',
        rentAmount: unit.rentAmount ? Number(unit.rentAmount) : undefined,
        // Extract additional fields from attributes if they exist
        bedrooms: (unit.attributes as any)?.bedrooms || undefined,
        bathrooms: (unit.attributes as any)?.bathrooms || undefined,
        size: (unit.attributes as any)?.size || undefined,
        // Add any other properties that might be needed
        property: unit.property,
      }))
    }
  } catch (error) {
    console.error('Error fetching property units data:', error)
    throw error
  }
}

export default async function PropertyUnitsPage({ params }: PropertyUnitsPageProps) {
  const session = await requireAuthWithRole()
  const { id, locale } = await params
  const dictionary = await getDictionary(locale)
  
  const data = await getPropertyUnitsData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, units } = data

  // Calculate statistics
  const totalUnits = units.length
  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length
  const availableUnits = units.filter(unit => unit.status === 'available').length
  const maintenanceUnits = units.filter(unit => unit.status === 'maintenance').length
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  
  const totalRent = units
    .filter(unit => unit.status === 'occupied' && unit.rentAmount)
    .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dictionary.properties?.units || "Units"} - ${property.name}`}
        description={`${dictionary.properties?.manageAllUnits || "Manage all units in"} ${property.name}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {dictionary.properties?.backToProperty || "Back to Property"}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/properties/${property.id}/units/new`}>
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.properties?.addUnit || "Add Unit"}
              </Link>
            </Button>
          </div>
        }
      />

      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>{dictionary.properties?.propertyOverview || "Property Overview"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
              <p className="text-sm text-muted-foreground capitalize">{property.propertyType}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{dictionary.properties?.occupancyRate || "Occupancy Rate"}</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {occupiedUnits} {dictionary.properties?.of || "of"} {totalUnits} {dictionary.properties?.unitsOccupied || "units occupied"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.totalUnits || "Total Units"}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary.properties?.allUnitsInProperty || "All units in property"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.occupied || "Occupied"}</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
            <p className="text-xs text-muted-foreground">
              {occupancyRate}% {dictionary.properties?.occupancyRate?.toLowerCase() || "occupancy rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.available || "Available"}</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableUnits}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary.properties?.readyForTenants || "Ready for tenants"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.maintenance || "Maintenance"}</CardTitle>
            <Wrench className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceUnits}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary.properties?.needsAttention || "Needs attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {dictionary.properties?.monthlyRevenue || "Monthly Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalRent)}</div>
            <p className="text-sm text-muted-foreground">
              {dictionary.properties?.fromOccupiedUnits || "From"} {occupiedUnits} {dictionary.properties?.occupiedUnits?.toLowerCase() || "occupied units"}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>{dictionary.properties?.averageRentPerUnit || "Average rent per unit"}</span>
                <span className="font-medium">
                  {occupiedUnits > 0 ? formatCurrency(totalRent / occupiedUnits) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {dictionary.properties?.performance || "Performance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dictionary.properties?.occupancyRate || "Occupancy Rate"}</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dictionary.properties?.vacantUnits || "Vacant Units"}</span>
              <span className="font-medium">{availableUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dictionary.properties?.unitsInMaintenance || "Units in Maintenance"}</span>
              <span className="font-medium">{maintenanceUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dictionary.properties?.revenuePotential || "Revenue Potential"}</span>
              <span className="font-medium">
                {totalUnits > 0 ? Math.round((totalRent / (totalUnits * (totalRent / Math.max(occupiedUnits, 1)))) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Table */}
      <ErrorBoundary>
        <Suspense fallback={
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        }>
          <EnhancedUnitsTable
            units={units}
            propertyId={property.id}
            dictionary={dictionary}
            locale={locale}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.properties?.quickActions || "Quick Actions"}</CardTitle>
          <CardDescription>
            {dictionary.properties?.commonActionsForManaging || "Common actions for managing units in this property"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/properties/${property.id}/units/new`}>
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.properties?.addNewUnit || "Add New Unit"}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/properties/${property.id}/financials`}>
                <DollarSign className="h-4 w-4 mr-2" />
                {dictionary.properties?.viewFinancials || "View Financials"}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/properties/${property.id}/maintenance`}>
                <Wrench className="h-4 w-4 mr-2" />
                {dictionary.properties?.maintenance || "Maintenance"}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/properties/${property.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                {dictionary.properties?.propertyOverview || "Property Overview"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
