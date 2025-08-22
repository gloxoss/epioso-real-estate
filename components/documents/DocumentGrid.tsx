import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileVideo, 
  File,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/format'

interface Document {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  category: string
  entityType?: string
  entityId?: string
  createdAt: Date
}

interface DocumentGridProps {
  documents: Document[]
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType === 'application/pdf' || mimeType.includes('document')) return FileText
  return File
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    contract: 'bg-blue-100 text-blue-800',
    invoice: 'bg-green-100 text-green-800',
    receipt: 'bg-yellow-100 text-yellow-800',
    photo: 'bg-purple-100 text-purple-800',
    report: 'bg-orange-100 text-orange-800',
    legal: 'bg-red-100 text-red-800',
    maintenance: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.other
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p className="text-muted-foreground">Upload your first document to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => {
        const FileIcon = getFileIcon(document.mimeType)
        
        return (
          <Card key={document.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={document.originalName}>
                      {document.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(document.size)}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(document.category)}`}
                >
                  {document.category}
                </Badge>
                
                <div className="text-xs text-muted-foreground">
                  <p>{formatDate(document.createdAt.toISOString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
