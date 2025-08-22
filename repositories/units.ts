import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, UnitStatus } from '@prisma/client'

export interface UnitFilters {
  search?: string
  status?: UnitStatus
  propertyId?: string
}

export interface UnitCreateData {
  propertyId: string
  unitNumber: string
  floor?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  size?: number | null
  rentAmount?: number | null
  depositAmount?: number | null
  status: UnitStatus
  description?: string | null
  attributes?: any
}

export interface UnitUpdateData extends Partial<Omit<UnitCreateData, 'propertyId'>> {}

export type UnitWithDetails = Prisma.UnitGetPayload<{
  include: {
    property: {
      select: {
        id: true
        name: true
        organizationId: true
      }
    }
    statusHistory: {
      include: {
        changedBy: {
          select: {
            id: true
            name: true
            email: true
          }
        }
      }
      orderBy: {
        changedAt: 'desc'
      }
      take: 10
    }
  }
}>

class UnitsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: UnitFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<UnitWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.UnitWhereInput = {
      property: {
        organizationId,
      },
    }

    if (filters.search) {
      where.OR = [
        { unitNumber: { contains: filters.search, mode: 'insensitive' } },
        { property: { name: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId
    }

    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          },
          statusHistory: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              changedAt: 'desc',
            },
            take: 10,
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.unit.count({ where }),
    ])

    return this.buildPaginatedResult(units, total, page, perPage)
  }

  async findById(id: string, organizationId: string): Promise<UnitWithDetails | null> {
    return this.prisma.unit.findFirst({
      where: {
        id,
        property: {
          organizationId,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: 'desc',
          },
          take: 10,
        },
      },
    })
  }

  async create(organizationId: string, data: UnitCreateData) {
    const user = await this.getCurrentUser()

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

    // Check for duplicate unit number
    const existingUnit = await this.prisma.unit.findFirst({
      where: {
        propertyId: data.propertyId,
        unitNumber: data.unitNumber,
      },
    })

    if (existingUnit) {
      throw new Error('Unit number already exists for this property')
    }

    return this.prisma.$transaction(async (tx) => {
      // Separate basic fields from attributes
      const {
        propertyId,
        unitNumber,
        rentAmount,
        status,
        floor,
        bedrooms,
        bathrooms,
        size,
        depositAmount,
        description,
        attributes = {},
        ...rest
      } = data

      // Store additional fields in attributes
      const unitAttributes = {
        ...attributes,
        ...(floor !== undefined && { floor }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(size !== undefined && { size }),
        ...(depositAmount !== undefined && { depositAmount }),
        ...(description !== undefined && { description }),
      }

      const unit = await tx.unit.create({
        data: {
          propertyId,
          unitNumber,
          rentAmount,
          status,
          attributes: unitAttributes,
        },
      })

      // Create initial status history
      await tx.unitStatusHistory.create({
        data: {
          unitId: unit.id,
          fromStatus: data.status, // Initial status
          toStatus: data.status,
          changedByUserId: user.id,
          changedAt: new Date(),
          notes: 'Unit created',
        },
      })

      return unit
    })
  }

  async update(id: string, organizationId: string, data: UnitUpdateData) {
    // Get current unit to merge attributes
    const currentUnit = await this.prisma.unit.findFirst({
      where: {
        id,
        property: { organizationId },
      },
    })

    if (!currentUnit) {
      throw new Error('Unit not found')
    }

    // Separate basic fields from attributes
    const {
      unitNumber,
      rentAmount,
      status,
      floor,
      bedrooms,
      bathrooms,
      size,
      depositAmount,
      description,
      attributes = {},
      ...rest
    } = data

    // Merge with existing attributes
    const currentAttributes = (currentUnit.attributes as any) || {}
    const unitAttributes = {
      ...currentAttributes,
      ...attributes,
      ...(floor !== undefined && { floor }),
      ...(bedrooms !== undefined && { bedrooms }),
      ...(bathrooms !== undefined && { bathrooms }),
      ...(size !== undefined && { size }),
      ...(depositAmount !== undefined && { depositAmount }),
      ...(description !== undefined && { description }),
    }

    return this.prisma.unit.update({
      where: {
        id,
        property: { organizationId },
      },
      data: {
        ...(unitNumber !== undefined && { unitNumber }),
        ...(rentAmount !== undefined && { rentAmount }),
        ...(status !== undefined && { status }),
        attributes: unitAttributes,
        updatedAt: new Date(),
      },
    })
  }

  async moveStatus(
    unitId: string,
    organizationId: string,
    toStatus: UnitStatus,
    notes?: string
  ) {
    const user = await this.getCurrentUser()

    return this.prisma.$transaction(async (tx) => {
      // Get current unit
      const unit = await tx.unit.findFirst({
        where: {
          id: unitId,
          property: {
            organizationId,
          },
        },
      })

      if (!unit) {
        throw new Error('Unit not found or access denied')
      }

      const fromStatus = unit.status

      // Update unit status
      const updatedUnit = await tx.unit.update({
        where: { id: unitId },
        data: {
          status: toStatus,
          updatedAt: new Date(),
        },
      })

      // Record status change
      await tx.unitStatusHistory.create({
        data: {
          unitId,
          fromStatus,
          toStatus,
          changedByUserId: user.id,
          changedAt: new Date(),
          notes,
        },
      })

      return updatedUnit
    })
  }

  async getStatusHistory(unitId: string, organizationId: string) {
    return this.prisma.unitStatusHistory.findMany({
      where: {
        unit: {
          id: unitId,
          property: {
            organizationId,
          },
        },
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
    })
  }

  async getByStatus(organizationId: string, status: UnitStatus) {
    return this.prisma.unit.findMany({
      where: {
        property: {
          organizationId,
        },
        status,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  async getByProperty(organizationId: string, propertyId: string) {
    return this.prisma.unit.findMany({
      where: {
        propertyId,
        property: {
          organizationId,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        unitNumber: 'asc',
      },
    })
  }

  async updateStatus(id: string, organizationId: string, status: UnitStatus) {
    // First verify the unit exists and belongs to the organization
    const unit = await this.prisma.unit.findFirst({
      where: {
        id,
        property: {
          organizationId,
        },
      },
    })

    if (!unit) {
      throw new Error('Unit not found or access denied')
    }

    // Update the unit status
    return this.prisma.unit.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.unit.delete({
      where: {
        id,
        property: {
          organizationId,
        },
      },
    })
  }
}

export const unitsRepo = new UnitsRepository()
