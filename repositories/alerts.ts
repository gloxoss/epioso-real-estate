import { BaseRepository } from './base'
import { addDays, subDays, isAfter, isBefore } from 'date-fns'

export type AlertType = 'overdue_payment' | 'expiring_lease' | 'sla_breach' | 'maintenance_urgent' | 'low_occupancy' | 'high_vacancy'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  title: string
  description: string
  severity: AlertSeverity
  actionUrl?: string
  actionLabel?: string
  createdAt: Date
  entityId?: string
  entityType?: string
}

class AlertsRepository extends BaseRepository {
  async getActiveAlerts(organizationId: string): Promise<Alert[]> {
    const alerts: Alert[] = []
    const now = new Date()

    // 1. Overdue Payment Alerts
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['open', 'overdue'] },
        dueDate: { lt: now }
      },
      include: {
        contact: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      },
      take: 10
    })

    for (const invoice of overdueInvoices) {
      const daysLate = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      let severity: AlertSeverity = 'low'
      
      if (daysLate >= 90) severity = 'critical'
      else if (daysLate >= 60) severity = 'high'
      else if (daysLate >= 30) severity = 'medium'

      alerts.push({
        id: `overdue-${invoice.id}`,
        type: 'overdue_payment',
        title: 'Payment Overdue',
        description: `${invoice.contact?.name || 'Unknown'} - ${invoice.unit?.unitNumber || 'Invoice'} is ${daysLate} days overdue`,
        severity,
        actionUrl: `/billing/invoices/${invoice.id}`,
        actionLabel: 'View Invoice',
        createdAt: invoice.dueDate,
        entityId: invoice.id,
        entityType: 'invoice'
      })
    }

    // 2. Expiring Lease Alerts (Units with leases ending soon)
    // Note: Since there's no lease model, we'll skip this for now
    // You can add a Lease model later with lease end dates
    const unitsWithExpiringLeases: any[] = []

    // 3. Urgent Maintenance Alerts
    const urgentTickets = await this.prisma.maintenanceTicket.findMany({
      where: {
        organizationId,
        priority: 'urgent',
        status: { in: ['open', 'in_progress'] },
        createdAt: { lt: subDays(now, 1) } // Open for more than 1 day
      },
      include: {
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      },
      take: 5
    })

    for (const ticket of urgentTickets) {
      const hoursOpen = Math.floor((now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60))
      
      alerts.push({
        id: `urgent-ticket-${ticket.id}`,
        type: 'maintenance_urgent',
        title: 'Urgent Maintenance',
        description: `${ticket.property.name} ${ticket.unit?.unitNumber ? `- ${ticket.unit.unitNumber}` : ''} has urgent issue open for ${hoursOpen}h`,
        severity: hoursOpen > 48 ? 'critical' : 'high',
        actionUrl: `/maintenance/${ticket.id}`,
        actionLabel: 'View Ticket',
        createdAt: ticket.createdAt,
        entityId: ticket.id,
        entityType: 'ticket'
      })
    }

    // 4. Low Occupancy Alerts
    const properties = await this.prisma.property.findMany({
      where: { organizationId },
      include: {
        units: {
          select: { status: true }
        }
      }
    })

    for (const property of properties) {
      const totalUnits = property.units.length
      const occupiedUnits = property.units.filter(u => u.status === 'occupied').length
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

      if (totalUnits > 0 && occupancyRate < 75) {
        alerts.push({
          id: `low-occupancy-${property.id}`,
          type: 'low_occupancy',
          title: 'Low Occupancy Rate',
          description: `${property.name} has ${occupancyRate.toFixed(1)}% occupancy (${occupiedUnits}/${totalUnits} units)`,
          severity: occupancyRate < 50 ? 'high' : 'medium',
          actionUrl: `/properties/${property.id}`,
          actionLabel: 'View Property',
          createdAt: now,
          entityId: property.id,
          entityType: 'property'
        })
      }
    }

    // 5. SLA Breach Alerts (Tickets open too long)
    const slaBreachTickets = await this.prisma.maintenanceTicket.findMany({
      where: {
        organizationId,
        status: { in: ['open', 'in_progress'] },
        createdAt: { lt: subDays(now, 7) } // Open for more than 7 days
      },
      include: {
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      },
      take: 5
    })

    for (const ticket of slaBreachTickets) {
      const daysOpen = Math.floor((now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      alerts.push({
        id: `sla-breach-${ticket.id}`,
        type: 'sla_breach',
        title: 'SLA Breach',
        description: `${ticket.property.name} ${ticket.unit?.unitNumber ? `- ${ticket.unit.unitNumber}` : ''} ticket open for ${daysOpen} days`,
        severity: daysOpen > 14 ? 'high' : 'medium',
        actionUrl: `/maintenance/${ticket.id}`,
        actionLabel: 'View Ticket',
        createdAt: ticket.createdAt,
        entityId: ticket.id,
        entityType: 'ticket'
      })
    }

    // Sort by severity and creation date
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return alerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  async dismissAlert(alertId: string, organizationId: string): Promise<void> {
    // In a full implementation, you might want to track dismissed alerts
    // For now, this is a placeholder for the dismiss functionality
    console.log(`Alert ${alertId} dismissed for organization ${organizationId}`)
  }

  async getAlertCounts(organizationId: string): Promise<{ total: number; high: number; critical: number }> {
    const alerts = await this.getActiveAlerts(organizationId)
    return {
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      critical: alerts.filter(a => a.severity === 'critical').length
    }
  }
}

export const alertsRepo = new AlertsRepository()
