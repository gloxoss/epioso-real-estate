import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth'
import { reportsRepo } from '@/repositories/reports'
import { billingRepo } from '@/repositories/billing'
import { propertiesRepo } from '@/repositories/properties'
import { activityRepo } from '@/repositories/activity'
import { alertsRepo } from '@/repositories/alerts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import KpiCard from '@/components/dashboard/KpiCard'
import { KpiSkeleton, ListSkeleton, ChartSkeleton, TableSkeleton } from '@/components/dashboard/skeletons'
import CollectionsAreaChart from '@/components/dashboard/CollectionsAreaChart'
import OverdueList from '@/components/dashboard/OverdueList'
import PropertiesSnapshotTable from '@/components/dashboard/PropertiesSnapshotTable'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import QuickActionsMenu from '@/components/dashboard/QuickActionsMenu'
import AlertsCenter from '@/components/dashboard/AlertsCenter'
import GlobalSearch from '@/components/dashboard/GlobalSearch'
import AIInsights from '@/components/dashboard/AIInsights'
import { ActivityFeedWrapper } from '@/components/dashboard/ActivityFeedWrapper'
import { RealTimeDashboardWrapper } from '@/components/dashboard/RealTimeDashboardWrapper'
import Link from 'next/link'
import { TrendingUp, Home, Building2, AlertTriangle, Wrench, ArrowRight, Activity, DollarSign, Users } from 'lucide-react'


