'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditPropertyForm } from '@/components/properties/EditPropertyForm'
import { propertiesRepo } from '@/repositories/properties'
import { Skeleton } from '@/components/ui/skeleton'

interface EditPropertyModalProps {
  params: { id: string }
}

export default function EditPropertyModal({ params }: EditPropertyModalProps) {
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await propertiesRepo.findById(params.id, 'temp-org-id') // TODO: Get actual org ID
        if (!data) {
          setError('Property not found')
        } else {
          setProperty(data)
        }
      } catch (err) {
        setError('Failed to load property')
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  const handleClose = () => {
    router.back()
  }

  const handleSuccess = () => {
    router.back()
    router.refresh() // Refresh the underlying page data
  }

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loading ? 'Loading...' : error ? 'Error' : `Edit ${property?.name}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <button 
                onClick={handleClose}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
          ) : (
            <EditPropertyForm 
              property={property} 
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
