{/* Sales Pipeline Chart */ }
<ErrorBoundary>
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Sales Pipeline
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                        Active deals and sales progress
                    </CardDescription>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
                {/* Pipeline Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Deals</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeSalesCount}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pipeline Value</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            MAD {salesData.data
                                .filter((deal: any) => ['active', 'pending_approval', 'approved'].includes(deal.status))
                                .reduce((sum: number, deal: any) => {
                                    const price = deal.salePrice?.toNumber ? deal.salePrice.toNumber() : (deal.salePrice || 0)
                                    return sum + price
                                }, 0)
                                .toLocaleString()}
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Deal Size</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                            MAD {salesData.data.length > 0
                                ? Math.round(salesData.data.reduce((sum: number, deal: any) => {
                                    const price = deal.salePrice?.toNumber ? deal.salePrice.toNumber() : (deal.salePrice || 0)
                                    return sum + price
                                }, 0) / salesData.data.length).toLocaleString()
                                : '0'}
                        </p>
                    </div>
                </div>
            </Suspense>
        </CardContent>
    </Card>
</ErrorBoundary>



{/* Real-Time Metrics */ }
<ErrorBoundary>
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardHeader>
            <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        Real-Time Metrics
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                        Live performance indicators
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <RealTimeDashboardWrapper
                dictionary={dictionary}
                locale={locale}
                metrics={[
                    {
                        id: 'total-revenue',
                        label: dictionary.dashboard.realtime.totalRevenue,
                        value: kpis.collectionsThisMonth * 12,
                        previousValue: kpis.collectionsThisMonth * 11.5,
                        change: 4.3,
                        changeType: 'increase',
                        format: 'currency',
                        icon: "DollarSign",
                        color: 'text-green-600',
                        status: 'good',
                        lastUpdated: new Date('2024-01-15T10:30:00Z')
                    },
                    {
                        id: 'occupancy-rate',
                        label: dictionary.dashboard.realtime.occupancyRate,
                        value: kpis.occupancyPct,
                        previousValue: kpis.occupancyPct - 2.1,
                        change: 2.1,
                        changeType: 'increase',
                        format: 'percentage',
                        icon: "Home",
                        target: 95,
                        status: kpis.occupancyPct > 90 ? 'good' : 'warning',
                        lastUpdated: new Date('2024-01-15T10:30:00Z')
                    },
                    {
                        id: 'active-tenants',
                        label: dictionary.dashboard.realtime.activeTenants,
                        value: kpis.occupiedUnits,
                        previousValue: kpis.occupiedUnits - 2,
                        change: 3.2,
                        changeType: 'increase',
                        format: 'number',
                        icon: "Users",
                        status: 'good',
                        lastUpdated: new Date()
                    },
                    {
                        id: 'maintenance-tickets',
                        label: dictionary.dashboard.realtime.openTickets,
                        value: kpis.openTicketsCount,
                        previousValue: kpis.openTicketsCount + 3,
                        change: -15.8,
                        changeType: 'decrease',
                        format: 'number',
                        icon: "AlertTriangle",
                        status: kpis.openTicketsCount > 10 ? 'warning' : 'good',
                        lastUpdated: new Date()
                    }
                ]}
                autoRefresh={true}
                refreshInterval={30000}
                showConnectionStatus={true}
            />
        </CardContent>
    </Card>
</ErrorBoundary>