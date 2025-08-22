'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Home,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Maximize2,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

interface AnalyticsData {
  kpis: {
    totalRevenue: number
    revenueGrowth: number
    occupancyRate: number
    occupancyTrend: number
    avgRentPrice: number
    rentGrowth: number
    maintenanceCosts: number
    maintenanceTrend: number
    collectionRate: number
    collectionTrend: number
    profitMargin: number
    profitTrend: number
  }
  revenueData: Array<{
    period: string
    revenue: number
    expenses: number
    profit: number
    occupancy: number
  }>
  propertyPerformance: Array<{
    id: string
    name: string
    revenue: number
    occupancy: number
    units: number
    avgRent: number
    performance: 'excellent' | 'good' | 'average' | 'poor'
  }>
  tenantAnalytics: {
    totalTenants: number
    newTenants: number
    renewals: number
    turnoverRate: number
    avgTenancy: number
    satisfactionScore: number
  }
  maintenanceMetrics: {
    totalTickets: number
    avgResolutionTime: number
    costPerUnit: number
    preventiveRatio: number
    satisfactionScore: number
  }
  marketComparison: {
    avgMarketRent: number
    yourAvgRent: number
    marketOccupancy: number
    yourOccupancy: number
    competitiveIndex: number
  }
}

interface InteractiveAnalyticsDashboardProps {
  data: AnalyticsData
  onDataRefresh?: () => void
}

export function InteractiveAnalyticsDashboard({ 
  data, 
  onDataRefresh 
}: InteractiveAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('12m')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const handleRefresh = async () => {
    setRefreshing(true)
    await onDataRefresh?.()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'average':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
              <SelectItem value="24m">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">TOTAL REVENUE</p>
                <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalRevenue, 'MAD')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.revenueGrowth), {
                className: `h-3 w-3 mr-1 ${getTrendColor(data.kpis.revenueGrowth)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(data.kpis.revenueGrowth)}`}>
                {Math.abs(data.kpis.revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">OCCUPANCY RATE</p>
                <p className="text-2xl font-bold">{data.kpis.occupancyRate.toFixed(1)}%</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.occupancyTrend), {
                className: `h-3 w-3 mr-1 ${getTrendColor(data.kpis.occupancyTrend)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(data.kpis.occupancyTrend)}`}>
                {Math.abs(data.kpis.occupancyTrend).toFixed(1)}%
              </span>
              <Progress value={data.kpis.occupancyRate} className="mt-1 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">AVG RENT PRICE</p>
                <p className="text-2xl font-bold">{formatCurrency(data.kpis.avgRentPrice, 'MAD')}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.rentGrowth), {
                className: `h-3 w-3 mr-1 ${getTrendColor(data.kpis.rentGrowth)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(data.kpis.rentGrowth)}`}>
                {Math.abs(data.kpis.rentGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">rent growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">COLLECTION RATE</p>
                <p className="text-2xl font-bold">{data.kpis.collectionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.collectionTrend), {
                className: `h-3 w-3 mr-1 ${getTrendColor(data.kpis.collectionTrend)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(data.kpis.collectionTrend)}`}>
                {Math.abs(data.kpis.collectionTrend).toFixed(1)}%
              </span>
              <Progress value={data.kpis.collectionRate} className="mt-1 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">MAINTENANCE COST</p>
                <p className="text-2xl font-bold">{formatCurrency(data.kpis.maintenanceCosts, 'MAD')}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.maintenanceTrend), {
                className: `h-3 w-3 mr-1 ${getTrendColor(-data.kpis.maintenanceTrend)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(-data.kpis.maintenanceTrend)}`}>
                {Math.abs(data.kpis.maintenanceTrend).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs budget</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">PROFIT MARGIN</p>
                <p className="text-2xl font-bold">{data.kpis.profitMargin.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getTrendIcon(data.kpis.profitTrend), {
                className: `h-3 w-3 mr-1 ${getTrendColor(data.kpis.profitTrend)}`
              })}
              <span className={`text-xs font-medium ${getTrendColor(data.kpis.profitTrend)}`}>
                {Math.abs(data.kpis.profitTrend).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">margin change</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue & Profit Trend</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Interactive revenue chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Revenue, expenses, and profit over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Occupancy Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Occupancy Analysis</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Occupancy trends chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Occupancy rates by property and time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.propertyPerformance.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.units} units • {property.occupancy.toFixed(1)}% occupied
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(property.revenue, 'MAD')}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(property.avgRent, 'MAD')}
                        </p>
                      </div>
                      <Badge className={getPerformanceColor(property.performance)}>
                        {property.performance}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.tenantAnalytics.totalTenants}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{data.tenantAnalytics.newTenants} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Renewal Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((data.tenantAnalytics.renewals / data.tenantAnalytics.totalTenants) * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={(data.tenantAnalytics.renewals / data.tenantAnalytics.totalTenants) * 100} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg Tenancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.tenantAnalytics.avgTenancy.toFixed(1)} months
                </div>
                <p className="text-xs text-muted-foreground">
                  Satisfaction: {data.tenantAnalytics.satisfactionScore}/5
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Lifecycle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Tenant lifecycle chart</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    New, existing, and churned tenants
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Average Rent</span>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(data.marketComparison.yourAvgRent, 'MAD')} vs {formatCurrency(data.marketComparison.avgMarketRent, 'MAD')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((data.marketComparison.yourAvgRent / data.marketComparison.avgMarketRent - 1) * 100).toFixed(1)}% vs market
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Occupancy Rate</span>
                  <div className="text-right">
                    <p className="font-medium">
                      {data.marketComparison.yourOccupancy.toFixed(1)}% vs {data.marketComparison.marketOccupancy.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(data.marketComparison.yourOccupancy - data.marketComparison.marketOccupancy).toFixed(1)}% difference
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Competitive Index</span>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {data.marketComparison.competitiveIndex.toFixed(1)}/10
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Above average performance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Market trends chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Local market rent and occupancy trends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
