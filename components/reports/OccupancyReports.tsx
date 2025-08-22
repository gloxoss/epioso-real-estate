'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Home, Users, TrendingUp, Calendar } from 'lucide-react'
import { OccupancyChart } from './OccupancyChart'

export function OccupancyReports() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Occupancy</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">105</div>
            <p className="text-xs text-muted-foreground">
              of 120 total units
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days Vacant</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              -3 days from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Renewals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Reports Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="trends">Occupancy Trends</TabsTrigger>
            <TabsTrigger value="properties">By Property</TabsTrigger>
            <TabsTrigger value="turnover">Turnover Analysis</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
              <CardDescription>
                Historical occupancy rates across your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OccupancyChart data={[]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy by Property</CardTitle>
              <CardDescription>
                Compare occupancy rates across different properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Property occupancy list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Sunset Apartments</h4>
                      <p className="text-sm text-muted-foreground">24 units</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">95.8%</div>
                      <div className="text-sm text-green-600">23/24 occupied</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Oak Street Complex</h4>
                      <p className="text-sm text-muted-foreground">36 units</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">83.3%</div>
                      <div className="text-sm text-yellow-600">30/36 occupied</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Downtown Towers</h4>
                      <p className="text-sm text-muted-foreground">60 units</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">86.7%</div>
                      <div className="text-sm text-green-600">52/60 occupied</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Turnover Analysis</CardTitle>
              <CardDescription>
                Track tenant retention and turnover patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Turnover analysis chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Forecast</CardTitle>
              <CardDescription>
                Projected occupancy rates and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Occupancy forecast chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
