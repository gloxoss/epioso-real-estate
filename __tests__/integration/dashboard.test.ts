// Integration tests for dashboard functionality
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { I18nProvider } from '@/lib/i18n/hooks'
import { AdvancedReportingDashboard } from '@/components/reports/AdvancedReportingDashboard'
import { InteractiveAnalyticsDashboard } from '@/components/reports/InteractiveAnalyticsDashboard'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { ActivityFeed } from '@/components/realtime/ActivityFeed'

// Mock data
const mockReportingMetrics = {
  totalReports: 24,
  scheduledReports: 8,
  customReports: 3,
  reportsGenerated: 12,
  avgGenerationTime: 2.3,
  storageUsed: 156 * 1024 * 1024,
  popularReports: [
    { name: 'Monthly Financial Summary', type: 'financial', usage: 45, lastGenerated: new Date() },
    { name: 'Occupancy Report', type: 'operational', usage: 32, lastGenerated: new Date() },
    { name: 'Maintenance Analysis', type: 'maintenance', usage: 28, lastGenerated: new Date() }
  ],
  recentActivity: [
    { id: '1', action: 'Generated', reportName: 'Financial Summary', user: 'John Doe', timestamp: new Date() },
    { id: '2', action: 'Scheduled', reportName: 'Monthly Report', user: 'Jane Smith', timestamp: new Date() }
  ]
}

const mockAvailableReports = [
  { id: '1', name: 'Financial Summary', category: 'financial', description: 'Comprehensive financial overview', lastRun: new Date(), isScheduled: true, isCustom: false },
  { id: '2', name: 'Occupancy Analysis', category: 'occupancy', description: 'Detailed occupancy metrics', isScheduled: false, isCustom: false },
  { id: '3', name: 'Maintenance Report', category: 'maintenance', description: 'Maintenance costs and trends', isScheduled: true, isCustom: false }
]

const mockAnalyticsData = {
  kpis: {
    totalRevenue: 125000,
    revenueGrowth: 12.5,
    occupancyRate: 94.2,
    occupancyTrend: 2.1,
    avgRentPrice: 2850,
    rentGrowth: 8.3,
    maintenanceCosts: 15000,
    maintenanceTrend: -5.2,
    collectionRate: 96.8,
    collectionTrend: 1.4,
    profitMargin: 68.5,
    profitTrend: 3.2
  },
  revenueData: [
    { period: 'Jan 2024', revenue: 45000, expenses: 12000, profit: 33000, occupancy: 92 },
    { period: 'Feb 2024', revenue: 47000, expenses: 13000, profit: 34000, occupancy: 94 }
  ],
  propertyPerformance: [
    { id: '1', name: 'Sunset Apartments', revenue: 15000, occupancy: 98, units: 6, avgRent: 2500, performance: 'excellent' as const }
  ],
  tenantAnalytics: {
    totalTenants: 45,
    newTenants: 3,
    renewals: 38,
    turnoverRate: 15.6,
    avgTenancy: 18.5,
    satisfactionScore: 4.2
  },
  maintenanceMetrics: {
    totalTickets: 24,
    avgResolutionTime: 3.2,
    costPerUnit: 125,
    preventiveRatio: 65,
    satisfactionScore: 4.1
  },
  marketComparison: {
    avgMarketRent: 2650,
    yourAvgRent: 2850,
    marketOccupancy: 91.5,
    yourOccupancy: 94.2,
    competitiveIndex: 7.8
  }
}

const mockNotifications = [
  {
    id: '1',
    type: 'payment' as const,
    title: 'Payment Received',
    message: 'Rent payment of 2,500 MAD received from John Doe',
    timestamp: new Date(),
    isRead: false,
    isArchived: false,
    priority: 'medium' as const
  }
]

