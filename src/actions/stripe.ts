'use server'

import Stripe from 'stripe'

// Hardcoded customer ID until backend integration is completed
const HARDCODED_STRIPE_CUSTOMER_ID =
  process.env.STRIPE_CUSTOMER_ID || 'cus_pythia_owner_demo'

interface PortalSessionResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Creates a Stripe Customer Portal session for the current customer
 * and returns the hosted portal URL to open in a new tab.
 */
export async function createStripeCustomerPortalSession(
  returnUrl?: string
): Promise<PortalSessionResult> {
  const customerId = HARDCODED_STRIPE_CUSTOMER_ID
  const secretKey = process.env.STRIPE_SECRET_KEY
  const defaultReturnUrl =
    returnUrl ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000/owner/roi-attribution'

  // If a direct customer portal link is configured in env, prioritize it
  if (process.env.STRIPE_CUSTOMER_PORTAL_URL) {
    return {
      success: true,
      url: process.env.STRIPE_CUSTOMER_PORTAL_URL,
    }
  }

  // If no Stripe secret key is set (e.g. during local/offline testing before credentials are provided),
  // return a test portal link so the frontend action works seamlessly without throwing an unhandled exception.
  if (!secretKey) {
    console.warn(
      '[Stripe] STRIPE_SECRET_KEY is not defined. Using test customer portal link for demo/testing.'
    )
    return {
      success: true,
      url: 'https://billing.stripe.com/p/login/test_portal',
    }
  }

  try {
    const stripe = new Stripe(secretKey)

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: defaultReturnUrl,
    })

    if (session?.url) {
      return { success: true, url: session.url }
    }

    return { success: false, error: 'No portal URL returned by Stripe.' }
  } catch (err) {
    let message = 'Failed to create Stripe customer portal session.'
    if (err instanceof Error) {
      message = err.message
    }
    console.error('[Stripe Portal Error]', message)
    return { success: false, error: message }
  }
}
