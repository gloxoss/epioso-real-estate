import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/rbac'
import { generateSignedUploadUrl, validateFile } from '@/lib/storage'
import { DocumentUploadSchema } from '@/schemas'

export const POST = withApiAuth('documents:upload', async (session, request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = DocumentUploadSchema.parse(body)
    
    // Validate file type and size
    const validation = validateFile(validatedData.mimeType, validatedData.size)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate signed upload URL
    const uploadData = await generateSignedUploadUrl({
      organizationId: session.organizationId,
      entityType: validatedData.entityType,
      entityId: validatedData.entityId,
      filename: validatedData.filename,
      mimeType: validatedData.mimeType,
      size: validatedData.size,
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: uploadData.signedUrl,
        storageKey: uploadData.storageKey,
        expiresIn: 3600, // 1 hour
      },
    })
  } catch (error) {
    console.error('Signed URL generation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
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
