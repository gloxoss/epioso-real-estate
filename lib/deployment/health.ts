// Health check and deployment utilities
import { cacheManager } from '@/lib/cache/redis'
import { appLogger } from '@/lib/monitoring/logger'
import { getPerformanceSummary } from '@/lib/monitoring/performance'

// Health check status
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

// Health check result
export interface HealthCheckResult {
  status: HealthStatus
  timestamp: number
  duration: number
  checks: Record<string, {
    status: HealthStatus
    message?: string
    duration: number
    metadata?: any
  }>
}

// Individual health check interface
export interface HealthCheck {
  name: string
  check: () => Promise<{
    status: HealthStatus
    message?: string
    metadata?: any
  }>
  timeout?: number
  critical?: boolean
}

// Health checker class
export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map()

  // Register a health check
  register(check: HealthCheck): void {
    this.checks.set(check.name, check)
  }

  // Unregister a health check
  unregister(name: string): void {
    this.checks.delete(name)
  }

  // Run all health checks
  async runChecks(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const results: HealthCheckResult['checks'] = {}
    let overallStatus: HealthStatus = 'healthy'

    const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
      const checkStartTime = Date.now()
      
      try {
        const timeoutMs = check.timeout || 5000
        const result = await Promise.race([
          check.check(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
          )
        ])

        const duration = Date.now() - checkStartTime
        results[name] = {
          status: result.status,
          message: result.message,
          duration,
          metadata: result.metadata
        }

        // Update overall status
        if (result.status === 'unhealthy' && check.critical !== false) {
          overallStatus = 'unhealthy'
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded'
        }

      } catch (error) {
        const duration = Date.now() - checkStartTime
        results[name] = {
          status: 'unhealthy',
          message: (error as Error).message,
          duration
        }

        if (check.critical !== false) {
          overallStatus = 'unhealthy'
        }
      }
    })

    await Promise.all(checkPromises)

    const totalDuration = Date.now() - startTime

    return {
      status: overallStatus,
      timestamp: Date.now(),
      duration: totalDuration,
      checks: results
    }
  }

  // Get registered checks
  getRegisteredChecks(): string[] {
    return Array.from(this.checks.keys())
  }
}

