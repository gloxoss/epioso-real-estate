import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ContactsTableSkeletonProps {
  rows?: number
}

export function ContactsTableSkeleton({ rows = 5 }: ContactsTableSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 mr-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 mr-1" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                
                <TableCell>
                  <Skeleton className="h-3 w-20" />
                </TableCell>
                
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
