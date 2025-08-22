import { BaseRepository } from './base'
import { Prisma } from '@prisma/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export interface PropertyFinancialData {
  totalRevenue: number
  monthlyRevenue: number
  outstandingAmount: number
  collectionRate: number
  recentInvoices: any[]
  revenueHistory: RevenueHistoryItem[]
  expenses: PropertyExpense[]
  netIncome: number
  occupancyRevenue: number
  maintenanceCosts: number
}

export interface RevenueHistoryItem {
  month: string
  revenue: number
  expenses: number
  netIncome: number
}

export interface PropertyExpense {
  id: string
  category: string
  amount: number
  description: string
  date: Date
}

export interface FinancialSummary {
  totalProperties: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  occupancyRate: number
  collectionRate: number
  monthlyGrowth: number
}

class FinancialRepository extends BaseRepository {
  async getPropertyFinancialData(
    propertyId: string,
    organizationId: string,
    months: number = 12
  ): Promise<PropertyFinancialData> {
    const currentDate = new Date()
    const startDate = subMonths(startOfMonth(currentDate), months - 1)
    const endDate = endOfMonth(currentDate)

    // Get all invoices for this property
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        unit: {
          propertyId,
        },
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payments: true,
        unit: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    })

    // Get maintenance tickets for this property (no cost tracking in current model)
    const maintenanceTickets = await this.prisma.maintenanceTicket.findMany({
      where: {
        organizationId,
        propertyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calculate totals
    const totalRevenue = invoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
      return sum + paidAmount
    }, 0)

    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0)
    const totalPaid = invoices.reduce((sum, invoice) => {
      return sum + invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
    }, 0)

    const outstandingAmount = totalInvoiced - totalPaid
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0

    // Calculate monthly revenue for current month
    const currentMonthStart = startOfMonth(currentDate)
    const currentMonthInvoices = invoices.filter(
      invoice => invoice.issueDate >= currentMonthStart
    )
    const monthlyRevenue = currentMonthInvoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
      return sum + paidAmount
    }, 0)

    // Calculate maintenance costs (no cost tracking in current model)
    const maintenanceCosts = 0 // TODO: Add cost tracking to maintenance tickets

    // Generate revenue history
    const revenueHistory: RevenueHistoryItem[] = []
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(currentDate, i))
      const monthEnd = endOfMonth(subMonths(currentDate, i))
      
      const monthInvoices = invoices.filter(
        invoice => invoice.issueDate >= monthStart && invoice.issueDate <= monthEnd
      )
      
      const monthTickets = maintenanceTickets.filter(
        ticket => ticket.createdAt >= monthStart && ticket.createdAt <= monthEnd
      )

      const monthRevenue = monthInvoices.reduce((sum, invoice) => {
        const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
        return sum + paidAmount
      }, 0)

      const monthExpenses = 0 // TODO: Add cost tracking to maintenance tickets

      revenueHistory.push({
        month: format(monthStart, 'MMM yyyy'),
        revenue: monthRevenue,
        expenses: monthExpenses,
        netIncome: monthRevenue - monthExpenses,
      })
    }

    // Get recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5).map(invoice => ({
      id: invoice.id,
      amount: invoice.total.toNumber(),
      dueDate: invoice.dueDate,
      status: invoice.status,
      contact: invoice.contact,
      unit: invoice.unit,
    }))

    // Convert maintenance tickets to expenses (no cost tracking in current model)
    const expenses: PropertyExpense[] = [] // TODO: Add cost tracking to maintenance tickets

    const netIncome = totalRevenue - maintenanceCosts

    return {
      totalRevenue,
      monthlyRevenue,
      outstandingAmount,
      collectionRate,
      recentInvoices,
      revenueHistory,
      expenses,
      netIncome,
      occupancyRevenue: totalRevenue, // For now, assume all revenue is from occupancy
      maintenanceCosts,
    }
  }

  async getOrganizationFinancialSummary(
    organizationId: string,
    months: number = 12
  ): Promise<FinancialSummary> {
    const currentDate = new Date()
    const startDate = subMonths(startOfMonth(currentDate), months - 1)
    const endDate = endOfMonth(currentDate)

    // Get all properties count
    const totalProperties = await this.prisma.property.count({
      where: { organizationId },
    })

    // Get all invoices for the organization
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payments: true,
      },
    })

    // Get all maintenance tickets (no cost tracking in current model)
    const maintenanceTickets = await this.prisma.maintenanceTicket.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calculate totals
    const totalRevenue = invoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
      return sum + paidAmount
    }, 0)

    const totalExpenses = 0 // TODO: Add cost tracking to maintenance tickets

    const netIncome = totalRevenue - totalExpenses

    // Calculate collection rate
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0)
    const totalPaid = invoices.reduce((sum, invoice) => {
      return sum + invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
    }, 0)
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0

    // Calculate occupancy rate
    const totalUnits = await this.prisma.unit.count({
      where: {
        property: {
          organizationId,
        },
      },
    })

    const occupiedUnits = await this.prisma.unit.count({
      where: {
        property: {
          organizationId,
        },
        status: 'occupied',
      },
    })

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

    // Calculate monthly growth (simplified - comparing current month to previous month)
    const currentMonthStart = startOfMonth(currentDate)
    const previousMonthStart = startOfMonth(subMonths(currentDate, 1))
    const previousMonthEnd = endOfMonth(subMonths(currentDate, 1))

    const currentMonthRevenue = invoices
      .filter(invoice => invoice.issueDate >= currentMonthStart)
      .reduce((sum, invoice) => {
        const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
        return sum + paidAmount
      }, 0)

    const previousMonthRevenue = invoices
      .filter(invoice => invoice.issueDate >= previousMonthStart && invoice.issueDate <= previousMonthEnd)
      .reduce((sum, invoice) => {
        const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
        return sum + paidAmount
      }, 0)

    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0

    return {
      totalProperties,
      totalRevenue,
      totalExpenses,
      netIncome,
      occupancyRate,
      collectionRate,
      monthlyGrowth,
    }
  }

  async getUnitFinancialData(
    unitId: string,
    organizationId: string,
    months: number = 12
  ): Promise<{
    monthlyRevenue: number
    totalRevenue: number
    outstandingAmount: number
    collectionRate: number
    recentPayments: Array<{
      id: string
      amount: number
      date: Date
      method: string
      status: string
    }>
    upcomingPayments: Array<{
      id: string
      amount: number
      dueDate: Date
      type: string
      status: string
    }>
    paymentHistory: any[]
  }> {
    const currentDate = new Date()
    const startDate = subMonths(startOfMonth(currentDate), months - 1)
    const endDate = endOfMonth(currentDate)

    // Get all invoices for this unit
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        unitId,
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payments: true,
        unit: {
          select: {
            id: true,
            unitNumber: true,
            rentAmount: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    })

    // Calculate totals
    const totalRevenue = invoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
      return sum + paidAmount
    }, 0)

    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total.toNumber(), 0)
    const totalPaid = invoices.reduce((sum, invoice) => {
      return sum + invoice.payments.reduce((pSum, payment) => pSum + payment.amount.toNumber(), 0)
    }, 0)

    const outstandingAmount = totalInvoiced - totalPaid
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0

    // Calculate monthly revenue (average)
    const monthlyRevenue = totalRevenue / months

    // Get recent payments (last 5)
    const recentPayments = invoices
      .flatMap(invoice => invoice.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount.toNumber(),
        date: payment.paidAt,
        method: payment.method,
        status: 'completed'
      })))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

    // Get upcoming payments (unpaid invoices)
    const upcomingPayments = invoices
      .filter(invoice => invoice.status !== 'paid')
      .map(invoice => ({
        id: invoice.id,
        amount: invoice.total.toNumber(),
        dueDate: invoice.dueDate,
        type: 'Monthly Rent',
        status: invoice.status
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 3)

    return {
      monthlyRevenue,
      totalRevenue,
      outstandingAmount,
      collectionRate,
      recentPayments,
      upcomingPayments,
      paymentHistory: recentPayments // For now, use recent payments as history
    }
  }
}

export const financialRepo = new FinancialRepository()
