'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter } from 'lucide-react'
import type { SalesAgentWithDetails } from '@/repositories/sales-agents'

interface Property {
  id: string
  name: string
  address?: string
}

interface LeadFiltersProps {
  agents: SalesAgentWithDetails[]
  properties: Property[]
  currentFilters: Record<string, string | string[] | undefined>
  locale: string
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'viewing_scheduled', label: 'Viewing Scheduled' },
  { value: 'viewing_completed', label: 'Viewing Completed' },
  { value: 'offer_made', label: 'Offer Made' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'contract_signed', label: 'Contract Signed' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
  { value: 'on_hold', label: 'On Hold' },
]

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'agent_network', label: 'Agent Network' },
  { value: 'other', label: 'Other' },
]

export function LeadFilters({ agents, properties, currentFilters, locale }: LeadFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    search: (currentFilters.search as string) || '',
    status: (currentFilters.status as string) || '',
    source: (currentFilters.source as string) || '',
    agent: (currentFilters.agent as string) || '',
    property: (currentFilters.property as string) || '',
    budgetMin: (currentFilters.budgetMin as string) || '',
    budgetMax: (currentFilters.budgetMax as string) || '',
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  useEffect(() => {
    // Auto-expand if there are active filters
    if (hasActiveFilters) {
      setIsExpanded(true)
    }
  }, [hasActiveFilters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Clear existing filter params
    params.delete('search')
    params.delete('status')
    params.delete('source')
    params.delete('agent')
    params.delete('property')
    params.delete('budgetMin')
    params.delete('budgetMax')
    params.delete('page') // Reset to first page when filtering

    // Add new filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`/${locale}/leads?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      agent: '',
      property: '',
      budgetMin: '',
      budgetMax: '',
    })
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('status')
    params.delete('source')
    params.delete('agent')
    params.delete('property')
    params.delete('budgetMin')
    params.delete('budgetMax')
    params.delete('page')

    router.push(`/${locale}/leads?${params.toString()}`)
  }

  const removeFilter = (key: string) => {
    handleFilterChange(key, '')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete('page')
    
    router.push(`/${locale}/leads?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or notes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <Button onClick={applyFilters}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {Object.values(filters).filter(v => v !== '').length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null
            
            let label = value
            if (key === 'status') {
              label = statusOptions.find(opt => opt.value === value)?.label || value
            } else if (key === 'source') {
              label = sourceOptions.find(opt => opt.value === value)?.label || value
            } else if (key === 'agent') {
              const agent = agents.find(a => a.id === value)
              label = agent?.user.name || value
            } else if (key === 'property') {
              const property = properties.find(p => p.id === value)
              label = property?.name || value
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {label}
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sources</SelectItem>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Assigned Agent</Label>
            <Select value={filters.agent} onValueChange={(value) => handleFilterChange('agent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All agents</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.user.name || agent.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            <Select value={filters.property} onValueChange={(value) => handleFilterChange('property', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetMin">Min Budget (MAD)</Label>
            <Input
              id="budgetMin"
              type="number"
              placeholder="0"
              value={filters.budgetMin}
              onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetMax">Max Budget (MAD)</Label>
            <Input
              id="budgetMax"
              type="number"
              placeholder="No limit"
              value={filters.budgetMax}
              onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2 md:col-span-2 lg:col-span-3">
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
