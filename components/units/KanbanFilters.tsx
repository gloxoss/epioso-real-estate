'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  X, 
  Building, 
  AlertTriangle,
  DollarSign,
  Wrench
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Property {
  id: string
  name: string
}

interface KanbanFiltersProps {
  properties: Property[]
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedProperty: string
  onPropertyChange: (propertyId: string) => void
  showUrgentOnly: boolean
  onUrgentOnlyChange: (show: boolean) => void
  showOverdueOnly: boolean
  onOverdueOnlyChange: (show: boolean) => void
  showMaintenanceOnly: boolean
  onMaintenanceOnlyChange: (show: boolean) => void
  onClearFilters: () => void
  dictionary?: any
}

export function KanbanFilters({
  properties,
  searchTerm,
  onSearchChange,
  selectedProperty,
  onPropertyChange,
  showUrgentOnly,
  onUrgentOnlyChange,
  showOverdueOnly,
  onOverdueOnlyChange,
  showMaintenanceOnly,
  onMaintenanceOnlyChange,
  onClearFilters,
  dictionary,
}: KanbanFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const hasActiveFilters = selectedProperty !== 'all' || showUrgentOnly || showOverdueOnly || showMaintenanceOnly

  const activeFilterCount = [
    selectedProperty !== 'all',
    showUrgentOnly,
    showOverdueOnly,
    showMaintenanceOnly,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={dictionary?.units?.searchUnitsBy || "Search units by number, tenant, or property..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Property Filter */}
        <Select value={selectedProperty} onValueChange={onPropertyChange}>
          <SelectTrigger className="w-[180px]">
            <Building className="h-4 w-4 mr-2" />
            <SelectValue placeholder={dictionary?.units?.allProperties || "All Properties"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dictionary?.units?.allProperties || "All Properties"}</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              {dictionary?.units?.filters || "Filters"}
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{dictionary?.units?.filterOptions || "Filter Options"}</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    {dictionary?.units?.clearAll || "Clear all"}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Urgent Issues Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={showUrgentOnly}
                    onCheckedChange={onUrgentOnlyChange}
                  />
                  <Label htmlFor="urgent" className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {dictionary?.units?.showUrgentIssuesOnly || "Show urgent issues only"}
                  </Label>
                </div>

                {/* Overdue Payments Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={showOverdueOnly}
                    onCheckedChange={onOverdueOnlyChange}
                  />
                  <Label htmlFor="overdue" className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-red-500" />
                    {dictionary?.units?.showOverduePaymentsOnly || "Show overdue payments only"}
                  </Label>
                </div>

                {/* Maintenance Issues Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenance"
                    checked={showMaintenanceOnly}
                    onCheckedChange={onMaintenanceOnlyChange}
                  />
                  <Label htmlFor="maintenance" className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-orange-500" />
                    {dictionary?.units?.showMaintenanceIssuesOnly || "Show maintenance issues only"}
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {dictionary?.units?.clear || "Clear"}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {selectedProperty !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {properties.find(p => p.id === selectedProperty)?.name}
              <button
                onClick={() => onPropertyChange('all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          {showUrgentOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent Issues
              <button
                onClick={() => onUrgentOnlyChange(false)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          {showOverdueOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Overdue Payments
              <button
                onClick={() => onOverdueOnlyChange(false)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          {showMaintenanceOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Maintenance Issues
              <button
                onClick={() => onMaintenanceOnlyChange(false)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
