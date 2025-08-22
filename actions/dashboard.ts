'use server'

import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { billingRepo } from '@/repositories/billing'
import { activityRepo } from '@/repositories/activity'
import { revalidateTag } from 'next/cache'

export async function sendInvoiceReminder(invoiceId: string) {
  const session = await requireAuth()
  const orgId = (session.user as any).organizationId as string
  const actorId = (session.user as any).id as string

  // Minimal placeholder: delegate to billing and activity repos
  if ((billingRepo as any).sendReminder) {
    await (billingRepo as any).sendReminder(orgId, invoiceId, actorId)
  }
  if ((activityRepo as any).log) {
    await (activityRepo as any).log(orgId, { entityType: 'invoice', entityId: invoiceId, action: 'reminder_sent', payload: { channel: 'email' } })
  }
  revalidateTag('overdue'); revalidateTag('kpi')
  return { ok: true }
}

const PaySchema = z.object({ invoiceId: z.string().min(1), amount: z.number().positive(), currency: z.string().min(1) })
export async function recordOfflinePayment(payload: z.infer<typeof PaySchema>) {
  const session = await requireAuth()
  const orgId = (session.user as any).organizationId as string
  const actorId = (session.user as any).id as string
  const data = PaySchema.parse(payload)

  if ((billingRepo as any).recordOfflinePayment) {
    await (billingRepo as any).recordOfflinePayment(orgId, data, actorId)
  }
  if ((activityRepo as any).log) {
    await (activityRepo as any).log(orgId, { entityType: 'payment', entityId: data.invoiceId, action: 'payment_recorded', payload: { method: 'offline', amount: data.amount } })
  }
  revalidateTag('overdue'); revalidateTag('collections'); revalidateTag('kpi')
  return { ok: true }
}

