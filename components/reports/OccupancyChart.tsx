'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Users, TrendingUp } from 'lucide-react'

interface OccupancyData {
  propertyId: string
  propertyName: string
  totalUnits: number
  occupiedUnits: number
  availableUnits: number
  occupancyRate: number
  expectedUnits?: number
}

interface OccupancyChartProps {
  data: OccupancyData[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  // Ensure data is an array and provide fallback
  const safeData = Array.isArray(data) ? data : []

  // Calculate overall metrics from all properties
  const totalUnits = safeData.reduce((sum, item) => sum + item.totalUnits, 0)
  const totalOccupied = safeData.reduce((sum, item) => sum + item.occupiedUnits, 0)
  const totalAvailable = safeData.reduce((sum, item) => sum + item.availableUnits, 0)
  const overallOccupancyRate = totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 0

  // Show empty state if no data
  if (safeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Occupancy Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Occupancy Data</h3>
            <p className="text-sm text-muted-foreground">
              No property occupancy data is available to display.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Occupancy Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">
              {safeData.length} Properties
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Total Units</div>
            <div className="text-lg font-semibold">
              {totalUnits}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Occupied</div>
            <div className="text-lg font-semibold text-blue-600">
              {totalOccupied}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Available</div>
            <div className="text-lg font-semibold text-green-600">
              {totalAvailable}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Occupancy Rate</div>
            <div className={`text-lg font-semibold ${
              overallOccupancyRate >= 95 ? 'text-green-600' :
              overallOccupancyRate >= 85 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallOccupancyRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Unit Status Breakdown */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Overall Unit Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  Occupied
                </Badge>
              </div>
              <span className="text-sm font-medium">
                {totalOccupied} units ({totalUnits > 0 ? ((totalOccupied / totalUnits) * 100).toFixed(1) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <Home className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              </div>
              <span className="text-sm font-medium">
                {totalAvailable} units ({totalUnits > 0 ? ((totalAvailable / totalUnits) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Property Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium">Property Breakdown</h4>
          {safeData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{item.propertyName}</span>
                <span className="text-muted-foreground">
                  {item.occupiedUnits}/{item.totalUnits} units ({(item.occupancyRate || 0).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (item.occupancyRate || 0) >= 95 ? 'bg-green-500' :
                    (item.occupancyRate || 0) >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(item.occupancyRate || 0, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Average Occupancy</div>
            <div className="text-lg font-semibold text-blue-600">
              {safeData.length > 0 ? (safeData.reduce((sum, item) => sum + (item.occupancyRate || 0), 0) / safeData.length).toFixed(1) : 0}%
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">Best Performing</div>
            <div className="text-lg font-semibold text-green-600">
              {safeData.length > 0 ? Math.max(...safeData.map(item => item.occupancyRate || 0)).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
