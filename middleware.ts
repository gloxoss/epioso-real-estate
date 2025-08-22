import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import {
  defaultLocale,
  locales,
  isValidLocale,
  detectLocaleFromHeaders,
  removeLocaleFromPath,
  LOCALE_COOKIE_NAME
} from '@/lib/i18n/config'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.includes('.')
  ) {
    const { supabase, response } = createClient(request)
    await supabase.auth.getSession()
    return response
  }

  // Handle internationalization
  const { locale: pathLocale, path: pathWithoutLocale } = removeLocaleFromPath(pathname)

  // Get preferred locale from cookie or headers
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  const preferredLocale = cookieLocale && isValidLocale(cookieLocale)
    ? cookieLocale
    : defaultLocale

  // If path doesn't have a locale, redirect to localized path
  if (!locales.some(locale => pathname.startsWith(`/${locale}`))) {
    const redirectUrl = new URL(`/${preferredLocale}${pathname}`, request.url)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(LOCALE_COOKIE_NAME, preferredLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production'
    })
    return response
  }

  // Handle Supabase auth
  const { supabase, response } = createClient(request)
  await supabase.auth.getSession()

  // Set locale cookie if not set
  if (!cookieLocale || cookieLocale !== pathLocale) {
    response.cookies.set(LOCALE_COOKIE_NAME, pathLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production'
    })
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

