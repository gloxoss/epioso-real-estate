import { Metadata } from 'next'
import { TeamSettings } from '@/components/settings/TeamSettings'

export const metadata: Metadata = {
  title: 'Team Settings | Property Management',
  description: 'Manage team members and their access',
}

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Team</h2>
        <p className="text-muted-foreground">
          Invite team members and manage their roles and permissions.
        </p>
      </div>
      <TeamSettings />
    </div>
  )
}
