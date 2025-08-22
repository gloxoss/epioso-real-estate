'use client'

import { useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/format'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Wrench
} from 'lucide-react'
import Link from 'next/link'

interface MaintenanceTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    name: string
  }
  unit?: {
    id: string
    unitNumber: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  tenantName?: string
  tenantEmail?: string
  tenantPhone?: string
}

interface TicketsTableProps {
  tickets: MaintenanceTicket[]
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || colors.open
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }
  return colors[priority] || colors.medium
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <Clock className="h-4 w-4" />
    case 'in_progress':
      return <Wrench className="h-4 w-4" />
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'cancelled':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getCategoryIcon(category: string) {
  // You can expand this with more specific icons
  return <Wrench className="h-4 w-4" />
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedTickets = [...tickets].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]

    if (sortBy === 'priority') {
      const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
      aValue = priorityOrder[a.priority]
      bValue = priorityOrder[b.priority]
    }

    if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt).getTime()
      bValue = new Date(b.createdAt).getTime()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No maintenance tickets</h3>
        <p className="text-muted-foreground">
          No maintenance tickets have been created yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex gap-2">
        <Button
          variant={sortBy === 'createdAt' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            if (sortBy === 'createdAt') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            } else {
              setSortBy('createdAt')
              setSortOrder('desc')
            }
          }}
        >
          Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          variant={sortBy === 'priority' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            if (sortBy === 'priority') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            } else {
              setSortBy('priority')
              setSortOrder('desc')
            }
          }}
        >
          Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
        <Button
          variant={sortBy === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            if (sortBy === 'status') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            } else {
              setSortBy('status')
              setSortOrder('asc')
            }
          }}
        >
          Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Property/Unit</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </div>
                    {ticket.tenantName && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Tenant: {ticket.tenantName}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    {ticket.property && (
                      <div className="font-medium text-sm">{ticket.property.name}</div>
                    )}
                    {ticket.unit && (
                      <div className="text-sm text-muted-foreground">
                        Unit {ticket.unit.unitNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(ticket.category)}
                    <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {formatDate(ticket.createdAt)}
                  </div>
                </TableCell>
                
                <TableCell>
                  {ticket.assignedTo ? (
                    <div className="text-sm">{ticket.assignedTo.name}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Unassigned</div>
                  )}
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
                        <Link href={`/maintenance/${ticket.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/maintenance/${ticket.id}/edit`}>
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
      </div>
    </div>
  )
}
