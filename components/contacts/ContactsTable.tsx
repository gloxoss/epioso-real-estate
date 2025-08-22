import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { formatDate } from '@/lib/format'

interface Contact {
  id: string
  type: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt: Date
}

interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

interface ContactsTableProps {
  contacts: Contact[]
  pagination: Pagination
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

function getContactTypeIcon(type: string) {
  switch (type) {
    case 'tenant':
    case 'owner':
    case 'agent':
    case 'buyer':
      return <Users className="h-4 w-4" />
    default:
      return <Users className="h-4 w-4" />
  }
}

export function ContactsTable({ contacts, pagination }: ContactsTableProps) {
  return (
    <div className="space-y-6">
      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getContactTypeIcon(contact.type)}
                      <div>
                        <div className="font-medium">{contact.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getContactTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {contact.address && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{contact.address}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(contact.createdAt.toISOString())}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} contacts
          </div>
          
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            )}
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                const isActive = pageNum === pagination.page
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={`?page=${pageNum}`}>
                      {pageNum}
                    </Link>
                  </Button>
                )
              })}
            </div>
            
            {pagination.page < pagination.totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page + 1}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
