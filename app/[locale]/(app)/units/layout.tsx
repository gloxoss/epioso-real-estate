import { getDictionary } from '@/lib/i18n/dictionaries'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { UnitsLayoutClient } from '@/components/units/UnitsLayoutClient'

interface UnitsLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function UnitsLayout({ children, params }: UnitsLayoutProps) {
  const { locale } = await params

  if (!isValidLocale(locale)) {
    return <div>{children}</div>
  }

  const dictionary = await getDictionary(locale as Locale)

  return (
    <UnitsLayoutClient dictionary={dictionary} locale={locale}>
      {children}
    </UnitsLayoutClient>
  )
}
