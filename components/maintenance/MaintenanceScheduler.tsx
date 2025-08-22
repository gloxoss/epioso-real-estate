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
  Calendar as CalendarComponent,
  CalendarProps,
} from '@/components/ui/calendar'
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Repeat,
  User,
  Building2,
  Wrench,
  Filter,
  Search
} from 'lucide-react'
import { formatDate } from '@/lib/format'

interface ScheduledMaintenance {
  id: string
  title: string
  description: string
  type: 'preventive' | 'inspection' | 'cleaning' | 'repair' | 'replacement'
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'one-time'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  property: {
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
    type: 'internal' | 'vendor'
  }
  nextDueDate: Date
  lastCompletedDate?: Date
  estimatedDuration: number // hours
  estimatedCost: number
  actualCost?: number
  createdAt: Date
  completedCount: number
  notes?: string
}

interface MaintenanceSchedulerProps {
  scheduledItems: ScheduledMaintenance[]
  properties: Array<{ id: string; name: string }>
  vendors: Array<{ id: string; name: string; specialty: string }>
  staff: Array<{ id: string; name: string; role: string }>
}

export function MaintenanceScheduler({ 
  scheduledItems, 
  properties, 
  vendors, 
  staff 
}: MaintenanceSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScheduledMaintenance | null>(null)

  const filteredItems = scheduledItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesType && matchesStatus
  })

  const getStatusColor = (status: ScheduledMaintenance['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-amber-100 text-amber-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: ScheduledMaintenance['type']) => {
    switch (type) {
      case 'preventive':
        return <Wrench className="h-4 w-4 text-blue-500" />
      case 'inspection':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cleaning':
        return <Clock className="h-4 w-4 text-purple-500" />
      case 'repair':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'replacement':
        return <Repeat className="h-4 w-4 text-red-500" />
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />
    }
  }

  const getItemsForDate = (date: Date) => {
    return filteredItems.filter(item => {
      const itemDate = new Date(item.nextDueDate)
      return itemDate.toDateString() === date.toDateString()
    })
  }

  const upcomingItems = filteredItems
    .filter(item => item.nextDueDate >= new Date())
    .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())
    .slice(0, 10)

  const overdueItems = filteredItems.filter(item => 
    item.nextDueDate < new Date() && item.status !== 'completed'
  )

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Maintenance Scheduler</h2>
          <p className="text-muted-foreground">
            Schedule and track preventive maintenance tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
                <DialogDescription>
                  Create a new scheduled maintenance task
                </DialogDescription>
              </DialogHeader>
              <CreateScheduleForm 
                properties={properties}
                vendors={vendors}
                staff={staff}
                onClose={() => setCreateScheduleOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {scheduledItems.filter(i => i.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledItems.filter(i => {
                const itemDate = new Date(i.nextDueDate)
                const now = new Date()
                return itemDate.getMonth() === now.getMonth() && 
                       itemDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Due this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scheduledItems.reduce((sum, i) => sum + i.completedCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="replacement">Replacement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Maintenance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasItems: (date) => getItemsForDate(date).length > 0,
                  overdue: (date) => getItemsForDate(date).some(item => 
                    item.status === 'overdue'
                  )
                }}
                modifiersStyles={{
                  hasItems: { backgroundColor: '#dbeafe', color: '#1e40af' },
                  overdue: { backgroundColor: '#fee2e2', color: '#dc2626' }
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Items */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? formatDate(selectedDate.toISOString()) : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {getItemsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No maintenance scheduled for this date
                    </p>
                  ) : (
                    getItemsForDate(selectedDate).map(item => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.type)}
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.property.name}
                          {item.unit && ` • ${item.unit.unitNumber}`}
                        </p>
                        <Badge className={`${getStatusColor(item.status)} text-xs mt-1`}>
                          {item.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a date to see scheduled maintenance
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Items */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming maintenance scheduled
                  </p>
                ) : (
                  upcomingItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.property.name}
                        {item.unit && ` • ${item.unit.unitNumber}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(item.nextDueDate.toISOString())}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Overdue Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No overdue maintenance items
                  </p>
                ) : (
                  overdueItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.property.name}
                        {item.unit && ` • ${item.unit.unitNumber}`}
                      </p>
                      <p className="text-xs text-red-600">
                        Was due: {formatDate(item.nextDueDate.toISOString())}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
              <DialogDescription>
                Scheduled maintenance details
              </DialogDescription>
            </DialogHeader>
            <ScheduledItemDetails item={selectedItem} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CreateScheduleForm({ 
  properties, 
  vendors, 
  staff, 
  onClose 
}: { 
  properties: any[]
  vendors: any[]
  staff: any[]
  onClose: () => void 
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input placeholder="HVAC Filter Replacement" />
        </div>
        <div>
          <Label>Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="replacement">Replacement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea placeholder="Detailed description of the maintenance task" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Frequency</Label>
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="one-time">One-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Next Due Date</Label>
          <Input type="date" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Schedule Maintenance
        </Button>
      </div>
    </div>
  )
}

function ScheduledItemDetails({ item }: { item: ScheduledMaintenance }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Type</Label>
          <div className="flex items-center gap-2 mt-1">
            {getTypeIcon(item.type)}
            <span className="capitalize">{item.type}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <Badge className={`${getStatusColor(item.status)} mt-1`}>
            {item.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
        <p className="mt-1">{item.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Next Due</Label>
          <p className="mt-1">{formatDate(item.nextDueDate.toISOString())}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
          <p className="mt-1 capitalize">{item.frequency}</p>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getStatusColor(status: ScheduledMaintenance['status']) {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-amber-100 text-amber-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getTypeIcon(type: ScheduledMaintenance['type']) {
  switch (type) {
    case 'preventive':
      return <Wrench className="h-4 w-4 text-blue-500" />
    case 'inspection':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'cleaning':
      return <Clock className="h-4 w-4 text-purple-500" />
    case 'repair':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case 'replacement':
      return <Repeat className="h-4 w-4 text-red-500" />
    default:
      return <Wrench className="h-4 w-4 text-gray-500" />
  }
}
