import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search } from 'lucide-react'

export default function ContactsNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Contact Not Found</CardTitle>
          <CardDescription>
            The contact you're looking for doesn't exist or you don't have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/contacts">
                <Users className="h-4 w-4 mr-2" />
                Back to Contacts
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
