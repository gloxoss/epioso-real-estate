'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Loader2, CreditCard, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RecordPaymentProps {
  children?: React.ReactNode
  invoiceId?: string
}

interface Invoice {
  id: string
  number: string
  total: number
  currency: string
  contact?: {
    name: string
  }
}

export function RecordPayment({ children, invoiceId }: RecordPaymentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'buyer' as const,
  })
  const [formData, setFormData] = useState({
    invoiceId: invoiceId || '',
    method: '',
    amount: '',
    currency: 'MAD',
    paidAt: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  })

  // Fetch available invoices when dialog opens
  useEffect(() => {
    if (open && !invoiceId) {
      fetchInvoices()
    }
  }, [open, invoiceId])

  const fetchInvoices = async () => {
    setLoadingInvoices(true)
    try {
      // Fetch all unpaid invoices (open, overdue, and draft)
      const response = await fetch('/api/billing/invoices?perPage=100')
      if (response.ok) {
        const result = await response.json()
        // Filter for invoices that can still receive payments
        const unpaidInvoices = (result.data || []).filter((invoice: any) => {
          // Include open, overdue, and draft invoices
          if (['open', 'overdue', 'draft'].includes(invoice.status)) {
            return true
          }
          // For paid invoices, check if there's still a balance due
          if (invoice.status === 'paid') {
            const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
            return Number(invoice.total) > totalPaid
          }
          return false
        })
        setInvoices(unpaidInvoices)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const createNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast({
        title: 'Error',
        description: 'Name and phone are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomerData),
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      const newCustomer = await response.json()

      toast({
        title: 'Customer created',
        description: `${newCustomer.name} has been added successfully.`,
      })

      // Reset form and close dialog
      setNewCustomerData({
        name: '',
        email: '',
        phone: '',
        type: 'buyer' as const,
      })
      setShowNewCustomerDialog(false)

      // Refresh invoices to potentially include new customer's invoices
      fetchInvoices()

    } catch (error) {
      console.error('Error creating customer:', error)
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          paidAt: new Date(formData.paidAt),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record payment')
      }

      const payment = await response.json()

      toast({
        title: 'Payment recorded',
        description: `Payment of ${formData.currency} ${formData.amount} has been recorded successfully.`,
      })

      setFormData({
        invoiceId: invoiceId || '',
        method: '',
        amount: '',
        currency: 'MAD',
        paidAt: new Date().toISOString().split('T')[0],
        reference: '',
        notes: '',
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const paymentMethods = [
    { value: 'cash', label: 'Cash (Espèces/نقدا)' },
    { value: 'check', label: 'Check (Chèque/شيك)' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a new payment received from a customer.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Selection */}
          <div>
            <Label htmlFor="invoiceId">Invoice *</Label>
            <Select
              value={formData.invoiceId}
              onValueChange={(value) => {
                handleChange('invoiceId', value)
                // Auto-fill amount and currency from selected invoice
                const selectedInvoice = invoices.find(inv => inv.id === value)
                if (selectedInvoice) {
                  handleChange('amount', selectedInvoice.total.toString())
                  handleChange('currency', selectedInvoice.currency)
                }
              }}
              disabled={!!invoiceId || loadingInvoices}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingInvoices ? "Loading invoices..." : "Select an invoice"} />
              </SelectTrigger>
              <SelectContent>
                {invoices.length === 0 && !loadingInvoices ? (
                  <SelectItem value="no-invoices" disabled>No open invoices found</SelectItem>
                ) : (
                  invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.number} - {invoice.contact?.name || 'No customer'} - {invoice.currency} {invoice.total.toFixed(2)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Create New Customer Button */}
            <div className="mt-2">
              <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" type="button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add a new customer to your contacts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName">Name *</Label>
                      <Input
                        id="customerName"
                        value={newCustomerData.name}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Customer name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="customer@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone *</Label>
                      <Input
                        id="customerPhone"
                        value={newCustomerData.phone}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+212 6XX XXX XXX"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerType">Type</Label>
                      <Select
                        value={newCustomerData.type}
                        onValueChange={(value) => setNewCustomerData(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCustomerDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={createNewCustomer}
                        disabled={!newCustomerData.name || !newCustomerData.phone}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Customer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={formData.method} onValueChange={(value) => handleChange('method', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="paidAt">Payment Date *</Label>
            <Input
              id="paidAt"
              type="date"
              value={formData.paidAt}
              onChange={(e) => handleChange('paidAt', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Reference */}
          <div>
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="Transaction ID, check number, etc."
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this payment..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.invoiceId || !formData.method || !formData.amount}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
