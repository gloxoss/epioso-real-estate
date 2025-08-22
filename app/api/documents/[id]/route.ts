import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/rbac'
import { deleteDocument, getDocumentDownloadUrl } from '@/actions/documents'
import { documentsRepo } from '@/repositories/documents'
import { revalidateTag } from 'next/cache'

// GET - Download document
export const GET = withApiAuth('documents:read', async (session, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    
    const result = await getDocumentDownloadUrl(session, id)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    })
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
})

// DELETE - Delete document
export const DELETE = withApiAuth('documents:delete', async (session, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    
    const result = await deleteDocument(session, id)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Revalidate cache
    revalidateTag(`documents-${session.organizationId}`)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Document delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
})

// PUT - Update document
export const PUT = withApiAuth('documents:upload', async (session, request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await request.json()
    
    const document = await documentsRepo.update(id, session.organizationId, {
      tags: body.tags,
      category: body.category,
    })

    // Revalidate cache
    revalidateTag(`documents-${session.organizationId}`)

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error('Document update error:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
})
