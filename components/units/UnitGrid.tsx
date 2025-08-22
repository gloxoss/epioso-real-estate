import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Users, 
  Bed, 
  Bath,
  Square,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatMoney } from '@/lib/format'

interface Unit {
  id: string
  unitNumber: string
  status: string
  rentAmount?: number | null
  property: {
    id: string
    name: string
  }
  attributes?: {
    floor?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    size?: number | null
    depositAmount?: number | null
    description?: string | null
  }
}

interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

interface UnitGridProps {
  units: Unit[]
  pagination: Pagination
  dictionary?: any
  locale?: string
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'available':
      return <Home className="h-4 w-4" />
    case 'occupied':
      return <Users className="h-4 w-4" />
    case 'maintenance':
      return <Home className="h-4 w-4" />
    case 'unavailable':
      return <Home className="h-4 w-4" />
    default:
      return <Home className="h-4 w-4" />
  }
}

export function UnitGrid({ units, pagination, dictionary, locale = 'en' }: UnitGridProps) {
  return (
    <div className="space-y-6">
      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <Card key={unit.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(unit.status)}
                  {unit.unitNumber}
                </CardTitle>
                <Badge className={getStatusColor(unit.status)}>
                  {unit.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {unit.property.name}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Unit Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {unit.rentAmount && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>{formatMoney(Number(unit.rentAmount))}</span>
                  </div>
                )}

                {(unit.attributes?.bedrooms !== null && unit.attributes?.bedrooms !== undefined) && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3 text-muted-foreground" />
                    <span>{unit.attributes.bedrooms} bed</span>
                  </div>
                )}

                {(unit.attributes?.bathrooms !== null && unit.attributes?.bathrooms !== undefined) && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3 text-muted-foreground" />
                    <span>{unit.attributes.bathrooms} bath</span>
                  </div>
                )}

                {unit.attributes?.size && (
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3 text-muted-foreground" />
                    <span>{unit.attributes.size} sq ft</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/${locale}/units/${unit.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    {dictionary?.units?.view || "View"}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/${locale}/units/${unit.id}/edit`}>
                    <Edit className="h-3 w-3 mr-1" />
                    {dictionary?.units?.edit || "Edit"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {dictionary?.units?.showing || "Showing"} {((pagination.page - 1) * pagination.perPage) + 1} {dictionary?.units?.to || "to"}{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} {dictionary?.units?.of || "of"}{' '}
            {pagination.total} {dictionary?.units?.units || "units"}
          </div>
          
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            )}
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                const isActive = pageNum === pagination.page
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={`?page=${pageNum}`}>
                      {pageNum}
                    </Link>
                  </Button>
                )
              })}
            </div>
            
            {pagination.page < pagination.totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${pagination.page + 1}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
