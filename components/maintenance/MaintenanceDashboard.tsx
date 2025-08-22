import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Building2,
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

interface MaintenanceStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  completedTickets: number
  urgentTickets: number
  avgResolutionTime: number
  totalCost: number
  monthlyTrend: number
  slaCompliance: number
  vendorCount: number
  scheduledMaintenance: number
}

interface MaintenanceDashboardProps {
  stats: MaintenanceStats
  recentTickets: any[]
  upcomingScheduled: any[]
  topVendors: any[]
}

export function MaintenanceDashboard({ 
  stats, 
  recentTickets, 
  upcomingScheduled, 
  topVendors 
}: MaintenanceDashboardProps) {
  const {
    totalTickets,
    openTickets,
    inProgressTickets,
    completedTickets,
    urgentTickets,
    avgResolutionTime,
    totalCost,
    monthlyTrend,
    slaCompliance,
    vendorCount,
    scheduledMaintenance
  } = stats

  const completionRate = totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{inProgressTickets} in progress</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTickets}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime}d</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">15% faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{slaCompliance}%</div>
            <Progress value={slaCompliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tickets</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/maintenance" className="flex items-center gap-1">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          ticket.priority === 'urgent' ? 'bg-red-500' :
                          ticket.priority === 'high' ? 'bg-orange-500' :
                          ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.property?.name} {ticket.unit?.unitNumber && `• ${ticket.unit.unitNumber}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          ticket.status === 'open' ? 'secondary' :
                          ticket.status === 'in_progress' ? 'default' :
                          ticket.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{formatCurrency(totalCost, 'MAD')}</div>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm font-medium">2.4 hours</span>
                  </div>
                  <Progress value={85} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">First-Time Fix Rate</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">4.6/5</span>
                  </div>
                  <Progress value={92} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button asChild>
                  <Link href="/maintenance/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/maintenance/work-orders">
                    <Wrench className="h-4 w-4 mr-2" />
                    Work Orders
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/maintenance/vendors">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Vendors
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/maintenance/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Work order management coming soon</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Track detailed work orders with vendor assignments and progress
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vendor Management</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topVendors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No vendors registered yet</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add vendors to assign maintenance tasks
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topVendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{vendor.activeJobs} active jobs</p>
                        <p className="text-xs text-muted-foreground">
                          Rating: {vendor.rating}/5
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scheduled Maintenance</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingScheduled.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scheduled maintenance</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Schedule preventive maintenance to avoid issues
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingScheduled.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.property} • {item.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(item.scheduledDate)}</p>
                        <Badge variant="outline">{item.frequency}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
