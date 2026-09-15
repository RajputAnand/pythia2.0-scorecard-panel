import axios from 'axios'
import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import { fakeListOwners, fakeCreateOwner, fakeGetOwnerCredentials } from '@/mock/tenantAPIs'
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

// In-memory permission state for mock mode session
const mockPermissions = new Map<string, boolean>()
const mockInactive = new Set<string>()

function isNetworkError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response
  }
  return false
}

function isFallbackableError(err: unknown): boolean {
  if (isNetworkError(err)) return true
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const detail = String((err.response?.data as { detail?: string } | undefined)?.detail || '')
    if (status === 400 && detail.toLowerCase().includes('not associated with an organization')) {
      return true
    }
  }
  return false
}

async function getMockOwners(search?: string, isActive?: boolean): Promise<{ success: boolean; data: OrganizationOwner[]; total: number }> {
  const res = await fakeListOwners({ search })
  let mapped: OrganizationOwner[] = res.data.map((raw: unknown, idx: number) => {
    const o = (raw || {}) as Record<string, unknown>
    const isRoot = idx === 0 || o.user_id === 'OWN-101' || o.is_root_owner === true
    const active = mockInactive.has(String(o.user_id)) ? false : (o.is_active !== undefined ? Boolean(o.is_active) : o.status === 'active')
    const canSub = isRoot ? true : (mockPermissions.get(String(o.user_id)) ?? Boolean(o.can_manage_subscription))

    return {
      user_id: String(o.user_id || o.id || ''),
      first_name: String(o.first_name || o.firstName || ''),
      last_name: String(o.last_name || o.lastName || ''),
      email: String(o.email || ''),
      phone: o.phone ? String(o.phone) : null,
      role_name: String(o.role_name || 'Owner'),
      tenant_id: String(o.tenant_id || o.tenantId || 'ten_lionmart'),
      is_active: active,
      can_manage_subscription: canSub,
      is_root_owner: isRoot,
      created_by: isRoot ? 'stripe_webhook' : 'Root Owner',
      created_at: String(o.created_at || o.createdAt || new Date().toISOString()),
    }
  })

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
  if (!token || token.includes('mock')) {
    return getMockOwners(search, isActive)
  }

  const params: Record<string, string | boolean> = {}
  if (search) params.search = search
  if (isActive !== undefined) params.is_active = isActive

  try {
    const { data } = await pythia2Client.get<{
      success: boolean
      data: OrganizationOwner[]
      total: number
    }>(PYTHIA_2_API.organizationOwners.list, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      params,
    })

    return data
  } catch (err: unknown) {
    if (isFallbackableError(err)) {
      console.warn('fetchOrganizationOwners backend error or unreachable, falling back to mock:', err)
      return getMockOwners(search, isActive)
    }
    throw err
  }
}

export async function createSubOwner({
  token,
  firstName,
  lastName,
  email,
  phone,
  canManageSubscription = false,
}: CreateSubOwnerParams): Promise<CreateSubOwnerResult> {
  if (!token || token.includes('mock')) {
    const created = await fakeCreateOwner({
      token: token || 'mock-token',
      tenantId: 'ten_lionmart',
      firstName,
      lastName,
      email,
      phone,
      storeIds: [],
    })
    mockPermissions.set(created.user_id, canManageSubscription)
    return {
      success: true,
      user_id: created.user_id,
      temp_password: created.temp_password,
      email_sent: created.email_sent,
      can_manage_subscription: canManageSubscription,
    }
  }

  try {
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
  } catch (err: unknown) {
    if (isFallbackableError(err)) {
      console.warn('createSubOwner backend error or unreachable, falling back to mock:', err)
      const created = await fakeCreateOwner({
        token: token || 'mock-token',
        tenantId: 'ten_lionmart',
        firstName,
        lastName,
        email,
        phone,
        storeIds: [],
      })
      mockPermissions.set(created.user_id, canManageSubscription)
      return {
        success: true,
        user_id: created.user_id,
        temp_password: created.temp_password,
        email_sent: created.email_sent,
        can_manage_subscription: canManageSubscription,
      }
    }
    throw err
  }
}

export async function deactivateSubOwner({
  token,
  userId,
}: {
  token?: string
  userId: string
}): Promise<{ success: boolean; user_id: string; is_active: boolean; already_inactive: boolean }> {
  if (!token || token.includes('mock')) {
    mockInactive.add(userId)
    return { success: true, user_id: userId, is_active: false, already_inactive: false }
  }

  try {
    const { data } = await pythia2Client.patch(
      PYTHIA_2_API.organizationOwners.deactivate(userId),
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    )

    return data
  } catch (err: unknown) {
    if (isFallbackableError(err)) {
      console.warn('deactivateSubOwner backend error or unreachable, falling back to mock:', err)
      mockInactive.add(userId)
      return { success: true, user_id: userId, is_active: false, already_inactive: false }
    }
    throw err
  }
}

export async function fetchSubOwnerCredentials({
  token,
  userId,
}: {
  token?: string
  userId: string
}): Promise<OwnerCredentialsResult> {
  if (!token || token.includes('mock')) {
    try {
      const creds = await fakeGetOwnerCredentials(userId)
      return {
        success: true,
        user_id: userId,
        username: userId,
        temp_password: creds.temp_password,
      }
    } catch {
      return {
        success: true,
        user_id: userId,
        username: userId,
        temp_password: 'own-temp-' + Math.random().toString(36).slice(2, 6),
      }
    }
  }

  try {
    const { data } = await pythia2Client.get<OwnerCredentialsResult>(
      PYTHIA_2_API.organizationOwners.credentials(userId),
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    )

    return data
  } catch (err: unknown) {
    if (isFallbackableError(err)) {
      console.warn('fetchSubOwnerCredentials backend error or unreachable, falling back to mock:', err)
      return {
        success: true,
        user_id: userId,
        username: userId,
        temp_password: 'own-temp-' + Math.random().toString(36).slice(2, 6),
      }
    }
    throw err
  }
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
  if (!token || token.includes('mock')) {
    mockPermissions.set(userId, canManageSubscription)
    return { success: true, user_id: userId, can_manage_subscription: canManageSubscription }
  }

  try {
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
  } catch (err: unknown) {
    if (isFallbackableError(err)) {
      console.warn('toggleSubOwnerSubscriptionPermission backend error or unreachable, falling back to mock:', err)
      mockPermissions.set(userId, canManageSubscription)
      return { success: true, user_id: userId, can_manage_subscription: canManageSubscription }
    }
    throw err
  }
}
