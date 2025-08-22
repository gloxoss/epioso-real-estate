'use client'

import { ReactNode, useEffect } from 'react'
import { I18nProvider as BaseI18nProvider } from '@/lib/i18n/hooks'
import { Locale, defaultLocale, getValidLocale, detectLocaleFromHeaders } from '@/lib/i18n/config'

interface I18nProviderProps {
  children: ReactNode
  locale?: string
  acceptLanguage?: string
}

export function I18nProvider({ children, locale, acceptLanguage }: I18nProviderProps) {
  // Determine initial locale
  const initialLocale = getValidLocale(
    locale || 
    (typeof window !== 'undefined' ? localStorage.getItem('preferred-locale') : null) ||
    detectLocaleFromHeaders(acceptLanguage)
  )

  // Set document attributes on locale change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = initialLocale
      document.documentElement.dir = initialLocale === 'ar' ? 'rtl' : 'ltr'
    }
  }, [initialLocale])

  return (
    <BaseI18nProvider initialLocale={initialLocale}>
      {children}
    </BaseI18nProvider>
  )
}

// Server-side locale detection helper
export function getServerSideLocale(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language')
  return detectLocaleFromHeaders(acceptLanguage || undefined)
}

// Client-side locale persistence
export function persistLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale)
    document.cookie = `locale=${locale}; path=/; max-age=31536000` // 1 year
  }
}
