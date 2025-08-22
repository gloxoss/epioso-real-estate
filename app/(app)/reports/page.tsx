import { requireAuthWithRole } from '@/lib/rbac'
import { reportsRepo } from '@/repositories/reports'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollectionsChart } from '@/components/reports/CollectionsChart'
import { OccupancyChart } from '@/components/reports/OccupancyChart'
import { ARAgingTable } from '@/components/reports/ARAgingTable'
import { ExportButtons } from '@/components/reports/ExportButtons'
import { ReportFilters } from '@/components/reports/ReportFilters'
import { AdvancedReportingDashboard } from '@/components/reports/AdvancedReportingDashboard'
import { InteractiveAnalyticsDashboardWrapper } from '@/components/reports/InteractiveAnalyticsDashboardWrapper'
import KpiCard from '@/components/dashboard/KpiCard'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  Users,
} from 'lucide-react'
import { subMonths } from 'date-fns'

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getReportsData(organizationId: string, filters: any) {
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : subMonths(new Date(), 6)
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date()

  const [
    dashboardMetrics,
    collectionsData,
    occupancyData,
    arAgingData,
  ] = await Promise.all([
    reportsRepo.getDashboardMetrics(organizationId),
    reportsRepo.getCollectionsReport(organizationId, dateFrom, dateTo, 'month'),
    reportsRepo.getOccupancyReport(organizationId),
    reportsRepo.getARAgingReport(organizationId),
  ])

  // Enhanced analytics data for new components
  const enhancedAnalytics = {
    kpis: {
      totalRevenue: dashboardMetrics.totalRevenue || 125000,
      revenueGrowth: 12.5,
      occupancyRate: dashboardMetrics.occupancyRate || 94.2,
      occupancyTrend: 2.1,
      avgRentPrice: 2850,
      rentGrowth: 8.3,
      maintenanceCosts: 15000,
      maintenanceTrend: -5.2,
      collectionRate: 96.8,
      collectionTrend: 1.4,
      profitMargin: 68.5,
      profitTrend: 3.2
    },
    revenueData: [
      { period: 'Jan 2024', revenue: 45000, expenses: 12000, profit: 33000, occupancy: 92 },
      { period: 'Feb 2024', revenue: 47000, expenses: 13000, profit: 34000, occupancy: 94 },
      { period: 'Mar 2024', revenue: 46500, expenses: 11500, profit: 35000, occupancy: 93 },
      { period: 'Apr 2024', revenue: 48000, expenses: 14000, profit: 34000, occupancy: 95 },
      { period: 'May 2024', revenue: 49500, expenses: 12500, profit: 37000, occupancy: 96 },
      { period: 'Jun 2024', revenue: 51000, expenses: 13500, profit: 37500, occupancy: 94 }
    ],
    propertyPerformance: [
      { id: '1', name: 'Sunset Apartments', revenue: 15000, occupancy: 98, units: 6, avgRent: 2500, performance: 'excellent' as const },
      { id: '2', name: 'Downtown Plaza', revenue: 12500, occupancy: 92, units: 5, avgRent: 2500, performance: 'good' as const },
      { id: '3', name: 'Garden View Complex', revenue: 10000, occupancy: 89, units: 4, avgRent: 2500, performance: 'average' as const }
    ],
    tenantAnalytics: {
      totalTenants: 45,
      newTenants: 3,
      renewals: 38,
      turnoverRate: 15.6,
      avgTenancy: 18.5,
      satisfactionScore: 4.2
    },
    maintenanceMetrics: {
      totalTickets: 24,
      avgResolutionTime: 3.2,
      costPerUnit: 125,
      preventiveRatio: 65,
      satisfactionScore: 4.1
    },
    marketComparison: {
      avgMarketRent: 2650,
      yourAvgRent: 2850,
      marketOccupancy: 91.5,
      yourOccupancy: 94.2,
      competitiveIndex: 7.8
    }
  }

  const reportingMetrics = {
    totalReports: 24,
    scheduledReports: 8,
    customReports: 3,
    reportsGenerated: 12,
    avgGenerationTime: 2.3,
    storageUsed: 156 * 1024 * 1024, // 156MB
    popularReports: [
      { name: 'Monthly Financial Summary', type: 'financial', usage: 45, lastGenerated: new Date('2024-01-15T09:00:00Z') },
      { name: 'Occupancy Report', type: 'operational', usage: 32, lastGenerated: new Date('2024-01-15T08:30:00Z') },
      { name: 'Maintenance Analysis', type: 'maintenance', usage: 28, lastGenerated: new Date('2024-01-15T08:00:00Z') }
    ],
    recentActivity: [
      { id: '1', action: 'Generated', reportName: 'Financial Summary', user: 'John Doe', timestamp: new Date('2024-01-15T09:15:00Z') },
      { id: '2', action: 'Scheduled', reportName: 'Monthly Report', user: 'Jane Smith', timestamp: new Date('2024-01-15T09:00:00Z') }
    ]
  }

  const availableReports = [
    { id: '1', name: 'Financial Summary', category: 'financial', description: 'Comprehensive financial overview', lastRun: new Date('2024-01-15T09:00:00Z'), isScheduled: true, isCustom: false },
    { id: '2', name: 'Occupancy Analysis', category: 'occupancy', description: 'Detailed occupancy metrics', isScheduled: false, isCustom: false },
    { id: '3', name: 'Maintenance Report', category: 'maintenance', description: 'Maintenance costs and trends', isScheduled: true, isCustom: false },
    { id: '4', name: 'Custom Revenue Analysis', category: 'custom', description: 'Custom revenue breakdown', isScheduled: false, isCustom: true }
  ]

  return {
    metrics: dashboardMetrics,
    collections: collectionsData,
    occupancy: occupancyData,
    arAging: arAgingData,
    enhancedAnalytics,
    reportingMetrics,
    availableReports
  }
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  const filters = {
    dateFrom: params.dateFrom as string,
    dateTo: params.dateTo as string,
    format: params.format as string || 'json',
  }

  const data = await getReportsData(session.organizationId, filters)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into your property portfolio performance"
        action={<ExportButtons />}
      />

      <ReportFilters />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly Collections"
          value={`$${data.metrics.currentMonthCollections.toLocaleString()}`}
          description="Current month revenue"
          icon="DollarSign"
          trend={data.metrics.collectionsGrowth > 0 ? 'up' : data.metrics.collectionsGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${data.metrics.collectionsGrowth > 0 ? '+' : ''}${data.metrics.collectionsGrowth}%`}
        />

        <KpiCard
          title="Outstanding Amount"
          value={`$${data.metrics.totalOutstanding.toLocaleString()}`}
          description="Total unpaid invoices"
          icon="AlertTriangle"
          trend={data.metrics.overdueAmount > 0 ? 'down' : 'up'}
        />

        <KpiCard
          title="Overall Occupancy"
          value={`${data.metrics.overallOccupancy}%`}
          description={`${data.metrics.occupiedUnits} of ${data.metrics.totalUnits} units`}
          icon="Building2"
          trend={data.metrics.overallOccupancy >= 90 ? 'up' : data.metrics.overallOccupancy >= 70 ? 'neutral' : 'down'}
        />

        <KpiCard
          title="Total Properties"
          value={data.metrics.totalProperties}
          description="Properties under management"
          icon="Users"
        />
      </div>

      {/* Enhanced Reports Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="aging">AR Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <InteractiveAnalyticsDashboardWrapper
            data={data.enhancedAnalytics}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AdvancedReportingDashboard
            metrics={data.reportingMetrics}
            availableReports={data.availableReports}
          />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collections Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <CollectionsChart data={data.collections} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy by Property</CardTitle>
              </CardHeader>
              <CardContent>
                <OccupancyChart data={data.occupancy} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.occupancy.map((property) => (
                    <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{property.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.occupiedUnits}/{property.totalUnits} units occupied
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{property.occupancyRate}%</p>
                        <p className="text-xs text-muted-foreground">occupancy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <ARAgingTable data={data.arAging} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
