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
  Shield, 
  Key, 
  Smartphone, 
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Download,
  Trash2,
  Plus
} from 'lucide-react'

// Mock data - replace with actual data fetching
const loginHistory = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'Casablanca, Morocco',
    ip: '192.168.1.100',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'success',
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Rabat, Morocco',
    ip: '192.168.1.101',
    timestamp: new Date('2024-01-14T15:45:00'),
    status: 'success',
  },
  {
    id: '3',
    device: 'Firefox on Linux',
    location: 'Unknown Location',
    ip: '203.0.113.1',
    timestamp: new Date('2024-01-13T09:15:00'),
    status: 'failed',
  },
]

const apiKeys = [
  {
    id: '1',
    name: 'Mobile App API',
    key: 'pk_live_••••••••••••••••••••••••••••',
    created: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15'),
    permissions: ['read:properties', 'write:units'],
  },
  {
    id: '2',
    name: 'Webhook Integration',
    key: 'sk_live_••••••••••••••••••••••••••••',
    created: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-14'),
    permissions: ['read:invoices', 'write:payments'],
  },
]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function SecurityPage() {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Settings"
        description="Manage your account security, authentication, and access controls"
      />

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="login-history">Login History</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Security
              </CardTitle>
              <CardDescription>
                Manage your password and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Strong Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Password Requirements</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password policies
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Two-factor authentication is disabled</p>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with 2FA using an authenticator app
                    </p>
                  </div>
                </div>
                <Button>Enable 2FA</Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Backup Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Generate backup codes to access your account if you lose your authenticator device
                </p>
                <Button variant="outline" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Backup Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Control your active sessions and login behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto-logout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after 24 hours of inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Remember Me</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow "Remember Me" option on login
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    You have 2 active sessions
                  </p>
                </div>
                <Button variant="outline">Manage Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage API keys for integrations and third-party access
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{apiKey.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {apiKey.permissions.length} permissions
                        </Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(apiKey.created)} • Last used {formatDate(apiKey.lastUsed)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="login-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Login History
              </CardTitle>
              <CardDescription>
                Review recent login attempts and account access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loginHistory.map((login) => (
                  <div key={login.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {login.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{login.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {login.location} • {login.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(login.timestamp)}</p>
                      <Badge variant={login.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {login.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Analytics & Usage Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve our service by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and updates
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Export</Label>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your data
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
