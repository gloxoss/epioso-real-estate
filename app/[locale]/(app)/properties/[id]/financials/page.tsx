import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { unitsRepo } from '@/repositories/units'
import { billingRepo } from '@/repositories/billing'
import { financialRepo } from '@/repositories/financial'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Plus,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/format'
import { getDictionary } from '@/lib/i18n/dictionaries'

interface PropertyFinancialsPageProps {
  params: Promise<{ id: string; locale: string }>
}

async function getPropertyFinancialsData(propertyId: string, organizationId: string) {
  const [property, financialData] = await Promise.all([
    propertiesRepo.findById(propertyId, organizationId),
    financialRepo.getPropertyFinancialData(propertyId, organizationId)
  ])

  if (!property) {
    return null
  }

  // Get additional data for the financial overview
  const [units, outstandingInvoices] = await Promise.all([
    unitsRepo.getByProperty(organizationId, propertyId),
    billingRepo.listOverdue(organizationId, { propertyId, limit: 10 })
  ])

  // Add safety checks for all data
  const safeUnits = units || []
  const safeFinancialData = financialData || {}
  const safeOutstandingInvoices = outstandingInvoices?.data || []

  const occupiedUnits = safeUnits.filter(unit => unit.status === 'occupied')
  const totalUnits = safeUnits.length
  const occupancyRate = totalUnits > 0 ? (occupiedUnits.length / totalUnits) * 100 : 0

  // Enhance financial data with additional calculated fields
  const enhancedFinancialData = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    outstandingAmount: 0,
    collectionRate: 0,
    recentInvoices: [],
    revenueHistory: [],
    expenses: [],
    ...safeFinancialData,
    occupancyRate,
    averageRent: occupiedUnits.length > 0 && safeFinancialData.monthlyRevenue ? safeFinancialData.monthlyRevenue / occupiedUnits.length : 0,
    revenueGrowth: (safeFinancialData.revenueHistory || []).length >= 2
      ? ((safeFinancialData.revenueHistory[safeFinancialData.revenueHistory.length - 1].revenue -
          safeFinancialData.revenueHistory[safeFinancialData.revenueHistory.length - 2].revenue) /
          safeFinancialData.revenueHistory[safeFinancialData.revenueHistory.length - 2].revenue) * 100
      : 0,

    monthlyBreakdown: (safeFinancialData.revenueHistory || []).slice(-6).reverse(),

    recentTransactions: (safeFinancialData.recentInvoices || []).map(invoice => ({
      id: invoice.id,
      type: 'income' as const,
      description: `${invoice.unit?.unitNumber || 'Property'} - ${invoice.status === 'paid' ? 'Payment' : 'Invoice'}`,
      amount: invoice.amount,
      date: invoice.dueDate,
      status: invoice.status
    })),

    outstandingInvoices: safeOutstandingInvoices.map(invoice => ({
      id: invoice.id,
      unitNumber: invoice.unit?.unitNumber || 'N/A',
      tenantName: invoice.contact?.name || 'Unknown',
      amount: Number(invoice.total),
      dueDate: invoice.dueDate,
      daysOverdue: Math.max(0, Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))),
      status: invoice.status
    })),

    expenses: (safeFinancialData.expenses || []).map(expense => ({
      category: expense.category,
      amount: expense.amount,
      percentage: safeFinancialData.totalRevenue > 0 ? (expense.amount / safeFinancialData.totalRevenue) * 100 : 0
    }))
  }

  return {
    property,
    financialData: enhancedFinancialData
  }
}

export default async function PropertyFinancialsPage({ params }: PropertyFinancialsPageProps) {
  const session = await requireAuthWithRole()
  const { id, locale } = await params
  const dictionary = await getDictionary(locale)
  
  const data = await getPropertyFinancialsData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, financialData } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dictionary.properties?.financials || "Financials"} - ${property.name}`}
        description={dictionary.properties?.financialOverviewAndMetrics || "Financial overview and performance metrics"}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {dictionary.properties?.backToProperty || "Back to Property"}
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {dictionary.properties?.exportReport || "Export Report"}
            </Button>
            <Button asChild>
              <Link href={`/${locale}/billing/invoices/new`}>
                <Plus className="h-4 w-4 mr-2" />
                {dictionary.properties?.createInvoice || "Create Invoice"}
              </Link>
            </Button>
          </div>
        }
      />

      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>{dictionary.properties?.propertyOverview || "Property Overview"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{dictionary.properties?.propertyType || "Property Type"}</p>
              <p className="font-medium capitalize">{property.propertyType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{dictionary.properties?.occupancyRate || "Occupancy Rate"}</p>
              <p className="font-medium">{financialData.occupancyRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.monthlyRevenue || "Monthly Revenue"}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.monthlyRevenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{financialData.revenueGrowth}% {dictionary.properties?.fromLastMonth || "from last month"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.netIncome || "Net Income"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialData.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dictionary.properties?.afterExpenses || "After expenses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.outstanding || "Outstanding"}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.outstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData.outstandingInvoices.length} {dictionary.properties?.overdueInvoices || "overdue invoices"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.properties?.totalCollected || "Total Collected"}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dictionary.properties?.thisYear || "This year"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{dictionary.properties?.overview || "Overview"}</TabsTrigger>
          <TabsTrigger value="income">{dictionary.properties?.income || "Income"}</TabsTrigger>
          <TabsTrigger value="expenses">{dictionary.properties?.expenses || "Expenses"}</TabsTrigger>
          <TabsTrigger value="outstanding">{dictionary.properties?.outstanding || "Outstanding"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.properties?.monthlyPerformance || "Monthly Performance"}</CardTitle>
                <CardDescription>{dictionary.properties?.lastSixMonthsPerformance || "Last 6 months financial performance"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.monthlyBreakdown.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">
                          {dictionary.properties?.revenue || "Revenue"}: {formatCurrency(month.revenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(month.netIncome)}
                        </p>
                        <p className="text-xs text-muted-foreground">{dictionary.properties?.netIncome || "Net Income"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{dictionary.properties?.expenseBreakdown || "Expense Breakdown"}</CardTitle>
                <CardDescription>{dictionary.properties?.annualExpensesByCategory || "Annual expenses by category"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData.expenses.map((expense, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {dictionary.properties?.expenseCategories?.[expense.category.toLowerCase().replace(' ', '')] || expense.category}
                        </span>
                        <span className="text-sm">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${expense.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Income</CardTitle>
              <CardDescription>Latest income transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.recentTransactions
                  .filter(t => t.type === 'income')
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date.toISOString())}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          +{formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest expense transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.recentTransactions
                  .filter(t => t.type === 'expense')
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date.toISOString())}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          -{formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>Overdue and pending payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.outstandingInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-red-100 p-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Unit {invoice.unitNumber} - {invoice.tenantName}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(invoice.dueDate.toISOString())} • {invoice.daysOverdue} days overdue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <Badge variant="destructive">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.properties?.quickActions || "Quick Actions"}</CardTitle>
          <CardDescription>
            {dictionary.properties?.commonFinancialActions || "Common financial actions for this property"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/billing/invoices/new`}>
                <FileText className="h-4 w-4 mr-2" />
                {dictionary.properties?.createInvoice || "Create Invoice"}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/billing/payments`}>
                <CreditCard className="h-4 w-4 mr-2" />
                {dictionary.properties?.recordPayment || "Record Payment"}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              {dictionary.properties?.exportReport || "Export Report"}
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              {dictionary.properties?.scheduleReport || "Schedule Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
