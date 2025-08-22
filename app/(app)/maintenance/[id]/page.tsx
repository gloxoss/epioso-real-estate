import { requireAuthWithRole } from '@/lib/rbac'
import { ticketsRepo } from '@/repositories/tickets'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  FileText,
  Home,
  MessageSquare,
  User,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Camera,
  Upload,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

// Mock data - replace with actual data fetching
async function getTicketData(ticketId: string, organizationId: string) {
  // This would be replaced with actual database queries
  return {
    ticket: {
      id: ticketId,
      title: 'Leaking Faucet in Kitchen',
      description: 'The kitchen faucet in unit 2A has been leaking for the past week. Water is dripping constantly and causing water damage to the cabinet below.',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      category: 'plumbing',
      createdAt: new Date('2024-01-10T10:00:00'),
      updatedAt: new Date('2024-01-12T14:30:00'),
      dueDate: new Date('2024-01-15T17:00:00'),
      assignedTo: 'John Smith',
      assignedToEmail: 'john.smith@maintenance.com',
      reportedBy: 'Sarah Johnson',
      reportedByEmail: 'sarah.johnson@email.com',
      estimatedCost: 150.00,
      actualCost: null,
      estimatedHours: 2,
      actualHours: null,
      property: {
        id: 'prop-1',
        name: 'Sunset Apartments',
        address: '123 Main St, Casablanca'
      },
      unit: {
        id: 'unit-1',
        number: '2A',
        type: 'apartment'
      }
    },
    updates: [
      {
        id: '1',
        message: 'Ticket created and assigned to maintenance team',
        author: 'System',
        createdAt: new Date('2024-01-10T10:00:00'),
        type: 'system'
      },
      {
        id: '2',
        message: 'Inspected the unit. Confirmed the faucet needs replacement. Ordered new parts.',
        author: 'John Smith',
        createdAt: new Date('2024-01-11T09:15:00'),
        type: 'update'
      },
      {
        id: '3',
        message: 'Parts have arrived. Scheduled repair for tomorrow morning.',
        author: 'John Smith',
        createdAt: new Date('2024-01-12T14:30:00'),
        type: 'update'
      }
    ],
    attachments: [
      {
        id: '1',
        name: 'kitchen-faucet-damage.jpg',
        url: '/api/files/kitchen-faucet-damage.jpg',
        type: 'image',
        size: 2.4,
        uploadedAt: new Date('2024-01-10T10:05:00'),
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: '2',
        name: 'repair-estimate.pdf',
        url: '/api/files/repair-estimate.pdf',
        type: 'document',
        size: 0.8,
        uploadedAt: new Date('2024-01-11T09:20:00'),
        uploadedBy: 'John Smith'
      }
    ]
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>
    case 'high':
      return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>
    case 'medium':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
    case 'low':
      return <Badge variant="outline">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return <Badge variant="secondary">Open</Badge>
    case 'in_progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getTicketData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { ticket, updates, attachments } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.title}
        description={`Ticket #${ticket.id} • ${ticket.property.name} - Unit ${ticket.unit.number}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/maintenance">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Maintenance
              </Link>
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Ticket
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Ticket Details
                  </CardTitle>
                  <CardDescription>
                    Created {formatDate(ticket.createdAt.toISOString())}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{ticket.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground capitalize">{ticket.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.dueDate.toISOString())}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Cost</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(ticket.estimatedCost)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Hours</Label>
                  <p className="text-sm text-muted-foreground">{ticket.estimatedHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Updates and Attachments */}
          <Tabs defaultValue="updates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
              <TabsTrigger value="attachments">Attachments ({attachments.length})</TabsTrigger>
              <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="updates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Activity Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                      <div className="rounded-full bg-muted p-2">
                        {update.type === 'system' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{update.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(update.createdAt.toISOString())}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.message}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Update Form */}
                  <div className="pt-4 border-t">
                    <Label htmlFor="new-update" className="text-sm font-medium">Add Update</Label>
                    <Textarea 
                      id="new-update"
                      placeholder="Add a comment or update..."
                      className="mt-2"
                    />
                    <Button className="mt-2" size="sm">Post Update</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Attachments
                    </CardTitle>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            {attachment.type === 'image' ? (
                              <Camera className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.size} MB • Uploaded by {attachment.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time-tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Estimated Hours</Label>
                      <p className="text-2xl font-bold">{ticket.estimatedHours}h</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Actual Hours</Label>
                      <p className="text-2xl font-bold">{ticket.actualHours || '—'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Log Time</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="hours">Hours Worked</Label>
                        <Input id="hours" type="number" step="0.5" placeholder="2.5" />
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="work-description">Work Description</Label>
                      <Textarea 
                        id="work-description"
                        placeholder="Describe the work performed..."
                      />
                    </div>
                    <Button>Log Time</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property & Unit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Property</Label>
                <p className="font-medium">{ticket.property.name}</p>
                <p className="text-sm text-muted-foreground">{ticket.property.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Unit</Label>
                <p className="font-medium">Unit {ticket.unit.number}</p>
                <p className="text-sm text-muted-foreground capitalize">{ticket.unit.type}</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/properties/${ticket.property.id}`}>
                  View Property Details
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Assigned To</Label>
                <p className="font-medium">{ticket.assignedTo}</p>
                <p className="text-sm text-muted-foreground">{ticket.assignedToEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Reported By</Label>
                <p className="font-medium">{ticket.reportedBy}</p>
                <p className="text-sm text-muted-foreground">{ticket.reportedByEmail}</p>
              </div>
              <Button variant="outline" className="w-full">
                Reassign Ticket
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Update Costs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Tenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
