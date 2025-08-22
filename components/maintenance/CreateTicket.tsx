'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'

interface CreateTicketProps {
  properties?: Array<{ id: string; name: string }>
  units?: Array<{ id: string; unitNumber: string; propertyId: string }>
  dictionary?: any
  locale?: string
}

export function CreateTicket({ properties = [], units = [], dictionary, locale = 'en' }: CreateTicketProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    propertyId: '',
    unitId: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/maintenance/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      toast({
        title: 'Ticket created',
        description: 'Maintenance ticket has been created successfully.',
      })

      setFormData({
        title: '',
        description: '',
        priority: '',
        category: '',
        propertyId: '',
        unitId: '',
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const filteredUnits = units.filter(unit => 
    !formData.propertyId || unit.propertyId === formData.propertyId
  )

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{dictionary?.maintenance?.createMaintenanceTicket || "Create Maintenance Ticket"}</CardTitle>
      </CardHeader>
      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{dictionary?.maintenance?.title || "Title"} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={dictionary?.maintenance?.briefDescription || "Brief description of the issue"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{dictionary?.maintenance?.priority || "Priority"} *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary?.maintenance?.selectPriority || "Select priority"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{dictionary?.maintenance?.low || "Low"}</SelectItem>
                  <SelectItem value="medium">{dictionary?.maintenance?.medium || "Medium"}</SelectItem>
                  <SelectItem value="high">{dictionary?.maintenance?.high || "High"}</SelectItem>
                  <SelectItem value="urgent">{dictionary?.maintenance?.urgent || "Urgent"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">{dictionary?.maintenance?.category || "Category"} *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary?.maintenance?.selectCategory || "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">{dictionary?.maintenance?.categories?.plumbing || "Plumbing"}</SelectItem>
                  <SelectItem value="electrical">{dictionary?.maintenance?.categories?.electrical || "Electrical"}</SelectItem>
                  <SelectItem value="hvac">{dictionary?.maintenance?.categories?.hvac || "HVAC"}</SelectItem>
                  <SelectItem value="appliance">{dictionary?.maintenance?.categories?.appliance || "Appliance"}</SelectItem>
                  <SelectItem value="structural">{dictionary?.maintenance?.categories?.structural || "Structural"}</SelectItem>
                  <SelectItem value="pest_control">{dictionary?.maintenance?.categories?.pestControl || "Pest Control"}</SelectItem>
                  <SelectItem value="cleaning">{dictionary?.maintenance?.categories?.cleaning || "Cleaning"}</SelectItem>
                  <SelectItem value="other">{dictionary?.maintenance?.categories?.other || "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property">{dictionary?.maintenance?.property || "Property"}</Label>
              <Select value={formData.propertyId} onValueChange={(value) => handleChange('propertyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary?.maintenance?.selectProperty || "Select property"} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.propertyId && (
            <div className="space-y-2">
              <Label htmlFor="unit">Unit (Optional)</Label>
              <Select value={formData.unitId} onValueChange={(value) => handleChange('unitId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={dictionary?.maintenance?.selectUnit || "Select unit"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the maintenance issue..."
              rows={4}
              required
            />
          </div>

          {/* Tenant Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Tenant Information (Optional)</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Name</Label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => handleChange('tenantName', e.target.value)}
                  placeholder="Tenant name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantEmail">Tenant Email</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleChange('tenantEmail', e.target.value)}
                  placeholder="tenant@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantPhone">Tenant Phone</Label>
                <Input
                  id="tenantPhone"
                  type="tel"
                  value={formData.tenantPhone}
                  onChange={(e) => handleChange('tenantPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
