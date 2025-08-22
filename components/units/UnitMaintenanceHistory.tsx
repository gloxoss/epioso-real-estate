'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/format'
import { useState } from 'react'

interface MaintenanceTicket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
}

interface UnitMaintenanceHistoryProps {
  unitId: string
  tickets: MaintenanceTicket[]
  allTickets?: MaintenanceTicket[] // Include completed tickets
}

export function UnitMaintenanceHistory({ unitId, tickets, allTickets: providedAllTickets }: UnitMaintenanceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Use provided all tickets or fall back to just the active tickets
  const allTickets = providedAllTickets || tickets
  
  const filteredTickets = allTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openTickets = allTickets.filter(t => ['open', 'in_progress'].includes(t.status))
  const completedTickets = allTickets.filter(t => t.status === 'completed')
  const totalCost = completedTickets.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0)

  // Calculate real average resolution time from completed tickets
  const avgResolutionTime = completedTickets.length > 0
    ? completedTickets.reduce((sum, ticket) => {
        const resolutionDays = Math.floor(
          (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        return sum + Math.max(0, resolutionDays)
      }, 0) / completedTickets.length
    : 0

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
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Total resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost, 'MAD')}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime > 0 ? `${Math.round(avgResolutionTime)}d` : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Average time to fix
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance History</CardTitle>
            <Button asChild>
              <Link href={`/maintenance/new?unit=${unitId}`}>
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Link>
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search maintenance issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {allTickets.length === 0 ? 'No maintenance history' : 'No tickets found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {allTickets.length === 0 
                  ? 'This unit has no maintenance records yet.'
                  : `No tickets match your search for "${searchTerm}".`
                }
              </p>
              {allTickets.length === 0 && (
                <Button asChild>
                  <Link href={`/maintenance/new?unit=${unitId}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Report First Issue
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
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
                          <Badge variant="outline">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(ticket.createdAt.toISOString())}
                          </span>
                          {ticket.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.assignedTo}
                            </span>
                          )}
                          {ticket.actualCost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(ticket.actualCost, 'MAD')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/maintenance/${ticket.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {ticket.status === 'completed' && ticket.updatedAt && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded dark:bg-green-950/20">
                        Completed {formatDate(ticket.updatedAt.toISOString())}
                        {ticket.actualCost && ` • Cost: ${formatCurrency(ticket.actualCost, 'MAD')}`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Most Common Issues
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Plumbing (50%) • HVAC (30%) • Electrical (20%)
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg dark:bg-green-950/20">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Maintenance Schedule
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Next HVAC service due in 2 months
              </p>
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/reports/maintenance?unit=${unitId}`}>
              View Detailed Maintenance Report
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
