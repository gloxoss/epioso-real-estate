'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'

export function UnitFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') || 'all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters()
  }

  const updateFilters = () => {
    const params = new URLSearchParams()
    
    if (search) params.set('search', search)
    if (status && status !== 'all') params.set('status', status)
    if (propertyId && propertyId !== 'all') params.set('propertyId', propertyId)
    
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setPropertyId('all')
    router.push(window.location.pathname)
  }

  const hasActiveFilters = search || (status && status !== 'all') || (propertyId && propertyId !== 'all')

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search units..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </form>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
        {/* Status Filter */}
        <Select value={status} onValueChange={(value) => {
          setStatus(value)
          setTimeout(updateFilters, 0)
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
