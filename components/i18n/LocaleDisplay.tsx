'use client'

import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { locales, localeNames, type Locale, defaultLocale } from '@/lib/i18n/config'

export function LocaleDisplay() {
  const pathname = usePathname()

  // Detect current locale from pathname
  const getCurrentLocale = (): Locale => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      return segments[0] as Locale
    }
    return defaultLocale
  }

  const currentLocale = getCurrentLocale()

  return (
    <Badge variant="outline" className="text-xs">
      Current: {localeNames[currentLocale]} ({currentLocale})
    </Badge>
  )
}
