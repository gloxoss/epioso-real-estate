import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PropertyCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Image skeleton */}
        <Skeleton className="aspect-video w-full rounded-md" />

        {/* Occupancy skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          
          <Skeleton className="h-2 w-full" />
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
