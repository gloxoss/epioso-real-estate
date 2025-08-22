import { requireAuth } from '@/lib/auth'
import { reportsRepo } from '@/repositories/reports'
import { billingRepo } from '@/repositories/billing'
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
  // In a real implementation, this would fetch comprehensive financial data
  // For now, we'll return mock data that represents what the system would provide
  
  const [kpis, collections, recentPayments] = await Promise.all([
    reportsRepo.kpis(organizationId),
    reportsRepo.collectionsOverTime(organizationId, { months: 12 }),
    billingRepo.listPayments(organizationId, {}, { perPage: 10 })
  ])

  // Mock enhanced financial data
  const mockFinancialData = {
    totalRevenue: kpis.collectionsThisMonth * 12,
    monthlyRevenue: kpis.collectionsThisMonth,
    outstandingAmount: kpis.overdueInvoicesCount * 2500,
    collectionRate: 94.5,
    avgPaymentTime: 18,
    revenueGrowth: 12.5,
    monthlyData: [
      { month: 'Jan 2024', revenue: 45000, expenses: 12000, profit: 33000, invoices: 18, collections: 16 },
      { month: 'Feb 2024', revenue: 47000, expenses: 13000, profit: 34000, invoices: 19, collections: 18 },
      { month: 'Mar 2024', revenue: 46500, expenses: 11500, profit: 35000, invoices: 18, collections: 17 },
      { month: 'Apr 2024', revenue: 48000, expenses: 14000, profit: 34000, invoices: 20, collections: 19 },
      { month: 'May 2024', revenue: 49500, expenses: 12500, profit: 37000, invoices: 19, collections: 18 },
      { month: 'Jun 2024', revenue: 51000, expenses: 13500, profit: 37500, invoices: 21, collections: 20 }
    ],
    paymentMethods: [
      { method: 'Bank Transfer', amount: 35000, percentage: 68 },
      { method: 'Credit Card', amount: 12000, percentage: 23 },
      { method: 'Cash', amount: 3500, percentage: 7 },
      { method: 'Mobile Payment', amount: 1000, percentage: 2 }
    ],
    topProperties: [
      { id: '1', name: 'Sunset Apartments', revenue: 15000, units: 6 },
      { id: '2', name: 'Downtown Plaza', revenue: 12500, units: 5 },
      { id: '3', name: 'Garden View Complex', revenue: 10000, units: 4 },
      { id: '4', name: 'Riverside Towers', revenue: 8500, units: 3 }
    ]
  }

  return mockFinancialData
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
