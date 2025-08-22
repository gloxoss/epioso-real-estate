import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { EntityType, Prisma } from '@prisma/client'

export interface ActivityLogData {
  entityType: EntityType
  entityId: string
  action: string
  payload?: any
}

export interface ActivityFilters {
  entityType?: EntityType
  entityId?: string
  action?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
}

export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        email: true
        image: true
      }
    }
  }
}>

class ActivityRepository extends BaseRepository {
  async log(
    organizationId: string,
    data: ActivityLogData
  ): Promise<void> {
    const user = await this.getCurrentUser()

    await this.prisma.activityLog.create({
      data: {
        organizationId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: user.id,
        payload: data.payload || {},
      },
    })
  }

  async list(
    organizationId: string,
    filters: ActivityFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ActivityLogWithUser>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort || 'createdAt', pagination.dir || 'desc')

    const where: Prisma.ActivityLogWhereInput = {
      organizationId,
    }

    if (filters.entityType) {
      where.entityType = filters.entityType
    }

    if (filters.entityId) {
      where.entityId = filters.entityId
    }

    if (filters.action) {
      where.action = { contains: filters.action, mode: 'insensitive' }
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo
      }
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.activityLog.count({ where }),
    ])

    return this.buildPaginatedResult(activities, total, page, perPage)
  }

  async getRecentActivity(
    organizationId: string,
    limit: number = 10
  ): Promise<ActivityLogWithUser[]> {
    return this.prisma.activityLog.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  async getEntityActivity(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLogWithUser[]> {
    return this.prisma.activityLog.findMany({
      where: {
        organizationId,
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  async getUserActivity(
    organizationId: string,
    userId: string,
    limit: number = 50
  ): Promise<ActivityLogWithUser[]> {
    return this.prisma.activityLog.findMany({
      where: {
        organizationId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  async getActivityStats(organizationId: string, days: number = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const [
      totalActivities,
      activitiesByType,
      activitiesByUser,
      dailyActivity,
    ] = await Promise.all([
      this.prisma.activityLog.count({
        where: {
          organizationId,
          createdAt: { gte: since },
        },
      }),
      this.prisma.activityLog.groupBy({
        by: ['entityType'],
        where: {
          organizationId,
          createdAt: { gte: since },
        },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          createdAt: { gte: since },
        },
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM activity_logs 
        WHERE organization_id = ${organizationId}
          AND created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
    ])

    return {
      totalActivities,
      activitiesByType,
      activitiesByUser,
      dailyActivity,
    }
  }
}

export const activityRepo = new ActivityRepository()
