import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { propertiesRepo } from '@/repositories/properties'

interface EditPropertyPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: EditPropertyPageProps): Promise<Metadata> {
  const property = await propertiesRepo.findById(params.id, 'temp-org-id') // TODO: Get actual org ID

  if (!property) {
    return {
      title: 'Property Not Found | Property Management',
    }
  }

  return {
    title: `Edit ${property.name} | Property Management`,
    description: `Edit property details for ${property.name}`,
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const property = await propertiesRepo.findById(params.id, 'temp-org-id') // TODO: Get actual org ID

  if (!property) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${property.name}`}
        description="Update property details and settings"
      />
      <div className="max-w-2xl">
        <EditPropertyForm property={property} />
      </div>
    </div>
  )
}
