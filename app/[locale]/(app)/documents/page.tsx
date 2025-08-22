import { requireAuthWithRole } from '@/lib/rbac'
import { documentsRepo } from '@/repositories/documents'
import { DocumentFiltersSchema } from '@/schemas'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataToolbar } from '@/components/layout/DataToolbar'
import { DocumentGrid } from '@/components/documents/DocumentGrid'
import { UploadDialog } from '@/components/documents/UploadDialog'
import { EmptyState } from '@/components/layout/EmptyState'
import { FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import Link from 'next/link'
import { DocumentGridSkeleton } from '@/components/documents/DocumentGridSkeleton'

interface DocumentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function DocumentsContent({ 
  organizationId, 
  filters 
}: { 
  organizationId: string
  filters: any 
}) {
  const result = await documentsRepo.list(organizationId, filters, {
    page: filters.page,
    perPage: filters.perPage,
    sort: filters.sort,
    dir: filters.dir,
  })

  if (result.data.length === 0 && !filters.search) {
    return (
      <EmptyState
        icon="FileText"
        title="No documents yet"
        description="Upload your first document to get started with document management."
        action={
          <UploadDialog>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </UploadDialog>
        }
      />
    )
  }

  if (result.data.length === 0 && filters.search) {
    return (
      <EmptyState
        icon="FileText"
        title="No documents found"
        description={`No documents match your search for "${filters.search}".`}
        action={
          <Button variant="outline" onClick={() => window.location.href = '/documents'}>
            Clear Search
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Documents Grid */}
      <DocumentGrid documents={result.data} />

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((result.pagination.page - 1) * result.pagination.perPage) + 1} to{' '}
            {Math.min(result.pagination.page * result.pagination.perPage, result.pagination.total)} of{' '}
            {result.pagination.total} documents
          </p>
          
          <div className="flex items-center space-x-2">
            {result.pagination.hasPrev && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/documents?page=${result.pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            )}
            {result.pagination.hasNext && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/documents?page=${result.pagination.page + 1}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const session = await requireAuthWithRole()
  const params = await searchParams
  
  // Validate and parse search parameters
  const filters = DocumentFiltersSchema.parse(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage all your property-related documents"
        action={
          <UploadDialog>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </UploadDialog>
        }
      />

      <DataToolbar
        searchPlaceholder="Search documents..."
        filters={[
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Contract', value: 'contract' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Receipt', value: 'receipt' },
              { label: 'Photo', value: 'photo' },
              { label: 'Report', value: 'report' },
              { label: 'Legal', value: 'legal' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Other', value: 'other' },
            ],
          },
          {
            key: 'entityType',
            label: 'Related To',
            type: 'select',
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Property', value: 'property' },
              { label: 'Unit', value: 'unit' },
              { label: 'Contact', value: 'contact' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Ticket', value: 'ticket' },
              { label: 'Payment', value: 'payment' },
            ],
          },
        ]}
        sortOptions={[
          { label: 'Upload Date', value: 'createdAt' },
          { label: 'File Name', value: 'filename' },
          { label: 'File Size', value: 'size' },
          { label: 'Category', value: 'category' },
        ]}
      />

      <Suspense 
        fallback={<DocumentGridSkeleton />}
      >
        <DocumentsContent 
          organizationId={session.organizationId} 
          filters={filters} 
        />
      </Suspense>
    </div>
  )
}
