'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred while loading this section.'}
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            size="sm"
            variant="ghost"
          >
            Reload page
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export function ErrorBoundary({ 
  children, 
  fallback: Fallback = ErrorFallback,
  onError 
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={onError}
      onReset={() => {
        // Clear any cached data or reset state if needed
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Lightweight error boundary for smaller components
export function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground bg-muted/50 rounded-md">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Failed to load content
        </div>
      }
    >
      {children}
    </ReactErrorBoundary>
  )
}
