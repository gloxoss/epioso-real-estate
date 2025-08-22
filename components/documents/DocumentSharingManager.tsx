'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Share2, 
  Plus, 
  Copy, 
  Eye, 
  Download,
  Calendar,
  User,
  Shield,
  Link2,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface DocumentShare {
  id: string
  documentId: string
  documentName: string
  shareType: 'public' | 'private' | 'password' | 'expiring'
  shareUrl: string
  password?: string
  expiresAt?: Date
  permissions: {
    canView: boolean
    canDownload: boolean
    canComment: boolean
  }
  createdAt: Date
  createdBy: string
  accessCount: number
  lastAccessedAt?: Date
  recipients: Array<{
    email: string
    accessedAt?: Date
    accessCount: number
  }>
  isActive: boolean
}

interface DocumentSharingManagerProps {
  documentId: string
  documentName: string
  existingShares: DocumentShare[]
  onShareCreated?: (share: DocumentShare) => void
  onShareUpdated?: (share: DocumentShare) => void
  onShareDeleted?: (shareId: string) => void
}

export function DocumentSharingManager({
  documentId,
  documentName,
  existingShares,
  onShareCreated,
  onShareUpdated,
  onShareDeleted
}: DocumentSharingManagerProps) {
  const [createShareOpen, setCreateShareOpen] = useState(false)
  const [selectedShare, setSelectedShare] = useState<DocumentShare | null>(null)
  const { toast } = useToast()

  const copyShareUrl = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard'
      })
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard',
        variant: 'destructive'
      })
    }
  }

  const getShareTypeColor = (shareType: DocumentShare['shareType']) => {
    switch (shareType) {
      case 'public':
        return 'bg-green-100 text-green-800'
      case 'private':
        return 'bg-blue-100 text-blue-800'
      case 'password':
        return 'bg-amber-100 text-amber-800'
      case 'expiring':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getShareTypeIcon = (shareType: DocumentShare['shareType']) => {
    switch (shareType) {
      case 'public':
        return <Link2 className="h-4 w-4" />
      case 'private':
        return <User className="h-4 w-4" />
      case 'password':
        return <Shield className="h-4 w-4" />
      case 'expiring':
        return <Clock className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  const isShareExpired = (share: DocumentShare) => {
    return share.expiresAt && new Date(share.expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Sharing</h3>
          <p className="text-sm text-muted-foreground">
            Manage access and sharing for "{documentName}"
          </p>
        </div>
        <Dialog open={createShareOpen} onOpenChange={setCreateShareOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Share Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Share Link</DialogTitle>
              <DialogDescription>
                Generate a secure link to share this document
              </DialogDescription>
            </DialogHeader>
            <CreateShareForm 
              documentId={documentId}
              documentName={documentName}
              onClose={() => setCreateShareOpen(false)}
              onShareCreated={onShareCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Shares */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shares ({existingShares.filter(s => s.isActive).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {existingShares.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No shares created yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a share link to give others access to this document
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Share Type</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingShares.map((share) => (
                  <TableRow key={share.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getShareTypeIcon(share.shareType)}
                        <Badge className={getShareTypeColor(share.shareType)}>
                          {share.shareType}
                        </Badge>
                        {isShareExpired(share) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {share.permissions.canView && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Badge>
                        )}
                        {share.permissions.canDownload && (
                          <Badge variant="outline" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(share.createdAt.toISOString())}</p>
                        <p className="text-xs text-muted-foreground">by {share.createdBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {share.expiresAt ? (
                        <div>
                          <p className="text-sm">{formatDate(share.expiresAt.toISOString())}</p>
                          {isShareExpired(share) && (
                            <p className="text-xs text-red-600">Expired</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{share.accessCount} views</p>
                        {share.lastAccessedAt && (
                          <p className="text-xs text-muted-foreground">
                            Last: {formatDate(share.lastAccessedAt.toISOString())}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyShareUrl(share.shareUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedShare(share)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShareDeleted?.(share.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Share Details Modal */}
      {selectedShare && (
        <Dialog open={!!selectedShare} onOpenChange={() => setSelectedShare(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Details</DialogTitle>
              <DialogDescription>
                Detailed information about this share link
              </DialogDescription>
            </DialogHeader>
            <ShareDetailsView share={selectedShare} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CreateShareForm({ 
  documentId, 
  documentName, 
  onClose, 
  onShareCreated 
}: {
  documentId: string
  documentName: string
  onClose: () => void
  onShareCreated?: (share: DocumentShare) => void
}) {
  const [shareType, setShareType] = useState<'public' | 'private' | 'password' | 'expiring'>('public')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [permissions, setPermissions] = useState({
    canView: true,
    canDownload: true,
    canComment: false
  })
  const [recipients, setRecipients] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create share link
      const shareData = {
        documentId,
        shareType,
        password: shareType === 'password' ? password : undefined,
        expiresAt: shareType === 'expiring' && expiresAt ? new Date(expiresAt) : undefined,
        permissions,
        recipients: recipients ? recipients.split(',').map(email => email.trim()) : []
      }

      console.log('Creating share:', shareData)
      
      // In real implementation, this would call the API
      // const response = await fetch('/api/documents/shares', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(shareData)
      // })

      onClose()
    } catch (error) {
      console.error('Error creating share:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Share Type</Label>
        <Select value={shareType} onValueChange={(value: any) => setShareType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public Link</SelectItem>
            <SelectItem value="private">Private (Email Required)</SelectItem>
            <SelectItem value="password">Password Protected</SelectItem>
            <SelectItem value="expiring">Expiring Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {shareType === 'password' && (
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
      )}

      {shareType === 'expiring' && (
        <div>
          <Label>Expires At</Label>
          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      )}

      <div>
        <Label>Permissions</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="can-view"
              checked={permissions.canView}
              onChange={(e) => setPermissions(prev => ({ ...prev, canView: e.target.checked }))}
            />
            <Label htmlFor="can-view">Can view document</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="can-download"
              checked={permissions.canDownload}
              onChange={(e) => setPermissions(prev => ({ ...prev, canDownload: e.target.checked }))}
            />
            <Label htmlFor="can-download">Can download document</Label>
          </div>
        </div>
      </div>

      {shareType === 'private' && (
        <div>
          <Label>Recipients (comma separated emails)</Label>
          <Textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="john@example.com, jane@example.com"
            rows={2}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Share Link'}
        </Button>
      </div>
    </div>
  )
}

function ShareDetailsView({ share }: { share: DocumentShare }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Share Type</Label>
          <div className="flex items-center gap-2 mt-1">
            {getShareTypeIcon(share.shareType)}
            <Badge className={getShareTypeColor(share.shareType)}>
              {share.shareType}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Access Count</Label>
          <p className="mt-1 font-medium">{share.accessCount} views</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">Share URL</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input value={share.shareUrl} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {share.recipients.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Recipients</Label>
          <div className="space-y-2 mt-2">
            {share.recipients.map((recipient, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{recipient.email}</span>
                <div className="text-xs text-muted-foreground">
                  {recipient.accessedAt ? (
                    `Accessed ${formatDate(recipient.accessedAt.toISOString())}`
                  ) : (
                    'Not accessed'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getShareTypeColor(shareType: DocumentShare['shareType']) {
  switch (shareType) {
    case 'public':
      return 'bg-green-100 text-green-800'
    case 'private':
      return 'bg-blue-100 text-blue-800'
    case 'password':
      return 'bg-amber-100 text-amber-800'
    case 'expiring':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getShareTypeIcon(shareType: DocumentShare['shareType']) {
  switch (shareType) {
    case 'public':
      return <Link2 className="h-4 w-4" />
    case 'private':
      return <User className="h-4 w-4" />
    case 'password':
      return <Shield className="h-4 w-4" />
    case 'expiring':
      return <Clock className="h-4 w-4" />
    default:
      return <Share2 className="h-4 w-4" />
  }
}
