import { notFound } from 'next/navigation'
import { requireAuthWithRole } from '@/lib/rbac'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { salesAgentsRepo } from '@/repositories/sales-agents'
import { propertiesRepo } from '@/repositories/properties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadForm } from '@/components/leads/LeadForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NewLeadPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getFormData(organizationId: string) {
  const [agents, properties] = await Promise.all([
    salesAgentsRepo.list(organizationId, { isActive: true }),
    propertiesRepo.list(organizationId, {}, { perPage: 100 }),
  ])

  return { agents, properties }
}

export default async function NewLeadPage({ params, searchParams }: NewLeadPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  if (!isValidLocale(locale)) {
    notFound()
  }

  const session = await requireAuthWithRole()
  const dictionary = await getDictionary(locale as Locale)
  const organizationId = (session.user as any).organizationId as string

  const { agents, properties } = await getFormData(organizationId)

  // Pre-fill form with query parameters
  const initialData = {
    propertyId: resolvedSearchParams.property as string,
    unitId: resolvedSearchParams.unit as string,
    source: resolvedSearchParams.source as string,
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/leads`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add New Lead</h1>
          <p className="text-sm text-muted-foreground">
            Create a new sales lead and start tracking the opportunity
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm
            agents={agents.data}
            properties={properties.data}
            initialData={initialData}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  )
}
