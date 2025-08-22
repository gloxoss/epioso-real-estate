import { Metadata } from 'next'
import { RolesSettings } from '@/components/settings/RolesSettings'

export const metadata: Metadata = {
  title: 'Roles & Permissions | Property Management',
  description: 'Configure roles and permissions for your team',
}

export default function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Roles & Permissions</h2>
        <p className="text-muted-foreground">
          Define custom roles and set granular permissions for your team members.
        </p>
      </div>
      <RolesSettings />
    </div>
  )
}
