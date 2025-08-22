'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Property {
  id: string
  name: string
  address?: string | null
  description?: string | null
  propertyType?: string | null
  expectedUnits?: number | null
  imageUrl?: string | null
}

interface EditPropertyFormProps {
  property: Property
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditPropertyForm({ property, onSuccess, onCancel }: EditPropertyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: property.name,
    address: property.address || '',
    description: property.description || '',
    propertyType: property.propertyType || '',
    expectedUnits: property.expectedUnits?.toString() || '',
    imageUrl: property.imageUrl || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address || null,
          description: formData.description || null,
          propertyType: formData.propertyType || null,
          expectedUnits: formData.expectedUnits ? parseInt(formData.expectedUnits) : null,
          imageUrl: formData.imageUrl || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      toast({
        title: 'Property updated successfully',
        description: `${formData.name} has been updated.`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/properties/${property.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating property:', error)
      toast({
        title: 'Error updating property',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Name */}
          <div>
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Sunset Apartments"
              required
              className="mt-1"
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the property..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Property Type */}
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment Building</SelectItem>
                <SelectItem value="house">Single Family House</SelectItem>
                <SelectItem value="condo">Condominium</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expected Units */}
          <div>
            <Label htmlFor="expectedUnits">Expected Number of Units</Label>
            <Input
              id="expectedUnits"
              type="number"
              value={formData.expectedUnits}
              onChange={(e) => handleChange('expectedUnits', e.target.value)}
              placeholder="e.g., 12"
              min="1"
              className="mt-1"
            />
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/property-image.jpg"
              className="mt-1"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Update Property
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
