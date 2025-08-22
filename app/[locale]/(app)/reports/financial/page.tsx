import { requireAuth } from '@/lib/auth'
import { reportsRepo } from '@/repositories/reports'
import { billingRepo } from '@/repositories/billing'
import { financialRepo } from '@/repositories/financial'
import { propertiesRepo } from '@/repositories/properties'
import { ticketsRepo } from '@/repositories/tickets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialAnalyticsDashboard } from '@/components/billing/FinancialAnalyticsDashboard'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { Suspense } from 'react'

interface FinancialReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getFinancialData(organizationId: string, filters: any) {
  const [
    organizationSummary,
    collections,
    recentPayments,
    properties,
    maintenanceStats
  ] = await Promise.all([
    financialRepo.getOrganizationFinancialSummary(organizationId, 12),
    reportsRepo.collectionsOverTime(organizationId, { months: 12 }),
    billingRepo.listPayments(organizationId, {}, { perPage: 10 }),
    propertiesRepo.list(organizationId, {}, { perPage: 100 }),
    ticketsRepo.getStats(organizationId)
  ])

  // Calculate payment methods distribution
  const paymentMethodStats = recentPayments.data.reduce((acc: any, payment: any) => {
    const method = payment.method || 'Unknown'
    if (!acc[method]) {
      acc[method] = { method, amount: 0, count: 0 }
    }
    acc[method].amount += Number(payment.amount)
    acc[method].count += 1
    return acc
  }, {})

  const totalPaymentAmount = Object.values(paymentMethodStats).reduce((sum: number, stat: any) => sum + stat.amount, 0)
  const paymentMethods = Object.values(paymentMethodStats).map((stat: any) => ({
    method: stat.method,
    amount: stat.amount,
    percentage: totalPaymentAmount > 0 ? Math.round((stat.amount / totalPaymentAmount) * 100) : 0
  }))

  // Get top properties by revenue
  const propertiesWithRevenue = await Promise.all(
    properties.data.slice(0, 10).map(async (property: any) => {
      const propertyFinancials = await financialRepo.getPropertyFinancialData(property.id, organizationId, 3)
      return {
        id: property.id,
        name: property.name,
        revenue: propertyFinancials.totalRevenue,
        units: property._count?.units || 0
      }
    })
  )

  const topProperties = propertiesWithRevenue
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Calculate average payment time from recent payments
  const avgPaymentTime = recentPayments.data.length > 0
    ? recentPayments.data.reduce((sum: number, payment: any) => {
        const daysDiff = Math.floor((payment.paidAt.getTime() - payment.invoice.issueDate.getTime()) / (1000 * 60 * 60 * 24))
        return sum + Math.max(0, daysDiff)
      }, 0) / recentPayments.data.length
    : 0

  // Transform collections data for monthly breakdown
  const monthlyData = collections.map((month: any) => ({
    month: month.period,
    revenue: month.totalCollected,
    expenses: maintenanceStats.totalCost / 12, // Distribute maintenance costs across months
    profit: month.totalCollected - (maintenanceStats.totalCost / 12),
    invoices: Math.floor(month.totalInvoiced / 2500), // Estimate invoice count
    collections: Math.floor(month.totalCollected / 2500) // Estimate collection count
  }))

  return {
    totalRevenue: organizationSummary.totalRevenue,
    monthlyRevenue: organizationSummary.totalRevenue / 12,
    outstandingAmount: collections.reduce((sum: number, month: any) => sum + month.outstandingAmount, 0),
    collectionRate: organizationSummary.collectionRate,
    avgPaymentTime: Math.round(avgPaymentTime),
    revenueGrowth: organizationSummary.monthlyGrowth,
    monthlyData: monthlyData.slice(-6), // Last 6 months
    paymentMethods,
    topProperties
  }
}

async function FinancialReportsContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const financialData = await getFinancialData(organizationId, filters)

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and insights for your portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData.totalRevenue, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              +{financialData.revenueGrowth}% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData.monthlyRevenue, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {financialData.collectionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(financialData.outstandingAmount, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Dashboard */}
      <ErrorBoundary>
        <FinancialAnalyticsDashboard data={financialData} />
      </ErrorBoundary>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Generate P&L Statement</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Cash Flow Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <PieChart className="h-6 w-6" />
              <span>Revenue Breakdown</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Monthly Financial Summary</p>
                  <p className="text-sm text-muted-foreground">Sent on 1st of each month</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Quarterly Tax Report</p>
                  <p className="text-sm text-muted-foreground">Sent quarterly</p>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Annual Revenue Report</p>
                  <p className="text-sm text-muted-foreground">Sent yearly</p>
                </div>
                <Badge variant="outline">Inactive</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Scheduled Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/billing/invoices">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Invoices
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/billing/payments">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment History
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/properties">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Property Performance
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  All Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default async function FinancialReportsPage({ searchParams }: FinancialReportsPageProps) {
  const session = await requireAuth()
  const orgId = (session.user as any).organizationId as string
  const params = await searchParams
  
  // Parse filters from search params
  const filters = {
    dateFrom: params.dateFrom ? new Date(params.dateFrom as string) : undefined,
    dateTo: params.dateTo ? new Date(params.dateTo as string) : undefined,
    propertyId: params.propertyId as string | undefined,
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6">
      <Suspense fallback={<div>Loading financial reports...</div>}>
        <FinancialReportsContent organizationId={orgId} filters={filters} />
      </Suspense>
    </div>
  )
}
