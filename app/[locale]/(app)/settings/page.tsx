import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building, 
  CreditCard, 
  Globe, 
  Shield, 
  Bell,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const settingsCategories = [
  {
    title: 'Profile',
    description: 'Manage your personal account settings and preferences',
    icon: User,
    href: '/settings/profile',
    items: ['Personal information', 'Password', 'Notifications'],
  },
  {
    title: 'Organization',
    description: 'Configure your organization settings and team management',
    icon: Building,
    href: '/settings/organization',
    items: ['Company details', 'Team members', 'Roles & permissions'],
    badge: 'Admin Only',
  },
  {
    title: 'Billing',
    description: 'Manage your subscription and billing information',
    icon: CreditCard,
    href: '/settings/billing',
    items: ['Subscription plan', 'Payment methods', 'Billing history'],
  },
  {
    title: 'Localization',
    description: 'Language, timezone, and regional preferences',
    icon: Globe,
    href: '/settings/localization',
    items: ['Language', 'Timezone', 'Currency', 'Date format'],
  },
  {
    title: 'Security',
    description: 'Security settings and access management',
    icon: Shield,
    href: '/settings/security',
    items: ['Two-factor authentication', 'API keys', 'Login history'],
    badge: 'Coming Soon',
  },
  {
    title: 'Notifications',
    description: 'Configure email and in-app notification preferences',
    icon: Bell,
    href: '/settings/notifications',
    items: ['Email notifications', 'Push notifications', 'Digest settings'],
    badge: 'Coming Soon',
  },
]

export default async function SettingsPage() {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, organization, and application preferences"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {settingsCategories.map((category) => {
          const Icon = category.icon
          const isDisabled = category.badge === 'Coming Soon'
          const isAdminOnly = category.badge === 'Admin Only' && session.role !== 'admin'
          
          return (
            <Card 
              key={category.href} 
              className={`transition-colors hover:bg-accent/50 ${
                isDisabled || isAdminOnly ? 'opacity-60' : 'cursor-pointer'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      {category.badge && (
                        <Badge 
                          variant={category.badge === 'Coming Soon' ? 'secondary' : 'outline'}
                          className="mt-1"
                        >
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!isDisabled && !isAdminOnly && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  {isDisabled ? (
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  ) : isAdminOnly ? (
                    <Button variant="outline" disabled className="w-full">
                      Admin Access Required
                    </Button>
                  ) : (
                    <Button variant="outline" asChild className="w-full">
                      <Link href={category.href}>
                        Configure
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings and actions you might need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild>
              <Link href="/settings/profile">
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Link>
            </Button>
            
            {session.role === 'admin' && (
              <Button variant="outline" asChild>
                <Link href="/settings/organization">
                  <Building className="h-4 w-4 mr-2" />
                  Manage Team
                </Link>
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <Link href="/settings/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                View Billing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {session.user.name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <Badge variant="secondary" className="w-fit">
                {session.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Organization ID</p>
              <p className="text-sm text-muted-foreground font-mono">
                {session.organizationId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
