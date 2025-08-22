import { requireAuthWithRole } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { PageHeader } from '@/components/layout/PageHeader'
import { UnitForm } from '@/components/units/UnitForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditUnitPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUnitPage({ params }: EditUnitPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  // Get the unit data
  const unit = await unitsRepo.findById(id, session.organizationId)
  
  if (!unit) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Unit ${unit.unitNumber}`}
        description={`Update details for unit in ${unit.property.name}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/units/${unit.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Unit
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
              propertyId={unit.property.id}
              propertyName={unit.property.name}
              unit={{
                id: unit.id,
                unitNumber: unit.unitNumber,
                floor: unit.attributes?.floor || null,
                bedrooms: unit.attributes?.bedrooms || null,
                bathrooms: unit.attributes?.bathrooms || null,
                size: unit.attributes?.size || null,
                rentAmount: unit.rentAmount ? Number(unit.rentAmount) : null,
                depositAmount: unit.attributes?.depositAmount || null,
                status: unit.status,
                description: unit.attributes?.description || null,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
