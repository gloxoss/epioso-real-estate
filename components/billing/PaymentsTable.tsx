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
  Edit, 
  Trash2,
  CreditCard,
  Banknote,
  Building2,
  FileCheck,
  Zap
} from 'lucide-react'
import { formatMoney, formatDate, formatDateTime } from '@/lib/format'

interface Payment {
  id: string
  invoice: {
    id: string
    number: string
    total: number
    contact: {
      id: string
      name: string
    } | null
  }
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'stripe'
  amount: number
  currency: string
  paidAt: string
  reference?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface PaymentsTableProps {
  payments: Payment[]
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'cash':
      return <Banknote className="h-4 w-4" />
    case 'bank_transfer':
      return <Building2 className="h-4 w-4" />
    case 'credit_card':
      return <CreditCard className="h-4 w-4" />
    case 'check':
      return <FileCheck className="h-4 w-4" />
    case 'stripe':
      return <Zap className="h-4 w-4" />
    default:
      return <CreditCard className="h-4 w-4" />
  }
}

function getMethodColor(method: string) {
  switch (method) {
    case 'cash':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'bank_transfer':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    case 'credit_card':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    case 'check':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    case 'stripe':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

function formatMethodName(method: string) {
  switch (method) {
    case 'bank_transfer':
      return 'Bank Transfer'
    case 'credit_card':
      return 'Credit Card'
    default:
      return method.charAt(0).toUpperCase() + method.slice(1)
  }
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  const handleAction = async (action: string, paymentId: string) => {
    console.log(`${action} action for payment ${paymentId}`)
    // TODO: Implement actual actions
    switch (action) {
      case 'view':
        window.open(`/billing/payments/${paymentId}`, '_blank')
        break
      case 'download':
        // TODO: Implement receipt download
        break
      case 'edit':
        window.location.href = `/billing/payments/${paymentId}/edit`
        break
      case 'delete':
        // TODO: Implement delete with confirmation
        break
    }
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const currency = payments[0]?.currency || 'MAD'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payments ({payments.length})</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{formatMoney(totalAmount, currency)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(payment.method)}
                      <div>
                        <div className="font-medium">Payment #{payment.id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(payment.createdAt)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.invoice.number}</div>
                      <div className="text-sm text-muted-foreground">
                        Total: {formatMoney(payment.invoice.total, payment.currency)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {payment.invoice.contact?.name || 'No customer'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getMethodColor(payment.method)}
                    >
                      <div className="flex items-center space-x-1">
                        {getMethodIcon(payment.method)}
                        <span>{formatMethodName(payment.method)}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {formatDate(payment.paidAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.paidAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium text-green-600">
                      {formatMoney(payment.amount, payment.currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.reference ? (
                      <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {payment.reference}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
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
                        <DropdownMenuItem onClick={() => handleAction('view', payment.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('download', payment.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('edit', payment.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAction('delete', payment.id)}
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
