import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function KanbanBoardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Board Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {/* Column Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            </div>
            
            {/* Column Content Skeleton */}
            <div className="space-y-3 min-h-[400px]">
              {Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, cardIndex) => (
                <Card key={cardIndex} className="mb-3">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Tenant/Rent Info */}
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      
                      {/* Rent Amount */}
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      
                      {/* Unit Attributes */}
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-2" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-2" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
