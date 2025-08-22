'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  Plus, 
  Building2, 
  Home, 
  Users, 
  CreditCard, 
  Wrench,
  FileText,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/config'

interface QuickActionsMenuProps {
  dictionary?: Dictionary
}

export default function QuickActionsMenu({ dictionary }: QuickActionsMenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false)

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Handle two-key combinations
      if (e.key === 'g' || e.key === 'G') {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (nextE: KeyboardEvent) => {
            document.removeEventListener('keydown', handler)
            resolve(nextE.key.toLowerCase())
          }
          document.addEventListener('keydown', handler)
          setTimeout(() => {
            document.removeEventListener('keydown', handler)
            resolve('')
          }, 1000)
        })
        
        nextKey.then((key) => {
          switch (key) {
            case 'p':
              window.location.href = '/properties'
              break
            case 'u':
              window.location.href = '/units'
              break
            case 'm':
              window.location.href = '/maintenance'
              break
            case 'c':
              window.location.href = '/contacts'
              break
            case 'b':
              window.location.href = '/billing/invoices'
              break
          }
        })
      }

      if (e.key === 'n' || e.key === 'N') {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (nextE: KeyboardEvent) => {
            document.removeEventListener('keydown', handler)
            resolve(nextE.key.toLowerCase())
          }
          document.addEventListener('keydown', handler)
          setTimeout(() => {
            document.removeEventListener('keydown', handler)
            resolve('')
          }, 1000)
        })
        
        nextKey.then((key) => {
          switch (key) {
            case 'p':
              window.location.href = '/properties/new'
              break
            case 'u':
              window.location.href = '/units/new'
              break
            case 't':
              window.location.href = '/maintenance/new'
              break
            case 'i':
              window.location.href = '/billing/invoices/new'
              break
          }
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="hidden sm:inline">{dictionary?.dashboard?.quickActions || "Quick Actions"}</span>
          <span className="sm:hidden">Actions</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          {dictionary?.dashboard?.quickActions || "Quick Actions"}
          <Badge variant="secondary" className="text-xs">
            Keyboard shortcuts
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Create New
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/properties/new" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              New Property
            </div>
            <Badge variant="outline" className="text-xs">N → P</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/units/new" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Add Unit
            </div>
            <Badge variant="outline" className="text-xs">N → U</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing/invoices/new" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              New Invoice
            </div>
            <Badge variant="outline" className="text-xs">N → I</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/maintenance/new" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              New Ticket
            </div>
            <Badge variant="outline" className="text-xs">N → T</Badge>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Navigate
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/properties" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </div>
            <Badge variant="outline" className="text-xs">G → P</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/units" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Units
            </div>
            <Badge variant="outline" className="text-xs">G → U</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/maintenance" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </div>
            <Badge variant="outline" className="text-xs">G → M</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contacts" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </div>
            <Badge variant="outline" className="text-xs">G → C</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing/invoices" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </div>
            <Badge variant="outline" className="text-xs">G → B</Badge>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
