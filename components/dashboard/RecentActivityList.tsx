import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
// Simple avatar component inline
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ActivityLogWithUser } from '@/repositories/activity'
import { 
  Building2, 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react'

interface RecentActivityListProps {
  activities: ActivityLogWithUser[]
}

const entityIcons = {
  property: 'Building2',
  unit: 'Home',
  contact: 'Users',
  invoice: 'CreditCard',
  ticket: 'Wrench',
  payment: 'CreditCard',
}

const actionIcons = {
  create: 'Plus',
  update: 'Edit',
  delete: 'Trash2',
  move: 'ArrowRight',
}

function renderEntityIcon(iconName: string, className: string = '') {
  switch (iconName) {
    case 'Building2':
      return <Building2 className={className} />
    case 'Home':
      return <Home className={className} />
    case 'Users':
      return <Users className={className} />
    case 'CreditCard':
      return <CreditCard className={className} />
    case 'Wrench':
      return <Wrench className={className} />
    case 'FileText':
      return <FileText className={className} />
    default:
      return <FileText className={className} />
  }
}

function renderActionIcon(iconName: string, className: string = '') {
  switch (iconName) {
    case 'Plus':
      return <Plus className={className} />
    case 'Edit':
      return <Edit className={className} />
    case 'Trash2':
      return <Trash2 className={className} />
    case 'ArrowRight':
      return <ArrowRight className={className} />
    default:
      return <Plus className={className} />
  }
}

function getActionColor(action: string) {
  if (action.includes('create')) return 'bg-green-100 text-green-800'
  if (action.includes('update')) return 'bg-blue-100 text-blue-800'
  if (action.includes('delete')) return 'bg-red-100 text-red-800'
  if (action.includes('move')) return 'bg-purple-100 text-purple-800'
  return 'bg-gray-100 text-gray-800'
}

function formatActivityMessage(activity: ActivityLogWithUser): string {
  const { action, entityType, payload } = activity
  
  switch (action) {
    case 'create':
      return `Created ${entityType} ${payload.name || payload.title || ''}`
    case 'update':
      return `Updated ${entityType} ${payload.name || payload.title || ''}`
    case 'delete':
      return `Deleted ${entityType} ${payload.name || payload.title || ''}`
    case 'move_status':
      return `Moved ${entityType} from ${payload.fromStatus} to ${payload.toStatus}`
    case 'upload':
      return `Uploaded document ${payload.filename || ''}`
    case 'payment':
      return `Recorded payment of ${payload.amount || ''}`
    default:
      return `${action} ${entityType}`
  }
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {activities.map((activity) => {
          const entityIconName = entityIcons[activity.entityType as keyof typeof entityIcons] || 'FileText'
          const actionIconName = actionIcons[activity.action as keyof typeof actionIcons] || 'Edit'
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {activity.user.name?.[0] || activity.user.email?.[0] || 'U'}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium truncate">
                    {activity.user.name || activity.user.email}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getActionColor(activity.action)}`}
                  >
                    {renderActionIcon(actionIconName, "h-3 w-3 mr-1")}
                    {activity.action}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">
                  {formatActivityMessage(activity)}
                </p>
                
                <div className="flex items-center space-x-2">
                  {renderEntityIcon(entityIconName, "h-3 w-3 text-muted-foreground")}
                  <span className="text-xs text-muted-foreground capitalize">
                    {activity.entityType}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
