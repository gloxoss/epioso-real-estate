import { requireAuthWithRole } from '@/lib/rbac'
import { contactsRepo } from '@/repositories/contacts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  ArrowLeft,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

function getContactTypeColor(type: string) {
  const colors: Record<string, string> = {
    tenant: 'bg-blue-100 text-blue-800',
    owner: 'bg-green-100 text-green-800',
    vendor: 'bg-purple-100 text-purple-800',
    agent: 'bg-yellow-100 text-yellow-800',
    emergency: 'bg-red-100 text-red-800',
    buyer: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[type] || colors.other
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const contact = await contactsRepo.findById(id, session.organizationId)
  
  if (!contact) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contact.name}
        description={`${contact.type} contact`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/contacts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contacts
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/contacts/${contact.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact
              </Link>
            </Button>
          </div>
        }
      />

      {/* Contact Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getContactTypeColor(contact.type)}>
              {contact.type}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contact.email ? (
              <a 
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {contact.email}
              </a>
            ) : (
              <span className="text-muted-foreground">No email</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contact.phone ? (
              <a 
                href={`tel:${contact.phone}`}
                className="text-blue-600 hover:underline"
              >
                {contact.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">No phone</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {formatDate(contact.createdAt.toISOString())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contact.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div>{contact.address}</div>
              </div>
            </div>
          )}
          
          {contact.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Contact created on {formatDate(contact.createdAt.toISOString())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      {contact.expenses && contact.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contact.expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(expense.createdAt.toISOString())}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(Number(expense.amount))}
                  </div>
                </div>
              ))}
              
              {contact.expenses.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All Expenses ({contact.expenses.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
