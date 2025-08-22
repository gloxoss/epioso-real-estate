import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={`${inter.className} min-h-screen bg-background`}>
        <div className="flex min-h-screen">
          {/* Left side - Branding/Image */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col justify-center px-12 text-white">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold mb-4">
                  Epioso Real Estate
                </h1>
                <p className="text-xl opacity-90 mb-8">
                  Streamline your property management with our comprehensive platform.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Property & Unit Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Billing & Payment Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Maintenance Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Document Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Auth forms */}
          <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
            <div className="w-full max-w-md mx-auto">
              {children}
            </div>
          </div>
        </div>
        
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
