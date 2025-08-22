// Unit tests for caching utilities
import { jest } from '@jest/globals'
import { MemoryCache, LRUCache, memoize, memoizeAsync } from '@/lib/cache/memory'

describe('Memory Cache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    cache = new MemoryCache({ maxSize: 3, cleanupInterval: 100 })
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull()
    })

    it('should handle different data types', () => {
      cache.set('string', 'hello')
      cache.set('number', 42)
      cache.set('object', { foo: 'bar' })
      cache.set('array', [1, 2, 3])

      expect(cache.get('string')).toBe('hello')
      expect(cache.get('number')).toBe(42)
      expect(cache.get('object')).toEqual({ foo: 'bar' })
      expect(cache.get('array')).toEqual([1, 2, 3])
    })

    it('should check if key exists', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should delete values', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      
      cache.delete('key1')
      expect(cache.has('key1')).toBe(false)
    })

    it('should clear all values', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
      
      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire values after TTL', async () => {
      cache.set('key1', 'value1', 0.1) // 100ms TTL
      expect(cache.get('key1')).toBe('value1')
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(cache.get('key1')).toBeNull()
    })

    it('should not expire values with infinite TTL', async () => {
      cache.set('key1', 'value1', 0) // Infinite TTL
      expect(cache.get('key1')).toBe('value1')
      
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('Size Limits', () => {
    it('should respect max size limit', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.size()).toBe(3)
      
      // Adding 4th item should evict oldest
      cache.set('key4', 'value4')
      expect(cache.size()).toBe(3)
      expect(cache.has('key1')).toBe(false) // Oldest should be evicted
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('Statistics', () => {
    it('should provide cache statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(3)
      expect(typeof stats.memoryUsage).toBe('number')
    })
  })
})

describe('LRU Cache', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache<string>(3)
  })

  it('should evict least recently used items', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    
    // Access key1 to make it recently used
    cache.get('key1')
    
    // Add key4, should evict key2 (least recently used)
    cache.set('key4', 'value4')
    
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false) // Should be evicted
    expect(cache.has('key3')).toBe(true)
    expect(cache.has('key4')).toBe(true)
  })

  it('should update access order on get', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    
    // Access key1 to make it most recently used
    cache.get('key1')
    
    // Add key4, should evict key2 (now least recently used)
    cache.set('key4', 'value4')
    
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
  })
})

