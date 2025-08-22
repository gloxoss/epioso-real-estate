// Redis caching utilities for production
import { Redis } from 'ioredis'

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
})

// Cache key prefixes
export const CACHE_PREFIXES = {
  USER: 'user:',
  PROPERTY: 'property:',
  TENANT: 'tenant:',
  PAYMENT: 'payment:',
  MAINTENANCE: 'maintenance:',
  REPORT: 'report:',
  DASHBOARD: 'dashboard:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate_limit:',
  ANALYTICS: 'analytics:'
} as const

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const

// Cache interface
export interface CacheOptions {
  ttl?: number
  prefix?: string
  compress?: boolean
}

// Compression utilities
function compress(data: string): string {
  // In production, use actual compression library like zlib
  return data
}

function decompress(data: string): string {
  // In production, use actual decompression
  return data
}

// Cache operations
export class CacheManager {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Set cache value
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = CACHE_TTL.MEDIUM, prefix = '', compress: shouldCompress = false } = options
      const fullKey = `${prefix}${key}`
      
      let serializedValue = JSON.stringify(value)
      if (shouldCompress && serializedValue.length > 1000) {
        serializedValue = compress(serializedValue)
      }

      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serializedValue)
      } else {
        await this.redis.set(fullKey, serializedValue)
      }
    } catch (error) {
      console.error('Cache set error:', error)
      // Don't throw - cache failures shouldn't break the app
    }
  }

  // Get cache value
  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const { prefix = '', compress: shouldCompress = false } = options
      const fullKey = `${prefix}${key}`
      
      const value = await this.redis.get(fullKey)
      if (!value) return null

      let deserializedValue = value
      if (shouldCompress) {
        deserializedValue = decompress(value)
      }

      return JSON.parse(deserializedValue)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Delete cache value
  async del(key: string, prefix = ''): Promise<void> {
    try {
      const fullKey = `${prefix}${key}`
      await this.redis.del(fullKey)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  }

  // Check if key exists
  async exists(key: string, prefix = ''): Promise<boolean> {
    try {
      const fullKey = `${prefix}${key}`
      const result = await this.redis.exists(fullKey)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Set expiration time
  async expire(key: string, ttl: number, prefix = ''): Promise<void> {
    try {
      const fullKey = `${prefix}${key}`
      await this.redis.expire(fullKey, ttl)
    } catch (error) {
      console.error('Cache expire error:', error)
    }
  }

  // Increment counter
  async incr(key: string, prefix = ''): Promise<number> {
    try {
      const fullKey = `${prefix}${key}`
      return await this.redis.incr(fullKey)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  // Increment with expiration
  async incrWithExpire(key: string, ttl: number, prefix = ''): Promise<number> {
    try {
      const fullKey = `${prefix}${key}`
      const multi = this.redis.multi()
      multi.incr(fullKey)
      multi.expire(fullKey, ttl)
      const results = await multi.exec()
      return results?.[0]?.[1] as number || 0
    } catch (error) {
      console.error('Cache increment with expire error:', error)
      return 0
    }
  }

  // Get multiple keys
  async mget<T = any>(keys: string[], prefix = ''): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => `${prefix}${key}`)
      const values = await this.redis.mget(...fullKeys)
      
      return values.map(value => {
        if (!value) return null
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      })
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = CACHE_TTL.MEDIUM, prefix = '' } = options
      const multi = this.redis.multi()

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const fullKey = `${prefix}${key}`
        const serializedValue = JSON.stringify(value)
        
        if (ttl > 0) {
          multi.setex(fullKey, ttl, serializedValue)
        } else {
          multi.set(fullKey, serializedValue)
        }
      }

      await multi.exec()
    } catch (error) {
      console.error('Cache mset error:', error)
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    memory: string
    keys: number
    hits: string
    misses: string
    hitRate: string
  }> {
    try {
      const info = await this.redis.info('memory')
      const keyspace = await this.redis.info('keyspace')
      const stats = await this.redis.info('stats')

      const memory = info.match(/used_memory_human:(.+)/)?.[1] || 'N/A'
      const keys = parseInt(keyspace.match(/keys=(\d+)/)?.[1] || '0')
      const hits = stats.match(/keyspace_hits:(.+)/)?.[1] || '0'
      const misses = stats.match(/keyspace_misses:(.+)/)?.[1] || '0'
      
      const hitRate = parseInt(hits) + parseInt(misses) > 0 
        ? ((parseInt(hits) / (parseInt(hits) + parseInt(misses))) * 100).toFixed(2) + '%'
        : '0%'

      return { memory, keys, hits, misses, hitRate }
    } catch (error) {
      console.error('Cache stats error:', error)
      return { memory: 'N/A', keys: 0, hits: '0', misses: '0', hitRate: '0%' }
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Cache health check error:', error)
      return false
    }
  }

  // Close connection
  async close(): Promise<void> {
    try {
      await this.redis.quit()
    } catch (error) {
      console.error('Cache close error:', error)
    }
  }
}

// Singleton cache manager
export const cacheManager = new CacheManager()

// Cache decorators and utilities
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':')
}

// Cache-aside pattern helper
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheManager.get<T>(key, options)
  if (cached !== null) {
    return cached
  }

  // Fetch from source
  const data = await fetchFn()
  
  // Store in cache
  await cacheManager.set(key, data, options)
  
  return data
}

// Write-through cache helper
export async function writeThrough<T>(
  key: string,
  data: T,
  persistFn: (data: T) => Promise<void>,
  options: CacheOptions = {}
): Promise<void> {
  // Write to both cache and persistent storage
  await Promise.all([
    cacheManager.set(key, data, options),
    persistFn(data)
  ])
}

// Write-behind cache helper (async write to persistent storage)
export async function writeBehind<T>(
  key: string,
  data: T,
  persistFn: (data: T) => Promise<void>,
  options: CacheOptions = {}
): Promise<void> {
  // Write to cache immediately
  await cacheManager.set(key, data, options)
  
  // Write to persistent storage asynchronously
  setImmediate(async () => {
    try {
      await persistFn(data)
    } catch (error) {
      console.error('Write-behind persist error:', error)
      // Could implement retry logic here
    }
  })
}
