'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { 
  Locale, 
  defaultLocale, 
  Dictionary, 
  TranslationKey, 
  InterpolationValues,
  getValidLocale,
  isRtlLocale,
  getLocaleDirection,
  LOCALE_STORAGE_KEY
} from './config'
import { 
  loadDictionary, 
  createTranslator, 
  formatDate as formatDateUtil,
  formatNumber as formatNumberUtil,
  formatCurrency as formatCurrencyUtil,
  formatRelativeTime as formatRelativeTimeUtil
} from './utils'

// Internationalization context
interface I18nContextType {
  locale: Locale
  dictionary: Dictionary
  isLoading: boolean
  error: string | null
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, values?: InterpolationValues) => string
  formatDate: (date: Date | string) => string
  formatNumber: (number: number) => string
  formatCurrency: (amount: number) => string
  formatRelativeTime: (date: Date | string) => string
  isRtl: boolean
  direction: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// I18n Provider component
interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const [dictionary, setDictionary] = useState<Dictionary>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load dictionary when locale changes
  useEffect(() => {
    let isCancelled = false

    async function loadLocaleData() {
      setIsLoading(true)
      setError(null)

      try {
        const dict = await loadDictionary(locale)
        if (!isCancelled) {
          setDictionary(dict)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load translations')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLocaleData()

    return () => {
      isCancelled = true
    }
  }, [locale])

  // Load initial locale from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
      if (storedLocale) {
        const validLocale = getValidLocale(storedLocale)
        if (validLocale !== locale) {
          setLocaleState(validLocale)
        }
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
      // Update document direction
      document.documentElement.dir = getLocaleDirection(newLocale)
      document.documentElement.lang = newLocale
    }
  }

  const t = createTranslator(dictionary, locale)
  
  const formatDate = (date: Date | string) => formatDateUtil(date, locale)
  const formatNumber = (number: number) => formatNumberUtil(number, locale)
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, locale)
  const formatRelativeTime = (date: Date | string) => formatRelativeTimeUtil(date, locale)

  const isRtl = isRtlLocale(locale)
  const direction = getLocaleDirection(locale)

  const value: I18nContextType = {
    locale,
    dictionary,
    isLoading,
    error,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    isRtl,
    direction
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use internationalization
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Hook for translation only (lighter alternative)
export function useTranslation() {
  const { t, locale, isLoading, error } = useI18n()
  return { t, locale, isLoading, error }
}

// Hook for formatting utilities
export function useFormatting() {
  const { 
    formatDate, 
    formatNumber, 
    formatCurrency, 
    formatRelativeTime, 
    locale 
  } = useI18n()
  
  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    locale
  }
}

// Hook for RTL/LTR utilities
export function useDirection() {
  const { isRtl, direction, locale } = useI18n()
  
  return {
    isRtl,
    direction,
    locale,
    getTextAlign: (align: 'left' | 'center' | 'right' = 'left') => {
      if (align === 'center') return 'text-center'
      if (align === 'left') return isRtl ? 'text-right' : 'text-left'
      return isRtl ? 'text-left' : 'text-right'
    },
    getFlexDirection: (reverse = false) => {
      if (reverse) return isRtl ? 'flex-row' : 'flex-row-reverse'
      return isRtl ? 'flex-row-reverse' : 'flex-row'
    },
    getMarginClass: (side: 'left' | 'right', size: string) => {
      const prefix = side === 'left' ? (isRtl ? 'mr' : 'ml') : (isRtl ? 'ml' : 'mr')
      return `${prefix}-${size}`
    },
    getPaddingClass: (side: 'left' | 'right', size: string) => {
      const prefix = side === 'left' ? (isRtl ? 'pr' : 'pl') : (isRtl ? 'pl' : 'pr')
      return `${prefix}-${size}`
    }
  }
}

// Hook for locale switching
export function useLocaleSwitch() {
  const { locale, setLocale, isLoading } = useI18n()
  
  return {
    currentLocale: locale,
    setLocale,
    isLoading,
    switchLocale: (newLocale: Locale) => {
      if (newLocale !== locale) {
        setLocale(newLocale)
      }
    }
  }
}

// Hook for pluralization
export function usePluralization() {
  const { t } = useI18n()
  
  return {
    plural: (key: TranslationKey, count: number, values?: InterpolationValues) => {
      return t(key, { ...values, count })
    }
  }
}

// Hook for conditional translations based on user preferences
export function useConditionalTranslation() {
  const { t, locale } = useI18n()
  
  return {
    tIf: (condition: boolean, key: TranslationKey, fallback?: string, values?: InterpolationValues) => {
      if (condition) {
        return t(key, values)
      }
      return fallback || ''
    },
    tLocale: (keys: Partial<Record<Locale, TranslationKey>>, values?: InterpolationValues) => {
      const key = keys[locale] || keys[defaultLocale]
      return key ? t(key, values) : ''
    }
  }
}

// Hook for translation with fallbacks
export function useTranslationWithFallback() {
  const { t, dictionary } = useI18n()
  
  return {
    tWithFallback: (keys: TranslationKey[], values?: InterpolationValues) => {
      for (const key of keys) {
        const translation = t(key, values)
        if (translation !== key) { // Translation found
          return translation
        }
      }
      return keys[0] // Return first key as ultimate fallback
    }
  }
}

// Hook for lazy translation loading
export function useLazyTranslation() {
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  
  const loadTranslation = async (locale: Locale, key: TranslationKey) => {
    const cacheKey = `${locale}:${key}`
    
    if (translations[cacheKey] || loading[cacheKey]) {
      return translations[cacheKey]
    }
    
    setLoading(prev => ({ ...prev, [cacheKey]: true }))
    
    try {
      const dictionary = await loadDictionary(locale)
      const translator = createTranslator(dictionary, locale)
      const translation = translator(key)
      
      setTranslations(prev => ({ ...prev, [cacheKey]: translation }))
      return translation
    } catch (error) {
      console.error('Failed to load lazy translation:', error)
      return key
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }))
    }
  }
  
  return {
    loadTranslation,
    translations,
    loading
  }
}

// Hook for translation debugging (development only)
export function useTranslationDebug() {
  const { dictionary, locale } = useI18n()
  
  return {
    logMissingKeys: (keys: TranslationKey[]) => {
      if (process.env.NODE_ENV === 'development') {
        const missing = keys.filter(key => !dictionary[key])
        if (missing.length > 0) {
          console.warn(`Missing translations for locale ${locale}:`, missing)
        }
      }
    },
    validateKey: (key: TranslationKey) => {
      return !!dictionary[key]
    },
    getKeyPath: (key: TranslationKey) => {
      return key.split('.')
    }
  }
}
