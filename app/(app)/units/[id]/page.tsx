import { requireAuthWithRole } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { ticketsRepo } from '@/repositories/tickets'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Edit,
  ArrowLeft,
  Wrench,
  Users,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatMoney, formatDate } from '@/lib/format'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Suspense } from 'react'
import { UnitLeaseManagement } from '@/components/units/UnitLeaseManagement'
import { UnitFinancialTracking } from '@/components/units/UnitFinancialTracking'
import { UnitMaintenanceHistory } from '@/components/units/UnitMaintenanceHistory'
import { TenantAssignment } from '@/components/units/TenantAssignment'

interface UnitDetailPageProps {
  params: Promise<{ id: string }>
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

async function getUnitData(unitId: string, organizationId: string) {
  const [unit, tickets, leaseData, financialData] = await Promise.all([
    unitsRepo.findById(unitId, organizationId),
    ticketsRepo.getByUnit(organizationId, unitId, { status: ['open', 'in_progress'] }),
    getUnitLeaseData(unitId, organizationId),
    getUnitFinancialData(unitId, organizationId)
  ])

  if (!unit) {
    return null
  }

  return { unit, tickets, leaseData, financialData }
}

async function getUnitLeaseData(unitId: string, organizationId: string) {
  // This would come from a leases repository
  // For now, return mock data structure
  return {
    currentLease: null,
    leaseHistory: [],
    upcomingRenewal: null
  }
}

async function getUnitFinancialData(unitId: string, organizationId: string) {
  // This would come from financial/billing repository
  // For now, return mock data structure
  return {
    monthlyRevenue: 0,
    totalRevenue: 0,
    outstandingAmount: 0,
    recentPayments: [],
    paymentHistory: []
  }
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getUnitData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { unit, tickets, leaseData, financialData } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Unit ${unit.unitNumber}`}
        description={`${unit.property.name} • ${unit.status}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${unit.property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/units/${unit.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Unit
              </Link>
            </Button>
          </div>
        }
      />

      {/* Unit Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(unit.status)}>
              {unit.status}
            </Badge>
          </CardContent>
        </Card>

        {unit.rentAmount && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(unit.rentAmount)}</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {tickets.length > 0 ? 'Needs attention' : 'All resolved'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">{unit.property.name}</div>
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href={`/properties/${unit.property.id}`}>
                View Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Unit Details */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(unit.attributes?.floor !== null && unit.attributes?.floor !== undefined) && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Floor</div>
                <div className="text-lg">{unit.attributes.floor}</div>
              </div>
            )}

            {(unit.attributes?.bedrooms !== null && unit.attributes?.bedrooms !== undefined) && (
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bedrooms</div>
                  <div className="text-lg">{unit.attributes.bedrooms}</div>
                </div>
              </div>
            )}

            {(unit.attributes?.bathrooms !== null && unit.attributes?.bathrooms !== undefined) && (
              <div className="flex items-center space-x-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bathrooms</div>
                  <div className="text-lg">{unit.attributes.bathrooms}</div>
                </div>
              </div>
            )}

            {unit.attributes?.size && (
              <div className="flex items-center space-x-2">
                <Square className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Size</div>
                  <div className="text-lg">{unit.attributes.size} sq ft</div>
                </div>
              </div>
            )}
          </div>

          {unit.attributes?.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{unit.attributes.description}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created on {formatDate(unit.createdAt.toISOString())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Unit Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lease" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lease & Tenant
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance ({tickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unit.status === 'available' && (
                  <Button asChild>
                    <Link href={`/units/${unit.id}/assign-tenant`}>
                      <Users className="h-4 w-4 mr-2" />
                      Assign Tenant
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href={`/maintenance/new?unit=${unit.id}`}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Report Issue
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/billing/invoices/new?unit=${unit.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Open Maintenance Tickets */}
          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Open Maintenance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {formatDate(ticket.createdAt.toISOString())}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          ticket.priority === 'urgent' ? 'destructive' :
                          ticket.priority === 'high' ? 'destructive' :
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/maintenance/${ticket.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tickets.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="ghost" asChild>
                        <Link href={`/maintenance?unit=${unit.id}`}>
                          View all {tickets.length} tickets
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lease" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading lease information...</div>}>
              <UnitLeaseManagement
                unitId={unit.id}
                unit={unit}
                leaseData={leaseData}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading financial data...</div>}>
              <UnitFinancialTracking
                unitId={unit.id}
                unit={unit}
                financialData={financialData}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading maintenance history...</div>}>
              <UnitMaintenanceHistory
                unitId={unit.id}
                tickets={tickets}
              />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
