import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  Calendar,
  ExternalLink,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/config'

type Alert = {
  id: string
  type: 'overdue_payment' | 'expiring_lease' | 'sla_breach' | 'maintenance_urgent'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
  createdAt: Date
}

interface AlertsCenterProps {
  alerts: Alert[]
  dictionary?: Dictionary
  locale?: string
}

export default function AlertsCenter({ alerts, dictionary, locale = 'fr' }: AlertsCenterProps) {
  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: Alert['type']): string => {
    switch (type) {
      case 'overdue_payment':
        return 'CreditCard'
      case 'expiring_lease':
        return 'Calendar'
      case 'sla_breach':
        return 'Clock'
      case 'maintenance_urgent':
        return 'AlertTriangle'
      default:
        return 'Bell'
    }
  }

  const renderIcon = (iconName: string, className: string = '') => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className={className} />
      case 'Calendar':
        return <Calendar className={className} />
      case 'Clock':
        return <Clock className={className} />
      case 'AlertTriangle':
        return <AlertTriangle className={className} />
      case 'Bell':
        return <Bell className={className} />
      default:
        return <Bell className={className} />
    }
  }

  const getTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'overdue_payment':
        return dictionary?.dashboard?.alerts?.overduePayment || 'Overdue Payment'
      case 'expiring_lease':
        return dictionary?.dashboard?.alerts?.expiringLease || 'Expiring Lease'
      case 'sla_breach':
        return dictionary?.dashboard?.alerts?.slaBreach || 'SLA Breach'
      case 'maintenance_urgent':
        return dictionary?.dashboard?.alerts?.urgentMaintenance || 'Urgent Maintenance'
      default:
        return dictionary?.dashboard?.alerts?.alert || 'Alert'
    }
  }

  // Function to translate alert titles
  const translateAlertTitle = (title: string) => {
    if (title === 'Low Occupancy Rate') {
      return dictionary?.dashboard?.alerts?.lowOccupancyRate || title
    }
    // Add more title translations as needed
    return title
  }

  // Function to translate alert descriptions
  const translateAlertDescription = (description: string, alert: Alert) => {
    // Check if it's an occupancy alert description
    const occupancyMatch = description.match(/(.+) has (.+)% occupancy \((\d+)\/(\d+) units\)/)
    if (occupancyMatch) {
      const [, property, rate, occupied, total] = occupancyMatch
      return dictionary?.dashboard?.alerts?.occupancyDescription
        ?.replace('{{property}}', property)
        ?.replace('{{rate}}', rate)
        ?.replace('{{occupied}}', occupied)
        ?.replace('{{total}}', total) || description
    }

    // Add more description translations as needed
    return description
  }

  // Function to translate action labels
  const translateActionLabel = (actionLabel: string | undefined) => {
    if (actionLabel === 'View Property') {
      return dictionary?.dashboard?.alerts?.viewProperty || actionLabel
    }
    if (actionLabel === 'View Details') {
      return dictionary?.dashboard?.alerts?.viewDetails || actionLabel
    }
    return actionLabel || dictionary?.dashboard?.alerts?.viewProperty || 'View Details'
  }

  // Sort alerts by severity and date
  const sortedAlerts = alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const highPriorityCount = alerts.filter(a => a.severity === 'high').length

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4 dark:bg-green-950/40">
              <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">All clear!</p>
            <p className="text-xs text-muted-foreground">No alerts at this time</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {dictionary?.dashboard?.alerts?.title || "Alerts"}
          </div>
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {highPriorityCount} {dictionary?.dashboard?.alerts?.highPriority || "high priority"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedAlerts.slice(0, 5).map((alert) => {
          const iconName = getTypeIcon(alert.type)

          return (
            <div
              key={alert.id}
              className={`rounded-lg border p-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {renderIcon(iconName, "h-4 w-4 mt-0.5 flex-shrink-0")}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {translateAlertTitle(alert.title)}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs border-current"
                      >
                        {getTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-90 mb-2">
                      {translateAlertDescription(alert.description, alert)}
                    </p>
                    {alert.actionUrl && (
                      <Button 
                        asChild 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs border-current hover:bg-current/10"
                      >
                        <Link href={`/${locale}${alert.actionUrl}`} className="flex items-center gap-1">
                          {translateActionLabel(alert.actionLabel)}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {alerts.length > 5 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all {alerts.length} alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
