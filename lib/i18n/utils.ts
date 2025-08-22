import { 
  Locale, 
  Dictionary, 
  TranslationKey, 
  InterpolationValues,
  getPluralRule,
  dateFormats,
  numberFormats,
  currencyFormats
} from './config'

// Dictionary cache
const dictionaryCache = new Map<Locale, Dictionary>()

// Load dictionary for a specific locale
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  if (dictionaryCache.has(locale)) {
    return dictionaryCache.get(locale)!
  }

  try {
    const dictionary = await import(`./dictionaries/${locale}.json`)
    dictionaryCache.set(locale, dictionary.default)
    return dictionary.default
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error)
    // Fallback to English if the locale dictionary fails to load
    if (locale !== 'en') {
      return loadDictionary('en')
    }
    return {}
  }
}

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// Interpolate values in translation string
function interpolate(template: string, values: InterpolationValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

// Handle pluralization
function handlePluralization(
  locale: Locale, 
  template: string, 
  values: InterpolationValues
): string {
  const count = values.count as number
  if (count === undefined) return template

  const pluralRule = getPluralRule(locale, count)
  const variants = template.split(' | ')
  
  // Map plural rules to variant indices
  const ruleMap: Record<string, number> = {
    zero: 0,
    one: 0,
    two: 1,
    few: 1,
    many: 1,
    other: variants.length > 1 ? 1 : 0
  }

  const variantIndex = ruleMap[pluralRule] || 0
  const selectedVariant = variants[variantIndex] || variants[0] || template

  return interpolate(selectedVariant, values)
}

// Main translation function
export function createTranslator(dictionary: Dictionary, locale: Locale) {
  return function translate(key: TranslationKey, values: InterpolationValues = {}): string {
    const template = getNestedValue(dictionary, key)
    
    if (!template) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`)
      return key
    }

    if (typeof template !== 'string') {
      console.warn(`Translation for key: ${key} is not a string`)
      return key
    }

    // Handle pluralization if count is provided
    if (values.count !== undefined && template.includes(' | ')) {
      return handlePluralization(locale, template, values)
    }

    // Handle regular interpolation
    return interpolate(template, values)
  }
}

// Format date according to locale
export function formatDate(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const options = dateFormats[locale]
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateObj.toLocaleDateString()
  }
}

// Format number according to locale
export function formatNumber(number: number, locale: Locale): string {
  const options = numberFormats[locale]
  
  try {
    return new Intl.NumberFormat(locale, options).format(number)
  } catch (error) {
    console.error('Number formatting error:', error)
    return number.toString()
  }
}

// Format currency according to locale
export function formatCurrency(amount: number, locale: Locale): string {
  const options = currencyFormats[locale]
  
  try {
    return new Intl.NumberFormat(locale, options).format(amount)
  } catch (error) {
    console.error('Currency formatting error:', error)
    return `${amount} MAD`
  }
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  } catch (error) {
    console.error('Relative time formatting error:', error)
    return formatDate(dateObj, locale)
  }
}

// Validate translation keys (useful for development)
export function validateTranslationKeys(dictionary: Dictionary, requiredKeys: string[]): string[] {
  const missingKeys: string[] = []
  
  for (const key of requiredKeys) {
    if (!getNestedValue(dictionary, key)) {
      missingKeys.push(key)
    }
  }
  
  return missingKeys
}

// Get all available translation keys (useful for development)
export function getAllTranslationKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllTranslationKeys(value, fullKey))
    } else if (typeof value === 'string') {
      keys.push(fullKey)
    }
  }
  
  return keys
}

// Translation key suggestions (for development)
export function suggestTranslationKey(dictionary: Dictionary, searchTerm: string): string[] {
  const allKeys = getAllTranslationKeys(dictionary)
  const suggestions = allKeys.filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return suggestions.slice(0, 10) // Return top 10 suggestions
}

// Batch translation function
export function batchTranslate(
  dictionary: Dictionary, 
  locale: Locale, 
  keys: Array<{ key: TranslationKey; values?: InterpolationValues }>
): Record<string, string> {
  const translator = createTranslator(dictionary, locale)
  const result: Record<string, string> = {}
  
  for (const { key, values } of keys) {
    result[key] = translator(key, values)
  }
  
  return result
}

// Translation statistics (useful for development)
export function getTranslationStats(dictionary: Dictionary): {
  totalKeys: number
  totalStrings: number
  avgStringLength: number
  longestString: { key: string; length: number }
  shortestString: { key: string; length: number }
} {
  const allKeys = getAllTranslationKeys(dictionary)
  const strings = allKeys.map(key => ({
    key,
    value: getNestedValue(dictionary, key) as string
  }))
  
  const lengths = strings.map(s => s.value.length)
  const totalLength = lengths.reduce((sum, len) => sum + len, 0)
  
  const longest = strings.reduce((max, current) => 
    current.value.length > max.value.length ? current : max
  )
  
  const shortest = strings.reduce((min, current) => 
    current.value.length < min.value.length ? current : min
  )
  
  return {
    totalKeys: allKeys.length,
    totalStrings: strings.length,
    avgStringLength: Math.round(totalLength / strings.length),
    longestString: { key: longest.key, length: longest.value.length },
    shortestString: { key: shortest.key, length: shortest.value.length }
  }
}
