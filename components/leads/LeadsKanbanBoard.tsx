'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatCurrency, formatDate } from '@/lib/format'
import { MoreHorizontal, Phone, Mail, Calendar, MapPin, DollarSign, User } from 'lucide-react'
import type { LeadWithDetails } from '@/repositories/leads'
import type { SalesAgentWithDetails } from '@/repositories/sales-agents'

interface LeadsKanbanBoardProps {
  leads: LeadWithDetails[]
  agents: SalesAgentWithDetails[]
  locale: string
}

const statusColumns = [
  { 
    id: 'new', 
    title: 'New Leads', 
    color: 'bg-blue-100 border-blue-200',
    headerColor: 'bg-blue-50 text-blue-900'
  },
  { 
    id: 'contacted', 
    title: 'Contacted', 
    color: 'bg-gray-100 border-gray-200',
    headerColor: 'bg-gray-50 text-gray-900'
  },
  { 
    id: 'qualified', 
    title: 'Qualified', 
    color: 'bg-green-100 border-green-200',
    headerColor: 'bg-green-50 text-green-900'
  },
  { 
    id: 'viewing_scheduled', 
    title: 'Viewing Scheduled', 
    color: 'bg-yellow-100 border-yellow-200',
    headerColor: 'bg-yellow-50 text-yellow-900'
  },
  { 
    id: 'viewing_completed', 
    title: 'Viewing Completed', 
    color: 'bg-purple-100 border-purple-200',
    headerColor: 'bg-purple-50 text-purple-900'
  },
  { 
    id: 'offer_made', 
    title: 'Offer Made', 
    color: 'bg-orange-100 border-orange-200',
    headerColor: 'bg-orange-50 text-orange-900'
  },
  { 
    id: 'negotiating', 
    title: 'Negotiating', 
    color: 'bg-indigo-100 border-indigo-200',
    headerColor: 'bg-indigo-50 text-indigo-900'
  },
  { 
    id: 'contract_signed', 
    title: 'Contract Signed', 
    color: 'bg-emerald-100 border-emerald-200',
    headerColor: 'bg-emerald-50 text-emerald-900'
  },
]

function LeadCard({ lead, locale }: { lead: LeadWithDetails; locale: string }) {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {lead.contact?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-medium">
                {lead.contact?.name || 'Unknown Contact'}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                Score: {lead.score}/100
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/leads/${lead.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/leads/${lead.id}/edit`}>
                  Edit Lead
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Property/Unit Info */}
        {lead.unit ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{lead.unit.property.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Unit {lead.unit.unitNumber}
            </div>
            {lead.unit.salePrice && (
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(
                  lead.unit.salePrice?.toNumber ? lead.unit.salePrice.toNumber() : (lead.unit.salePrice || 0),
                  'MAD'
                )}
              </div>
            )}
          </div>
        ) : lead.property ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{lead.property.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lead.property.address}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No property specified</div>
        )}

        {/* Budget */}
        {lead.budget && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Budget: {formatCurrency(
              lead.budget?.toNumber ? lead.budget.toNumber() : (lead.budget || 0),
              'MAD'
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-1">
          {lead.contact?.email && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {lead.contact.email}
            </div>
          )}
          {lead.contact?.phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.contact.phone}
            </div>
          )}
        </div>

        {/* Agent */}
        {lead.assignedAgent && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {lead.assignedAgent.user.name}
          </div>
        )}

        {/* Source */}
        <Badge variant="outline" className="text-xs">
          {lead.source.replace('_', ' ')}
        </Badge>

        {/* Follow-up Date */}
        {lead.nextFollowUpDate && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Follow-up: {formatDate(lead.nextFollowUpDate)}
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground">
          Created: {formatDate(lead.createdAt)}
        </div>
      </CardContent>
    </Card>
  )
}

export function LeadsKanbanBoard({ leads, agents, locale }: LeadsKanbanBoardProps) {
  // Group leads by status
  const leadsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = leads.filter(lead => lead.status === column.id)
    return acc
  }, {} as Record<string, LeadWithDetails[]>)

  // Calculate totals
  const totalValue = leads.reduce((sum, lead) => {
    if (lead.budget) {
      const budget = lead.budget?.toNumber ? lead.budget.toNumber() : (lead.budget || 0)
      return sum + budget
    }
    return sum
  }, 0)

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{leads.length}</div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(totalValue, 'MAD')}</div>
            <div className="text-xs text-muted-foreground">Pipeline Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {leads.filter(l => ['offer_made', 'negotiating', 'contract_signed'].includes(l.status)).length}
            </div>
            <div className="text-xs text-muted-foreground">Hot Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {totalValue > 0 ? Math.round(totalValue / leads.length) : 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg Budget (MAD)</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => {
          const columnLeads = leadsByStatus[column.id] || []
          const columnValue = columnLeads.reduce((sum, lead) => {
            const budget = lead.budget?.toNumber ? lead.budget.toNumber() : (lead.budget || 0)
            return sum + budget
          }, 0)

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card className={`${column.color} border-2`}>
                <CardHeader className={`${column.headerColor} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnLeads.length}
                    </Badge>
                  </div>
                  {columnValue > 0 && (
                    <div className="text-xs opacity-75">
                      Value: {formatCurrency(columnValue, 'MAD')}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-3 space-y-0 max-h-96 overflow-y-auto">
                  {columnLeads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-sm">No leads in this stage</div>
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} locale={locale} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Closed Leads Summary */}
      {leads.some(l => ['closed_won', 'closed_lost', 'on_hold'].includes(l.status)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Closed & On Hold Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {leads.filter(l => l.status === 'closed_won').length}
                </div>
                <div className="text-xs text-muted-foreground">Won</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {leads.filter(l => l.status === 'closed_lost').length}
                </div>
                <div className="text-xs text-muted-foreground">Lost</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {leads.filter(l => l.status === 'on_hold').length}
                </div>
                <div className="text-xs text-muted-foreground">On Hold</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
