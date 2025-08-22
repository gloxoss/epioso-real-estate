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
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ContactFormProps {
  contact?: {
    id: string
    type: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
  }
}

export function ContactForm({ contact }: ContactFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: contact?.type || '',
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    notes: contact?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        type: formData.type,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
      }

      const response = await fetch('/api/contacts', {
        method: contact ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact ? { ...payload, id: contact.id } : payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save contact')
      }

      toast({
        title: 'Success',
        description: `Contact ${contact ? 'updated' : 'created'} successfully.`,
      })

      // Redirect back to contacts or contact detail page
      if (contact) {
        router.push(`/contacts/${contact.id}`)
      } else {
        router.push('/contacts')
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save contact. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Type */}
      <div>
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select contact type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="owner">Owner/Landlord</SelectItem>
            <SelectItem value="vendor">Vendor/Contractor</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="emergency">Emergency Contact</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Full name"
          required
          className="mt-1"
        />
      </div>

      {/* Contact Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
            className="mt-1"
          />
        </div>
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

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about this contact..."
          rows={4}
          className="mt-1"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !formData.type || !formData.name || !formData.phone}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  )
}
