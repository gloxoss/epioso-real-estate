import { requireAuthWithRole } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { documentsRepo } from '@/repositories/documents'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Building2,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  FolderOpen,
  Image,
  FileImage,
  File
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { UploadDialog } from '@/components/documents/UploadDialog'
import { DocumentActions } from '@/components/documents/DocumentActions'

interface PropertyDocumentsPageProps {
  params: Promise<{ id: string }>
}

async function getPropertyDocumentsData(propertyId: string, organizationId: string) {
  const [property, documents] = await Promise.all([
    propertiesRepo.findById(propertyId, organizationId),
    documentsRepo.getByEntity(organizationId, 'property', propertyId)
  ])

  if (!property) {
    return null
  }

  // Transform documents to match the expected format
  const transformedDocuments = documents.map(doc => ({
    id: doc.id,
    name: doc.filename,
    type: doc.category || 'document',
    category: doc.category || 'General',
    size: doc.size ? doc.size / (1024 * 1024) : 0, // Convert bytes to MB
    uploadedAt: doc.createdAt,
    uploadedBy: 'System', // TODO: Get actual uploader name
    description: doc.description || '',
    tags: doc.tags || [],
    isPublic: false // TODO: Determine from document permissions
  }))

  // Use real documents or empty array if none exist
  const documentsToShow = transformedDocuments

  const categories = [
    { name: 'All Documents', count: documentsToShow.length },
    { name: 'Property Documents', count: documentsToShow.filter(d => d.category === 'Property Documents').length },
    { name: 'Legal', count: documentsToShow.filter(d => d.type === 'legal').length },
    { name: 'Financial', count: documentsToShow.filter(d => d.category === 'Financial').length },
    { name: 'Insurance', count: documentsToShow.filter(d => d.category === 'Insurance').length },
    { name: 'Maintenance', count: documentsToShow.filter(d => d.category === 'Maintenance').length },
    { name: 'Marketing', count: documentsToShow.filter(d => d.category === 'Marketing').length }
  ]

  return {
    property,
    documents: documentsToShow,
    categories
  }
}

function getFileIcon(type: string) {
  switch (type) {
    case 'images':
      return <FileImage className="h-5 w-5 text-blue-600" />
    case 'legal':
      return <FileText className="h-5 w-5 text-red-600" />
    case 'insurance':
      return <FileText className="h-5 w-5 text-green-600" />
    case 'tax':
      return <FileText className="h-5 w-5 text-yellow-600" />
    case 'plans':
      return <File className="h-5 w-5 text-purple-600" />
    default:
      return <FileText className="h-5 w-5 text-gray-600" />
  }
}

function getTypeBadge(type: string) {
  const colors = {
    legal: 'bg-red-100 text-red-800',
    insurance: 'bg-green-100 text-green-800',
    images: 'bg-blue-100 text-blue-800',
    inspection: 'bg-yellow-100 text-yellow-800',
    tax: 'bg-purple-100 text-purple-800',
    plans: 'bg-indigo-100 text-indigo-800'
  }
  
  return (
    <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {type}
    </Badge>
  )
}

export default async function PropertyDocumentsPage({ params }: PropertyDocumentsPageProps) {
  const session = await requireAuthWithRole()
  const { id } = await params
  
  const data = await getPropertyDocumentsData(id, session.organizationId)
  
  if (!data) {
    notFound()
  }

  const { property, documents, categories } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Documents - ${property.name}`}
        description="Manage all property-related documents and files"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <UploadDialog
              entityType="property"
              entityId={property.id}
            >
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </UploadDialog>
          </div>
        }
      />

      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Property Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="font-medium">{documents.length} files</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="font-medium">
                {documents.reduce((sum, doc) => sum + doc.size, 0).toFixed(1)} MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 4).map((category, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
              <p className="text-xs text-muted-foreground">
                {category.count === 1 ? 'document' : 'documents'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents List */}
      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm" title={document.name}>
                          {document.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{document.size.toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getTypeBadge(document.type)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {document.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                      {document.description}
                    </p>
                  )}

                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs truncate max-w-20">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{document.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(document.uploadedAt.toISOString())}</span>
                    </div>
                  </div>

                  <DocumentActions
                    document={{
                      id: document.id,
                      name: document.name,
                      category: document.category,
                      tags: document.tags,
                      description: document.description,
                      mimeType: 'application/octet-stream', // Default mime type
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{document.name}</p>
                          {getTypeBadge(document.type)}
                          {document.isPublic && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Public
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {document.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{document.size} MB</span>
                          <span>Uploaded by {document.uploadedBy}</span>
                          <span>{formatDate(document.uploadedAt.toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    <DocumentActions
                      document={{
                        id: document.id,
                        name: document.name,
                        category: document.category,
                        tags: document.tags,
                        description: document.description,
                        mimeType: 'application/octet-stream', // Default mime type
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common document management actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <UploadDialog
              entityType="property"
              entityId={property.id}
            >
              <Button variant="outline" className="justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </UploadDialog>
            <Button variant="outline" className="justify-start">
              <FolderOpen className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Bulk Download
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
