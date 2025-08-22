import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

interface FinancialData {
  totalRevenue: number
  monthlyRevenue: number
  outstandingAmount: number
  collectionRate: number
  avgPaymentTime: number
  revenueGrowth: number
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
    invoices: number
    collections: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
  }>
  topProperties: Array<{
    id: string
    name: string
    revenue: number
    units: number
  }>
}

interface FinancialAnalyticsDashboardProps {
  data: FinancialData
}

export function FinancialAnalyticsDashboard({ data }: FinancialAnalyticsDashboardProps) {
  const {
    totalRevenue,
    monthlyRevenue,
    outstandingAmount,
    collectionRate,
    avgPaymentTime,
    revenueGrowth,
    monthlyData,
    paymentMethods,
    topProperties
  } = data

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const monthlyGrowth = previousMonth ? 
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'MAD')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue, 'MAD')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(monthlyGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{collectionRate.toFixed(1)}%</div>
            <Progress value={collectionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(outstandingAmount, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg payment time: {avgPaymentTime} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Revenue trend chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last 12 months performance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(method.amount, 'MAD')}</p>
                        <p className="text-xs text-muted-foreground">{method.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Properties</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/reports/properties">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.units} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(property.revenue, 'MAD')}</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {/* Monthly Revenue Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.slice(-6).map((month, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{month.month}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(month.revenue, 'MAD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(month.expenses, 'MAD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit</p>
                      <p className="font-medium">
                        {formatCurrency(month.profit, 'MAD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invoices</p>
                      <p className="font-medium">{month.invoices}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          {/* Collection Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">On-Time Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <Progress value={87} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Late Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">10%</div>
                <Progress value={10} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3%</div>
                <Progress value={3} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Collection Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Collection performance chart</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment timing analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Financial Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg dark:bg-green-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Strong Collection Rate
                    </p>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Your {collectionRate.toFixed(1)}% collection rate is above industry average of 92%
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Revenue Growth
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Monthly revenue increased by {Math.abs(monthlyGrowth).toFixed(1)}% compared to last month
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Payment Timing
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Average payment time is {avgPaymentTime} days. Consider payment reminders.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Automate Payment Reminders</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Set up automatic reminders 3 days before due date to improve collection rate.
                  </p>
                  <Button size="sm" variant="outline">
                    Set Up Reminders
                  </Button>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Offer Online Payments</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Enable online payment options to reduce payment time by 40%.
                  </p>
                  <Button size="sm" variant="outline">
                    Enable Online Payments
                  </Button>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Early Payment Discounts</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Offer 2% discount for payments made 5 days early to improve cash flow.
                  </p>
                  <Button size="sm" variant="outline">
                    Configure Discounts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
