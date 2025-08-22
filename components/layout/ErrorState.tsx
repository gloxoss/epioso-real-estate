import { ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | string
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  onRetry?: () => void
  children?: ReactNode
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  error,
  showRetry = true,
  showHome = false,
  showBack = false,
  onRetry,
  children,
  className = ''
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {errorMessage && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                {errorMessage}
              </pre>
            </details>
          )}

          {children}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {showRetry && onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            )}
            
            {showBack && (
              <Button onClick={() => window.history.back()} variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go back
              </Button>
            )}
            
            {showHome && (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Go home
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Inline error state for smaller components
export function InlineErrorState({
  message = 'Failed to load content',
  onRetry,
  className = ''
}: {
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center p-4 text-sm text-muted-foreground bg-muted/50 rounded-md ${className}`}>
      <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
      <span>{message}</span>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="ml-2 h-auto p-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Network error state
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      showRetry={true}
      onRetry={onRetry}
    />
  )
}

// Not found error state
export function NotFoundErrorState({ 
  resource = 'page',
  showHome = true 
}: { 
  resource?: string
  showHome?: boolean 
}) {
  return (
    <ErrorState
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`}
      description={`The ${resource} you're looking for doesn't exist or has been moved.`}
      showHome={showHome}
      showBack={true}
    />
  )
}

// Permission error state
export function PermissionErrorState() {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to access this resource."
      showHome={true}
      showBack={true}
    />
  )
}
