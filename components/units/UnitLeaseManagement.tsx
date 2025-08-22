'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Plus, 
  Calendar, 
  FileText, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/format'

interface Unit {
  id: string
  unitNumber: string
  status: string
  rentAmount?: number
  property: {
    id: string
    name: string
  }
}

interface LeaseData {
  currentLease: any
  leaseHistory: any[]
  upcomingRenewal: any
}

interface UnitLeaseManagementProps {
  unitId: string
  unit: Unit
  leaseData: LeaseData
}

export function UnitLeaseManagement({ unitId, unit, leaseData }: UnitLeaseManagementProps) {
  const [assignTenantOpen, setAssignTenantOpen] = useState(false)
  const [renewLeaseOpen, setRenewLeaseOpen] = useState(false)

  const { currentLease, leaseHistory, upcomingRenewal } = leaseData

  return (
    <div className="space-y-6">
      {/* Current Tenant & Lease Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Lease Status</CardTitle>
            <Badge variant={unit.status === 'occupied' ? 'default' : 'secondary'}>
              {unit.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {unit.status === 'occupied' && currentLease ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tenant</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{currentLease.tenantName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentLease.tenantEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lease Period</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(currentLease.startDate)} - {formatDate(currentLease.endDate)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monthly Rent</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatCurrency(currentLease.rentAmount, 'MAD')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Security Deposit</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCurrency(currentLease.depositAmount, 'MAD')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/contacts/${currentLease.tenantId}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Tenant Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/leases/${currentLease.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease Agreement
                  </Link>
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Contract
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Unit Available</h3>
              <p className="text-muted-foreground mb-6">
                This unit is currently available for rent. Assign a tenant to get started.
              </p>
              <Dialog open={assignTenantOpen} onOpenChange={setAssignTenantOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Tenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign Tenant to Unit {unit.unitNumber}</DialogTitle>
                    <DialogDescription>
                      Create a new lease agreement for this unit.
                    </DialogDescription>
                  </DialogHeader>
                  <TenantAssignmentForm unitId={unitId} unit={unit} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lease Renewal Alert */}
      {upcomingRenewal && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Lease Renewal Required
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-200 mb-4">
              The current lease expires on {formatDate(upcomingRenewal.endDate)}. 
              Contact the tenant to discuss renewal options.
            </p>
            <div className="flex gap-2">
              <Dialog open={renewLeaseOpen} onOpenChange={setRenewLeaseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Renew Lease
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Renew Lease Agreement</DialogTitle>
                    <DialogDescription>
                      Create a new lease term for the current tenant.
                    </DialogDescription>
                  </DialogHeader>
                  <LeaseRenewalForm lease={currentLease} />
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Contact Tenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lease History */}
      <Card>
        <CardHeader>
          <CardTitle>Lease History</CardTitle>
        </CardHeader>
        <CardContent>
          {leaseHistory.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No previous leases</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaseHistory.map((lease, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{lease.tenantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(lease.rentAmount, 'MAD')}/month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lease.status === 'completed' ? 'default' : 'secondary'}>
                      {lease.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder components - these would be full implementations
function TenantAssignmentForm({ unitId, unit }: { unitId: string, unit: Unit }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tenant-name">Tenant Name</Label>
          <Input id="tenant-name" placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="tenant-email">Email</Label>
          <Input id="tenant-email" type="email" placeholder="john@example.com" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lease-start">Lease Start Date</Label>
          <Input id="lease-start" type="date" />
        </div>
        <div>
          <Label htmlFor="lease-end">Lease End Date</Label>
          <Input id="lease-end" type="date" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rent-amount">Monthly Rent</Label>
          <Input id="rent-amount" type="number" placeholder={unit.rentAmount?.toString()} />
        </div>
        <div>
          <Label htmlFor="deposit-amount">Security Deposit</Label>
          <Input id="deposit-amount" type="number" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button>Create Lease</Button>
      </div>
    </div>
  )
}

function LeaseRenewalForm({ lease }: { lease: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-start">New Start Date</Label>
          <Input id="new-start" type="date" />
        </div>
        <div>
          <Label htmlFor="new-end">New End Date</Label>
          <Input id="new-end" type="date" />
        </div>
      </div>
      <div>
        <Label htmlFor="new-rent">Monthly Rent</Label>
        <Input id="new-rent" type="number" defaultValue={lease?.rentAmount} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button>Renew Lease</Button>
      </div>
    </div>
  )
}
