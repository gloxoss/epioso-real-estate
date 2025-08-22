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
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface UnitFormProps {
  propertyId: string
  propertyName: string
  unit?: {
    id: string
    unitNumber: string
    floor?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    size?: number | null
    rentAmount?: number | null
    depositAmount?: number | null
    status: string
    description?: string | null
  }
}

export function UnitForm({ propertyId, propertyName, unit }: UnitFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    unitNumber: unit?.unitNumber || '',
    floor: unit?.floor?.toString() || '',
    bedrooms: unit?.bedrooms?.toString() || '',
    bathrooms: unit?.bathrooms?.toString() || '',
    size: unit?.size?.toString() || '',
    rentAmount: unit?.rentAmount?.toString() || '',
    depositAmount: unit?.depositAmount?.toString() || '',
    status: unit?.status || 'available',
    description: unit?.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        propertyId,
        unitNumber: formData.unitNumber,
        floor: formData.floor ? parseInt(formData.floor) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        size: formData.size ? parseInt(formData.size) : null,
        rentAmount: formData.rentAmount ? parseFloat(formData.rentAmount) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        status: formData.status,
        description: formData.description || null,
      }

      const response = await fetch('/api/units', {
        method: unit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unit ? { ...payload, id: unit.id } : payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save unit')
      }

      // Redirect back to property page
      router.push(`/properties/${propertyId}`)
    } catch (error) {
      console.error('Error saving unit:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <strong>Property:</strong> {propertyName}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="unitNumber">Unit Number *</Label>
          <Input
            id="unitNumber"
            value={formData.unitNumber}
            onChange={(e) => handleChange('unitNumber', e.target.value)}
            placeholder="e.g., 101, A1, Studio-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            value={formData.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
            placeholder="e.g., 1, 2, 3"
          />
        </div>
      </div>

      {/* Unit Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            placeholder="1"
          />
        </div>

        <div>
          <Label htmlFor="size">Size (sq ft)</Label>
          <Input
            id="size"
            type="number"
            min="0"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="800"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="rentAmount">Monthly Rent ($)</Label>
          <Input
            id="rentAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.rentAmount}
            onChange={(e) => handleChange('rentAmount', e.target.value)}
            placeholder="1200.00"
          />
        </div>

        <div>
          <Label htmlFor="depositAmount">Security Deposit ($)</Label>
          <Input
            id="depositAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.depositAmount}
            onChange={(e) => handleChange('depositAmount', e.target.value)}
            placeholder="1200.00"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Under Maintenance</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Additional details about this unit..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/properties/${propertyId}`)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {unit ? 'Update Unit' : 'Create Unit'}
        </Button>
      </div>
    </form>
  )
}
