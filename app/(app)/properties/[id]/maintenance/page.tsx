import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { ticketsRepo } from '@/repositories/tickets'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Building2,
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/format'

interface PropertyMaintenancePageProps {
  params: Promise<{ id: string }>
}

async function getPropertyMaintenanceData(propertyId: string, organizationId: string) {
  const [property, ticketsResult] = await Promise.all([
    propertiesRepo.findById(propertyId, organizationId),
    ticketsRepo.list(organizationId, { propertyId }, { page: 1, perPage: 100 })
  ])

  if (!property) {
    return null
  }

  const tickets = ticketsResult.data.map(ticket => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    category: ticket.category || 'general',
    unit: ticket.unit?.unitNumber || 'N/A',
    reportedBy: 'System', // TODO: Get actual reporter name
    assignedTo: ticket.assignedTo?.user?.name || null,
    createdAt: ticket.createdAt,
    dueDate: ticket.dueDate,
    estimatedCost: ticket.cost ? Number(ticket.cost) : 0,
    actualCost: null // TODO: Add actual cost tracking
  }))

  const maintenanceStats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    completedTickets: tickets.filter(t => t.status === 'completed').length,
    urgentTickets: tickets.filter(t => t.priority === 'urgent').length,
    totalCost: tickets.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost), 0),
    averageResolutionTime: 3.5 // days
  }

  // Calculate category stats from real data
  const categoryMap = new Map()
  tickets.forEach(ticket => {
    const category = ticket.category || 'General'
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { category, count: 0, cost: 0 })
    }
    const stats = categoryMap.get(category)
    stats.count += 1
    stats.cost += ticket.actualCost || ticket.estimatedCost
  })

  const categoryStats = Array.from(categoryMap.values())

  return {
    property,
    tickets,
    maintenanceStats,
    categoryStats
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
    case 'scheduled':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Scheduled</Badge>
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function PropertyMaintenancePage({ params }: PropertyMaintenancePageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getPropertyMaintenanceData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, tickets, maintenanceStats, categoryStats } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Maintenance - ${property.name}`}
        description="Manage maintenance requests and work orders"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Link>
            </Button>
          </div>
        }
      />

      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Property Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="font-medium">{maintenanceStats.totalTickets}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
              <p className="font-medium">{maintenanceStats.averageResolutionTime} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {maintenanceStats.openTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {maintenanceStats.inProgressTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {maintenanceStats.completedTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(maintenanceStats.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tickets */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Tickets ({maintenanceStats.openTickets + maintenanceStats.inProgressTickets})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({maintenanceStats.completedTickets})</TabsTrigger>
          <TabsTrigger value="all">All Tickets ({maintenanceStats.totalTickets})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-3">
            {tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'scheduled').map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{ticket.title}</h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          <span>Unit {ticket.unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{ticket.assignedTo || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Due {formatDate(ticket.dueDate.toISOString())}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{formatCurrency(ticket.estimatedCost)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/maintenance/${ticket.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-3">
            {tickets.filter(t => t.status === 'completed').map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{ticket.title}</h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          <span>Unit {ticket.unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{ticket.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Completed {formatDate(ticket.createdAt.toISOString())}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{formatCurrency(ticket.actualCost || ticket.estimatedCost)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/maintenance/${ticket.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{ticket.title}</h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          <span>Unit {ticket.unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{ticket.assignedTo || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Created {formatDate(ticket.createdAt.toISOString())}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{formatCurrency(ticket.actualCost || ticket.estimatedCost)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/maintenance/${ticket.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Category</CardTitle>
                <CardDescription>Breakdown of maintenance requests by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">{category.count} tickets</p>
                      </div>
                      <p className="font-medium">{formatCurrency(category.cost)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key maintenance performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Resolution Time</span>
                  <span className="font-medium">{maintenanceStats.averageResolutionTime} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">
                    {Math.round((maintenanceStats.completedTickets / maintenanceStats.totalTickets) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Cost per Ticket</span>
                  <span className="font-medium">
                    {formatCurrency(maintenanceStats.totalCost / maintenanceStats.totalTickets)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Urgent Tickets</span>
                  <span className="font-medium">{maintenanceStats.urgentTickets}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common maintenance management actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/maintenance/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Link>
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/properties/${property.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Property Overview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
