import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Upload, 
  Download, 
  Eye, 
  RotateCcw,
  GitBranch,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  History
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/format'

interface DocumentVersion {
  id: string
  version: number
  filename: string
  size: number
  uploadedAt: Date
  uploadedBy: string
  changeLog?: string
  isActive: boolean
  downloadUrl: string
  checksum: string
  changes: {
    added: number
    modified: number
    deleted: number
  }
}

interface DocumentVersionControlProps {
  documentId: string
  documentName: string
  versions: DocumentVersion[]
  currentVersion: number
  onVersionUpload?: (version: DocumentVersion) => void
  onVersionRestore?: (versionId: string) => void
  onVersionDownload?: (versionId: string) => void
}

export function DocumentVersionControl({
  documentId,
  documentName,
  versions,
  currentVersion,
  onVersionUpload,
  onVersionRestore,
  onVersionDownload
}: DocumentVersionControlProps) {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version)
  const latestVersion = sortedVersions[0]

  const getVersionStatus = (version: DocumentVersion) => {
    if (version.version === currentVersion) {
      return { label: 'Current', variant: 'default' as const, icon: CheckCircle }
    }
    if (version.version === latestVersion?.version) {
      return { label: 'Latest', variant: 'secondary' as const, icon: Clock }
    }
    return { label: 'Archived', variant: 'outline' as const, icon: History }
  }

  const calculateVersionDiff = (version: DocumentVersion, previousVersion?: DocumentVersion) => {
    if (!previousVersion) return null
    
    const sizeDiff = version.size - previousVersion.size
    const sizeChange = sizeDiff > 0 ? `+${formatFileSize(sizeDiff)}` : formatFileSize(sizeDiff)
    
    return {
      sizeChange,
      isIncrease: sizeDiff > 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-muted-foreground">
            Track changes and manage versions for "{documentName}"
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload New Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Version</DialogTitle>
              <DialogDescription>
                Upload a new version of this document
              </DialogDescription>
            </DialogHeader>
            <UploadVersionForm 
              documentId={documentId}
              currentVersion={currentVersion}
              onVersionUpload={onVersionUpload}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Version Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Versions</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
            <p className="text-xs text-muted-foreground">
              Current: v{currentVersion}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestVersion ? formatFileSize(latestVersion.size) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest version
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestVersion ? formatDate(latestVersion.uploadedAt.toISOString()).split(' ')[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestVersion ? `by ${latestVersion.uploadedBy}` : 'No versions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(versions.reduce((sum, v) => sum + v.size, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              All versions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Version Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Version Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No versions available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVersions.map((version, index) => {
                  const status = getVersionStatus(version)
                  const StatusIcon = status.icon
                  const previousVersion = sortedVersions[index + 1]
                  const diff = calculateVersionDiff(version, previousVersion)
                  
                  return (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">v{version.version}</span>
                          </div>
                          <div>
                            <p className="font-medium">Version {version.version}</p>
                            {version.changeLog && (
                              <p className="text-xs text-muted-foreground truncate max-w-48">
                                {version.changeLog}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {version.changes && (
                          <div className="flex gap-2">
                            {version.changes.added > 0 && (
                              <Badge variant="outline" className="text-green-600 text-xs">
                                +{version.changes.added}
                              </Badge>
                            )}
                            {version.changes.modified > 0 && (
                              <Badge variant="outline" className="text-blue-600 text-xs">
                                ~{version.changes.modified}
                              </Badge>
                            )}
                            {version.changes.deleted > 0 && (
                              <Badge variant="outline" className="text-red-600 text-xs">
                                -{version.changes.deleted}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatFileSize(version.size)}</p>
                          {diff && (
                            <p className={`text-xs ${diff.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                              {diff.sizeChange}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(version.uploadedAt.toISOString())}</p>
                          <p className="text-xs text-muted-foreground">by {version.uploadedBy}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onVersionDownload?.(version.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {version.version !== currentVersion && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onVersionRestore?.(version.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Version Comparison */}
      {versions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Version Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Version comparison coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">
                Compare changes between different versions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UploadVersionForm({ 
  documentId, 
  currentVersion, 
  onVersionUpload 
}: {
  documentId: string
  currentVersion: number
  onVersionUpload?: (version: DocumentVersion) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [changeLog, setChangeLog] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // Upload new version
      const versionData = {
        documentId,
        file,
        changeLog,
        version: currentVersion + 1
      }

      console.log('Uploading new version:', versionData)
      
      // In real implementation, this would call the API
      // const response = await fetch('/api/documents/versions', {
      //   method: 'POST',
      //   body: formData
      // })

      // Reset form
      setFile(null)
      setChangeLog('')
    } catch (error) {
      console.error('Error uploading version:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="version-file">Select File</Label>
        <Input
          id="version-file"
          type="file"
          onChange={handleFileChange}
          className="mt-1"
        />
        {file && (
          <p className="text-xs text-muted-foreground mt-1">
            {file.name} ({formatFileSize(file.size)})
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="change-log">Change Log</Label>
        <Textarea
          id="change-log"
          value={changeLog}
          onChange={(e) => setChangeLog(e.target.value)}
          placeholder="Describe what changed in this version..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium">New Version: v{currentVersion + 1}</p>
        <p className="text-xs text-muted-foreground">
          This will create a new version while keeping all previous versions
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload Version'}
        </Button>
      </div>
    </div>
  )
}
