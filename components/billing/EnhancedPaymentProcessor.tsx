'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  CreditCard, 
  Banknote, 
  Smartphone,
  Receipt,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Send,
  Save
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

interface Invoice {
  id: string
  number: string
  total: number
  currency: string
  dueDate: string
  contact: {
    name: string
    email: string
  }
  unit?: {
    unitNumber: string
    property: {
      name: string
    }
  }
}

interface EnhancedPaymentProcessorProps {
  invoice: Invoice
  children?: React.ReactNode
}

export function EnhancedPaymentProcessor({ invoice, children }: EnhancedPaymentProcessorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentData, setPaymentData] = useState({
    amount: invoice.total.toString(),
    paidAt: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    partialPayment: false,
    lateFee: '0',
    discount: '0'
  })

  const [recurringSetup, setRecurringSetup] = useState({
    enabled: false,
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    autoProcess: false
  })

  const isOverdue = new Date(invoice.dueDate) < new Date()
  const daysOverdue = isOverdue ? 
    Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0

  const calculateTotal = () => {
    const amount = parseFloat(paymentData.amount) || 0
    const lateFee = parseFloat(paymentData.lateFee) || 0
    const discount = parseFloat(paymentData.discount) || 0
    return amount + lateFee - discount
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const paymentPayload = {
        invoiceId: invoice.id,
        method: paymentMethod,
        amount: calculateTotal(),
        paidAt: new Date(paymentData.paidAt),
        reference: paymentData.reference,
        notes: paymentData.notes,
        lateFee: parseFloat(paymentData.lateFee) || 0,
        discount: parseFloat(paymentData.discount) || 0,
        recurring: recurringSetup.enabled ? recurringSetup : null
      }

      console.log('Processing payment:', paymentPayload)
      
      // In real implementation, this would call the API
      // const response = await fetch('/api/billing/payments/enhanced', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentPayload)
      // })

      setOpen(false)
    } catch (error) {
      console.error('Error processing payment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Record payment for Invoice {invoice.number}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Invoice</p>
                <p className="font-medium">{invoice.number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount Due</p>
                <p className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{invoice.contact.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      {daysOverdue} days overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="payment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Payment Details</TabsTrigger>
            <TabsTrigger value="recurring">Recurring Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'bank_transfer', label: 'Bank Transfer', icon: Banknote },
                    { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'mobile_payment', label: 'Mobile Pay', icon: Smartphone }
                  ].map((method) => {
                    const Icon = method.icon
                    return (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod(method.id)}
                        className="h-16 flex-col gap-2"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{method.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        id="partial-payment"
                        checked={paymentData.partialPayment}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, partialPayment: e.target.checked }))}
                        className="mr-2"
                      />
                      <Label htmlFor="partial-payment" className="text-xs">Partial payment</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="paid-date">Payment Date</Label>
                    <Input
                      id="paid-date"
                      type="date"
                      value={paymentData.paidAt}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paidAt: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Late Fee and Discount */}
                {isOverdue && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="late-fee">Late Fee</Label>
                      <Input
                        id="late-fee"
                        type="number"
                        step="0.01"
                        value={paymentData.lateFee}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, lateFee: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={paymentData.discount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, discount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Transaction ID, check number, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional payment details..."
                    rows={2}
                  />
                </div>

                {/* Payment Summary */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Amount:</span>
                        <span>{formatCurrency(parseFloat(paymentData.amount) || 0, invoice.currency)}</span>
                      </div>
                      {parseFloat(paymentData.lateFee) > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Late Fee:</span>
                          <span>+{formatCurrency(parseFloat(paymentData.lateFee), invoice.currency)}</span>
                        </div>
                      )}
                      {parseFloat(paymentData.discount) > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(parseFloat(paymentData.discount), invoice.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total Payment:</span>
                        <span>{formatCurrency(calculateTotal(), invoice.currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recurring Payment Setup</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set up automatic recurring payments for this customer
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-recurring"
                    checked={recurringSetup.enabled}
                    onChange={(e) => setRecurringSetup(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <Label htmlFor="enable-recurring">Enable recurring payments</Label>
                </div>

                {recurringSetup.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={recurringSetup.frequency} 
                          onValueChange={(value) => setRecurringSetup(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={recurringSetup.startDate}
                          onChange={(e) => setRecurringSetup(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="end-date">End Date (Optional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={recurringSetup.endDate}
                        onChange={(e) => setRecurringSetup(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-process"
                        checked={recurringSetup.autoProcess}
                        onChange={(e) => setRecurringSetup(prev => ({ ...prev, autoProcess: e.target.checked }))}
                      />
                      <Label htmlFor="auto-process">Automatically process payments</Label>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Recurring Payment Summary
                        </p>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {formatCurrency(calculateTotal(), invoice.currency)} will be charged {recurringSetup.frequency}
                        {recurringSetup.startDate && ` starting ${formatDate(recurringSetup.startDate)}`}
                        {recurringSetup.endDate && ` until ${formatDate(recurringSetup.endDate)}`}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Receipt className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Process Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
