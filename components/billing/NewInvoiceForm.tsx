'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Save,
  Send,
  Loader2,
  User,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatMoney } from '@/lib/format'

interface Contact {
  id: string
  name: string
  email?: string
  type: string
}

interface Unit {
  id: string
  unitNumber: string
  property: {
    id: string
    name: string
  }
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface NewInvoiceFormProps {
  organizationId: string
  initialContactId?: string
  initialUnitId?: string
  initialPropertyId?: string
}

export function NewInvoiceForm({ 
  organizationId, 
  initialContactId, 
  initialUnitId, 
  initialPropertyId 
}: NewInvoiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  // New customer dialog state
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    type: 'buyer',
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const [formData, setFormData] = useState({
    contactId: initialContactId || '',
    unitId: initialUnitId || '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'MAD',
    notes: '',
    paymentTerms: '30', // days
  })

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Monthly Rent',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ])

  // Fetch contacts and units on component mount
  useEffect(() => {
    fetchContacts()
    fetchUnits()
  }, [])

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (formData.issueDate && formData.paymentTerms) {
      const issueDate = new Date(formData.issueDate)
      issueDate.setDate(issueDate.getDate() + parseInt(formData.paymentTerms))
      setFormData(prev => ({
        ...prev,
        dueDate: issueDate.toISOString().split('T')[0]
      }))
    }
  }, [formData.issueDate, formData.paymentTerms])

  const fetchContacts = async () => {
    setLoadingContacts(true)
    try {
      // Fetch contacts that can be invoiced: tenant, buyer, owner, other
      const response = await fetch('/api/contacts?limit=100')
      if (response.ok) {
        const data = await response.json()
        // Filter for billable contact types
        const billableContacts = (data.data || []).filter((contact: any) =>
          ['tenant', 'buyer', 'owner', 'other'].includes(contact.type)
        )
        setContacts(billableContacts)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  const fetchUnits = async () => {
    setLoadingUnits(true)
    try {
      const response = await fetch('/api/units?limit=100')
      if (response.ok) {
        const data = await response.json()
        setUnits(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoadingUnits(false)
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

    setCreatingCustomer(true)
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

      const newContact = await response.json()

      // Add the new contact to the list and select it
      setContacts(prev => [newContact, ...prev])
      setFormData(prev => ({ ...prev, contactId: newContact.id }))

      // Reset form and close dialog
      setNewCustomerData({
        type: 'buyer',
        name: '',
        email: '',
        phone: '',
        address: '',
      })
      setShowNewCustomerDialog(false)

      toast({
        title: 'Success',
        description: 'Customer created successfully',
      })
    } catch (error) {
      console.error('Error creating customer:', error)
      toast({
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addLineItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setLineItems(prev => [...prev, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Recalculate total when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 20 // 20% VAT for Morocco
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handleSubmit = async (action: 'draft' | 'send') => {
    setLoading(true)

    try {
      const invoiceData = {
        contactId: formData.contactId || null,
        unitId: formData.unitId || null,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        currency: formData.currency,
        notes: formData.notes,
        lineItems: lineItems.filter(item => item.description.trim() !== ''),
        subtotal,
        taxAmount,
        total,
        status: action === 'draft' ? 'draft' : 'open'
      }

      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const invoice = await response.json()

      toast({
        title: action === 'draft' ? 'Draft saved' : 'Invoice created',
        description: `Invoice ${invoice.number} has been ${action === 'draft' ? 'saved as draft' : 'created successfully'}.`,
      })

      router.push('/billing/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedContact = contacts.find(c => c.id === formData.contactId)
  const selectedUnit = units.find(u => u.id === formData.unitId)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Invoice Header */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-background to-muted/20">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            <span>Invoice Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Selection */}
            <div className="space-y-3">
              <Label htmlFor="customer" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer *
              </Label>
              <Select value={formData.contactId} onValueChange={(value) => handleFormChange('contactId', value)}>
                <SelectTrigger className="h-12 border-2 focus:border-primary">
                  <SelectValue placeholder={loadingContacts ? "Loading customers..." : "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingContacts ? (
                    <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                  ) : contacts.length === 0 ? (
                    <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                  ) : (
                    contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.email && `(${contact.email})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Create New Customer Button */}
              <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add a new customer to your contacts and use them for this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createNewCustomer(); }} className="space-y-4">
                    {/* Customer Type */}
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={newCustomerData.type}
                        onValueChange={(value) => setNewCustomerData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Name */}
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newCustomerData.name}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        className="mt-1"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newCustomerData.phone}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+212 6 12 34 56 78"
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newCustomerData.address}
                        onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, City, State"
                        className="mt-1"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCustomerDialog(false)}
                        disabled={creatingCustomer}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={creatingCustomer || !newCustomerData.name || !newCustomerData.phone}
                      >
                        {creatingCustomer && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Customer
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {selectedContact && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-sm font-medium text-foreground">{selectedContact.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                </div>
              )}
            </div>

            {/* Unit Selection */}
            <div className="space-y-3">
              <Label htmlFor="unit" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Unit (Optional)
              </Label>
              <Select value={formData.unitId} onValueChange={(value) => handleFormChange('unitId', value)}>
                <SelectTrigger className="h-12 border-2 focus:border-primary">
                  <SelectValue placeholder={loadingUnits ? "Loading units..." : "Select unit"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingUnits ? (
                    <SelectItem value="loading" disabled>Loading units...</SelectItem>
                  ) : units.length === 0 ? (
                    <SelectItem value="no-units" disabled>No units available</SelectItem>
                  ) : (
                    units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.property.name} - Unit {unit.unitNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedUnit && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-sm font-medium text-foreground">Unit {selectedUnit.unitNumber}</p>
                  <p className="text-sm text-muted-foreground">{selectedUnit.property.name}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Issue Date */}
            <div className="space-y-3">
              <Label htmlFor="issueDate" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Issue Date *
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleFormChange('issueDate', e.target.value)}
                className="h-12 border-2 focus:border-primary"
                required
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-3">
              <Label htmlFor="paymentTerms" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Payment Terms
              </Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => handleFormChange('paymentTerms', value)}>
                <SelectTrigger className="h-12 border-2 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="45">45 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleFormChange('dueDate', e.target.value)}
                className="h-12 border-2 focus:border-primary"
                required
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
              Notes & Instructions
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes, payment instructions, or special terms..."
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              rows={4}
              className="border-2 focus:border-primary resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-background to-muted/20">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Calculator className="h-6 w-6 text-primary" />
              <span>Line Items</span>
            </CardTitle>
            <Button onClick={addLineItem} variant="outline" size="lg" className="h-11 px-6 border-2 hover:border-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-muted text-sm font-semibold text-muted-foreground">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Unit Price (MAD)</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-muted/20 rounded-lg border">
                  <div className="col-span-5">
                    <Input
                      placeholder="Enter item description..."
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      className="h-11 border-2 focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="h-11 border-2 focus:border-primary text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="h-11 border-2 focus:border-primary text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="h-11 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-md flex items-center justify-center font-semibold text-primary">
                      {formatMoney(item.total, 'MAD')}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {lineItems.length > 1 && (
                      <Button
                        onClick={() => removeLineItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="h-11 w-11 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-96 space-y-4 bg-muted/30 p-6 rounded-lg border">
              <h3 className="font-semibold text-lg text-foreground mb-4">Invoice Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatMoney(subtotal, 'MAD')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">VAT ({taxRate}%):</span>
                  <span className="font-medium">{formatMoney(taxAmount, 'MAD')}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-xl text-primary">
                  <span>Total:</span>
                  <span>{formatMoney(total, 'MAD')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>• All fields marked with * are required</p>
              <p>• VAT will be calculated automatically at 20%</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => router.push('/billing/invoices')}
                disabled={loading}
                className="h-12 px-6 border-2"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={loading || !formData.contactId || lineItems.every(item => !item.description.trim())}
                className="h-12 px-6 border-2 hover:border-primary"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit('send')}
                disabled={loading || !formData.contactId || lineItems.every(item => !item.description.trim())}
                className="h-12 px-8 bg-primary hover:bg-primary/90"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Create & Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
