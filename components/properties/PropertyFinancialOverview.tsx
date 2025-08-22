import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  CreditCard,
  FileText,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'

interface FinancialData {
  totalRevenue: number
  monthlyRevenue: number
  outstandingAmount: number
  collectionRate: number
  recentInvoices: any[]
  revenueHistory: any[]
}

interface PropertyFinancialOverviewProps {
  propertyId: string
  data: FinancialData
  dictionary?: any
  locale?: string
}

export function PropertyFinancialOverview({ propertyId, data, dictionary, locale = 'en' }: PropertyFinancialOverviewProps) {
  // Add safety checks for data object
  const safeData = data || {}
  const {
    totalRevenue = 0,
    monthlyRevenue = 0,
    outstandingAmount = 0,
    collectionRate = 0,
    recentInvoices = [],
    revenueHistory = []
  } = safeData

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary?.properties?.financial?.totalRevenue || "Total Revenue"}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'MAD')}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.properties?.financial?.allTimeRevenue || "All-time property revenue"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary?.properties?.financial?.monthlyRevenue || "Monthly Revenue"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue, 'MAD')}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.properties?.financial?.currentMonthEarnings || "Current month earnings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary?.properties?.financial?.outstanding || "Outstanding"}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(outstandingAmount, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.properties?.financial?.pendingCollections || "Pending collections"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary?.properties?.financial?.collectionRate || "Collection Rate"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {collectionRate.toFixed(1)}%
            </div>
            <Progress value={collectionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {dictionary?.properties?.financial?.paymentSuccessRate || "Payment success rate"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary?.properties?.financial?.revenueTrend || "Revenue Trend"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{dictionary?.properties?.financial?.revenueChartPlaceholder || "Revenue chart will be displayed here"}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {dictionary?.properties?.financial?.chartIntegrationNeeded || "Integration with charting library needed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Financial Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{dictionary?.properties?.financial?.recentInvoices || "Recent Invoices"}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/billing/invoices?property=${propertyId}`} className="flex items-center gap-1">
                  {dictionary?.properties?.financial?.viewAll || "View all"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{dictionary?.properties?.financial?.noRecentInvoices || "No recent invoices"}</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href={`/${locale}/billing/invoices/new?property=${propertyId}`}>
                    {dictionary?.properties?.financial?.createInvoice || "Create Invoice"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.slice(0, 5).map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{dictionary?.properties?.financial?.invoiceNumber || "Invoice #"}{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.tenant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount, 'MAD')}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                        {dictionary?.properties?.financial?.[invoice.status] || invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{dictionary?.properties?.financial?.paymentSettings || "Payment Settings"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{dictionary?.properties?.financial?.onlinePayments || "Online Payments"}</p>
                  <p className="text-sm text-muted-foreground">{dictionary?.properties?.financial?.acceptCardPayments || "Accept card payments"}</p>
                </div>
              </div>
              <Badge variant="secondary">{dictionary?.properties?.financial?.enabled || "Enabled"}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{dictionary?.properties?.financial?.autoBilling || "Auto-billing"}</p>
                  <p className="text-sm text-muted-foreground">{dictionary?.properties?.financial?.monthlyRentInvoices || "Monthly rent invoices"}</p>
                </div>
              </div>
              <Badge variant="outline">{dictionary?.properties?.financial?.setupRequired || "Setup Required"}</Badge>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${locale}/properties/${propertyId}/billing-settings`}>
                  {dictionary?.properties?.financial?.configureBillingSettings || "Configure Billing Settings"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary?.properties?.financial?.quickActions || "Quick Actions"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild>
              <Link href={`/${locale}/billing/invoices/new?property=${propertyId}`}>
                <FileText className="h-4 w-4 mr-2" />
                {dictionary?.properties?.financial?.createInvoice || "Create Invoice"}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/billing/payments?property=${propertyId}`}>
                <DollarSign className="h-4 w-4 mr-2" />
                {dictionary?.properties?.financial?.recordPayment || "Record Payment"}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/reports/financial?property=${propertyId}`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                {dictionary?.properties?.financial?.financialReport || "Financial Report"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
