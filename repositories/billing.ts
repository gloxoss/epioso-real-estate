import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, InvoiceStatus, PaymentMethod } from '@prisma/client'

import { differenceInCalendarDays } from 'date-fns'

export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus
  contactId?: string
  unitId?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface PaymentFilters {
  search?: string
  method?: PaymentMethod
  invoiceId?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface InvoiceCreateData {
  contactId?: string | null
  unitId?: string | null
  issueDate: Date
  dueDate: Date
  currency: string
  subtotal: number
  tax: number
  notes?: string | null
}

export interface PaymentCreateData {
  invoiceId: string
  method: PaymentMethod
  amount: number
  currency: string
  paidAt: Date
  reference?: string | null
  notes?: string | null
}

export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    contact: {
      select: {
        id: true
        name: true
        email: true
        phone: true
      }
    }
    unit: {
      select: {
        id: true
        unitNumber: true
        property: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
    payments: {
      select: {
        id: true
        amount: true
        method: true
        paidAt: true
        reference: true
      }
    }
  }
}>

export type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    invoice: {
      select: {
        id: true
        number: true
        total: true
        contact: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
  }
}>

class BillingRepository extends BaseRepository {
  // Invoice methods
  async listInvoices(
    organizationId: string,
    filters: InvoiceFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<InvoiceWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.InvoiceWhereInput = {
      organizationId,
      deletedAt: null,
    }

    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' } },
        { contact: { name: { contains: filters.search, mode: 'insensitive' } } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.contactId) {
      where.contactId = filters.contactId
    }

    if (filters.unitId) {
      where.unitId = filters.unitId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {}
      if (filters.dateFrom) {
        where.issueDate.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.issueDate.lte = filters.dateTo
      }
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              paidAt: true,
              reference: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.invoice.count({ where }),
    ])

    return this.buildPaginatedResult(invoices, total, page, perPage)
  }

  async findInvoiceById(id: string, organizationId: string): Promise<InvoiceWithDetails | null> {
    return this.prisma.invoice.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            reference: true,
          },
        },
      },
    })
  }

  async createInvoice(organizationId: string, data: InvoiceCreateData): Promise<InvoiceWithDetails> {
    // Generate invoice number
    const count = await this.prisma.invoice.count({
      where: { organizationId },
    })
    const number = `INV-${String(count + 1).padStart(4, '0')}`

    const total = data.subtotal + data.tax

    return this.prisma.invoice.create({
      data: {
        ...data,
        organizationId,
        number,
        total,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            reference: true,
          },
        },
      },
    })
  }

  async updateInvoiceStatus(
    id: string,
    organizationId: string,
    status: InvoiceStatus
  ): Promise<InvoiceWithDetails> {
    return this.prisma.invoice.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            reference: true,
          },
        },

      }

      })
    }

  async listOverdue(
    organizationId: string,
    { limit = 5 }: { limit?: number } = {}
  ) {
    const items = await this.prisma.invoice.findMany({
      where: { organizationId, status: { in: ['open', 'overdue'] }, dueDate: { lt: new Date() }, deletedAt: null },
      orderBy: [{ dueDate: 'asc' }, { total: 'desc' }],
      take: limit,
      select: {
        id: true,
        number: true,
        dueDate: true,
        total: true,
        currency: true,
        contact: { select: { name: true } },
        unit: { select: { unitNumber: true } },
      },
    })
    return items.map((i) => ({
      id: i.id,
      number: i.number,
      contactName: i.contact?.name ?? '—',
      unitCode: (i as any).unit?.unitNumber ?? undefined,
      amount: Number(i.total),
      currency: i.currency,
      dueDate: i.dueDate as unknown as Date,
      daysLate: Math.max(0, differenceInCalendarDays(new Date(), i.dueDate as unknown as Date)),
    }))
  }

  async sendReminder(organizationId: string, invoiceId: string, actorId: string) {
    // Stub for email; record activity only
    const invoice = await this.prisma.invoice.findFirstOrThrow({ where: { id: invoiceId, organizationId } })
    await this.prisma.activityLog.create({
      data: {
        organizationId,
        entityType: 'invoice',
        entityId: invoiceId,
        action: 'reminder_sent',
        userId: actorId,
        payload: { number: invoice.number },
      },
    })
  }

  async recordOfflinePayment(
    organizationId: string,
    data: { invoiceId: string; amount: number; currency: string },
    actorId: string,
  ) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({ where: { id: data.invoiceId, organizationId } })
    await this.prisma.payment.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        method: 'bank_transfer',
        amount: data.amount,
        currency: data.currency,
        paidAt: new Date(),
        reference: `OFF-${Date.now()}`,
      },
    })
    const paidAgg = await this.prisma.payment.aggregate({ _sum: { amount: true }, where: { invoiceId: invoice.id, organizationId } })
    if ((paidAgg._sum.amount ?? 0) >= Number(invoice.total)) {
      await this.prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'paid' } })
    } else {
      await this.prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'open' } })
    }
    await this.prisma.activityLog.create({
      data: {
        organizationId,
        entityType: 'invoice',
        entityId: invoice.id,
        action: 'payment_applied',
        userId: actorId,
        payload: { amount: data.amount },
      },
    })
  }

  // Payment methods
  async listPayments(
    organizationId: string,
    filters: PaymentFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PaymentWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.PaymentWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
        { invoice: { number: { contains: filters.search, mode: 'insensitive' } } },
        { invoice: { contact: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ]
    }

    if (filters.method) {
      where.method = filters.method
    }

    if (filters.invoiceId) {
      where.invoiceId = filters.invoiceId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.paidAt = {}
      if (filters.dateFrom) {
        where.paidAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.paidAt.lte = filters.dateTo
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              contact: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              unit: {
                select: {
                  id: true,
                  unitNumber: true,
                  property: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.payment.count({ where }),
    ])

    return this.buildPaginatedResult(payments, total, page, perPage)
  }

  async createPayment(organizationId: string, data: PaymentCreateData): Promise<PaymentWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          ...data,
          organizationId,
        },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              total: true,
              contact: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      // Update invoice status if fully paid
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true },
      })

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
        if (totalPaid >= Number(invoice.total)) {
          await tx.invoice.update({
            where: { id: data.invoiceId },
            data: { status: 'paid' },
          })
        }
      }

      return payment
    })
  }

  async getInvoiceStats(organizationId: string) {
    const [
      totalInvoices,
      totalAmount,
      paidAmount,
      overdueInvoices,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.invoice.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.invoice.aggregate({
        where: { organizationId, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),
      this.prisma.invoice.count({
        where: {
          organizationId,
          deletedAt: null,
          status: 'overdue',
        },
      }),
      this.prisma.invoice.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          number: true,
          total: true,
          status: true,
          dueDate: true,
          contact: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      overdueInvoices,
      recentInvoices,
    }
  }

  async getPaymentStats(organizationId: string) {
    const [
      totalPayments,
      totalAmount,
      byMethod,
      recentPayments,
    ] = await Promise.all([
      this.prisma.payment.count({
        where: { organizationId },
      }),
      this.prisma.payment.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { organizationId },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.payment.findMany({
        where: { organizationId },
        orderBy: { paidAt: 'desc' },
        take: 5,
        select: {
          id: true,
          method: true,
          amount: true,
          paidAt: true,
          invoice: {
            select: {
              number: true,
              contact: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ])

    return {
      totalPayments,
      totalAmount,
      byMethod: byMethod.map(item => ({
        method: item.method,
        total: Number(item._sum.amount || 0),
        count: item._count.id,
      })),
      recentPayments,
    }
  }
}

export const billingRepo = new BillingRepository()
