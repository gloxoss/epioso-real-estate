import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireAuthWithRole } from '@/lib/rbac'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { leadsRepo } from '@/repositories/leads'
import { salesAgentsRepo } from '@/repositories/sales-agents'
import { propertiesRepo } from '@/repositories/properties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { LeadsKanbanBoard } from '@/components/leads/LeadsKanbanBoard'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { TableSkeleton } from '@/components/dashboard/skeletons'
import Link from 'next/link'
import { Plus, Users, Target, TrendingUp, Calendar, Filter } from 'lucide-react'

interface LeadsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getLeadsData(organizationId: string, searchParams: any) {
  const page = parseInt(searchParams.page as string) || 1
  const perPage = parseInt(searchParams.perPage as string) || 20
  const search = searchParams.search as string
  const status = searchParams.status as string
  const source = searchParams.source as string
  const assignedAgentId = searchParams.agent as string
  const propertyId = searchParams.property as string

  const filters = {
    ...(search && { search }),
    ...(status && { status }),
    ...(source && { source }),
    ...(assignedAgentId && { assignedAgentId }),
    ...(propertyId && { propertyId }),
  }

  const [leads, agents, properties] = await Promise.all([
    leadsRepo.list(organizationId, filters, { page, perPage }),
    salesAgentsRepo.list(organizationId, { isActive: true }),
    propertiesRepo.list(organizationId, {}, { perPage: 100 }),
  ])

  return { leads, agents, properties }
}

export default async function LeadsPage({ params, searchParams }: LeadsPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  if (!isValidLocale(locale)) {
    notFound()
  }

  const session = await requireAuthWithRole()
  const dictionary = await getDictionary(locale as Locale)
  const organizationId = (session.user as any).organizationId as string

  const { leads, agents, properties } = await getLeadsData(organizationId, resolvedSearchParams)

  // Calculate lead statistics
  const totalLeads = leads.total
  const newLeads = leads.data.filter(lead => lead.status === 'new').length
  const qualifiedLeads = leads.data.filter(lead => lead.status === 'qualified').length
  const conversionRate = totalLeads > 0 
    ? (leads.data.filter(lead => lead.status === 'closed_won').length / totalLeads) * 100 
    : 0

  const currentView = resolvedSearchParams.view as string || 'table'

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales leads and track conversion progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/${locale}/leads/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/leads/import`}>
              Import Leads
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              All time leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeads}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Ready for follow-up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Lead to sale conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeadFilters 
            agents={agents.data}
            properties={properties.data}
            currentFilters={resolvedSearchParams}
            locale={locale}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads ({leads.total})</CardTitle>
            <Tabs value={currentView} className="w-auto">
              <TabsList>
                <TabsTrigger value="table" asChild>
                  <Link href={`/${locale}/leads?${new URLSearchParams({ ...resolvedSearchParams, view: 'table' }).toString()}`}>
                    Table
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="kanban" asChild>
                  <Link href={`/${locale}/leads?${new URLSearchParams({ ...resolvedSearchParams, view: 'kanban' }).toString()}`}>
                    Pipeline
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton rows={10} />}>
            {currentView === 'kanban' ? (
              <LeadsKanbanBoard 
                leads={leads.data}
                agents={agents.data}
                locale={locale}
              />
            ) : (
              <LeadsTable 
                leads={leads.data}
                pagination={{
                  page: leads.page,
                  pageSize: leads.pageSize,
                  total: leads.total,
                  totalPages: leads.totalPages,
                }}
                locale={locale}
              />
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
