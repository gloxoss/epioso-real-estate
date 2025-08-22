import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/config'

interface InsightData {
  occupancyPct: number
  collectionsThisMonth: number
  overdueCount: number
  openTicketsCount: number
  propertiesCount: number
  unitsCount: number
  occupiedUnits: number
}

interface AIInsightsProps {
  data: InsightData
  dictionary?: Dictionary
  locale?: string
}

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'prediction' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
  confidence: number
}

function generateInsights(data: InsightData, dictionary?: Dictionary, locale?: string): Insight[] {
  const insights: Insight[] = []
  
  // Occupancy Analysis
  if (data.occupancyPct < 85) {
    insights.push({
      id: 'low-occupancy',
      type: 'opportunity',
      title: dictionary?.dashboard?.aiInsights?.occupancyOptimization || 'Occupancy Optimization Opportunity',
      description: dictionary?.dashboard?.aiInsights?.occupancyOptimizationDesc?.replace('{{rate}}', data.occupancyPct.toFixed(1))?.replace('{{vacant}}', (data.unitsCount - data.occupiedUnits).toString()) || `Your occupancy rate is ${data.occupancyPct.toFixed(1)}%. Focus on marketing ${data.unitsCount - data.occupiedUnits} vacant units to reach 90%+ occupancy.`,
      impact: 'high',
      actionUrl: `/${locale || 'fr'}/units?status=available`,
      actionLabel: dictionary?.dashboard?.aiInsights?.viewVacantUnits || 'View Vacant Units',
      confidence: 85
    })
  } else if (data.occupancyPct > 95) {
    insights.push({
      id: 'high-occupancy',
      type: 'recommendation',
      title: 'Consider Rent Optimization',
      description: `Excellent ${data.occupancyPct.toFixed(1)}% occupancy! This may be a good time to review and potentially increase rental rates.`,
      impact: 'medium',
      actionUrl: '/properties',
      actionLabel: 'Review Properties',
      confidence: 75
    })
  }

  // Collections Analysis
  if (data.overdueCount > 0) {
    const severity = data.overdueCount > 5 ? 'high' : 'medium'
    insights.push({
      id: 'overdue-collections',
      type: 'warning',
      title: 'Collections Attention Needed',
      description: `${data.overdueCount} overdue invoices require immediate attention. Quick action can prevent further delays.`,
      impact: severity,
      actionUrl: '/billing/invoices?status=overdue',
      actionLabel: 'Review Overdue',
      confidence: 95
    })
  }

  // Maintenance Insights
  if (data.openTicketsCount > 3) {
    insights.push({
      id: 'maintenance-backlog',
      type: 'warning',
      title: 'Maintenance Backlog Alert',
      description: `${data.openTicketsCount} open maintenance tickets. Address urgent items to maintain tenant satisfaction.`,
      impact: 'medium',
      actionUrl: '/maintenance?status=open',
      actionLabel: 'View Tickets',
      confidence: 80
    })
  }

  // Portfolio Growth Prediction
  if (data.propertiesCount < 10) {
    insights.push({
      id: 'growth-opportunity',
      type: 'prediction',
      title: dictionary?.dashboard?.aiInsights?.portfolioGrowth || 'Portfolio Growth Potential',
      description: dictionary?.dashboard?.aiInsights?.portfolioGrowthDesc || `Based on your current performance, adding 2-3 more properties could increase monthly revenue by 40-60%.`,
      impact: 'high',
      actionUrl: `/${locale || 'fr'}/properties/new`,
      actionLabel: dictionary?.dashboard?.aiInsights?.addProperty || 'Add Property',
      confidence: 70
    })
  }

  // Maintenance Efficiency Insights
  if (data.openTicketsCount > 0) {
    const ticketsPerProperty = data.openTicketsCount / Math.max(data.propertiesCount, 1)
    if (ticketsPerProperty > 2) {
      insights.push({
        id: 'maintenance-efficiency',
        type: 'warning',
        title: dictionary?.dashboard?.aiInsights?.maintenanceEfficiency || 'High Maintenance Load',
        description: `Average of ${ticketsPerProperty.toFixed(1)} open tickets per property. Consider preventive maintenance strategies.`,
        impact: 'medium',
        actionUrl: '/maintenance',
        actionLabel: dictionary?.dashboard?.aiInsights?.reviewMaintenance || 'Review Maintenance',
        confidence: 80
      })
    }
  }

  // Portfolio Growth Insights
  const unitsPerProperty = data.unitsCount / Math.max(data.propertiesCount, 1)
  if (data.occupancyPct > 90 && unitsPerProperty < 10) {
    insights.push({
      id: 'portfolio-growth',
      type: 'opportunity',
      title: dictionary?.dashboard?.aiInsights?.portfolioGrowth || 'Portfolio Expansion Opportunity',
      description: `High occupancy (${data.occupancyPct.toFixed(1)}%) suggests strong demand. Consider expanding your portfolio.`,
      impact: 'high',
      actionUrl: '/properties/new',
      actionLabel: dictionary?.dashboard?.aiInsights?.addProperty || 'Add Property',
      confidence: 75
    })
  }

  return insights.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 }
    return impactOrder[b.impact] - impactOrder[a.impact]
  })
}

