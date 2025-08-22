import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export interface CreateCheckoutSessionParams {
  invoiceId: string
  invoiceNumber: string
  amount: number
  currency: string
  customerEmail?: string
  customerName?: string
  successUrl: string
  cancelUrl: string
}

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  invoiceId: string
  customerEmail?: string
  description?: string
}

/**
 * Create a Stripe Checkout Session for invoice payment
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: `Invoice ${params.invoiceNumber}`,
            description: `Payment for invoice ${params.invoiceNumber}`,
          },
          unit_amount: Math.round(params.amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      invoiceId: params.invoiceId,
      invoiceNumber: params.invoiceNumber,
    },
    payment_intent_data: {
      metadata: {
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
      },
    },
  })

  return session
}

/**
 * Create a Payment Intent for direct payment processing
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: params.currency.toLowerCase(),
    metadata: {
      invoiceId: params.invoiceId,
    },
    description: params.description || `Payment for invoice`,
    receipt_email: params.customerEmail,
  })

  return paymentIntent
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer(
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer
}

/**
 * Create a payment link for an invoice
 */
export async function createPaymentLink(params: {
  invoiceId: string
  invoiceNumber: string
  amount: number
  currency: string
  description?: string
}): Promise<Stripe.PaymentLink> {
  const product = await stripe.products.create({
    name: `Invoice ${params.invoiceNumber}`,
    description: params.description || `Payment for invoice ${params.invoiceNumber}`,
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(params.amount * 100), // Convert to cents
    currency: params.currency.toLowerCase(),
  })

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId: params.invoiceId,
      invoiceNumber: params.invoiceNumber,
    },
    payment_intent_data: {
      metadata: {
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
      },
    },
  })

  return paymentLink
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId)
}

/**
 * Create a refund
 */
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount ? Math.round(params.amount * 100) : undefined,
    reason: params.reason,
  })
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Format amount for display (convert from cents)
 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

/**
 * Get publishable key for client-side
 */
export function getPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  return key
}
