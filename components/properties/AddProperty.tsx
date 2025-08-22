'use client'

import { useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

import { useFormStatus } from 'react-dom'
import { createProperty } from '../../actions/properties'
import { useToast } from '../../hooks/use-toast'

function SubmitBtn({ dictionary }: { dictionary?: any }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (dictionary?.common?.saving || 'Saving…') : (dictionary?.common?.save || 'Save')}
    </Button>
  )
}

interface AddPropertyProps {
  children?: React.ReactNode
  dictionary?: any
}

export function AddProperty({ children, dictionary }: AddPropertyProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  const action = async (fd: FormData) => {
    try {
      // Use the existing createProperty action with proper state handling
      const result = await createProperty({}, fd)

      if (result?.errors) {
        toast({
          title: 'Could not create property',
          description: result.errors._form?.[0] || 'Please check inputs',
          variant: 'destructive'
        })
        return
      }

      if (result?.success) {
        toast({ title: 'Property created successfully!' })
        formRef.current?.reset()
      }

      // If no result is returned, it means the action redirected successfully
      // The redirect will handle navigation, so we don't need to do anything
    } catch (error) {
      // Only show error if it's not a redirect
      if (error instanceof Error && !error.message.includes('NEXT_REDIRECT')) {
        toast({
          title: 'Error',
          description: 'Failed to create property',
          variant: 'destructive'
        })
      }
      // If it's a redirect error, let it bubble up to handle the navigation
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || <Button>Add Property</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.properties?.newProperty || "New Property"}</DialogTitle>
          <DialogDescription>{dictionary?.properties?.newPropertyDescription || "Enter property details. You can add units and manage tenants after creation."}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {dictionary?.properties?.propertyName || "Property Name"}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                minLength={3}
                placeholder={dictionary?.properties?.propertyNamePlaceholder || "e.g., Sunset Apartments"}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                {dictionary?.properties?.propertyAddress || dictionary?.properties?.address || "Address"}
              </Label>
              <Input
                id="address"
                name="address"
                placeholder={dictionary?.properties?.propertyAddressPlaceholder || "123 Main St, City, State"}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType" className="text-sm font-medium">
                {dictionary?.properties?.propertyType || "Property Type"}
              </Label>
              <select
                id="propertyType"
                name="propertyType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{dictionary?.properties?.selectType || "Select type..."}</option>
                <option value="apartment">{dictionary?.properties?.propertyTypes?.apartment || "Apartment"}</option>
                <option value="house">{dictionary?.properties?.propertyTypes?.house || "House"}</option>
                <option value="condo">{dictionary?.properties?.propertyTypes?.condo || "Condo"}</option>
                <option value="townhouse">{dictionary?.properties?.propertyTypes?.townhouse || "Townhouse"}</option>
                <option value="commercial">{dictionary?.properties?.propertyTypes?.commercial || "Commercial"}</option>
                <option value="other">{dictionary?.properties?.propertyTypes?.other || "Other"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedUnits" className="text-sm font-medium">
                {dictionary?.properties?.expectedUnits || "Expected Units"}
              </Label>
              <Input
                id="expectedUnits"
                name="expectedUnits"
                type="number"
                min="1"
                placeholder={dictionary?.properties?.expectedUnitsPlaceholder || "10"}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                {dictionary?.properties?.propertyDescription || "Description"}
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={dictionary?.properties?.propertyDescriptionPlaceholder || "Brief description of the property..."}
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <SubmitBtn dictionary={dictionary} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddProperty
