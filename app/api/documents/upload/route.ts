import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    const propertyId = formData.get('propertyId') as string
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const filename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadsDir, filename)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Get organization ID from property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { organizationId: true }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        organizationId: property.organizationId,
        filename: filename,
        originalName: originalName,
        mimeType: file.type,
        size: file.size,
        storageKey: `/uploads/documents/${filename}`,
        entityType: entityType as any || 'property',
        entityId: entityId || propertyId,
        category: type as any || 'other',
        tags: description ? [description] : [],
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.originalName,
        type: document.category,
        size: document.size,
        url: document.storageKey,
        uploadedAt: document.createdAt,
        uploadedBy: 'System',
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