describe('Memoization', () => {
  describe('Synchronous Memoization', () => {
    it('should cache function results', () => {
      let callCount = 0
      const expensiveFunction = memoize((x: number) => {
        callCount++
        return x * 2
      })

      expect(expensiveFunction(5)).toBe(10)
      expect(expensiveFunction(5)).toBe(10) // Should use cache
      expect(callCount).toBe(1) // Function called only once
    })

    it('should handle different arguments', () => {
      let callCount = 0
      const expensiveFunction = memoize((x: number) => {
        callCount++
        return x * 2
      })

      expect(expensiveFunction(5)).toBe(10)
      expect(expensiveFunction(10)).toBe(20)
      expect(expensiveFunction(5)).toBe(10) // Should use cache
      expect(callCount).toBe(2) // Function called twice for different args
    })

    it('should respect TTL', async () => {
      let callCount = 0
      const expensiveFunction = memoize((x: number) => {
        callCount++
        return x * 2
      }, { ttl: 0.1 }) // 100ms TTL

      expect(expensiveFunction(5)).toBe(10)
      expect(callCount).toBe(1)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(expensiveFunction(5)).toBe(10)
      expect(callCount).toBe(2) // Function called again after expiration
    })

    it('should use custom key function', () => {
      let callCount = 0
      const expensiveFunction = memoize(
        (obj: { id: number; name: string }) => {
          callCount++
          return `${obj.id}-${obj.name}`
        },
        { keyFn: (obj) => obj.id.toString() }
      )

      const obj1 = { id: 1, name: 'first' }
      const obj2 = { id: 1, name: 'second' } // Same id, different name

      expect(expensiveFunction(obj1)).toBe('1-first')
      expect(expensiveFunction(obj2)).toBe('1-first') // Should use cached result
      expect(callCount).toBe(1)
    })
  })

  describe('Asynchronous Memoization', () => {
    it('should cache async function results', async () => {
      let callCount = 0
      const expensiveAsyncFunction = memoizeAsync(async (x: number) => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 10))
        return x * 2
      })

      const result1 = await expensiveAsyncFunction(5)
      const result2 = await expensiveAsyncFunction(5)
      
      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(callCount).toBe(1) // Function called only once
    })

    it('should handle concurrent calls', async () => {
      let callCount = 0
      const expensiveAsyncFunction = memoizeAsync(async (x: number) => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 50))
        return x * 2
      })

      // Make concurrent calls
      const [result1, result2, result3] = await Promise.all([
        expensiveAsyncFunction(5),
        expensiveAsyncFunction(5),
        expensiveAsyncFunction(5)
      ])
      
      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(result3).toBe(10)
      expect(callCount).toBe(1) // Function called only once despite concurrent calls
    })

    it('should handle errors correctly', async () => {
      let callCount = 0
      const failingFunction = memoizeAsync(async (shouldFail: boolean) => {
        callCount++
        if (shouldFail) {
          throw new Error('Function failed')
        }
        return 'success'
      })

      // First call fails
      await expect(failingFunction(true)).rejects.toThrow('Function failed')
      expect(callCount).toBe(1)

      // Second call with same args should not use cache (error not cached)
      await expect(failingFunction(true)).rejects.toThrow('Function failed')
      expect(callCount).toBe(2)

      // Successful call should work
      const result = await failingFunction(false)
      expect(result).toBe('success')
      expect(callCount).toBe(3)

      // Subsequent successful call should use cache
      const result2 = await failingFunction(false)
      expect(result2).toBe('success')
      expect(callCount).toBe(3) // No additional call
    })
  })
})

describe('Cache Integration', () => {
  it('should work with complex objects', () => {
    const cache = new MemoryCache()
    
    const complexObject = {
      id: 1,
      name: 'Test Property',
      address: {
        street: '123 Main St',
        city: 'Test City',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      units: [
        { id: 1, number: '1A', rent: 2500 },
        { id: 2, number: '1B', rent: 2600 }
      ],
      metadata: {
        created: new Date('2024-01-01'),
        tags: ['luxury', 'downtown']
      }
    }

    cache.set('property:1', complexObject)
    const retrieved = cache.get('property:1')
    
    expect(retrieved).toEqual(complexObject)
    expect(retrieved.address.coordinates.lat).toBe(40.7128)
    expect(retrieved.units).toHaveLength(2)
  })

  it('should handle cache misses gracefully', () => {
    const cache = new MemoryCache()
    
    expect(cache.get('nonexistent')).toBeNull()
    expect(cache.has('nonexistent')).toBe(false)
    expect(cache.delete('nonexistent')).toBe(false)
  })

  it('should provide consistent behavior across operations', () => {
    const cache = new MemoryCache({ maxSize: 2 })
    
    // Fill cache
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size()).toBe(2)
    
    // Verify contents
    expect(cache.get('key1')).toBe('value1')
    expect(cache.get('key2')).toBe('value2')
    
    // Add third item (should evict first)
    cache.set('key3', 'value3')
    expect(cache.size()).toBe(2)
    expect(cache.has('key1')).toBe(false)
    expect(cache.has('key2')).toBe(true)
    expect(cache.has('key3')).toBe(true)
    
    // Clear and verify
    cache.clear()
    expect(cache.size()).toBe(0)
    expect(cache.has('key2')).toBe(false)
    expect(cache.has('key3')).toBe(false)
  })
})
