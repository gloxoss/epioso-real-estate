import { Inter } from 'next/font/google'
import { requireAuthWithRole } from '@/lib/rbac'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { AppLayoutContent } from '@/components/layout/AppLayoutContent'
import { LocaleRedirect } from '@/components/i18n/LocaleRedirect'

const inter = Inter({ subsets: ['latin'] })

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  // Ensure user is authenticated and get session
  const session = await requireAuthWithRole()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleRedirect />
      <SidebarProvider>
        <div className={`${inter.className} min-h-screen bg-background`}>
          {/* Sidebar */}
          <AppSidebar session={session} />

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
