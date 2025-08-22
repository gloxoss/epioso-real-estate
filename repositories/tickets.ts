import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, TicketStatus, TicketPriority } from '@prisma/client'

export interface TicketFilters {
  search?: string
  status?: TicketStatus
  priority?: TicketPriority
  propertyId?: string
  unitId?: string
  assignedToUserId?: string
}

export interface TicketCreateData {
  propertyId: string
  unitId?: string | null
  title: string
  description: string
  priority: TicketPriority
  cost?: number | null
}

export interface TicketUpdateData extends Partial<Omit<TicketCreateData, 'propertyId'>> {
  status?: TicketStatus
  assignedToUserId?: string | null
  cost?: number | null
}

export type TicketWithDetails = Prisma.MaintenanceTicketGetPayload<{
  include: {
    property: {
      select: {
        id: true
        name: true
        address: true
      }
    }
    unit: {
      select: {
        id: true
        unitNumber: true
      }
    }
    assignedTo: {
      select: {
        userId: true
        user: {
          select: {
            id: true
            name: true
            email: true
          }
        }
      }
    }
  }
}>

class TicketsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: TicketFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<TicketWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.MaintenanceTicketWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { property: { name: { contains: filters.search, mode: 'insensitive' } } },
        { unit: { unitNumber: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId
    }

    if (filters.unitId) {
      where.unitId = filters.unitId
    }

    if (filters.assignedToUserId) {
      where.assignedToUserId = filters.assignedToUserId
    }

    const [tickets, total] = await Promise.all([
      this.prisma.maintenanceTicket.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
            },
          },
          assignedTo: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.maintenanceTicket.count({ where }),
    ])

    return this.buildPaginatedResult(tickets, total, page, perPage)
  }

  async findById(id: string, organizationId: string): Promise<TicketWithDetails | null> {
    return this.prisma.maintenanceTicket.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async create(organizationId: string, data: TicketCreateData): Promise<TicketWithDetails> {
    // Verify property belongs to organization
    const property = await this.prisma.property.findFirst({
      where: {
        id: data.propertyId,
        organizationId,
      },
    })

    if (!property) {
      throw new Error('Property not found or access denied')
    }

    // Verify unit belongs to property if specified
    if (data.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: {
          id: data.unitId,
          propertyId: data.propertyId,
        },
      })

      if (!unit) {
        throw new Error('Unit not found or does not belong to this property')
      }
    }

    return this.prisma.maintenanceTicket.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async update(
    id: string,
    organizationId: string,
    data: TicketUpdateData
  ): Promise<TicketWithDetails> {
    return this.prisma.maintenanceTicket.update({
      where: {
        id,
        organizationId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: TicketStatus
  ): Promise<TicketWithDetails> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    // Set closedAt when ticket is resolved or closed
    if (status === 'resolved' || status === 'closed') {
      updateData.closedAt = new Date()
    }

    return this.prisma.maintenanceTicket.update({
      where: {
        id,
        organizationId,
      },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async assignTicket(
    id: string,
    organizationId: string,
    assignedToUserId: string
  ): Promise<TicketWithDetails> {
    // Verify the user is a member of the organization
    const member = await this.prisma.member.findFirst({
      where: {
        organizationId,
        userId: assignedToUserId,
      },
    })

    if (!member) {
      throw new Error('User is not a member of this organization')
    }

    return this.prisma.maintenanceTicket.update({
      where: {
        id,
        organizationId,
      },
      data: {
        assignedToOrgId: organizationId,
        assignedToUserId,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async getByProperty(
    organizationId: string,
    propertyId: string,
    filters: { status?: TicketStatus[] } = {}
  ): Promise<TicketWithDetails[]> {
    const where: any = {
      organizationId,
      propertyId,
    }

    if (filters.status) {
      where.status = { in: filters.status }
    }

    return this.prisma.maintenanceTicket.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getByUnit(
    organizationId: string,
    unitId: string,
    filters: { status?: TicketStatus[] } = {}
  ): Promise<TicketWithDetails[]> {
    const where: any = {
      organizationId,
      unitId,
    }

    if (filters.status) {
      where.status = { in: filters.status }
    }

    return this.prisma.maintenanceTicket.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        assignedTo: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getAllByUnit(
    organizationId: string,
    unitId: string
  ): Promise<TicketWithDetails[]> {
    // Get all tickets for a unit regardless of status
    return this.getByUnit(organizationId, unitId, {})
  }

  async getStats(organizationId: string) {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalCost,
      ticketsByPriority,
      recentTickets,
    ] = await Promise.all([
      this.prisma.maintenanceTicket.count({
        where: { organizationId },
      }),
      this.prisma.maintenanceTicket.count({
        where: { organizationId, status: 'open' },
      }),
      this.prisma.maintenanceTicket.count({
        where: { organizationId, status: 'in_progress' },
      }),
      this.prisma.maintenanceTicket.count({
        where: { organizationId, status: 'resolved' },
      }),
      this.prisma.maintenanceTicket.aggregate({
        where: { organizationId },
        _sum: { cost: true },
      }),
      this.prisma.maintenanceTicket.groupBy({
        by: ['priority'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.maintenanceTicket.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          property: {
            select: {
              name: true,
            },
          },
          unit: {
            select: {
              unitNumber: true,
            },
          },
        },
      }),
    ])

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalCost: totalCost._sum.cost || 0,
      ticketsByPriority,
      recentTickets,
    }
  }
}

export const ticketsRepo = new TicketsRepository()
