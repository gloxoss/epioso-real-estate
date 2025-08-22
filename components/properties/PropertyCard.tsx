import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Building2, MapPin, Users } from 'lucide-react'

interface PropertyCardProps {
  property: {
    id: string
    name: string
    address?: string | null
    imageUrl?: string | null
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    pendingIssues: number
  }
  dictionary?: any
  locale?: string
}

export function PropertyCard({ property, dictionary, locale = 'en' }: PropertyCardProps) {
  const occupancyRate = property.totalUnits > 0 
    ? Math.round((property.occupiedUnits / property.totalUnits) * 100) 
    : 0

  return (
    <Link href={`/${locale}/properties/${property.id}`} className="group">
      <Card className="h-full transition-all duration-200 group-hover:shadow-md group-hover:border-primary/40">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {property.name}
              </CardTitle>
              {property.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{property.address}</span>
                </div>
              )}
            </div>
            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Property Image */}
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Units Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{dictionary?.properties?.occupancy || "Occupancy"}</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>

            <Progress value={occupancyRate} className="h-2" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{property.occupiedUnits} {dictionary?.properties?.occupied || "occupied"}</span>
              <span>{property.vacantUnits} {dictionary?.properties?.vacant || "vacant"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {property.totalUnits} {property.totalUnits === 1 ? (dictionary?.properties?.unit || 'unit') : (dictionary?.properties?.units || 'units')}
              </span>
            </div>
            
            {property.pendingIssues > 0 && (
              <Badge variant="secondary" className="text-xs">
                {property.pendingIssues} {property.pendingIssues === 1 ? (dictionary?.maintenance?.issue || 'issue') : (dictionary?.maintenance?.issues || 'issues')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
