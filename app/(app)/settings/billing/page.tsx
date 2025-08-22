import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { BillingSettingsForm } from '@/components/settings/BillingSettingsForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Receipt, 
  Settings, 
  FileText,
  DollarSign,
  Calendar,
  Mail,
  Shield,
  Zap
} from 'lucide-react'

interface BillingSettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BillingSettingsPage({ searchParams }: BillingSettingsPageProps) {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Settings"
        description="Configure billing preferences, payment methods, and invoice settings"
        action={
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Currency & Locale</span>
                </CardTitle>
                <CardDescription>
                  Set your default currency and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Currency</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">MAD - Moroccan Dirham</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Number Format</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    1,234.56 MAD
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Format</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    DD/MM/YYYY
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Billing Cycle</span>
                </CardTitle>
                <CardDescription>
                  Configure default billing periods and due dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Payment Terms</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">30 days</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Late Fee Grace Period</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">7 days</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Billing Day</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    1st of each month
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Methods</span>
                </CardTitle>
                <CardDescription>
                  Configure accepted payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Cash</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Bank Transfer</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Check</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">Credit Card</span>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">Stripe</span>
                    </div>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Configure Payment Methods
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security & Compliance</span>
                </CardTitle>
                <CardDescription>
                  Payment security and compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PCI Compliance</span>
                    <Badge variant="secondary">Not Required</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Encryption</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audit Logging</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoice Settings */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Invoice Templates</span>
                </CardTitle>
                <CardDescription>
                  Customize invoice appearance and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Template</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">Professional</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    No logo uploaded
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Invoice Numbering</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    INV-{new Date().getFullYear()}-0001
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Customize Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Invoice Defaults</span>
                </CardTitle>
                <CardDescription>
                  Set default values for new invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Notes</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Thank you for your business!
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Instructions</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Please pay within 30 days
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Late Fee Amount</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">50 MAD</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="taxes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Tax Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure tax rates and tax-related settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Tax Rate</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">20% VAT</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tax ID Number</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Not configured
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tax Inclusive Pricing</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="outline">Disabled</Badge>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Configure Taxes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Tax Reporting</span>
                </CardTitle>
                <CardDescription>
                  Tax reporting and compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Reporting Period</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="secondary">Monthly</Badge>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Next Report Due</label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Auto-generate Reports</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="outline">Disabled</Badge>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Settings */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Automation</span>
                </CardTitle>
                <CardDescription>
                  Automated email notifications and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Invoice Sent</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Received</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Overdue</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Reminder</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Configure Emails
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Workflow Automation</span>
                </CardTitle>
                <CardDescription>
                  Automated billing workflows and processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-generate Rent Invoices</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-apply Late Fees</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-send Statements</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-reconcile Payments</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Configure Workflows
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
