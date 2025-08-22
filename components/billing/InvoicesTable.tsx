'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Send, 
  Edit, 
  Trash2,
  CreditCard,
  FileText
} from 'lucide-react'
import { formatMoney, formatDate } from '@/lib/format'

interface Invoice {
  id: string
  number: string
  contact?: {
    id: string
    name: string
    email?: string
  }
  unit?: {
    id: string
    unitNumber: string
    property: {
      name: string
    }
  }
  issueDate: string
  dueDate: string
  currency: string
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'open' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  stripePaymentIntentId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface InvoicesTableProps {
  invoices: Invoice[]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    case 'open':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    case 'refunded':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'paid':
      return <CreditCard className="h-3 w-3" />
    case 'overdue':
      return <FileText className="h-3 w-3" />
    case 'open':
      return <FileText className="h-3 w-3" />
    default:
      return <FileText className="h-3 w-3" />
  }
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  const handleAction = async (action: string, invoiceId: string) => {
    console.log(`${action} action for invoice ${invoiceId}`)
    // TODO: Implement actual actions
    switch (action) {
      case 'view':
        window.open(`/billing/invoices/${invoiceId}`, '_blank')
        break
      case 'download':
        // TODO: Implement PDF download
        break
      case 'send':
        // TODO: Implement email sending
        break
      case 'edit':
        window.location.href = `/billing/invoices/${invoiceId}/edit`
        break
      case 'delete':
        // TODO: Implement delete with confirmation
        break
      case 'payment':
        window.location.href = `/billing/invoices/${invoiceId}/payment`
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices ({invoices.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{invoice.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {invoice.contact?.name || 'No customer'}
                      </div>
                      {invoice.contact?.email && (
                        <div className="text-sm text-muted-foreground">
                          {invoice.contact.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.unit ? (
                      <div>
                        <div className="font-medium">{invoice.unit.unitNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.unit.property.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(invoice.issueDate)}
                  </TableCell>
                  <TableCell>
                    <div className={`${
                      invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''
                    }`}>
                      {formatDate(invoice.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {formatMoney(invoice.total, invoice.currency)}
                    </div>
                    {invoice.tax > 0 && (
                      <div className="text-sm text-muted-foreground">
                        +{formatMoney(invoice.tax, invoice.currency)} tax
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(invoice.status)}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction('view', invoice.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('download', invoice.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {invoice.status !== 'paid' && (
                          <>
                            <DropdownMenuItem onClick={() => handleAction('send', invoice.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('payment', invoice.id)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleAction('edit', invoice.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleAction('delete', invoice.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
