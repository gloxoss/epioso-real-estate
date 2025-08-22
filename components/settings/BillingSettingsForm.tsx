'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  Loader2, 
  Upload,
  Download,
  Settings,
  CreditCard,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BillingSettings {
  // General Settings
  defaultCurrency: string
  numberFormat: string
  dateFormat: string
  
  // Payment Settings
  defaultPaymentTerms: number
  lateFeeGracePeriod: number
  lateFeeAmount: number
  lateFeeType: 'fixed' | 'percentage'
  
  // Invoice Settings
  invoiceTemplate: string
  invoiceNumberPrefix: string
  invoiceNumberFormat: string
  defaultNotes: string
  paymentInstructions: string
  
  // Tax Settings
  defaultTaxRate: number
  taxIdNumber: string
  taxInclusivePricing: boolean
  
  // Automation Settings
  autoGenerateRentInvoices: boolean
  autoApplyLateFees: boolean
  autoSendReminders: boolean
  reminderDaysBefore: number
  
  // Email Settings
  emailOnInvoiceSent: boolean
  emailOnPaymentReceived: boolean
  emailOnPaymentOverdue: boolean
  emailOnPaymentReminder: boolean
}

interface BillingSettingsFormProps {
  organizationId: string
  initialSettings?: Partial<BillingSettings>
}

export function BillingSettingsForm({ organizationId, initialSettings }: BillingSettingsFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [settings, setSettings] = useState<BillingSettings>({
    // Default values
    defaultCurrency: 'MAD',
    numberFormat: 'en-US',
    dateFormat: 'DD/MM/YYYY',
    defaultPaymentTerms: 30,
    lateFeeGracePeriod: 7,
    lateFeeAmount: 50,
    lateFeeType: 'fixed',
    invoiceTemplate: 'professional',
    invoiceNumberPrefix: 'INV',
    invoiceNumberFormat: 'INV-YYYY-0000',
    defaultNotes: 'Thank you for your business!',
    paymentInstructions: 'Please pay within the specified due date.',
    defaultTaxRate: 20,
    taxIdNumber: '',
    taxInclusivePricing: false,
    autoGenerateRentInvoices: true,
    autoApplyLateFees: false,
    autoSendReminders: false,
    reminderDaysBefore: 3,
    emailOnInvoiceSent: true,
    emailOnPaymentReceived: true,
    emailOnPaymentOverdue: false,
    emailOnPaymentReminder: false,
    // Override with initial settings
    ...initialSettings,
  })

  const handleChange = (field: keyof BillingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/billing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save billing settings')
      }

      toast({
        title: 'Settings saved',
        description: 'Your billing settings have been updated successfully.',
      })
    } catch (error) {
      console.error('Error saving billing settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save billing settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/settings/billing/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'billing-settings.json'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting settings:', error)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      setSettings(prev => ({ ...prev, ...importedSettings }))
      
      toast({
        title: 'Settings imported',
        description: 'Billing settings have been imported successfully.',
      })
    } catch (error) {
      console.error('Error importing settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to import settings. Please check the file format.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>General Settings</span>
          </CardTitle>
          <CardDescription>
            Basic billing configuration and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select value={settings.defaultCurrency} onValueChange={(value) => handleChange('defaultCurrency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defaultPaymentTerms">Default Payment Terms (Days)</Label>
              <Select value={settings.defaultPaymentTerms.toString()} onValueChange={(value) => handleChange('defaultPaymentTerms', parseInt(value))}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="lateFeeGracePeriod">Late Fee Grace Period (Days)</Label>
              <Input
                id="lateFeeGracePeriod"
                type="number"
                min="0"
                value={settings.lateFeeGracePeriod}
                onChange={(e) => handleChange('lateFeeGracePeriod', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Invoice Settings</span>
          </CardTitle>
          <CardDescription>
            Configure invoice templates and default content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceTemplate">Invoice Template</Label>
              <Select value={settings.invoiceTemplate} onValueChange={(value) => handleChange('invoiceTemplate', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="invoiceNumberPrefix">Invoice Number Prefix</Label>
              <Input
                id="invoiceNumberPrefix"
                value={settings.invoiceNumberPrefix}
                onChange={(e) => handleChange('invoiceNumberPrefix', e.target.value)}
                placeholder="INV"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultNotes">Default Invoice Notes</Label>
            <Textarea
              id="defaultNotes"
              value={settings.defaultNotes}
              onChange={(e) => handleChange('defaultNotes', e.target.value)}
              placeholder="Thank you for your business!"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="paymentInstructions">Payment Instructions</Label>
            <Textarea
              id="paymentInstructions"
              value={settings.paymentInstructions}
              onChange={(e) => handleChange('paymentInstructions', e.target.value)}
              placeholder="Please pay within the specified due date."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Tax Settings</span>
          </CardTitle>
          <CardDescription>
            Configure tax rates and tax-related preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="taxIdNumber">Tax ID Number</Label>
              <Input
                id="taxIdNumber"
                value={settings.taxIdNumber}
                onChange={(e) => handleChange('taxIdNumber', e.target.value)}
                placeholder="Enter your tax ID"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="taxInclusivePricing"
              checked={settings.taxInclusivePricing}
              onCheckedChange={(checked) => handleChange('taxInclusivePricing', checked)}
            />
            <Label htmlFor="taxInclusivePricing">Tax-inclusive pricing</Label>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Automation Settings</span>
          </CardTitle>
          <CardDescription>
            Configure automated billing processes and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoGenerateRentInvoices"
                checked={settings.autoGenerateRentInvoices}
                onCheckedChange={(checked) => handleChange('autoGenerateRentInvoices', checked)}
              />
              <Label htmlFor="autoGenerateRentInvoices">Auto-generate monthly rent invoices</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoApplyLateFees"
                checked={settings.autoApplyLateFees}
                onCheckedChange={(checked) => handleChange('autoApplyLateFees', checked)}
              />
              <Label htmlFor="autoApplyLateFees">Auto-apply late fees</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoSendReminders"
                checked={settings.autoSendReminders}
                onCheckedChange={(checked) => handleChange('autoSendReminders', checked)}
              />
              <Label htmlFor="autoSendReminders">Auto-send payment reminders</Label>
            </div>

            {settings.autoSendReminders && (
              <div className="ml-6">
                <Label htmlFor="reminderDaysBefore">Send reminder (days before due date)</Label>
                <Input
                  id="reminderDaysBefore"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.reminderDaysBefore}
                  onChange={(e) => handleChange('reminderDaysBefore', parseInt(e.target.value) || 3)}
                  className="w-32"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Email Notifications</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="emailOnInvoiceSent"
                checked={settings.emailOnInvoiceSent}
                onCheckedChange={(checked) => handleChange('emailOnInvoiceSent', checked)}
              />
              <Label htmlFor="emailOnInvoiceSent">Email when invoice is sent</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="emailOnPaymentReceived"
                checked={settings.emailOnPaymentReceived}
                onCheckedChange={(checked) => handleChange('emailOnPaymentReceived', checked)}
              />
              <Label htmlFor="emailOnPaymentReceived">Email when payment is received</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="emailOnPaymentOverdue"
                checked={settings.emailOnPaymentOverdue}
                onCheckedChange={(checked) => handleChange('emailOnPaymentOverdue', checked)}
              />
              <Label htmlFor="emailOnPaymentOverdue">Email when payment is overdue</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button type="button" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  )
}
