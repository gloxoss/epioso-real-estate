'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Image,
  FileImage,
  File,
  Trash2,
  Share,
  Loader2
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface Document {
  id: string
  name: string
  type: 'contract' | 'invoice' | 'receipt' | 'photo' | 'report' | 'legal' | 'maintenance' | 'other'
  size: number
  uploadedAt: Date
  uploadedBy: string
  url: string
  mimeType: string
}

interface PropertyDocumentsProps {
  propertyId: string
  documents: Document[]
  dictionary?: any
  locale?: string
}

export function PropertyDocuments({ propertyId, documents, dictionary, locale = 'en' }: PropertyDocumentsProps) {
  // Add safety check for documents array
  const safeDocuments = documents || []
  const { toast } = useToast()

  const documentTypes = [
    { value: 'contract', label: dictionary?.documents?.categories?.contract || 'Contract/Lease' },
    { value: 'invoice', label: dictionary?.documents?.categories?.invoice || 'Invoice' },
    { value: 'receipt', label: dictionary?.documents?.categories?.receipt || 'Receipt' },
    { value: 'photo', label: dictionary?.documents?.categories?.photo || 'Photo' },
    { value: 'report', label: dictionary?.documents?.categories?.report || 'Report' },
    { value: 'legal', label: dictionary?.documents?.categories?.legal || 'Legal Document' },
    { value: 'maintenance', label: dictionary?.documents?.categories?.maintenance || 'Maintenance' },
    { value: 'other', label: dictionary?.documents?.categories?.other || 'Other' },
  ]
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: '',
    description: ''
  })

  const filteredDocuments = safeDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadForm(prev => ({ ...prev, file }))
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.type) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file and document type',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 10MB)
    if (uploadForm.file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('type', uploadForm.type)
      formData.append('description', uploadForm.description)
      formData.append('propertyId', propertyId)
      formData.append('entityType', 'property')
      formData.append('entityId', propertyId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Reset form and close dialog
      setUploadForm({ file: null, type: '', description: '' })
      setUploadDialogOpen(false)

      // Show success message
      toast({
        title: 'Upload Successful',
        description: `Document "${uploadForm.file.name}" has been uploaded successfully!`,
      })

      // Refresh the page to show the new document
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload Failed',
        description: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadForm({ file: null, type: '', description: '' })
  }

  const getDocumentIcon = (mimeType: string, type: string) => {
    if (mimeType.startsWith('image/') || type === 'photo') {
      return FileImage
    }
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
      case 'invoice':
        return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
      case 'receipt':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
      case 'photo':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300'
      case 'report':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
      case 'legal':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/40 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Document Management Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {dictionary?.documents?.documentManagement || "Document Management"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dictionary?.documents?.storeAndOrganize || "Store and organize property-related documents"}
              </p>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
              setUploadDialogOpen(open)
              if (!open) resetUploadForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  {dictionary?.documents?.uploadDocument || "Upload Document"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl w-[90vw] max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>
                    {dictionary?.documents?.uploadDocument || "Upload Document"}
                  </DialogTitle>
                  <DialogDescription>
                    {dictionary?.documents?.addNewDocument || "Add a new document to this property's file collection."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="file" className="text-sm font-medium">
                      {dictionary?.documents?.selectFile || "Select File"} *
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      className="h-11 border-2 focus:border-primary"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
                    />
                    {uploadForm.file && (
                      <div className="p-3 bg-muted/50 rounded-md border">
                        <p className="text-sm font-medium">Selected: {uploadForm.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="document-type" className="text-sm font-medium">
                        {dictionary?.documents?.documentType || "Document Type"} *
                      </Label>
                      <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                          <SelectValue placeholder={dictionary?.documents?.selectDocumentType || "Select document type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-medium">
                        {dictionary?.documents?.descriptionOptional || "Description (Optional)"}
                      </Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the document"
                        className="h-11 border-2 focus:border-primary"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {uploadForm.file && uploadForm.type && (
                      <span>Ready to upload: {uploadForm.file.name}</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={uploading}
                      className="h-11 px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || !uploadForm.file || !uploadForm.type}
                      className="h-11 px-8"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Type: {typeFilter === 'all' ? 'All' : documentTypes.find(t => t.value === typeFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  All Documents
                </DropdownMenuItem>
                {documentTypes.map((type) => (
                  <DropdownMenuItem key={type.value} onClick={() => setTypeFilter(type.value)}>
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {safeDocuments.length === 0 ? 'No documents yet' : 'No documents found'}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {safeDocuments.length === 0
                ? 'Upload documents like lease agreements, insurance papers, and property photos to keep everything organized.'
                : `No documents match your search for "${searchTerm}".`
              }
            </p>
            {safeDocuments.length === 0 && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                {dictionary?.documents?.uploadFirstDocument || "Upload First Document"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => {
            const DocumentIcon = getDocumentIcon(document.mimeType, document.type)
            const typeLabel = documentTypes.find(t => t.value === document.type)?.label || document.type
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <DocumentIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{document.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(document.size)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={getTypeColor(document.type)}>
                      {typeLabel}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      <p>Uploaded {formatDate(document.uploadedAt.toISOString())}</p>
                      <p>by {document.uploadedBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Document Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {documentTypes.map((type) => {
              const count = safeDocuments.filter(d => d.type === type.value).length
              return (
                <div key={type.value}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{type.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
