import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import TenantListPanel from '@/components/TenantListPanel/TenantListPanel'
import { auth } from '@/auth'
import { fetchTenants } from '@/queries/tenants'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { Tenant } from '@/types/tenant'

export const metadata = {
  title: 'Pythia 2.0 — Tenants',
  description: 'Manage all customer tenants, subscriptions, and onboarding statuses.',
}

export default async function SuperAdminTenantsPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<Tenant[]> | null = null
  if (token) {
    const [result] = await Promise.allSettled([
      fetchTenants({ token, skip: 0, limit: 15 }),
    ])
    if (result.status === 'rejected') unstable_rethrow(result.reason)
    if (result.status === 'fulfilled') initialData = result.value
  }

  return (
    <>
      <Header title="Tenants & Companies" subtitle="Super Admin Tools" />
      <div className="px-[30px] py-[26px]">
        <TenantListPanel initialData={initialData} />
      </div>
    </>
  )
}

