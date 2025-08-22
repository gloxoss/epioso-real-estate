import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma } from '@prisma/client'

export interface SalesAgentFilters {
  search?: string
  isActive?: boolean
  territory?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface SalesAgentCreateData {
  userId: string
  licenseNumber?: string | null
  commissionRate?: number
  territory?: string | null
  isActive?: boolean
}

export interface SalesAgentUpdateData {
  licenseNumber?: string | null
  commissionRate?: number
  territory?: string | null
  isActive?: boolean
}

export type SalesAgentWithDetails = Prisma.SalesAgentGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        email: true
        image: true
      }
    }
    _count: {
      select: {
        assignedUnits: true
        leads: true
        deals: true
        commissions: true
        appointments: true
      }
    }
  }
}>

export interface AgentPerformanceStats {
  agentId: string
  agentName: string
  totalDeals: number
  totalSales: number
  totalCommissions: number
  averageDealSize: number
  conversionRate: number
  activeLeads: number
  closedDeals: number
  pendingCommissions: number
}

class SalesAgentsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: SalesAgentFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<SalesAgentWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.SalesAgentWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
        { territory: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.territory) {
      where.territory = { contains: filters.territory, mode: 'insensitive' }
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

    const [agents, total] = await Promise.all([
      this.prisma.salesAgent.findMany({
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
          _count: {
            select: {
              assignedUnits: true,
              leads: true,
              deals: true,
              commissions: true,
              appointments: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.salesAgent.count({ where }),
    ])

    return {
      data: agents,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    }
  }

  async findById(id: string, organizationId: string): Promise<SalesAgentWithDetails | null> {
    return this.prisma.salesAgent.findFirst({
      where: {
        id,
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
        _count: {
          select: {
            assignedUnits: true,
            leads: true,
            deals: true,
            commissions: true,
            appointments: true,
          },
        },
      },
    })
  }

  async findByUserId(userId: string, organizationId: string): Promise<SalesAgentWithDetails | null> {
    return this.prisma.salesAgent.findFirst({
      where: {
        userId,
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
        _count: {
          select: {
            assignedUnits: true,
            leads: true,
            deals: true,
            commissions: true,
            appointments: true,
          },
        },
      },
    })
  }

  async create(organizationId: string, data: SalesAgentCreateData): Promise<SalesAgentWithDetails> {
    // Verify user exists and is member of organization
    const member = await this.prisma.member.findFirst({
      where: {
        userId: data.userId,
        organizationId,
      },
      include: {
        user: true,
      },
    })

    if (!member) {
      throw new Error('User not found or not a member of this organization')
    }

    // Check if user is already a sales agent
    const existingAgent = await this.prisma.salesAgent.findFirst({
      where: {
        userId: data.userId,
        organizationId,
      },
    })

    if (existingAgent) {
      throw new Error('User is already a sales agent')
    }

    const agent = await this.prisma.salesAgent.create({
      data: {
        ...data,
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
        _count: {
          select: {
            assignedUnits: true,
            leads: true,
            deals: true,
            commissions: true,
            appointments: true,
          },
        },
      },
    })

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'agent',
      entityId: agent.id,
      action: 'created',
      payload: { userId: data.userId, commissionRate: data.commissionRate },
    })

    return agent
  }

  async update(
    id: string,
    organizationId: string,
    data: SalesAgentUpdateData
  ): Promise<SalesAgentWithDetails> {
    // Verify agent exists
    const existingAgent = await this.findById(id, organizationId)
    if (!existingAgent) {
      throw new Error('Sales agent not found or access denied')
    }

    const agent = await this.prisma.salesAgent.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            assignedUnits: true,
            leads: true,
            deals: true,
            commissions: true,
            appointments: true,
          },
        },
      },
    })

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'agent',
      entityId: id,
      action: 'updated',
      payload: data,
    })

    return agent
  }

  async getPerformanceStats(
    organizationId: string,
    agentId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<AgentPerformanceStats[]> {
    const where: any = {
      organizationId,
    }

    if (agentId) {
      where.id = agentId
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = dateFrom
      }
      if (dateTo) {
        where.createdAt.lte = dateTo
      }
    }

    const agents = await this.prisma.salesAgent.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        deals: {
          where: dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          } : undefined,
          select: {
            salePrice: true,
            status: true,
          },
        },
        leads: {
          where: dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          } : undefined,
          select: {
            status: true,
          },
        },
        commissions: {
          where: {
            ...(dateFrom || dateTo ? {
              createdAt: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            } : {}),
          },
          select: {
            amount: true,
            status: true,
          },
        },
      },
    })

    return agents.map(agent => {
      const totalDeals = agent.deals.length
      const closedDeals = agent.deals.filter(d => d.status === 'completed').length
      const totalSales = agent.deals
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.salePrice.toNumber(), 0)
      const totalCommissions = agent.commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount.toNumber(), 0)
      const pendingCommissions = agent.commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount.toNumber(), 0)
      const activeLeads = agent.leads.filter(l => 
        !['closed_won', 'closed_lost'].includes(l.status)
      ).length
      const convertedLeads = agent.leads.filter(l => l.status === 'closed_won').length
      const totalLeads = agent.leads.length

      return {
        agentId: agent.id,
        agentName: agent.user.name || 'Unknown',
        totalDeals,
        totalSales,
        totalCommissions,
        averageDealSize: closedDeals > 0 ? totalSales / closedDeals : 0,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
        activeLeads,
        closedDeals,
        pendingCommissions,
      }
    })
  }
}

export const salesAgentsRepo = new SalesAgentsRepository()
