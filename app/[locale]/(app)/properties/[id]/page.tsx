import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { unitsRepo } from '@/repositories/units'
import { ticketsRepo } from '@/repositories/tickets'
import { financialRepo } from '@/repositories/financial'
import { documentsRepo } from '@/repositories/documents'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
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
  params: Promise<{ id: string; locale: string }>
}

async function getPropertyData(propertyId: string, organizationId: string) {
  try {
    const [property, units, tickets, financialData, documentsResult] = await Promise.all([
      propertiesRepo.findById(propertyId, organizationId),
      unitsRepo.getByProperty(organizationId, propertyId),
      ticketsRepo.getByProperty(organizationId, propertyId, { status: ['open', 'in_progress'] }),
      financialRepo.getPropertyFinancialData(propertyId, organizationId),
      documentsRepo.getByProperty(organizationId, propertyId)
    ])

    if (!property) {
      return null
    }

    return {
      property,
      units: units || [],
      tickets: tickets || [],
      financialData: financialData || {},
      documents: documentsResult?.data || [] // Extract the data array from the paginated result
    }
  } catch (error) {
    console.error('Error fetching property data:', error)
    throw error
  }
}



export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id, locale } = await params

  if (!isValidLocale(locale)) {
    notFound()
  }

  const dictionary = await getDictionary(locale as Locale)
  const data = await getPropertyData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, units: rawUnits, tickets, financialData, documents } = data

  // Convert Decimal fields to numbers for client components with safety checks
  const units = (rawUnits || []).map(unit => ({
    ...unit,
    rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
    listPrice: unit.listPrice ? Number(unit.listPrice) : null,
  }))

  // Add safety checks for other data
  const safeTickets = tickets || []
  const safeDocuments = documents || []
  const occupancyRate = property.totalUnits > 0
    ? Math.round((property.occupiedUnits / property.totalUnits) * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={property.address || dictionary.properties.propertyDetails}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/properties/${property.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                {dictionary.properties.editProperty}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/properties/${property.id}/units/new`}>
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.properties.addUnit}
              </Link>
            </Button>
          </div>
        }
      />

      {/* Property Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties.totalUnits}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {property.expectedUnits ? `${dictionary.properties.expected}: ${property.expectedUnits}` : dictionary.common.noTargetSet || 'No target set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties.occupancyRate}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <Progress value={occupancyRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {property.occupiedUnits} {dictionary.properties.occupied}, {property.vacantUnits} {dictionary.properties.vacant}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties.openIssues}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.pendingIssues}</div>
            <p className="text-xs text-muted-foreground">
              {property.pendingIssues > 0 ? (dictionary.common.needsAttention || 'Needs attention') : dictionary.properties.allResolved}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties.propertyType}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {property.propertyType ? (dictionary.properties.propertyTypes?.[property.propertyType] || property.propertyType) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dictionary.common.created || "Created"} {formatDate(property.createdAt.toISOString())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.properties.propertyInformation}</CardTitle>
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
              <h4 className="font-medium mb-2">{dictionary.properties.propertyDescription || "Description"}</h4>
              <p className="text-muted-foreground">{property.description}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{dictionary.properties.createdOn} {formatDate(property.createdAt.toISOString())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Financial and Document Management */}
      <Tabs defaultValue="units" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {dictionary.properties.units} ({units.length})
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {dictionary.properties.financials}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {dictionary.properties.maintenance} ({safeTickets.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {dictionary.properties.documents} ({safeDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>{dictionary.common?.loading || "Loading"} {dictionary.properties?.units?.toLowerCase() || "units"}...</div>}>
              <EnhancedUnitsTable
                units={units}
                propertyId={property.id}
                dictionary={dictionary}
                locale={locale}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>{dictionary.common?.loading || "Loading"} {dictionary.properties?.financials?.toLowerCase() || "financial data"}...</div>}>
              <PropertyFinancialOverview
                propertyId={property.id}
                data={financialData}
                dictionary={dictionary}
                locale={locale}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>{dictionary.common?.loading || "Loading"} {dictionary.properties?.maintenance?.toLowerCase() || "maintenance data"}...</div>}>
              <PropertyMaintenanceTracker
                propertyId={property.id}
                tickets={safeTickets}
                dictionary={dictionary}
                locale={locale}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>{dictionary.common?.loading || "Loading"} {dictionary.properties?.documents?.toLowerCase() || "documents"}...</div>}>
              <PropertyDocuments
                propertyId={property.id}
                documents={safeDocuments}
                dictionary={dictionary}
                locale={locale}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
