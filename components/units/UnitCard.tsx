'use client'

import { UnitStatus } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Unit {
  id: string
  unitNumber: string
  status: UnitStatus
  rentAmount?: number | null
  property: {
    id: string
    name: string
  }
}

interface UnitCardProps {
  unit: Unit
  isDragging?: boolean
}

const statusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  occupied: 'bg-blue-100 text-blue-800 border-blue-200',
  maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
  sold: 'bg-purple-100 text-purple-800 border-purple-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  sold: 'Sold',
  blocked: 'Blocked',
}

export function UnitCard({ unit, isDragging = false }: UnitCardProps) {
  return (
    <Card 
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
        isDragging && 'shadow-lg rotate-3',
        statusColors[unit.status]
      )}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Unit Number */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{unit.unitNumber}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/units/${unit.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/units/${unit.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Unit
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Property Name */}
          <p className="text-xs text-muted-foreground truncate">
            {unit.property.name}
          </p>

          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={cn('text-xs', statusColors[unit.status])}
          >
            {statusLabels[unit.status]}
          </Badge>

          {/* Rent Amount */}
          {unit.rentAmount && (
            <div className="flex items-center space-x-1 text-xs">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(unit.rentAmount)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
