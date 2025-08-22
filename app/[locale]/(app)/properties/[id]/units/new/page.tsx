import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { PageHeader } from '@/components/layout/PageHeader'
import { UnitForm } from '@/components/units/UnitForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewUnitPageProps {
  params: Promise<{ id: string }>
}

export default async function NewUnitPage({ params }: NewUnitPageProps) {
  const session = await requireAuthWithRole()
  const { id: propertyId } = await params
  
  // Verify the property exists and belongs to the organization
  const property = await propertiesRepo.findById(propertyId, session.organizationId)
  
  if (!property) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Unit"
        description={`Create a new unit for ${property.name}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/properties/${propertyId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Link>
          </Button>
        }
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <UnitForm 
              propertyId={propertyId}
              propertyName={property.name}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
