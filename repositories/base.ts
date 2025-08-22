import prisma from '@/lib/prisma'
import { getCurrentDatabaseUser } from '@/lib/user'

export interface PaginationOptions {
  page?: number
  perPage?: number
  sort?: string
  dir?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export abstract class BaseRepository {
  protected prisma = prisma

  protected async getCurrentUser() {
    return getCurrentDatabaseUser()
  }

  protected buildPagination(options: PaginationOptions = {}) {
    const page = Math.max(1, options.page || 1)
    const perPage = Math.min(100, Math.max(10, options.perPage || 20))
    const skip = (page - 1) * perPage

    return {
      page,
      perPage,
      skip,
      take: perPage,
    }
  }

  protected buildPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / perPage)
    
    return {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  protected buildOrderBy(sort?: string, dir: 'asc' | 'desc' = 'desc') {
    if (!sort) return { createdAt: dir }
    
    // Handle nested sorts like 'property.name'
    if (sort.includes('.')) {
      const [relation, field] = sort.split('.')
      return { [relation]: { [field]: dir } }
    }
    
    return { [sort]: dir }
  }
}
