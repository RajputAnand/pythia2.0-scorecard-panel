import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { Organization, OrganizationsResponse } from '@/types/organization'

export interface FetchOrganizationsParams {
  token?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
}

const FALLBACK_ORGANIZATIONS: Organization[] = [
  {
    _id: 'org_lionmart',
    tenant_id: 'tenant_lionmart',
    name: 'Lionmart Retail Group',
    status: 'active',
    owner_user_id: 'user.7301',
    created_at: new Date().toISOString(),
  },
]

export async function fetchOrganizations({
  token,
  search,
  status,
  skip = 0,
  limit = 50,
}: FetchOrganizationsParams): Promise<OrganizationsResponse> {
  if (!token) {
    let list = [...FALLBACK_ORGANIZATIONS]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((o) => o.name.toLowerCase().includes(q))
    }
    if (status) {
      list = list.filter((o) => o.status === status)
    }
    return {
      organizations: list,
      total: list.length,
    }
  }

  try {
    const { data } = await pythia2Client.get<OrganizationsResponse>(
      PYTHIA_2_API.superAdmin.organizations,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || undefined,
          status: status || undefined,
          skip,
          limit,
        },
      }
    )
    return data
  } catch (error) {
    console.warn('Failed to fetch organizations from API, returning empty list:', error)
    return { organizations: [], total: 0 }
  }
}

export async function fetchOrganizationDetail({
  token,
  tenantId,
}: {
  token?: string
  tenantId: string
}): Promise<Organization | null> {
  if (!token) {
    return FALLBACK_ORGANIZATIONS.find((o) => o.tenant_id === tenantId) || null
  }

  try {
    const { data } = await pythia2Client.get<Organization>(
      PYTHIA_2_API.superAdmin.organizationDetail(tenantId),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return data
  } catch (error) {
    console.warn(`Failed to fetch organization ${tenantId}:`, error)
    return null
  }
}

