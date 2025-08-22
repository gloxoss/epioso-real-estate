import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Login | Epioso Real Estate',
  description: 'Sign in to your property management account',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <div className="text-sm">
          <Link 
            href="/forgot-password" 
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Demo Account */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Demo Account</CardTitle>
          <CardDescription className="text-xs">
            Try the application with a demo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Email:</strong> demo@epioso.com
            </div>
            <div>
              <strong>Password:</strong> demo123
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3">
            Use Demo Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
