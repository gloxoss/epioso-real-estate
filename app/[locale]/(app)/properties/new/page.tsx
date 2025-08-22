import { Metadata } from 'next'
import { AddProperty } from '@/components/properties/AddProperty'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'New Property | Property Management',
  description: 'Add a new property to your portfolio',
}

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Property"
        description="Create a new property in your portfolio"
      />
      <div className="max-w-2xl">
        <AddProperty />
      </div>
    </div>
  )
}
