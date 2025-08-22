'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  Plus, 
  Trash2, 
  Calculator, 
  FileText, 
  Send,
  Save,
  Eye,
  Copy,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface EnhancedInvoiceGeneratorProps {
  children?: React.ReactNode
  unitId?: string
  contactId?: string
}

export function EnhancedInvoiceGenerator({ children, unitId, contactId }: EnhancedInvoiceGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Line Items, 3: Review & Send

  const [basicInfo, setBasicInfo] = useState({
    contactId: contactId || '',
    unitId: unitId || '',
    invoiceType: 'rent', // rent, maintenance, utilities, other
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'MAD',
    notes: '',
    paymentTerms: '30', // days
    lateFee: '0',
    discountPercent: '0'
  })

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Monthly Rent',
      quantity: 1,
      unitPrice: 2500,
      total: 2500
    }
  ])

  const [taxSettings, setTaxSettings] = useState({
    taxRate: 20, // VAT percentage
    taxIncluded: false
  })

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * parseFloat(basicInfo.discountPercent || '0')) / 100
  const subtotalAfterDiscount = subtotal - discountAmount
  const taxAmount = taxSettings.taxIncluded ? 0 : (subtotalAfterDiscount * taxSettings.taxRate) / 100
  const total = subtotalAfterDiscount + taxAmount

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (basicInfo.issueDate && basicInfo.paymentTerms) {
      const issueDate = new Date(basicInfo.issueDate)
      issueDate.setDate(issueDate.getDate() + parseInt(basicInfo.paymentTerms))
      setBasicInfo(prev => ({
        ...prev,
        dueDate: issueDate.toISOString().split('T')[0]
      }))
    }
  }, [basicInfo.issueDate, basicInfo.paymentTerms])

  const addLineItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create invoice with line items
      const invoiceData = {
        ...basicInfo,
        lineItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        taxRate: taxSettings.taxRate,
        taxIncluded: taxSettings.taxIncluded
      }

      console.log('Creating enhanced invoice:', invoiceData)
      
      // In real implementation, this would call the API
      // const response = await fetch('/api/billing/invoices/enhanced', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoiceData)
      // })

      setOpen(false)
      setStep(1)
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Enhanced Invoice</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Line Items' : 'Review & Send'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-12 h-0.5 ${step > stepNum ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-type">Invoice Type</Label>
                <Select value={basicInfo.invoiceType} onValueChange={(value) => 
                  setBasicInfo(prev => ({ ...prev, invoiceType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Monthly Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance Fee</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="deposit">Security Deposit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-terms">Payment Terms (Days)</Label>
                <Select value={basicInfo.paymentTerms} onValueChange={(value) => 
                  setBasicInfo(prev => ({ ...prev, paymentTerms: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Due Immediately</SelectItem>
                    <SelectItem value="15">Net 15</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="45">Net 45</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={basicInfo.issueDate}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={basicInfo.dueDate}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={basicInfo.discountPercent}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, discountPercent: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="late-fee">Late Fee (MAD)</Label>
                <Input
                  id="late-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={basicInfo.lateFee}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, lateFee: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or payment instructions..."
                value={basicInfo.notes}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Line Items
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Line Items */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Invoice Line Items</h3>
              <Button onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <div className="font-medium text-lg">
                          {formatCurrency(item.total, 'MAD')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {lineItems.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tax Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxSettings.taxRate}
                      onChange={(e) => setTaxSettings(prev => ({ 
                        ...prev, 
                        taxRate: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="tax-included"
                      checked={taxSettings.taxIncluded}
                      onChange={(e) => setTaxSettings(prev => ({ 
                        ...prev, 
                        taxIncluded: e.target.checked 
                      }))}
                    />
                    <Label htmlFor="tax-included">Tax included in prices</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Totals Preview */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal, 'MAD')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({basicInfo.discountPercent}%):</span>
                      <span>-{formatCurrency(discountAmount, 'MAD')}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({taxSettings.taxRate}%):</span>
                      <span>{formatCurrency(taxAmount, 'MAD')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total, 'MAD')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Invoice Ready</h3>
              <p className="text-muted-foreground">
                Review your invoice and choose how to send it.
              </p>
            </div>

            {/* Invoice Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type:</strong> {basicInfo.invoiceType}
                    </div>
                    <div>
                      <strong>Total:</strong> {formatCurrency(total, 'MAD')}
                    </div>
                    <div>
                      <strong>Due Date:</strong> {basicInfo.dueDate}
                    </div>
                    <div>
                      <strong>Items:</strong> {lineItems.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
