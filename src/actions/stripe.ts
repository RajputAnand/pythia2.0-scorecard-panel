'use server'

import { auth } from '@/auth'
import { fetchManageSubscriptionUrl, type ManageSubscriptionUrlResult } from '@/queries/billing'

export type PortalSessionResult = ManageSubscriptionUrlResult

/**
 * Creates a Stripe Customer Portal session for the current authenticated Owner
 * via the Python backend billing endpoint (/billing/manage-subscription-url).
 */
export async function createStripeCustomerPortalSession(
  returnUrl?: string,
  token?: string
): Promise<PortalSessionResult> {
  let authToken = token

  if (!authToken) {
    const session = await auth()
    authToken = session?.user?.pythia2Token || session?.user?.token
  }

  if (!authToken) {
    return {
      success: false,
      error: 'Authentication token not found. Please log in again.',
    }
  }

  return fetchManageSubscriptionUrl(authToken, returnUrl)
}
