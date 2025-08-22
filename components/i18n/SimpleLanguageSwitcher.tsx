'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { 
  locales, 
  localeNames, 
  localeFlags, 
  type Locale,
  LOCALE_COOKIE_NAME,
  defaultLocale
} from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

interface SimpleLanguageSwitcherProps {
  className?: string
  showFlags?: boolean
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SimpleLanguageSwitcher({
  className,
  showFlags = true,
  showLabels = false,
  size = 'sm'
}: SimpleLanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  // Detect current locale from pathname
  const getCurrentLocale = (): Locale => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      return segments[0] as Locale
    }
    return defaultLocale
  }

  const currentLocale = getCurrentLocale()

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale || isLoading) return

    console.log('Switching locale from', currentLocale, 'to', newLocale)
    setIsLoading(true)

    try {
      // Set locale cookie
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`

      // Calculate new path
      let newPath = pathname

      // Remove current locale from path if it exists
      const segments = pathname.split('/').filter(Boolean)
      if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
        newPath = '/' + segments.slice(1).join('/')
      }

      // Add new locale to path
      const localizedPath = `/${newLocale}${newPath}`

      console.log('Navigating from', pathname, 'to', localizedPath)

      // Navigate to new path
      router.push(localizedPath)
    } catch (error) {
      console.error('Error switching locale:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentDisplay = () => {
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

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={buttonSize}
          className={cn(
            "gap-2",
            isLoading && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentDisplay()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              locale === currentLocale && "bg-accent"
            )}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </div>
            {locale === currentLocale && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for headers/toolbars
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  return (
    <SimpleLanguageSwitcher
      className={className}
      showFlags={true}
      showLabels={false}
      size="sm"
    />
  )
}

// Full version with labels
export function FullLanguageSwitcher({ className }: { className?: string }) {
  return (
    <SimpleLanguageSwitcher
      className={className}
      showFlags={true}
      showLabels={true}
      size="md"
    />
  )
}
