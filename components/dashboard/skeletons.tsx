import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KpiSkeleton() {
  return (
    <Card><CardContent className="p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-28 mt-2" />
      <Skeleton className="h-3 w-40 mt-2" />
    </CardContent></Card>
  )
}

export function ChartSkeleton() {
  return <Skeleton className="h-48 w-full" />
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
}

