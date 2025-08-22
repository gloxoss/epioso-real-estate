'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Users,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'

interface Unit {
  id: string
  unitNumber: string
  status: 'occupied' | 'available' | 'maintenance'
  rentAmount?: number
  size?: number
  bedrooms?: number
  bathrooms?: number
  contact?: {
    id: string
    name: string
    email?: string
  }
}

interface EnhancedUnitsTableProps {
  units: Unit[]
  propertyId: string
  dictionary?: any
  locale?: string
}

export function EnhancedUnitsTable({ units, propertyId, dictionary, locale = 'en' }: EnhancedUnitsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Add safety check for units array
  const safeUnits = units || []

  const filteredUnits = safeUnits.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: Unit['status']) => {
    switch (status) {
      case 'occupied':
        return 'default'
      case 'available':
        return 'secondary'
      case 'maintenance':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'occupied':
        return 'text-green-600'
      case 'available':
        return 'text-blue-600'
      case 'maintenance':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Home className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {dictionary?.properties?.noUnitsYet || "No units yet"}
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {dictionary?.properties?.startByAddingUnits || "Start by adding units to this property to track occupancy and manage tenants."}
          </p>
          <Button asChild>
            <Link href={`/properties/${propertyId}/units/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {dictionary?.properties?.addFirstUnit || "Add First Unit"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{dictionary?.properties?.unitsManagement || "Units Management"}</CardTitle>
          <Button asChild>
            <Link href={`/${locale}/properties/${propertyId}/units/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {dictionary?.properties?.addUnit || "Add Unit"}
            </Link>
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={dictionary?.properties?.searchUnitsOrTenants || "Search units or tenants..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {dictionary?.properties?.status || "Status"}: {statusFilter === 'all' ? (dictionary?.properties?.all || 'All') : (dictionary?.properties?.[statusFilter] || statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                {dictionary?.properties?.all || "All"} {dictionary?.properties?.units || "Units"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('occupied')}>
                {dictionary?.properties?.occupied || "Occupied"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('available')}>
                {dictionary?.properties?.available || "Available"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('maintenance')}>
                {dictionary?.properties?.maintenance || "Maintenance"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dictionary?.properties?.unit || "Unit"}</TableHead>
                <TableHead>{dictionary?.properties?.status || "Status"}</TableHead>
                <TableHead>{dictionary?.properties?.tenant || "Tenant"}</TableHead>
                <TableHead>{dictionary?.properties?.rent || "Rent"}</TableHead>
                <TableHead>{dictionary?.properties?.size || "Size"}</TableHead>
                <TableHead>{dictionary?.properties?.bedBath || "Bed/Bath"}</TableHead>
                <TableHead className="text-right">{dictionary?.properties?.actions || dictionary?.common?.actions || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">
                    {unit.unitNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(unit.status)}>
                      {dictionary?.properties?.[unit.status] || unit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {unit.contact ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{unit.contact.name}</p>
                          {unit.contact.email && (
                            <p className="text-xs text-muted-foreground">
                              {unit.contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{dictionary?.common?.notAvailable || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.rentAmount ? (
                      <span className="font-medium">
                        {formatCurrency(unit.rentAmount, 'MAD')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{dictionary?.common?.notAvailable || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.size ? (
                      <span>{unit.size} {dictionary?.properties?.sqFt || "sq ft"}</span>
                    ) : (
                      <span className="text-muted-foreground">{dictionary?.common?.notAvailable || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.bedrooms || unit.bathrooms ? (
                      <span>
                        {unit.bedrooms || 0}{dictionary?.properties?.bedroomAbbr || "bd"} / {unit.bathrooms || 0}{dictionary?.properties?.bathroomAbbr || "ba"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{dictionary?.common?.notAvailable || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/units/${unit.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/units/${unit.id}/edit`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Unit
                          </Link>
                        </DropdownMenuItem>
                        {unit.status === 'available' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/units/${unit.id}/assign-tenant`} className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Assign Tenant
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredUnits.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No units found matching "{searchTerm}"
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {units.filter(u => u.status === 'occupied').length}
            </p>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {units.filter(u => u.status === 'available').length}
            </p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {units.filter(u => u.status === 'maintenance').length}
            </p>
            <p className="text-sm text-muted-foreground">Maintenance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
