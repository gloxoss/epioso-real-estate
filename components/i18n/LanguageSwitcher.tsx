'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Languages, 
  Globe, 
  Check, 
  Loader2,
  ChevronDown
} from 'lucide-react'
import { 
  locales, 
  localeNames, 
  localeFlags, 
  Locale,
  isRtlLocale
} from '@/lib/i18n/config'
import { useI18n, useLocaleSwitch } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'select' | 'buttons'
  size?: 'sm' | 'md' | 'lg'
  showFlags?: boolean
  showLabels?: boolean
  showCurrent?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'dropdown',
  size = 'md',
  showFlags = true,
  showLabels = true,
  showCurrent = true,
  className
}: LanguageSwitcherProps) {
  const { t, isRtl } = useI18n()
  const { currentLocale, switchLocale, isLoading } = useLocaleSwitch()

  const handleLocaleChange = (locale: Locale) => {
    switchLocale(locale)
  }

  const getCurrentLocaleDisplay = () => {
    const flag = showFlags ? localeFlags[currentLocale] : ''
    const label = showLabels ? localeNames[currentLocale] : ''
    
    if (showFlags && showLabels) {
      return `${flag} ${label}`
    } else if (showFlags) {
      return flag
    } else if (showLabels) {
      return label
    } else {
      return currentLocale.toUpperCase()
    }
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={size}
            className={cn(
              "gap-2",
              isRtl && "flex-row-reverse",
              className
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {showCurrent && getCurrentLocaleDisplay()}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t('common.language')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={cn(
                "flex items-center justify-between gap-2 cursor-pointer",
                isRtlLocale(locale) && "flex-row-reverse"
              )}
            >
              <div className="flex items-center gap-2">
                {showFlags && (
                  <span className="text-lg">{localeFlags[locale]}</span>
                )}
                {showLabels && (
                  <span>{localeNames[locale]}</span>
                )}
              </div>
              {currentLocale === locale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'select') {
    return (
      <Select
        value={currentLocale}
        onValueChange={(value: Locale) => handleLocaleChange(value)}
        disabled={isLoading}
      >
        <SelectTrigger className={cn("w-40", className)}>
          <SelectValue>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              getCurrentLocaleDisplay()
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              <div className="flex items-center gap-2">
                {showFlags && (
                  <span className="text-lg">{localeFlags[locale]}</span>
                )}
                {showLabels && (
                  <span>{localeNames[locale]}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (variant === 'buttons') {
    return (
      <div className={cn("flex gap-1", className)}>
        {locales.map((locale) => (
          <Button
            key={locale}
            variant={currentLocale === locale ? 'default' : 'outline'}
            size={size}
            onClick={() => handleLocaleChange(locale)}
            disabled={isLoading}
            className={cn(
              "relative",
              currentLocale === locale && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {showFlags && (
              <span className="text-lg mr-1">{localeFlags[locale]}</span>
            )}
            {showLabels ? localeNames[locale] : locale.toUpperCase()}
            {currentLocale === locale && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-primary"
              />
            )}
          </Button>
        ))}
      </div>
    )
  }

  return null
}

// Compact language switcher for mobile/small spaces
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      variant="dropdown"
      size="sm"
      showFlags={true}
      showLabels={false}
      showCurrent={false}
      className={className}
    />
  )
}

// Language switcher with full labels
export function FullLanguageSwitcher({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      variant="dropdown"
      size="md"
      showFlags={true}
      showLabels={true}
      showCurrent={true}
      className={className}
    />
  )
}

// Button group language switcher
export function ButtonGroupLanguageSwitcher({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      variant="buttons"
      size="sm"
      showFlags={true}
      showLabels={false}
      className={className}
    />
  )
}

// Language switcher for settings page
export function SettingsLanguageSwitcher({ className }: { className?: string }) {
  const { t } = useI18n()
  
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        {t('common.language')}
      </label>
      <LanguageSwitcher
        variant="select"
        showFlags={true}
        showLabels={true}
      />
    </div>
  )
}

// Language detection banner
export function LanguageDetectionBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { t, locale } = useI18n()
  const { switchLocale } = useLocaleSwitch()

  // This would typically detect browser language and suggest switching
  const detectedLocale: Locale = 'fr' // Example: detected from browser
  const shouldShow = !dismissed && locale !== detectedLocale && locale === 'en'

  if (!shouldShow) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {t('common.languageDetected', { language: localeNames[detectedLocale] })}
            </p>
            <p className="text-xs text-blue-700">
              {t('common.switchLanguagePrompt')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => switchLocale(detectedLocale)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {localeFlags[detectedLocale]} {t('common.switchTo')} {localeNames[detectedLocale]}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            {t('common.dismiss')}
          </Button>
        </div>
      </div>
    </div>
  )
}
