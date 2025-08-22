'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Temporary inline form components
const Form = ({ children, ...props }: any) => <form {...props}>{children}</form>
const FormControl = ({ children }: any) => <>{children}</>
const FormField = ({ render }: any) => render()
const FormItem = ({ children }: any) => <div className="space-y-2">{children}</div>
const FormLabel = ({ children, ...props }: any) => <Label {...props}>{children}</Label>
const FormMessage = ({ children }: any) => children ? <p className="text-sm text-red-600">{children}</p> : null
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { SalesAgentWithDetails } from '@/repositories/sales-agents'

interface Property {
  id: string
  name: string
  address?: string
  units?: Array<{
    id: string
    unitNumber: string
    salePrice?: number
    isForSale: boolean
  }>
}

interface LeadFormProps {
  agents: SalesAgentWithDetails[]
  properties: Property[]
  initialData?: {
    propertyId?: string
    unitId?: string
    source?: string
  }
  locale: string
}

const leadSchema = z.object({
  // Contact Information
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  
  // Lead Details
  source: z.enum(['website', 'referral', 'social_media', 'advertising', 'walk_in', 'phone_call', 'email', 'agent_network', 'other']),
  status: z.enum(['new', 'contacted', 'qualified']).default('new'),
  
  // Property/Unit
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  
  // Budget & Timeline
  budget: z.string().optional(),
  timeline: z.string().optional(),
  
  // Assignment
  assignedAgentId: z.string().optional(),
  
  // Follow-up
  nextFollowUpDate: z.date().optional(),
  
  // Notes
  notes: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'agent_network', label: 'Agent Network' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
]

export function LeadForm({ agents, properties, initialData, locale }: LeadFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    initialData?.propertyId ? properties.find(p => p.id === initialData.propertyId) || null : null
  )

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source: (initialData?.source as any) || 'website',
      status: 'new',
      propertyId: initialData?.propertyId || '',
      unitId: initialData?.unitId || '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      budget: '',
      timeline: '',
      assignedAgentId: '',
      notes: '',
    },
  })

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    setSelectedProperty(property || null)
    form.setValue('propertyId', propertyId)
    form.setValue('unitId', '') // Reset unit selection
  }

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)
    
    try {
      // Create contact first
      const contactResponse = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.contactName,
          email: data.contactEmail || null,
          phone: data.contactPhone || null,
          type: 'buyer',
        }),
      })

      if (!contactResponse.ok) {
        throw new Error('Failed to create contact')
      }

      const contact = await contactResponse.json()

      // Create lead
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          propertyId: data.propertyId || null,
          unitId: data.unitId || null,
          source: data.source,
          status: data.status,
          budget: data.budget ? parseFloat(data.budget) : null,
          timeline: data.timeline || null,
          assignedAgentId: data.assignedAgentId || null,
          nextFollowUpDate: data.nextFollowUpDate?.toISOString() || null,
          notes: data.notes || null,
        }),
      })

      if (!leadResponse.ok) {
        throw new Error('Failed to create lead')
      }

      const lead = await leadResponse.json()
      
      // Redirect to lead details
      router.push(`/${locale}/leads/${lead.id}`)
    } catch (error) {
      console.error('Error creating lead:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 6XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sourceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (MAD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Timeline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Within 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property of Interest</FormLabel>
                  <Select onValueChange={handlePropertyChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No specific property</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProperty?.units && selectedProperty.units.length > 0 && (
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any unit</SelectItem>
                        {selectedProperty.units
                          .filter(unit => unit.isForSale)
                          .map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unit {unit.unitNumber}
                              {unit.salePrice && ` - ${unit.salePrice.toLocaleString()} MAD`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="assignedAgentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Agent</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.user.name || agent.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Follow-up & Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-up & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nextFollowUpDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Follow-up Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this lead..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Lead
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
