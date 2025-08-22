import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

interface Unit {
  id: string
  unitNumber: string
  status: string
  rentAmount?: number
  property: {
    id: string
    name: string
  }
}

interface FinancialData {
  monthlyRevenue: number
  totalRevenue: number
  outstandingAmount: number
  collectionRate: number
  recentPayments: Array<{
    id: string
    amount: number
    date: Date
    method: string
    status: string
  }>
  upcomingPayments: Array<{
    id: string
    amount: number
    dueDate: Date
    type: string
    status: string
  }>
  paymentHistory: any[]
}

interface UnitFinancialTrackingProps {
  unitId: string
  unit: Unit
  financialData: FinancialData
}

export function UnitFinancialTracking({ unitId, unit, financialData }: UnitFinancialTrackingProps) {
  const {
    monthlyRevenue,
    totalRevenue,
    outstandingAmount,
    collectionRate,
    recentPayments,
    upcomingPayments,
    paymentHistory
  } = financialData

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyRevenue, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Current rent amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected yearly income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(outstandingAmount, 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              No overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {collectionRate}%
            </div>
            <Progress value={collectionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Payment success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Unit revenue chart will be displayed here</p>
              <p className="text-xs text-muted-foreground mt-2">
                Shows monthly rent payments and trends
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/billing/payments?unit=${unitId}`} className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent payments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount, 'MAD')}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.date.toISOString())} • {payment.method}
                      </p>
                    </div>
                    <Badge variant="default">
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {unit.status === 'available' ? 'No tenant assigned' : 'No upcoming payments'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDate(payment.dueDate.toISOString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount, 'MAD')}</p>
                      <Badge variant="outline">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild>
              <Link href={`/billing/invoices/new?unit=${unitId}`}>
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/billing/payments/new?unit=${unitId}`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/reports/unit-financial?unit=${unitId}`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Financial Report
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Auto-billing</p>
                <p className="text-sm text-muted-foreground">Generate monthly rent invoices</p>
              </div>
            </div>
            <Badge variant={unit.status === 'occupied' ? 'default' : 'outline'}>
              {unit.status === 'occupied' ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">Send automatic payment reminders</p>
              </div>
            </div>
            <Badge variant="secondary">Enabled</Badge>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full">
              Configure Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
