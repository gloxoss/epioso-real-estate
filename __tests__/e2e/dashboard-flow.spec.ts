// End-to-end tests for dashboard workflows
import { test, expect, Page } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Helper functions
async function login(page: Page, email = 'test@example.com', password = 'password') {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('**/dashboard')
}

async function waitForDashboardLoad(page: Page) {
  await page.waitForSelector('[data-testid="dashboard-container"]')
  await page.waitForSelector('[data-testid="kpi-cards"]')
}

test.describe('Dashboard Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/dashboard/**', async (route) => {
      const url = route.request().url()
      
      if (url.includes('/metrics')) {
        await route.fulfill({
          json: {
            totalRevenue: 125000,
            occupancyRate: 94.2,
            activeProperties: 12,
            totalUnits: 48,
            occupiedUnits: 45,
            maintenanceTickets: 8,
            overduePayments: 3
          }
        })
      } else if (url.includes('/activities')) {
        await route.fulfill({
          json: [
            {
              id: '1',
              type: 'payment',
              action: 'Payment Received',
              description: 'Rent payment of 2,500 MAD received from John Doe',
              timestamp: new Date().toISOString(),
              user: { name: 'System', role: 'System' }
            }
          ]
        })
      } else {
        await route.continue()
      }
    })
  })

  test('should display dashboard with KPIs', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Check KPI cards are visible
    await expect(page.locator('[data-testid="kpi-total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-occupancy-rate"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-active-properties"]')).toBeVisible()

    // Check KPI values
    await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('125,000')
    await expect(page.locator('[data-testid="kpi-occupancy-rate"]')).toContainText('94.2%')
    await expect(page.locator('[data-testid="kpi-active-properties"]')).toContainText('12')
  })

  test('should show real-time activity feed', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Check activity feed is visible
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible()
    
    // Check for activity items
    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="activity-item"]').first()).toContainText('Payment Received')
  })

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Mock updated data for refresh
    await page.route('**/api/dashboard/metrics', async (route) => {
      await route.fulfill({
        json: {
          totalRevenue: 130000, // Updated value
          occupancyRate: 95.1,   // Updated value
          activeProperties: 12,
          totalUnits: 48,
          occupiedUnits: 46,     // Updated value
          maintenanceTickets: 6, // Updated value
          overduePayments: 2     // Updated value
        }
      })
    })

    // Click refresh button
    await page.click('[data-testid="refresh-button"]')
    
    // Wait for loading state
    await expect(page.locator('[data-testid="refresh-button"]')).toHaveAttribute('disabled', '')
    
    // Wait for data to update
    await page.waitForTimeout(1000)
    
    // Check updated values
    await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('130,000')
    await expect(page.locator('[data-testid="kpi-occupancy-rate"]')).toContainText('95.1%')
  })

  test('should navigate to reports section', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Click on reports navigation
    await page.click('[data-testid="nav-reports"]')
    await page.waitForURL('**/reports')

    // Check reports page loaded
    await expect(page.locator('[data-testid="reports-container"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Reports')
  })

  test('should open and interact with notifications', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Mock notifications
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        json: [
          {
            id: '1',
            type: 'payment',
            title: 'Payment Received',
            message: 'Rent payment of 2,500 MAD received from John Doe',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'medium'
          },
          {
            id: '2',
            type: 'maintenance',
            title: 'Maintenance Request',
            message: 'New plumbing issue reported in Unit 3A',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'high'
          }
        ]
      })
    })

    // Click notification bell
    await page.click('[data-testid="notification-bell"]')
    
    // Check notification panel opens
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible()
    
    // Check notification items
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="notification-item"]').first()).toContainText('Payment Received')
    
    // Mark notification as read
    await page.click('[data-testid="mark-read-button"]')
    
    // Check notification is marked as read (visual indicator should change)
    await expect(page.locator('[data-testid="notification-item"]').first()).toHaveClass(/read/)
  })

  test('should switch language and update interface', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Click language switcher
    await page.click('[data-testid="language-switcher"]')
    
    // Select French
    await page.click('[data-testid="language-option-fr"]')
    
    // Wait for language to change
    await page.waitForTimeout(500)
    
    // Check that interface text changed to French
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Tableau de bord')
    await expect(page.locator('[data-testid="nav-properties"]')).toContainText('Propriétés')
    
    // Switch back to English
    await page.click('[data-testid="language-switcher"]')
    await page.click('[data-testid="language-option-en"]')
    await page.waitForTimeout(500)
    
    // Check interface is back to English
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="nav-properties"]')).toContainText('Properties')
  })

  test('should handle real-time updates', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Simulate real-time update via WebSocket
    await page.evaluate(() => {
      // Simulate WebSocket message
      window.dispatchEvent(new CustomEvent('websocket-message', {
        detail: {
          type: 'metric_update',
          data: {
            metricId: 'total-revenue',
            value: 135000,
            timestamp: new Date().toISOString()
          }
        }
      }))
    })

    // Wait for UI to update
    await page.waitForTimeout(1000)
    
    // Check that the metric was updated
    await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('135,000')
  })

  test('should display error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/metrics', async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: 'Internal server error' }
      })
    })

    await login(page)
    
    // Check error state is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load dashboard data')
    
    // Check retry button is available
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should handle loading states', async ({ page }) => {
    // Add delay to API response
    await page.route('**/api/dashboard/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    await login(page)
    
    // Check loading indicators are shown
    await expect(page.locator('[data-testid="dashboard-loading"]')).toBeVisible()
    await expect(page.locator('[data-testid="kpi-skeleton"]')).toBeVisible()
    
    // Wait for loading to complete
    await waitForDashboardLoad(page)
    
    // Check loading indicators are hidden
    await expect(page.locator('[data-testid="dashboard-loading"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="kpi-skeleton"]')).not.toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await login(page)
    await waitForDashboardLoad(page)

    // Check mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible()
    
    // Check KPI cards stack vertically on mobile
    const kpiCards = page.locator('[data-testid="kpi-card"]')
    const firstCard = kpiCards.first()
    const secondCard = kpiCards.nth(1)
    
    const firstCardBox = await firstCard.boundingBox()
    const secondCardBox = await secondCard.boundingBox()
    
    // Second card should be below first card (not side by side)
    expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height - 10)
  })

  test('should maintain state across page refreshes', async ({ page }) => {
    await login(page)
    await waitForDashboardLoad(page)

    // Change language to French
    await page.click('[data-testid="language-switcher"]')
    await page.click('[data-testid="language-option-fr"]')
    await page.waitForTimeout(500)

    // Refresh the page
    await page.reload()
    await waitForDashboardLoad(page)

    // Check that French is still selected
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Tableau de bord')
  })
})

test.describe('Performance Tests', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await login(page)
    await waitForDashboardLoad(page)
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('**/api/dashboard/activities', async (route) => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        type: 'payment',
        action: `Activity ${i}`,
        description: `Description for activity ${i}`,
        timestamp: new Date().toISOString(),
        user: { name: 'User', role: 'System' }
      }))
      
      await route.fulfill({ json: largeDataset })
    })

    await login(page)
    await waitForDashboardLoad(page)

    // Check that activity feed still renders efficiently
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible()
    
    // Check that only visible items are rendered (virtualization)
    const visibleItems = await page.locator('[data-testid="activity-item"]').count()
    expect(visibleItems).toBeLessThan(50) // Should not render all 1000 items
  })
})
