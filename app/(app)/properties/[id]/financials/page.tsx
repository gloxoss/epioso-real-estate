import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { unitsRepo } from '@/repositories/units'
import { billingRepo } from '@/repositories/billing'
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


interface PropertyFinancialsPageProps {
  params: Promise<{ id: string }>
}

async function getPropertyFinancialsData(propertyId: string, organizationId: string) {
  const [property, units] = await Promise.all([
    propertiesRepo.findById(propertyId, organizationId),
    unitsRepo.getByProperty(organizationId, propertyId)
  ])

  if (!property) {
    return null
  }

  // Calculate financial data from units and property data
  const occupiedUnits = units.filter(unit => unit.status === 'occupied')
  const totalUnits = units.length
  const occupancyRate = totalUnits > 0 ? (occupiedUnits.length / totalUnits) * 100 : 0

  const monthlyRevenue = occupiedUnits.reduce((sum, unit) => {
    return sum + (unit.rentAmount ? Number(unit.rentAmount) : 0)
  }, 0)

  // For now, use calculated data with some mock data for complex analytics
  // TODO: Replace with actual financial repository methods when available
  const financialData = {
    monthlyRevenue,
    yearlyRevenue: monthlyRevenue * 12,
    totalCollected: monthlyRevenue * 11, // Assume 11 months collected
    outstanding: monthlyRevenue, // Assume 1 month outstanding
    expenses: monthlyRevenue * 0.2, // Assume 20% expenses
    netIncome: monthlyRevenue * 0.8, // 80% net income
    occupancyRate,
    averageRent: occupiedUnits.length > 0 ? monthlyRevenue / occupiedUnits.length : 0,
    revenueGrowth: 8.5, // Mock growth rate
    
    monthlyBreakdown: [
      { month: 'Jan 2024', revenue: 12000, expenses: 2000, netIncome: 10000 },
      { month: 'Dec 2023', revenue: 11500, expenses: 1800, netIncome: 9700 },
      { month: 'Nov 2023', revenue: 11200, expenses: 2200, netIncome: 9000 },
      { month: 'Oct 2023', revenue: 11800, expenses: 1900, netIncome: 9900 },
      { month: 'Sep 2023', revenue: 11000, expenses: 2100, netIncome: 8900 },
      { month: 'Aug 2023', revenue: 11600, expenses: 1700, netIncome: 9900 },
    ],
    
    recentTransactions: [
      {
        id: '1',
        type: 'income',
        description: 'Unit 2A - January Rent',
        amount: 1200.00,
        date: new Date('2024-01-01'),
        status: 'completed'
      },
      {
        id: '2',
        type: 'expense',
        description: 'Maintenance - Plumbing Repair',
        amount: 350.00,
        date: new Date('2024-01-05'),
        status: 'completed'
      },
      {
        id: '3',
        type: 'income',
        description: 'Unit 1B - January Rent',
        amount: 1100.00,
        date: new Date('2024-01-01'),
        status: 'completed'
      },
      {
        id: '4',
        type: 'expense',
        description: 'Property Insurance',
        amount: 800.00,
        date: new Date('2024-01-03'),
        status: 'completed'
      }
    ],
    
    outstandingInvoices: [
      {
        id: '1',
        unitNumber: '3C',
        tenantName: 'John Doe',
        amount: 1200.00,
        dueDate: new Date('2024-01-01'),
        daysOverdue: 15,
        status: 'overdue'
      },
      {
        id: '2',
        unitNumber: '2B',
        tenantName: 'Jane Smith',
        amount: 1150.00,
        dueDate: new Date('2024-01-15'),
        daysOverdue: 1,
        status: 'overdue'
      }
    ],
    
    expenses: [
      { category: 'Maintenance', amount: 8400.00, percentage: 35 },
      { category: 'Insurance', amount: 4800.00, percentage: 20 },
      { category: 'Property Tax', amount: 3600.00, percentage: 15 },
      { category: 'Utilities', amount: 2400.00, percentage: 10 },
      { category: 'Management', amount: 2400.00, percentage: 10 },
      { category: 'Other', amount: 2400.00, percentage: 10 }
    ]
  }

  return {
    property,
    financialData
  }
}

export default async function PropertyFinancialsPage({ params }: PropertyFinancialsPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getPropertyFinancialsData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, financialData } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Financials - ${property.name}`}
        description="Financial overview and performance metrics"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button asChild>
              <Link href="/billing/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
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
            <CardTitle>Property Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property Type</p>
              <p className="font-medium capitalize">{property.propertyType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy Rate</p>
              <p className="font-medium">{financialData.occupancyRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.monthlyRevenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{financialData.revenueGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialData.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              After expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.outstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData.outstandingInvoices.length} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Last 6 months financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.monthlyBreakdown.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: {formatCurrency(month.revenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(month.netIncome)}
                        </p>
                        <p className="text-xs text-muted-foreground">Net Income</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Annual expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData.expenses.map((expense, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{expense.category}</span>
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common financial actions for this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/billing/invoices/new">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/billing/payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
