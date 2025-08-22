'use client'

import { TrendingUp } from 'lucide-react'

interface CollectionsData {
  collected: number
  outstanding: number
  overdue: number
}

interface CollectionsChartProps {
  period: '3m' | '6m' | '12m'
  data: CollectionsData
}

export default function CollectionsChart({ period, data }: CollectionsChartProps) {

  return (
    <div className="space-y-4">
      {/* Chart Area - Placeholder */}
      <div className="h-48 rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center relative overflow-hidden">
        {/* Mock trend line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M 0 150 Q 100 120 200 100 T 400 80"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 0 150 Q 100 120 200 100 T 400 80 L 400 200 L 0 200 Z"
            fill="url(#gradient)"
          />
        </svg>
        
        <div className="relative z-10 text-center">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Collections Trend ({period.toUpperCase()})</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total Collected</span>
          <div className="font-medium">MAD {data.collected.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Outstanding</span>
          <div className="font-medium">MAD {data.outstanding.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Overdue</span>
          <div className="font-medium">{data.overdue} invoices</div>
        </div>
      </div>
    </div>
  )
}
