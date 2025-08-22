'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CreateInvoiceProps {
  children?: React.ReactNode
}

export function CreateInvoice({ children }: CreateInvoiceProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleCreateInvoice = () => {
    // Determine the correct path based on current locale
    const isLocalized = pathname.startsWith('/fr/') || pathname.startsWith('/en/')
    const newInvoicePath = isLocalized
      ? `${pathname.split('/').slice(0, 2).join('/')}/billing/invoices/new`
      : '/billing/invoices/new'

    router.push(newInvoicePath)
  }

  return (
    <div onClick={handleCreateInvoice} className="cursor-pointer">
      {children || (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      )}
    </div>
  )
}
