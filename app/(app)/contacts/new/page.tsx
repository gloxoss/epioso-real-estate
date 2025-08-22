import { Metadata } from 'next'
import { CreateContact } from '@/components/contacts/CreateContact'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'New Contact | Property Management',
  description: 'Add a new contact to your directory',
}

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Contact"
        description="Create a new contact in your directory"
      />
      <div className="max-w-2xl">
        <CreateContact />
      </div>
    </div>
  )
}
