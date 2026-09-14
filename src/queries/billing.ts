import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import { extractApiErrorMessage } from '@/utils/common'

export interface ManageSubscriptionUrlResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Requests a fresh, one-time Stripe Billing Portal URL from the Python backend
 * for the authenticated Organization Owner.
 */
export async function fetchManageSubscriptionUrl(
  token?: string,
  returnUrl?: string
): Promise<ManageSubscriptionUrlResult> {
  if (!token) {
    return {
      success: false,
      error: 'Authentication token is missing. Please log in again.',
    }
  }

  try {
    const { data } = await pythia2Client.get<{ success?: boolean; url: string }>(
      PYTHIA_2_API.billing.manageSubscriptionUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: returnUrl ? { return_url: returnUrl } : undefined,
      }
    )

    if (data?.url) {
      return {
        success: true,
        url: data.url,
      }
    }

    return {
      success: false,
      error: 'No portal URL returned by the billing service.',
    }
  } catch (err: unknown) {
    const message = extractApiErrorMessage(err, 'Failed to open Stripe Customer Portal.')
    return {
      success: false,
      error: message,
    }
  }
}

