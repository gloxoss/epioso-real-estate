import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, DealStatus, SaleType } from '@prisma/client'

export interface SalesFilters {
  search?: string
  status?: DealStatus
  saleType?: SaleType
  agentId?: string
  propertyId?: string
  unitId?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface SalesDealCreateData {
  leadId?: string | null
  unitId: string
  buyerId: string
  agentId: string
  dealNumber?: string
  saleType?: SaleType
  salePrice: number
  contractDate?: Date | null
  closingDate?: Date | null
  status?: DealStatus
  downPayment?: number | null
  financingAmount?: number | null
  notes?: string | null
}

export interface SalesDealUpdateData {
  leadId?: string | null
  saleType?: SaleType
  salePrice?: number
  contractDate?: Date | null
  closingDate?: Date | null
  status?: DealStatus
  downPayment?: number | null
  financingAmount?: number | null
  notes?: string | null
}

export type SalesDealWithDetails = Prisma.SalesDealGetPayload<{
  include: {
    lead: {
      select: {
        id: true
        status: true
        source: true
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
            address: true
          }
        }
      }
    }
    buyer: {
      select: {
        id: true
        name: true
        email: true
        phone: true
      }
    }
    agent: {
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
    paymentPlan: {
      select: {
        id: true
        status: true
        totalAmount: true
        downPayment: true
        installmentCount: true
        installmentAmount: true
      }
    }
    _count: {
      select: {
        commissions: true
      }
    }
  }
}>

class SalesRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: SalesFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<SalesDealWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.SalesDealWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { dealNumber: { contains: filters.search, mode: 'insensitive' } },
        { buyer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { unit: { unitNumber: { contains: filters.search, mode: 'insensitive' } } },
        { unit: { property: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.saleType) {
      where.saleType = filters.saleType
    }

    if (filters.agentId) {
      where.agentId = filters.agentId
    }

    if (filters.propertyId) {
      where.unit = { propertyId: filters.propertyId }
    }

    if (filters.unitId) {
      where.unitId = filters.unitId
    }

    if (filters.priceMin || filters.priceMax) {
      where.salePrice = {}
      if (filters.priceMin) {
        where.salePrice.gte = filters.priceMin
      }
      if (filters.priceMax) {
        where.salePrice.lte = filters.priceMax
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

    const [deals, total] = await Promise.all([
      this.prisma.salesDeal.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              status: true,
              source: true,
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
                  address: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          agent: {
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
          paymentPlan: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              downPayment: true,
              installmentCount: true,
              installmentAmount: true,
            },
          },
          _count: {
            select: {
              commissions: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.salesDeal.count({ where }),
    ])

    return {
      data: deals,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    }
  }

  async findById(id: string, organizationId: string): Promise<SalesDealWithDetails | null> {
    return this.prisma.salesDeal.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        lead: {
          select: {
            id: true,
            status: true,
            source: true,
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
                address: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        agent: {
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
        paymentPlan: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            downPayment: true,
            installmentCount: true,
            installmentAmount: true,
          },
        },
        _count: {
          select: {
            commissions: true,
          },
        },
      },
    })
  }

  async create(organizationId: string, data: SalesDealCreateData): Promise<SalesDealWithDetails> {
    // Generate deal number if not provided
    const dealNumber = data.dealNumber || await this.generateDealNumber(organizationId)

    // Verify related entities
    const [unit, buyer, agent] = await Promise.all([
      this.prisma.unit.findFirst({
        where: { id: data.unitId, property: { organizationId } },
      }),
      this.prisma.contact.findFirst({
        where: { id: data.buyerId, organizationId },
      }),
      this.prisma.salesAgent.findFirst({
        where: { id: data.agentId, organizationId },
      }),
    ])

    if (!unit) throw new Error('Unit not found or access denied')
    if (!buyer) throw new Error('Buyer not found or access denied')
    if (!agent) throw new Error('Sales agent not found or access denied')

    if (data.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: data.leadId, organizationId },
      })
      if (!lead) throw new Error('Lead not found or access denied')
    }

    const deal = await this.prisma.salesDeal.create({
      data: {
        ...data,
        dealNumber,
        organizationId,
      },
      include: {
        lead: {
          select: {
            id: true,
            status: true,
            source: true,
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
                address: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        agent: {
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
        paymentPlan: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            downPayment: true,
            installmentCount: true,
            installmentAmount: true,
          },
        },
        _count: {
          select: {
            commissions: true,
          },
        },
      },
    })

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'deal',
      entityId: deal.id,
      action: 'created',
      payload: { dealNumber: deal.dealNumber, salePrice: deal.salePrice },
    })

    return deal
  }

  private async generateDealNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.prisma.salesDeal.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })
    
    return `DEAL-${year}-${String(count + 1).padStart(4, '0')}`
  }
}

export const salesRepo = new SalesRepository()
