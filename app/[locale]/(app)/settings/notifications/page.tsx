import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock,
  DollarSign,
  Home,
  Wrench,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'

const notificationCategories = [
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Invoice, payment, and financial notifications',
    icon: DollarSign,
    settings: [
      { id: 'invoice_created', name: 'New invoice created', email: true, push: true, sms: false },
      { id: 'payment_received', name: 'Payment received', email: true, push: true, sms: false },
      { id: 'payment_overdue', name: 'Payment overdue', email: true, push: true, sms: true },
      { id: 'payment_failed', name: 'Payment failed', email: true, push: true, sms: false },
    ]
  },
  {
    id: 'properties',
    name: 'Properties & Units',
    description: 'Property management and unit status updates',
    icon: Home,
    settings: [
      { id: 'unit_vacant', name: 'Unit becomes vacant', email: true, push: true, sms: false },
      { id: 'unit_occupied', name: 'Unit becomes occupied', email: true, push: false, sms: false },
      { id: 'lease_expiring', name: 'Lease expiring soon', email: true, push: true, sms: false },
      { id: 'property_added', name: 'New property added', email: false, push: true, sms: false },
    ]
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    description: 'Maintenance requests and work order updates',
    icon: Wrench,
    settings: [
      { id: 'maintenance_request', name: 'New maintenance request', email: true, push: true, sms: false },
      { id: 'maintenance_completed', name: 'Maintenance completed', email: true, push: false, sms: false },
      { id: 'urgent_maintenance', name: 'Urgent maintenance request', email: true, push: true, sms: true },
      { id: 'maintenance_overdue', name: 'Maintenance overdue', email: true, push: true, sms: false },
    ]
  },
  {
    id: 'tenants',
    name: 'Tenants & Contacts',
    description: 'Tenant communications and contact updates',
    icon: Users,
    settings: [
      { id: 'new_tenant', name: 'New tenant added', email: true, push: false, sms: false },
      { id: 'tenant_message', name: 'Message from tenant', email: true, push: true, sms: false },
      { id: 'lease_signed', name: 'Lease agreement signed', email: true, push: true, sms: false },
      { id: 'tenant_complaint', name: 'Tenant complaint filed', email: true, push: true, sms: false },
    ]
  },
  {
    id: 'documents',
    name: 'Documents & Reports',
    description: 'Document uploads and report generation',
    icon: FileText,
    settings: [
      { id: 'document_uploaded', name: 'Document uploaded', email: false, push: true, sms: false },
      { id: 'report_ready', name: 'Report generated', email: true, push: false, sms: false },
      { id: 'document_expiring', name: 'Document expiring', email: true, push: true, sms: false },
      { id: 'backup_completed', name: 'Backup completed', email: false, push: false, sms: false },
    ]
  },
]

const digestSettings = [
  { id: 'daily', name: 'Daily Summary', description: 'Daily overview of activities and pending items', enabled: true },
  { id: 'weekly', name: 'Weekly Report', description: 'Weekly performance and financial summary', enabled: true },
  { id: 'monthly', name: 'Monthly Analytics', description: 'Monthly business insights and trends', enabled: false },
]

export default async function NotificationsPage() {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Configure how and when you receive notifications about your properties"
      />

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="digest">Digest</TabsTrigger>
          <TabsTrigger value="quiet-hours">Quiet Hours</TabsTrigger>
        </TabsList>

        {/* Notification Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          {notificationCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between py-2">
                        <div>
                          <Label className="text-base">{setting.name}</Label>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Switch defaultChecked={setting.email} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Switch defaultChecked={setting.push} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <Switch defaultChecked={setting.sms} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure email delivery and formatting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={session.email}
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-format">Email Format</Label>
                  <Select defaultValue="html">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML (Rich formatting)</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Configure browser and mobile push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in your browser
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound with notifications
                  </p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications on desktop
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>

          {/* SMS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Configure SMS delivery for urgent notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent notifications via SMS
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                />
                <p className="text-xs text-muted-foreground">
                  SMS notifications are only sent for urgent alerts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digest Settings */}
        <TabsContent value="digest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Digest
              </CardTitle>
              <CardDescription>
                Configure periodic summary emails with key information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {digestSettings.map((digest) => (
                <div key={digest.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">{digest.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      {digest.description}
                    </p>
                  </div>
                  <Switch defaultChecked={digest.enabled} />
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="digest-time">Delivery Time</Label>
                  <Select defaultValue="09:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Include Charts</Label>
                    <p className="text-sm text-muted-foreground">
                      Include visual charts in digest emails
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiet Hours */}
        <TabsContent value="quiet-hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VolumeX className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
              <CardDescription>
                Set times when you don't want to receive non-urgent notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Pause non-urgent notifications during specified hours
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Select defaultValue="22:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                      <SelectItem value="23:00">11:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Select defaultValue="07:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-base">Exceptions</Label>
                <p className="text-sm text-muted-foreground">
                  These notifications will still be delivered during quiet hours
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="urgent-maintenance" defaultChecked />
                    <Label htmlFor="urgent-maintenance">Urgent maintenance requests</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="payment-failures" defaultChecked />
                    <Label htmlFor="payment-failures">Payment failures</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="security-alerts" defaultChecked />
                    <Label htmlFor="security-alerts">Security alerts</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>Save Notification Settings</Button>
      </div>
    </div>
  )
}
