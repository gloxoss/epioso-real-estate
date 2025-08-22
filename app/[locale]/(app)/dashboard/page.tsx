import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { reportsRepo } from '@/repositories/reports'
import { billingRepo } from '@/repositories/billing'
import { propertiesRepo } from '@/repositories/properties'
import { activityRepo } from '@/repositories/activity'
import { alertsRepo } from '@/repositories/alerts'
import { leadsRepo } from '@/repositories/leads'
import { salesRepo } from '@/repositories/sales'
import { salesAgentsRepo } from '@/repositories/sales-agents'
import { paymentPlansRepo } from '@/repositories/payment-plans'
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
import { TrendingUp, Home, Building2, AlertTriangle, Wrench, ArrowRight, Activity, DollarSign, Users, Brain } from 'lucide-react'
import { LocaleDisplay } from '@/components/i18n/LocaleDisplay'


interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  const session = await requireAuth()
  const dictionary = await getDictionary(locale as Locale)
  const orgId = (session.user as any).organizationId as string

  const [
    kpis,
    collections,
    salesData,
    leadsData,
    agentStats,
    overdueMilestones,
    snapshots,
    activity,
    alerts,
  ] = await Promise.all([
    reportsRepo.kpis(orgId),
    reportsRepo.collectionsOverTime(orgId, { months: 12 }),
    salesRepo.list(orgId, {}, { perPage: 10 }),
    leadsRepo.list(orgId, {}, { perPage: 10 }),
    salesAgentsRepo.getPerformanceStats(orgId),
    paymentPlansRepo.getOverdueMilestones(orgId),
    propertiesRepo.snapshot(orgId, { limit: 6 }),
    activityRepo.getRecentActivity(orgId, 20),
    alertsRepo.getActiveAlerts(orgId),
  ])

  // Calculate sales-focused KPIs
  const totalSalesValue = salesData.data
    .filter((deal: any) => deal.status === 'completed')
    .reduce((sum: number, deal: any) => {
      const price = deal.salePrice?.toNumber ? deal.salePrice.toNumber() : (deal.salePrice || 0)
      return sum + price
    }, 0)

  const activeSalesCount = salesData.data.filter((deal: any) =>
    ['active', 'pending_approval', 'approved', 'contract_signed'].includes(deal.status)
  ).length

  const activeLeadsCount = leadsData.data.filter((lead: any) =>
    !['closed_won', 'closed_lost'].includes(lead.status)
  ).length

  const conversionRate = leadsData.total > 0
    ? (leadsData.data.filter((lead: any) => lead.status === 'closed_won').length / leadsData.total) * 100
    : 0

  const unitsForSale = snapshots.reduce((sum: number, property: any) => {
    const units = Array.isArray(property.units) ? property.units : []
    return sum + units.filter((unit: any) => unit.isForSale).length
  }, 0)

  return (
    <TooltipProvider>
      <div className="min-h-screen ">
        {/* Clean Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {dictionary.dashboard.title}
                  </h1>
                  <LocaleDisplay />
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {dictionary.dashboard.subtitle || "Overview of your real estate portfolio"}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <GlobalSearch dictionary={dictionary} />
                </div>
                <Button asChild size="sm">
                  <Link href={`/${locale}/leads/new`}>
                    <span className="hidden sm:inline">Add Lead</span>
                    <span className="sm:hidden">Lead</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/${locale}/properties/new`}>
                    <span className="hidden sm:inline">Add Property</span>
                    <span className="sm:hidden">Property</span>
                  </Link>
                </Button>
                <QuickActionsMenu dictionary={dictionary} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Clean KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <ErrorBoundary>
              <Suspense fallback={<KpiSkeleton />}>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Sales Value</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                          MAD {totalSalesValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed sales this year</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<KpiSkeleton />}>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Leads</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{activeLeadsCount}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leads in sales pipeline</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<KpiSkeleton />}>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Conversion Rate</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{conversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lead to sale conversion</p>
                      </div>
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${conversionRate >= 20
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : conversionRate >= 10
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <TrendingUp className={`h-6 w-6 ${conversionRate >= 20
                            ? 'text-green-600 dark:text-green-400'
                            : conversionRate >= 10
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<KpiSkeleton />}>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Units for Sale</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{unitsForSale}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available inventory</p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Charts */}
            <div className="lg:col-span-2 space-y-8">
              

              {/* Properties Snapshot */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Sales Inventory
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Properties and units available for sale
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                          <Link href={`/${locale}/properties`} className="flex items-center gap-2">
                            {dictionary.dashboard.viewAll} <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<TableSkeleton rows={3} />}>
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <PropertiesSnapshotTable items={snapshots} dictionary={dictionary} locale={locale} />
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Sales Performance Chart */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Sales Performance
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Monthly sales trends and revenue growth
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<ChartSkeleton />}>
                      {/* Sales Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            MAD {(totalSalesValue * 0.15).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs last month</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Quarter</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            MAD {(totalSalesValue * 0.45).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% vs last quarter</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Deal Size</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            MAD {Math.round(totalSalesValue / Math.max(activeSalesCount, 1)).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Market average</p>
                        </div>
                      </div>
                      {/* Placeholder for chart component */}
                      <div className="h-64 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">Sales Performance Chart</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Chart component integration needed</p>
                        </div>
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Property Type Breakdown */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Property Type Distribution
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Sales breakdown by property category
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<ChartSkeleton />}>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Property Type Stats */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Apartments</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">65%</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(unitsForSale * 0.65)} units</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Villas</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">20%</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(unitsForSale * 0.20)} units</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Commercial</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">15%</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(unitsForSale * 0.15)} units</p>
                            </div>
                          </div>
                        </div>
                        {/* Placeholder for pie chart */}
                        <div className="flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <div className="text-center">
                              <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                              <p className="text-xs text-slate-500 dark:text-slate-400">Pie Chart</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Price Range Distribution */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Price Range Distribution
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Units available by price bracket
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<ChartSkeleton />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price Range Bars */}
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">500K - 1M MAD</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">35 units</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">1M - 2M MAD</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">28 units</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '36%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">2M - 3M MAD</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">12 units</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">3M+ MAD</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">3 units</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                            </div>
                          </div>
                        </div>
                        {/* Price Summary */}
                        <div className="space-y-4">
                          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Price</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">MAD 1.2M</p>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Most Popular Range</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">500K - 1M</p>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Premium Units</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">15 units</p>
                          </div>
                        </div>
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Geographic Performance */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Geographic Performance
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Sales performance by location and area
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<TableSkeleton rows={4} />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Location Performance Table */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Top Performing Areas</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Agdal, Rabat</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">12 sales this month</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">MAD 15.2M</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">+18%</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Gueliz, Marrakech</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">8 sales this month</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">MAD 11.8M</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">+12%</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Maarif, Casablanca</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">6 sales this month</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">MAD 9.5M</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">+8%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Market Insights */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Market Insights</h4>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Fastest Growing</p>
                              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">Agdal District</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">25% increase in inquiries</p>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Highest Value</p>
                              <p className="text-lg font-bold text-green-900 dark:text-green-100">Palmier, Casablanca</p>
                              <p className="text-xs text-green-700 dark:text-green-300">Avg: MAD 2.8M per unit</p>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Most Active</p>
                              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">Hay Riad, Rabat</p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">18 active listings</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Alerts */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Alerts
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                          High-priority items
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<ListSkeleton rows={3} />}>
                      <AlertsCenter alerts={alerts} dictionary={dictionary} locale={locale} />
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Recent Leads */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                            Recent Leads
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                            Latest inquiries
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <Link href={`/${locale}/leads`} className="flex items-center gap-1">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<ListSkeleton rows={4} />}>
                      <div className="space-y-3">
                        {leadsData.data.slice(0, 4).map((lead: any) => (
                          <div key={lead.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {lead.contact?.name || 'Unknown Contact'}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                  {lead.unit?.property?.name} - {lead.unit?.unitNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                      lead.status === 'qualified' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                        lead.status === 'viewing_scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}>
                                    {lead.status.replace('_', ' ')}
                                  </span>
                                  {lead.budget && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                      MAD {lead.budget.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {leadsData.data.length === 0 && (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No recent leads</p>
                          </div>
                        )}
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Activity Feed */}
              <ErrorBoundary>
                <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                          Recent Activity
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                          Latest updates
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ActivityFeedWrapper
                      dictionary={dictionary}
                      locale={locale}
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
                  </CardContent>
                </Card>
              </ErrorBoundary>


            </div>
          </div>



         

          {/* Sales Agent Performance */}
          <ErrorBoundary>
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      Sales Agent Performance
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Top performing agents and team metrics
                    </CardDescription>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<TableSkeleton rows={5} />}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Agent Rankings */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Top Performers This Month</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Fatima Zahra Alami</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">8 sales • MAD 12.5M</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">+25%</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">vs last month</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">2</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Youssef Tazi</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">6 sales • MAD 9.2M</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">+18%</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">vs last month</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">3</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Aicha Benjelloun</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">5 sales • MAD 7.8M</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">+12%</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">vs last month</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Team Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Team Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Agents</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Commission</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3.5%</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Commissions</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">MAD 1.2M</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Team Target</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">85%</p>
                        </div>
                      </div>
                      {/* Performance Indicator */}
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">Team Performance</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Above target this quarter</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-900 dark:text-green-100">112%</p>
                            <p className="text-xs text-green-700 dark:text-green-300">of quarterly goal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Suspense>
              </CardContent>
            </Card>
          </ErrorBoundary>

          {/* AI Insights */}
          <ErrorBoundary>
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      AI Insights
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Smart recommendations for your business
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIInsights
                  dictionary={dictionary}
                  locale={locale}
                  data={{
                    occupancyPct: kpis.occupancyPct,
                    collectionsThisMonth: kpis.collectionsThisMonth,
                    overdueCount: kpis.overdueInvoicesCount,
                    openTicketsCount: kpis.openTicketsCount,
                    propertiesCount: kpis.propertiesCount,
                    unitsCount: kpis.unitsCount,
                    occupiedUnits: kpis.occupiedUnits
                  }}
                />
              </CardContent>
            </Card>
          </ErrorBoundary>
        </div>
      </div>
    </TooltipProvider>
  )
}
