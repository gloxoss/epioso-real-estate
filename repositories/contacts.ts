import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, ContactType } from '@prisma/client'

export interface ContactFilters {
  search?: string
  type?: ContactType
}

export interface ContactCreateData {
  type: ContactType
  name: string
  email?: string | null
  phone: string
  address?: string | null
}

export interface ContactUpdateData extends Partial<ContactCreateData> {}

export type ContactWithDetails = Prisma.ContactGetPayload<{
  include: {
    expenses: {
      select: {
        id: true
        amount: true
        description: true
        createdAt: true
      }
      orderBy: {
        createdAt: 'desc'
      }
      take: 5
    }
    invoices: {
      select: {
        id: true
        number: true
        total: true
        status: true
        dueDate: true
      }
      orderBy: {
        createdAt: 'desc'
      }
      take: 5
    }
  }
}>

class ContactsRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: ContactFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<ContactWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.ContactWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.type) {
      where.type = filters.type
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: {
          expenses: {
            select: {
              id: true,
              amount: true,
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          invoices: {
            select: {
              id: true,
              number: true,
              total: true,
              status: true,
              dueDate: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.contact.count({ where }),
    ])

    return this.buildPaginatedResult(contacts, total, page, perPage)
  }

  async findById(id: string, organizationId: string): Promise<ContactWithDetails | null> {
    return this.prisma.contact.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        expenses: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })
  }

  async create(organizationId: string, data: ContactCreateData): Promise<ContactWithDetails> {
    // Check for duplicate email if provided
    if (data.email) {
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          organizationId,
          email: data.email,
        },
      })

      if (existingContact) {
        throw new Error('A contact with this email already exists')
      }
    }

    return this.prisma.contact.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        expenses: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })
  }

  async update(
    id: string,
    organizationId: string,
    data: ContactUpdateData
  ): Promise<ContactWithDetails> {
    // Check for duplicate email if provided and different from current
    if (data.email) {
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          organizationId,
          email: data.email,
          NOT: { id },
        },
      })

      if (existingContact) {
        throw new Error('A contact with this email already exists')
      }
    }

    return this.prisma.contact.update({
      where: {
        id,
        organizationId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        expenses: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.prisma.contact.delete({
      where: {
        id,
        organizationId,
      },
    })
  }

  async getByType(organizationId: string, type: ContactType): Promise<ContactWithDetails[]> {
    return this.prisma.contact.findMany({
      where: {
        organizationId,
        type,
      },
      include: {
        expenses: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  async getStats(organizationId: string) {
    const [
      totalContacts,
      contactsByType,
      recentContacts,
      contactsWithInvoices,
    ] = await Promise.all([
      this.prisma.contact.count({
        where: { organizationId },
      }),
      this.prisma.contact.groupBy({
        by: ['type'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.contact.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          type: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
      this.prisma.contact.count({
        where: {
          organizationId,
          invoices: {
            some: {},
          },
        },
      }),
    ])

    return {
      totalContacts,
      contactsByType,
      recentContacts,
      contactsWithInvoices,
    }
  }
}

export const contactsRepo = new ContactsRepository()