const mockActivities = [
  {
    id: '1',
    type: 'payment' as const,
    action: 'Payment Received',
    description: 'Rent payment of 2,500 MAD received from John Doe for Unit 3A',
    user: { id: '1', name: 'System', avatar: '', role: 'System' },
    timestamp: new Date(),
    metadata: { amount: 2500, tenantName: 'John Doe', unitNumber: '3A' },
    priority: 'medium' as const,
    status: 'success' as const
  }
]

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider initialLocale="en">
    {children}
  </I18nProvider>
)

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Advanced Reporting Dashboard', () => {
    it('renders reporting dashboard with metrics', async () => {
      render(
        <TestWrapper>
          <AdvancedReportingDashboard 
            metrics={mockReportingMetrics}
            availableReports={mockAvailableReports}
          />
        </TestWrapper>
      )

      // Check if main components are rendered
      expect(screen.getByText('Advanced Reporting Dashboard')).toBeInTheDocument()
      expect(screen.getByText('24')).toBeInTheDocument() // Total reports
      expect(screen.getByText('8')).toBeInTheDocument() // Scheduled reports
      expect(screen.getByText('3')).toBeInTheDocument() // Custom reports
    })

    it('displays popular reports correctly', async () => {
      render(
        <TestWrapper>
          <AdvancedReportingDashboard 
            metrics={mockReportingMetrics}
            availableReports={mockAvailableReports}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Monthly Financial Summary')).toBeInTheDocument()
        expect(screen.getByText('Occupancy Report')).toBeInTheDocument()
        expect(screen.getByText('Maintenance Analysis')).toBeInTheDocument()
      })
    })

    it('handles report generation', async () => {
      const mockOnGenerate = jest.fn()
      
      render(
        <TestWrapper>
          <AdvancedReportingDashboard 
            metrics={mockReportingMetrics}
            availableReports={mockAvailableReports}
            onGenerateReport={mockOnGenerate}
          />
        </TestWrapper>
      )

      // Find and click generate button
      const generateButtons = screen.getAllByText(/Generate/i)
      if (generateButtons.length > 0) {
        fireEvent.click(generateButtons[0])
        expect(mockOnGenerate).toHaveBeenCalled()
      }
    })
  })

  describe('Interactive Analytics Dashboard', () => {
    it('renders analytics dashboard with KPIs', async () => {
      render(
        <TestWrapper>
          <InteractiveAnalyticsDashboard 
            data={mockAnalyticsData}
            onDataRefresh={jest.fn()}
          />
        </TestWrapper>
      )

      // Check KPI values
      expect(screen.getByText('125,000 MAD')).toBeInTheDocument() // Total revenue
      expect(screen.getByText('94.2%')).toBeInTheDocument() // Occupancy rate
      expect(screen.getByText('2,850 MAD')).toBeInTheDocument() // Avg rent price
    })

    it('displays trend indicators', async () => {
      render(
        <TestWrapper>
          <InteractiveAnalyticsDashboard 
            data={mockAnalyticsData}
            onDataRefresh={jest.fn()}
          />
        </TestWrapper>
      )

      // Check for trend indicators (growth percentages)
      expect(screen.getByText('12.5%')).toBeInTheDocument() // Revenue growth
      expect(screen.getByText('2.1%')).toBeInTheDocument() // Occupancy trend
    })

    it('handles data refresh', async () => {
      const mockRefresh = jest.fn()
      
      render(
        <TestWrapper>
          <InteractiveAnalyticsDashboard 
            data={mockAnalyticsData}
            onDataRefresh={mockRefresh}
          />
        </TestWrapper>
      )

      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('switches between time ranges', async () => {
      render(
        <TestWrapper>
          <InteractiveAnalyticsDashboard 
            data={mockAnalyticsData}
            onDataRefresh={jest.fn()}
          />
        </TestWrapper>
      )

      // Find time range selector
      const timeRangeSelect = screen.getByDisplayValue('Last Year')
      fireEvent.click(timeRangeSelect)
      
      // Should show time range options
      await waitFor(() => {
        expect(screen.getByText('Last Month')).toBeInTheDocument()
        expect(screen.getByText('Last 3 Months')).toBeInTheDocument()
      })
    })
  })

  describe('Notification Center', () => {
    it('renders notifications correctly', async () => {
      render(
        <TestWrapper>
          <NotificationCenter
            notifications={mockNotifications}
            onMarkAsRead={jest.fn()}
            onMarkAllAsRead={jest.fn()}
            onArchive={jest.fn()}
            onAction={jest.fn()}
          />
        </TestWrapper>
      )

      // Check notification bell icon
      const bellIcon = screen.getByRole('button')
      expect(bellIcon).toBeInTheDocument()
    })

    it('shows unread count badge', async () => {
      render(
        <TestWrapper>
          <NotificationCenter
            notifications={mockNotifications}
            onMarkAsRead={jest.fn()}
            onMarkAllAsRead={jest.fn()}
            onArchive={jest.fn()}
            onAction={jest.fn()}
          />
        </TestWrapper>
      )

      // Should show unread count
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('handles mark as read action', async () => {
      const mockMarkAsRead = jest.fn()
      
      render(
        <TestWrapper>
          <NotificationCenter
            notifications={mockNotifications}
            onMarkAsRead={mockMarkAsRead}
            onMarkAllAsRead={jest.fn()}
            onArchive={jest.fn()}
            onAction={jest.fn()}
          />
        </TestWrapper>
      )

      // Open notification center
      const bellButton = screen.getByRole('button')
      fireEvent.click(bellButton)

      // Wait for notification content to appear
      await waitFor(() => {
        expect(screen.getByText('Payment Received')).toBeInTheDocument()
      })
    })
  })

  describe('Activity Feed', () => {
    it('renders activity feed with activities', async () => {
      render(
        <TestWrapper>
          <ActivityFeed
            activities={mockActivities}
            onRefresh={jest.fn()}
            showFilters={true}
            maxItems={50}
            autoRefresh={false}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Activity Feed')).toBeInTheDocument()
      expect(screen.getByText('Payment Received')).toBeInTheDocument()
    })

    it('displays activity metadata', async () => {
      render(
        <TestWrapper>
          <ActivityFeed
            activities={mockActivities}
            onRefresh={jest.fn()}
          />
        </TestWrapper>
      )

      // Check for metadata badges
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Unit 3A')).toBeInTheDocument()
      expect(screen.getByText('2,500 MAD')).toBeInTheDocument()
    })

    it('handles activity refresh', async () => {
      const mockRefresh = jest.fn()
      
      render(
        <TestWrapper>
          <ActivityFeed
            activities={mockActivities}
            onRefresh={mockRefresh}
          />
        </TestWrapper>
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('filters activities by type', async () => {
      render(
        <TestWrapper>
          <ActivityFeed
            activities={mockActivities}
            onRefresh={jest.fn()}
            showFilters={true}
          />
        </TestWrapper>
      )

      // Find filter dropdown
      const filterSelect = screen.getByDisplayValue('All Types')
      fireEvent.click(filterSelect)
      
      // Should show filter options
      await waitFor(() => {
        expect(screen.getByText('Payment')).toBeInTheDocument()
        expect(screen.getByText('Maintenance')).toBeInTheDocument()
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('handles multiple components together', async () => {
      render(
        <TestWrapper>
          <div>
            <InteractiveAnalyticsDashboard 
              data={mockAnalyticsData}
              onDataRefresh={jest.fn()}
            />
            <ActivityFeed
              activities={mockActivities}
              onRefresh={jest.fn()}
            />
            <NotificationCenter
              notifications={mockNotifications}
              onMarkAsRead={jest.fn()}
              onMarkAllAsRead={jest.fn()}
              onArchive={jest.fn()}
              onAction={jest.fn()}
            />
          </div>
        </TestWrapper>
      )

      // All components should render without conflicts
      expect(screen.getByText('Real-time Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Activity Feed')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument() // Notification bell
    })

    it('maintains state across component interactions', async () => {
      const mockRefresh = jest.fn()
      
      render(
        <TestWrapper>
          <InteractiveAnalyticsDashboard 
            data={mockAnalyticsData}
            onDataRefresh={mockRefresh}
          />
        </TestWrapper>
      )

      // Interact with time range
      const timeRangeSelect = screen.getByDisplayValue('Last Year')
      fireEvent.click(timeRangeSelect)
      
      // Select different range
      await waitFor(() => {
        const monthOption = screen.getByText('Last Month')
        fireEvent.click(monthOption)
      })

      // Refresh data
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
