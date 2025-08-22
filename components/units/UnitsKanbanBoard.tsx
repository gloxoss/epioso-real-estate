'use client'

import { useState, useCallback } from 'react'
import { UnitStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Home,
  MapPin,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Bed,
  Bath,
  Square,
  User,
  AlertTriangle,
  Clock,
  Wrench,
  GripVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { formatMoney, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Unit {
  id: string
  unitNumber: string
  status: UnitStatus
  rentAmount?: number | null
  property: {
    id: string
    name: string
  }
  tenant?: {
    id: string
    name: string
    email?: string
  } | null
  attributes?: {
    floor?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    size?: number | null
  }
  invoices?: Array<{
    id: string
    status: string
    dueDate: Date
    amount: number
  }>
  tickets?: Array<{
    id: string
    priority: string
    status: string
    title: string
    createdAt: Date
  }>
}

interface KanbanColumn {
  id: UnitStatus
  title: string
  units: Unit[]
  color: string
}

interface UnitsKanbanBoardProps {
  columns: KanbanColumn[]
  organizationId: string
  onStatusChange?: (unitId: string, newStatus: UnitStatus) => Promise<void>
  dictionary?: any
  locale?: string
}

function getStatusColor(status: UnitStatus) {
  const colors: Record<UnitStatus, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reserved: 'bg-purple-100 text-purple-800 border-purple-200',
    sold: 'bg-gray-100 text-gray-800 border-gray-200',
    blocked: 'bg-orange-100 text-orange-800 border-orange-200',
  }
  return colors[status] || colors.available
}

function UnitCard({ unit, isDragging }: { unit: Unit; isDragging?: boolean }) {
  // Check for urgent indicators
  const hasOverdueRent = unit.invoices?.some(invoice =>
    invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date()
  )
  const hasUrgentMaintenance = unit.tickets?.some(ticket =>
    ticket.priority === 'urgent' && ['open', 'in_progress'].includes(ticket.status)
  )
  const hasHighPriorityMaintenance = unit.tickets?.some(ticket =>
    ticket.priority === 'high' && ['open', 'in_progress'].includes(ticket.status)
  )
  const hasAnyMaintenance = unit.tickets?.some(ticket =>
    ['open', 'in_progress'].includes(ticket.status)
  )
  const hasAnyIssues = hasOverdueRent || hasUrgentMaintenance

  // Get the most urgent issue for priority display
  const urgencyLevel = hasOverdueRent && hasUrgentMaintenance ? 'critical' :
                      hasOverdueRent || hasUrgentMaintenance ? 'high' :
                      hasHighPriorityMaintenance ? 'medium' :
                      hasAnyMaintenance ? 'low' : 'none'

  return (
    <Card className={cn(
      "mb-3 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative",
      isDragging && "shadow-lg rotate-2 opacity-90",
      urgencyLevel === 'critical' && "ring-2 ring-red-500 border-red-300 bg-red-50",
      urgencyLevel === 'high' && "ring-2 ring-red-300 border-red-200 bg-red-25",
      urgencyLevel === 'medium' && "ring-1 ring-orange-300 border-orange-200",
      urgencyLevel === 'low' && "ring-1 ring-yellow-300 border-yellow-200"
    )}>
      {/* Priority indicator bar */}
      {urgencyLevel !== 'none' && (
        <div className={cn(
          "absolute top-0 left-0 w-full h-1 rounded-t-lg",
          urgencyLevel === 'critical' && "bg-red-600",
          urgencyLevel === 'high' && "bg-red-500",
          urgencyLevel === 'medium' && "bg-orange-500",
          urgencyLevel === 'low' && "bg-yellow-500"
        )} />
      )}

      {/* Urgent indicators */}
      {hasAnyIssues && (
        <div className="absolute -top-1 -right-1 flex gap-1 z-10">
          {hasOverdueRent && (
            <Badge
              variant="destructive"
              className="h-6 w-6 p-0 rounded-full flex items-center justify-center animate-pulse"
              title="Overdue payment"
            >
              <DollarSign className="h-3 w-3" />
            </Badge>
          )}
          {hasUrgentMaintenance && (
            <Badge
              variant="destructive"
              className="h-6 w-6 p-0 rounded-full flex items-center justify-center animate-pulse"
              title="Urgent maintenance required"
            >
              <Wrench className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Status indicator for non-urgent maintenance */}
      {!hasAnyIssues && hasAnyMaintenance && (
        <div className="absolute -top-1 -right-1 z-10">
          <Badge
            variant="secondary"
            className="h-5 w-5 p-0 rounded-full flex items-center justify-center bg-orange-100 text-orange-700"
            title="Maintenance in progress"
          >
            <Wrench className="h-2.5 w-2.5" />
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            <Home className="h-3 w-3" />
            {unit.unitNumber}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/units/${unit.id}`}>
                  <Eye className="h-3 w-3 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/units/${unit.id}/edit`}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          {unit.property.name}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Tenant Information */}
          {unit.tenant && (
            <div className="flex items-center gap-1 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{unit.tenant.name}</span>
            </div>
          )}

          {/* Rent Amount */}
          {unit.rentAmount && (
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span>{formatMoney(Number(unit.rentAmount))}</span>
            </div>
          )}

          {/* Unit Attributes */}
          {unit.attributes && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              {unit.attributes.bedrooms !== null && unit.attributes.bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  <span>{unit.attributes.bedrooms}</span>
                </div>
              )}
              {unit.attributes.bathrooms !== null && unit.attributes.bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  <span>{unit.attributes.bathrooms}</span>
                </div>
              )}
              {unit.attributes.size && (
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  <span>{unit.attributes.size} sq ft</span>
                </div>
              )}
            </div>
          )}

          {/* Urgent Issues */}
          {hasOverdueRent && (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Overdue payment</span>
              {unit.invoices?.find(i => i.status === 'overdue') && (
                <span className="text-red-500">
                  ({formatMoney(unit.invoices.find(i => i.status === 'overdue')!.amount)})
                </span>
              )}
            </div>
          )}

          {hasUrgentMaintenance && (
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Urgent maintenance</span>
              {unit.tickets?.find(t => t.priority === 'urgent') && (
                <span className="text-orange-500 truncate">
                  - {unit.tickets.find(t => t.priority === 'urgent')!.title}
                </span>
              )}
            </div>
          )}

          {/* Non-urgent maintenance */}
          {!hasUrgentMaintenance && hasHighPriorityMaintenance && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              <Wrench className="h-3 w-3" />
              <span>High priority maintenance</span>
            </div>
          )}

          {/* Regular maintenance */}
          {!hasUrgentMaintenance && !hasHighPriorityMaintenance && hasAnyMaintenance && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Wrench className="h-3 w-3" />
              <span>Maintenance scheduled</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function UnitsKanbanBoard({ columns, organizationId, onStatusChange, dictionary, locale = 'en' }: UnitsKanbanBoardProps) {
  const { toast } = useToast()
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<UnitStatus | null>(null)

  const handleDragStart = useCallback((unit: Unit) => {
    setDraggedUnit(unit)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedUnit(null)
    setDraggedOverColumn(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: UnitStatus) => {
    e.preventDefault()
    setDraggedOverColumn(columnId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDraggedOverColumn(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: UnitStatus) => {
    e.preventDefault()

    if (!draggedUnit || draggedUnit.status === newStatus) {
      setDraggedUnit(null)
      setDraggedOverColumn(null)
      return
    }

    try {
      // Call the status change handler if provided
      if (onStatusChange) {
        await onStatusChange(draggedUnit.id, newStatus)
      } else {
        // Default API call to update unit status
        const response = await fetch(`/api/units/${draggedUnit.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          throw new Error('Failed to update unit status')
        }
      }

      toast({
        title: 'Unit status updated',
        description: `${draggedUnit.unitNumber} moved to ${newStatus}`,
      })

      // No page refresh needed - the parent component handles optimistic updates
    } catch (error) {
      console.error('Error updating unit status:', error)
      toast({
        title: 'Error updating unit status',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setDraggedUnit(null)
      setDraggedOverColumn(null)
    }
  }, [draggedUnit, onStatusChange, toast])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 overflow-x-auto">
      {/* Mobile: Horizontal scroll container */}
      <div className="md:hidden flex gap-4 pb-4 min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="w-72 flex-shrink-0">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className={getStatusColor(column.id)}>
                  {column.units.length}
                </Badge>
              </div>
            </div>

            {/* Column Content - Drop Zone */}
            <div
              className={cn(
                "space-y-3 min-h-[400px] p-2 rounded-lg transition-colors",
                draggedOverColumn === column.id && "bg-blue-50 border-2 border-blue-200 border-dashed"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.units.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-muted-foreground">
                      <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{dictionary?.units?.noUnits || "No units"}</p>
                      {draggedOverColumn === column.id && (
                        <p className="text-xs mt-1 text-blue-600">{dictionary?.units?.dropHereToMove || "Drop here to move unit"}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                column.units.map((unit) => (
                  <div
                    key={unit.id}
                    draggable
                    onDragStart={() => handleDragStart(unit)}
                    onDragEnd={handleDragEnd}
                  >
                    <UnitCard
                      unit={unit}
                      isDragging={draggedUnit?.id === unit.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:contents">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className={getStatusColor(column.id)}>
                  {column.units.length}
                </Badge>
              </div>
            </div>

            {/* Column Content - Drop Zone */}
            <div
              className={cn(
                "space-y-3 min-h-[400px] p-2 rounded-lg transition-colors",
                draggedOverColumn === column.id && "bg-blue-50 border-2 border-blue-200 border-dashed"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.units.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center text-muted-foreground">
                      <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{dictionary?.units?.noUnits || "No units"}</p>
                      {draggedOverColumn === column.id && (
                        <p className="text-xs mt-1 text-blue-600">{dictionary?.units?.dropHereToMove || "Drop here to move unit"}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                column.units.map((unit) => (
                  <div
                    key={unit.id}
                    draggable
                    onDragStart={() => handleDragStart(unit)}
                    onDragEnd={handleDragEnd}
                  >
                    <UnitCard
                      unit={unit}
                      isDragging={draggedUnit?.id === unit.id}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
