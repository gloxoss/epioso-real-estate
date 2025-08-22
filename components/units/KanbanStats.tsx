'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  DollarSign, 
  Wrench, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface Unit {
  id: string
  unitNumber: string
  status: string
  property: {
    id: string
    name: string
  }
  invoices?: Array<{
    id: string
    status: string
    dueDate: Date
    amount: number
  }>
  tickets?: Array<{
    id: string
    priority: string
    status: string
    title: string
    createdAt: Date
  }>
}

interface KanbanStatsProps {
  units: Unit[]
  dictionary?: any
}

export function KanbanStats({ units, dictionary }: KanbanStatsProps) {
  // Calculate statistics
  const totalUnits = units.length
  
  const overdueUnits = units.filter(unit => 
    unit.invoices?.some(invoice => 
      invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date()
    )
  ).length

  const urgentMaintenanceUnits = units.filter(unit =>
    unit.tickets?.some(ticket => 
      ticket.priority === 'urgent' && ['open', 'in_progress'].includes(ticket.status)
    )
  ).length

  const maintenanceUnits = units.filter(unit =>
    unit.tickets?.some(ticket => 
      ['open', 'in_progress'].includes(ticket.status)
    )
  ).length

  const criticalUnits = units.filter(unit => {
    const hasOverdue = unit.invoices?.some(invoice => 
      invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date()
    )
    const hasUrgentMaintenance = unit.tickets?.some(ticket => 
      ticket.priority === 'urgent' && ['open', 'in_progress'].includes(ticket.status)
    )
    return hasOverdue && hasUrgentMaintenance
  }).length

  const totalOverdueAmount = units.reduce((sum, unit) => {
    const overdueInvoices = unit.invoices?.filter(invoice => 
      invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date()
    ) || []
    return sum + overdueInvoices.reduce((invoiceSum, invoice) => invoiceSum + invoice.amount, 0)
  }, 0)

  const occupancyRate = units.filter(unit => unit.status === 'occupied').length / totalUnits * 100

  const stats = [
    {
      title: dictionary?.units?.criticalIssues || 'Critical Issues',
      value: criticalUnits,
      description: dictionary?.units?.unitsWithMultipleIssues || 'Units with multiple urgent issues',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      trend: criticalUnits > 0 ? 'up' : 'neutral'
    },
    {
      title: dictionary?.units?.overduePayments || 'Overdue Payments',
      value: overdueUnits,
      description: `$${totalOverdueAmount.toLocaleString()} ${dictionary?.units?.totalOverdue || 'total overdue'}`,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      trend: overdueUnits > 0 ? 'up' : 'neutral'
    },
    {
      title: dictionary?.units?.urgentMaintenance || 'Urgent Maintenance',
      value: urgentMaintenanceUnits,
      description: dictionary?.units?.requiresImmediateAttention || 'Requires immediate attention',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      trend: urgentMaintenanceUnits > 0 ? 'up' : 'neutral'
    },
    {
      title: dictionary?.units?.allMaintenance || 'All Maintenance',
      value: maintenanceUnits,
      description: dictionary?.units?.activeMaintenanceTickets || 'Active maintenance tickets',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: 'neutral'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} border-2`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {getTrendIcon(stat.trend)}
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline justify-between">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {stat.value > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`${stat.bgColor} ${stat.color} border-current`}
                  >
                    {dictionary?.units?.urgent || "Urgent"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
