import { requireAuthWithRole } from '@/lib/rbac'
import { contactsRepo } from '@/repositories/contacts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContactForm } from '@/components/contacts/ContactForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditContactPageProps {
  params: Promise<{ id: string }>
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  // Get the contact data
  const contact = await contactsRepo.findById(id, session.organizationId)
  
  if (!contact) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${contact.name}`}
        description="Update contact information"
        action={
          <Button variant="outline" asChild>
            <Link href={`/contacts/${contact.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact
            </Link>
          </Button>
        }
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm 
              contact={{
                id: contact.id,
                type: contact.type,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                address: contact.address,
                notes: contact.notes,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
