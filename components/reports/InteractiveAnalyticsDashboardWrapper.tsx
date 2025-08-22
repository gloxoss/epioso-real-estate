'use client'

import { InteractiveAnalyticsDashboard } from './InteractiveAnalyticsDashboard'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    occupancyRate: number
    avgRentPerUnit: number
    portfolioValue: number
    cashFlow: number
    roi: number
  }
  trends: {
    revenueGrowth: number
    expenseGrowth: number
    occupancyTrend: number
    rentGrowth: number
    maintenanceCostTrend: number
    vacancyRate: number
    turnoverRate: number
    collectionRate: number
  }
  financialMetrics: {
    grossRentMultiplier: number
    capRate: number
    cashOnCashReturn: number
    debtServiceCoverage: number
    operatingExpenseRatio: number
    netOperatingIncome: number
    ebitda: number
    totalDebt: number
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

interface InteractiveAnalyticsDashboardWrapperProps {
  data: AnalyticsData
}

export function InteractiveAnalyticsDashboardWrapper({ 
  data 
}: InteractiveAnalyticsDashboardWrapperProps) {
  const handleDataRefresh = async () => {
    console.log('Refreshing analytics data...')
    // In a real implementation, this would trigger a router.refresh() or fetch new data
    // For now, we'll just reload the page to get fresh data
    window.location.reload()
  }

  return (
    <InteractiveAnalyticsDashboard
      data={data}
      onDataRefresh={handleDataRefresh}
    />
  )
}
