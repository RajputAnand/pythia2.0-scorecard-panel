import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import OwnerListPanel from '@/components/OwnerListPanel/OwnerListPanel'
import { auth } from '@/auth'
import { fetchOwners } from '@/queries/owners'
import { fetchTenants } from '@/queries/tenants'
import { fetchStoresForTenant } from '@/queries/stores'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { TenantOwner } from '@/types/owner'
import type { Tenant, TenantStore } from '@/types/tenant'

export const metadata = {
  title: 'Pythia 2.0 — Owners',
  description: 'Manage customer tenant owners and provision temporary credentials.',
}

export default async function SuperAdminOwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const session = await auth()
  const token = session?.user?.pythia2Token

  const { tenant: tenantParam } = await searchParams

  let initialOwners: ApiResponseV2Paginated<TenantOwner[]> | null = null
  let tenants: Tenant[] = []
  let stores: TenantStore[] = []

  if (token) {
    const results = await Promise.allSettled([
      fetchOwners({ token, tenantId: tenantParam, skip: 0, limit: 15 }),
      fetchTenants({ token, limit: 100 }),
      fetchStoresForTenant({ token, limit: 100 }),
    ])

    for (const res of results) {
      if (res.status === 'rejected') unstable_rethrow(res.reason)
    }

    if (results[0].status === 'fulfilled') initialOwners = results[0].value
    if (results[1].status === 'fulfilled' && results[1].value.data) tenants = results[1].value.data
    if (results[2].status === 'fulfilled' && results[2].value.data) stores = results[2].value.data
  }

  return (
    <>
      <Header title="Owner Management" subtitle="Super Admin Tools" />
      <div className="px-[30px] py-[26px]">
        <OwnerListPanel
          initialData={initialOwners}
          tenants={tenants}
          stores={stores}
          preselectedTenantId={tenantParam}
        />
      </div>
    </>
  )
}

