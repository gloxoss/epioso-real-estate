'use server'

import { withAuth } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'
import { activityRepo } from '@/repositories/activity'
import { InvoiceCreateSchema, PaymentCreateSchema } from '@/schemas'
import { revalidateTag } from 'next/cache'
import { InvoiceStatus, PaymentMethod } from '@prisma/client'

export type InvoiceFormState = {
  errors?: {
    contactId?: string[]
    unitId?: string[]
    issueDate?: string[]
    dueDate?: string[]
    subtotal?: string[]
    tax?: string[]
    notes?: string[]
    _form?: string[]
  }
  success?: boolean
}

export type PaymentFormState = {
  errors?: {
    invoiceId?: string[]
    method?: string[]
    amount?: string[]
    paidAt?: string[]
    reference?: string[]
    notes?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const createInvoice = withAuth('billing:create', async (
  session,
  prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> => {
  try {
    const validatedFields = InvoiceCreateSchema.safeParse({
      contactId: formData.get('contactId') || null,
      unitId: formData.get('unitId') || null,
      issueDate: formData.get('issueDate'),
      dueDate: formData.get('dueDate'),
      currency: formData.get('currency') || 'MAD',
      subtotal: formData.get('subtotal'),
      tax: formData.get('tax') || 0,
      notes: formData.get('notes') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the invoice
    const invoice = await billingRepo.createInvoice(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'create',
      payload: {
        number: invoice.number,
        total: invoice.total,
        contactName: invoice.contact?.name,
      },
    })

    // Revalidate cache
    revalidateTag('invoices')
    revalidateTag('billing')
    
    return { success: true }
  } catch (error) {
    console.error('Invoice creation error:', error)
    return {
      errors: {
        _form: ['Failed to create invoice. Please try again.'],
      },
    }
  }
})

export const markInvoicePaidOffline = withAuth('billing:process_payments', async (
  session,
  invoiceId: string,
  paymentData: {
    method: PaymentMethod
    amount: number
    paidAt: Date
    reference?: string
    notes?: string
  }
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get invoice for validation
    const invoice = await billingRepo.findInvoiceById(invoiceId, session.organizationId)
    if (!invoice) {
      return { error: 'Invoice not found' }
    }

    // Create payment record
    const payment = await billingRepo.createPayment(session.organizationId, {
      invoiceId,
      method: paymentData.method,
      amount: paymentData.amount,
      currency: invoice.currency,
      paidAt: paymentData.paidAt,
      reference: paymentData.reference || null,
      notes: paymentData.notes || null,
    })

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'payment',
      entityId: payment.id,
      action: 'create',
      payload: {
        invoiceNumber: invoice.number,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
      },
    })

    // Revalidate cache
    revalidateTag('invoices')
    revalidateTag('payments')
    revalidateTag('billing')
    
    return { success: true }
  } catch (error) {
    console.error('Payment recording error:', error)
    return { error: 'Failed to record payment. Please try again.' }
  }
})

export const updateInvoiceStatus = withAuth('billing:update', async (
  session,
  invoiceId: string,
  status: InvoiceStatus
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Update invoice status
    const invoice = await billingRepo.updateInvoiceStatus(
      invoiceId,
      session.organizationId,
      status
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'update',
      payload: {
        number: invoice.number,
        status,
      },
    })

    // Revalidate cache
    revalidateTag('invoices')
    revalidateTag('billing')
    
    return { success: true }
  } catch (error) {
    console.error('Invoice status update error:', error)
    return { error: 'Failed to update invoice status. Please try again.' }
  }
})

export const createStripeCheckout = withAuth('billing:process_payments', async (
  session,
  invoiceId: string
): Promise<{ success?: boolean; error?: string; url?: string }> => {
  try {
    // Get invoice
    const invoice = await billingRepo.findInvoiceById(invoiceId, session.organizationId)
    if (!invoice) {
      return { error: 'Invoice not found' }
    }

    // Import Stripe functions
    const { createCheckoutSession } = await import('@/lib/stripe')

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount: Number(invoice.total),
      currency: invoice.currency,
      customerEmail: invoice.contact?.email || undefined,
      customerName: invoice.contact?.name || undefined,
      successUrl: `${process.env.NEXTAUTH_URL}/billing/invoices/${invoice.id}?payment=success`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/billing/invoices/${invoice.id}?payment=cancelled`,
    })

    // Update invoice with Stripe payment intent ID
    await billingRepo.updateInvoiceStatus(invoiceId, session.organizationId, 'open')

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'update',
      payload: {
        number: invoice.number,
        action: 'stripe_checkout_created',
        checkoutSessionId: checkoutSession.id,
      },
    })

    return {
      success: true,
      url: checkoutSession.url || undefined
    }
  } catch (error) {
    console.error('Stripe checkout creation error:', error)
    return { error: 'Failed to create payment link. Please try again.' }
  }
})

export const recordPayment = withAuth('billing:process_payments', async (
  session,
  prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> => {
  try {
    const validatedFields = PaymentCreateSchema.safeParse({
      invoiceId: formData.get('invoiceId'),
      method: formData.get('method'),
      amount: formData.get('amount'),
      currency: formData.get('currency') || 'MAD',
      paidAt: formData.get('paidAt'),
      reference: formData.get('reference') || null,
      notes: formData.get('notes') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the payment
    const payment = await billingRepo.createPayment(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'payment',
      entityId: payment.id,
      action: 'create',
      payload: {
        invoiceNumber: payment.invoice.number,
        amount: validatedFields.data.amount,
        method: validatedFields.data.method,
      },
    })

    // Revalidate cache
    revalidateTag('payments')
    revalidateTag('invoices')
    revalidateTag('billing')
    
    return { success: true }
  } catch (error) {
    console.error('Payment recording error:', error)
    return {
      errors: {
        _form: ['Failed to record payment. Please try again.'],
      },
    }
  }
})
