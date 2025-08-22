'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Star, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Edit,
  Eye,
  FileText
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

interface Vendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  specialties: string[]
  rating: number
  totalJobs: number
  activeJobs: number
  completedJobs: number
  avgResponseTime: number // hours
  avgCompletionTime: number // days
  totalRevenue: number
  status: 'active' | 'inactive' | 'suspended'
  joinedDate: Date
  lastActive: Date
  certifications: string[]
  insuranceExpiry?: Date
  preferredRate?: number
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
    emergency: boolean
  }
}

interface VendorManagementProps {
  vendors: Vendor[]
}

export function VendorManagement({ vendors }: VendorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [addVendorOpen, setAddVendorOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  // Get unique specialties for filter
  const allSpecialties = Array.from(
    new Set(vendors.flatMap(vendor => vendor.specialties))
  )

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = specialtyFilter === 'all' || vendor.specialties.includes(specialtyFilter)
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
    return matchesSearch && matchesSpecialty && matchesStatus
  })

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Vendor Management</h2>
          <p className="text-muted-foreground">
            Manage your maintenance vendors and contractors
          </p>
        </div>
        <Dialog open={addVendorOpen} onOpenChange={setAddVendorOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Register a new maintenance vendor or contractor
              </DialogDescription>
            </DialogHeader>
            <AddVendorForm onClose={() => setAddVendorOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">
              {vendors.filter(v => v.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.reduce((sum, v) => sum + v.activeJobs, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.length > 0 ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(vendors.reduce((sum, v) => sum + v.totalRevenue, 0), 'MAD')}
            </div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {allSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {vendors.length === 0 ? 'No vendors registered yet' : 'No vendors match your search'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{vendor.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.specialties.slice(0, 2).map(specialty => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {vendor.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{vendor.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStarRating(vendor.rating)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.activeJobs} active</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.completedJobs} completed
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          Response: {vendor.avgResponseTime}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completion: {vendor.avgCompletionTime}d
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVendor.name}</DialogTitle>
              <DialogDescription>
                {selectedVendor.company} • Vendor Details
              </DialogDescription>
            </DialogHeader>
            <VendorDetails vendor={selectedVendor} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AddVendorForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact Name</Label>
          <Input placeholder="John Doe" />
        </div>
        <div>
          <Label>Company Name</Label>
          <Input placeholder="ABC Maintenance Co." />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="john@abcmaintenance.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input placeholder="+212 6 12 34 56 78" />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Textarea placeholder="Business address" rows={2} />
      </div>

      <div>
        <Label>Specialties</Label>
        <Input placeholder="Plumbing, HVAC, Electrical (comma separated)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preferred Rate (per hour)</Label>
          <Input type="number" placeholder="150" />
        </div>
        <div>
          <Label>Insurance Expiry</Label>
          <Input type="date" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Add Vendor
        </Button>
      </div>
    </div>
  )
}

function VendorDetails({ vendor }: { vendor: Vendor }) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {formatDate(vendor.joinedDate.toISOString())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{vendor.rating}</div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vendor.avgResponseTime}h</div>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vendor.avgCompletionTime}d</div>
              <p className="text-xs text-muted-foreground">Completion Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vendor.completedJobs}</div>
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
