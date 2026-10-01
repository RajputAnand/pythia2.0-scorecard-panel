import { Suspense } from 'react'
import OwnerDashboardContent from '@/components/OwnerDashboardContent/OwnerDashboardContent'
import { auth } from '@/auth'
import { fetchStoresForTenant } from '@/queries/stores'

export const metadata = {
  title: 'Pythia — Dashboard',
  description: 'Owner Dashboard with network leaderboard, store comparisons, and rank movement.',
}

export default async function OwnerDashboardPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token || session?.user?.token
  const tenantId = session?.user?.tenantId

  let hasStores: boolean | null = null
  if (token) {
    try {
      const storesRes = await fetchStoresForTenant({ token, tenantId, limit: 1 })
      hasStores = (storesRes.data?.length ?? 0) > 0
    } catch {
      hasStores = null
    }
  }

  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <OwnerDashboardContent initialHasStores={hasStores} />
    </Suspense>
  )
}
