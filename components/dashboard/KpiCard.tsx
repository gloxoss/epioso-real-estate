import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Home,
  AlertTriangle,
  DollarSign,
  Users,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type IconName = 'Building2' | 'Home' | 'TrendingUp' | 'AlertTriangle' | 'DollarSign' | 'Users' | 'Activity'

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  subtitle?: string
  icon: IconName | LucideIcon | React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  href?: string
  className?: string
  accent?: 'success' | 'warning' | 'danger' | 'info'
  sparkline?: number[]
}

function getIconComponent(icon: IconName | LucideIcon | React.ComponentType<{ className?: string }>): React.ComponentType<{ className?: string }> {
  if (typeof icon === 'string') {
    switch (icon) {
      case 'Building2': return Building2
      case 'Home': return Home
      case 'TrendingUp': return TrendingUp
      case 'AlertTriangle': return AlertTriangle
      case 'DollarSign': return DollarSign
      case 'Users': return Users
      case 'Activity': return Activity
      default: return Building2
    }
  }
  return icon as React.ComponentType<{ className?: string }>
}

export default function KpiCard({
  title,
  value,
  description,
  subtitle,
  icon,
  trend,
  trendValue,
  href,
  className,
  accent,
  sparkline,
}: KpiCardProps) {
  const Icon = getIconComponent(icon)
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  
  const trendColor = trend === 'up' 
    ? 'text-green-600' 
    : trend === 'down' 
    ? 'text-red-600' 
    : 'text-muted-foreground'

  const CardComponent = href ? Link : 'div'
  const cardProps = href ? { href } : {}

  const accentClasses =
    accent === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    : accent === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
    : accent === 'danger' ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
    : 'bg-primary/10 text-primary-700 dark:text-primary-300'

  return (
    // @ts-expect-error Link as Card wrapper
    <CardComponent {...cardProps} className="block">
      <Card className={cn(
        'transition-colors hover:border-primary/40 h-full',
        href && 'cursor-pointer',
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {/* @ts-expect-error Icon type */}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}

          <div className="flex items-center justify-between mt-2">
            {description && (
              <p className="text-xs text-muted-foreground flex-1">
                {description}
              </p>
            )}

            {trend && (
              <div className={cn('flex items-center space-x-1', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendValue && (
                  <span className="text-xs font-medium">{trendValue}</span>
                )}
              </div>
            )}
          </div>

          {sparkline && sparkline.length > 1 && (
            <div className="mt-3 h-6 w-full overflow-hidden">
              <MiniSparkline values={sparkline} />
            </div>
          )}
        </CardContent>
      </Card>
    </CardComponent>
  )
}

function MiniSparkline({ values }: { values: number[] }) {
  const width = 120
  const height = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const norm = (v: number) => (max === min ? height / 2 : height - ((v - min) / (max - min)) * height)
  const step = width / (values.length - 1)
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${norm(v)}`).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} stroke="currentColor" strokeWidth="2" fill="none" className="opacity-70" />
    </svg>
  )
}
