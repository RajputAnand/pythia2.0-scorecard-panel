import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import StoreListPanel from '@/components/StoreListPanel/StoreListPanel'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { TenantStore } from '@/types/tenant'

export const metadata = {
  title: 'Pythia 2.0 — Stores (Owner Mirror)',
  description: 'Read-only mirror of owner store management for Super Admin.',
}

export default async function SuperAdminOwnerStoresMirrorPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<TenantStore[]> | null = null
  if (token) {
    const [result] = await Promise.allSettled([
      fetchStoresForTenant({ token, skip: 0, limit: 15 }),
    ])
    if (result.status === 'rejected') unstable_rethrow(result.reason)
    if (result.status === 'fulfilled') initialData = result.value
  }

  return (
    <>
      <Header title="Store Management (Mirror)" subtitle="Owner View" />
      <div className="px-[30px] py-[26px]">
        <StoreListPanel initialData={initialData} readOnly={false} />
      </div>
    </>
  )
}