export default async function DashboardPage() {
  const session = await requireAuth()
  const orgId = (session.user as any).organizationId as string

  const [
    kpis,
    collections,
    occupancy,
    overdue,
    snapshots,
    activity,
    alerts,
  ] = await Promise.all([
    reportsRepo.kpis(orgId),
    reportsRepo.collectionsOverTime(orgId, { months: 12 }),
    reportsRepo.occupancyTrend(orgId, { weeks: 12 }),
    billingRepo.listOverdue(orgId, { limit: 5 }),
    propertiesRepo.snapshot(orgId, { limit: 6 }),
    activityRepo.getRecentActivity(orgId, 20),
    alertsRepo.getActiveAlerts(orgId),
  ])

  // Calculate dynamic outstanding total from collections data
  const outstandingTotal = collections.reduce((sum: number, m: any) => sum + (m.outstanding || 0), 0)

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-8">
        {/* Header with Global Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              A high-level overview of your portfolio.
            </p>
          </div>
          <div className="flex gap-2">
            <GlobalSearch />
            <Button asChild>
              <Link href="/properties/new">Add Property</Link>
            </Button>
            <QuickActionsMenu />
          </div>
        </div>

        {/* KPI Row with Error Boundaries */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <ErrorBoundary>
            <Suspense fallback={<KpiSkeleton />}>
              <KpiCard
                title="Total Properties"
                value={kpis.propertiesCount}
                subtitle="Managed properties"
                icon="Building2"
                href="/properties"
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<KpiSkeleton />}>
              <KpiCard
                title="Total Units"
                value={kpis.unitsCount}
                subtitle="Across all properties"
                icon="Home"
                href="/units"
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<KpiSkeleton />}>
              <KpiCard
                title="Occupancy Rate"
                value={`${kpis.occupancyPct.toFixed(1)}%`}
                subtitle={`${kpis.occupiedUnits} of ${kpis.unitsCount} occupied`}
                icon="TrendingUp"
                accent={kpis.occupancyPct >= 90 ? 'success' : kpis.occupancyPct >= 75 ? 'warning' : 'danger'}
                href="/units?status=vacant"
                sparkline={occupancy.map((d: any) => d.occupancyPct)}
              />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<KpiSkeleton />}>
              <KpiCard
                title="Pending Issues"
                value={kpis.openTicketsCount}
                subtitle="Maintenance requests"
                icon="AlertTriangle"
                accent={kpis.openTicketsCount > 0 ? 'warning' : 'info'}
                href="/maintenance?status=open"
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Charts and Tables */}
          <div className="lg:col-span-8 space-y-6">
            {/* Collections Chart */}
            <ErrorBoundary>
              <Card>
                <CardHeader>
                  <CardTitle>Collections</CardTitle>
                  <CardDescription>Last 12 months collection performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<ChartSkeleton />}>
                    <CollectionsAreaChart series={collections} />
                  </Suspense>
                  <div className="mt-6 grid grid-cols-3 divide-x text-sm text-center">
                    <div>
                      <p className="text-muted-foreground">Total Collected</p>
                      <p className="font-medium text-lg">{kpis.collectionsThisMonthFormatted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outstanding</p>
                      <p className="font-medium text-lg">MAD {outstandingTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overdue</p>
                      <p className="font-medium text-lg text-amber-600">{kpis.overdueInvoicesCount} invoices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>

            {/* Properties Snapshot */}
            <ErrorBoundary>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Properties</CardTitle>
                      <CardDescription>A quick look at your property performance.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild>
                      <Link href="/properties" className="flex items-center gap-1">
                        View all <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<TableSkeleton rows={3} />}>
                    <PropertiesSnapshotTable items={snapshots} />
                  </Suspense>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </div>

          {/* Right Column - Alerts and Activity */}
          <div className="lg:col-span-4 space-y-6">
            {/* Alerts Center */}
            <ErrorBoundary>
              <Suspense fallback={<ListSkeleton rows={3} />}>
                <AlertsCenter alerts={alerts} />
              </Suspense>
            </ErrorBoundary>

            {/* Overdue Invoices */}
            <ErrorBoundary>
              <Card>
                <CardHeader>
                  <CardTitle>Overdue Invoices</CardTitle>
                  <CardDescription>Top invoices requiring attention.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<ListSkeleton rows={4} />}>
                    <OverdueList items={overdue.map((o: any) => ({ ...o, dueDate: typeof o.dueDate === 'string' ? o.dueDate : (o.dueDate as Date).toISOString() }))} />
                  </Suspense>
                </CardContent>
              </Card>
            </ErrorBoundary>

            {/* Real-Time Activity Feed */}
            <ErrorBoundary>
              <ActivityFeedWrapper
                activities={[
                  {
                    id: '1',
                    type: 'payment',
                    action: 'Payment Received',
                    description: 'Rent payment of 2,500 MAD received from John Doe for Unit 3A',
                    user: { id: '1', name: 'System', avatar: '', role: 'System' },
                    timestamp: new Date('2024-01-15T10:30:00Z'),
                    metadata: { amount: 2500, tenantName: 'John Doe', unitNumber: '3A' },
                    priority: 'medium',
                    status: 'success'
                  },
                  {
                    id: '2',
                    type: 'maintenance',
                    action: 'Maintenance Request Created',
                    description: 'New plumbing issue reported in Sunset Apartments',
                    user: { id: '2', name: 'Sarah Johnson', avatar: '', role: 'Tenant' },
                    timestamp: new Date('2024-01-15T10:15:00Z'),
                    metadata: { propertyName: 'Sunset Apartments', unitNumber: '2B' },
                    priority: 'high',
                    status: 'warning'
                  },
                  {
                    id: '3',
                    type: 'tenant',
                    action: 'Lease Renewal Request',
                    description: 'Lease renewal submitted for Downtown Plaza Unit 1A',
                    user: { id: '3', name: 'Mike Wilson', avatar: '', role: 'Tenant' },
                    timestamp: new Date('2024-01-15T08:30:00Z'),
                    metadata: { propertyName: 'Downtown Plaza', unitNumber: '1A' },
                    priority: 'medium',
                    status: 'info'
                  },
                  {
                    id: '4',
                    type: 'document',
                    action: 'Document Uploaded',
                    description: 'Insurance certificate uploaded for Garden View Complex',
                    user: { id: '4', name: 'Admin User', avatar: '', role: 'Administrator' },
                    timestamp: new Date('2024-01-15T07:30:00Z'),
                    metadata: { propertyName: 'Garden View Complex', documentName: 'Insurance Certificate' },
                    priority: 'low',
                    status: 'success'
                  }
                ]}
                autoRefresh={true}
                refreshInterval={30000}
                maxItems={10}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Real-Time Metrics Dashboard */}
        <ErrorBoundary>
          <RealTimeDashboardWrapper
            metrics={[
              {
                id: 'total-revenue',
                label: 'Total Revenue',
                value: kpis.collectionsThisMonth * 12,
                previousValue: kpis.collectionsThisMonth * 11.5,
                change: 4.3,
                changeType: 'increase',
                format: 'currency',
                icon: DollarSign,
                color: 'text-green-600',
                status: 'good',
                lastUpdated: new Date('2024-01-15T10:30:00Z')
              },
              {
                id: 'occupancy-rate',
                label: 'Occupancy Rate',
                value: kpis.occupancyPct,
                previousValue: kpis.occupancyPct - 2.1,
                change: 2.1,
                changeType: 'increase',
                format: 'percentage',
                icon: Home,
                target: 95,
                status: kpis.occupancyPct > 90 ? 'good' : 'warning',
                lastUpdated: new Date('2024-01-15T10:30:00Z')
              },
              {
                id: 'active-tenants',
                label: 'Active Tenants',
                value: kpis.occupiedUnits,
                previousValue: kpis.occupiedUnits - 2,
                change: 3.2,
                changeType: 'increase',
                format: 'number',
                icon: Users,
                status: 'good',
                lastUpdated: new Date()
              },
              {
                id: 'maintenance-tickets',
                label: 'Open Tickets',
                value: kpis.openTicketsCount,
                previousValue: kpis.openTicketsCount + 3,
                change: -15.8,
                changeType: 'decrease',
                format: 'number',
                icon: AlertTriangle,
                status: kpis.openTicketsCount > 10 ? 'warning' : 'good',
                lastUpdated: new Date()
              }
            ]}
            autoRefresh={true}
            refreshInterval={30000}
            showConnectionStatus={true}
          />
        </ErrorBoundary>

        {/* AI Insights Section */}
        <ErrorBoundary>
          <AIInsights data={{
            occupancyPct: kpis.occupancyPct,
            collectionsThisMonth: kpis.collectionsThisMonth,
            overdueCount: kpis.overdueInvoicesCount,
            openTicketsCount: kpis.openTicketsCount,
            propertiesCount: kpis.propertiesCount,
            unitsCount: kpis.unitsCount,
            occupiedUnits: kpis.occupiedUnits
          }} />
        </ErrorBoundary>
      </div>
    </TooltipProvider>
  )
}
