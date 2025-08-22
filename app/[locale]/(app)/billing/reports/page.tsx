import { requireAuthWithRole } from '@/lib/rbac'
import { reportsRepo } from '@/repositories/reports'
import { billingRepo } from '@/repositories/billing'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatMoney, formatDate, formatPercent } from '@/lib/format'
import { Suspense } from 'react'

interface BillingReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ReportsContent({ organizationId }: { organizationId: string }) {
  // Fetch all report data
  const [
    kpis,
    collectionsData,
    occupancyData,
    arAgingData,
    invoiceStats,
    paymentStats
  ] = await Promise.all([
    reportsRepo.kpis(organizationId),
    reportsRepo.collectionsOverTime(organizationId),
    reportsRepo.getOccupancyReport(organizationId),
    reportsRepo.getARAgingReport(organizationId),
    billingRepo.getInvoiceStats(organizationId),
    billingRepo.getPaymentStats(organizationId)
  ])

  const totalOutstanding = arAgingData.reduce((sum, item) => sum + item.total, 0)
  const totalOverdue = arAgingData.reduce((sum, item) => sum + (item.days30 + item.days60 + item.days90 + item.over90), 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.collectionsThisMonthFormatted}</div>
            <p className="text-xs text-muted-foreground">
              This month's payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalOutstanding, 'MAD')}</div>
            <p className="text-xs text-muted-foreground">
              Total unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.overdueInvoicesCount}</div>
            <p className="text-xs text-muted-foreground">
              {formatMoney(totalOverdue, 'MAD')} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(kpis.occupancyPct)}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.occupiedUnits} of {kpis.unitsCount} units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="collections" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="aging">AR Aging</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collections Trend</CardTitle>
                <CardDescription>
                  Monthly collections vs outstanding amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collectionsData.slice(-6).map((item, index) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <div className="text-sm font-medium">{item.month}</div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-green-600">
                          +{formatMoney(item.collected, 'MAD')}
                        </div>
                        <div className="text-sm text-orange-600">
                          {formatMoney(item.outstanding, 'MAD')} outstanding
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Breakdown by payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentStats.byMethod.map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">
                          {method.method.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm">
                        {formatMoney(method.total, 'MAD')} ({method.count})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
              <CardDescription>
                Outstanding invoices by age categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Customer</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">1-30 Days</th>
                      <th className="text-right py-2">31-60 Days</th>
                      <th className="text-right py-2">61-90 Days</th>
                      <th className="text-right py-2">90+ Days</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arAgingData.map((item) => (
                      <tr key={item.contactId} className="border-b">
                        <td className="py-2 font-medium">{item.contactName}</td>
                        <td className="text-right py-2">{formatMoney(item.current, 'MAD')}</td>
                        <td className="text-right py-2">{formatMoney(item.days30, 'MAD')}</td>
                        <td className="text-right py-2">{formatMoney(item.days60, 'MAD')}</td>
                        <td className="text-right py-2">{formatMoney(item.days90, 'MAD')}</td>
                        <td className="text-right py-2 text-red-600">{formatMoney(item.over90, 'MAD')}</td>
                        <td className="text-right py-2 font-semibold">{formatMoney(item.total, 'MAD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Occupancy Report</CardTitle>
              <CardDescription>
                Occupancy rates by property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {occupancyData.map((property) => (
                  <div key={property.propertyId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{property.propertyName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {property.occupiedUnits} of {property.totalUnits} units occupied
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatPercent(property.occupancyRate)}
                      </div>
                      <Badge variant={property.occupancyRate >= 90 ? "default" : property.occupancyRate >= 70 ? "secondary" : "destructive"}>
                        {property.occupancyRate >= 90 ? "Excellent" : property.occupancyRate >= 70 ? "Good" : "Needs Attention"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>
                  Overview of invoice statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Invoices</span>
                    <span className="font-semibold">{invoiceStats.totalInvoices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Amount</span>
                    <span className="font-semibold">{formatMoney(Number(invoiceStats.totalAmount._sum.total || 0), 'MAD')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid Amount</span>
                    <span className="font-semibold text-green-600">{formatMoney(Number(invoiceStats.paidAmount._sum.amount || 0), 'MAD')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overdue Invoices</span>
                    <span className="font-semibold text-red-600">{invoiceStats.overdueInvoices}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Latest invoice activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoiceStats.recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{invoice.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.contact?.name || 'No customer'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatMoney(Number(invoice.total), 'MAD')}</div>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'overdue' ? 'destructive' : 
                          'secondary'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function BillingReportsPage({ searchParams }: BillingReportsPageProps) {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Reports"
        description="Comprehensive financial and billing analytics"
        action={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        }
      />

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent organizationId={session.organizationId} />
      </Suspense>
    </div>
  )
}
