'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  X,
  FileText,
  Image,
  FileVideo,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  category?: string
  tags: string[]
  description?: string
}

interface UploadDialogProps {
  children: React.ReactNode
  entityType?: string
  entityId?: string
  onUploadComplete?: (documents: any[]) => void
}

export function UploadDialog({
  children,
  entityType = 'property',
  entityId = '',
  onUploadComplete
}: UploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalCategory, setGlobalCategory] = useState('')
  const [globalTags, setGlobalTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 50MB limit`,
          variant: 'destructive'
        })
        return false
      }
      return true
    })

    const uploadFilesData: UploadFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      progress: 0,
      status: 'pending',
      tags: [],
      category: globalCategory
    }))

    setUploadFiles(prev => [...prev, ...uploadFilesData])
  }

  const removeFile = (id: string) => {
    setUploadFiles(files => files.filter(f => f.id !== id))
  }

  const updateFileData = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(files => files.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const uploadFile = async (uploadFile: UploadFile): Promise<boolean> => {
    try {
      updateFileData(uploadFile.id, { status: 'uploading', progress: 0 })

      // Use property-specific upload API if we have a property entityId
      if (entityType === 'property' && entityId) {
        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('category', uploadFile.category || 'other')
        formData.append('description', uploadFile.description || '')
        formData.append('tags', uploadFile.tags.join(', '))

        const uploadResponse = await fetch(`/api/properties/${entityId}/documents/upload`, {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await uploadResponse.json()

        if (result.success) {
          updateFileData(uploadFile.id, {
            status: 'completed',
            progress: 100
          })
          return true
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      } else {
        // For other entity types, simulate upload for now
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          updateFileData(uploadFile.id, { progress })
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Simulate successful upload
        updateFileData(uploadFile.id, {
          status: 'completed',
          progress: 100
        })

        return true
      }


    } catch (error) {
      updateFileData(uploadFile.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return

    setUploading(true)
    const results = await Promise.allSettled(
      uploadFiles.map(file => uploadFile(file))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - successful

    if (successful > 0) {
      toast({
        title: 'Upload completed',
        description: `${successful} file(s) uploaded successfully${failed > 0 ? `, ${failed} failed` : ''}`
      })

      onUploadComplete?.(uploadFiles.filter(f => f.status === 'completed'))

      // Refresh the page to show new documents
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1000) // Small delay to show the success message
      }
    }

    if (failed === 0) {
      // Reset and close if all successful
      setUploadFiles([])
      setGlobalCategory('')
      setGlobalTags('')
      setOpen(false)
    }

    setUploading(false)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('video/')) return FileVideo
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const applyGlobalSettings = () => {
    setUploadFiles(files => files.map(f => ({
      ...f,
      category: globalCategory || f.category,
      tags: globalTags ? globalTags.split(',').map(t => t.trim()) : f.tags
    })))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload and organize your documents with advanced categorization and tagging.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh]">
          <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                or click to browse files (max 50MB per file)
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 px-8 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Select Files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
            />
          </div>

          {/* Global Settings */}
          {uploadFiles.length > 0 && (
            <div className="p-6 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold mb-4 text-lg">Apply to All Files</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="global-category" className="text-sm font-medium">Category</Label>
                    <Select value={globalCategory} onValueChange={setGlobalCategory}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">Lease Agreement</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="photo">Photos</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="global-tags" className="text-sm font-medium">Tags (comma separated)</Label>
                    <Input
                      id="global-tags"
                      value={globalTags}
                      onChange={(e) => setGlobalTags(e.target.value)}
                      placeholder="urgent, contract, 2024"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={applyGlobalSettings}
                    className="h-10 px-6"
                  >
                    Apply to All Files
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to Upload ({uploadFiles.length})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadFiles([])}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadFiles.map((uploadFile) => {
                  const FileIcon = getFileIcon(uploadFile.file.type)

                  return (
                    <div key={uploadFile.id} className="p-6 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <FileIcon className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate" title={uploadFile.file.name}>
                              {uploadFile.file.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadFile.file.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {uploadFile.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                          {uploadFile.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-5 w-5" />
                              <span className="text-sm font-medium">Error</span>
                            </div>
                          )}
                          {uploadFile.status === 'uploading' && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span className="text-sm font-medium">Uploading</span>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                            disabled={uploading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Uploading...</span>
                            <span className="text-sm text-muted-foreground">
                              {uploadFile.progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={uploadFile.progress} className="h-3" />
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {uploadFile.error}
                        </div>
                      )}

                      {/* Individual File Settings */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Category</Label>
                            <Select
                              value={uploadFile.category || ''}
                              onValueChange={(value) => updateFileData(uploadFile.id, { category: value })}
                              disabled={uploading}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lease">Lease</SelectItem>
                                <SelectItem value="insurance">Insurance</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="financial">Financial</SelectItem>
                                <SelectItem value="legal">Legal</SelectItem>
                                <SelectItem value="photo">Photos</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tags</Label>
                            <Input
                              className="h-9"
                              value={uploadFile.tags.join(', ')}
                              onChange={(e) => updateFileData(uploadFile.id, {
                                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                              })}
                              placeholder="tag1, tag2"
                              disabled={uploading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Description (optional)</Label>
                          <Textarea
                            className="h-20 resize-none"
                            value={uploadFile.description || ''}
                            onChange={(e) => updateFileData(uploadFile.id, { description: e.target.value })}
                            placeholder="Brief description of this document..."
                            disabled={uploading}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="text-sm text-muted-foreground">
              {uploadFiles.length > 0 && (
                <div className="space-y-1">
                  <div>
                    {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} ready to upload
                  </div>
                  {(uploadFiles.some(f => f.status !== 'pending')) && (
                    <div className="text-xs">
                      {uploadFiles.filter(f => f.status === 'completed').length} completed, {' '}
                      {uploadFiles.filter(f => f.status === 'error').length} failed, {' '}
                      {uploadFiles.filter(f => f.status === 'pending').length} pending
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={uploading}
                className="h-10 px-4"
              >
                {uploading ? 'Close when done' : 'Cancel'}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadFiles.length === 0 || uploading}
                className="h-10 px-6"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
