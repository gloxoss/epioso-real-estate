import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/rbac'
import { generateSignedUploadUrl, validateFile } from '@/lib/storage'
import { documentsRepo } from '@/repositories/documents'
import { propertiesRepo } from '@/repositories/properties'
import { DocumentCategory } from '@prisma/client'
import { revalidateTag } from 'next/cache'

export const POST = withApiAuth('documents:upload', async (session, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: propertyId } = await params
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'other'
    const description = formData.get('description') as string || ''
    const tags = formData.get('tags') as string || ''
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file.type, file.size)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Verify property exists and user has access
    const property = await propertiesRepo.findById(propertyId, session.organizationId)
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Generate a storage key for the document
    const timestamp = Date.now()
    const storageKey = `documents/${session.organizationId}/property/${propertyId}/${timestamp}-${file.name}`

    // For now, create document record without actual file upload
    // In a real implementation, you would upload to storage first
    const document = await documentsRepo.create(session.organizationId, {
      entityType: 'property',
      entityId: propertyId,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageKey: storageKey,
      category: category as DocumentCategory,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    })

    console.log('Document created successfully:', {
      id: document.id,
      name: document.originalName,
      propertyId,
      organizationId: session.organizationId
    })

    // Revalidate cache to refresh the documents page
    revalidateTag(`documents-${session.organizationId}`)
    revalidateTag(`property-documents-${propertyId}`)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.originalName,
        category: document.category,
        size: document.size,
        uploadedAt: document.createdAt,
      },
    })
  } catch (error) {
    console.error('Property document upload error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
})

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
