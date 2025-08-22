'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'

interface ReportFiltersProps {
  availableProperties?: Array<{ id: string; name: string }>
}

export function ReportFilters({ availableProperties = [] }: ReportFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [dateFrom, setDateFrom] = useState(
    searchParams.get('from') || ''
  )
  const [dateTo, setDateTo] = useState(
    searchParams.get('to') || ''
  )
  const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') || 'all')
  const [reportType, setReportType] = useState(searchParams.get('type') || 'all')

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    if (propertyId && propertyId !== 'all') params.set('propertyId', propertyId)
    if (reportType && reportType !== 'all') params.set('type', reportType)

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setPropertyId('all')
    setReportType('all')
    router.push(window.location.pathname)
  }

  const hasActiveFilters = dateFrom || dateTo || (propertyId && propertyId !== 'all') || (reportType && reportType !== 'all')

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Report Filters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date From */}
        <div className="space-y-2">
          <Label>From Date</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>To Date</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Property Filter */}
        <div className="space-y-2">
          <Label>Property</Label>
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {availableProperties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Report Type Filter */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="All Reports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="occupancy">Occupancy</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="collections">Collections</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} size="sm">
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
