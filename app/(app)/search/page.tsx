'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, X, Building, Users, FileText, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

// Temporary inline useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

interface SearchResult {
  id: string
  type: 'property' | 'tenant' | 'document' | 'maintenance'
  title: string
  description: string
  metadata?: Record<string, any>
  url: string
}

const SEARCH_TYPES = [
  { value: 'all', label: 'All Results', icon: Search },
  { value: 'property', label: 'Properties', icon: Building },
  { value: 'tenant', label: 'Tenants', icon: Users },
  { value: 'document', label: 'Documents', icon: FileText },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'

  const [query, setQuery] = useState(initialQuery)
  const [selectedType, setSelectedType] = useState(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (selectedType !== 'all') params.set('type', selectedType)
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [debouncedQuery, selectedType, router])

  // Perform search when query or type changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    performSearch(debouncedQuery, selectedType)
  }, [debouncedQuery, selectedType])

  const performSearch = async (searchQuery: string, type: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(type !== 'all' && { type })
      })

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Failed to perform search. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = useMemo(() => {
    if (selectedType === 'all') return results
    return results.filter(result => result.type === selectedType)
  }, [results, selectedType])

  const resultsByType = useMemo(() => {
    return SEARCH_TYPES.reduce((acc, type) => {
      if (type.value === 'all') return acc
      acc[type.value] = results.filter(result => result.type === type.value)
      return acc
    }, {} as Record<string, SearchResult[]>)
  }, [results])

  const getTypeIcon = (type: string) => {
    const typeConfig = SEARCH_TYPES.find(t => t.value === type)
    return typeConfig?.icon || Search
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'property': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'tenant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'document': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description="Find properties, tenants, documents, and maintenance tickets"
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search properties, tenants, documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results */}
      {query.trim() && (
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-5">
            {SEARCH_TYPES.map((type) => {
              const Icon = type.icon
              const count = type.value === 'all' ? results.length : (resultsByType[type.value]?.length || 0)
              
              return (
                <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => performSearch(query, selectedType)}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse different categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                </p>
                
                <div className="space-y-3">
                  {filteredResults.map((result) => {
                    const Icon = getTypeIcon(result.type)
                    
                    return (
                      <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  <a href={result.url} className="hover:underline">
                                    {result.title}
                                  </a>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {result.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={getTypeBadgeColor(result.type)}>
                              {result.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        {result.metadata && (
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Tabs>
      )}

      {/* Empty State */}
      {!query.trim() && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Search your property data</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a search term above to find properties, tenants, documents, and maintenance tickets.
          </p>
        </div>
      )}
    </div>
  )
}
