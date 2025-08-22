// Advanced logging and monitoring system
import { createLogger, format, transports, Logger } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// Log context interface
export interface LogContext {
  userId?: string
  organizationId?: string
  requestId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  method?: string
  url?: string
  statusCode?: number
  responseTime?: number
  error?: Error
  stack?: string
  metadata?: Record<string, any>
}

// Custom log format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    })
  })
)

// Create logger instance
function createAppLogger(): Logger {
  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    defaultMeta: {
      service: 'property-management',
      environment: process.env.NODE_ENV || 'development'
    },
    transports: [
      // Console transport for development
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple(),
          format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            return `${timestamp} [${level}]: ${message} ${metaStr}`
          })
        )
      })
    ]
  })

  // Add file transports for production
  if (process.env.NODE_ENV === 'production') {
    // Error logs
    logger.add(new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }))

    // Combined logs
    logger.add(new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    }))

    // HTTP access logs
    logger.add(new DailyRotateFile({
      filename: 'logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    }))
  }

  return logger
}

// Singleton logger instance
export const logger = createAppLogger()

// Enhanced logging functions
export class AppLogger {
  private logger: Logger
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.logger = logger
    this.context = context
  }

  // Create child logger with additional context
  child(additionalContext: LogContext): AppLogger {
    return new AppLogger({ ...this.context, ...additionalContext })
  }

  // Log error with context
  error(message: string, error?: Error, additionalContext?: LogContext): void {
    this.logger.error(message, {
      ...this.context,
      ...additionalContext,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    })
  }

  // Log warning
  warn(message: string, additionalContext?: LogContext): void {
    this.logger.warn(message, {
      ...this.context,
      ...additionalContext,
      timestamp: new Date().toISOString()
    })
  }

  // Log info
  info(message: string, additionalContext?: LogContext): void {
    this.logger.info(message, {
      ...this.context,
      ...additionalContext,
      timestamp: new Date().toISOString()
    })
  }

  // Log HTTP request
  http(message: string, additionalContext?: LogContext): void {
    this.logger.http(message, {
      ...this.context,
      ...additionalContext,
      timestamp: new Date().toISOString()
    })
  }

  // Log debug information
  debug(message: string, additionalContext?: LogContext): void {
    this.logger.debug(message, {
      ...this.context,
      ...additionalContext,
      timestamp: new Date().toISOString()
    })
  }

  // Log performance metrics
  performance(operation: string, duration: number, additionalContext?: LogContext): void {
    this.logger.info(`Performance: ${operation}`, {
      ...this.context,
      ...additionalContext,
      operation,
      duration,
      type: 'performance',
      timestamp: new Date().toISOString()
    })
  }

  // Log business events
  event(eventName: string, eventData?: Record<string, any>): void {
    this.logger.info(`Event: ${eventName}`, {
      ...this.context,
      eventName,
      eventData,
      type: 'business_event',
      timestamp: new Date().toISOString()
    })
  }

  // Log security events
  security(message: string, severity: 'low' | 'medium' | 'high' | 'critical', additionalContext?: LogContext): void {
    this.logger.warn(`Security: ${message}`, {
      ...this.context,
      ...additionalContext,
      severity,
      type: 'security',
      timestamp: new Date().toISOString()
    })
  }

  // Log database operations
  database(operation: string, table: string, duration?: number, additionalContext?: LogContext): void {
    this.logger.debug(`Database: ${operation} on ${table}`, {
      ...this.context,
      ...additionalContext,
      operation,
      table,
      duration,
      type: 'database',
      timestamp: new Date().toISOString()
    })
  }

  // Log external API calls
  externalApi(service: string, endpoint: string, method: string, statusCode?: number, duration?: number): void {
    this.logger.info(`External API: ${method} ${service}${endpoint}`, {
      ...this.context,
      service,
      endpoint,
      method,
      statusCode,
      duration,
      type: 'external_api',
      timestamp: new Date().toISOString()
    })
  }
}

// Default logger instance
export const appLogger = new AppLogger()

// Performance monitoring decorator
export function logPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      const logger = new AppLogger({ operation, method: propertyName })

      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - startTime
        logger.performance(operation, duration)
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error(`${operation} failed`, error as Error, { duration })
        throw error
      }
    }

    return descriptor
  }
}

// Error tracking utility
export class ErrorTracker {
  private static instance: ErrorTracker
  private logger: AppLogger

  private constructor() {
    this.logger = new AppLogger()
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  // Track application errors
  trackError(error: Error, context?: LogContext): void {
    this.logger.error('Application Error', error, {
      ...context,
      errorType: error.constructor.name,
      errorCode: (error as any).code,
      severity: 'high'
    })

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(error, context)
    }
  }

  // Track validation errors
  trackValidationError(field: string, value: any, rule: string, context?: LogContext): void {
    this.logger.warn('Validation Error', {
      ...context,
      field,
      value,
      rule,
      type: 'validation_error'
    })
  }

  // Track business logic errors
  trackBusinessError(operation: string, reason: string, context?: LogContext): void {
    this.logger.warn('Business Logic Error', {
      ...context,
      operation,
      reason,
      type: 'business_error'
    })
  }

  // Send to external error tracking service (Sentry, Bugsnag, etc.)
  private sendToExternalService(error: Error, context?: LogContext): void {
    // Implementation would depend on chosen service
    // Example: Sentry.captureException(error, { extra: context })
  }
}

// Singleton error tracker
export const errorTracker = ErrorTracker.getInstance()

// Request logging middleware helper
export function createRequestLogger(context: LogContext) {
  return new AppLogger(context)
}

// Structured logging for different domains
export const domainLoggers = {
  auth: new AppLogger({ domain: 'authentication' }),
  property: new AppLogger({ domain: 'property' }),
  tenant: new AppLogger({ domain: 'tenant' }),
  payment: new AppLogger({ domain: 'payment' }),
  maintenance: new AppLogger({ domain: 'maintenance' }),
  report: new AppLogger({ domain: 'report' }),
  notification: new AppLogger({ domain: 'notification' })
}

// Log aggregation and metrics
export class LogMetrics {
  private static metrics = new Map<string, number>()

  static increment(metric: string, value = 1): void {
    const current = this.metrics.get(metric) || 0
    this.metrics.set(metric, current + value)
  }

  static decrement(metric: string, value = 1): void {
    const current = this.metrics.get(metric) || 0
    this.metrics.set(metric, Math.max(0, current - value))
  }

  static set(metric: string, value: number): void {
    this.metrics.set(metric, value)
  }

  static get(metric: string): number {
    return this.metrics.get(metric) || 0
  }

  static getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  static reset(): void {
    this.metrics.clear()
  }
}

// Health check logging
export function logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: any): void {
  const logger = new AppLogger({ service })
  
  if (status === 'healthy') {
    logger.info(`Health check passed for ${service}`, { status, details })
  } else {
    logger.error(`Health check failed for ${service}`, undefined, { status, details })
  }
}
