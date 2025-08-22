import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  ArrowRight,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/format'

interface MaintenanceTicket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  unitNumber?: string
  estimatedCost?: number
  actualCost?: number
}

interface PropertyMaintenanceTrackerProps {
  propertyId: string
  tickets: MaintenanceTicket[]
  dictionary?: any
  locale?: string
}

export function PropertyMaintenanceTracker({ propertyId, tickets, dictionary, locale = 'en' }: PropertyMaintenanceTrackerProps) {
  // Add safety check for tickets array
  const safeTickets = tickets || []

  const openTickets = safeTickets.filter(t => ['open', 'in_progress'].includes(t.status))
  const urgentTickets = safeTickets.filter(t => t.priority === 'urgent')
  const completedThisMonth = safeTickets.filter(t =>
    t.status === 'completed' &&
    new Date(t.updatedAt).getMonth() === new Date().getMonth()
  )

  const getPriorityVariant = (priority: MaintenanceTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: MaintenanceTicket['status']) => {
    switch (status) {
      case 'open':
        return Clock
      case 'in_progress':
        return Wrench
      case 'completed':
        return CheckCircle
      case 'cancelled':
        return AlertTriangle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: MaintenanceTicket['status']) => {
    switch (status) {
      case 'open':
        return 'text-blue-600'
      case 'in_progress':
        return 'text-amber-600'
      case 'completed':
        return 'text-green-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Maintenance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary?.maintenance?.openTickets || "Open Tickets"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.maintenance?.requireAttention || "Require attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary?.maintenance?.urgentIssues || "Urgent Issues"}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.maintenance?.highPriority || "High priority"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary?.maintenance?.completed || "Completed"}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary?.maintenance?.thisMonth || "This month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary?.maintenance?.responseTime || "Response Time"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <Progress value={85} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {dictionary?.maintenance?.averageResponse || "Average response"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {dictionary?.maintenance?.activeMaintenanceTickets || "Active Maintenance Tickets"}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {dictionary?.maintenance?.filter || "Filter"}
              </Button>
              <Button asChild>
                <Link href={`/maintenance/new?property=${propertyId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {dictionary?.maintenance?.newTicket || "New Ticket"}
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {openTickets.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {dictionary?.maintenance?.allCaughtUp || "All caught up!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {dictionary?.maintenance?.noOpenTickets || "No open maintenance tickets for this property."}
              </p>
              <Button asChild>
                <Link href={`/maintenance/new?property=${propertyId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {dictionary?.maintenance?.reportNewIssue || "Report New Issue"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {openTickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status)
                const daysSinceCreated = Math.floor(
                  (new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(ticket.status)}`} />
                          <h4 className="font-medium">{ticket.title}</h4>
                          <Badge variant={getPriorityVariant(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {daysSinceCreated === 0 ? (dictionary?.maintenance?.today || 'Today') : `${daysSinceCreated} ${dictionary?.maintenance?.daysAgo || 'days ago'}`}
                          </span>
                          {ticket.unitNumber && (
                            <span>{dictionary?.maintenance?.unit || 'Unit'} {ticket.unitNumber}</span>
                          )}
                          {ticket.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/maintenance/${ticket.id}`}>
                            {dictionary?.maintenance?.view || 'View'}
                          </Link>
                        </Button>
                        {ticket.status === 'open' && (
                          <Button size="sm" asChild>
                            <Link href={`/maintenance/${ticket.id}/assign`}>
                              {dictionary?.maintenance?.assign || 'Assign'}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {ticket.estimatedCost && (
                      <div className="text-xs text-muted-foreground">
                        {dictionary?.maintenance?.estimatedCost || 'Estimated cost'}: MAD {ticket.estimatedCost.toLocaleString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance History & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {dictionary?.maintenance?.recentCompletedWork || "Recent Completed Work"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedThisMonth.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  {dictionary?.maintenance?.noCompletedWork || "No completed work this month"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedThisMonth.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {dictionary?.maintenance?.completedOn || 'Completed'} {formatDate(ticket.updatedAt.toISOString())}
                      </p>
                    </div>
                    {ticket.actualCost && (
                      <div className="text-right">
                        <p className="font-medium">MAD {ticket.actualCost.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {dictionary?.maintenance?.maintenanceInsights || "Maintenance Insights"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {dictionary?.maintenance?.mostCommonIssues || "Most Common Issues"}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {dictionary?.maintenance?.categories?.plumbing || "Plumbing"} (40%) • {dictionary?.maintenance?.categories?.hvac || "HVAC"} (25%) • {dictionary?.maintenance?.categories?.electrical || "Electrical"} (20%)
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg dark:bg-green-950/20">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {dictionary?.maintenance?.averageResolutionTime || "Average Resolution Time"}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                3.2 days (15% {dictionary?.maintenance?.improvementFromLastMonth || "improvement from last month"})
              </p>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href={`/reports/maintenance?property=${propertyId}`}>
                {dictionary?.maintenance?.viewDetailedReport || "View Detailed Report"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
