import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar,
  CreditCard,
  FileText,
  Settings,
  ExternalLink,
  Check,
  AlertTriangle,
  Plus
} from 'lucide-react'

const integrations = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept online payments and manage billing',
    icon: CreditCard,
    category: 'Payment',
    status: 'connected',
    features: ['Online payments', 'Subscription billing', 'Invoice automation'],
    setupRequired: false,
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Send transactional emails and notifications',
    icon: Mail,
    category: 'Communication',
    status: 'connected',
    features: ['Email notifications', 'Invoice delivery', 'Automated reminders'],
    setupRequired: false,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and communication',
    icon: MessageSquare,
    category: 'Communication',
    status: 'available',
    features: ['SMS notifications', 'Two-factor authentication', 'Emergency alerts'],
    setupRequired: true,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments and maintenance schedules',
    icon: Calendar,
    category: 'Productivity',
    status: 'available',
    features: ['Calendar sync', 'Appointment scheduling', 'Maintenance reminders'],
    setupRequired: true,
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature for lease agreements',
    icon: FileText,
    category: 'Documents',
    status: 'available',
    features: ['E-signatures', 'Document templates', 'Legal compliance'],
    setupRequired: true,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps and automate workflows',
    icon: Zap,
    category: 'Automation',
    status: 'available',
    features: ['Workflow automation', 'Data sync', 'Custom triggers'],
    setupRequired: true,
  },
]

const categories = ['All', 'Payment', 'Communication', 'Productivity', 'Documents', 'Automation']

function getStatusBadge(status: string) {
  switch (status) {
    case 'connected':
      return <Badge variant="default" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Connected</Badge>
    case 'setup-required':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Setup Required</Badge>
    default:
      return <Badge variant="outline">Available</Badge>
  }
}

export default async function IntegrationsPage() {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools and services to streamline your workflow"
      />

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {integrations.filter(i => i.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to connect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {categories.length - 1}
            </div>
            <p className="text-xs text-muted-foreground">
              Integration types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
                <CardDescription className="mt-2">
                  {integration.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="ghost" size="sm">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>
            Manage API keys and webhook configurations for custom integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">API Access</Label>
                <p className="text-sm text-muted-foreground">
                  Enable API access for third-party integrations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="api-key"
                  type="password"
                  value="sk_live_••••••••••••••••••••••••••••"
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline">Regenerate</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep your API key secure and never share it publicly
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input 
                id="webhook-url"
                value="https://your-domain.com/api/webhooks"
                placeholder="Enter webhook URL"
              />
              <p className="text-xs text-muted-foreground">
                URL where webhook events will be sent
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button>Save Changes</Button>
            <Button variant="outline">Test Webhook</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
