// Unit tests for internationalization utilities
import { jest } from '@jest/globals'
import { 
  isValidLocale, 
  getValidLocale, 
  detectLocaleFromHeaders,
  isRtlLocale,
  getLocaleDirection,
  getTextAlign,
  removeLocaleFromPath
} from '@/lib/i18n/config'
import { 
  createTranslator, 
  formatDate, 
  formatNumber, 
  formatCurrency,
  formatRelativeTime,
  validateTranslationKeys,
  getAllTranslationKeys
} from '@/lib/i18n/utils'

describe('I18n Configuration', () => {
  describe('Locale Validation', () => {
    it('should validate supported locales', () => {
      expect(isValidLocale('en')).toBe(true)
      expect(isValidLocale('fr')).toBe(true)
      expect(isValidLocale('ar')).toBe(true)
      expect(isValidLocale('es')).toBe(false) // Not supported
      expect(isValidLocale('invalid')).toBe(false)
    })

    it('should return valid locale or default', () => {
      expect(getValidLocale('en')).toBe('en')
      expect(getValidLocale('fr')).toBe('fr')
      expect(getValidLocale('ar')).toBe('ar')
      expect(getValidLocale('es')).toBe('en') // Falls back to default
      expect(getValidLocale(undefined)).toBe('en')
    })
  })

  describe('Locale Detection', () => {
    it('should detect locale from Accept-Language header', () => {
      expect(detectLocaleFromHeaders('en-US,en;q=0.9')).toBe('en')
      expect(detectLocaleFromHeaders('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr')
      expect(detectLocaleFromHeaders('ar-MA,ar;q=0.9')).toBe('ar')
      expect(detectLocaleFromHeaders('es-ES,es;q=0.9')).toBe('en') // Falls back
      expect(detectLocaleFromHeaders('')).toBe('en')
      expect(detectLocaleFromHeaders(undefined)).toBe('en')
    })

    it('should handle complex Accept-Language headers', () => {
      expect(detectLocaleFromHeaders('fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('fr')
      expect(detectLocaleFromHeaders('de-DE,de;q=0.9,fr;q=0.8,en;q=0.7')).toBe('fr')
      expect(detectLocaleFromHeaders('zh-CN,zh;q=0.9,ja;q=0.8')).toBe('en')
    })
  })

  describe('RTL Support', () => {
    it('should identify RTL locales', () => {
      expect(isRtlLocale('ar')).toBe(true)
      expect(isRtlLocale('en')).toBe(false)
      expect(isRtlLocale('fr')).toBe(false)
    })

    it('should return correct text direction', () => {
      expect(getLocaleDirection('ar')).toBe('rtl')
      expect(getLocaleDirection('en')).toBe('ltr')
      expect(getLocaleDirection('fr')).toBe('ltr')
    })

    it('should generate correct text alignment classes', () => {
      expect(getTextAlign('en', 'left')).toBe('text-left')
      expect(getTextAlign('en', 'right')).toBe('text-right')
      expect(getTextAlign('en', 'center')).toBe('text-center')
      
      expect(getTextAlign('ar', 'left')).toBe('text-right')
      expect(getTextAlign('ar', 'right')).toBe('text-left')
      expect(getTextAlign('ar', 'center')).toBe('text-center')
    })
  })

  describe('URL Handling', () => {
    it('should remove locale from path', () => {
      expect(removeLocaleFromPath('/en/dashboard')).toEqual({
        locale: 'en',
        path: '/dashboard'
      })
      
      expect(removeLocaleFromPath('/fr/properties/123')).toEqual({
        locale: 'fr',
        path: '/properties/123'
      })
      
      expect(removeLocaleFromPath('/dashboard')).toEqual({
        locale: 'en',
        path: '/dashboard'
      })
      
      expect(removeLocaleFromPath('/invalid/dashboard')).toEqual({
        locale: 'en',
        path: '/invalid/dashboard'
      })
    })
  })
})

describe('Translation Utilities', () => {
  const mockDictionary = {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...'
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back, {name}!'
    },
    validation: {
      required: 'This field is required',
      minLength: 'Must be at least {min} characters'
    },
    time: {
      minutesAgo: '{count} minute ago | {count} minutes ago'
    }
  }

  describe('Translation Function', () => {
    const t = createTranslator(mockDictionary, 'en')

    it('should translate simple keys', () => {
      expect(t('common.save')).toBe('Save')
      expect(t('common.cancel')).toBe('Cancel')
      expect(t('dashboard.title')).toBe('Dashboard')
    })

    it('should handle missing keys', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key')
      expect(t('common.nonexistent')).toBe('common.nonexistent')
    })

    it('should interpolate values', () => {
      expect(t('dashboard.welcome', { name: 'John' })).toBe('Welcome back, John!')
      expect(t('validation.minLength', { min: 5 })).toBe('Must be at least 5 characters')
    })

    it('should handle pluralization', () => {
      expect(t('time.minutesAgo', { count: 1 })).toBe('1 minute ago')
      expect(t('time.minutesAgo', { count: 5 })).toBe('5 minutes ago')
    })

    it('should handle missing interpolation values', () => {
      expect(t('dashboard.welcome')).toBe('Welcome back, {name}!')
      expect(t('validation.minLength')).toBe('Must be at least {min} characters')
    })
  })

  describe('Dictionary Utilities', () => {
    it('should get all translation keys', () => {
      const keys = getAllTranslationKeys(mockDictionary)
      expect(keys).toContain('common.save')
      expect(keys).toContain('common.cancel')
      expect(keys).toContain('dashboard.title')
      expect(keys).toContain('dashboard.welcome')
      expect(keys).toContain('validation.required')
      expect(keys).toContain('time.minutesAgo')
    })

    it('should validate translation keys', () => {
      const requiredKeys = ['common.save', 'common.cancel', 'nonexistent.key']
      const missingKeys = validateTranslationKeys(mockDictionary, requiredKeys)
      
      expect(missingKeys).toEqual(['nonexistent.key'])
    })
  })
})

describe('Formatting Utilities', () => {
  describe('Date Formatting', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format dates for different locales', () => {
      const enFormatted = formatDate(testDate, 'en')
      const frFormatted = formatDate(testDate, 'fr')
      const arFormatted = formatDate(testDate, 'ar')

      expect(typeof enFormatted).toBe('string')
      expect(typeof frFormatted).toBe('string')
      expect(typeof arFormatted).toBe('string')
      
      // Should contain date components
      expect(enFormatted).toMatch(/2024/)
      expect(enFormatted).toMatch(/Jan|15/)
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15T10:30:00Z', 'en')
      expect(typeof formatted).toBe('string')
      expect(formatted).toMatch(/2024/)
    })

    it('should handle invalid dates gracefully', () => {
      const formatted = formatDate('invalid-date', 'en')
      expect(typeof formatted).toBe('string')
    })
  })

  describe('Number Formatting', () => {
    it('should format numbers for different locales', () => {
      expect(formatNumber(1234.56, 'en')).toMatch(/1,?234\.56|1 234,56/)
      expect(formatNumber(1000, 'fr')).toMatch(/1,?000|1 000/)
      expect(formatNumber(42, 'ar')).toMatch(/42/)
    })

    it('should handle edge cases', () => {
      expect(formatNumber(0, 'en')).toBe('0')
      expect(formatNumber(-123.45, 'en')).toMatch(/-123\.45/)
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency for different locales', () => {
      const enFormatted = formatCurrency(1234.56, 'en')
      const frFormatted = formatCurrency(1234.56, 'fr')
      const arFormatted = formatCurrency(1234.56, 'ar')

      expect(enFormatted).toMatch(/MAD|1,?234/)
      expect(frFormatted).toMatch(/MAD|1 234/)
      expect(arFormatted).toMatch(/MAD|1234/)
    })

    it('should handle zero and negative amounts', () => {
      expect(formatCurrency(0, 'en')).toMatch(/0.*MAD|MAD.*0/)
      expect(formatCurrency(-100, 'en')).toMatch(/-.*100.*MAD|MAD.*-.*100/)
    })
  })

  describe('Relative Time Formatting', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should format relative time for different periods', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z')
      const twoHoursAgo = new Date('2024-01-15T10:00:00Z')
      const yesterday = new Date('2024-01-14T12:00:00Z')

      const fiveMinFormatted = formatRelativeTime(fiveMinutesAgo, 'en')
      const twoHoursFormatted = formatRelativeTime(twoHoursAgo, 'en')
      const yesterdayFormatted = formatRelativeTime(yesterday, 'en')

      expect(fiveMinFormatted).toMatch(/5.*minute|minute.*5/)
      expect(twoHoursFormatted).toMatch(/2.*hour|hour.*2/)
      expect(yesterdayFormatted).toMatch(/1.*day|day.*1|yesterday/)
    })

    it('should handle string dates', () => {
      const formatted = formatRelativeTime('2024-01-15T11:55:00Z', 'en')
      expect(typeof formatted).toBe('string')
    })

    it('should handle invalid dates gracefully', () => {
      const formatted = formatRelativeTime('invalid-date', 'en')
      expect(typeof formatted).toBe('string')
    })
  })
})

