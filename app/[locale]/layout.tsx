import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { notFound } from 'next/navigation'
import { locales, isValidLocale, getLocaleDirection, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { I18nProvider } from '@/lib/i18n/provider'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: 'swap',
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    }
  }

  const dictionary = await getDictionary(locale)
  
  return {
    title: {
      template: `%s | ${dictionary.app.name}`,
      default: dictionary.app.name,
    },
    description: dictionary.app.description,
    keywords: dictionary.app.keywords,
    authors: [{ name: dictionary.app.author }],
    creator: dictionary.app.author,
    publisher: dictionary.app.author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    alternates: {
      canonical: '/',
      languages: {
        'fr': '/fr',
        'en': '/en',
        'ar': '/ar',
      },
    },
    openGraph: {
      title: dictionary.app.name,
      description: dictionary.app.description,
      url: '/',
      siteName: dictionary.app.name,
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.app.name,
      description: dictionary.app.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  const direction = getLocaleDirection(locale as Locale)
  const dictionary = await getDictionary(locale as Locale)
  
  // Font classes based on locale
  const fontClasses = [
    geistSans.variable,
    geistMono.variable,
    locale === 'ar' ? notoSansArabic.variable : '',
  ].filter(Boolean).join(' ')

  return (
    <html 
      lang={locale} 
      dir={direction}
      suppressHydrationWarning
      className={locale === 'ar' ? 'font-arabic' : ''}
    >
      <body className={`${fontClasses} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider locale={locale as Locale} dictionary={dictionary}>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
