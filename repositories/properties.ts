import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma } from '@prisma/client'

export interface PropertyFilters {
  search?: string
  hasUnits?: boolean
}

export interface PropertyCreateData {
  name: string
  address?: string | null
  description?: string | null
  propertyType?: string | null
  expectedUnits?: number | null
  imageUrl?: string | null
}

export interface PropertyUpdateData extends Partial<PropertyCreateData> {}

export type PropertyWithStats = Prisma.PropertyGetPayload<{
  include: {
    units: {
      select: {
        id: true
        status: true
      }
    }
    tickets: {
      where: {
        status: { in: ['open', 'in_progress'] }
      }
      select: { id: true }
    }
  }
}> & {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  pendingIssues: number
}

class PropertiesRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: PropertyFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PropertyWithStats>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.PropertyWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.hasUnits !== undefined) {
      if (filters.hasUnits) {
        where.units = { some: {} }
      } else {
        where.units = { none: {} }
      }
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          units: {
            select: {
              id: true,
              status: true,
            },
          },
          tickets: {
            where: {
              status: { in: ['open', 'in_progress'] },
            },
            select: { id: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.property.count({ where }),
    ])

    const enhancedProperties = properties.map(property => ({
      ...property,
      totalUnits: property.units.length,
      occupiedUnits: property.units.filter(u => u.status === 'occupied').length,
      vacantUnits: property.units.filter(u => u.status === 'available').length,
      pendingIssues: property.tickets.length,
    }))

    return this.buildPaginatedResult(enhancedProperties, total, page, perPage)
  }

  async findById(id: string, organizationId: string): Promise<PropertyWithStats | null> {
    const property = await this.prisma.property.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        units: {
          select: {
            id: true,
            status: true,
          },
        },
        tickets: {
          where: {
            status: { in: ['open', 'in_progress'] },
          },
          select: { id: true },
        },
      },
    })

    if (!property) return null

    return {
      ...property,
      totalUnits: property.units.length,
      occupiedUnits: property.units.filter(u => u.status === 'occupied').length,
      vacantUnits: property.units.filter(u => u.status === 'available').length,
      pendingIssues: property.tickets.length,
    }
  }

  async create(organizationId: string, data: PropertyCreateData) {
    return this.prisma.property.create({
      data: {
        ...data,
        organizationId,
      },
    })
  }

  async update(id: string, organizationId: string, data: PropertyUpdateData) {
    return this.prisma.property.update({
      where: {
        id,
        organizationId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async softDelete(id: string, organizationId: string) {
    // Since there's no deletedAt field, we'll do a hard delete for now
    return this.prisma.property.delete({
      where: {
        id,
        organizationId,
      },
    })
  }

  async getStats(organizationId: string) {
    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      pendingTickets,
    ] = await Promise.all([
      this.prisma.property.count({
        where: { organizationId },
      }),
      this.prisma.unit.count({
        where: {
          property: { organizationId },
        },
      }),
      this.prisma.unit.count({
        where: {
          property: { organizationId },
          status: 'occupied',
        },
      }),
      this.prisma.maintenanceTicket.count({
        where: {
          organizationId,
          status: { in: ['open', 'in_progress'] },
        },
      }),
    ])

    const occupancyRate = totalUnits > 0
      ? Math.round((occupiedUnits / totalUnits) * 100 * 10) / 10
      : 0

    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      occupancyRate,
      pendingIssues: pendingTickets,
    }
  }

  // Snapshot for dashboard
  async snapshot(organizationId: string, { limit = 6 }: { limit?: number } = {}) {
    const items = await this.prisma.property.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { units: { select: { status: true, isForSale: true, isForRent: true } }, tickets: { where: { status: { in: ['open','in_progress'] } }, select: { id: true } } },
    })
    return items.map(p => {
      const totalUnits = p.units.length
      const occupiedUnits = p.units.filter(u => u.status === 'occupied').length
      const vacant = totalUnits - occupiedUnits
      const occupancyPct = totalUnits ? (occupiedUnits / totalUnits) * 100 : 0
      return {
        id: p.id,
        name: p.name,
        imageUrl: (p as any).imageUrl ?? null,
        units: totalUnits,
        occupied: occupiedUnits,
        vacant,
        occupancyPct,
      }
    })
  }
}

export const propertiesRepo = new PropertiesRepository()
