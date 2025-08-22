'use server'

import { withAuth } from '@/lib/rbac'
import { documentsRepo } from '@/repositories/documents'
import { activityRepo } from '@/repositories/activity'
import { DocumentUploadSchema } from '@/schemas'
import { revalidateTag } from 'next/cache'
import { EntityType, DocumentCategory } from '@prisma/client'

export type DocumentFormState = {
  errors?: {
    entityType?: string[]
    entityId?: string[]
    filename?: string[]
    category?: string[]
    tags?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const finalizeUpload = withAuth('documents:upload', async (
  session,
  data: {
    entityType: EntityType
    entityId: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    storageKey: string
    category?: DocumentCategory
    tags?: string[]
    width?: number
    height?: number
  }
): Promise<{ success?: boolean; error?: string; document?: any }> => {
  try {
    // Validate the upload data
    const validatedFields = DocumentUploadSchema.safeParse({
      entityType: data.entityType,
      entityId: data.entityId,
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      category: data.category || 'other',
      tags: data.tags || [],
    })

    if (!validatedFields.success) {
      return { error: 'Invalid upload data' }
    }

    // Create the document record
    const document = await documentsRepo.create(session.organizationId, {
      entityType: data.entityType,
      entityId: data.entityId,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      storageKey: data.storageKey,
      category: data.category || 'other',
      tags: data.tags || [],
      width: data.width,
      height: data.height,
    })

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'document' as EntityType,
      entityId: document.id,
      action: 'upload',
      payload: {
        filename: document.filename,
        originalName: document.originalName,
        entityType: data.entityType,
        entityId: data.entityId,
        size: data.size,
      },
    })

    // Revalidate cache
    revalidateTag('documents')
    
    return { success: true, document }
  } catch (error) {
    console.error('Document finalization error:', error)
    return { error: 'Failed to finalize document upload. Please try again.' }
  }
})

export const deleteDocument = withAuth('documents:delete', async (
  session,
  documentId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get document for logging
    const document = await documentsRepo.findById(documentId, session.organizationId)
    if (!document) {
      return { error: 'Document not found' }
    }

    // Delete the document (includes storage cleanup)
    await documentsRepo.delete(documentId, session.organizationId)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'document' as EntityType,
      entityId: documentId,
      action: 'delete',
      payload: {
        filename: document.filename,
        originalName: document.originalName,
      },
    })

    // Revalidate cache
    revalidateTag('documents')
    
    return { success: true }
  } catch (error) {
    console.error('Document deletion error:', error)
    return { error: 'Failed to delete document. Please try again.' }
  }
})

export const addDocumentTags = withAuth('documents:upload', async (
  session,
  documentId: string,
  tags: string[]
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Add tags to document
    const document = await documentsRepo.addTags(documentId, session.organizationId, tags)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'document' as EntityType,
      entityId: documentId,
      action: 'update',
      payload: {
        filename: document.filename,
        action: 'add_tags',
        tags,
      },
    })

    // Revalidate cache
    revalidateTag('documents')
    
    return { success: true }
  } catch (error) {
    console.error('Document tag addition error:', error)
    return { error: 'Failed to add tags. Please try again.' }
  }
})

export const removeDocumentTags = withAuth('documents:upload', async (
  session,
  documentId: string,
  tags: string[]
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Remove tags from document
    const document = await documentsRepo.removeTags(documentId, session.organizationId, tags)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'document' as EntityType,
      entityId: documentId,
      action: 'update',
      payload: {
        filename: document.filename,
        action: 'remove_tags',
        tags,
      },
    })

    // Revalidate cache
    revalidateTag('documents')
    
    return { success: true }
  } catch (error) {
    console.error('Document tag removal error:', error)
    return { error: 'Failed to remove tags. Please try again.' }
  }
})

export const getDocumentDownloadUrl = withAuth('documents:read', async (
  session,
  documentId: string,
  expiresIn: number = 3600
): Promise<{ success?: boolean; error?: string; url?: string }> => {
  try {
    // Generate signed download URL
    const url = await documentsRepo.getSignedUrl(documentId, session.organizationId, expiresIn)

    return { success: true, url }
  } catch (error) {
    console.error('Document download URL error:', error)
    return { error: 'Failed to generate download URL. Please try again.' }
  }
})
