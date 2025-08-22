import { formatMoney, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sendInvoiceReminder, recordOfflinePayment } from '@/actions/dashboard'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, CheckCircle, Eye, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/config'

// Server Actions
async function handleSendReminder(invoiceId: string) {
  'use server'
  await sendInvoiceReminder(invoiceId)
}

async function handleRecordPayment(formData: FormData) {
  'use server'
  const invoiceId = formData.get('invoiceId') as string
  const amount = Number(formData.get('amount') || 0)
  const currency = formData.get('currency') as string
  await recordOfflinePayment({ invoiceId, amount, currency })
}

// Server Component rendering forms that post to Server Actions

type Item = {
  id: string
  number: string
  contactName: string
  unitCode?: string | null
  amount: number
  currency: string
  dueDate: string
  daysLate: number
}

// Helper function to get severity based on days late
function getSeverity(daysLate: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysLate >= 90) return 'critical'
  if (daysLate >= 61) return 'high'
  if (daysLate >= 31) return 'medium'
  return 'low'
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300'
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/40 dark:text-gray-300'
  }
}

function getSeverityBadgeVariant(severity: string): 'destructive' | 'secondary' | 'outline' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

interface OverdueListProps {
  items: Item[]
  dictionary?: Dictionary
  locale?: string
}

export default function OverdueList({ items, dictionary, locale = 'fr' }: OverdueListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4 dark:bg-green-950/40">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">{dictionary?.dashboard?.overdue?.allCaughtUp || "All caught up!"}</p>
        <p className="text-xs text-muted-foreground">{dictionary?.dashboard?.overdue?.noOverdueInvoices || "No overdue invoices at this time"}</p>
      </div>
    )
  }

  // Sort by severity (critical first) then by days late
  const sortedItems = items.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const aSeverity = getSeverity(a.daysLate)
    const bSeverity = getSeverity(b.daysLate)
    const severityDiff = severityOrder[bSeverity] - severityOrder[aSeverity]
    if (severityDiff !== 0) return severityDiff
    return b.daysLate - a.daysLate
  })

  return (
    <div className="space-y-3">
      {sortedItems.map((inv) => {
        const severity = getSeverity(inv.daysLate)

        return (
          <div
            key={inv.id}
            className={`rounded-lg border p-3 transition-colors hover:bg-muted/50 ${getSeverityColor(severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium truncate">
                    #{inv.number} · {inv.contactName}
                    {inv.unitCode ? ` · ${inv.unitCode}` : ''}
                  </div>
                  {severity === 'critical' && (
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-muted-foreground">
                    Due {formatDate(inv.dueDate)}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(severity)} className="text-xs">
                    {inv.daysLate} days late · {severity}
                  </Badge>
                </div>
                <div className="font-semibold text-sm">
                  {formatMoney(inv.amount, inv.currency)}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/billing/invoices/${inv.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Invoice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action={handleSendReminder.bind(null, inv.id)} className="w-full">
                        <button type="submit" className="flex items-center gap-2 w-full">
                          <Mail className="h-4 w-4" />
                          Send Reminder
                        </button>
                      </form>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action={handleRecordPayment} className="w-full">
                        <input type="hidden" name="invoiceId" value={inv.id} />
                        <input type="hidden" name="currency" value={inv.currency} />
                        <input type="hidden" name="amount" value={inv.amount} />
                        <button type="submit" className="flex items-center gap-2 w-full">
                          <CheckCircle className="h-4 w-4" />
                          Mark as Paid
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )
      })}

      {items.length > 0 && (
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full text-xs">
            <Link href="/billing/invoices?status=overdue">
              View all overdue invoices
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

