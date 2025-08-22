import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

// Type definition for Stripe (to avoid import errors when Stripe is not installed)
type Stripe = any

export async function POST(req: Request) {
  // Return early if Stripe is not configured to avoid build errors
  return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 501 })
}

// Stripe webhook functionality disabled to avoid build dependencies
// To enable Stripe webhooks:
// 1. Install stripe: pnpm add stripe
// 2. Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
// 3. Implement the webhook handlers here