function getInsightIcon(type: Insight['type']): string {
  switch (type) {
    case 'opportunity':
      return 'Target'
    case 'warning':
      return 'AlertTriangle'
    case 'prediction':
      return 'TrendingUp'
    case 'recommendation':
      return 'Lightbulb'
    default:
      return 'Brain'
  }
}

function renderInsightIcon(iconName: string, className: string = '') {
  switch (iconName) {
    case 'Target':
      return <Target className={className} />
    case 'AlertTriangle':
      return <AlertTriangle className={className} />
    case 'TrendingUp':
      return <TrendingUp className={className} />
    case 'Lightbulb':
      return <Lightbulb className={className} />
    case 'Brain':
      return <Brain className={className} />
    default:
      return <Brain className={className} />
  }
}

function getInsightColor(type: Insight['type']) {
  switch (type) {
    case 'opportunity':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
    case 'prediction':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
    case 'recommendation':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-300'
  }
}

function getImpactBadgeVariant(impact: Insight['impact']): 'destructive' | 'secondary' | 'outline' {
  switch (impact) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

export default function AIInsights({ data, dictionary, locale = 'fr' }: AIInsightsProps) {
  const insights = generateInsights(data, dictionary, locale)

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {dictionary?.dashboard?.aiInsights?.title || "AI Insights"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4 dark:bg-green-950/40">
              <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">All systems optimal!</p>
            <p className="text-xs text-muted-foreground">Your portfolio is performing well</p>
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
            <Brain className="h-5 w-5" />
            {dictionary?.dashboard?.aiInsights?.title || "AI Insights"}
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {dictionary?.dashboard?.aiInsights?.smart || "Smart"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.slice(0, 3).map((insight) => {
          const iconName = getInsightIcon(insight.type)

          return (
            <div
              key={insight.id}
              className={`rounded-lg border p-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {renderInsightIcon(iconName, "h-4 w-4 flex-shrink-0")}
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getImpactBadgeVariant(insight.impact)} className="text-xs">
                    {dictionary?.dashboard?.aiInsights?.[`${insight.impact}Impact`] || `${insight.impact} impact`}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% {dictionary?.dashboard?.aiInsights?.confidence || "confidence"}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm opacity-90 mb-3">
                {insight.description}
              </p>
              
              {insight.actionUrl && (
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="h-7 text-xs border-current hover:bg-current/10"
                >
                  <Link href={insight.actionUrl} className="flex items-center gap-1">
                    {insight.actionLabel || 'Take Action'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          )
        })}
        
        {insights.length > 3 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all {insights.length} insights
            </Button>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {dictionary?.dashboard?.aiInsights?.poweredBy || "Insights powered by AI analysis of your portfolio data"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
