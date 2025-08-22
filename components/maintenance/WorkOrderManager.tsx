'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

interface WorkOrder {
  id: string
  ticketId: string
  title: string
  description: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: {
    id: string
    name: string
    type: 'internal' | 'vendor'
  }
  property: {
    id: string
    name: string
  }
  unit?: {
    id: string
    unitNumber: string
  }
  estimatedCost: number
  actualCost?: number
  estimatedHours: number
  actualHours?: number
  scheduledDate?: Date
  completedDate?: Date
  createdAt: Date
  materials: Array<{
    id: string
    name: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
  laborCosts: Array<{
    id: string
    description: string
    hours: number
    rate: number
    totalCost: number
  }>
}

interface WorkOrderManagerProps {
  workOrders: WorkOrder[]
  vendors: Array<{ id: string; name: string; specialty: string }>
  staff: Array<{ id: string; name: string; role: string }>
}

export function WorkOrderManager({ workOrders, vendors, staff }: WorkOrderManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createWorkOrderOpen, setCreateWorkOrderOpen] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.property.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-amber-100 text-amber-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Clock className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Work Orders</h2>
          <p className="text-muted-foreground">
            Manage detailed work orders and track progress
          </p>
        </div>
        <Dialog open={createWorkOrderOpen} onOpenChange={setCreateWorkOrderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Create a detailed work order from a maintenance ticket
              </DialogDescription>
            </DialogHeader>
            <CreateWorkOrderForm 
              vendors={vendors} 
              staff={staff}
              onClose={() => setCreateWorkOrderOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Property/Unit</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {workOrders.length === 0 ? 'No work orders yet' : 'No work orders match your search'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(workOrder.priority)}
                        <div>
                          <p className="font-medium">{workOrder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            WO-{workOrder.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{workOrder.property.name}</p>
                        {workOrder.unit && (
                          <p className="text-xs text-muted-foreground">
                            Unit {workOrder.unit.unitNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workOrder.assignedTo ? (
                        <div>
                          <p className="font-medium">{workOrder.assignedTo.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {workOrder.assignedTo.type}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workOrder.status)}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {formatCurrency(workOrder.actualCost || workOrder.estimatedCost, 'MAD')}
                        </p>
                        {workOrder.actualCost && workOrder.actualCost !== workOrder.estimatedCost && (
                          <p className="text-xs text-muted-foreground">
                            Est: {formatCurrency(workOrder.estimatedCost, 'MAD')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workOrder.scheduledDate ? (
                        <div>
                          <p className="font-medium">
                            {formatDate(workOrder.scheduledDate.toISOString())}
                          </p>
                          {workOrder.completedDate && (
                            <p className="text-xs text-green-600">
                              Completed {formatDate(workOrder.completedDate.toISOString())}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedWorkOrder(workOrder)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Work Order Details Modal */}
      {selectedWorkOrder && (
        <Dialog open={!!selectedWorkOrder} onOpenChange={() => setSelectedWorkOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
              <DialogDescription>
                WO-{selectedWorkOrder.id.slice(-6)} • {selectedWorkOrder.title}
              </DialogDescription>
            </DialogHeader>
            <WorkOrderDetails workOrder={selectedWorkOrder} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CreateWorkOrderForm({ 
  vendors, 
  staff, 
  onClose 
}: { 
  vendors: any[]
  staff: any[]
  onClose: () => void 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input placeholder="Work order title" />
        </div>
        <div>
          <Label>Priority</Label>
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea placeholder="Detailed work description" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estimated Cost</Label>
          <Input type="number" placeholder="0.00" />
        </div>
        <div>
          <Label>Estimated Hours</Label>
          <Input type="number" placeholder="0" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Create Work Order
        </Button>
      </div>
    </div>
  )
}

function WorkOrderDetails({ workOrder }: { workOrder: WorkOrder }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <Badge className={`mt-1 ${getStatusColor(workOrder.status)}`}>
            {workOrder.status.replace('_', ' ')}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
          <div className="flex items-center gap-2 mt-1">
            {getPriorityIcon(workOrder.priority)}
            <span className="capitalize">{workOrder.priority}</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Materials</Label>
                <p className="font-medium">
                  {formatCurrency(workOrder.materials.reduce((sum, m) => sum + m.totalCost, 0), 'MAD')}
                </p>
              </div>
              <div>
                <Label className="text-sm">Labor</Label>
                <p className="font-medium">
                  {formatCurrency(workOrder.laborCosts.reduce((sum, l) => sum + l.totalCost, 0), 'MAD')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions moved outside component
function getStatusColor(status: WorkOrder['status']) {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    case 'assigned':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-amber-100 text-amber-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityIcon(priority: WorkOrder['priority']) {
  switch (priority) {
    case 'urgent':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case 'medium':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'low':
      return <Clock className="h-4 w-4 text-green-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}
