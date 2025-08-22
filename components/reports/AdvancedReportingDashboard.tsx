import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  Settings,
  Share2,
  Clock,
  Target,
  DollarSign,
  Home,
  Users,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

interface ReportingMetrics {
  totalReports: number
  scheduledReports: number
  customReports: number
  reportsGenerated: number
  avgGenerationTime: number
  storageUsed: number
  popularReports: Array<{
    name: string
    type: string
    usage: number
    lastGenerated: Date
  }>
  recentActivity: Array<{
    id: string
    action: string
    reportName: string
    user: string
    timestamp: Date
  }>
}

interface AdvancedReportingDashboardProps {
  metrics: ReportingMetrics
  availableReports: Array<{
    id: string
    name: string
    category: string
    description: string
    lastRun?: Date
    isScheduled: boolean
    isCustom: boolean
  }>
}

export function AdvancedReportingDashboard({ 
  metrics, 
  availableReports 
}: AdvancedReportingDashboardProps) {
  const {
    totalReports,
    scheduledReports,
    customReports,
    reportsGenerated,
    avgGenerationTime,
    storageUsed,
    popularReports,
    recentActivity
  } = metrics

  const reportCategories = [
    { name: 'Financial', count: availableReports.filter(r => r.category === 'financial').length, color: 'bg-green-500' },
    { name: 'Occupancy', count: availableReports.filter(r => r.category === 'occupancy').length, color: 'bg-blue-500' },
    { name: 'Maintenance', count: availableReports.filter(r => r.category === 'maintenance').length, color: 'bg-orange-500' },
    { name: 'Operations', count: availableReports.filter(r => r.category === 'operations').length, color: 'bg-purple-500' },
    { name: 'Custom', count: customReports, color: 'bg-gray-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Advanced Reporting</h2>
          <p className="text-muted-foreground">
            Generate insights and analytics for your property portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reports/builder">
              <Plus className="h-4 w-4 mr-2" />
              Custom Report
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reports/scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {customReports} custom reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reportsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Avg time: {avgGenerationTime}s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{scheduledReports}</div>
            <p className="text-xs text-muted-foreground">
              Auto-generated reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(storageUsed / 1024 / 1024).toFixed(1)}MB</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              75% of 1GB limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Report Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{category.count}</p>
                        <p className="text-xs text-muted-foreground">reports</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularReports.slice(0, 5).map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{report.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{report.usage} runs</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(report.lastGenerated.toISOString())}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/reports/financial">
                    <DollarSign className="h-6 w-6" />
                    <span>Financial Summary</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/reports/occupancy">
                    <Home className="h-6 w-6" />
                    <span>Occupancy Report</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/reports/maintenance">
                    <Settings className="h-6 w-6" />
                    <span>Maintenance Report</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/reports/tenant">
                    <Users className="h-6 w-6" />
                    <span>Tenant Report</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports
              .filter(report => report.category === 'financial')
              .map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div className="flex gap-1">
                        {report.isScheduled && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                        {report.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {report.description}
                    </p>
                    {report.lastRun && (
                      <p className="text-xs text-muted-foreground">
                        Last run: {formatDate(report.lastRun.toISOString())}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports
              .filter(report => ['occupancy', 'maintenance', 'operations'].includes(report.category))
              .map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      {report.category === 'occupancy' && <Home className="h-8 w-8 text-blue-500" />}
                      {report.category === 'maintenance' && <Settings className="h-8 w-8 text-orange-500" />}
                      {report.category === 'operations' && <BarChart3 className="h-8 w-8 text-purple-500" />}
                      <div className="flex gap-1">
                        {report.isScheduled && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                        {report.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {report.description}
                    </p>
                    {report.lastRun && (
                      <p className="text-xs text-muted-foreground">
                        Last run: {formatDate(report.lastRun.toISOString())}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom Reports</CardTitle>
                <Button asChild>
                  <Link href="/reports/builder">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Report
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {availableReports.filter(r => r.isCustom).length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No custom reports created yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build custom reports with our drag-and-drop report builder
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableReports
                    .filter(report => report.isCustom)
                    .map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <PieChart className="h-8 w-8 text-gray-500" />
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-1">{report.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            {report.description}
                          </p>
                          {report.lastRun && (
                            <p className="text-xs text-muted-foreground">
                              Last run: {formatDate(report.lastRun.toISOString())}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Generate
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Report Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Usage analytics chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Track report generation patterns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.reportName} by {activity.user}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp.toISOString())}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
