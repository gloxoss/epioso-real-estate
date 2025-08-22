'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export function LocaleRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on a non-localized route
    const isLocalized = pathname.startsWith('/fr/') || pathname.startsWith('/en/') || pathname.startsWith('/ar/')
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
    const isApiRoute = pathname.startsWith('/api/')

    // If we're on a non-localized route and it's not an auth or API route, redirect
    if (!isLocalized && !isAuthRoute && !isApiRoute) {
      const localizedPath = `/${defaultLocale}${pathname}`
      console.log('Redirecting from', pathname, 'to', localizedPath)
      router.replace(localizedPath)
    }
  }, [pathname, router])

  return null
}
