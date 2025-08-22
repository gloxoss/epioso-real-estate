'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Download, Edit, Trash2, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DocumentActionsProps {
  document: {
    id: string
    name: string
    category: string
    tags: string[]
    description?: string
    mimeType: string
  }
}

export function DocumentActions({ document }: DocumentActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [editData, setEditData] = useState({
    category: document.category,
    tags: document.tags,
    newTag: '',
  })

  const handleView = () => {
    setIsViewOpen(true)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/documents/${document.id}`)
      const result = await response.json()

      if (result.success && result.url) {
        // Create a temporary link to download the file
        const link = document.createElement('a')
        link.href = result.url
        link.download = document.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: 'Download started',
          description: `Downloading ${document.name}`,
        })
      } else {
        throw new Error(result.error || 'Failed to get download URL')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Download failed',
        description: 'Failed to download the document. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: editData.category,
          tags: editData.tags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Document updated',
          description: 'Document has been updated successfully.',
        })
        setIsEditOpen(false)

        // Refresh the page to show updated document
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        throw new Error(result.error || 'Failed to update document')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Document deleted',
          description: 'Document has been deleted successfully.',
        })

        // Refresh the page to show updated document list
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        throw new Error(result.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const addTag = () => {
    if (editData.newTag.trim() && !editData.tags.includes(editData.newTag.trim())) {
      setEditData({
        ...editData,
        tags: [...editData.tags, editData.newTag.trim()],
        newTag: '',
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditData({
      ...editData,
      tags: editData.tags.filter(tag => tag !== tagToRemove),
    })
  }

  return (
    <div className="flex gap-1 pt-2">
      {/* View Button */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleView}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              View document information and metadata
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm font-medium">{document.name}</p>
            </div>
            <div>
              <Label>Category</Label>
              <p className="text-sm">{document.category}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p className="text-sm">{document.mimeType}</p>
            </div>
            {document.tags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2" 
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <Download className="h-3 w-3" />
      </Button>

      {/* Edit Button */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2">
            <Edit className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update document category and tags
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={editData.category} onValueChange={(value) => setEditData({...editData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag"
                  value={editData.newTag}
                  onChange={(e) => setEditData({...editData, newTag: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2">
            <Trash2 className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{document.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
