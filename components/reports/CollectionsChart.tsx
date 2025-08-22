'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatMoney } from '@/lib/format'

interface CollectionsData {
  period: string
  totalCollected: number
  totalInvoiced: number
  collectionRate: number
}

interface CollectionsChartProps {
  data: CollectionsData[]
}

export function CollectionsChart({ data }: CollectionsChartProps) {
  const currentMonth = data[data.length - 1]
  const previousMonth = data[data.length - 2]
  const trend = currentMonth && previousMonth
    ? (currentMonth.collectionRate || 0) - (previousMonth.collectionRate || 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Collections Performance
          </CardTitle>
          {currentMonth && (
            <div className="flex items-center gap-2">
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Month Summary */}
        {currentMonth && (
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Expected</div>
              <div className="text-lg font-semibold">
                {formatMoney(currentMonth.totalInvoiced)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Collected</div>
              <div className="text-lg font-semibold text-green-600">
                {formatMoney(currentMonth.totalCollected)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">Collection Rate</div>
              <div className={`text-lg font-semibold ${
                (currentMonth.collectionRate || 0) >= 95 ? 'text-green-600' :
                (currentMonth.collectionRate || 0) >= 85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(currentMonth.collectionRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Simple Chart Representation */}
        <div className="space-y-4">
          <h4 className="font-medium">Last 6 Months</h4>
          {data.slice(-6).map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{item.period}</span>
                <span className="text-muted-foreground">
                  {formatMoney(item.totalCollected)} / {formatMoney(item.totalInvoiced)} ({(item.collectionRate || 0).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (item.collectionRate || 0) >= 95 ? 'bg-green-500' :
                    (item.collectionRate || 0) >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(item.collectionRate || 0, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance Indicators */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">Average Rate</div>
            <div className="text-lg font-semibold text-green-600">
              {(data.reduce((sum, item) => sum + (item.collectionRate || 0), 0) / data.length).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Total Collected</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatMoney(data.reduce((sum, item) => sum + item.totalCollected, 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
