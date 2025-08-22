// In-memory caching for development and fallback
interface CacheEntry<T = any> {
  value: T
  expiresAt: number
  createdAt: number
}

interface MemoryCacheOptions {
  ttl?: number
  maxSize?: number
  cleanupInterval?: number
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: MemoryCacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
    
    // Start cleanup interval
    if (options.cleanupInterval) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, options.cleanupInterval)
    }
  }

  // Set cache value
  set<T>(key: string, value: T, ttl = 300): void {
    const now = Date.now()
    const expiresAt = ttl > 0 ? now + (ttl * 1000) : Infinity

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: now
    })
  }

  // Get cache value
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete cache value
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Get all keys
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
  } {
    const size = this.cache.size
    const memoryUsage = this.estimateMemoryUsage()
    
    return {
      size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      memoryUsage
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Estimate memory usage (rough calculation)
  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2 // UTF-16 characters
      totalSize += JSON.stringify(entry.value).length * 2
      totalSize += 24 // Approximate overhead for entry object
    }

    return totalSize
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// LRU Cache implementation
export class LRUCache<T = any> {
  private cache = new Map<string, { value: T; expiresAt: number }>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  set(key: string, value: T, ttl = 300): void {
    const expiresAt = ttl > 0 ? Date.now() + (ttl * 1000) : Infinity

    // If key exists, delete it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // If cache is full, remove least recently used (first entry)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // Add to end (most recently used)
    this.cache.set(key, { value, expiresAt })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    // Move to end (mark as recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Singleton instances
export const memoryCache = new MemoryCache({
  maxSize: 1000,
  cleanupInterval: 60000 // Cleanup every minute
})

export const lruCache = new LRUCache(500)

// Cache factory
export function createCache(type: 'memory' | 'lru' = 'memory', options?: any) {
  switch (type) {
    case 'lru':
      return new LRUCache(options?.maxSize)
    case 'memory':
    default:
      return new MemoryCache(options)
  }
}

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: { ttl?: number; keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiresAt: number }>()
  const { ttl = 300, keyFn = (...args) => JSON.stringify(args) } = options

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args)
    const now = Date.now()
    const cached = cache.get(key)

    // Return cached value if not expired
    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    // Compute new value
    const value = fn(...args)
    const expiresAt = ttl > 0 ? now + (ttl * 1000) : Infinity

    cache.set(key, { value, expiresAt })

    return value
  }) as T
}

// Async memoization
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: { ttl?: number; keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new Map<string, { 
    value: ReturnType<T>
    expiresAt: number
    pending?: ReturnType<T>
  }>()
  const { ttl = 300, keyFn = (...args) => JSON.stringify(args) } = options

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = keyFn(...args)
    const now = Date.now()
    const cached = cache.get(key)

    // Return cached value if not expired
    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    // Return pending promise if already computing
    if (cached?.pending) {
      return cached.pending
    }

    // Compute new value
    const promise = fn(...args)
    const expiresAt = ttl > 0 ? now + (ttl * 1000) : Infinity

    // Store pending promise
    cache.set(key, { value: promise, expiresAt, pending: promise })

    try {
      const value = await promise
      // Update with resolved value
      cache.set(key, { value: Promise.resolve(value), expiresAt })
      return value
    } catch (error) {
      // Remove failed computation from cache
      cache.delete(key)
      throw error
    }
  }) as T
}

// Cache warming utility
export async function warmCache<T>(
  keys: string[],
  fetchFn: (key: string) => Promise<T>,
  cache: MemoryCache | LRUCache<T>,
  options: { concurrency?: number; ttl?: number } = {}
): Promise<void> {
  const { concurrency = 5, ttl = 300 } = options
  
  // Process keys in batches
  for (let i = 0; i < keys.length; i += concurrency) {
    const batch = keys.slice(i, i + concurrency)
    
    await Promise.allSettled(
      batch.map(async (key) => {
        try {
          const value = await fetchFn(key)
          cache.set(key, value, ttl)
        } catch (error) {
          console.error(`Failed to warm cache for key ${key}:`, error)
        }
      })
    )
  }
}
