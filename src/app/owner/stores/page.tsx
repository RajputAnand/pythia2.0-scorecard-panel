import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import StoreListPanel from '@/components/StoreListPanel/StoreListPanel'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { TenantStore } from '@/types/tenant'

export const metadata = {
  title: 'Pythia 2.0 — Store Management',
  description: 'Manage store locations, edge device pairing, and sensor status.',
}

export default async function OwnerStoresPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token
  const tenantId = session?.user?.tenantId || 'ten_lionmart'

  let initialData: ApiResponseV2Paginated<TenantStore[]> | null = null
  if (token) {
    const [result] = await Promise.allSettled([
      fetchStoresForTenant({ token, tenantId, skip: 0, limit: 15 }),
    ])
    if (result.status === 'rejected') unstable_rethrow(result.reason)
    if (result.status === 'fulfilled') initialData = result.value
  }

  return (
    <>
      <Header title="Store Management" subtitle="Owner Tools" />
      <div className="px-[30px] py-[26px]">
        <StoreListPanel initialData={initialData} tenantId={tenantId} />
      </div>
    </>
  )
}

