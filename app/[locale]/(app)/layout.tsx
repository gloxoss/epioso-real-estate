import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { requireAuthWithRole } from '@/lib/rbac'
import { isValidLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { AppLayoutContent } from '@/components/layout/AppLayoutContent'

const inter = Inter({ subsets: ['latin'] })

export default async function AppLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound()
  }

  // Ensure user is authenticated and get session
  const session = await requireAuthWithRole()
  const dictionary = await getDictionary(locale as Locale)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className={`${inter.className} min-h-screen bg-background`}>
          {/* Sidebar */}
          <AppSidebar session={session} dictionary={dictionary} locale={locale} />

          {/* Main content area - with dynamic left margin for desktop sidebar */}
          <AppLayoutContent session={session}>
            {children}
          </AppLayoutContent>

          {/* Toast notifications */}
          <Toaster />
        </div>
      </SidebarProvider>
      {modal}
    </ThemeProvider>
  )
}
