import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { unitsRepo } from '@/repositories/units'
import { ticketsRepo } from '@/repositories/tickets'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Home, MapPin, Calendar, Edit, Plus, Wrench, Users, FileText, DollarSign, Upload } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Suspense } from 'react'
import { PropertyFinancialOverview } from '@/components/properties/PropertyFinancialOverview'
import { PropertyDocuments } from '@/components/properties/PropertyDocuments'
import { PropertyMaintenanceTracker } from '@/components/properties/PropertyMaintenanceTracker'
import { EnhancedUnitsTable } from '@/components/properties/EnhancedUnitsTable'

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>
}

async function getPropertyData(propertyId: string, organizationId: string) {
  const [property, units, tickets, financialData, documents] = await Promise.all([
    propertiesRepo.findById(propertyId, organizationId),
    unitsRepo.getByProperty(organizationId, propertyId),
    ticketsRepo.getByProperty(organizationId, propertyId, { status: ['open', 'in_progress'] }),
    getPropertyFinancialData(propertyId, organizationId),
    getPropertyDocuments(propertyId, organizationId)
  ])

  if (!property) {
    return null
  }

  return {
    property,
    units,
    tickets,
    financialData,
    documents
  }
}

async function getPropertyFinancialData(propertyId: string, organizationId: string) {
  // This would typically come from your billing/financial repository
  // For now, we'll create a mock structure that matches what we'd expect
  return {
    totalRevenue: 45000,
    monthlyRevenue: 3750,
    outstandingAmount: 2500,
    collectionRate: 94.5,
    recentInvoices: [],
    revenueHistory: []
  }
}

async function getPropertyDocuments(propertyId: string, organizationId: string) {
  // This would come from a documents repository
  // For now, return empty array - we'll implement the full system
  return []
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getPropertyData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, units: rawUnits, tickets, financialData, documents } = data

  // Convert Decimal fields to numbers for client components
  const units = rawUnits.map(unit => ({
    ...unit,
    rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
    listPrice: unit.listPrice ? Number(unit.listPrice) : null,
  }))
  const occupancyRate = property.totalUnits > 0
    ? Math.round((property.occupiedUnits / property.totalUnits) * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={property.address || 'Property details and management'}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/properties/${property.id}/units/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Link>
            </Button>
          </div>
        }
      />

      {/* Property Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {property.expectedUnits ? `Expected: ${property.expectedUnits}` : 'No target set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <Progress value={occupancyRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {property.occupiedUnits} occupied, {property.vacantUnits} vacant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">
              {property.pendingIssues > 0 ? 'Needs attention' : 'All resolved'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Type</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {property.propertyType || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(property.createdAt.toISOString())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {property.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{property.address}</span>
            </div>
          )}
          
          {property.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{property.description}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created on {formatDate(property.createdAt.toISOString())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Financial and Document Management */}
      <Tabs defaultValue="units" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Units ({units.length})
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading units...</div>}>
              <EnhancedUnitsTable
                units={units}
                propertyId={property.id}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading financial data...</div>}>
              <PropertyFinancialOverview
                propertyId={property.id}
                data={financialData}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading maintenance data...</div>}>
              <PropertyMaintenanceTracker
                propertyId={property.id}
                tickets={tickets}
                dictionary={undefined}
                locale="en"
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading documents...</div>}>
              <PropertyDocuments
                propertyId={property.id}
                documents={documents}
                dictionary={undefined}
                locale="en"
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
