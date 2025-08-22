import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, EntityType, DocumentCategory } from '@prisma/client'
import { generateSignedDownloadUrl, deleteFile } from '@/lib/storage'

export interface DocumentFilters {
  search?: string
  entityType?: EntityType
  entityId?: string
  category?: DocumentCategory
  tags?: string[]
  mimeType?: string
}

export interface DocumentCreateData {
  entityType: EntityType
  entityId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  storageKey: string
  category?: DocumentCategory
  tags?: string[]
  width?: number | null
  height?: number | null
  expiresAt?: Date | null
}

export interface DocumentUpdateData {
  filename?: string
  category?: DocumentCategory
  tags?: string[]
  expiresAt?: Date | null
}

export type DocumentWithDetails = Prisma.DocumentGetPayload<{}>

class DocumentsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: DocumentFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<DocumentWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.DocumentWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { filename: { contains: filters.search, mode: 'insensitive' } },
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ]
    }

    if (filters.entityType) {
      where.entityType = filters.entityType
    }

    if (filters.entityId) {
      where.entityId = filters.entityId
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasEvery: filters.tags,
      }
    }

    if (filters.mimeType) {
      where.mimeType = { contains: filters.mimeType, mode: 'insensitive' }
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.document.count({ where }),
    ])

    return this.buildPaginatedResult(documents, total, page, perPage)
  }

  async findById(id: string, organizationId: string): Promise<DocumentWithDetails | null> {
    return this.prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
    })
  }

  async create(organizationId: string, data: DocumentCreateData): Promise<DocumentWithDetails> {
    // Check for existing document with same entity and filename for versioning
    const existingDoc = await this.prisma.document.findFirst({
      where: {
        organizationId,
        entityType: data.entityType,
        entityId: data.entityId,
        originalName: data.originalName,
      },
      orderBy: {
        version: 'desc',
      },
    })

    const version = existingDoc ? existingDoc.version + 1 : 1

    return this.prisma.document.create({
      data: {
        ...data,
        organizationId,
        version,
      },
    })
  }

  async update(
    id: string,
    organizationId: string,
    data: DocumentUpdateData
  ): Promise<DocumentWithDetails> {
    return this.prisma.document.update({
      where: {
        id,
        organizationId,
      },
      data,
    })
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const document = await this.findById(id, organizationId)
    if (!document) {
      throw new Error('Document not found')
    }

    // Delete from storage
    await deleteFile(document.storageKey)

    // Delete from database
    await this.prisma.document.delete({
      where: {
        id,
        organizationId,
      },
    })
  }

  async getSignedUrl(id: string, organizationId: string, expiresIn: number = 3600): Promise<string> {
    const document = await this.findById(id, organizationId)
    if (!document) {
      throw new Error('Document not found')
    }

    return generateSignedDownloadUrl(document.storageKey, expiresIn)
  }

  async getByEntity(
    organizationId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<DocumentWithDetails[]> {
    return this.prisma.document.findMany({
      where: {
        organizationId,
        entityType,
        entityId,
      },
      orderBy: [
        { version: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }

  async getVersions(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    originalName: string
  ): Promise<DocumentWithDetails[]> {
    return this.prisma.document.findMany({
      where: {
        organizationId,
        entityType,
        entityId,
        originalName,
      },
      orderBy: {
        version: 'desc',
      },
    })
  }

  async getLatestVersion(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    originalName: string
  ): Promise<DocumentWithDetails | null> {
    return this.prisma.document.findFirst({
      where: {
        organizationId,
        entityType,
        entityId,
        originalName,
      },
      orderBy: {
        version: 'desc',
      },
    })
  }

  async addTags(id: string, organizationId: string, tags: string[]): Promise<DocumentWithDetails> {
    const document = await this.findById(id, organizationId)
    if (!document) {
      throw new Error('Document not found')
    }

    const existingTags = document.tags || []
    const newTags = [...new Set([...existingTags, ...tags])]

    return this.update(id, organizationId, { tags: newTags })
  }

  async removeTags(id: string, organizationId: string, tags: string[]): Promise<DocumentWithDetails> {
    const document = await this.findById(id, organizationId)
    if (!document) {
      throw new Error('Document not found')
    }

    const existingTags = document.tags || []
    const newTags = existingTags.filter(tag => !tags.includes(tag))

    return this.update(id, organizationId, { tags: newTags })
  }

  async getStats(organizationId: string) {
    const [
      totalDocuments,
      totalSize,
      documentsByCategory,
      documentsByType,
      recentDocuments,
    ] = await Promise.all([
      this.prisma.document.count({
        where: { organizationId },
      }),
      this.prisma.document.aggregate({
        where: { organizationId },
        _sum: { size: true },
      }),
      this.prisma.document.groupBy({
        by: ['category'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.document.groupBy({
        by: ['mimeType'],
        where: { organizationId },
        _count: true,
        orderBy: {
          _count: {
            mimeType: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.document.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      }),
    ])

    return {
      totalDocuments,
      totalSize: totalSize._sum.size || 0,
      documentsByCategory,
      documentsByType,
      recentDocuments,
    }
  }

  async cleanup(organizationId: string): Promise<number> {
    // Find expired documents
    const expiredDocuments = await this.prisma.document.findMany({
      where: {
        organizationId,
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    let deletedCount = 0

    for (const doc of expiredDocuments) {
      try {
        await this.delete(doc.id, organizationId)
        deletedCount++
      } catch (error) {
        console.error(`Failed to delete expired document ${doc.id}:`, error)
      }
    }

    return deletedCount
  }

  async getByProperty(
    organizationId: string,
    propertyId: string,
    filters: DocumentFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<DocumentWithDetails>> {
    return this.list(organizationId, {
      ...filters,
      entityType: 'property',
      entityId: propertyId
    }, pagination)
  }
}

export const documentsRepo = new DocumentsRepository()
