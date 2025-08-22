'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/simple-separator'
import { Loader2, Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationSettings {
  email: {
    newTenant: boolean
    maintenanceRequests: boolean
    paymentReminders: boolean
    leaseExpirations: boolean
    systemUpdates: boolean
  }
  push: {
    urgentMaintenance: boolean
    paymentReceived: boolean
    newMessages: boolean
    systemAlerts: boolean
  }
  sms: {
    emergencyOnly: boolean
    paymentOverdue: boolean
  }
}

interface NotificationPreferencesProps {
  initialSettings?: Partial<NotificationSettings>
}

export function NotificationPreferences({ initialSettings }: NotificationPreferencesProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newTenant: initialSettings?.email?.newTenant ?? true,
      maintenanceRequests: initialSettings?.email?.maintenanceRequests ?? true,
      paymentReminders: initialSettings?.email?.paymentReminders ?? true,
      leaseExpirations: initialSettings?.email?.leaseExpirations ?? true,
      systemUpdates: initialSettings?.email?.systemUpdates ?? false,
    },
    push: {
      urgentMaintenance: initialSettings?.push?.urgentMaintenance ?? true,
      paymentReceived: initialSettings?.push?.paymentReceived ?? true,
      newMessages: initialSettings?.push?.newMessages ?? true,
      systemAlerts: initialSettings?.push?.systemAlerts ?? false,
    },
    sms: {
      emergencyOnly: initialSettings?.sms?.emergencyOnly ?? true,
      paymentOverdue: initialSettings?.sms?.paymentOverdue ?? false,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      })
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category: keyof NotificationSettings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <h4 className="font-medium">Email Notifications</h4>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-newTenant" className="text-sm">
                  New tenant applications
                </Label>
                <Switch
                  id="email-newTenant"
                  checked={settings.email.newTenant}
                  onCheckedChange={(checked) => updateSetting('email', 'newTenant', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-maintenance" className="text-sm">
                  Maintenance requests
                </Label>
                <Switch
                  id="email-maintenance"
                  checked={settings.email.maintenanceRequests}
                  onCheckedChange={(checked) => updateSetting('email', 'maintenanceRequests', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-payments" className="text-sm">
                  Payment reminders
                </Label>
                <Switch
                  id="email-payments"
                  checked={settings.email.paymentReminders}
                  onCheckedChange={(checked) => updateSetting('email', 'paymentReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-leases" className="text-sm">
                  Lease expirations
                </Label>
                <Switch
                  id="email-leases"
                  checked={settings.email.leaseExpirations}
                  onCheckedChange={(checked) => updateSetting('email', 'leaseExpirations', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-system" className="text-sm">
                  System updates
                </Label>
                <Switch
                  id="email-system"
                  checked={settings.email.systemUpdates}
                  onCheckedChange={(checked) => updateSetting('email', 'systemUpdates', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h4 className="font-medium">Push Notifications</h4>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-urgent" className="text-sm">
                  Urgent maintenance requests
                </Label>
                <Switch
                  id="push-urgent"
                  checked={settings.push.urgentMaintenance}
                  onCheckedChange={(checked) => updateSetting('push', 'urgentMaintenance', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-payment" className="text-sm">
                  Payment received
                </Label>
                <Switch
                  id="push-payment"
                  checked={settings.push.paymentReceived}
                  onCheckedChange={(checked) => updateSetting('push', 'paymentReceived', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-messages" className="text-sm">
                  New messages
                </Label>
                <Switch
                  id="push-messages"
                  checked={settings.push.newMessages}
                  onCheckedChange={(checked) => updateSetting('push', 'newMessages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-alerts" className="text-sm">
                  System alerts
                </Label>
                <Switch
                  id="push-alerts"
                  checked={settings.push.systemAlerts}
                  onCheckedChange={(checked) => updateSetting('push', 'systemAlerts', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <h4 className="font-medium">SMS Notifications</h4>
            </div>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-emergency" className="text-sm">
                  Emergency situations only
                </Label>
                <Switch
                  id="sms-emergency"
                  checked={settings.sms.emergencyOnly}
                  onCheckedChange={(checked) => updateSetting('sms', 'emergencyOnly', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-overdue" className="text-sm">
                  Payment overdue alerts
                </Label>
                <Switch
                  id="sms-overdue"
                  checked={settings.sms.paymentOverdue}
                  onCheckedChange={(checked) => updateSetting('sms', 'paymentOverdue', checked)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
