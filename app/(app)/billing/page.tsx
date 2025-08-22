import { Suspense } from 'react'
import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

async function getBillingData(organizationId: string) {
  const [invoiceStats, paymentStats] = await Promise.all([
    billingRepo.getInvoiceStats(organizationId),
    billingRepo.getPaymentStats(organizationId)
  ])

  return {
    invoiceStats,
    paymentStats
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'open':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function BillingPage() {
  const session = await requireAuthWithRole()
  const { invoiceStats, paymentStats } = await getBillingData(session.organizationId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Manage your invoices, payments, and billing information"
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(invoiceStats.totalAmount - invoiceStats.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceStats.overdueInvoices} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoiceStats.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentStats.totalPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockInvoices.filter(inv => inv.status === 'open').length > 0 ? '5 days' : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Next invoice due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/billing/invoices">
            <FileText className="h-4 w-4 mr-2" />
            View All Invoices
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/billing/payments">
            <CreditCard className="h-4 w-4 mr-2" />
            View All Payments
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/billing/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Your latest invoices and their payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceStats.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{invoice.number}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(invoice.dueDate.toISOString())}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(Number(invoice.amount))}</div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest payments received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentStats.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">Payment #{payment.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.method} • {formatDate(payment.createdAt.toISOString())}
                    </div>
                  </div>
                </div>

                <div className="font-medium text-green-600">
                  +{formatCurrency(Number(payment.amount))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
