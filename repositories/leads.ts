import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, LeadStatus, LeadSource } from '@prisma/client'

export interface LeadFilters {
  search?: string
  status?: LeadStatus
  source?: LeadSource
  assignedAgentId?: string
  propertyId?: string
  unitId?: string
  budgetMin?: number
  budgetMax?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface LeadCreateData {
  contactId?: string | null
  unitId?: string | null
  propertyId?: string | null
  assignedAgentId?: string | null
  status?: LeadStatus
  source?: LeadSource
  score?: number
  budget?: number
  timeline?: string | null
  notes?: string | null
  lastContactDate?: Date | null
  nextFollowUpDate?: Date | null
}

export interface LeadUpdateData {
  contactId?: string | null
  unitId?: string | null
  propertyId?: string | null
  assignedAgentId?: string | null
  status?: LeadStatus
  source?: LeadSource
  score?: number
  budget?: number
  timeline?: string | null
  notes?: string | null
  lastContactDate?: Date | null
  nextFollowUpDate?: Date | null
}

export type LeadWithDetails = Prisma.LeadGetPayload<{
  include: {
    contact: {
      select: {
        id: true
        name: true
        email: true
        phone: true
        type: true
      }
    }
    unit: {
      select: {
        id: true
        unitNumber: true
        salePrice: true
        property: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
    property: {
      select: {
        id: true
        name: true
        address: true
      }
    }
    assignedAgent: {
      select: {
        id: true
        user: {
          select: {
            id: true
            name: true
            email: true
          }
        }
      }
    }
    _count: {
      select: {
        activities: true
        appointments: true
        deals: true
      }
    }
  }
}>

class LeadsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: LeadFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<LeadWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.LeadWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        {
          contact: {
            name: { contains: filters.search, mode: 'insensitive' }
          }
        },
        {
          contact: {
            email: { contains: filters.search, mode: 'insensitive' }
          }
        },
        {
          notes: { contains: filters.search, mode: 'insensitive' }
        }
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.source) {
      where.source = filters.source
    }

    if (filters.assignedAgentId) {
      where.assignedAgentId = filters.assignedAgentId
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId
    }

    if (filters.unitId) {
      where.unitId = filters.unitId
    }

    if (filters.budgetMin || filters.budgetMax) {
      where.budget = {}
      if (filters.budgetMin) {
        where.budget.gte = filters.budgetMin
      }
      if (filters.budgetMax) {
        where.budget.lte = filters.budgetMax
      }
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

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              type: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              salePrice: true,
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          assignedAgent: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              activities: true,
              appointments: true,
              deals: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.lead.count({ where }),
    ])

    return {
      data: leads,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    }
  }

  async findById(id: string, organizationId: string): Promise<LeadWithDetails | null> {
    return this.prisma.lead.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            salePrice: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            appointments: true,
            deals: true,
          },
        },
      },
    })
  }

  async create(organizationId: string, data: LeadCreateData): Promise<LeadWithDetails> {
    // Verify related entities belong to organization
    if (data.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: data.contactId, organizationId },
      })
      if (!contact) {
        throw new Error('Contact not found or access denied')
      }
    }

    if (data.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: {
          id: data.unitId,
          property: { organizationId },
        },
      })
      if (!unit) {
        throw new Error('Unit not found or access denied')
      }
    }

    if (data.propertyId) {
      const property = await this.prisma.property.findFirst({
        where: { id: data.propertyId, organizationId },
      })
      if (!property) {
        throw new Error('Property not found or access denied')
      }
    }

    if (data.assignedAgentId) {
      const agent = await this.prisma.salesAgent.findFirst({
        where: { id: data.assignedAgentId, organizationId },
      })
      if (!agent) {
        throw new Error('Sales agent not found or access denied')
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            salePrice: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            appointments: true,
            deals: true,
          },
        },
      },
    })

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'lead',
      entityId: lead.id,
      action: 'created',
      payload: { leadId: lead.id, status: lead.status },
    })

    return lead
  }
}

export const leadsRepo = new LeadsRepository()
