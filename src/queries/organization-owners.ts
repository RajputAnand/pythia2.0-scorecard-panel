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

export async function fetchOrganizationOwners({
  token,
  search,
  isActive,
}: FetchOrganizationOwnersParams): Promise<{ success: boolean; data: OrganizationOwner[]; total: number }> {
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

