import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import ManagerListPanel from '@/components/ManagerListPanel/ManagerListPanel'
import { fetchManagers } from '@/queries/managers'
import { fetchStoresForTenant } from '@/queries/stores'
import { auth } from '@/auth'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiManager } from '@/types/manager'
import type { TenantStore } from '@/types/tenant'

export const metadata = {
  title: 'Pythia — Managers',
  description: 'Manage your store managers and share temporary credentials.',
}

export default async function OwnerManagersPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let initialData: ApiResponseV2Paginated<ApiManager[]> | null = null
  let initialStores: TenantStore[] = []
  if (token) {
    const [managersResult, storesResult] = await Promise.allSettled([
      fetchManagers({ token, skip: 0, limit: 15 }),
      fetchStoresForTenant({ token, limit: 100 }),
    ])
    if (managersResult.status === 'rejected') unstable_rethrow(managersResult.reason)
    if (managersResult.status === 'fulfilled') initialData = managersResult.value
    if (storesResult.status === 'fulfilled' && storesResult.value.data) initialStores = storesResult.value.data
  }

  return (
    <>
      <Header title="Managers" subtitle="Manage your managers and credentials" />

      <div className="px-[30px] py-[26px]">
        <ManagerListPanel initialData={initialData} initialStores={initialStores} />
      </div>
    </>
  )
}
