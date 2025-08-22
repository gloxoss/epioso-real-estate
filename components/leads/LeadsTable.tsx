'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/format'
import { MoreHorizontal, Eye, Edit, Phone, Mail, Calendar, MapPin } from 'lucide-react'
import type { LeadWithDetails } from '@/repositories/leads'

interface LeadsTableProps {
  leads: LeadWithDetails[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  locale: string
}

function getStatusBadge(status: string) {
  const statusConfig = {
    new: { label: 'New', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
    contacted: { label: 'Contacted', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
    qualified: { label: 'Qualified', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
    viewing_scheduled: { label: 'Viewing Scheduled', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
    viewing_completed: { label: 'Viewing Done', variant: 'default' as const, className: 'bg-purple-100 text-purple-800' },
    offer_made: { label: 'Offer Made', variant: 'default' as const, className: 'bg-orange-100 text-orange-800' },
    negotiating: { label: 'Negotiating', variant: 'default' as const, className: 'bg-indigo-100 text-indigo-800' },
    contract_signed: { label: 'Contract Signed', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800' },
    closed_won: { label: 'Closed Won', variant: 'default' as const, className: 'bg-green-200 text-green-900' },
    closed_lost: { label: 'Closed Lost', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    on_hold: { label: 'On Hold', variant: 'outline' as const, className: 'bg-gray-50 text-gray-600' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}

function getSourceBadge(source: string) {
  const sourceConfig = {
    website: { label: 'Website', className: 'bg-blue-50 text-blue-700' },
    referral: { label: 'Referral', className: 'bg-green-50 text-green-700' },
    social_media: { label: 'Social Media', className: 'bg-purple-50 text-purple-700' },
    advertising: { label: 'Advertising', className: 'bg-orange-50 text-orange-700' },
    walk_in: { label: 'Walk-in', className: 'bg-yellow-50 text-yellow-700' },
    phone_call: { label: 'Phone Call', className: 'bg-indigo-50 text-indigo-700' },
    email: { label: 'Email', className: 'bg-cyan-50 text-cyan-700' },
    agent_network: { label: 'Agent Network', className: 'bg-pink-50 text-pink-700' },
    other: { label: 'Other', className: 'bg-gray-50 text-gray-700' },
  }

  const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.other
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function LeadsTable({ leads, pagination, locale }: LeadsTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    setSelectedLeads(
      selectedLeads.length === leads.length 
        ? [] 
        : leads.map(lead => lead.id)
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property/Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No leads found</p>
                    <Button asChild size="sm">
                      <Link href={`/${locale}/leads/new`}>Add First Lead</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {lead.contact?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {lead.contact?.name || 'Unknown Contact'}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {lead.contact?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.contact.email}
                            </span>
                          )}
                          {lead.contact?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.unit ? (
                      <div>
                        <div className="font-medium">
                          {lead.unit.property.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Unit {lead.unit.unitNumber}
                          {lead.unit.salePrice && (
                            <span className="ml-2">
                              {formatCurrency(
                                lead.unit.salePrice?.toNumber ? lead.unit.salePrice.toNumber() : (lead.unit.salePrice || 0),
                                'MAD'
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : lead.property ? (
                      <div>
                        <div className="font-medium">{lead.property.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.property.address}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No property specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    {getSourceBadge(lead.source)}
                  </TableCell>
                  <TableCell>
                    {lead.budget ? (
                      formatCurrency(
                        lead.budget?.toNumber ? lead.budget.toNumber() : (lead.budget || 0),
                        'MAD'
                      )
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.assignedAgent ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {lead.assignedAgent.user.name?.[0] || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {lead.assignedAgent.user.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {lead.score}/100
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(lead.createdAt)}
                    </div>
                    {lead.nextFollowUpDate && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Follow-up: {formatDate(lead.nextFollowUpDate)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/leads/${lead.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/leads/${lead.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Lead
                          </Link>
                        </DropdownMenuItem>
                        {lead.contact?.phone && (
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Contact
                          </DropdownMenuItem>
                        )}
                        {lead.contact?.email && (
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} leads
          </div>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page - 1}`}>Previous</Link>
              </Button>
            )}
            {pagination.page < pagination.totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
