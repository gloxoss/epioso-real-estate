import { type Locale, type Dictionary } from './config'

// Dictionary cache to avoid re-importing
const dictionaryCache = new Map<Locale, Dictionary>()

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  // Check cache first
  if (dictionaryCache.has(locale)) {
    return dictionaryCache.get(locale)!
  }

  try {
    // Dynamic import based on locale
    const dictionary = await import(`./dictionaries/${locale}.json`)
    const dict = dictionary.default || dictionary
    
    // Cache the dictionary
    dictionaryCache.set(locale, dict)
    
    return dict
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    
    // Fallback to default locale if not already trying it
    if (locale !== 'fr') {
      console.warn(`Falling back to French dictionary`)
      return getDictionary('fr')
    }
    
    // If even French fails, return empty dictionary
    console.error('Failed to load any dictionary, returning empty object')
    return {}
  }
}

// Preload dictionaries for better performance
export async function preloadDictionaries(locales: Locale[]): Promise<void> {
  const promises = locales.map(locale => getDictionary(locale))
  await Promise.allSettled(promises)
}

// Clear dictionary cache (useful for development)
export function clearDictionaryCache(): void {
  dictionaryCache.clear()
}

// Get available translation keys from a dictionary
export function getTranslationKeys(dictionary: Dictionary, prefix = ''): string[] {
  const keys: string[] = []
  
  function traverse(obj: any, currentPrefix: string) {
    for (const key in obj) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], fullKey)
      } else {
        keys.push(fullKey)
      }
    }
  }
  
  traverse(dictionary, prefix)
  return keys
}

// Validate that all required keys exist in a dictionary
export function validateDictionary(dictionary: Dictionary, requiredKeys: string[]): string[] {
  const missingKeys: string[] = []
  
  for (const key of requiredKeys) {
    const keys = key.split('.')
    let current: any = dictionary
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        missingKeys.push(key)
        break
      }
    }
  }
  
  return missingKeys
}

// Compare dictionaries to find missing translations
export function compareDictionaries(
  baseDictionary: Dictionary, 
  targetDictionary: Dictionary
): { missing: string[], extra: string[] } {
  const baseKeys = getTranslationKeys(baseDictionary)
  const targetKeys = getTranslationKeys(targetDictionary)
  
  const missing = baseKeys.filter(key => !targetKeys.includes(key))
  const extra = targetKeys.filter(key => !baseKeys.includes(key))
  
  return { missing, extra }
}

// Merge dictionaries (useful for partial translations)
export function mergeDictionaries(base: Dictionary, override: Dictionary): Dictionary {
  const result = { ...base }
  
  function merge(target: any, source: any) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {}
        }
        merge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }
  
  merge(result, override)
  return result
}
