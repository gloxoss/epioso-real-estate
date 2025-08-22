import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default async function Home() {
  // Redirect to default locale landing page
  redirect(`/${defaultLocale}`)
}