// Default health checks
export const defaultHealthChecks: HealthCheck[] = [
  // Database connectivity
  {
    name: 'database',
    critical: true,
    timeout: 5000,
    check: async () => {
      try {
        // This would test actual database connectivity
        // For now, simulate a database check
        const startTime = Date.now()
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        const responseTime = Date.now() - startTime

        if (responseTime > 1000) {
          return {
            status: 'unhealthy',
            message: 'Database response time too high',
            metadata: { responseTime }
          }
        } else if (responseTime > 500) {
          return {
            status: 'degraded',
            message: 'Database response time elevated',
            metadata: { responseTime }
          }
        }

        return {
          status: 'healthy',
          message: 'Database connection successful',
          metadata: { responseTime }
        }
      } catch (error) {
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${(error as Error).message}`
        }
      }
    }
  },

  // Cache connectivity
  {
    name: 'cache',
    critical: false,
    timeout: 3000,
    check: async () => {
      try {
        const isHealthy = await cacheManager.healthCheck()
        const stats = await cacheManager.getStats()

        if (!isHealthy) {
          return {
            status: 'unhealthy',
            message: 'Cache connection failed'
          }
        }

        return {
          status: 'healthy',
          message: 'Cache connection successful',
          metadata: stats
        }
      } catch (error) {
        return {
          status: 'degraded',
          message: `Cache check failed: ${(error as Error).message}`
        }
      }
    }
  },

  // Memory usage
  {
    name: 'memory',
    critical: false,
    check: async () => {
      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024
      const usagePercent = (heapUsedMB / heapTotalMB) * 100

      if (usagePercent > 90) {
        return {
          status: 'unhealthy',
          message: 'Memory usage critical',
          metadata: { usagePercent: Math.round(usagePercent), heapUsedMB: Math.round(heapUsedMB) }
        }
      } else if (usagePercent > 80) {
        return {
          status: 'degraded',
          message: 'Memory usage high',
          metadata: { usagePercent: Math.round(usagePercent), heapUsedMB: Math.round(heapUsedMB) }
        }
      }

      return {
        status: 'healthy',
        message: 'Memory usage normal',
        metadata: { usagePercent: Math.round(usagePercent), heapUsedMB: Math.round(heapUsedMB) }
      }
    }
  },

  // Disk space
  {
    name: 'disk',
    critical: false,
    check: async () => {
      try {
        // This would check actual disk usage
        // For now, simulate disk check
        const freeSpacePercent = Math.random() * 100

        if (freeSpacePercent < 10) {
          return {
            status: 'unhealthy',
            message: 'Disk space critical',
            metadata: { freeSpacePercent: Math.round(freeSpacePercent) }
          }
        } else if (freeSpacePercent < 20) {
          return {
            status: 'degraded',
            message: 'Disk space low',
            metadata: { freeSpacePercent: Math.round(freeSpacePercent) }
          }
        }

        return {
          status: 'healthy',
          message: 'Disk space sufficient',
          metadata: { freeSpacePercent: Math.round(freeSpacePercent) }
        }
      } catch (error) {
        return {
          status: 'degraded',
          message: `Disk check failed: ${(error as Error).message}`
        }
      }
    }
  },

  // External services
  {
    name: 'external_services',
    critical: false,
    timeout: 10000,
    check: async () => {
      const services = [
        { name: 'email_service', url: 'https://api.emailservice.com/health' },
        { name: 'payment_gateway', url: 'https://api.paymentgateway.com/status' }
      ]

      const results = await Promise.allSettled(
        services.map(async (service) => {
          // Simulate external service check
          const isHealthy = Math.random() > 0.1 // 90% success rate
          return { ...service, healthy: isHealthy }
        })
      )

      const healthyServices = results.filter(
        (result) => result.status === 'fulfilled' && result.value.healthy
      ).length

      const totalServices = services.length
      const healthyPercent = (healthyServices / totalServices) * 100

      if (healthyPercent < 50) {
        return {
          status: 'unhealthy',
          message: 'Multiple external services unavailable',
          metadata: { healthyServices, totalServices }
        }
      } else if (healthyPercent < 100) {
        return {
          status: 'degraded',
          message: 'Some external services unavailable',
          metadata: { healthyServices, totalServices }
        }
      }

      return {
        status: 'healthy',
        message: 'All external services available',
        metadata: { healthyServices, totalServices }
      }
    }
  }
]

// Singleton health checker
export const healthChecker = new HealthChecker()

// Register default health checks
defaultHealthChecks.forEach(check => healthChecker.register(check))

// Readiness check (for Kubernetes)
export async function readinessCheck(): Promise<{
  ready: boolean
  checks: Record<string, boolean>
}> {
  const result = await healthChecker.runChecks()
  const checks: Record<string, boolean> = {}
  
  Object.entries(result.checks).forEach(([name, check]) => {
    checks[name] = check.status !== 'unhealthy'
  })

  return {
    ready: result.status !== 'unhealthy',
    checks
  }
}

// Liveness check (for Kubernetes)
export async function livenessCheck(): Promise<{
  alive: boolean
  uptime: number
  memory: NodeJS.MemoryUsage
}> {
  return {
    alive: true,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }
}

// Startup check
export async function startupCheck(): Promise<{
  started: boolean
  version: string
  environment: string
  timestamp: number
}> {
  return {
    started: true,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: Date.now()
  }
}

// Comprehensive system status
export async function getSystemStatus(): Promise<{
  status: HealthStatus
  version: string
  environment: string
  uptime: number
  health: HealthCheckResult
  performance: any
  timestamp: number
}> {
  const [healthResult, performanceData] = await Promise.all([
    healthChecker.runChecks(),
    getPerformanceSummary()
  ])

  return {
    status: healthResult.status,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    health: healthResult,
    performance: performanceData,
    timestamp: Date.now()
  }
}

// Graceful shutdown handler
export class GracefulShutdown {
  private shutdownHandlers: Array<() => Promise<void>> = []
  private isShuttingDown = false

  // Register shutdown handler
  onShutdown(handler: () => Promise<void>): void {
    this.shutdownHandlers.push(handler)
  }

  // Initialize graceful shutdown
  initialize(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']
    
    signals.forEach(signal => {
      process.on(signal, () => {
        appLogger.info(`Received ${signal}, starting graceful shutdown`)
        this.shutdown()
      })
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      appLogger.error('Uncaught exception', error)
      this.shutdown(1)
    })

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      appLogger.error('Unhandled rejection', new Error(String(reason)), { promise })
      this.shutdown(1)
    })
  }

  // Perform graceful shutdown
  private async shutdown(exitCode = 0): Promise<void> {
    if (this.isShuttingDown) return
    this.isShuttingDown = true

    appLogger.info('Starting graceful shutdown')

    try {
      // Run shutdown handlers
      await Promise.all(
        this.shutdownHandlers.map(async (handler, index) => {
          try {
            await Promise.race([
              handler(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Shutdown handler timeout')), 10000)
              )
            ])
            appLogger.info(`Shutdown handler ${index + 1} completed`)
          } catch (error) {
            appLogger.error(`Shutdown handler ${index + 1} failed`, error as Error)
          }
        })
      )

      appLogger.info('Graceful shutdown completed')
    } catch (error) {
      appLogger.error('Error during graceful shutdown', error as Error)
      exitCode = 1
    }

    process.exit(exitCode)
  }
}

// Singleton graceful shutdown
export const gracefulShutdown = new GracefulShutdown()

// Initialize shutdown handling
gracefulShutdown.initialize()

// Register common shutdown handlers
gracefulShutdown.onShutdown(async () => {
  appLogger.info('Closing cache connections')
  await cacheManager.close()
})

// Deployment verification
export async function verifyDeployment(): Promise<{
  success: boolean
  checks: Record<string, boolean>
  errors: string[]
}> {
  const errors: string[] = []
  const checks: Record<string, boolean> = {}

  try {
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]

    requiredEnvVars.forEach(envVar => {
      const exists = !!process.env[envVar]
      checks[`env_${envVar}`] = exists
      if (!exists) {
        errors.push(`Missing environment variable: ${envVar}`)
      }
    })

    // Run health checks
    const healthResult = await healthChecker.runChecks()
    Object.entries(healthResult.checks).forEach(([name, result]) => {
      checks[`health_${name}`] = result.status !== 'unhealthy'
      if (result.status === 'unhealthy') {
        errors.push(`Health check failed: ${name} - ${result.message}`)
      }
    })

    const success = errors.length === 0

    return { success, checks, errors }
  } catch (error) {
    errors.push(`Deployment verification failed: ${(error as Error).message}`)
    return { success: false, checks, errors }
  }
}
