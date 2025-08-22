import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sign Up | Epioso Real Estate',
  description: 'Create your property management account',
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with property management today
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create your account to start managing your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>

      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Features */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">What's included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Property Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Unit Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Billing & Invoices</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Maintenance Tickets</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Document Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Reports & Analytics</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
