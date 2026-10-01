import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  OrganizationOwner,
  CreateSubOwnerParams,
  CreateSubOwnerResult,
  OwnerCredentialsResult,
} from '@/types/organization-owner'

export interface FetchOrganizationOwnersParams {
  token?: string
  search?: string
  isActive?: boolean
}

// In-memory permission state for offline/test session
const mockPermissions = new Map<string, boolean>()
const mockInactive = new Set<string>()

const FALLBACK_OWNERS: OrganizationOwner[] = [
  {
    user_id: 'OWN-101',
    first_name: 'Arthur',
    last_name: 'Pendelton',
    email: 'arthur@demo.com',
    phone: '+1 555-0199',
    role_name: 'Owner',
    tenant_id: 'default',
    is_active: true,
    can_manage_subscription: true,
    is_root_owner: true,
    created_by: 'stripe_webhook',
    created_at: new Date().toISOString(),
  },
]

function getMockOwners(search?: string, isActive?: boolean): { success: boolean; data: OrganizationOwner[]; total: number } {
  let mapped = FALLBACK_OWNERS.map((o) => {
    const active = mockInactive.has(o.user_id) ? false : o.is_active
    const canSub = o.is_root_owner ? true : (mockPermissions.get(o.user_id) ?? o.can_manage_subscription)
    return {
      ...o,
      is_active: active,
      can_manage_subscription: canSub,
    }
  })

  if (search) {
    const q = search.toLowerCase()
    mapped = mapped.filter(
      (o) =>
        o.first_name.toLowerCase().includes(q) ||
        o.last_name.toLowerCase().includes(q) ||
        (o.email ? o.email.toLowerCase().includes(q) : false)
    )
  }

  if (isActive !== undefined) {
    mapped = mapped.filter((o) => o.is_active === isActive)
  }

  return {
    success: true,
    data: mapped,
    total: mapped.length,
  }
}

export async function fetchOrganizationOwners({
  token,
  search,
  isActive,
}: FetchOrganizationOwnersParams): Promise<{ success: boolean; data: OrganizationOwner[]; total: number }> {
  if (!token || token.includes('demo-mock')) {
    return getMockOwners(search, isActive)
  }

  const params: Record<string, string | boolean> = {}
  if (search) params.search = search
  if (isActive !== undefined) params.is_active = isActive

  const { data } = await pythia2Client.get<{
    success: boolean
    data: OrganizationOwner[]
    total: number
  }>(PYTHIA_2_API.organizationOwners.list, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    params,
  })

  return data
}

export async function createSubOwner({
  token,
  firstName,
  lastName,
  email,
  phone,
  canManageSubscription = false,
}: CreateSubOwnerParams): Promise<CreateSubOwnerResult> {
  if (!token || token.includes('demo-mock')) {
    const createdId = 'OWN-' + Math.floor(100 + Math.random() * 900)
    mockPermissions.set(createdId, canManageSubscription)
    return {
      success: true,
      user_id: createdId,
      temp_password: 'own-temp-' + Math.random().toString(36).slice(2, 6),
      email_sent: true,
      can_manage_subscription: canManageSubscription,
    }
  }

  const { data } = await pythia2Client.post<CreateSubOwnerResult>(
    PYTHIA_2_API.organizationOwners.create,
    {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      can_manage_subscription: canManageSubscription,
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )

  return data
}

export async function deactivateSubOwner({
  token,
  userId,
}: {
  token?: string
  userId: string
}): Promise<{ success: boolean; user_id: string; is_active: boolean; already_inactive: boolean }> {
  if (!token || token.includes('demo-mock')) {
    mockInactive.add(userId)
    return { success: true, user_id: userId, is_active: false, already_inactive: false }
  }

  const { data } = await pythia2Client.patch(
    PYTHIA_2_API.organizationOwners.deactivate(userId),
    {},
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )

  return data
}

export async function fetchSubOwnerCredentials({
  token,
  userId,
}: {
  token?: string
  userId: string
}): Promise<OwnerCredentialsResult> {
  if (!token || token.includes('demo-mock')) {
    return {
      success: true,
      user_id: userId,
      username: userId,
      temp_password: 'own-temp-' + Math.random().toString(36).slice(2, 6),
    }
  }

  const { data } = await pythia2Client.get<OwnerCredentialsResult>(
    PYTHIA_2_API.organizationOwners.credentials(userId),
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )

  return data
}

export async function toggleSubOwnerSubscriptionPermission({
  token,
  userId,
  canManageSubscription,
}: {
  token?: string
  userId: string
  canManageSubscription: boolean
}): Promise<{ success: boolean; user_id: string; can_manage_subscription: boolean }> {
  if (!token || token.includes('demo-mock')) {
    mockPermissions.set(userId, canManageSubscription)
    return { success: true, user_id: userId, can_manage_subscription: canManageSubscription }
  }

  const { data } = await pythia2Client.patch(
    PYTHIA_2_API.organizationOwners.subscriptionPermission(userId),
    {
      can_manage_subscription: canManageSubscription,
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )

  return data
}
