'use client'

import { createContext, useContext, ReactNode } from 'react'
import { type Locale, type Dictionary, type TranslationFunction, type InterpolationValues } from './config'

interface I18nContextType {
  locale: Locale
  dictionary: Dictionary
  t: TranslationFunction
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatRelativeTime: (date: Date | string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Translation function with interpolation support
function createTranslationFunction(dictionary: Dictionary): TranslationFunction {
  return (key: string, values?: InterpolationValues): string => {
    const keys = key.split('.')
    let result: any = dictionary

    // Navigate through nested object
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key // Return key as fallback
      }
    }

    if (typeof result !== 'string') {
      console.warn(`Translation key does not resolve to string: ${key}`)
      return key
    }

    // Handle interpolation
    if (values) {
      return result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return values[variable]?.toString() || match
      })
    }

    return result
  }
}

// Format number based on locale
function createNumberFormatter(locale: Locale) {
  return (value: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(locale, options).format(value)
    } catch (error) {
      console.error('Number formatting error:', error)
      return value.toString()
    }
  }
}

// Format currency based on locale
function createCurrencyFormatter(locale: Locale) {
  return (value: number, options?: Intl.NumberFormatOptions): string => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
    
    try {
      return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(value)
    } catch (error) {
      console.error('Currency formatting error:', error)
      return `${value} MAD`
    }
  }
}

// Format date based on locale
function createDateFormatter(locale: Locale) {
  return (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date)
      return date.toString()
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }

    try {
      return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateObj.toLocaleDateString()
    }
  }
}

// Format relative time (e.g., "2 hours ago")
function createRelativeTimeFormatter(locale: Locale) {
  return (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date)
      return date.toString()
    }

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
      return dateObj.toLocaleDateString()
    }
  }
}

interface I18nProviderProps {
  locale: Locale
  dictionary: Dictionary
  children: ReactNode
}

export function I18nProvider({ locale, dictionary, children }: I18nProviderProps) {
  const t = createTranslationFunction(dictionary)
  const formatNumber = createNumberFormatter(locale)
  const formatCurrency = createCurrencyFormatter(locale)
  const formatDate = createDateFormatter(locale)
  const formatRelativeTime = createRelativeTimeFormatter(locale)

  const value: I18nContextType = {
    locale,
    dictionary,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
