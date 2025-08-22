// Performance monitoring and metrics collection
import { performance, PerformanceObserver } from 'perf_hooks'
import { appLogger } from './logger'

// Performance metrics interface
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: number
  tags?: Record<string, string>
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  DATABASE_QUERY: 100,      // ms
  API_RESPONSE: 500,        // ms
  CACHE_OPERATION: 10,      // ms
  FILE_OPERATION: 200,      // ms
  EXTERNAL_API: 2000,       // ms
  MEMORY_USAGE: 80,         // percentage
  CPU_USAGE: 70             // percentage
} as const

// Performance monitor class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private observers: PerformanceObserver[] = []

  private constructor() {
    this.setupObservers()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Setup performance observers
  private setupObservers(): void {
    // HTTP requests observer
    const httpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'http_request_duration',
          value: entry.duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            type: 'http',
            name: entry.name
          }
        })
      }
    })

    // Function calls observer
    const functionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'function_duration',
          value: entry.duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            type: 'function',
            name: entry.name
          }
        })
      }
    })

    try {
      httpObserver.observe({ entryTypes: ['measure'] })
      functionObserver.observe({ entryTypes: ['measure'] })
      
      this.observers.push(httpObserver, functionObserver)
    } catch (error) {
      appLogger.warn('Failed to setup performance observers', { error })
    }
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetric): void {
    const key = metric.name
    const metrics = this.metrics.get(key) || []
    
    metrics.push(metric)
    
    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.shift()
    }
    
    this.metrics.set(key, metrics)

    // Log slow operations
    this.checkThresholds(metric)
  }

  // Check performance thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const thresholds: Record<string, number> = {
      'database_query': PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
      'api_response': PERFORMANCE_THRESHOLDS.API_RESPONSE,
      'cache_operation': PERFORMANCE_THRESHOLDS.CACHE_OPERATION,
      'file_operation': PERFORMANCE_THRESHOLDS.FILE_OPERATION,
      'external_api': PERFORMANCE_THRESHOLDS.EXTERNAL_API
    }

    const threshold = thresholds[metric.name]
    if (threshold && metric.value > threshold) {
      appLogger.warn('Performance threshold exceeded', {
        metric: metric.name,
        value: metric.value,
        threshold,
        tags: metric.tags
      })
    }
  }

  // Get metrics by name
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  // Get all metrics
  getAllMetrics(): Record<string, PerformanceMetric[]> {
    return Object.fromEntries(this.metrics)
  }

  // Get metric statistics
  getMetricStats(name: string): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return null

    const values = metrics.map(m => m.value).sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count,
      min: values[0],
      max: values[count - 1],
      avg: sum / count,
      p50: values[Math.floor(count * 0.5)],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)]
    }
  }

  // Clear metrics
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton performance monitor
export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance timing utilities
export class Timer {
  private startTime: number
  private name: string
  private tags: Record<string, string>

  constructor(name: string, tags: Record<string, string> = {}) {
    this.name = name
    this.tags = tags
    this.startTime = performance.now()
  }

  // End timing and record metric
  end(): number {
    const duration = performance.now() - this.startTime
    
    performanceMonitor.recordMetric({
      name: this.name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: this.tags
    })

    return duration
  }

  // Get current duration without ending
  getCurrentDuration(): number {
    return performance.now() - this.startTime
  }
}

// Performance decorator
export function measurePerformance(metricName?: string, tags?: Record<string, string>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const name = metricName || `${target.constructor.name}.${propertyName}`

    descriptor.value = async function (...args: any[]) {
      const timer = new Timer(name, tags)
      
      try {
        const result = await originalMethod.apply(this, args)
        timer.end()
        return result
      } catch (error) {
        const duration = timer.end()
        appLogger.error(`Method ${name} failed`, error as Error, { duration })
        throw error
      }
    }

    return descriptor
  }
}

// Memory monitoring
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private intervalId: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }

  // Start memory monitoring
  start(intervalMs = 30000): void {
    if (this.intervalId) return

    this.intervalId = setInterval(() => {
      this.recordMemoryUsage()
    }, intervalMs)

    // Record initial memory usage
    this.recordMemoryUsage()
  }

  // Stop memory monitoring
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // Record current memory usage
  private recordMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    const timestamp = Date.now()

    // Record individual memory metrics
    Object.entries(memUsage).forEach(([key, value]) => {
      performanceMonitor.recordMetric({
        name: `memory_${key}`,
        value: value / 1024 / 1024, // Convert to MB
        unit: 'bytes',
        timestamp,
        tags: { type: 'memory' }
      })
    })

    // Check memory thresholds
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100

    if (heapUsagePercent > PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
      appLogger.warn('High memory usage detected', {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        usagePercent: Math.round(heapUsagePercent)
      })
    }
  }

  // Get current memory usage
  getCurrentMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage()
  }
}

// Singleton memory monitor
export const memoryMonitor = MemoryMonitor.getInstance()

// Database query performance tracking
export function trackDatabaseQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const timer = new Timer('database_query', { operation, table })
  
  return queryFn()
    .then(result => {
      const duration = timer.end()
      appLogger.database(operation, table, duration)
      return result
    })
    .catch(error => {
      const duration = timer.end()
      appLogger.error(`Database query failed: ${operation} on ${table}`, error, { duration })
      throw error
    })
}

// API response time tracking
export function trackApiResponse<T>(
  endpoint: string,
  method: string,
  handlerFn: () => Promise<T>
): Promise<T> {
  const timer = new Timer('api_response', { endpoint, method })
  
  return handlerFn()
    .then(result => {
      timer.end()
      return result
    })
    .catch(error => {
      timer.end()
      throw error
    })
}

// Cache operation tracking
export function trackCacheOperation<T>(
  operation: 'get' | 'set' | 'del',
  key: string,
  operationFn: () => Promise<T>
): Promise<T> {
  const timer = new Timer('cache_operation', { operation, key })
  
  return operationFn()
    .then(result => {
      timer.end()
      return result
    })
    .catch(error => {
      timer.end()
      throw error
    })
}

// External API call tracking
export function trackExternalApi<T>(
  service: string,
  endpoint: string,
  method: string,
  apiFn: () => Promise<T>
): Promise<T> {
  const timer = new Timer('external_api', { service, endpoint, method })
  
  return apiFn()
    .then(result => {
      const duration = timer.end()
      appLogger.externalApi(service, endpoint, method, 200, duration)
      return result
    })
    .catch(error => {
      const duration = timer.end()
      const statusCode = (error as any).response?.status || 500
      appLogger.externalApi(service, endpoint, method, statusCode, duration)
      throw error
    })
}

// Performance summary
export function getPerformanceSummary(): {
  metrics: Record<string, any>
  memory: NodeJS.MemoryUsage
  uptime: number
} {
  const metrics: Record<string, any> = {}
  
  // Get stats for key metrics
  const keyMetrics = ['database_query', 'api_response', 'cache_operation', 'external_api']
  keyMetrics.forEach(metric => {
    const stats = performanceMonitor.getMetricStats(metric)
    if (stats) {
      metrics[metric] = stats
    }
  })

  return {
    metrics,
    memory: memoryMonitor.getCurrentMemoryUsage(),
    uptime: process.uptime()
  }
}

// Initialize monitoring
export function initializePerformanceMonitoring(): void {
  // Start memory monitoring
  memoryMonitor.start()

  // Log startup
  appLogger.info('Performance monitoring initialized', {
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform
  })

  // Cleanup on process exit
  process.on('exit', () => {
    memoryMonitor.stop()
    performanceMonitor.cleanup()
  })
}
