import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect(`/${defaultLocale}/dashboard`)
  }
  redirect('/login')
}
