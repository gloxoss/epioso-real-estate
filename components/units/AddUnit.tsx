'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddUnitProps {
  children?: React.ReactNode
}

export function AddUnit({ children }: AddUnitProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState('')

  const handleContinue = () => {
    if (selectedProperty) {
      router.push(`/properties/${selectedProperty}/units/new`)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>
            Select a property to add a new unit to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="property" className="text-sm font-medium">
              Property *
            </label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Load properties dynamically */}
                <SelectItem value="property-1">Sample Property 1</SelectItem>
                <SelectItem value="property-2">Sample Property 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedProperty}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
