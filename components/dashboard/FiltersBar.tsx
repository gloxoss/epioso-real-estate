'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FiltersBarProps {
  onFiltersChange?: (filters: DashboardFilters) => void
  properties?: Array<{ id: string; name: string }>
  dictionary?: any
}

interface DashboardFilters {
  dateRange?: {
    from: Date
    to: Date
  }
  propertyIds?: string[]
  agentId?: string
  status?: string
}

export function FiltersBar({ onFiltersChange, properties = [], dictionary }: FiltersBarProps) {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleFiltersChange = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setDateRange({})
    onFiltersChange?.({})
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof DashboardFilters]
    return value && (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Dashboard Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label className="text-xs">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange(range || {})
                      if (range?.from && range?.to) {
                        handleFiltersChange({ dateRange: { from: range.from, to: range.to } })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Property Multi-Select */}
            <div className="space-y-2">
              <Label className="text-xs">Properties</Label>
              <Select
                value={filters.propertyIds?.[0] || ""}
                onValueChange={(value) => {
                  handleFiltersChange({ 
                    propertyIds: value === "all" ? [] : [value] 
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => {
                  handleFiltersChange({ status: value === "all" ? undefined : value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
