'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'

interface FilterOption {
  key: string
  label: string
  type: 'select' | 'input'
  options?: { label: string; value: string }[]
}

interface SortOption {
  label: string
  value: string
}

interface DataToolbarProps {
  searchPlaceholder?: string
  filters?: FilterOption[]
  sortOptions?: SortOption[]
}

export function DataToolbar({ 
  searchPlaceholder = "Search...", 
  filters = [], 
  sortOptions = [] 
}: DataToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page
    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page
    router.push(`?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      const [sort, dir] = value.split(':')
      params.set('sort', sort)
      params.set('dir', dir || 'desc')
    } else {
      params.delete('sort')
      params.delete('dir')
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    router.push('?')
    setSearchValue('')
  }

  const hasActiveFilters = searchParams.toString() !== ''

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchValue)
            }
          }}
          className="pl-10"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center space-x-2">
        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={searchParams.get(filter.key) || 'all'}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Sort */}
        {sortOptions.length > 0 && (
          <Select
            value={
              searchParams.get('sort') 
                ? `${searchParams.get('sort')}:${searchParams.get('dir') || 'desc'}`
                : ''
            }
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={`${option.value}:desc`} value={`${option.value}:desc`}>
                  {option.label} ↓
                </SelectItem>
              ))}
              {sortOptions.map((option) => (
                <SelectItem key={`${option.value}:asc`} value={`${option.value}:asc`}>
                  {option.label} ↑
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
