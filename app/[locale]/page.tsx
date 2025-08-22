import { getDictionary } from '@/lib/i18n/dictionaries'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

interface PageProps {
  params: {
    locale: string
  }
}

export default async function LocalizedLandingPage({ params }: PageProps) {
  // Validate locale
  if (!isValidLocale(params.locale)) {
    notFound()
  }

  // Check if user is already authenticated
  const session = await getServerSession(authOptions)
  if (session?.user) {
    redirect(`/${params.locale}/dashboard`)
  }

  // Get dictionary for the locale
  const dictionary = await getDictionary(params.locale as Locale)

  return <LandingPage dictionary={dictionary} locale={params.locale as Locale} />
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'ar' },
  ]
}

export async function generateMetadata({ params }: PageProps) {
  if (!isValidLocale(params.locale)) {
    return {}
  }

  const dictionary = await getDictionary(params.locale as Locale)
  
  return {
    title: dictionary.app.name,
    description: dictionary.app.description,
    keywords: dictionary.app.keywords,
    author: dictionary.app.author,
    openGraph: {
      title: dictionary.app.name,
      description: dictionary.app.description,
      type: 'website',
      locale: params.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: dictionary.app.name,
      description: dictionary.app.description,
    },
  }
}
