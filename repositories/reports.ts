import { BaseRepository } from './base'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { formatCurrency } from '@/lib/format'


export interface CollectionsReportData {
  period: string
  totalInvoiced: number
  totalCollected: number
  collectionRate: number
  outstandingAmount: number
}

export interface OccupancyReportData {
  propertyId: string
  propertyName: string
  totalUnits: number
  occupiedUnits: number
  availableUnits: number
  occupancyRate: number
  expectedUnits?: number
}

export interface ARAgingData {
  contactId: string
  contactName: string
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  total: number
}

class ReportsRepository extends BaseRepository {
  async getCollectionsReport(
    organizationId: string,
    dateFrom: Date,
    dateTo: Date,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ): Promise<CollectionsReportData[]> {
    // This would be implemented with complex SQL queries
    // For now, returning sample data structure
    const months = []
    let current = new Date(dateFrom)

    while (current <= dateTo) {
      const monthStart = startOfMonth(current)
      const monthEnd = endOfMonth(current)

      const [invoiceData, paymentData] = await Promise.all([
        this.prisma.invoice.aggregate({
          where: {
            organizationId,
            issueDate: {
              gte: monthStart,
              lte: monthEnd,
            },
            deletedAt: null,
          },
          _sum: {
            total: true,
          },
        }),
        this.prisma.payment.aggregate({
          where: {
            organizationId,
            paidAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ])

      const totalInvoiced = Number(invoiceData._sum.total || 0)
      const totalCollected = Number(paymentData._sum.amount || 0)
      const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0

      months.push({
        period: format(current, 'MMM yyyy'),
        totalInvoiced,
        totalCollected,
        collectionRate: Math.round(collectionRate * 10) / 10,
        outstandingAmount: totalInvoiced - totalCollected,
      })

      current = addMonths(current, 1)
    }

    return months
  }

  async getOccupancyReport(
    organizationId: string,
    propertyIds?: string[]
  ): Promise<OccupancyReportData[]> {
    const where: any = {
      organizationId,
    }

    if (propertyIds && propertyIds.length > 0) {
      where.id = { in: propertyIds }
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        units: {
          select: {
            status: true,
          },
        },
      },
    })

    return properties.map(property => {
      const totalUnits = property.units.length
      const occupiedUnits = property.units.filter(u => u.status === 'occupied').length
      const availableUnits = property.units.filter(u => u.status === 'available').length
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

      return {
        propertyId: property.id,
        propertyName: property.name,
        totalUnits,
        occupiedUnits,
        availableUnits,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        expectedUnits: property.expectedUnits || undefined,
      }
    })
  }

  async getARAgingReport(organizationId: string): Promise<ARAgingData[]> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Get all unpaid invoices with contact information
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['open', 'overdue'] },
        deletedAt: null,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          select: {
            amount: true,
          },
        },
      },
    })

    // Group by contact and calculate aging buckets
    const contactMap = new Map<string, ARAgingData>()

    unpaidInvoices.forEach(invoice => {
      const contactId = invoice.contactId || 'no-contact'
      const contactName = invoice.contact?.name || 'No Contact'

      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          contactId,
          contactName,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0,
        })
      }

      const contact = contactMap.get(contactId)!
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const outstanding = Number(invoice.total) - totalPaid

      if (outstanding > 0) {
        const dueDate = new Date(invoice.dueDate)

        if (dueDate >= now) {
          contact.current += outstanding
        } else if (dueDate >= thirtyDaysAgo) {
          contact.days30 += outstanding
        } else if (dueDate >= sixtyDaysAgo) {
          contact.days60 += outstanding
        } else if (dueDate >= ninetyDaysAgo) {
          contact.days90 += outstanding
        } else {
          contact.over90 += outstanding
        }

        contact.total += outstanding
      }
    })

    return Array.from(contactMap.values())
      .filter(contact => contact.total > 0)
      .sort((a, b) => b.total - a.total)
  }

  async getDashboardMetrics(organizationId: string) {
    const now = new Date()
    const currentMonth = startOfMonth(now)
    const lastMonth = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const [
      currentMonthCollections,
      lastMonthCollections,
      totalOutstanding,
      overdueAmount,
      occupancyData,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          paidAt: {
            gte: currentMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          paidAt: {
            gte: lastMonth,
            lte: lastMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(i.total - COALESCE(p.paid, 0)), 0) as outstanding
        FROM invoices i
        LEFT JOIN (
          SELECT invoice_id, SUM(amount) as paid
          FROM payments
          GROUP BY invoice_id
        ) p ON i.id = p.invoice_id
        WHERE i.organization_id = ${organizationId}::uuid
          AND i.deleted_at IS NULL
          AND i.status IN ('open', 'overdue')
      `,
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(i.total - COALESCE(p.paid, 0)), 0) as overdue
        FROM invoices i
        LEFT JOIN (
          SELECT invoice_id, SUM(amount) as paid
          FROM payments
          GROUP BY invoice_id
        ) p ON i.id = p.invoice_id
        WHERE i.organization_id = ${organizationId}::uuid
          AND i.deleted_at IS NULL
          AND i.due_date < NOW()
          AND i.status IN ('open', 'overdue')
      `,
      this.getOccupancyReport(organizationId),
    ])

    const currentCollections = Number(currentMonthCollections._sum.amount || 0)
    const lastCollections = Number(lastMonthCollections._sum.amount || 0)
    const collectionsGrowth = lastCollections > 0
      ? ((currentCollections - lastCollections) / lastCollections) * 100
      : 0

    const totalUnits = occupancyData.reduce((sum, p) => sum + p.totalUnits, 0)
    const occupiedUnits = occupancyData.reduce((sum, p) => sum + p.occupiedUnits, 0)
    const overallOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

    return {
      currentMonthCollections: currentCollections,
      collectionsGrowth: Math.round(collectionsGrowth * 10) / 10,
      totalOutstanding: Number((totalOutstanding as any)[0]?.outstanding || 0),
      overdueAmount: Number((overdueAmount as any)[0]?.overdue || 0),
      overallOccupancy: Math.round(overallOccupancy * 10) / 10,
      totalProperties: occupancyData.length,
      totalUnits,
      occupiedUnits,
    }

	  }


  // Adapter methods for new Dashboard API
  public async kpis(organizationId: string) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const [totalProperties, totalUnits, occupiedUnits, overdueInvoices, openTickets, collected] = await Promise.all([
      this.prisma.property.count({ where: { organizationId } }),
      this.prisma.unit.count({ where: { property: { organizationId } } }),
      this.prisma.unit.count({ where: { property: { organizationId }, status: 'occupied' } }),
      this.prisma.invoice.count({ where: { organizationId, status: { in: ['open', 'overdue'] }, dueDate: { lt: now } } }),
      this.prisma.maintenanceTicket.count({ where: { organizationId, status: { in: ['open', 'in_progress'] } } }),
      this.prisma.payment.aggregate({ where: { organizationId, paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    ])
    const occupancyPct = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
    const collectionsThisMonth = Number(collected._sum.amount || 0)
    return {
      propertiesCount: totalProperties,
      unitsCount: totalUnits,
      occupiedUnits,
      occupancyPct,
      overdueInvoicesCount: overdueInvoices,
      openTicketsCount: openTickets,
      collectionsThisMonth,
      collectionsThisMonthFormatted: formatCurrency(collectionsThisMonth),
    }
  }

  public async collectionsOverTime(organizationId: string, { months = 12 }: { months?: number } = {}) {
    const now = new Date()
    const labels: string[] = []
    for (let i = months - 1; i >= 0; i--) {
      const dt = subMonths(now, i)
      labels.push(format(dt, 'yyyy-MM'))
    }
    const payments = await this.prisma.$queryRaw<{ month: string; collected: number }[]>`
      SELECT to_char(date_trunc('month', paid_at), 'YYYY-MM') as month, COALESCE(SUM(amount),0) as collected
      FROM payments
      WHERE organization_id = ${organizationId}::uuid
      GROUP BY 1 ORDER BY 1 ASC
    `
    const invoices = await this.prisma.$queryRaw<{ month: string; outstanding: number }[]>`
      SELECT to_char(date_trunc('month', due_date), 'YYYY-MM') as month,
             COALESCE(SUM(CASE WHEN status IN ('open','overdue') THEN total ELSE 0 END),0) as outstanding
      FROM invoices
      WHERE organization_id = ${organizationId}::uuid
      GROUP BY 1 ORDER BY 1 ASC
    `
    const payMap = new Map(payments.map(p => [p.month, Number((p as any).collected)]))
    const outMap = new Map(invoices.map(i => [i.month, Number((i as any).outstanding)]))
    return labels.map(m => ({ month: m, collected: payMap.get(m) ?? 0, outstanding: outMap.get(m) ?? 0 }))
  }

  public async occupancyTrend(organizationId: string, { weeks = 12 }: { weeks?: number } = {}) {
    const totalUnits = await this.prisma.unit.count({ where: { property: { organizationId } } })
    if (!totalUnits) return Array.from({ length: weeks }).map((_, i) => ({ weekStart: String(i), occupancyPct: 0 }))
    const occupied = await this.prisma.unit.count({ where: { property: { organizationId }, status: 'occupied' } })
    const pct = (occupied / totalUnits) * 100
    return Array.from({ length: weeks }).map((_, i) => ({ weekStart: String(i), occupancyPct: pct }))
  }
}

export const reportsRepo = new ReportsRepository()
