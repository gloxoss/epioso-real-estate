'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Search, 
  UserPlus,
  FileText,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'

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

interface TenantAssignmentProps {
  unitId: string
  unit: Unit
  onAssignmentComplete?: () => void
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  type: 'tenant' | 'owner' | 'vendor'
}

export function TenantAssignment({ unitId, unit, onAssignmentComplete }: TenantAssignmentProps) {
  const [assignmentMethod, setAssignmentMethod] = useState<'existing' | 'new'>('existing')
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [createContactOpen, setCreateContactOpen] = useState(false)

  // Mock existing contacts - in real app, this would come from API
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+212 6 12 34 56 78',
      type: 'tenant'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+212 6 87 65 43 21',
      type: 'tenant'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      type: 'tenant'
    }
  ]

  const filteredContacts = mockContacts.filter(contact =>
    contact.type === 'tenant' &&
    (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAssignTenant = () => {
    // In real app, this would make API call to assign tenant
    console.log('Assigning tenant to unit:', { unitId, tenantId: selectedTenant })
    onAssignmentComplete?.()
  }

  return (
    <div className="space-y-6">
      {/* Assignment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Tenant to Unit {unit.unitNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={assignmentMethod === 'existing' ? 'default' : 'outline'}
              onClick={() => setAssignmentMethod('existing')}
              className="h-20 flex-col gap-2"
            >
              <Users className="h-6 w-6" />
              <span>Existing Contact</span>
            </Button>
            <Button
              variant={assignmentMethod === 'new' ? 'default' : 'outline'}
              onClick={() => setAssignmentMethod('new')}
              className="h-20 flex-col gap-2"
            >
              <UserPlus className="h-6 w-6" />
              <span>New Contact</span>
            </Button>
          </div>

          {assignmentMethod === 'existing' ? (
            <ExistingTenantSelection
              contacts={filteredContacts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTenant={selectedTenant}
              onTenantSelect={setSelectedTenant}
            />
          ) : (
            <NewTenantForm unit={unit} />
          )}
        </CardContent>
      </Card>

      {/* Lease Agreement Setup */}
      {(assignmentMethod === 'existing' && selectedTenant) || assignmentMethod === 'new' ? (
        <Card>
          <CardHeader>
            <CardTitle>Lease Agreement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaseAgreementForm unit={unit} />
          </CardContent>
        </Card>
      ) : null}

      {/* Action Buttons */}
      {((assignmentMethod === 'existing' && selectedTenant) || assignmentMethod === 'new') && (
        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button onClick={handleAssignTenant}>
            <FileText className="h-4 w-4 mr-2" />
            Create Lease & Assign Tenant
          </Button>
        </div>
      )}
    </div>
  )
}

function ExistingTenantSelection({
  contacts,
  searchTerm,
  onSearchChange,
  selectedTenant,
  onTenantSelect
}: {
  contacts: Contact[]
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTenant: string
  onTenantSelect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search existing contacts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? `No contacts found for "${searchTerm}"` : 'No tenant contacts available'}
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTenant === contact.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onTenantSelect(contact.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                {selectedTenant === contact.id && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function NewTenantForm({ unit }: { unit: Unit }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tenant-name">Full Name *</Label>
          <Input id="tenant-name" placeholder="John Doe" required />
        </div>
        <div>
          <Label htmlFor="tenant-email">Email Address *</Label>
          <Input id="tenant-email" type="email" placeholder="john@example.com" required />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tenant-phone">Phone Number</Label>
          <Input id="tenant-phone" placeholder="+212 6 12 34 56 78" />
        </div>
        <div>
          <Label htmlFor="tenant-id">ID Number</Label>
          <Input id="tenant-id" placeholder="National ID or Passport" />
        </div>
      </div>

      <div>
        <Label htmlFor="tenant-address">Current Address</Label>
        <Textarea id="tenant-address" placeholder="Current residential address" rows={2} />
      </div>

      <div>
        <Label htmlFor="tenant-notes">Notes</Label>
        <Textarea id="tenant-notes" placeholder="Additional information about the tenant" rows={2} />
      </div>
    </div>
  )
}

function LeaseAgreementForm({ unit }: { unit: Unit }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lease-start">Lease Start Date *</Label>
          <Input id="lease-start" type="date" required />
        </div>
        <div>
          <Label htmlFor="lease-end">Lease End Date *</Label>
          <Input id="lease-end" type="date" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rent-amount">Monthly Rent *</Label>
          <Input 
            id="rent-amount" 
            type="number" 
            placeholder={unit.rentAmount?.toString() || "2500"} 
            defaultValue={unit.rentAmount}
            required 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Current unit rent: {unit.rentAmount ? formatCurrency(unit.rentAmount, 'MAD') : 'Not set'}
          </p>
        </div>
        <div>
          <Label htmlFor="deposit-amount">Security Deposit *</Label>
          <Input 
            id="deposit-amount" 
            type="number" 
            placeholder={(unit.rentAmount || 2500).toString()}
            defaultValue={unit.rentAmount}
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lease-type">Lease Type</Label>
          <Select defaultValue="fixed">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Term</SelectItem>
              <SelectItem value="month-to-month">Month-to-Month</SelectItem>
              <SelectItem value="yearly">Yearly Renewable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment-due">Payment Due Date</Label>
          <Select defaultValue="1">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 28 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} of each month
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="lease-terms">Special Terms & Conditions</Label>
        <Textarea 
          id="lease-terms" 
          placeholder="Any special conditions, restrictions, or agreements"
          rows={3}
        />
      </div>
    </div>
  )
}
