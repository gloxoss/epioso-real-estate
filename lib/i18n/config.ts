// Internationalization configuration
export const defaultLocale = 'fr' as const
export const locales = ['fr', 'en', 'ar'] as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية'
}

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇺🇸',
  ar: '🇲🇦'
}

export const rtlLocales: Locale[] = ['ar']

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}

// Date and number formatting configurations
export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  },
  fr: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  },
  ar: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
}

export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  fr: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  ar: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
}

export const currencyFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  fr: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  ar: {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
}

// Locale detection and validation
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return defaultLocale
}

export function detectLocaleFromHeaders(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale

  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase())

  for (const lang of languages) {
    // Check exact match
    if (isValidLocale(lang)) {
      return lang
    }
    
    // Check language code only (e.g., 'en-US' -> 'en')
    const langCode = lang.split('-')[0]
    if (isValidLocale(langCode)) {
      return langCode
    }
  }

  return defaultLocale
}

// URL and routing helpers
export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

export function removeLocaleFromPath(path: string): { locale: Locale; path: string } {
  const segments = path.split('/').filter(Boolean)
  
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return {
      locale: segments[0],
      path: '/' + segments.slice(1).join('/')
    }
  }
  
  return {
    locale: defaultLocale,
    path
  }
}

// Storage keys
export const LOCALE_STORAGE_KEY = 'preferred-locale'
export const LOCALE_COOKIE_NAME = 'locale'

// Pluralization rules
export type PluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

export const pluralRules: Record<Locale, Intl.PluralRules> = {
  en: new Intl.PluralRules('en'),
  fr: new Intl.PluralRules('fr'),
  ar: new Intl.PluralRules('ar')
}

export function getPluralRule(locale: Locale, count: number): PluralRule {
  return pluralRules[locale].select(count) as PluralRule
}

// Text direction utilities
export function getTextAlign(locale: Locale, align: 'left' | 'center' | 'right' = 'left'): string {
  if (align === 'center') return 'text-center'
  
  const isRtl = isRtlLocale(locale)
  
  if (align === 'left') {
    return isRtl ? 'text-right' : 'text-left'
  } else {
    return isRtl ? 'text-left' : 'text-right'
  }
}

export function getFlexDirection(locale: Locale, reverse = false): string {
  const isRtl = isRtlLocale(locale)
  
  if (reverse) {
    return isRtl ? 'flex-row' : 'flex-row-reverse'
  } else {
    return isRtl ? 'flex-row-reverse' : 'flex-row'
  }
}

export function getMarginDirection(locale: Locale, side: 'left' | 'right'): string {
  const isRtl = isRtlLocale(locale)
  
  if (side === 'left') {
    return isRtl ? 'mr-' : 'ml-'
  } else {
    return isRtl ? 'ml-' : 'mr-'
  }
}

export function getPaddingDirection(locale: Locale, side: 'left' | 'right'): string {
  const isRtl = isRtlLocale(locale)

  if (side === 'left') {
    return isRtl ? 'pr-' : 'pl-'
  } else {
    return isRtl ? 'pl-' : 'pr-'
  }
}

// Dictionary type definitions
export type Dictionary = Record<string, any>

// Translation key type for type safety
export type TranslationKey = string

// Interpolation values for dynamic translations
export type InterpolationValues = Record<string, string | number>

// Translation function type
export type TranslationFunction = (key: TranslationKey, values?: InterpolationValues) => string
