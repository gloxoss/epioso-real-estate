import { requireAuthWithRole } from '@/lib/rbac'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PasswordForm } from '@/components/settings/PasswordForm'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfileSettingsPage() {
  const session = await requireAuthWithRole()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal account information and preferences"
        action={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>
            Your current profile information and account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-lg">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-medium">
                  {session.user.name || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{session.role}</Badge>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={session.user} />
        </CardContent>
      </Card>

      <Separator />

      {/* Password & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferences />
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account status and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export Account Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your account data
                </p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Deactivate Account</h4>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable your account access
                </p>
              </div>
              <Button variant="outline">Deactivate</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