describe('I18n Integration', () => {
  it('should work with complex translation scenarios', () => {
    const dictionary = {
      property: {
        status: {
          available: 'Available',
          occupied: 'Occupied',
          maintenance: 'Under Maintenance'
        },
        details: 'Property {name} has {count} unit | Property {name} has {count} units',
        location: 'Located in {city}, {country}'
      }
    }

    const t = createTranslator(dictionary, 'en')

    expect(t('property.status.available')).toBe('Available')
    expect(t('property.details', { name: 'Sunset Apartments', count: 1 })).toBe('Property Sunset Apartments has 1 unit')
    expect(t('property.details', { name: 'Downtown Plaza', count: 5 })).toBe('Property Downtown Plaza has 5 units')
    expect(t('property.location', { city: 'Casablanca', country: 'Morocco' })).toBe('Located in Casablanca, Morocco')
  })

  it('should handle nested object interpolation', () => {
    const dictionary = {
      tenant: {
        profile: 'Tenant: {tenant.name} ({tenant.email})',
        lease: 'Lease from {lease.start} to {lease.end}'
      }
    }

    const t = createTranslator(dictionary, 'en')

    // Note: This would require enhanced interpolation logic
    // For now, test basic functionality
    expect(t('tenant.profile', { 'tenant.name': 'John Doe', 'tenant.email': 'john@example.com' }))
      .toBe('Tenant: John Doe (john@example.com)')
  })

  it('should maintain consistency across locale switches', () => {
    const enDict = { greeting: 'Hello, {name}!' }
    const frDict = { greeting: 'Bonjour, {name}!' }

    const enT = createTranslator(enDict, 'en')
    const frT = createTranslator(frDict, 'fr')

    expect(enT('greeting', { name: 'John' })).toBe('Hello, John!')
    expect(frT('greeting', { name: 'John' })).toBe('Bonjour, John!')
  })
})
