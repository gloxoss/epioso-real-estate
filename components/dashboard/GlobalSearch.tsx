'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Building2, 
  Home, 
  Users, 
  FileText, 
  CreditCard,
  Wrench,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import type { Dictionary } from '@/lib/i18n/config'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'property' | 'unit' | 'contact' | 'invoice' | 'ticket'
  url: string
}

const typeIcons = {
  property: 'Building2',
  unit: 'Home',
  contact: 'Users',
  invoice: 'CreditCard',
  ticket: 'Wrench',
}

function renderTypeIcon(iconName: string, className: string = '') {
  switch (iconName) {
    case 'Building2':
      return <Building2 className={className} />
    case 'Home':
      return <Home className={className} />
    case 'Users':
      return <Users className={className} />
    case 'CreditCard':
      return <CreditCard className={className} />
    case 'Wrench':
      return <Wrench className={className} />
    default:
      return <Building2 className={className} />
  }
}

const typeLabels = {
  property: 'Property',
  unit: 'Unit',
  contact: 'Contact',
  invoice: 'Invoice',
  ticket: 'Ticket',
}

interface GlobalSearchProps {
  dictionary?: Dictionary
}

export default function GlobalSearch({ dictionary }: GlobalSearchProps = {}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search function
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const searchPortfolio = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchPortfolio()
  }, [debouncedQuery])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery('')
    router.push(result.url)
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative w-full sm:w-64 lg:w-72 justify-start text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
        >
          <Search className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{dictionary?.dashboard?.searchPortfolio || "Search portfolio..."}</span>
          <Badge variant="secondary" className="ml-auto text-xs hidden sm:inline-flex">
            ⌘K
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder="Search properties, units, contacts..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            )}
            
            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}

            {!loading && Object.entries(groupedResults).map(([type, items]) => {
              const iconName = typeIcons[type as keyof typeof typeIcons]
              const label = typeLabels[type as keyof typeof typeLabels]
              
              return (
                <CommandGroup key={type} heading={label}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {renderTypeIcon(iconName, "h-4 w-4 text-muted-foreground")}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}

            {query.length < 2 && (
              <div className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Search across your entire portfolio
                </div>
                <div className="text-xs text-muted-foreground">
                  Properties • Units • Contacts • Invoices • Tickets
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
