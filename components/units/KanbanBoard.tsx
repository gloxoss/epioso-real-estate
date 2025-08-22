'use client'

import { useState, useMemo, useEffect } from 'react'
import { UnitStatus } from '@prisma/client'
import { UnitsKanbanBoard } from './UnitsKanbanBoard'
import { KanbanFilters } from './KanbanFilters'
import { KanbanStats } from './KanbanStats'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

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

interface Property {
  id: string
  name: string
}

interface KanbanColumn {
  id: UnitStatus
  title: string
  units: Unit[]
}

interface KanbanBoardProps {
  units: Unit[]
  properties: Property[]
  organizationId: string
  dictionary?: any
  locale?: string
}

const getStatusConfig = (dictionary?: any) => ({
  available: { title: dictionary?.units?.available || 'Available', color: 'bg-green-100 text-green-800' },
  occupied: { title: dictionary?.units?.occupied || 'Occupied', color: 'bg-blue-100 text-blue-800' },
  maintenance: { title: dictionary?.units?.maintenance || 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  reserved: { title: dictionary?.units?.reserved || 'Reserved', color: 'bg-purple-100 text-purple-800' },
  sold: { title: dictionary?.units?.sold || 'Sold', color: 'bg-red-100 text-red-800' },
  blocked: { title: dictionary?.units?.blocked || 'Blocked', color: 'bg-yellow-100 text-yellow-800' },
})

export function KanbanBoard({ units: initialUnits, properties, organizationId, dictionary, locale = 'en' }: KanbanBoardProps) {
  // Local state for units (for real-time updates)
  const [units, setUnits] = useState(initialUnits)

  // Sync with prop changes (in case parent component gets new data)
  useEffect(() => {
    setUnits(initialUnits)
  }, [initialUnits])

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [showMaintenanceOnly, setShowMaintenanceOnly] = useState(false)

  // Filter units based on current filters
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          unit.unitNumber.toLowerCase().includes(searchLower) ||
          unit.property.name.toLowerCase().includes(searchLower) ||
          (unit.tenant?.name.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Property filter
      if (selectedProperty !== 'all' && unit.property.id !== selectedProperty) {
        return false
      }

      // Urgent issues filter
      if (showUrgentOnly) {
        const hasUrgentIssues = 
          unit.invoices?.some(invoice => invoice.status === 'overdue') ||
          unit.tickets?.some(ticket => ticket.priority === 'urgent')
        
        if (!hasUrgentIssues) return false
      }

      // Overdue payments filter
      if (showOverdueOnly) {
        const hasOverduePayments = unit.invoices?.some(invoice => 
          invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date()
        )
        
        if (!hasOverduePayments) return false
      }

      // Maintenance issues filter
      if (showMaintenanceOnly) {
        const hasMaintenanceIssues = unit.tickets?.some(ticket => 
          ['open', 'in_progress'].includes(ticket.status)
        )
        
        if (!hasMaintenanceIssues) return false
      }

      return true
    })
  }, [units, searchTerm, selectedProperty, showUrgentOnly, showOverdueOnly, showMaintenanceOnly])

  // Group filtered units by status
  const columns: KanbanColumn[] = useMemo(() => {
    const STATUS_CONFIG = getStatusConfig(dictionary)
    const statusGroups = Object.keys(STATUS_CONFIG).map((status) => ({
      id: status as UnitStatus,
      title: STATUS_CONFIG[status as UnitStatus].title,
      units: filteredUnits.filter((unit) => unit.status === status),
    }))

    return statusGroups
  }, [filteredUnits, dictionary])

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedProperty('all')
    setShowUrgentOnly(false)
    setShowOverdueOnly(false)
    setShowMaintenanceOnly(false)
  }

  // Handle status change with optimistic updates
  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    // Store original unit for rollback
    const originalUnit = units.find(unit => unit.id === unitId)
    if (!originalUnit) return

    // Optimistic update - immediately update the UI
    setUnits(prevUnits =>
      prevUnits.map(unit =>
        unit.id === unitId
          ? { ...unit, status: newStatus }
          : unit
      )
    )

    try {
      const response = await fetch(`/api/units/${unitId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update unit status')
      }

      // Success! The optimistic update was correct
      console.log(`Unit ${unitId} status successfully updated to ${newStatus}`)

    } catch (error) {
      console.error('Error updating unit status:', error)

      // Rollback the optimistic update
      setUnits(prevUnits =>
        prevUnits.map(unit =>
          unit.id === unitId
            ? originalUnit
            : unit
        )
      )

      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <KanbanStats units={filteredUnits} dictionary={dictionary} />

      {/* Filters */}
      <KanbanFilters
        properties={properties}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProperty={selectedProperty}
        onPropertyChange={setSelectedProperty}
        showUrgentOnly={showUrgentOnly}
        onUrgentOnlyChange={setShowUrgentOnly}
        showOverdueOnly={showOverdueOnly}
        onOverdueOnlyChange={setShowOverdueOnly}
        showMaintenanceOnly={showMaintenanceOnly}
        onMaintenanceOnlyChange={setShowMaintenanceOnly}
        onClearFilters={handleClearFilters}
        dictionary={dictionary}
      />

      {/* Results Summary */}
      {filteredUnits.length !== units.length && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredUnits.length} of {units.length} units
        </div>
      )}

      {/* No Results */}
      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{dictionary?.units?.noUnitsFound || "No units found"}</h3>
              <p className="text-muted-foreground mb-4">
                {dictionary?.units?.tryAdjustingFilters || "Try adjusting your search terms or filters."}
              </p>
              {(searchTerm || selectedProperty !== 'all' || showUrgentOnly || showOverdueOnly || showMaintenanceOnly) && (
                <button
                  onClick={handleClearFilters}
                  className="text-primary hover:underline"
                >
                  {dictionary?.units?.clearAllFilters || "Clear all filters"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {filteredUnits.length > 0 && (
        <UnitsKanbanBoard
          columns={columns}
          organizationId={organizationId}
          onStatusChange={handleStatusChange}
          dictionary={dictionary}
          locale={locale}
        />
      )}
    </div>
  )
}
