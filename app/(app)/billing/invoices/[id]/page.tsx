import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  Phone,
  Printer,
  Send,
  User,
  Building2,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

// Mock data - replace with actual data fetching
async function getInvoiceData(invoiceId: string, organizationId: string) {
  return {
    invoice: {
      id: invoiceId,
      number: 'INV-2024-001',
      status: 'open',
      amount: 1200.00,
      tax: 240.00,
      total: 1440.00,
      dueDate: new Date('2024-02-01'),
      issueDate: new Date('2024-01-01'),
      paidDate: null,
      description: 'Monthly rent for January 2024',
      notes: 'Payment is due by the 1st of each month. Late fees apply after 5 days.',
      property: {
        id: 'prop-1',
        name: 'Sunset Apartments',
        address: '123 Main St, Casablanca'
      },
      unit: {
        id: 'unit-1',
        number: '2A'
      },
      tenant: {
        id: 'tenant-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+212 6XX XXX XXX',
        address: '123 Main St, Unit 2A, Casablanca'
      },
      lineItems: [
        {
          id: '1',
          description: 'Monthly Rent - January 2024',
          quantity: 1,
          rate: 1200.00,
          amount: 1200.00
        }
      ],
      paymentHistory: [
        {
          id: '1',
          amount: 500.00,
          date: new Date('2024-01-15'),
          method: 'bank_transfer',
          reference: 'TXN-123456',
          status: 'completed'
        }
      ]
    }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>
    case 'open':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Open</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getInvoiceData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { invoice } = data
  const remainingBalance = invoice.total - invoice.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.number}`}
        description={`${invoice.property.name} - Unit ${invoice.unit.number}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/billing/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Invoice
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Invoice {invoice.number}</CardTitle>
                  <CardDescription>
                    Issued {formatDate(invoice.issueDate.toISOString())}
                  </CardDescription>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Bill To</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{invoice.tenant.name}</p>
                    <p>{invoice.tenant.address}</p>
                    <p>{invoice.tenant.email}</p>
                    <p>{invoice.tenant.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Invoice Details</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{formatDate(invoice.issueDate.toISOString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{formatDate(invoice.dueDate.toISOString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property:</span>
                      <span>{invoice.property.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit:</span>
                      <span>{invoice.unit.number}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <h4 className="font-medium mb-4">Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Rate</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (20%):</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(remainingBalance)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.paymentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.date.toISOString())} • {payment.method} • {payment.reference}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid Amount</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(invoice.paymentHistory.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance Due</span>
                <span className={`font-medium ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Overdue</span>
                <span className="font-medium">
                  {invoice.status === 'overdue' ? Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Property & Tenant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{invoice.property.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.property.address}</p>
                <p className="text-sm text-muted-foreground">Unit {invoice.unit.number}</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/properties/${invoice.property.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Property
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tenant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{invoice.tenant.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.tenant.email}</p>
                <p className="text-sm text-muted-foreground">{invoice.tenant.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Duplicate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
